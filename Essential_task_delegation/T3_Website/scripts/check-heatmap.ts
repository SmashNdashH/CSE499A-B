// Parity check for the heatmap port (src/core/heatmap.ts) against the heatmap notebook's own
// saved outputs (version 3), computed from the same inputs: the after-image-only U-Net's masks.
//
//   node scripts/check-heatmap.ts          23 images: the notebook's 20 checked ones, plus every 160th of the rest
//   node scripts/check-heatmap.ts --all    all 645 validation images (a few minutes)
//
// Pass rule, fixed before the first run:
//   - every pixel of the three saved maps (256 x 256, 8-bit) within 1 grey level of the notebook's;
//   - every hot spot and safe area identical: rank, position, area, peak, distance and compass.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { hotSpots, safeAreas, survivabilityMaps, toSavedMap } from '../src/core/heatmap.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAMP = path.resolve(SITE, '..', 'Champion_Task');
const MASKS = path.join(CHAMP, 'E1-results/E1/preds/R9_tta');
const T1 = path.join(CHAMP, 'T1-results/T1-v3');
const TOLERANCE_LEVELS = 1;

type Row = Record<string, unknown>;
const saved: { image: string; hot_spots: Row[]; safe_areas: Row[] }[] = JSON.parse(fs.readFileSync(path.join(T1, 'hotspots.json'), 'utf8'));
const checked = fs.readdirSync(path.join(T1, 'overlays')).map((f) => f.replace('.jpg', '.png'));
const all = saved.map((s) => s.image);
const names = process.argv.includes('--all') ? all : [...new Set([...checked, ...all.filter((_, i) => i % 160 === 7)])];

const grey = async (file: string) => new Uint8Array(await sharp(file).extractChannel(0).raw().toBuffer());
const pick = (o: object, keys: string[]) => JSON.stringify(keys.map((k) => (o as Row)[k]));
let worst = 0, differing = 0, pixels = 0, spots = 0, areas = 0;
const problems: string[] = [];

for (const name of names) {
  const { data, info } = await sharp(path.join(MASKS, name)).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(data);
  const { width: w, height: h } = info;
  const maps = survivabilityMaps(mask, w, h);
  for (const [kind, map] of [['kde', maps.danger], ['safe', maps.safety], ['priority', maps.priority]] as const) {
    const ours = toSavedMap(map, w, h);
    const theirs = await grey(path.join(T1, 'maps', name.replace('.png', `_${kind}.png`)));
    for (let i = 0; i < ours.length; i++) {
      const d = Math.abs(ours[i] - theirs[i]);
      if (d) differing++;
      if (d > worst) worst = d;
      if (d > TOLERANCE_LEVELS && problems.length < 10) problems.push(`${name} ${kind}: pixel ${i} differs by ${d} levels`);
    }
    pixels += ours.length;
  }
  const ref = saved.find((s) => s.image === name)!;
  const hs = hotSpots(maps.priority, w, h);
  const sa = safeAreas(maps.dist, mask, w, h);
  const hsKeys = ['rank', 'point_xy', 'area_px', 'peak', 'edge_px', 'where'];
  const saKeys = ['rank', 'xy', 'distance_px', 'edge_px', 'where'];
  if (hs.length !== ref.hot_spots.length || hs.some((s, i) => pick(s, hsKeys) !== pick(ref.hot_spots[i], hsKeys))) {
    problems.push(`${name}: hot spots differ\n      ours   ${hs.map((s) => pick(s, hsKeys)).join(' ')}\n      theirs ${ref.hot_spots.map((s) => pick(s, hsKeys)).join(' ')}`);
  }
  if (sa.length !== ref.safe_areas.length || sa.some((s, i) => pick(s, saKeys) !== pick(ref.safe_areas[i], saKeys))) {
    problems.push(`${name}: safe areas differ\n      ours   ${sa.map((s) => pick(s, saKeys)).join(' ')}\n      theirs ${ref.safe_areas.map((s) => pick(s, saKeys)).join(' ')}`);
  }
  spots += ref.hot_spots.length;
  areas += ref.safe_areas.length;
}

console.log(`${names.length} images: ${pixels.toLocaleString('en')} map pixels compared; ${differing} differ (${((differing / pixels) * 100).toFixed(4)}%), the largest difference ${worst} grey level(s) of 255; ${spots} hot spots and ${areas} safe areas compared`);
if (problems.length) { console.error(`${problems.length} problem(s):\n` + problems.map((p) => '  - ' + p).join('\n')); process.exit(1); }
console.log(`heatmap port matches the notebook's version 3 outputs: every map pixel within ${TOLERANCE_LEVELS} level, every hot spot and safe area identical`);
