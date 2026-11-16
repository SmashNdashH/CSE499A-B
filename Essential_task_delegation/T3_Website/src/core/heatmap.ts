// The survivability heatmap, ported from the heatmap notebook's version 3
// (Champion_Task/t1-survivability-heatmap-v3.ipynb, Cell 2), so the browser computes the same
// maps, hot spots and safe areas from a damage mask. scripts/check-heatmap.ts compares this
// port with the notebook's saved outputs.
import type { HotSpot, SafeArea } from '../types/disaster.ts';

export const HEATMAP = {
  sigmaPx: 25,            // danger-map blur
  damagedWeight: 0.5,     // destroyed pixels weigh 1.0
  safeScalePx: 200,       // this far from any damage counts as fully safe
  hotThreshold: 0.05,     // search priority above this forms a hot zone
  minSpotPx: 500,         // smaller zones are specks, not hot spots
  pointEdgeMarginPx: 32,  // a hot spot's point stays this far from the image edge when its zone allows
  safeMinGapPx: 150,      // the safest areas are at least this far apart
  safeEdgeMarginPx: 100,  // safe areas stay this far from the image edge
};

export interface SurvivabilityMaps {
  danger: Float32Array;
  safety: Float32Array;
  priority: Float32Array;
  /** Distance in px to the nearest damaged or destroyed pixel; Infinity everywhere when there is none. */
  dist: Float32Array;
}

/** Gaussian blur along both axes, as scipy.ndimage.gaussian_filter(mode="mirror", truncate=4.0). */
function gaussianMirror(src: Float32Array, w: number, h: number, sigma: number): Float32Array {
  const radius = Math.floor(4 * sigma + 0.5);
  const kernel = new Float64Array(2 * radius + 1);
  let sum = 0;
  for (let i = -radius; i <= radius; i++) { kernel[i + radius] = Math.exp(-0.5 * (i / sigma) ** 2); sum += kernel[i + radius]; }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum;
  // "mirror": d c b | a b c d | c b a (the edge sample is not repeated)
  const mirror = (i: number, n: number) => {
    if (n === 1) return 0;
    const period = 2 * (n - 1);
    let m = ((i % period) + period) % period;
    if (m >= n) m = period - m;
    return m;
  };
  const pass = (input: Float32Array, n: number, lines: number, at: (line: number, i: number) => number): Float32Array => {
    const out = new Float32Array(input.length);
    const padded = new Float64Array(n + 2 * radius);
    for (let line = 0; line < lines; line++) {
      for (let i = -radius; i < n + radius; i++) padded[i + radius] = input[at(line, mirror(i, n))];
      for (let i = 0; i < n; i++) {
        let acc = 0;
        for (let k = 0; k < kernel.length; k++) acc += kernel[k] * padded[i + k];
        out[at(line, i)] = acc;
      }
    }
    return out;
  };
  // scipy filters axis 0 (rows index: down the columns) first, then axis 1.
  const down = pass(src, h, w, (x, y) => y * w + x);
  return pass(down, w, h, (y, x) => y * w + x);
}

/** Exact Euclidean distance to the nearest `true` pixel (Felzenszwalb and Huttenlocher's transform). */
function distanceToNearest(target: Uint8Array, w: number, h: number): Float32Array {
  const INF = 1e20;
  const n = Math.max(w, h);
  const f = new Float64Array(n), d = new Float64Array(n), z = new Float64Array(n + 1);
  const v = new Int32Array(n);
  const sq = new Float64Array(w * h);
  for (let i = 0; i < sq.length; i++) sq[i] = target[i] ? 0 : INF;
  const transform = (len: number) => {
    let k = 0;
    v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < len; q++) {
      let s: number;
      for (;;) {
        const p = v[k];
        s = (f[q] + q * q - (f[p] + p * p)) / (2 * q - 2 * p);
        if (s <= z[k] && k > 0) k--; else break;
      }
      k++;
      v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < len; q++) {
      while (z[k + 1] < q) k++;
      const p = v[k];
      d[q] = (q - p) * (q - p) + f[p];
    }
  };
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = sq[y * w + x];
    transform(h);
    for (let y = 0; y < h; y++) sq[y * w + x] = d[y];
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = sq[y * w + x];
    transform(w);
    for (let x = 0; x < w; x++) out[y * w + x] = Math.sqrt(d[x]);
  }
  return out;
}

/** Danger, safety and search priority (each 0 to 1) for a mask of class ids 0 to 3. */
export function survivabilityMaps(mask: Uint8Array, w: number, h: number): SurvivabilityMaps {
  const n = w * h;
  const weight = new Float32Array(n);
  const damage = new Uint8Array(n);
  let any = false;
  for (let i = 0; i < n; i++) {
    if (mask[i] === 3) weight[i] = 1;
    else if (mask[i] === 2) weight[i] = HEATMAP.damagedWeight;
    if (mask[i] >= 2) { damage[i] = 1; any = true; }
  }
  const danger = gaussianMirror(weight, w, h, HEATMAP.sigmaPx);
  const dist = any ? distanceToNearest(damage, w, h) : new Float32Array(n).fill(Infinity);
  const safety = new Float32Array(n);
  const priority = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    safety[i] = Math.min(dist[i] / HEATMAP.safeScalePx, 1);
    priority[i] = danger[i] * (1 - safety[i]);
  }
  return { danger, safety, priority, dist };
}

/** Where a point sits in the image (top = north). */
export function compass(x: number, y: number, w: number, h: number): string {
  const row = ['north', '', 'south'][Math.min(Math.floor((3 * y) / h), 2)];
  const col = ['west', '', 'east'][Math.min(Math.floor((3 * x) / w), 2)];
  return [row, col].filter(Boolean).join('-') || 'centre';
}

/**
 * The k strongest zones (8-connected, priority at or above the threshold, at least the minimum
 * size), ranked by total priority. Each is marked at its strongest point that is at least the edge
 * margin inside the image (anywhere in the zone if none of it is that far in); among ties, the
 * point nearest the zone's middle.
 */
export function hotSpots(priority: Float32Array, w: number, h: number, k = 3): HotSpot[] {
  const labels = new Int32Array(w * h);
  const zones: { area: number; mass: number; pixels: number[] }[] = [];
  const stack: number[] = [];
  for (let start = 0; start < priority.length; start++) {
    if (labels[start] || priority[start] < HEATMAP.hotThreshold) continue;
    const zone = { area: 0, mass: 0, pixels: [] as number[] };
    zones.push(zone);
    labels[start] = zones.length;
    stack.push(start);
    while (stack.length) {
      const p = stack.pop()!;
      zone.area++; zone.mass += priority[p]; zone.pixels.push(p);
      const x = p % w, y = (p - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const q = ny * w + nx;
          if (!labels[q] && priority[q] >= HEATMAP.hotThreshold) { labels[q] = zones.length; stack.push(q); }
        }
      }
    }
  }
  const m = HEATMAP.pointEdgeMarginPx;
  return zones.filter((z) => z.area >= HEATMAP.minSpotPx).sort((a, b) => b.mass - a.mass).slice(0, k).map((zone, i) => {
    zone.pixels.sort((a, b) => a - b); // row by row, as the notebook reads them
    let peak = -Infinity;
    for (const p of zone.pixels) if (priority[p] > peak) peak = priority[p];
    const inner = zone.pixels.filter((p) => { const x = p % w, y = (p - x) / w; return y >= m && y < h - m && x >= m && x < w - m; });
    const pts = inner.length ? inner : zone.pixels;
    let max = -Infinity, sx = 0, sy = 0;
    for (const p of pts) { if (priority[p] > max) max = priority[p]; sx += p % w; sy += Math.floor(p / w); }
    const mx = sx / pts.length, my = sy / pts.length;
    const floor = Math.fround(max - 1e-6);
    let best = -1, bestD = Infinity;
    for (const p of pts) {
      if (priority[p] < floor) continue;
      const x = p % w, y = (p - x) / w;
      const d = (y - my) ** 2 + (x - mx) ** 2;
      if (d < bestD) { bestD = d; best = p; }
    }
    const x = best % w, y = (best - x) / w;
    return {
      rank: i + 1, point_xy: [x, y] as [number, number], area_px: zone.area, peak: Math.round(peak * 1000) / 1000,
      edge_px: Math.min(x, y, w - 1 - x, h - 1 - y), where: compass(x, y, w, h),
    };
  });
}

/**
 * The k open (background) points farthest from any damage, at least the minimum gap apart and at
 * least the edge margin inside the image, because damage just outside the picture is invisible.
 * Empty when the mask has no damage at all: then the whole image counts as safe.
 */
export function safeAreas(dist: Float32Array, mask: Uint8Array, w: number, h: number, k = 3): SafeArea[] {
  if (dist.every((v) => v === Infinity)) return [];
  const m = HEATMAP.safeEdgeMarginPx;
  const score = new Float64Array(w * h).fill(-1);
  for (let y = m; y < h - m; y++) for (let x = m; x < w - m; x++) if (mask[y * w + x] === 0) score[y * w + x] = dist[y * w + x];
  const areas: SafeArea[] = [];
  const gap2 = HEATMAP.safeMinGapPx ** 2;
  for (let rank = 1; rank <= k; rank++) {
    let best = 0;
    for (let i = 1; i < score.length; i++) if (score[i] > score[best]) best = i;
    if (score[best] < 0) break;
    const x = best % w, y = (best - x) / w;
    areas.push({ rank, xy: [x, y], distance_px: Math.trunc(score[best]), edge_px: Math.min(x, y, w - 1 - x, h - 1 - y), where: compass(x, y, w, h) });
    const r = HEATMAP.safeMinGapPx;
    for (let yy = Math.max(0, y - r); yy <= Math.min(h - 1, y + r); yy++) {
      for (let xx = Math.max(0, x - r); xx <= Math.min(w - 1, x + r); xx++) {
        if ((yy - y) ** 2 + (xx - x) ** 2 < gap2) score[yy * w + xx] = -1;
      }
    }
  }
  return areas;
}

/** A 256 x 256 copy by area average, value x 255: the form the heatmap files are saved in. */
export function toSavedMap(map: Float32Array, w: number, h: number, size = 256): Uint8Array {
  const out = new Uint8Array(size * size);
  const bx = w / size, by = h / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const x0 = Math.floor(x * bx), x1 = Math.max(x0 + 1, Math.floor((x + 1) * bx));
      const y0 = Math.floor(y * by), y1 = Math.max(y0 + 1, Math.floor((y + 1) * by));
      let sum = 0;
      for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) sum += Math.min(1, Math.max(0, map[yy * w + xx]));
      out[y * size + x] = Math.round((sum / ((x1 - x0) * (y1 - y0))) * 255);
    }
  }
  return out;
}
