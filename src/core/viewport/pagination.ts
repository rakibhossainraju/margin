const DEFAULT_THRESHOLD = 120;

/**
 * Determines the 1-indexed page considered "visible", given each page container's
 * top offset relative to the scroll container's top edge.
 */
export function computeVisiblePage(
  pageTopOffsets: number[],
  threshold = DEFAULT_THRESHOLD
): number {
  let visiblePage = 1;
  for (let i = 0; i < pageTopOffsets.length; i++) {
    // If the top of the page is near or above the viewport top
    if (pageTopOffsets[i] <= threshold) {
      visiblePage = i + 1;
    }
  }
  return visiblePage;
}
