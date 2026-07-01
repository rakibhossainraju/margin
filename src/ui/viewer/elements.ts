export interface ViewerElements {
  docTitleEl: HTMLElement;
  pageStatusEl: HTMLElement;
  viewerMountEl: HTMLElement;
  viewerContainerEl: HTMLElement;
  errorOverlayEl: HTMLElement;
  errorRetryBtn: HTMLElement;
  zoomInBtn: HTMLElement;
  zoomOutBtn: HTMLElement;
  zoomResetBtn: HTMLElement;
  zoomValueEl: HTMLElement;
}

export function getViewerElements(): ViewerElements {
  return {
    docTitleEl: document.getElementById('doc-title')!,
    pageStatusEl: document.getElementById('page-status')!,
    viewerMountEl: document.getElementById('pdf-viewer-mount')!,
    viewerContainerEl: document.getElementById('viewer-container')!,
    errorOverlayEl: document.getElementById('error-overlay')!,
    errorRetryBtn: document.getElementById('error-retry-btn')!,
    zoomInBtn: document.getElementById('zoom-in-btn')!,
    zoomOutBtn: document.getElementById('zoom-out-btn')!,
    zoomResetBtn: document.getElementById('zoom-reset-btn')!,
    zoomValueEl: document.getElementById('zoom-value')!,
  };
}
