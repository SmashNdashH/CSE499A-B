// Parity and speed check for Try it, through the page's own file input.
//
// The October browser test fed the model a ready-made tensor. Here the picture goes in the way a
// visitor's does (file input -> the browser decodes it -> canvas -> worker), so the browser's own
// image decoding is tested too. The same file is then run natively (sharp + onnxruntime-node, the
// same runtime version), with the test kit's preprocessing written out again below, and the two
// masks are compared pixel by pixel.
//
//   npm run build && npm run preview         (in one terminal)
//   node scripts/check-browser-model.ts      (in another; BASE_URL, CHROME_PATH, IMAGE, BEFORE, RUNS can be set)
//
// IMAGE is the after-photo; BEFORE the before-photo, used when the model reads both (FIELD_MODEL.images).
// By default both come from the gallery's Santa Rosa pair, which every real build has.
//
// Pass rule (the brief's): the same class as the native run on at least 99.9% of pixels.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ort from 'onnxruntime-node';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import { FIELD_MODEL } from '../src/core/modelConfig.ts';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = path.resolve(SITE, '..', '..');
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const GALLERY = path.join(SITE, 'public', 'data', 'santa_rosa_wildfire_00000058');
const OCTOBER_IMAGE = path.join(REPO, 'data/xView2 Challenge Dataset - train and test/train/images/hurricane-harvey_00000099_post_disaster.png');
const TWO = FIELD_MODEL.images.length > 1;
const IMAGE = process.env.IMAGE ?? (TWO ? path.join(GALLERY, 'after.webp') : OCTOBER_IMAGE);
const BEFORE = process.env.BEFORE ?? path.join(GALLERY, 'before.webp');
const FILES: Record<'before' | 'after', string> = { after: IMAGE, before: BEFORE };
const RUNS = Number(process.env.RUNS ?? 4);
const PASS_PCT = 99.9;
const N = FIELD_MODEL.size ** 2;

// --- native run: each photo in the model's channel order (FIELD_MODEL.images), as the page stacks them --
const input = new Float32Array(FIELD_MODEL.images.length * 3 * N);
for (const [p, role] of FIELD_MODEL.images.entries()) {
  const { data: rgb, info } = await sharp(FILES[role]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== FIELD_MODEL.size || info.height !== FIELD_MODEL.size || info.channels !== 3) throw new Error(`expected a ${FIELD_MODEL.size} x ${FIELD_MODEL.size} RGB ${role} photo, got ${info.width} x ${info.height} x ${info.channels}`);
  for (let c = 0; c < 3; c++) {
    // prep.py works in 32-bit floats throughout (numpy float32), so each step is rounded to one.
    const f = Math.fround;
    const mean = f(f([0.485, 0.456, 0.406][c]) * 255), std = f(f([0.229, 0.224, 0.225][c]) * 255);
    for (let i = 0; i < N; i++) input[(p * 3 + c) * N + i] = f(rgb[i * 3 + c] - mean) / std;
  }
}
const session = await ort.InferenceSession.create(path.join(SITE, 'public', FIELD_MODEL.file), { graphOptimizationLevel: 'all' });
const shape = [1, FIELD_MODEL.images.length * 3, FIELD_MODEL.size, FIELD_MODEL.size];
const logits = (await session.run({ [FIELD_MODEL.inputName]: new ort.Tensor('float32', input, shape) }))[FIELD_MODEL.outputName].data as Float32Array;
const native = new Uint8Array(N);
const nativeCounts = [0, 0, 0, 0];
for (let i = 0; i < N; i++) {
  let best = 0, v = logits[i];
  for (let k = 1; k < 4; k++) { const u = logits[k * N + i]; if (u > v) { v = u; best = k; } }
  native[i] = best; nativeCounts[best]++;
}
// Free the native runtime's threads before the browser is timed, or they compete for the CPU.
await session.release();

// --- the page ---------------------------------------------------------------------------------
const requests = new Set<string>();
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 600_000 });
const page = await browser.newPage();
await page.setViewport({ width: Number(process.env.WIDTH ?? 1440), height: 900 });
const errors: string[] = [];
page.on('request', (r) => { if (!/^(data|blob):/.test(r.url())) requests.add(r.url()); });
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push((e as Error).message));
await page.goto(BASE + '/try', { waitUntil: 'networkidle0' });
const isolated = await page.evaluate(() => self.crossOriginIsolated);
for (const role of FIELD_MODEL.images) await (await page.$(`input[type=file][data-role=${role}]`))!.uploadFile(FILES[role]);
await page.waitForFunction((n: number) => document.querySelectorAll('.try-note').length >= n, {}, FIELD_MODEL.images.length);
const note = (await page.$$eval('.try-note', (els) => els.map((el) => el.textContent ?? ''))).join(' | ');

const seconds: number[] = [];
let threads = '';
for (let k = 0; k < RUNS; k++) {
  await page.evaluate(() => document.querySelector('[data-model-seconds]')?.removeAttribute('data-model-seconds'));
  await page.$eval('.try-pick .a-btn', (el) => (el as HTMLButtonElement).click());
  await page.waitForSelector('[data-model-seconds], .try-status .ws-missing', { timeout: 300_000 });
  const failed = await page.$eval('.try-status', (el) => el.querySelector('.ws-missing')?.textContent ?? '');
  if (failed) { console.error(`the page could not run the model: ${failed}`); await browser.close(); process.exit(1); }
  seconds.push(Number(await page.$eval('[data-model-seconds]', (el) => el.getAttribute('data-model-seconds'))));
  threads = (await page.$eval('[data-threads]', (el) => el.getAttribute('data-threads'))) ?? '';
}
// The mask the visitor can download: its red channel is the class id.
const maskB64 = await page.$eval('[data-mask]', async (a) => {
  const bmp = await createImageBitmap(await (await fetch((a as HTMLAnchorElement).href)).blob());
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = c.getContext('2d')!;
  ctx.drawImage(bmp, 0, 0);
  const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
  let s = '';
  for (let i = 0; i < d.length; i += 4) s += String.fromCharCode(d[i]);
  return btoa(s);
});
const counts = await page.$$eval('.ws-bottom .ws-countbtn', (els) => els.map((e) => Number(e.getAttribute('data-count'))));
const dir = path.join(SITE, 'checks', 'screenshots');
fs.mkdirSync(dir, { recursive: true });
await page.screenshot({ path: path.join(dir, 'try-1440-result.png'), fullPage: true });
await page.setViewport({ width: 390, height: 844 });
await new Promise((r) => setTimeout(r, 600));
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
await page.screenshot({ path: path.join(dir, 'try-390-result.png'), fullPage: true });
await browser.close();

// --- compare ----------------------------------------------------------------------------------
const inBrowser = Uint8Array.from(Buffer.from(maskB64, 'base64'));
let same = 0;
for (let i = 0; i < N; i++) if (inBrowser[i] === native[i]) same++;
const pct = (same / N) * 100;
const outside = [...requests].filter((u) => new URL(u).hostname !== '127.0.0.1');
// October's native run applies only to its own model (the after-photo one) and image.
const octoberApplies = !TWO && path.resolve(IMAGE) === path.resolve(OCTOBER_IMAGE);
const october = octoberApplies
  ? JSON.parse(fs.readFileSync(path.resolve(SITE, '..', 'Champion_Task/T3-browser-test/results/native_results.json'), 'utf8')).int8.class_pixels as number[]
  : null;

const report = {
  model: path.basename(FIELD_MODEL.file), photos: Object.fromEntries(FIELD_MODEL.images.map((r) => [r, path.basename(FILES[r])])),
  runtime: 'ONNX Runtime Web 1.20.1 (WebAssembly)', cross_origin_isolated: isolated, threads: Number(threads),
  what_the_page_said_it_did: note, agree_pct: +pct.toFixed(4), differing_pixels: N - same,
  class_pixels_native: nativeCounts, class_pixels_native_october: october,
  first_run_s: seconds[0], later_runs_s: seconds.slice(1), building_counts_on_page: counts,
  requests: requests.size, requests_outside_127_0_0_1: outside, overflow_px_at_390: overflow, console_errors: errors,
};
fs.writeFileSync(path.join(SITE, 'checks', 'browser-model.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
const problems = [
  pct < PASS_PCT && `only ${pct.toFixed(4)}% of pixels match the native run (need ${PASS_PCT}%)`,
  outside.length && `${outside.length} request(s) left 127.0.0.1`,
  errors.length && `${errors.length} console error(s)`,
  !isolated && 'the page is not cross-origin isolated, so the model ran on one thread',
  overflow > 1 && `the result page is ${overflow} px wider than a 390 px screen`,
  october && nativeCounts.join() !== october.join() && "the native run's class counts differ from October's native run",
].filter(Boolean);
if (problems.length) { console.error('FAILED:\n' + problems.map((p) => '  - ' + p).join('\n')); process.exit(1); }
console.log(`browser and native runs agree on ${pct.toFixed(4)}% of pixels; time per image after the first run: ${seconds.slice(1).join(', ')} s on ${threads} threads`);
