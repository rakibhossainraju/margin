import * as pdfjsLib from 'pdfjs-dist';
import { configurePdfWorker, loadDocument } from '@adapters/pdf/loader';
import { renderPage } from '@adapters/pdf/renderer';
import { getSelectedText } from '@adapters/html/selection';
import { getFilename } from '@shared/url';
import { sendMessage } from '@infrastructure/messaging';
import { getViewerElements } from '@ui/viewer/elements';
import { showErrorOverlay, hideErrorOverlay } from '@ui/viewer/errorOverlay';
import { zoomIn, zoomOut, zoomReset, DEFAULT_SCALE } from '@core/viewport/zoom';
import { computeVisiblePage } from '@core/viewport/pagination';

// Load styles
import 'pdfjs-dist/web/pdf_viewer.css';
import './viewer.css';

configurePdfWorker();

// Expose API for background bridge commands
window.marginAPI = { getSelectedText };

let currentPdf: pdfjsLib.PDFDocumentProxy | null = null;
let currentScale = DEFAULT_SCALE;
let renderQueue: Array<{ pageNumber: number; cancel: () => void }> = [];

const els = getViewerElements();

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
 * Renders all pages of the given PDF sequentially into the mount element.
 * Owns the render-cancellation queue: wires the adapter's per-page cancel
 * handle into `renderQueue` as each page starts rendering.
 */
async function renderAllPages(pdf: pdfjsLib.PDFDocumentProxy, scale: number) {
  clearRenderQueue();
  els.viewerMountEl.innerHTML = '';

  // Render pages sequentially to avoid blocking the main thread
  for (let i = 1; i <= pdf.numPages; i++) {
    await renderPage(pdf, i, scale, els.viewerMountEl, (cancel) => {
      renderQueue.push({ pageNumber: i, cancel });
    });
  }
}

/**
 * Loads the PDF document from the given URL
 */
async function loadPdf(fileUrl: string) {
  try {
    els.docTitleEl.textContent = getFilename(fileUrl);

    currentPdf = await loadDocument(fileUrl);
    els.pageStatusEl.textContent = `1 / ${currentPdf.numPages} pages`;

    // Render initially
    await renderAllPages(currentPdf, currentScale);

    // Announce activation to background
    try {
      await sendMessage('PDF_ACTIVATED', {
        url: fileUrl,
        timestamp: Date.now(),
      });
    } catch (msgErr) {
      console.warn('PDF_ACTIVATED announcement failed:', msgErr);
    }
  } catch (err) {
    console.error('Failed to load PDF document:', err);
    const error = err as Error;
    if (fileUrl.startsWith('file://')) {
      showErrorOverlay(els.errorOverlayEl);
    } else {
      els.docTitleEl.textContent = 'Error loading document';
      els.viewerMountEl.innerHTML = `<div class="error-card"><h2>Error Loading PDF</h2><p>${error.message || String(err)}</p></div>`;
    }
  }
}

/**
 * Re-renders the currently loaded PDF at the current scale, if any.
 */
function rerenderAtCurrentScale() {
  els.zoomValueEl.textContent = `${Math.round(currentScale * 100)}%`;
  if (currentPdf) {
    renderAllPages(currentPdf, currentScale);
  }
}

// Zoom controls
els.zoomInBtn.addEventListener('click', () => {
  const next = zoomIn(currentScale);
  if (next === null) return;
  currentScale = next;
  rerenderAtCurrentScale();
});

els.zoomOutBtn.addEventListener('click', () => {
  const next = zoomOut(currentScale);
  if (next === null) return;
  currentScale = next;
  rerenderAtCurrentScale();
});

els.zoomResetBtn.addEventListener('click', () => {
  const next = zoomReset(currentScale);
  if (next === null) return;
  currentScale = next;
  rerenderAtCurrentScale();
});

// Scroll paging indicator update
els.viewerContainerEl.addEventListener('scroll', () => {
  if (!currentPdf) return;
  const containerTop = els.viewerContainerEl.getBoundingClientRect().top;
  const pageTopOffsets = Array.from(document.querySelectorAll('.page-container')).map(
    (el) => el.getBoundingClientRect().top - containerTop
  );
  const visiblePage = computeVisiblePage(pageTopOffsets);
  els.pageStatusEl.textContent = `${visiblePage} / ${currentPdf.numPages} pages`;
});

// Initial load check
const params = new URLSearchParams(window.location.search);
const fileUrl = params.get('file');

if (fileUrl) {
  // Check if file URL scheme access is allowed
  chrome.extension.isAllowedFileSchemeAccess((isAllowed) => {
    if (fileUrl.startsWith('file://') && !isAllowed) {
      showErrorOverlay(els.errorOverlayEl);
    } else {
      loadPdf(fileUrl);
    }
  });
} else {
  els.docTitleEl.textContent = 'No PDF Specified';
  els.viewerMountEl.innerHTML = '<div style="padding: 40px; text-align: center; color: #64748b;">No PDF document was specified in the URL parameter.</div>';
}

// Error retry button
els.errorRetryBtn.addEventListener('click', () => {
  hideErrorOverlay(els.errorOverlayEl);
  window.location.reload();
});
