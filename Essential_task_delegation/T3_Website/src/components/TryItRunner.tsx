// Try it: the field model on the visitor's own image, inside their browser. The page prepares the
// picture (says what it did to it), a worker runs the model and measures the result, and the same
// building map as Explore shows it.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PairEntry } from '../types/disaster.ts';
import { pairUrl } from '../core/gallery.ts';
import { FIELD_MODEL } from '../core/modelConfig.ts';
import type { RunMessage, RunRequest } from '../core/segment.worker.ts';
import { prettyEvent, useGalleryIndex } from '../core/useGallery.ts';
import { Num, Provenance } from './ResultsTables.tsx';
import { Workspace, type OwnImage } from './Workspace.tsx';

type Role = (typeof FIELD_MODEL.images)[number];
const SIZE = FIELD_MODEL.size;
const MB = (bytes: number) => (bytes / 1e6).toFixed(1);
const ROLE_LABEL: Record<Role, string> = { before: 'The photo from before the disaster', after: 'The photo from after the disaster' };

interface Prepared {
  name: string;
  rgba: Uint8ClampedArray;
  /** The picture the model reads, as a PNG on this device. */
  url: string;
  /** What was done to the visitor's picture to make it the model's size. */
  note: string;
  /** Set when the picture is a gallery photo, not the visitor's own: the result is labelled so. */
  gallery?: PairEntry;
}

type Run =
  | { status: 'idle' }
  | { status: 'busy'; stage: 'download' | 'loading' | 'running' | 'measuring'; loaded: number }
  | { status: 'error'; reason: 'no-model' | 'failed' | 'unreadable'; detail?: string }
  | { status: 'done'; result: OwnImage; maskUrl: string; modelSeconds: number; afterSeconds: number; loadSeconds: number; threads: number };

const toBlobUrl = (canvas: HTMLCanvasElement) =>
  new Promise<string>((resolve) => canvas.toBlob((b) => resolve(URL.createObjectURL(b!)), 'image/png'));

/** Cuts the middle square out of a picture and resizes it to the model's size. */
async function prepare(source: Blob, name: string): Promise<Prepared> {
  const bmp = await createImageBitmap(source, { colorSpaceConversion: 'none' });
  const { width: w, height: h } = bmp;
  const side = Math.min(w, h);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, Math.floor((w - side) / 2), Math.floor((h - side) / 2), side, side, 0, 0, SIZE, SIZE);
  bmp.close();
  const px = (a: number, b: number) => `${a.toLocaleString('en')} × ${b.toLocaleString('en')} px`;
  const note = w === SIZE && h === SIZE
    ? `It is ${px(w, h)}, the size the model reads, so nothing was changed.`
    : w === h
      ? `It is ${px(w, h)}. The model reads ${px(SIZE, SIZE)}, so the picture was ${w > SIZE ? 'shrunk' : 'enlarged'} to that size.`
      : `It is ${px(w, h)}. The model reads a ${px(SIZE, SIZE)} square, so the middle ${px(side, side)} square was cut out and ${side > SIZE ? 'shrunk' : side < SIZE ? 'enlarged' : 'used'} ${side === SIZE ? 'as it is' : 'to that size'}. The rest of the picture was not read.`;
  return { name, rgba: ctx.getImageData(0, 0, SIZE, SIZE).data, url: await toBlobUrl(canvas), note };
}

/** One value per pixel as a grey PNG on this device (the value in every colour channel). */
function greyPng(values: Uint8Array, side: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = side;
  const image = new ImageData(side, side);
  for (let i = 0; i < values.length; i++) { image.data.set([values[i], values[i], values[i], 255], i * 4); }
  canvas.getContext('2d')!.putImageData(image, 0, 0);
  return toBlobUrl(canvas);
}

const STAGE_TEXT = {
  loading: 'Starting the model.',
  running: 'The model is reading the picture. This takes a few seconds, longer on a phone.',
  measuring: 'Finding each building and drawing the heatmap.',
};

export function TryItRunner() {
  const index = useGalleryIndex();
  const [pictures, setPictures] = useState<Partial<Record<Role, Prepared>>>({});
  const [run, setRun] = useState<Run>({ status: 'idle' });
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);

  const ready = FIELD_MODEL.images.every((role) => pictures[role]);
  const busy = run.status === 'busy';
  // The moving background is hidden while the model runs (site.css): drawing it takes processor
  // time the model needs. In our test a run took about 2 s longer with it.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-model-running', busy);
    return () => document.documentElement.removeAttribute('data-model-running');
  }, [busy]);

  const choose = async (role: Role, source: Blob, name: string, gallery?: PairEntry) => {
    try {
      const next = { ...(await prepare(source, name)), gallery };
      setPictures((p) => { if (p[role]) URL.revokeObjectURL(p[role].url); return { ...p, [role]: next }; });
      setRun({ status: 'idle' });
    } catch {
      setRun({ status: 'error', reason: 'unreadable' });
    }
  };
  const chooseSample = async (pair: PairEntry) => {
    for (const role of FIELD_MODEL.images) {
      const r = await fetch(pairUrl(pair.id, `${role}.webp`));
      if (r.ok) await choose(role, await r.blob(), `${pair.info.image} (the gallery's ${role} photo)`, pair);
    }
  };

  const start = () => {
    const after = pictures.after;
    if (!ready || !after) return;
    worker.current ??= new Worker(new URL('../core/segment.worker.ts', import.meta.url), { type: 'module' });
    worker.current.onerror = (e) => setRun({ status: 'error', reason: 'failed', detail: e.message });
    worker.current.onmessage = async ({ data: m }: MessageEvent<RunMessage>) => {
      if (m.type === 'download') setRun({ status: 'busy', stage: 'download', loaded: m.loaded });
      else if (m.type === 'stage') setRun({ status: 'busy', stage: m.stage, loaded: FIELD_MODEL.bytes });
      else if (m.type === 'error') setRun({ status: 'error', reason: m.reason, detail: m.detail });
      else {
        // A gallery photo keeps its own event and origin on every label; only a picture the
        // visitor brought is called theirs.
        const from = after.gallery?.info;
        const pair: PairEntry = {
          id: 'your-image', has_before: false, has_after: true,
          info: {
            event: from ? `${from.event} (gallery photo)` : 'your image', source: from?.source ?? 'other',
            split: from ? `a gallery photo from DisasterM3, ${from.split}; this map was made on this device just now` : 'your own image, read on this device, not from our dataset',
            image: after.name, width: SIZE, height: SIZE,
          },
          methods: [{
            id: 'field-model', has_report_inputs: false,
            source: {
              model: 'A U-Net that reads only the after photo, stored as 8-bit numbers, run in this browser',
              tta: false, checkpoint: FIELD_MODEL.file.split('/').pop()!, notebook: FIELD_MODEL.notebook,
              date: new Intl.DateTimeFormat('en-CA').format(new Date()),
            },
          }],
        };
        const [heat, maskUrl] = await Promise.all([greyPng(m.heat, 256), greyPng(m.mask, SIZE)]);
        setRun((old) => {
          if (old.status === 'done') { URL.revokeObjectURL(old.maskUrl); URL.revokeObjectURL(old.result.urls.heat); }
          return {
            status: 'done', maskUrl, modelSeconds: m.modelSeconds, afterSeconds: m.afterSeconds, loadSeconds: m.loadSeconds, threads: m.threads,
            result: { pair, buildings: m.buildings, hotspots: m.hotspots, urls: { after: after.url, heat } },
          };
        });
      }
    };
    setRun({ status: 'busy', stage: 'download', loaded: 0 });
    const request: RunRequest = { pictures: FIELD_MODEL.images.map((role) => pictures[role]!.rgba), name: after.name };
    worker.current.postMessage(request);
  };

  const samples = index?.pairs.filter((p) => p.has_after && (p.has_before || !FIELD_MODEL.images.includes('before'))) ?? [];

  return (
    <>
      <div className="a-panel try-about">
        <h2>What runs here</h2>
        <p>
          The field model: a lighter U-Net (a network that labels every pixel) that reads only the photo taken after the disaster. Its numbers are stored in 8 bits each,
          which makes it a <Num id="field_model_size" /> file that a laptop or a phone can run without a graphics card.
        </p>
        <p>
          It is not our best map. Averaged over all classes, the model that compares a before photo with an after photo scores <Num id="pair_unet_miou_clean" /> where
          this one at full precision scores <Num id="field_unet_miou_clean" />, on the same 605 validation pairs; <Link to="/results">Results</Link> has the whole table.
          The exact file that runs here scores <Num id="field_model_int8_destroyed_iou" /> on destroyed buildings and <Num id="field_model_int8_miou" /> averaged over all classes.
          These are IoU: the overlap between the pixels the model marks and the true ones, from 0 (none) to 1 (exact).{' '}
          <Provenance id="field_model_int8_miou" />
        </p>
        <p>
          It learned from satellite photos taken from straight above. On a phone photo, a picture taken at an angle or a very different zoom, expect a poor map.
        </p>
        <p className="decision">Your image never leaves your device. The model is downloaded once, then it runs inside this browser tab; nothing is uploaded.</p>
      </div>

      <div className="a-panel try-pick">
        <h2>Choose {FIELD_MODEL.images.length > 1 ? 'the photos' : 'a photo'}</h2>
        {FIELD_MODEL.images.map((role) => (
          <div key={role} className="try-file">
            <label>
              <span>{ROLE_LABEL[role]}</span>
              <input type="file" accept="image/*" disabled={busy} data-role={role}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) choose(role, f, f.name); }} />
            </label>
            {pictures[role] && (
              <p className="try-note"><img src={pictures[role].url} alt="" width={72} height={72} /><span><b>{pictures[role].name}</b> {pictures[role].note}</span></p>
            )}
          </div>
        ))}
        {samples.length > 0 && (
          <div className="ws-group" role="group" aria-label="Photos from the gallery">
            <span className="try-or">or use a gallery photo:</span>
            {samples.map((p) => (
              <button key={p.id} type="button" className="ws-chip" disabled={busy} onClick={() => chooseSample(p)}>{prettyEvent(p.info.event)}</button>
            ))}
          </div>
        )}
        <div className="a-actions">
          <button type="button" className="a-btn" disabled={!ready || busy} onClick={start}>
            {run.status === 'done' ? 'Run the model again' : `Run the model (a ${MB(FIELD_MODEL.bytes)} MB download the first time)`}
          </button>
        </div>

        <div className="try-status" role="status" aria-live="polite">
          {run.status === 'busy' && run.stage === 'download' && (
            <label>
              <span>Downloading the model: {MB(run.loaded)} of {MB(FIELD_MODEL.bytes)} MB</span>
              <progress max={FIELD_MODEL.bytes} value={run.loaded} />
            </label>
          )}
          {run.status === 'busy' && run.stage !== 'download' && <p>{STAGE_TEXT[run.stage]}</p>}
          {run.status === 'error' && run.reason === 'unreadable' && <p className="ws-missing">This file could not be read as a picture. Try a PNG or a JPEG.</p>}
          {run.status === 'error' && run.reason === 'no-model' && (
            <p className="ws-missing">The model file is not part of this copy of the site, so nothing can be run here. Nothing was sent anywhere. The gallery on the Explore page shows the same kind of map.</p>
          )}
          {run.status === 'error' && run.reason === 'failed' && (
            <p className="ws-missing">The model could not run in this browser{run.detail ? ` (${run.detail.slice(0, 200)})` : ''}. It needs a browser with WebAssembly and about 1 GB of free memory. Nothing was sent anywhere.</p>
          )}
          {run.status === 'done' && (
            <p data-model-seconds={run.modelSeconds.toFixed(2)} data-threads={run.threads}>
              Done. The model read the picture in <b className="num">{run.modelSeconds.toFixed(1)} s</b> on {run.threads} {run.threads === 1 ? 'thread' : 'threads'}
              {run.loadSeconds > 0 && <>, after {run.loadSeconds.toFixed(1)} s to download and start it</>}; finding the buildings and the heatmap took {run.afterSeconds.toFixed(1)} s.
              Positions, areas and distances below are in pixels of the {SIZE} × {SIZE} picture the model read.
            </p>
          )}
        </div>
      </div>

      {run.status === 'done' && (
        <>
          <Workspace palette="dark" own={run.result} />
          <p className="try-mask">
            <a className="a-btn a-btn-quiet" href={run.maskUrl} download={`mask_${run.result.pair.info.image.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '_')}.png`} data-mask>
              Download the raw mask (PNG)
            </a>
            <span className="ws-note">One value per pixel: 0 background, 1 intact, 2 damaged, 3 destroyed. In a picture viewer it looks black; it is meant for other software.</span>
          </p>
        </>
      )}
    </>
  );
}
