// Makes development fixtures in fixtures/data/ from real files already in the repository, in the
// shape of DATA_CONTRACT.md. Fixtures are marked `"fixture": true`, live outside public/, and the
// validator refuses that mark in public/data, so a fixture cannot reach a published build.
//
//   node scripts/make-fixtures.ts
//
// Sources (all read-only):
//   ground truth and the after-image-only U-Net's masks (8-view TTA): Champion_Task/E1-results/E1/
//   heatmaps and hot spots made from those same masks:               Champion_Task/T1-results/T1-v3/
//   photos, where this PC has them: xBD's original files under data/ (git-ignored, local only)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { buildingsFromMask, iouPerClass } from '../src/core/buildings.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.resolve(HERE, '..');
const REPO = path.resolve(SITE, '..', '..');
const CHAMPION = path.join(REPO, 'Essential_task_delegation', 'Champion_Task');
const XBD = path.join(REPO, 'data', 'xView2 Challenge Dataset - train and test', 'train', 'images');
const OUT = path.join(SITE, 'fixtures', 'data');
const METHOD = 'after-only-unet';

// Four clean validation pairs (none is in E5's list of 40 leaked pairs; checked below).
// `xbd` is the stem of xBD's original file when this PC has it; the Turkey pair has no photo here.
const PAIRS = [
  { image: 'hurricane_harvey_00000406_post_disaster.png', xbd: 'hurricane-harvey_00000406' },
  { image: 'santa_rosa_wildfire_00000058_post_disaster.png', xbd: 'santa-rosa-wildfire_00000058' },
  { image: 'palu_tsunami_00000125_post_disaster.png', xbd: 'palu-tsunami_00000125', hero: true },
  { image: 'turkey_earthquake4_post_776.png', xbd: null },
] as { image: string; xbd: string | null; hero?: boolean }[];

const leaks = fs.readFileSync(path.join(CHAMPION, 'E5-results/step1/val_train_leaks_hash.csv'), 'utf8')
  .split(/\r?\n/).slice(1).map((l) => l.split(',')).filter((c) => c[4] === 'True').map((c) => c[0]);
const hotspots: { image: string; event: string; source: string; hot_spots: unknown[]; safe_areas: unknown[] }[] =
  JSON.parse(fs.readFileSync(path.join(CHAMPION, 'T1-results/T1-v3/hotspots.json'), 'utf8'));

async function readMask(file: string) {
  const { data, info } = await sharp(file).extractChannel(0).raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8Array(data), width: info.width, height: info.height };
}

fs.rmSync(OUT, { recursive: true, force: true });
for (const p of PAIRS) {
  if (leaks.includes(p.image)) throw new Error(`${p.image} is one of the leaked validation pairs`);
  const id = p.image.replace(/(_post_disaster)?\.png$/, '');
  const dir = path.join(OUT, id);
  const mdir = path.join(dir, 'methods', METHOD);
  fs.mkdirSync(mdir, { recursive: true });

  const gt = await readMask(path.join(CHAMPION, 'E1-results/E1/gt', p.image));
  const pred = await readMask(path.join(CHAMPION, 'E1-results/E1/preds/R9_tta', p.image));
  const hs = hotspots.find((h) => h.image === p.image);
  if (!hs) throw new Error(`no hot spots for ${p.image}`);

  fs.copyFileSync(path.join(CHAMPION, 'E1-results/E1/gt', p.image), path.join(dir, 'gt.png'));
  fs.copyFileSync(path.join(CHAMPION, 'E1-results/E1/preds/R9_tta', p.image), path.join(mdir, 'mask.png'));
  const hasPhotos = !!p.xbd && fs.existsSync(path.join(XBD, `${p.xbd}_post_disaster.png`));
  if (hasPhotos) {
    for (const [when, name] of [['pre', 'before'], ['post', 'after']]) {
      await sharp(path.join(XBD, `${p.xbd}_${when}_disaster.png`)).removeAlpha().webp({ quality: 82 }).toFile(path.join(dir, `${name}.webp`));
    }
  }
  fs.writeFileSync(path.join(dir, 'pair.json'), JSON.stringify({
    event: hs.event, source: hs.source, split: 'validation, clean', image: p.image,
    width: gt.width, height: gt.height, ...(p.hero && hasPhotos ? { hero: true } : {}), fixture: true,
  }, null, 1));

  const buildings = buildingsFromMask(pred.data, pred.width, pred.height, p.image);
  fs.writeFileSync(path.join(mdir, 'buildings.json'), JSON.stringify(buildings));
  fs.writeFileSync(path.join(mdir, 'hotspots.json'), JSON.stringify({ hot_spots: hs.hot_spots, safe_areas: hs.safe_areas }, null, 1));
  for (const kind of ['kde', 'safe', 'priority']) {
    fs.copyFileSync(path.join(CHAMPION, 'T1-results/T1-v3/maps', p.image.replace('.png', `_${kind}.png`)), path.join(mdir, `heat_${kind}.png`));
  }
  const [background, intact, damaged, destroyed] = iouPerClass(pred.data, gt.data);
  fs.writeFileSync(path.join(mdir, 'accuracy.json'), JSON.stringify({ iou: { background, intact, damaged, destroyed } }, null, 1));
  fs.writeFileSync(path.join(mdir, 'source.json'), JSON.stringify({
    model: 'A U-Net that reads only the after image (the lighter field model, at full precision)', tta: true,
    checkpoint: 'AbrarAlam/disasterm3-d4-R9@34897e1a',
    notebook: 'Essential_task_delegation/Champion_Task/d4-champion-model-E1.ipynb',
    date: '2026-10-19', fixture: true,
  }, null, 1));
  // No report_inputs.txt: the bridge that writes it is not fixed yet, so the site shows it as missing.
  console.log(`${id}: ${buildings.length} buildings, photos ${hasPhotos ? 'yes' : 'no'}, IoU destroyed ${destroyed}`);
}
