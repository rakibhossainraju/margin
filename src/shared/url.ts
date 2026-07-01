/**
 * Gets the filename from a URL.
 */
export function getFilename(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    const pathname = decodeURIComponent(url.pathname);
    return pathname.substring(pathname.lastIndexOf('/') + 1) || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}
