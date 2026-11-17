// The part of an image the map shows. k is the zoom (1 shows the whole image); x and y are the
// image pixel at the view's top-left corner. Everything stays in image pixels, like the rest of
// the site, so a zoomed map still reads positions from the building table's own coordinates.
export interface View { k: number; x: number; y: number }

export const FULL_VIEW: View = { k: 1, x: 0, y: 0 };
/** Beyond this the 1024 px photos are only blur. */
export const MAX_ZOOM = 6;

/** Keeps the zoom between 1 and MAX_ZOOM, and the view inside the image. */
export function clampView(v: View, w: number, h: number): View {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k));
  return { k, x: Math.min(w - w / k, Math.max(0, v.x)), y: Math.min(h - h / k, Math.max(0, v.y)) };
}

/** Zooms by `factor` and keeps the image point under (fx, fy) in place. fx and fy are shares of the frame, 0 to 1. */
export function zoomAt(v: View, factor: number, fx: number, fy: number, w: number, h: number): View {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
  return clampView({ k, x: v.x + fx * (w / v.k - w / k), y: v.y + fy * (h / v.k - h / k) }, w, h);
}

/** Moves the view by a share of what it shows now: dx = 1 is one full view to the right. */
export function panBy(v: View, dx: number, dy: number, w: number, h: number): View {
  return clampView({ k: v.k, x: v.x + (dx * w) / v.k, y: v.y + (dy * h) / v.k }, w, h);
}

/** Centres the view on an image point, at the zoom it has. */
export function centreOn(v: View, px: number, py: number, w: number, h: number): View {
  return clampView({ k: v.k, x: px - w / v.k / 2, y: py - h / v.k / 2 }, w, h);
}

/** Whether an image point is inside the view. */
export function shows(v: View, px: number, py: number, w: number, h: number): boolean {
  return px >= v.x && px <= v.x + w / v.k && py >= v.y && py <= v.y + h / v.k;
}
