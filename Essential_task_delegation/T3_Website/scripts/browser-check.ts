// Opens each page of a running build in headless Chrome and:
//   - saves full-page screenshots at 390 px and 1440 px to checks/screenshots/;
//   - records every network request and fails if one leaves 127.0.0.1 (the offline rule);
//   - fails on console errors and on horizontal overflow at 390 px;
//   - clicks a building and a count on the map and checks the inspector answers;
//   - zooms and drags the map, hides an outline, searches the list and folds a panel, and checks
//     that each does what it says and nothing else (counts stay, the click reaches the right building);
//   - checks what "Print this report" puts on paper, and saves it as checks/report-print.pdf.
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
const PAGES = (process.env.PAGES ?? '/,/how,/explore,/try,/results,/reports,/about').split(',');
const WIDTHS = [390, 1440];
const problems: string[] = [];
// Scroll a target to the middle of the screen before clicking it, so a sticky header can't cover it.
const centre = (el: import('puppeteer-core').ElementHandle) => el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
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

    if (route === '/explore' && width === 1440) {
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

      // Zoom: the frame shows part of the image, and a click still reaches the building under it.
      const viewBox = () => page.$eval('.ws .oc-stage svg', (el) => el.getAttribute('viewBox')!.split(' ').map(Number));
      const full = await viewBox();
      const zoomIn = await page.$('.ws .oc-zoom button[aria-label="Zoom in"]');
      if (!zoomIn) problems.push(`${route}: the map has no zoom buttons`);
      else {
        const stageEl = (await page.$('.ws .oc-stage'))!;
        const scrollY = () => page.evaluate(() => window.scrollY);
        // A point on the map away from the slider's handle (the middle) and the zoom buttons (top right).
        const spot = async () => { const b = (await stageEl.boundingBox())!; return { x: b.x + b.width * 0.3, y: b.y + b.height * 0.5 }; };

        // A plain wheel scrolls the page and leaves the map alone; the map then says which key zooms.
        await centre(stageEl);
        let at = await spot();
        await page.mouse.move(at.x, at.y);
        let y0 = await scrollY();
        await page.mouse.wheel({ deltaY: 120 });
        await wait(400);
        const hint = await page.$eval('.ws .oc-hint', (el) => el.textContent ?? '').catch(() => '');
        if ((await viewBox()).join(' ') !== full.join(' ')) problems.push(`${route}: a plain wheel zoomed the map (view ${(await viewBox()).join(' ')})`);
        if ((await scrollY()) - y0 < 1) problems.push(`${route}: a plain wheel over the map didn't scroll the page`);
        if (!/scroll to zoom/.test(hint)) problems.push(`${route}: after a plain wheel the map doesn't say which key zooms (got "${hint}")`);

        // With Ctrl held, the wheel zooms about the pointer, and the page stays where it is.
        await centre(stageEl);
        at = await spot();
        await page.mouse.move(at.x, at.y);
        y0 = await scrollY();
        await page.keyboard.down('Control');
        for (let i = 0; i < 3; i++) { await page.mouse.wheel({ deltaY: -120 }); await wait(60); }
        await page.keyboard.up('Control');
        await wait(300);
        const wheeled = await viewBox();
        if (!(wheeled[2] < full[2] * 0.7)) problems.push(`${route}: Ctrl with three wheel steps left the view ${wheeled[2]} px wide, of ${full[2]}`);
        if (Math.abs((await scrollY()) - y0) > 1) problems.push(`${route}: Ctrl with the wheel also scrolled the page`);
        const under = (v: number[]) => [v[0] + 0.3 * v[2], v[1] + 0.5 * v[3]];
        if (Math.abs(under(wheeled)[0] - under(full)[0]) > 3 || Math.abs(under(wheeled)[1] - under(full)[1]) > 3)
          problems.push(`${route}: the wheel zoom moved the point under the pointer from ${under(full).map(Math.round)} to ${under(wheeled).map(Math.round)}`);
        const fit = (await page.$('.ws .oc-zoom button[aria-label="Show the whole image"]'))!;
        await centre(fit);
        await fit.click();
        await wait(500);

        // The buttons. First the slider goes to one side, so its handle isn't over the middle of the map.
        const range = await page.$('.ws .oc-slider input');
        if (range) { await range.focus(); await page.keyboard.press('Home'); }
        await centre(zoomIn);
        await zoomIn.click();
        await wait(400);
        await zoomIn.click();
        await wait(500);
        const zoomed = await viewBox();
        if (!(zoomed[2] < full[2] * 0.5)) problems.push(`${route}: two presses of "Zoom in" left the view ${zoomed[2]} px wide, of ${full[2]}`);
        // The whole frame on the screen, and no scrolling from here to the end of the drag: the points below are screen positions.
        await centre(stageEl);

        // A building outside the zoomed view, chosen from the list, is brought into it.
        await page.$$eval('.ws-left .ws-blist', (els) => els.forEach((e) => { (e as HTMLDetailsElement).open = true; }));
        const outside = await page.evaluate(() => {
          const s = document.querySelector('.ws .oc-stage')!.getBoundingClientRect();
          for (const g of document.querySelectorAll<SVGGElement>('.ws .oc-b.is-pickable:not(.is-sel)')) {
            const r = g.getBoundingClientRect();
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            const off = x < s.left || x > s.right || y < s.top || y > s.bottom;
            if (off && r.width >= 14 && r.height >= 14 && r.width <= 220 && r.height <= 220) return g.dataset.building ?? null;
          }
          return null;
        });
        const pressed = outside !== null && await page.evaluate((id) => {
          for (const b of document.querySelectorAll<HTMLButtonElement>('.ws-left .ws-blist li button:not(.ws-eye)')) {
            if (b.querySelector('span')?.textContent === `Building ${id}`) { b.click(); return true; }
          }
          return false;
        }, outside);
        await wait(700);
        const brought = await viewBox();
        // A clear point on that building: inside the frame, with nothing of the page over it, and inside the
        // building's own shape. While it is selected, its thicker outline also answers to the pointer, but a point
        // on that outline alone is no longer on the building once it is deselected (found on the real gallery, 18 Nov).
        const target = outside === null ? null : await page.evaluate((id) => {
          const s = document.querySelector('.ws .oc-stage')!.getBoundingClientRect();
          const g = document.querySelector<SVGGElement>(`.ws .oc-b[data-building="${id}"]`);
          if (!g) return null;
          const shape = g.querySelector<SVGGeometryElement>('path, polygon');
          const inShape = (x: number, y: number) => {
            const m = shape?.getScreenCTM();
            if (!shape || !m) return true;
            return shape.isPointInFill(new DOMPoint(x, y).matrixTransform(m.inverse()));
          };
          const r = g.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const inFrame = cx > s.left && cx < s.right && cy > s.top && cy < s.bottom;
          for (let i = 0; i < 49; i++) {
            const x = r.left + ((i % 7) + 0.5) * (r.width / 7), y = r.top + (Math.floor(i / 7) + 0.5) * (r.height / 7);
            if (x < s.left + 6 || x > s.right - 6 || y < s.top + 6 || y > s.bottom - 6) continue;
            if (document.elementFromPoint(x, y)?.closest('.oc-b') === g && inShape(x, y)) return { id, inFrame, x, y };
          }
          return { id, inFrame, x: -1, y: -1 };
        }, outside);
        if (outside === null) problems.push(`${route}: every building is inside the zoomed frame, so choosing one from the list could not be tested`);
        else if (!pressed || !target || !target.inFrame || brought.join(' ') === zoomed.join(' '))
          problems.push(`${route}: choosing building ${outside} from the list didn't bring it into the zoomed view (view ${brought.map(Math.round).join(' ')}, was ${zoomed.map(Math.round).join(' ')})`);
        else if (target.x < 0) problems.push(`${route}: building ${outside} was brought into view, but no clear point on it could be found to click`);
        else {
          await page.mouse.move(target.x, target.y);
          await wait(300);
          const tip = await page.$eval('.ws .oc-tip', (el) => ((el as HTMLElement).hidden ? '' : el.textContent ?? ''));
          if (!tip.includes(`Building ${target.id}`)) problems.push(`${route}: the card beside the pointer says "${tip.slice(0, 60)}" over building ${target.id}`);
          await page.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-zoomed-tip.png`) });
          // It is selected already (chosen from the list): one click on it clears that, a second selects it again.
          await page.mouse.click(target.x, target.y);
          const cleared = await page.$eval('.ws .oc-readout', (el) => el.textContent ?? '');
          if (/Building \d/.test(cleared)) problems.push(`${route}: a click on the selected building ${target.id} in the zoomed map left "${cleared.slice(0, 60)}"`);
          await page.mouse.click(target.x, target.y);
          const said = await page.$eval('.ws .oc-readout', (el) => el.textContent ?? '');
          if (!said.includes(`Building ${target.id}`)) problems.push(`${route}: a click on building ${target.id} in the zoomed map selected "${said.slice(0, 60)}"`);
          // A drag moves the zoomed view, and its end must not select or deselect anything.
          // It pulls towards the image's middle, so a view at an edge still has room to move.
          const dx = brought[0] + brought[2] / 2 > full[2] / 2 ? 90 : -90;
          const dy = brought[1] + brought[3] / 2 > full[3] / 2 ? 40 : -40;
          await page.mouse.move(target.x, target.y);
          await page.mouse.down();
          await page.mouse.move(target.x + dx, target.y + dy, { steps: 8 });
          await page.mouse.up();
          await wait(200);
          const moved = await viewBox();
          if (Math.abs(moved[0] - brought[0]) < 1 && Math.abs(moved[1] - brought[1]) < 1) problems.push(`${route}: dragging the zoomed map didn't move it`);
          const after = await page.$eval('.ws .oc-readout', (el) => el.textContent ?? '');
          if (after !== said) problems.push(`${route}: the end of a drag changed the selection (from "${said.slice(0, 40)}" to "${after.slice(0, 40)}")`);
        }
        await (await page.$('.ws .oc-zoom button[aria-label="Show the whole image"]'))!.click();
        await wait(500);
        const back = await viewBox();
        if (back.join(' ') !== full.join(' ')) problems.push(`${route}: "Show the whole image" left the view at ${back.join(' ')}`);
      }

      // Hide: one outline leaves the map; the table, and so every count, stays as it was.
      await page.$$eval('.ws-left .ws-blist', (els) => els.forEach((e) => { (e as HTMLDetailsElement).open = true; }));
      const counts = () => page.$$eval('.ws-bottom .ws-countbtn', (els) => els.map((e) => e.getAttribute('data-count')).join(' '));
      const drawn = () => page.$$eval('.ws .oc-b', (els) => els.length);
      const eye = await page.$('.ws-left .ws-blist .ws-eye');
      if (!eye) problems.push(`${route}: the buildings list has no hide buttons`);
      else {
        const [countsBefore, drawnBefore] = [await counts(), await drawn()];
        await centre(eye);
        await eye.click();
        if ((await drawn()) !== drawnBefore - 1) problems.push(`${route}: hiding one building changed the outlines on the map from ${drawnBefore} to ${await drawn()}`);
        if ((await counts()) !== countsBefore) problems.push(`${route}: hiding a building changed the counts from ${countsBefore} to ${await counts()}`);
        const note = await page.$eval('.ws-hidden-note', (el) => el.textContent ?? '').catch(() => '');
        if (!note.startsWith('1 outline is hidden')) problems.push(`${route}: the panel doesn't say that an outline is hidden (got "${note.slice(0, 60)}")`);
        await (await page.$('.ws-left'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-hidden.png`) });
        await (await page.$('.ws-hidden-note button'))?.click();
        if ((await drawn()) !== drawnBefore) problems.push(`${route}: "Show all" brought back ${await drawn()} of ${drawnBefore} outlines`);
      }

      // Search: the list keeps the buildings whose number starts with the digits typed; letters are dropped.
      const someId = await page.$eval('.ws-left .ws-blist li button span', (el) => (el.textContent ?? '').replace(/\D/g, '')).catch(() => '');
      const search = await page.$('.ws-search input');
      if (!search || !someId) problems.push(`${route}: the buildings list has no search box`);
      else {
        await centre(search);
        await search.type(`${someId[0]}x`);
        const typed = await search.evaluate((el) => (el as HTMLInputElement).value);
        const ids = await page.$$eval('.ws-left .ws-blist li button:first-child span:first-child', (els) => els.map((e) => (e.textContent ?? '').replace(/\D/g, '')));
        if (typed !== someId[0]) problems.push(`${route}: the search box kept "${typed}" after "${someId[0]}x" was typed`);
        if (!ids.length || ids.some((id) => !id.startsWith(someId[0]))) problems.push(`${route}: a search for ${someId[0]} lists buildings ${ids.slice(0, 8).join(', ')}`);
        await (await page.$('.ws-left'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-search.png`) });
        await search.press('Backspace');
      }

      // Fold: a side panel shrinks to its title and comes back.
      const fold = await page.$('.ws-left .ws-fold');
      if (!fold) problems.push(`${route}: the layers panel can't be folded`);
      else {
        await centre(fold);
        await fold.click();
        const width = await page.$eval('.ws-left', (el) => el.getBoundingClientRect().width);
        if (width > 80) problems.push(`${route}: the folded layers panel is still ${Math.round(width)} px wide`);
        await (await page.$('.ws'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-folded.png`) });
        await fold.click();
        if (!(await page.$eval('.ws-left > details', (d) => (d as HTMLDetailsElement).open))) problems.push(`${route}: the folded layers panel didn't open again`);
      }

      // The 3D damage city: the same buildings as blocks; clicking one opens the same facts.
      const viewBtn = (await page.$$('.ws-view button'))[1];
      await centre(viewBtn);
      await viewBtn.click();
      const blocks = await page.$$('.city .city-b');
      if (!blocks.length) problems.push(`${route}: the 3D view drew no blocks`);
      else {
        const top = (await blocks[blocks.length - 1].$('.city-top'))!;
        await centre(top);
        await top.click();
        const readout = await page.$eval('.city .oc-readout', (el) => el.textContent ?? '');
        if (!/Building \d+/.test(readout)) problems.push(`${route}: clicking a block didn't show its facts (got "${readout.slice(0, 80)}")`);
        if (!(await page.$eval('.city-note', (el) => el.textContent ?? '')).includes('not a reconstruction')) problems.push(`${route}: the 3D view lacks its "not a reconstruction" label`);

        // The 3D view from the keyboard alone: the list selects a block, the slider turns the view,
        // and the inspector's switch hides and shows the selected block without losing the focus.
        const row = await page.$('.ws-left .ws-blist li button:not(.ws-eye):not([aria-pressed="true"])');
        if (!row) problems.push(`${route}: no building in the list to choose from the keyboard`);
        else {
          const id = await row.evaluate((el) => (el.querySelector('span')?.textContent ?? '').replace(/\D/g, ''));
          await row.focus();
          await page.keyboard.press('Enter');
          const said = await page.$eval('.city .oc-readout', (el) => el.textContent ?? '');
          const marked = await page.$$eval('.city .city-b.is-sel', (els) => els.length);
          if (!said.includes(`Building ${id}`) || marked !== 1) problems.push(`${route}: Enter on building ${id} in the list marked ${marked} block(s) and the line says "${said.slice(0, 50)}"`);
          const slider = (await page.$('.city .oc-slider input'))!;
          const turn = () => slider.evaluate((el) => (el as HTMLInputElement).value);
          const turnBefore = await turn();
          await slider.focus();
          await page.keyboard.press('ArrowRight');
          if ((await turn()) === turnBefore) problems.push(`${route}: the arrow key didn't turn the 3D view`);
          const buildingTab = (await page.$$('.ws-right .ws-tabs button'))[0];
          await buildingTab.focus();
          await page.keyboard.press('Enter');
          const hide = await page.$('.ws-right .ws-hide-one');
          if (!hide) problems.push(`${route}: the inspector has no switch to hide the selected building`);
          else {
            const blocksBefore = await page.$$eval('.city .city-b', (els) => els.length);
            await hide.focus();
            await page.keyboard.press('Enter');
            const blocksHidden = await page.$$eval('.city .city-b', (els) => els.length);
            const stillFocused = await page.evaluate(() => document.activeElement?.classList.contains('ws-hide-one') ?? false);
            const label = await page.$eval('.ws-right .ws-hide-one', (el) => el.textContent ?? '').catch(() => '');
            if (blocksHidden !== blocksBefore - 1 || !stillFocused || !label.startsWith('Show its outline')) problems.push(`${route}: hiding the selected building from the keyboard left ${blocksHidden} of ${blocksBefore} blocks, focus ${stillFocused ? 'kept' : 'lost'}, button "${label}"`);
            await page.keyboard.press('Enter');
            if ((await page.$$eval('.city .city-b', (els) => els.length)) !== blocksBefore) problems.push(`${route}: showing the hidden building again didn't bring its block back`);
          }
        }
      }
      await (await page.$('.ws-map'))!.screenshot({ path: path.join(OUT, `${route.slice(1)}-1440-city.png`) });
    }

    if (route === '/explore' && width === 390) {
      // On a phone: zoomed, and with the layers panel folded, the page is still no wider than the screen.
      const zoomIn = await page.$('.ws .oc-zoom button[aria-label="Zoom in"]');
      if (zoomIn) { await centre(zoomIn); await zoomIn.click(); await wait(500); }
      const fold = await page.$('.ws-left .ws-fold');
      if (fold) { await centre(fold); await fold.click(); }
      const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (wide > 1) problems.push(`${route} @${width}: zoomed and folded, the page is ${wide} px wider than the screen`);
      if (!(await page.$('.ws .oc-stage.is-zoomed'))) problems.push(`${route} @${width}: "Zoom in" didn't zoom the map`);
      await page.screenshot({ path: path.join(OUT, `${name}-zoomed-folded.png`), fullPage: true });
    }

    if (route === '/reports' && width === 1440) {
      // Print: the button marks the page for the report alone; then read what would be on the paper.
      await page.evaluate(() => { window.print = () => { (window as any).__printing = document.documentElement.dataset.printing; }; });
      const printBtn = await page.evaluateHandle(() => [...document.querySelectorAll('.ws-actions button')].find((b) => b.textContent === 'Print this report') ?? null);
      const button = printBtn.asElement() as import('puppeteer-core').ElementHandle<Element> | null;
      if (!button) problems.push(`${route}: no "Print this report" button`);
      else {
        await centre(button);
        await button.click();
        if ((await page.evaluate(() => (window as any).__printing)) !== 'report') problems.push(`${route}: "Print this report" didn't mark the page for printing the report alone`);
        await page.evaluate(() => { document.documentElement.dataset.printing = 'report'; });
        await page.emulateMediaType('print');
        const paper = await page.evaluate(() => document.body.innerText);
        for (const must of ['A model\'s estimate, to be checked by people on the ground.', 'Section 13, Group 5', 'six ground photos from Wajima', 'Mode: offline, fixed flow', 'Also known about this report'])
          if (!paper.includes(must)) problems.push(`${route}: the printed report lacks "${must}"`);
        for (const mustNot of ['How it works', 'Proof that the run stayed offline', 'Download this report', 'What the guidelines gave this report'])
          if (paper.includes(mustNot)) problems.push(`${route}: the printed report also carries "${mustNot}"`);
        await page.pdf({ path: path.join(OUT, '..', 'report-print.pdf'), format: 'A4' });
        await page.emulateMediaType('screen');
      }
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
console.log('no console errors, no overflow at 390 px; building click, count, fixed question, the wheel with and without Ctrl, zoom buttons, a building brought into view from the list, drag, hide, search, fold, the 3D view from the keyboard and the printed report all behaved');
