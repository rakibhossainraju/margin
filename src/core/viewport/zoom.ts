export const MIN_SCALE = 0.5;
export const MAX_SCALE = 3.0;
export const STEP = 0.25;
export const DEFAULT_SCALE = 1.0;

/**
 * Returns the next zoomed-in scale, or `null` if already at the max (no-op).
 */
export function zoomIn(scale: number): number | null {
  if (scale >= MAX_SCALE) return null;
  return parseFloat((scale + STEP).toFixed(2));
}

/**
 * Returns the next zoomed-out scale, or `null` if already at the min (no-op).
 */
export function zoomOut(scale: number): number | null {
  if (scale <= MIN_SCALE) return null;
  return parseFloat((scale - STEP).toFixed(2));
}

/**
 * Returns the default scale, or `null` if already at the default (no-op).
 */
export function zoomReset(scale: number): number | null {
  if (scale === DEFAULT_SCALE) return null;
  return DEFAULT_SCALE;
}
