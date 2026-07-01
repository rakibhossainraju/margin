import * as pdfjsLib from 'pdfjs-dist';
import { TextLayer } from 'pdfjs-dist';

/**
 * Renders a single PDF page (both canvas and text layer) into the mount element.
 *
 * `onCancelReady` is invoked synchronously as soon as a cancel handle exists
 * (right after the page's render tasks are started), so callers can register
 * it for cancellation before this function's returned promise settles.
 */
export async function renderPage(
  pdf: pdfjsLib.PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  mountEl: HTMLElement,
  onCancelReady: (cancel: () => void) => void
): Promise<void> {
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
  mountEl.appendChild(pageContainer);

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

  onCancelReady(cancel);

  try {
    await Promise.all([renderTask.promise, textRenderPromise]);
  } catch (err) {
    const error = err as Error;
    if (!isCancelled && error.name !== 'RenderingCancelledException') {
      console.error(`Page ${pageNumber} render failed:`, err);
    }
  }
}
