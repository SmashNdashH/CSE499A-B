// Runs the field model off the main thread: downloads it on the first run (with progress), then
// model -> mask -> building table -> heatmap, all on this device. Nothing is sent anywhere.
import * as ort from 'onnxruntime-web/wasm';
import type { Building, HotSpots } from '../types/disaster.ts';
import { buildingsFromMask } from './buildings.ts';
import { hotSpots, safeAreas, survivabilityMaps, toSavedMap } from './heatmap.ts';
import { FIELD_MODEL, RUNTIME_PATH, toInput, toMask } from './modelConfig.ts';

export interface RunRequest {
  /** One size x size RGBA picture per entry of FIELD_MODEL.images. */
  pictures: Uint8ClampedArray[];
  name: string;
}
export type RunMessage =
  | { type: 'download'; loaded: number; total: number }
  | { type: 'stage'; stage: 'loading' | 'running' | 'measuring' }
  | { type: 'error'; reason: 'no-model' | 'failed'; detail: string }
  | {
      type: 'done';
      mask: Uint8Array;
      buildings: Building[];
      hotspots: HotSpots;
      /** Search priority, 256 x 256, value x 255: the same form as the gallery's heatmap files. */
      heat: Uint8Array;
      /** Seconds: the model alone, and the building table plus the heatmap. */
      modelSeconds: number;
      afterSeconds: number;
      /** 0 when the model was already in memory. */
      loadSeconds: number;
      threads: number;
    };

const post = (m: RunMessage, transfer: Transferable[] = []) => self.postMessage(m, { transfer });
let session: Promise<ort.InferenceSession> | null = null;

async function download(): Promise<Uint8Array> {
  const r = await fetch(FIELD_MODEL.file);
  // A site without the model file answers with a page, not with the model.
  if (!r.ok || !r.body || (r.headers.get('content-type') ?? '').includes('text/html')) throw new Error('no-model');
  const bytes = new Uint8Array(FIELD_MODEL.bytes);
  const reader = r.body.getReader();
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (loaded + value.length > bytes.length) throw new Error('no-model');
    bytes.set(value, loaded);
    loaded += value.length;
    post({ type: 'download', loaded, total: bytes.length });
  }
  if (loaded !== bytes.length) throw new Error('no-model');
  return bytes;
}

async function load(): Promise<ort.InferenceSession> {
  ort.env.wasm.wasmPaths = RUNTIME_PATH;
  // Several threads need a cross-origin isolated page (the two headers in vercel.json).
  ort.env.wasm.numThreads = self.crossOriginIsolated ? navigator.hardwareConcurrency : 1;
  const bytes = await download();
  post({ type: 'stage', stage: 'loading' });
  return ort.InferenceSession.create(bytes, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' });
}

self.onmessage = async (e: MessageEvent<RunRequest>) => {
  try {
    const { size } = FIELD_MODEL;
    const n = size * size;
    let t = performance.now();
    const fresh = !session;
    session ??= load();
    const s = await session;
    const loadSeconds = fresh ? (performance.now() - t) / 1000 : 0;

    post({ type: 'stage', stage: 'running' });
    t = performance.now();
    const input = new ort.Tensor('float32', toInput(e.data.pictures), [1, FIELD_MODEL.images.length * 3, size, size]);
    const out = (await s.run({ [FIELD_MODEL.inputName]: input }))[FIELD_MODEL.outputName];
    const mask = toMask(out.data as Float32Array, n);
    const modelSeconds = (performance.now() - t) / 1000;

    post({ type: 'stage', stage: 'measuring' });
    t = performance.now();
    const buildings = buildingsFromMask(mask, size, size, e.data.name);
    const maps = survivabilityMaps(mask, size, size);
    const hotspots: HotSpots = { hot_spots: hotSpots(maps.priority, size, size), safe_areas: safeAreas(maps.dist, mask, size, size) };
    const heat = toSavedMap(maps.priority, size, size);
    post({
      type: 'done', mask, buildings, hotspots, heat, modelSeconds, loadSeconds,
      afterSeconds: (performance.now() - t) / 1000, threads: ort.env.wasm.numThreads ?? 1,
    }, [mask.buffer, heat.buffer]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    if (detail === 'no-model') session = null; // let the next try fetch again
    post({ type: 'error', reason: detail === 'no-model' ? 'no-model' : 'failed', detail });
  }
};
