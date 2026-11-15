// Opens each page of a running build in headless Chrome and:
//   - saves full-page screenshots at 390 px and 1440 px to checks/screenshots/;
//   - records every network request and fails if one leaves 127.0.0.1 (the offline rule);
//   - fails on console errors and on horizontal overflow at 390 px;
//   - clicks a building and a count on the map and checks the inspector answers.
//
//   npm run preview:fixtures            (in one terminal)
//   node scripts/browser-check.ts       (in another; BASE_URL and CHROME_PATH can be set)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'checks', 'screenshots');
const PAGES = (process.env.PAGES ?? '/,/a,/b,/c').split(',');
const WIDTHS = [390, 1440];
const problems: string[] = [];
// Scroll a target to the middle of the screen before clicking it, so a sticky header can't cover it.
const centre = (el: import('puppeteer-core').ElementHandle) => el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
const requests = new Set<string>();

fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--hide-scrollbars'] });
for (const route of PAGES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width === 390 ? 844 : 900, deviceScaleFactor: 1 });
    page.on('request', (r) => { if (!r.url().startsWith('data:')) requests.add(r.url()); });
    page.on('console', (m) => { if (m.type() === 'error') problems.push(`${route} @${width}: console error: ${m.text()}`); });
    page.on('pageerror', (e) => problems.push(`${route} @${width}: page error: ${(e as Error).message}`));
    page.on('requestfailed', (r) => problems.push(`${route} @${width}: request failed: ${r.url()}`));
    await page.goto(BASE + route, { waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 2600)); // let the opening slider sweep finish
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`${route} @${width}: the page is ${overflow} px wider than the screen`);
    const name = `${route === '/' ? 'index' : route.slice(1)}-${width}`;
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
    await page.screenshot({ path: path.join(OUT, `${name}-fold.png`) });

    if (route !== '/' && width === 1440) {
      // The 3-minute test, by machine: click a building, read its facts; press a count; run a fixed question.
      const pickable = await page.$('.ws .oc-b.is-pickable path');
      if (!pickable) problems.push(`${route}: no clickable building on the map`);
      else {
        await centre(pickable);
        await pickable.hover();
        await new Promise((r) => setTimeout(r, 500));
        await (await page.$('.ws-map'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-crosshair.png`) });
        await centre(pickable);
        await pickable.click();
        const facts = await page.$eval('.ws-right .ws-facts', (el) => el.textContent ?? '').catch(() => '');
        if (!/Area\s*[\d,]+ px/.test(facts)) problems.push(`${route}: clicking a building didn't show its area (got "${facts.slice(0, 80)}")`);
        await (await page.$('.ws'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-building-selected.png`) });
      }
      const countBtn = (await page.$$('.ws-bottom .ws-countbtn'))[3];
      if (countBtn) {
        await centre(countBtn);
        await countBtn.click();
        const dimmed = await page.$$eval('.ws .oc-b.is-dim', (els) => els.length);
        const lit = await page.$$eval('.ws .oc-b:not(.is-dim)', (els) => els.length);
        const count = await countBtn.evaluate((el) => el.getAttribute('data-count'));
        if (count !== String(lit)) problems.push(`${route}: the count button says ${count} but ${lit} buildings are highlighted (${dimmed} dimmed)`);
      }
      const tabs = await page.$$('.ws-right .ws-tabs button');
      if (tabs[1]) { await centre(tabs[1]); await tabs[1].click(); }
      const templates = await page.$$('.fq-templates button');
      if (templates[1]) { await centre(templates[1]); await templates[1].click(); }
      const answer = await page.$eval('.fq-result', (el) => el.textContent ?? '').catch(() => '');
      if (!/\d+ buildings?|no destroyed building/.test(answer)) problems.push(`${route}: the distance question gave no answer (got "${answer}")`);
      await (await page.$('.ws'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-question.png`) });
    }
    await page.close();
  }
}
await browser.close();

const outside = [...requests].filter((u) => new URL(u).hostname !== '127.0.0.1');
fs.writeFileSync(path.join(OUT, '..', 'network-log.json'), JSON.stringify({ base: BASE, pages: PAGES, requests: [...requests].sort(), outside }, null, 1));
if (outside.length) problems.push(`${outside.length} request(s) left 127.0.0.1: ${outside.slice(0, 5).join(', ')}`);
console.log(`${PAGES.length} page(s) x ${WIDTHS.length} widths; ${requests.size} distinct requests, ${outside.length} outside 127.0.0.1`);
if (problems.length) { console.error(`${problems.length} problem(s):\n` + problems.map((p) => '  - ' + p).join('\n')); process.exit(1); }
console.log('no console errors, no overflow at 390 px, building click, count and fixed question all answered');
