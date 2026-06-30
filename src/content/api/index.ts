/**
 * Content API methods called from the background bridge.
 */

export function getSelectedText(): string {
  return window.getSelection()?.toString() || '';
}
