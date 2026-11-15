// Self-checks for the building table and the fixed queries. Run by `npm run build`.
// The first block repeats the counting notebook's own checks (h2-sql-counting-agent.ipynb, Cell 5),
// so the site's table follows the same rules.
import assert from 'node:assert/strict';
import { buildingsFromMask } from '../src/core/buildings.ts';
import { countsByClass, largestOfClass, withinOfDestroyed } from '../src/core/queries.ts';

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

console.log('self-checks passed: building table, outlines and fixed queries');
