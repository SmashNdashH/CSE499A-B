// Self-checks for the building table and the fixed queries. Run by `npm run build`.
// The first block repeats the counting notebook's own checks (h2-sql-counting-agent.ipynb, Cell 5),
// so the site's table follows the same rules.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildingsFromMask } from '../src/core/buildings.ts';
import { countsByClass, largestOfClass, withinOfDestroyed } from '../src/core/queries.ts';
import { KNOWN_ERRORS, REPORT_NOTES, REPORTS } from '../src/core/reportNotes.ts';
import { prettyEvent } from '../src/core/useGallery.ts';
import { FULL_VIEW, MAX_ZOOM, centreOn, clampView, panBy, shows, zoomAt } from '../src/core/view.ts';

const W = 200;
const m = new Uint8Array(W * W);
const fill = (x0: number, y0: number, x1: number, y1: number, c: number) => { for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) m[y * W + x] = c; };
fill(10, 10, 20, 20, 1);     // intact, 100 px
m[20 * W + 20] = 1;          // touches that region on a diagonal: still one region (8-connected)
fill(100, 100, 102, 102, 1); // intact, 4 px: under the 20 px minimum
fill(50, 50, 60, 60, 3);     // destroyed
fill(150, 50, 160, 60, 3);   // destroyed
fill(150, 150, 153, 153, 3); // destroyed, 9 px: under the minimum
fill(100, 20, 110, 30, 2);   // damaged, with a hole
fill(103, 23, 106, 26, 0);

const b = buildingsFromMask(m, W, W, 'check.png', 0);
const n = countsByClass(b);
assert.deepEqual(n, { 1: 1, 2: 1, 3: 2 }, 'one intact, one damaged and two destroyed regions');
const intact = b.find((x) => x.class_id === 1)!;
assert.equal(intact.area_px, 101, 'the diagonal pixel belongs to the intact region');
assert.deepEqual(b.filter((x) => x.class_id === 3).map((x) => x.dist_to_nearest_destroyed_px), [100, 100], 'a destroyed building\'s distance leaves itself out');
assert.deepEqual(b.map((x) => x.building_id), [1, 2, 3, 4], 'ids run from 1');

// Outlines: the area inside the rings (even-odd) equals the pixel area, holes included.
const ringArea = (r: [number, number][]) => Math.abs(r.reduce((s, [x, y], i) => { const [nx, ny] = r[(i + 1) % r.length]; return s + x * ny - nx * y; }, 0)) / 2;
for (const x of b) {
  const [outer, ...holes] = x.outline.map(ringArea);
  assert.equal(outer - holes.reduce((s, a) => s + a, 0), x.area_px, `outline area of building ${x.building_id}`);
}
assert.equal(b.find((x) => x.class_id === 2)!.outline.length, 2, 'the damaged region has an outer ring and one hole');

// With one destroyed building only, it has no distance; others still do. Missing is null, never 0.
const one = new Uint8Array(W * W);
for (let y = 50; y < 60; y++) for (let x = 50; x < 60; x++) one[y * W + x] = 3;
for (let y = 50; y < 60; y++) for (let x = 100; x < 110; x++) one[y * W + x] = 1;
const b1 = buildingsFromMask(one, W, W, 'check.png');
assert.equal(b1.find((x) => x.class_id === 3)!.dist_to_nearest_destroyed_px, null);
assert.equal(b1.find((x) => x.class_id === 1)!.dist_to_nearest_destroyed_px, 50);
assert.equal(withinOfDestroyed(b1, 1, 50).length, 1);
assert.equal(withinOfDestroyed(b1, 3, 200).length, 0, 'a null distance never matches a distance question');
assert.equal(largestOfClass(b1, 2), null, 'no damaged building is null, not a made-up row');

// No destroyed building at all: every distance is null.
const none = buildingsFromMask(one.map((v) => (v === 3 ? 0 : v)), W, W, 'check.png');
assert.ok(none.length === 1 && none[0].dist_to_nearest_destroyed_px === null);

// The map's view: a zoom keeps the image point under the pointer in place, and no view leaves the image.
const zoomed = zoomAt(FULL_VIEW, 2, 0.25, 0.75, 1024, 1024);
assert.deepEqual(zoomed, { k: 2, x: 128, y: 384 }, 'the point under the pointer (256, 768) stays where it was');
assert.deepEqual(zoomAt(zoomed, 0.5, 0.25, 0.75, 1024, 1024), FULL_VIEW, 'zooming back out returns to the whole image');
assert.equal(zoomAt(FULL_VIEW, 100, 0.5, 0.5, 1024, 1024).k, MAX_ZOOM);
assert.deepEqual(panBy(zoomed, -5, 5, 1024, 1024), { k: 2, x: 0, y: 512 }, 'a pan stops at the image\'s edge');
assert.deepEqual(centreOn(zoomed, 1000, 20, 1024, 1024), { k: 2, x: 512, y: 0 });
assert.ok(shows(zoomed, 256, 768, 1024, 1024) && !shows(zoomed, 100, 768, 1024, 1024));
assert.deepEqual(clampView({ k: 0.3, x: -9, y: 9 }, 1024, 768), FULL_VIEW);

// Event names: places capitalised, the kind of disaster not, and nothing after the name touched.
assert.equal(prettyEvent('santa_rosa_wildfire'), 'Santa Rosa wildfire');
assert.equal(prettyEvent('hurricane_harvey'), 'Hurricane Harvey');
assert.equal(prettyEvent('palu_tsunami (gallery photo)'), 'Palu tsunami (gallery photo)');
assert.equal(prettyEvent('your image'), 'Your image');

// The reports' known errors: every marked phrase is still in a report, and no mark begins inside another.
const reportText = Object.fromEntries(REPORTS.map(([f]) => [f, fs.readFileSync(new URL(`../public/reports/offline/${f}`, import.meta.url), 'utf8')]));
for (const e of KNOWN_ERRORS) assert.ok(Object.values(reportText).some((t) => t.includes(e.phrase)), `the marked phrase "${e.phrase}" is in no report`);
for (const f of Object.keys(REPORT_NOTES)) assert.ok(f in reportText, `${f} is not one of the six reports`);
for (const [f, text] of Object.entries(reportText)) {
  const spans = KNOWN_ERRORS.flatMap((e) => [...text.matchAll(new RegExp(e.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))].map((m) => [m.index, m.index + e.phrase.length, e.phrase] as const))
    .sort((a, c) => a[0] - c[0]);
  spans.forEach((s, i) => assert.ok(i === 0 || spans[i - 1][1] <= s[0], `${f}: the marks "${spans[i - 1]?.[2]}" and "${s[2]}" overlap`));
}

console.log('self-checks passed: building table, outlines, fixed queries, the map\'s view, event names and the reports\' marked phrases');
