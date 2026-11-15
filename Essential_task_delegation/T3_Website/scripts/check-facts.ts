// Checks src/data/facts.json, the one file every number on the site comes from.
//
//   node scripts/check-facts.ts            run by `npm run build`; unpushed sources are listed as warnings
//   node scripts/check-facts.ts --strict   for the deploy: an unpushed source is an error
//
// 1. Every fact has its fields, and its source file exists.
// 2. Every `find` string is in the source file, so the number can be traced by a text search.
// 3. The anchors fixed in the brief (section 3.8) match.
// 4. The clean-pair scores of the two U-Nets are recomputed from the per-image pixel counts.
// 5. Sources that git doesn't track yet are listed: push them before deploying, or their links 404.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..', '..');
const STRICT = process.argv.includes('--strict');
const facts: any[] = JSON.parse(fs.readFileSync(path.join(SITE, 'src/data/facts.json'), 'utf8'));
const errors: string[] = [];
const byId = new Map<string, any>();

for (const f of facts) {
  const at = `fact "${f.id}"`;
  for (const k of ['id', 'value', 'display', 'measures', 'image_set', 'model', 'source', 'find', 'public_from']) {
    if (f[k] === undefined || f[k] === '') errors.push(`${at}: missing ${k}`);
  }
  if (byId.has(f.id)) errors.push(`${at}: duplicate id`);
  byId.set(f.id, f);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f.public_from ?? '')) errors.push(`${at}: public_from must be YYYY-MM-DD`);
  const file = path.join(REPO, f.source ?? '');
  if (!f.source || !fs.existsSync(file)) { errors.push(`${at}: source not found: ${f.source}`); continue; }
  const text = fs.readFileSync(file, 'utf8');
  for (const s of f.find ?? []) if (!text.includes(s)) errors.push(`${at}: "${s}" is not in ${f.source}`);
}

// 3. Anchors from the brief, section 3.8.
const ANCHORS: [string, unknown][] = [
  ['ftg_destroyed_iou_clean', 0.3065], ['ftg_miou_clean', 0.5473], ['ftg_seed_scores', '0.3161, 0.3051, 0.2982'],
  ['pair_unet_destroyed_iou_clean', 0.2692], ['pair_unet_miou_clean', 0.5805],
  ['field_unet_destroyed_iou_clean', 0.2874], ['field_unet_miou_clean', 0.5402],
  ['vlm_dtr_ours', 76.77], ['vlm_bbr_ours', 19.99], ['vlm_bdc_ours', 30.31], ['vlm_dre_ours', 33.03], ['vlm_dsr_ours', 40.46], ['vlm_orr_ours', 34.62],
  ['vlm_paper_columns', { DTR: [66.6, 83.6], BBR: [4.7, 21.5], BDC: [34.2, 34.3], DRE: [29.3, 29.4], DSR: [28.3, 37.7], ORR: [23.9, 36.2] }],
  ['table_counting_accuracy', 32.96], ['base_counting_accuracy', 34.2], ['hotspot_point_on_damage', 0.736],
  ['test_ftg_destroyed_iou', 0.3898], ['test_pair_unet_destroyed_iou', 0.3984], ['test_ftg_miou', 0.5129], ['test_pair_unet_miou', 0.5721],
];
for (const [id, want] of ANCHORS) {
  const got = byId.get(id)?.value;
  if (JSON.stringify(got) !== JSON.stringify(want)) errors.push(`anchor "${id}": the brief says ${JSON.stringify(want)}, the facts file has ${JSON.stringify(got)}`);
}

// 4. Recompute the U-Nets' scores on the 605 clean pairs from E5 step 2's per-image pixel counts.
const champ = path.join(REPO, 'Essential_task_delegation/Champion_Task');
const leaks = new Set(fs.readFileSync(path.join(champ, 'E5-results/step1/val_train_leaks_hash.csv'), 'utf8')
  .split(/\r?\n/).slice(1).map((l) => l.split(',')).filter((c) => c[4] === 'True').map((c) => c[0]));
const cm: Record<string, { n: number; m: number[] }> = {};
for (const line of fs.readFileSync(path.join(champ, 'E5-results/step2/per_image_counts.csv'), 'utf8').split(/\r?\n/).slice(1)) {
  const c = line.split(',');
  if (c.length < 21 || leaks.has(c[2])) continue;
  const k = `${c[0]}_${c[1]}`;
  cm[k] ??= { n: 0, m: new Array(16).fill(0) };
  cm[k].n++;
  for (let i = 0; i < 16; i++) cm[k].m[i] += Number(c[5 + i]);
}
function scores(k: string) {
  const m = cm[k].m;
  const iou = [0, 1, 2, 3].map((c) => {
    const row = m[c * 4] + m[c * 4 + 1] + m[c * 4 + 2] + m[c * 4 + 3];
    const col = m[c] + m[4 + c] + m[8 + c] + m[12 + c];
    return m[c * 5] / (row + col - m[c * 5]);
  });
  return { pairs: cm[k].n, destroyed: +iou[3].toFixed(4), miou: +(iou.reduce((a, b) => a + b) / 4).toFixed(4) };
}
for (const [k, d, m] of [['R11_tta', 'pair_unet_destroyed_iou_clean', 'pair_unet_miou_clean'], ['R9_tta', 'field_unet_destroyed_iou_clean', 'field_unet_miou_clean']]) {
  const s = scores(k);
  if (leaks.size !== 40 || s.pairs !== 605) errors.push(`recompute ${k}: expected 40 leaked and 605 clean pairs, got ${leaks.size} and ${s.pairs}`);
  if (s.destroyed !== byId.get(d)?.value || s.miou !== byId.get(m)?.value) errors.push(`recompute ${k}: per-image counts give Destroyed IoU ${s.destroyed} and mIoU ${s.miou}; the facts file has ${byId.get(d)?.value} and ${byId.get(m)?.value}`);
  else console.log(`recomputed ${k} on ${s.pairs} clean pairs: Destroyed IoU ${s.destroyed}, mIoU ${s.miou} (matches)`);
}
const seeds = String(byId.get('ftg_seed_scores')?.value).split(', ').map(Number);
if (+(seeds.reduce((a, b) => a + b, 0) / 3).toFixed(4) !== byId.get('ftg_destroyed_iou_clean')?.value) errors.push('the mean of the three grader seeds is not the find-then-grade headline');

// 5. Sources git doesn't know (read-only: git ls-files changes nothing).
// In --strict, an untracked source is an error only if this build shows a fact that links to it.
const today = process.env.FACTS_DATE ?? new Intl.DateTimeFormat('en-CA').format(new Date());
const held = facts.filter((f) => f.public_from > today);
const sources = [...new Set(facts.map((f) => f.source as string))];
const tracked = new Set(execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '--', ...sources], { cwd: REPO, encoding: 'utf8' }).split('\n').filter(Boolean));
const shownSources = new Set(facts.filter((f) => f.public_from <= today).map((f) => f.source as string));
const unpushed = sources.filter((s) => !tracked.has(s));
const blocking = unpushed.filter((s) => shownSources.has(s));
if (unpushed.length) {
  const msg = `${unpushed.length} linked source(s) aren't tracked by git; push them before deploying:\n`
    + unpushed.map((s) => `  - ${s}${shownSources.has(s) ? '' : ' (only facts not public yet link to it)'}`).join('\n');
  if (STRICT && blocking.length) errors.push(msg); else console.warn('WARNING: ' + msg);
}

console.log(`${facts.length} facts, ${ANCHORS.length} anchors checked; ${held.length} held back until their public_from date (build date ${today})${held.length ? ': ' + held.map((f) => f.id).join(', ') : ''}`);
if (errors.length) { console.error(`${errors.length} problem(s):\n` + errors.map((e) => '  - ' + e).join('\n')); process.exit(1); }
