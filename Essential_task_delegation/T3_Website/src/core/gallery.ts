// Reads the gallery (DATA_CONTRACT.md) and paints one-channel PNGs in the browser,
// so the damage colours come from one place (core/palette.ts).
import type { Accuracy, Building, GalleryIndex, HotSpots } from '../types/disaster.ts';

async function getJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json() as Promise<T>;
}

export const pairUrl = (pairId: string, file: string) => `/data/${pairId}/${file}`;
export const methodUrl = (pairId: string, methodId: string, file: string) => `/data/${pairId}/methods/${methodId}/${file}`;

/** The index the validator writes. A gallery with no pairs yet is a normal state, not an error. */
export async function loadIndex(): Promise<GalleryIndex> {
  try { return await getJson<GalleryIndex>('/data/index.json'); } catch { return { fixture: false, pairs: [] }; }
}

export interface MethodData {
  buildings: Building[];
  hotspots: HotSpots;
  accuracy: Accuracy;
}

export async function loadMethod(pairId: string, methodId: string): Promise<MethodData> {
  const [buildings, hotspots, accuracy] = await Promise.all([
    getJson<Building[]>(methodUrl(pairId, methodId, 'buildings.json')),
    getJson<HotSpots>(methodUrl(pairId, methodId, 'hotspots.json')),
    getJson<Accuracy>(methodUrl(pairId, methodId, 'accuracy.json')),
  ]);
  return { buildings, hotspots, accuracy };
}

/**
 * Paints a one-channel PNG into a data URL. `paint` maps each pixel's value (0-255) to RGBA.
 * Used for the ground-truth mask (class ids) and the heatmaps (value x 255).
 */
export async function paintPng(url: string, paint: (value: number) => [number, number, number, number]): Promise<string> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const lut = Array.from({ length: 256 }, (_, v) => paint(v));
  for (let i = 0; i < data.data.length; i += 4) {
    const c = lut[data.data[i]];
    data.data[i] = c[0]; data.data[i + 1] = c[1]; data.data[i + 2] = c[2]; data.data[i + 3] = c[3];
  }
  ctx.putImageData(data, 0, 0);
  return canvas.toDataURL();
}
