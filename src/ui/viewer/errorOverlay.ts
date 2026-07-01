/**
 * Show error guidance modal
 */
export function showErrorOverlay(errorOverlayEl: HTMLElement): void {
  errorOverlayEl.classList.remove('hidden');
}

/**
 * Hide error guidance modal
 */
export function hideErrorOverlay(errorOverlayEl: HTMLElement): void {
  errorOverlayEl.classList.add('hidden');
}
