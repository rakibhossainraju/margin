import * as pdfjsLib from 'pdfjs-dist';

/**
 * Points pdf.js at its worker script, bundled as a web-accessible resource.
 */
export function configurePdfWorker(): void {
  pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('pdf.worker.mjs');
}

/**
 * Loads the PDF document from the given URL, wired to the bundled cmaps/standard fonts.
 */
export function loadDocument(fileUrl: string): Promise<pdfjsLib.PDFDocumentProxy> {
  const loadingTask = pdfjsLib.getDocument({
    url: fileUrl,
    cMapUrl: chrome.runtime.getURL('cmaps/'),
    cMapPacked: true,
    standardFontDataUrl: chrome.runtime.getURL('standard_fonts/'),
  });

  return loadingTask.promise;
}
