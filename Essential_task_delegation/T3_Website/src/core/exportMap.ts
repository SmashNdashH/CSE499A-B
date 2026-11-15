// Saves the damage map of one pair as a PNG, made in the visitor's browser: nothing is uploaded.
// The photo and the outlines are drawn straight onto a canvas, and a band underneath carries the
// labels the page shows around the map, because a saved picture travels without the page:
// where the image is from, which model drew the map, the decision-support line and, for
// development data, the fixture mark.
import type { Building, ClassId, PairEntry } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';
import { pairUrl } from './gallery.ts';
import { DAMAGE_COLOURS } from './palette.ts';

const BAND = 120;
const DECISION = "A model's estimate, to be checked by people on the ground.";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function outlinePath(b: Building): Path2D {
  const p = new Path2D();
  for (const ring of b.outline) {
    ring.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
    p.closePath();
  }
  return p;
}

export async function exportMapPng(opts: {
  pair: PairEntry;
  buildings: Building[];
  classes: Record<ClassId, boolean>;
  methodLabel: string;
  fixture: boolean;
}): Promise<void> {
  const { pair, buildings, classes, methodLabel, fixture } = opts;
  const { width: w, height: h } = pair.info;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h + BAND;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1a1e27';
  ctx.fillRect(0, 0, w, h);
  const photo = pair.has_after ? await loadImage(pairUrl(pair.id, 'after.webp')) : null;
  if (photo) ctx.drawImage(photo, 0, 0, w, h);

  const colours = DAMAGE_COLOURS.dark;
  for (const b of buildings) {
    if (!classes[b.class_id]) continue;
    const path = outlinePath(b);
    const c = colours[b.class_id];
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = c;
    ctx.fill(path, 'evenodd');
    if (b.class_id === 3) {
      // The same hatching as on the page, so destroyed never depends on colour alone.
      ctx.save();
      ctx.clip(path, 'evenodd');
      ctx.globalAlpha = 0.75;
      ctx.strokeStyle = c;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = -h; k < w; k += 14) { ctx.moveTo(k, h); ctx.lineTo(k + h, 0); }
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = c;
    ctx.stroke(path);
  }

  // The label band.
  ctx.fillStyle = '#0b0d12';
  ctx.fillRect(0, h, w, BAND);
  ctx.fillStyle = '#eef1f5';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText(DECISION, 18, h + 34);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#a7b0be';
  const shown = ([1, 2, 3] as ClassId[]).filter((c) => classes[c]).map((c) => `${CLASS_NAMES[c]} ${buildings.filter((b) => b.class_id === c).length}`).join(', ');
  ctx.fillText(`Damage map: output of the ${methodLabel.toLowerCase()}. Buildings found: ${shown || 'none shown'}.`, 18, h + 64);
  ctx.fillText(`${pair.info.image} (DisasterM3, ${pair.info.source}, ${pair.info.split})${photo ? '' : '. No photo was available on this device'}.`, 18, h + 90);
  if (fixture) {
    ctx.fillStyle = '#ffc233';
    ctx.font = '600 17px system-ui, sans-serif';
    ctx.fillText('Development fixture, not the published gallery.', 18, h + 112);
  }

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/png'));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `damage-map_${pair.id}.png`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
