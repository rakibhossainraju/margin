/**
 * Content API methods called from the background bridge.
 */

export interface MarginAPI {
  getSelectedText: () => string;
}

declare global {
  interface Window {
    marginAPI?: MarginAPI;
  }
}

export function getSelectedText(): string {
  return window.getSelection()?.toString() || '';
}
