// Checks a gallery folder against DATA_CONTRACT.md and writes its index.json.
//
//   node scripts/validate-data.ts public/data             the real gallery (run by `npm run build`)
//   node scripts/validate-data.ts fixtures/data --fixtures   the development fixtures
//
// Exit code 1 on any error. An empty or missing gallery is valid: the site then says it has no pairs yet.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { buildingsFromMask, iouPerClass, MIN_AREA_PX } from '../src/core/buildings.ts';

const [dirArg, ...flags] = process.argv.slice(2);
if (!dirArg) { console.error('usage: node scripts/validate-data.ts <gallery folder> [--fixtures]'); process.exit(1); }
const ROOT = path.resolve(dirArg);
const FIXTURES = flags.includes('--fixtures');
const REQUIRED_METHOD = 'before-after-unet';
const CLASS = ['', 'intact', 'damaged', 'destroyed'];
const COLUMNS = ['image', 'building_id', 'class_id', 'class_name', 'area_px', 'centroid_x', 'centroid_y',
  'bbox_x', 'bbox_y', 'bbox_w', 'bbox_h', 'dist_to_nearest_destroyed_px', 'outline'];
const HEATMAPS = ['heat_kde.png', 'heat_safe.png', 'heat_priority.png'];

const errors: string[] = [];
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function readJson(file: string, err: (m: string) => void): any {
  if (!fs.existsSync(file)) { err(`missing ${path.basename(file)}`); return null; }
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { err(`${path.basename(file)} is not valid JSON: ${(e as Error).message}`); return null; }
}

async function readMask(file: string, w: number, h: number, err: (m: string) => void): Promise<Uint8Array | null> {
  if (!fs.existsSync(file)) { err(`missing ${path.basename(file)}`); return null; }
  const meta = await sharp(file).metadata();
  if (meta.channels !== 1) err(`${path.basename(file)} has ${meta.channels} channels; it must be one channel of class ids`);
  if (meta.width !== w || meta.height !== h) err(`${path.basename(file)} is ${meta.width} x ${meta.height}; pair.json says ${w} x ${h}`);
  const data = new Uint8Array(await sharp(file).extractChannel(0).raw().toBuffer());
  if (data.some((v) => v > 3)) { err(`${path.basename(file)} has values above 3; class ids are 0 to 3`); return null; }
  return data.length === w * h ? data : null;
}

function checkFixtureFlag(obj: any, name: string, err: (m: string) => void) {
  if (FIXTURES && obj.fixture !== true) err(`${name} must carry "fixture": true in the fixtures folder`);
  if (!FIXTURES && 'fixture' in obj) err(`${name} is marked as a fixture; fixtures must never be in the real gallery`);
}

async function checkMethod(dir: string, id: string, pair: any, gt: Uint8Array | null, err: (m: string) => void) {
  const { width: w, height: h } = pair;
  const source = readJson(path.join(dir, 'source.json'), err);
  if (source) {
    if (!isStr(source.model)) err('source.json: model must be a non-empty string');
    if (typeof source.tta !== 'boolean') err('source.json: tta must be true or false');
    if (!(source.checkpoint === null || isStr(source.checkpoint))) err('source.json: checkpoint must be a string, or null if not recorded');
    if (!isStr(source.notebook)) err('source.json: notebook must be the notebook path in the repository');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(source.date ?? '')) err('source.json: date must be YYYY-MM-DD');
    checkFixtureFlag(source, 'source.json', err);
  }

  const mask = await readMask(path.join(dir, 'mask.png'), w, h, err);

  const buildings = readJson(path.join(dir, 'buildings.json'), err);
  if (buildings && !Array.isArray(buildings)) err('buildings.json must be an array of rows');
  if (Array.isArray(buildings)) {
    const ids = new Set<number>();
    const destroyed = buildings.filter((b) => b.class_id === 3).length;
    for (const b of buildings) {
      const at = `buildings.json, building ${b.building_id}`;
      const missing = COLUMNS.filter((c) => !(c in b));
      if (missing.length) { err(`${at}: missing ${missing.join(', ')}`); continue; }
      if (b.image !== pair.image) err(`${at}: image is "${b.image}", pair.json says "${pair.image}"`);
      if (!Number.isInteger(b.building_id) || ids.has(b.building_id)) err(`${at}: building_id must be a whole number, unique in the image`);
      ids.add(b.building_id);
      if (![1, 2, 3].includes(b.class_id) || b.class_name !== CLASS[b.class_id]) err(`${at}: class_id ${b.class_id} and class_name "${b.class_name}" don't match (1 intact, 2 damaged, 3 destroyed)`);
      if (!Number.isInteger(b.area_px) || b.area_px < MIN_AREA_PX) err(`${at}: area_px ${b.area_px} is under the ${MIN_AREA_PX} px minimum`);
      if (![b.bbox_x, b.bbox_y, b.bbox_w, b.bbox_h].every(Number.isInteger) || b.bbox_x < 0 || b.bbox_y < 0 || b.bbox_w < 1 || b.bbox_h < 1 || b.bbox_x + b.bbox_w > w || b.bbox_y + b.bbox_h > h) err(`${at}: bounding box is outside the image`);
      else if (!isNum(b.centroid_x) || !isNum(b.centroid_y) || b.centroid_x < b.bbox_x || b.centroid_x > b.bbox_x + b.bbox_w || b.centroid_y < b.bbox_y || b.centroid_y > b.bbox_y + b.bbox_h) err(`${at}: centroid is outside its bounding box`);
      const others = destroyed - (b.class_id === 3 ? 1 : 0);
      const d = b.dist_to_nearest_destroyed_px;
      if (others === 0 ? d !== null : !(isNum(d) && d >= 0)) err(`${at}: dist_to_nearest_destroyed_px must be ${others === 0 ? 'null (no other destroyed building in this image)' : 'a distance in pixels'}; got ${d}`);
      const rings = b.outline;
      if (!Array.isArray(rings) || !rings.length || rings.some((r: any) => !Array.isArray(r) || r.length < 3 || r.some((p: any) => !Array.isArray(p) || p.length !== 2 || !isNum(p[0]) || !isNum(p[1]) || p[0] < 0 || p[1] < 0 || p[0] > w || p[1] > h))) err(`${at}: outline must be a list of rings, each of 3 or more [x, y] points inside the image`);
    }
    // The table must be this mask's table: same regions, by the contract's own definition.
    if (mask) {
      const sig = (b: any) => `${b.class_id}:${b.area_px}:${b.bbox_x}:${b.bbox_y}:${b.bbox_w}:${b.bbox_h}`;
      const want = buildingsFromMask(mask, w, h, pair.image, 0).map(sig).sort();
      const got = buildings.map(sig).sort();
      if (want.length !== got.length) err(`buildings.json has ${got.length} rows; mask.png gives ${want.length} regions of ${MIN_AREA_PX} px or more`);
      else {
        const diff = want.filter((s, i) => s !== got[i]).length;
        if (diff) err(`buildings.json doesn't match mask.png: ${diff} rows differ in class, area or bounding box`);
      }
    }
  }

  const hs = readJson(path.join(dir, 'hotspots.json'), err);
  if (hs) {
    if (!Array.isArray(hs.hot_spots) || !Array.isArray(hs.safe_areas)) err('hotspots.json must have hot_spots and safe_areas lists (either may be empty)');
    else {
      const inImg = (p: any) => Array.isArray(p) && p.length === 2 && isNum(p[0]) && isNum(p[1]) && p[0] >= 0 && p[1] >= 0 && p[0] <= w && p[1] <= h;
      for (const s of hs.hot_spots) if (!Number.isInteger(s.rank) || !inImg(s.point_xy) || !isNum(s.area_px) || !isStr(s.where)) err(`hotspots.json: hot spot ${s.rank} needs rank, point_xy inside the image, area_px and where`);
      for (const s of hs.safe_areas) if (!Number.isInteger(s.rank) || !inImg(s.xy) || !isNum(s.distance_px) || !isStr(s.where)) err(`hotspots.json: safe area ${s.rank} needs rank, xy inside the image, distance_px and where`);
    }
  }
  for (const f of HEATMAPS) {
    const file = path.join(dir, f);
    if (!fs.existsSync(file)) { err(`missing ${f}`); continue; }
    const meta = await sharp(file).metadata();
    if (meta.channels !== 1 || meta.width !== meta.height) err(`${f} must be a square, one-channel PNG (value x 255)`);
  }

  const acc = readJson(path.join(dir, 'accuracy.json'), err);
  if (acc) {
    const keys = ['background', 'intact', 'damaged', 'destroyed'];
    if (!acc.iou || keys.some((k) => !(acc.iou[k] === null || (isNum(acc.iou[k]) && acc.iou[k] >= 0 && acc.iou[k] <= 1)))) err('accuracy.json: iou needs background, intact, damaged and destroyed, each 0 to 1, or null when the class is in neither mask');
    else if (mask && gt) {
      const real = iouPerClass(mask, gt);
      keys.forEach((k, c) => {
        const a = acc.iou[k], r = real[c];
        if ((a === null) !== (r === null) || (a !== null && r !== null && Math.abs(a - r) > 0.0005)) err(`accuracy.json: ${k} IoU is ${a}, but mask.png against gt.png gives ${r}`);
      });
    }
  }
  return { id, source, has_report_inputs: fs.existsSync(path.join(dir, 'report_inputs.txt')) };
}

async function checkPair(id: string) {
  const dir = path.join(ROOT, id);
  const err = (m: string) => errors.push(`${id}: ${m}`);
  if (!/^[a-z0-9_-]+$/.test(id)) err('the folder name may only use a-z, 0-9, _ and -');
  const pair = readJson(path.join(dir, 'pair.json'), err);
  if (!pair) return null;
  if (!isStr(pair.event)) err('pair.json: event must be a non-empty string');
  if (!['xBD', 'other'].includes(pair.source)) err('pair.json: source must be "xBD" or "other"');
  if (pair.split !== 'validation, clean') err('pair.json: split must be "validation, clean"');
  if (!isStr(pair.image)) err('pair.json: image must be the after-image file name in DisasterM3');
  if (!Number.isInteger(pair.width) || !Number.isInteger(pair.height)) { err('pair.json: width and height must be whole numbers of pixels'); return null; }
  if ('hero' in pair && typeof pair.hero !== 'boolean') err('pair.json: hero, if present, must be true or false');
  checkFixtureFlag(pair, 'pair.json', err);

  const photos: Record<string, boolean> = {};
  for (const name of ['before', 'after']) {
    const file = path.join(dir, `${name}.webp`);
    photos[name] = fs.existsSync(file);
    if (!photos[name]) { if (!FIXTURES) err(`missing ${name}.webp`); continue; }
    const meta = await sharp(file).metadata();
    if (meta.format !== 'webp' || meta.width !== pair.width || meta.height !== pair.height) err(`${name}.webp must be a WebP of ${pair.width} x ${pair.height}`);
  }
  const gt = await readMask(path.join(dir, 'gt.png'), pair.width, pair.height, err);

  const mroot = path.join(dir, 'methods');
  const methodIds = fs.existsSync(mroot) ? fs.readdirSync(mroot).filter((m) => fs.statSync(path.join(mroot, m)).isDirectory()).sort() : [];
  if (!methodIds.length) err('no method folder under methods/');
  if (!FIXTURES && !methodIds.includes(REQUIRED_METHOD)) err(`methods/${REQUIRED_METHOD}/ is required in every pair`);
  const methods = [];
  for (const m of methodIds) methods.push(await checkMethod(path.join(mroot, m), m, pair, gt, (msg) => err(`methods/${m}: ${msg}`)));
  return { id, info: pair, has_before: photos.before, has_after: photos.after, methods };
}

const pairIds = fs.existsSync(ROOT) ? fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory()).sort() : [];
const pairs = [];
for (const id of pairIds) { const p = await checkPair(id); if (p) pairs.push(p); }
if (pairs.filter((p) => p.info.hero).length > 1) errors.push('more than one pair.json has "hero": true; the Home page opens on one pair');

if (errors.length) {
  console.error(`${path.relative(process.cwd(), ROOT)}: ${errors.length} problem(s)\n` + errors.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
fs.mkdirSync(ROOT, { recursive: true });
fs.writeFileSync(path.join(ROOT, 'index.json'), JSON.stringify({ fixture: FIXTURES, pairs }, null, 1));
console.log(`${path.relative(process.cwd(), ROOT)}: ${pairs.length} pair(s) valid${FIXTURES ? ' (fixtures)' : ''}; index.json written`);
