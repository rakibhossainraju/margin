import * as pdfjsLib from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist';
import { sendMessage } from '../shared/types';

// Load styles
import 'pdfjs-dist/web/pdf_viewer.css';
import './viewer.css';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.mjs');

// Expose API for background bridge commands
window.marginAPI = {
  getSelectedText: () => window.getSelection()?.toString() || '',
};

let currentPdf: pdfjsLib.PDFDocumentProxy | null = null;
let currentScale = 1.0;
let renderQueue: Array<{ pageNumber: number; cancel: () => void }> = [];

// DOM Elements
const docTitleEl = document.getElementById('doc-title')!;
const pageStatusEl = document.getElementById('page-status')!;
const viewerMountEl = document.getElementById('pdf-viewer-mount')!;
const viewerContainerEl = document.getElementById('viewer-container')!;
const errorOverlayEl = document.getElementById('error-overlay')!;
const errorRetryBtn = document.getElementById('error-retry-btn')!;
const zoomInBtn = document.getElementById('zoom-in-btn')!;
const zoomOutBtn = document.getElementById('zoom-out-btn')!;
const zoomResetBtn = document.getElementById('zoom-reset-btn')!;
const zoomValueEl = document.getElementById('zoom-value')!;

/**
 * Gets the filename from a URL.
 */
function getFilename(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const pathname = decodeURIComponent(url.pathname);
    return pathname.substring(pathname.lastIndexOf('/') + 1) || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}

/**
 * Show error guidance modal
 */
function showErrorOverlay() {
  errorOverlayEl.classList.remove('hidden');
}

/**
 * Hide error guidance modal
 */
function hideErrorOverlay() {
  errorOverlayEl.classList.add('hidden');
}

/**
 * Clears current rendering tasks
 */
function clearRenderQueue() {
  for (const task of renderQueue) {
    task.cancel();
  }
  renderQueue = [];
}

/**
 * Render a single PDF page (both canvas and text layer)
 */
async function renderPage(pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number, scale: number): Promise<void> {
  const page = await pdf.getPage(pageNumber);
  
  // Create elements
  const pageContainer = document.createElement('div');
  pageContainer.className = 'page-container';
  pageContainer.id = `page-${pageNumber}`;
  
  const canvas = document.createElement('canvas');
  const textLayerDiv = document.createElement('div');
  textLayerDiv.className = 'textLayer';
  
  pageContainer.appendChild(canvas);
  pageContainer.appendChild(textLayerDiv);
  viewerMountEl.appendChild(pageContainer);
  
  // Setup dimensions
  const viewport = page.getViewport({ scale });
  const outputScale = window.devicePixelRatio || 1;
  
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = Math.floor(viewport.width) + 'px';
  canvas.style.height = Math.floor(viewport.height) + 'px';
  
  pageContainer.style.width = Math.floor(viewport.width) + 'px';
  pageContainer.style.height = Math.floor(viewport.height) + 'px';

  textLayerDiv.style.width = Math.floor(viewport.width) + 'px';
  textLayerDiv.style.height = Math.floor(viewport.height) + 'px';
  textLayerDiv.style.setProperty('--scale-factor', scale.toString());
  
  const context = canvas.getContext('2d')!;
  const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;
  
  // Visual layer render
  const renderContext = {
    canvasContext: context,
    viewport,
    transform: transform || undefined,
  };
  const renderTask = page.render(renderContext);
  
  // Text layer render
  const textContentSource = page.streamTextContent();
  const textLayer = new TextLayer({
    textContentSource,
    container: textLayerDiv,
    viewport,
  });
  const textRenderPromise = textLayer.render();
  
  // Allow cancellation during zoom
  let isCancelled = false;
  const cancel = () => {
    isCancelled = true;
    renderTask.cancel();
    textLayer.cancel();
  };
  
  renderQueue.push({ pageNumber, cancel });
  
  try {
    await Promise.all([renderTask.promise, textRenderPromise]);
  } catch (err: any) {
    if (!isCancelled && err.name !== 'RenderingCancelledException') {
      console.error(`Page ${pageNumber} render failed:`, err);
    }
  }
}

/**
 * Renders all pages sequentially
 */
async function renderAllPages() {
  if (!currentPdf) return;
  
  // Clear old rendering
  clearRenderQueue();
  viewerMountEl.innerHTML = '';
  
  // Render pages sequentially to avoid blocking the main thread
  for (let i = 1; i <= currentPdf.numPages; i++) {
    await renderPage(currentPdf, i, currentScale);
  }
}

/**
 * Loads the PDF document from the given URL
 */
async function loadPdf(fileUrl: string) {
  try {
    docTitleEl.textContent = getFilename(fileUrl);
    
    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      cMapUrl: chrome.runtime.getURL('cmaps/'),
      cMapPacked: true,
      standardFontDataUrl: chrome.runtime.getURL('standard_fonts/'),
    });
    
    currentPdf = await loadingTask.promise;
    pageStatusEl.textContent = `1 / ${currentPdf.numPages} pages`;
    
    // Render initially
    await renderAllPages();
    
    // Announce activation to background
    try {
      await sendMessage('PDF_ACTIVATED', {
        url: fileUrl,
        timestamp: Date.now(),
      });
    } catch (msgErr) {
      console.warn('PDF_ACTIVATED announcement failed:', msgErr);
    }
  } catch (err: any) {
    console.error('Failed to load PDF document:', err);
    if (fileUrl.startsWith('file://')) {
      showErrorOverlay();
    } else {
      docTitleEl.textContent = 'Error loading document';
      viewerMountEl.innerHTML = `<div class="error-card"><h2>Error Loading PDF</h2><p>${err.message || err}</p></div>`;
    }
  }
}

// Zoom controls
zoomInBtn.addEventListener('click', () => {
  if (currentScale >= 3.0) return;
  currentScale = parseFloat((currentScale + 0.25).toFixed(2));
  zoomValueEl.textContent = `${Math.round(currentScale * 100)}%`;
  renderAllPages();
});

zoomOutBtn.addEventListener('click', () => {
  if (currentScale <= 0.5) return;
  currentScale = parseFloat((currentScale - 0.25).toFixed(2));
  zoomValueEl.textContent = `${Math.round(currentScale * 100)}%`;
  renderAllPages();
});

zoomResetBtn.addEventListener('click', () => {
  if (currentScale === 1.0) return;
  currentScale = 1.0;
  zoomValueEl.textContent = '100%';
  renderAllPages();
});

// Scroll paging indicator update
viewerContainerEl.addEventListener('scroll', () => {
  if (!currentPdf) return;
  const pageContainers = document.querySelectorAll('.page-container');
  let visiblePage = 1;
  const containerTop = viewerContainerEl.getBoundingClientRect().top;
  
  for (let i = 0; i < pageContainers.length; i++) {
    const rect = pageContainers[i].getBoundingClientRect();
    // If the top of the page is near or above the viewport top
    if (rect.top - containerTop <= 120) {
      visiblePage = i + 1;
    }
  }
  pageStatusEl.textContent = `${visiblePage} / ${currentPdf.numPages} pages`;
});

// Initial load check
const params = new URLSearchParams(window.location.search);
const fileUrl = params.get('file');

if (fileUrl) {
  // Check if file URL scheme access is allowed
  chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
    if (fileUrl.startsWith('file://') && !isAllowed) {
      showErrorOverlay();
    } else {
      loadPdf(fileUrl);
    }
  });
} else {
  docTitleEl.textContent = 'No PDF Specified';
  viewerMountEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">No PDF document was specified in the URL parameter.</div>';
}

// Error retry button
errorRetryBtn.addEventListener('click', () => {
  hideErrorOverlay();
  window.location.reload();
});
