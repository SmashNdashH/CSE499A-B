// Builds the building table from a class-id mask, the way the counting notebook does
// (Champion_Task/h2-sql-counting-agent.ipynb, Cell 5): 8-connected regions of one class,
// regions under 20 px dropped, centre-to-centre distances in pixels.
// Used by the fixture maker now and by the in-browser model later, so both follow one definition.
import type { Building, ClassId, Ring } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';

export const MIN_AREA_PX = 20;

const round1 = (v: number) => Math.round(v * 10) / 10;

/** Outline rings of one region, traced along pixel edges. Outer ring first (largest area). */
function traceRings(inside: (x: number, y: number) => boolean, x0: number, y0: number, w: number, h: number): Ring[] {
  // Directed boundary edges with the region on the right-hand side, keyed by their start vertex.
  const W1 = w + 2;
  const key = (x: number, y: number) => (y - y0) * W1 + (x - x0);
  const next = new Map<number, [number, number][]>();
  const add = (ax: number, ay: number, bx: number, by: number) => {
    const k = key(ax, ay);
    const list = next.get(k);
    if (list) list.push([bx, by]);
    else next.set(k, [[bx, by]]);
  };
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      if (!inside(x, y)) continue;
      if (!inside(x, y - 1)) add(x, y, x + 1, y);
      if (!inside(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!inside(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!inside(x - 1, y)) add(x, y + 1, x, y);
    }
  }
  const rings: Ring[] = [];
  for (const [startKey, list] of next) {
    while (list.length) {
      const sx = (startKey % W1) + x0;
      const sy = Math.floor(startKey / W1) + y0;
      const ring: Ring = [[sx, sy]];
      let [cx, cy] = list.pop()!;
      let dx = cx - sx;
      let dy = cy - sy;
      while (cx !== sx || cy !== sy) {
        const out = next.get(key(cx, cy))!;
        // Where two pixels touch only at a corner there are two ways on. Turning left keeps
        // both pixels in one ring, which matches 8-connected regions.
        let pick = 0;
        if (out.length > 1) {
          const i = out.findIndex(([nx, ny]) => nx - cx === dy && ny - cy === -dx);
          pick = i >= 0 ? i : 0;
        }
        const [nx, ny] = out.splice(pick, 1)[0];
        const ndx = nx - cx;
        const ndy = ny - cy;
        if (ndx !== dx || ndy !== dy) ring.push([cx, cy]); // keep corners only
        dx = ndx;
        dy = ndy;
        cx = nx;
        cy = ny;
      }
      rings.push(ring);
    }
  }
  const area = (r: Ring) => Math.abs(r.reduce((s, [x, y], i) => {
    const [nx, ny] = r[(i + 1) % r.length];
    return s + x * ny - nx * y;
  }, 0));
  return rings.sort((a, b) => area(b) - area(a));
}

/** Drops vertices closer than `tol` px to the line through their neighbours (Douglas-Peucker on a ring). */
export function simplifyRing(ring: Ring, tol: number): Ring {
  if (ring.length <= 4 || tol <= 0) return ring;
  const keep = new Uint8Array(ring.length);
  const far = ring.reduce((best, p, i) => (Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1]) > Math.hypot(ring[best][0] - ring[0][0], ring[best][1] - ring[0][1]) ? i : best), 0);
  keep[0] = keep[far] = 1;
  const stack: [number, number][] = [[0, far], [far, ring.length]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = ring[a];
    const [bx, by] = ring[b % ring.length];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    let worst = -1;
    let worstD = tol;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((bx - ax) * (ay - ring[i][1]) - (ax - ring[i][0]) * (by - ay)) / len;
      if (d > worstD) { worstD = d; worst = i; }
    }
    if (worst >= 0) { keep[worst] = 1; stack.push([a, worst], [worst, b]); }
  }
  const out = ring.filter((_, i) => keep[i]);
  return out.length >= 3 ? out : ring;
}

/**
 * One row per building for a mask of class ids (0 background, 1 intact, 2 damaged, 3 destroyed).
 * `outlineTolerancePx` simplifies the outlines; 0 keeps every corner.
 */
export function buildingsFromMask(mask: Uint8Array, width: number, height: number, image: string, outlineTolerancePx = 0.75): Building[] {
  const labels = new Int32Array(width * height);
  const out: Building[] = [];
  const stack: number[] = [];
  let label = 0;
  for (const cls of [1, 2, 3] as ClassId[]) {
    for (let start = 0; start < mask.length; start++) {
      if (mask[start] !== cls || labels[start]) continue;
      label++;
      labels[start] = label;
      stack.push(start);
      let area = 0, sx = 0, sy = 0, minX = width, minY = height, maxX = 0, maxY = 0;
      while (stack.length) {
        const p = stack.pop()!;
        const x = p % width;
        const y = (p - x) / width;
        area++; sx += x; sy += y;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            const q = ny * width + nx;
            if (mask[q] === cls && !labels[q]) { labels[q] = label; stack.push(q); }
          }
        }
      }
      if (area < MIN_AREA_PX) continue;
      const me = label;
      const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < width && y < height && labels[y * width + x] === me;
      const rings = traceRings(inside, minX, minY, maxX - minX + 1, maxY - minY + 1).map((r) => simplifyRing(r, outlineTolerancePx));
      out.push({
        image, building_id: out.length + 1, class_id: cls, class_name: CLASS_NAMES[cls], area_px: area,
        centroid_x: round1(sx / area), centroid_y: round1(sy / area),
        bbox_x: minX, bbox_y: minY, bbox_w: maxX - minX + 1, bbox_h: maxY - minY + 1,
        dist_to_nearest_destroyed_px: null, outline: rings,
      });
    }
  }
  const destroyed = out.filter((b) => b.class_id === 3);
  for (const b of out) {
    let best = Infinity;
    for (const d of destroyed) {
      if (d === b) continue;
      const dist = Math.hypot(d.centroid_x - b.centroid_x, d.centroid_y - b.centroid_y);
      if (dist < best) best = dist;
    }
    b.dist_to_nearest_destroyed_px = best === Infinity ? null : round1(best);
  }
  return out;
}

/** IoU per class of a predicted mask against the ground truth; null when a class is in neither. */
export function iouPerClass(pred: Uint8Array, truth: Uint8Array): (number | null)[] {
  const inter = [0, 0, 0, 0], np = [0, 0, 0, 0], nt = [0, 0, 0, 0];
  for (let i = 0; i < pred.length; i++) {
    np[pred[i]]++; nt[truth[i]]++;
    if (pred[i] === truth[i]) inter[pred[i]]++;
  }
  return inter.map((n, c) => {
    const union = np[c] + nt[c] - n;
    return union ? Math.round((n / union) * 1e4) / 1e4 : null;
  });
}
