// Records the one-minute CSE499B demo: the showcase website used as a visitor would, in Chrome.
// A drawn mouse pointer and a short caption per scene are added to the page; everything else is the site as built.
// Each scene is recorded to its own file (scene_NN_<name>.webm), so the edit can fit each to its slot of the minute.
// Made 24 Nov 2026 for others/CSE499B_1-min_video_demonstration.mp4. To make it again, in T3_Website:
//   npm run build && npm run preview          (one terminal; the site at http://127.0.0.1:4173)
//   node scripts/demo-video/record_demo.mjs  (another; needs Chrome, and ffmpeg on PATH)
//   python scripts/demo-video/edit_demo.py   (joins the scenes into checks/demo-video/demo.mp4, exactly 60 s)
// The recordings and the video go to checks/demo-video/, which git ignores.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const T3 = 'D:/CSE499AB_project/Essential_task_delegation/T3_Website';
const require = createRequire(path.join(T3, 'package.json'));
const puppeteer = (await import(pathToFileURL(require.resolve('puppeteer-core')).href)).default;
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(T3, 'checks', 'demo-video');
fs.mkdirSync(OUT, { recursive: true });
// A 1440 x 810 window: the width the site is laid out and tested for. The edit scales it to 1920 x 1080.
const W = 1440, H = 810, DPR = 4 / 3;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let t0 = 0;

// The drawn pointer and the caption bar. Both ignore the mouse, so they can't change what a click hits.
const OVERLAY = `
(() => {
  const css = document.createElement('style');
  css.textContent = \`
    #demo-cursor { position: fixed; left: 0; top: 0; width: 26px; height: 26px; z-index: 2147483647; pointer-events: none;
      transform: translate(-3px, -2px); filter: drop-shadow(0 1px 2px rgba(0,0,0,.5)); }
    #demo-ring { position: fixed; width: 34px; height: 34px; margin: -17px 0 0 -17px; border-radius: 50%; z-index: 2147483646;
      pointer-events: none; border: 3px solid #f5b700; opacity: 0; transform: scale(.4); transition: opacity .35s, transform .35s; }
    #demo-ring.on { opacity: 1; transform: scale(1.1); }
    #demo-caption { position: fixed; left: 50%; bottom: 36px; transform: translateX(-50%); z-index: 2147483645; pointer-events: none;
      max-width: 1180px; padding: 10px 22px; border-radius: 10px; background: rgba(12, 22, 18, .9); color: #fff;
      font: 600 21px/1.35 'Segoe UI', system-ui, sans-serif; text-align: center; letter-spacing: .1px;
      box-shadow: 0 6px 24px rgba(0,0,0,.35); transition: opacity .3s; }
    #demo-caption:empty { opacity: 0; }
    #demo-caption small { display: block; font-weight: 400; font-size: 16px; opacity: .88; margin-top: 3px; }\`;
  const add = () => {
    if (document.getElementById('demo-cursor')) return;
    document.head.appendChild(css);
    const c = document.createElement('div');
    c.id = 'demo-cursor';
    c.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M3 2 L3 20 L8 15.5 L11.5 22.5 L14.5 21 L11 14 L18 14 Z" fill="#fff" stroke="#111" stroke-width="1.4" stroke-linejoin="round"/></svg>';
    const r = document.createElement('div'); r.id = 'demo-ring';
    const cap = document.createElement('div'); cap.id = 'demo-caption';
    document.body.append(c, r, cap);
    addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', (e) => { r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      r.classList.add('on'); setTimeout(() => r.classList.remove('on'), 380); }, true);
  };
  if (document.body) add(); else addEventListener('DOMContentLoaded', add);
})();`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars', `--window-size=${W},${H}`] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: DPR });
await page.evaluateOnNewDocument(OVERLAY);
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const requests = new Set();
page.on('request', (r) => { if (!/^(data|blob):/.test(r.url())) requests.add(new URL(r.url()).host); });

let mx = W / 2, my = H / 2;
// Few steps: each step is one command to the browser, and while recording each takes tens of milliseconds.
const moveTo = async (x, y, steps = 9) => { await page.mouse.move(x, y, { steps }); mx = x; my = y; };
// Scrolls only when the control isn't already on screen, as a visitor would.
const centreOf = async (el) => {
  const moved = await el.evaluate((e) => {
    const r = e.getBoundingClientRect();
    if (r.top >= 70 && r.bottom <= innerHeight - 110) return false;   // clear of the header and the caption bar
    e.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return true;
  });
  await wait(moved ? 650 : 120);
  const b = await el.boundingBox();
  return [b.x + b.width / 2, b.y + b.height / 2];
};
const clickEl = async (el, pause = 350) => { const [x, y] = await centreOf(el); await moveTo(x, y); await wait(pause); await page.mouse.down(); await page.mouse.up(); };
const byText = async (selector, text) => page.evaluateHandle((s, t) => [...document.querySelectorAll(s)].find((e) => e.textContent.trim().startsWith(t)) ?? null, selector, text).then((h) => h.asElement());
const caption = (main, sub = '') => page.evaluate((m, s) => { const c = document.getElementById('demo-caption'); if (c) c.innerHTML = m ? m + (s ? '<small>' + s + '</small>' : '') : ''; }, main, sub);
// The caption is cleared as the link is clicked, so a scene's caption never sits over the next page.
const clickClear = async (el) => { const [x, y] = await centreOf(el); await moveTo(x, y); await wait(250); await caption(''); await page.mouse.down(); await page.mouse.up(); await wait(900); };
const navTo = async (label) => { const a = await byText('header a, nav a', label); if (!a) throw new Error(`no link "${label}"`); await clickClear(a); };
const smoothScroll = (dy, ms) => page.evaluate((d, t) => new Promise((done) => {
  const start = scrollY, t1 = performance.now();
  const step = (now) => { const k = Math.min(1, (now - t1) / t); scrollTo(0, start + d * (0.5 - Math.cos(Math.PI * k) / 2)); k < 1 ? requestAnimationFrame(step) : done(); };
  requestAnimationFrame(step);
}), dy, ms);

// The model is downloaded for real in the recording (a visitor's first run); that wait is fast-forwarded in the edit.
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.mouse.move(mx, my);
await wait(2600);                          // the opening slider sweep finishes before recording starts
await caption('Post-disaster damage assessment and rescue guidance', 'CSE499B · Group 5 · an offline system that runs on a laptop');

const scenes = [];
const scene = async (name, fn) => {
  const file = path.join(OUT, `scene_${String(scenes.length + 1).padStart(2, '0')}_${name}.webm`);
  const rec = await page.screencast({ path: file });
  t0 = Date.now();
  await fn();
  await rec.stop();
  scenes.push({ name, file: path.basename(file), wall_s: (Date.now() - t0) / 1000 });
  console.log(`${name}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
};

// 1. Home: the two photos and the damage outlines
await scene('home', async () => {
  await wait(3000);
  const handle = await page.$('.oc-handle');
  if (handle) {
    await caption('Two satellite photos of the same place: before and after the disaster', 'Every building is outlined by damage: green intact, yellow damaged, red destroyed');
    const [hx, hy] = await centreOf(handle);
    await moveTo(hx, hy, 8);
    await page.mouse.down();
    await moveTo(hx - 230, hy, 14);
    await moveTo(hx + 210, hy, 18);
    await moveTo(hx, hy, 10);
    await page.mouse.up();
  }
  await wait(1200);
});

// 2. How it works
await scene('how', async () => {
  await navTo('How it works');
  await caption('How it works', 'Find each building, grade it, put it in a table: counts come from the table, never from a guess');
  await smoothScroll(1500, 4200);
  await wait(500);
});

// 3. Explore: a real test pair, a building's facts, a count, a fixed question, the 3D view
await scene('explore', async () => {
  await navTo('Explore');
  const pairChip = await byText('.ws-chip', 'Santa Rosa');
  if (pairChip) { await clickEl(pairChip); await wait(1200); }
  await caption('Explore a real pair: click any building to see its row in the building table');
  const ws = await page.$('.ws');
  if (ws) await ws.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await wait(300);
  const buildings = await page.$$('.ws .oc-b.is-pickable path');
  const pick = buildings[Math.floor(buildings.length * 0.42)] ?? buildings[0];
  if (pick) { await clickEl(pick, 500); await wait(1700); }
  const countBtn = (await page.$$('.ws-bottom .ws-countbtn'))[3];
  if (countBtn) {
    await caption('Counts come straight from the table', 'Press a count and those buildings light up');
    await clickEl(countBtn); await wait(1800);
  }
  const tabs = await page.$$('.ws-right .ws-tabs button');
  if (tabs[1]) { await clickEl(tabs[1]); await wait(500); }
  const tmpl = (await page.$$('.fq-templates button'))[1];
  if (tmpl) {
    await caption('Fixed responder questions, answered by a checked database query', 'For example: intact buildings close to a destroyed one');
    await clickEl(tmpl); await wait(2200);
  }
  const city = await byText('.ws-chip', '3D damage city');
  if (city) {
    await caption('A 3D view of the same 2D map', 'Destroyed buildings sit flat, intact ones stand tall');
    await clickEl(city); await wait(900);
    const slider = await page.$('.city .oc-slider input');
    if (slider) { await slider.focus(); for (let k = 0; k < 10; k++) { await page.keyboard.press('ArrowRight'); await wait(60); } }
    await wait(1200);
  }
});

// 4. Try it: the 8-bit model in the visitor's own browser
await scene('try', async () => {
  await navTo('Try it');
  await caption('Try it: our 33 MB field model runs inside your browser', 'Nothing is uploaded. Pick a gallery pair, or your own two photos');
  await wait(600);
  const sample = await byText('.ws-chip', 'Santa Rosa') ?? (await page.$$('.ws-chip'))[0];
  if (sample) await clickEl(sample);
  // The button is disabled until both gallery photos are loaded: wait for it, as a visitor would.
  await page.waitForFunction(() => [...document.querySelectorAll('button.a-btn')].some((b) => b.textContent.startsWith('Run the model') && !b.disabled), { timeout: 30_000 });
  await wait(700);
  const run = await byText('button.a-btn', 'Run the model');
  await clickEl(run);
  // No time is named: recording the screen takes CPU from the model, so the time measured here isn't the normal one.
  await caption('Running on this device… (fast-forwarded in this video)', 'A one-time 33 MB download, then the before-and-after model in 8 bits reads the two photos');
  await wait(400);
});

// 5. The run itself: fast-forwarded in the edit
await scene('run', async () => {
  await page.waitForSelector('[data-model-seconds], .try-status .ws-missing', { timeout: 180_000 });
});

// 6. The result
await scene('result', async () => {
  await caption('Done, on this computer', 'The damage map, its building table and the search hot spots, made without uploading anything');
  const result = await page.$('.ws');
  if (result) await result.evaluate((e) => e.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  await wait(3000);
});

// 7. Reports: written offline by our fine-tuned model
await scene('reports', async () => {
  await navTo('Reports');
  await caption('Six rescue reports, written offline by our fine-tuned vision-language model', 'Every guideline citation is real, and known problems are marked');
  await wait(800);
  await smoothScroll(900, 3800);
  await wait(800);
});

// 8. Close
await scene('close', async () => {
  const home = await page.$('header .a-name, .a-name');
  if (home) await clickClear(home);
  await page.evaluate(() => scrollTo(0, 0));
  await caption('Damage map · counts · search hot spots · reports · all offline', "A model's estimate, to be checked by people on the ground");
  await wait(3600);
});

await browser.close();
fs.writeFileSync(path.join(OUT, 'scenes.json'), JSON.stringify({ scenes, errors, hosts: [...requests] }, null, 1));
console.log(`page errors: ${errors.length} ${errors.slice(0, 3).join(' / ')}\nhosts contacted: ${[...requests].join(', ')}`);
