# T3 website

The showcase website of Group 5 (NSU, CSE499B, Section 13): an offline system that maps disaster damage from before-and-after satellite images. It is a static site: Vite, React 19, TypeScript and Tailwind 4. The same build is served by Vercel for the public and, later, by a local API at the booth.

- **Status (17 Nov 2026):** all three phases are built. The site has seven pages in the chosen look (direction A): Home `/`, How it works `/how`, Explore `/explore` (the building map and the 3D damage city), Try it `/try` (the field model in the visitor's browser), Results `/results` (charts), Reports `/reports` and About `/about`. Added on 17 Nov: zoom, pan, hide, search and folding panels on the building map, a card beside the pointer, print for a report, the rest of the reports' known problems, and a design and accessibility pass over every page. Still open: the real gallery export (the site runs on development fixtures until then), the tests on the booth laptop and a phone (steps below), and the first deploy.
- **Who builds it now:** Abrar until 17 Nov; Aryan Sami takes over what's left from 18 Nov. His handover, with the rules, file paths and order of work: [../Aryan_Task/T3_Website_Handover.md](../Aryan_Task/T3_Website_Handover.md).
- **Where it began:** the map workspace started as Aryan Sami's prototype (`../Aryan_Task/Website/`), reworked to our data. His folder is unchanged. What changed from it and why, file by file: [the handover, section 3](../Aryan_Task/T3_Website_Handover.md#3-what-changed-from-your-prototype-and-why).
- **Related files:** [NOTES.md](NOTES.md) (what was understood, contradictions found, open questions) and [DATA_CONTRACT.md](DATA_CONTRACT.md) (the files the gallery export must write).

## Run it

Requirements: Node 22.18 or later (the scripts are TypeScript files that Node runs directly; built with Node 26), and npm.

```text
npm install
npm run fixtures      # once: makes development fixtures from the repository's results files
npm run dev           # http://127.0.0.1:3000, serving the fixtures while public/data/ is empty
```

| Command | What it does |
|---|---|
| `npm run dev` | The dev server. It serves the fixtures at `/data/` only while the real gallery is empty. |
| `npm run build` | The release build into `dist/`. First it runs the five checks below; any failure stops the build. |
| `npm run validate` | Checks `public/data/` against the data contract and writes its `index.json`. |
| `npm run facts` | Checks the facts file against its source files and the anchors, and lists sources git doesn't track. |
| `npm run guidelines` | Checks that `public/guidelines/searches.json` (the proof run's 18 guideline searches and their passages) is word for word from its sources. `node scripts/make-guidelines.ts` rebuilds it. |
| `npm run palette` | Checks the damage colours under simulated colour-vision deficiencies. |
| `npm run selfcheck` | Self-checks of the building table, the outlines, the fixed queries, the map's zoom and pan arithmetic, event names, and the reports' marks (every marked phrase is still in a report; no two marks overlap). |
| `npm run typecheck`, `npm run lint` | TypeScript and ESLint. |
| `npm run build:fixtures`, `npm run preview:fixtures` | A build with the fixtures, into `dist-fixtures/`, and a local server for it on port 4173. For review only. |
| `npm run browser-check` | With `preview:fixtures` running: screenshots of all seven pages at 390 px and 1440 px, a network log, and a click-through of the map (click, count, question, the wheel with and without Ctrl, zoom, a building chosen from the list while zoomed, drag, hide, search, fold), of the 3D view from the keyboard alone, and of what "Print this report" puts on paper (saved as `checks/report-print.pdf`), into `checks/`. |
| `npm run check:model` | With `npm run preview` running (the normal build, port 4173): runs the field model through the Try it page's file input and compares its mask with a native run, pixel by pixel. See "The model in the browser". |
| `npm run check:heatmap` | Compares the browser's heatmap code with the heatmap notebook's saved outputs. Takes about a minute; `-- --all` runs all 645 images. |
| `npm run check:model-file` | Fails if the field model isn't at `public/model/` with the right size. |
| `npm run deploy:check` | Everything a deploy needs to pass, with unpushed sources or a missing model file as an error. |

## Where every number comes from

- **One file holds every number on the site:** [src/data/facts.json](src/data/facts.json). Each fact has its value, what it measures in plain words, the set of images it was measured on, its model, its source file in this repository, and the date it becomes public (`public_from`).
- **Each fact carries `find` strings:** exact text that must be in its source file. `npm run facts` fails if one isn't there, so every number can be traced by a text search.
- **Facts not public yet are left out of the build.** The build drops every fact whose `public_from` is after the build date, so the text isn't in the published files at all. To preview a later date: `FACTS_DATE=2026-11-18 npm run build:fixtures`.
- **Sources link to GitHub.** `npm run facts` lists every linked file that git doesn't track yet. Push those before deploying, or their links are dead.
- **Pages read facts with `fact(id)`** from `src/core/facts.ts`, and must work when it returns nothing.

## Where the gallery comes from

- The gallery is read from `public/data/`, in the shape of [DATA_CONTRACT.md](DATA_CONTRACT.md). Until the export lands the folder is empty, and the site says it has no pairs.
- **Fixtures** stand in during development: four real validation pairs with the after-image-only U-Net's output. They are marked, kept outside `public/`, and refused by the release build (contract, section 5).
- **What is an illustration:** only the heights in the 3D damage city (`src/components/DamageCity.tsx`). The model measures no heights, so a block's height only repeats its class, and the view says so on screen: "A 3D view of our 2D results, not a reconstruction." Nothing else is: the site has no invented places, buildings, numbers or reports.

## The model in the browser (Try it)

The Try it page runs the field model on the visitor's own image, on their device. Nothing is uploaded.

- **What runs:** the 8-bit after-image-only U-Net (`r9_int8_static_keep1_3.onnx`, 33.1 MB) in ONNX Runtime Web 1.20.1 on WebAssembly, pinned to that exact version in `package.json`. The model and the runtime's two files are served from this site (`/model/`, `/ort/`), never from a CDN. The model is downloaded only when the visitor presses Run, with its size and progress shown.
- **One config:** [src/core/modelConfig.ts](src/core/modelConfig.ts) holds the file, its size, the input size, the normalisation and which photos the model reads. A before-and-after export needs `images: ['before', 'after']` and the new file there; the page then asks for two photos.
- **Where the work happens:** [src/core/segment.worker.ts](src/core/segment.worker.ts) (a worker, so the page stays usable): model, then the mask, then the building table with the same code as the gallery ([buildings.ts](src/core/buildings.ts)), then the heatmap ([heatmap.ts](src/core/heatmap.ts)). The page ([src/components/TryItRunner.tsx](src/components/TryItRunner.tsx)) shows the result in the same building map as Explore.
- **A picture that isn't 1024 x 1024:** the middle square is cut out and resized to 1024 x 1024, and the page says exactly that, with the sizes.
- **The moving background is hidden while the model runs.** With it drawing, a run took 6.1 to 6.6 s in our test instead of 4.1 to 5.2 s.

**Measured on this PC (16 Nov, 20 threads, headless Chrome), with `npm run check:model`:**

| Check | Pass rule | Result |
|---|---|---|
| Same class as the native run (ONNX Runtime Node 1.20.1) on the October test image, `hurricane-harvey_00000099_post_disaster.png`, fed through the page's file input | at least 99.9% of pixels | 100% (0 of 1,048,576 pixels differ); the native run's class counts equal October's |
| Time for the model per image after the first run | reported | 4.1 to 5.2 s over two runs of the check (first run 5.4 s, plus the download). Timings vary between runs on the same PC, as in October (2.1 to 5.5 s) |
| Requests leaving 127.0.0.1 during a run | none | none |
| Heatmap code against the notebook's version 3 outputs, from the same masks (`npm run check:heatmap`) | every map pixel within 1 grey level of 255; every hot spot and safe area identical | 23 images, 4,521,984 pixels: 5 differ, each by 1 level; 51 hot spots and 63 safe areas identical |

Also run once by hand on 16 Nov: the same check against the dev server (`npm run dev`: 100% of pixels); a 1,600 x 1,200 JPEG (the page says the middle 1,200 x 1,200 square was cut out and shrunk, and a result appears); and a gallery photo through the "or use a gallery photo" buttons (the result is labelled as a gallery photo, never as the visitor's own image).

Run again on 17 Nov, after the building map's changes (the result view is the same map): `npm run check:model` gave 100% of pixels again, at 3.1 to 3.3 s per image after the first run (4.4 s); the JPEG and the gallery photo behaved as on 16 Nov; and on a result, zooming worked and hiding one outline left the counts as they were.

The full result of the last run is in `checks/browser-model.json` (git-ignored).

**To repeat the test on the booth laptop:**

1. Install Node 22.18 or later and Chrome. Copy the repository (or `git pull`).
2. Copy `Essential_task_delegation/Champion_Task/L1B-results/L1b/r9_int8_static_keep1_3.onnx` into `T3_Website/public/model/`.
3. Copy one 1024 x 1024 xBD after-image to the laptop (the October test used `hurricane-harvey_00000099_post_disaster.png` from xBD's `train/images`).
4. In `T3_Website/`: `npm ci`, then `npm run build`, then `npm run preview` (leave it running).
5. In a second terminal, in PowerShell: `$env:IMAGE = "C:\path\to\hurricane-harvey_00000099_post_disaster.png"; npm run check:model`
6. Send back the printed block (or `checks/browser-model.json`). It must end with "browser and native runs agree on ...% of pixels". Note the laptop's processor and whether it was on battery.
7. By hand as well: open http://127.0.0.1:4173/try in Chrome and in Edge, choose the image, press Run, and note the seconds the page prints.

**To test on a mid-range phone:** a phone needs HTTPS for several threads, so it is tested on the deployed site.

1. Deploy (section "Deploying to Vercel").
2. On the phone, open the site's `/try` page in Chrome (Android) or Safari (iPhone), on Wi-Fi.
3. Choose a satellite photo (send the test image to the phone first), press Run, and wait for "Done".
4. Write down what the page prints: the seconds for the model, the number of threads, and the seconds for the buildings and the heatmap. One thread means the two isolation headers didn't arrive.
5. Run it twice more and note the later times. If the tab reloads or the page says the model could not run, the phone ran out of memory: note the phone's model and RAM.
6. Check the result: the building counts under the map, a tap on a building, and "Download the raw mask".

## The building map (Explore, and a Try it result)

Five things from Aryan Sami's prototype came back on 17 Nov, built on the real building table:

- **Zoom and pan** on the flat map: the three buttons on the map, Ctrl (⌘ on a Mac) with the wheel, a two-finger pinch, and a drag once zoomed.
  - A plain wheel still scrolls the page; the map then says which key to hold.
  - From the keyboard: the zoom buttons, `+` and `-`, and the arrow keys while a zoom button has the focus. A building chosen from the list is brought into a zoomed view.
  - The view stays in image pixels ([src/core/view.ts](src/core/view.ts)), so the crosshair still reads true positions. The before/after line stays at its place on the screen.
- **A card beside the pointer** with the facts of the building under a mouse, on the flat map and the 3D view ([BuildingTip.tsx](src/components/BuildingTip.tsx)). A touch screen has no pointer to follow: a tap selects the building, and its line shows under the map.
- **Hide and search in the buildings list.** The eye hides one outline; the search keeps the buildings whose number starts with the digits typed (buildings have no names).
  - Both change only what is shown. Counts, answers and the saved picture always use the whole table, and the panel says how many outlines are hidden.
  - The eyes are out of the Tab order, so the list stays one stop a building. From the keyboard the same switch is the "Hide its outline on the map" button under the selected building's facts.
- **Folding side panels:** each panel folds to its title ("Hide", "Show").
- **Print for a report:** see the next section.

## The six reports

`public/reports/offline/` holds the six reports of the 11 Nov proof run, byte for byte as in `../Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/`. The site never edits them.

- **What is known to be wrong is listed in [src/core/reportNotes.ts](src/core/reportNotes.ts),** following the report system's own README ("Practice run 5", "Quality problems"):
  - 14 wrong phrases, marked wherever they occur in a report;
  - 8 notes for problems with no single phrase to mark (something left out, a repeated section, the run's labelled map), listed under the report.
- **To add one:** check it against the report text and the run's files first. `npm run selfcheck` fails if a marked phrase is in no report, or if two marks overlap.
- **"Print this report"** (on the Reports page) prints the chosen report alone, with the page's four caveats above it, its marks and notes, each link's address, and the decision-support line. A printed sheet travels without the page, so it carries what the page says around the report.
- **Any page can be printed:** on paper the dark look turns to dark ink on white.

## Third-party component source

`src/vendor/react-bits/` holds three components copied as source from [React Bits](https://reactbits.dev), with its licence beside them (MIT with the Commons Clause: free to use in a website, not to resell as components). They need no extra package and make no network request.

| Component | Where it is used | What it shows |
|---|---|---|
| `Crosshair` | On the building map, for a mouse | The pointer's position in image pixels, and brackets around the building under it. Changed here to report image pixels instead of screen pixels, from the corner of a zoomed view (noted at the top of the file). |
| `Counter` | The counts under the map | The digits roll to the new value when the pair changes: each image has its own counts. Unchanged. |
| `Topography` | Behind the top of every page, on screens 760 px and wider | Slow contour lines of a landscape, the language of maps. It is atmosphere only, so it is set quiet: thin blue-grey lines, dimmer on pages other than Home. It answers the pointer gently (the ground swells a little under it, the view leans a few degrees); clicks do nothing. Hidden while the in-browser model runs. Unchanged source. |

- Both respect the reduced-motion setting.
- To add another: download `https://reactbits.dev/r/<Component>-TS-CSS.json`, read the source, and copy it into this folder with a note of any change. Take a component only if its motion shows something; the site's rule is that motion must explain, or it goes.
- The folder is left out of ESLint, so the copied source stays close to how it was published. It is still type-checked.

## Rules the code keeps

- **No request leaves our origin:** no CDN, web font, analytics, map tile or outside service. Fonts are npm packages bundled into the build.
- **Cross-origin isolation:** every response carries `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` (`vite.config.ts` for local servers, `vercel.json` in production). Without them the in-browser model runs on one thread.
- **Missing is never zero:** a missing table, distance or file is shown as missing.
- **Plain words on the page:** internal run names appear only in source links.
- **Damage colours** live in `src/core/palette.ts` and nowhere else.

## Deploying to Vercel (by hand, from this PC)

These steps are written but have not been run yet: they need Abrar's Vercel login.

Nothing goes public from a push to GitHub. The project is not connected to the repository, and `vercel.json` also turns git deployments off.

1. **Once: install and log in.**
   ```text
   npm install --global vercel
   vercel login
   ```
2. **Once: link this folder to a Vercel project.** In `Essential_task_delegation/T3_Website/`:
   ```text
   vercel link
   ```
   - Create a new project when asked. Don't connect a Git repository.
   - It writes `.vercel/`, which is git-ignored.
3. **Put the gallery in place.** Copy the export into `public/data/` (see the data contract).
4. **Put the field model in place.** Copy `../Champion_Task/L1B-results/L1b/r9_int8_static_keep1_3.onnx` to `public/model/`. It is never in git: `*.onnx` is ignored for the whole repository. `deploy:check` fails without it; a site deployed without it still works, and its Try it page says the model isn't part of that copy.
5. **Run the checks.**
   ```text
   npm run deploy:check
   ```
   - It must end without an error. If it lists sources git doesn't track, commit and push them first.
6. **Build and deploy.**
   ```text
   vercel build --prod
   vercel deploy --prebuilt --prod
   ```
   - `vercel build` runs `npm run build` on this PC and packs `dist/`, with the model file (`dist/model/`) and the runtime's two files (`dist/ort/`, copied from the installed package by the build). `--prebuilt` uploads that result, so nothing is built from the repository.
7. **Check the live site.** Open the address Vercel prints, then in the browser's developer tools:
   - Network: every request goes to the site's own address;
   - Console: `crossOriginIsolated` prints `true`.

## Folders

| Path | What it holds |
|---|---|
| `src/site/` | What every page shares: the header, footer and background (`Layout.tsx`), the look (`site.css`) |
| `src/pages/` | The seven pages, one file each |
| `src/core/` | The building table from a mask (`buildings.ts`), the fixed queries, the facts and gallery loaders, the palette, the heatmap (`heatmap.ts`), the in-browser model's config and worker, the map's zoom and pan arithmetic (`view.ts`), the reports' known problems (`reportNotes.ts`) |
| `src/components/` | The map view (`OfflineCanvas.tsx`), the 3D view (`DamageCity.tsx`), the card beside the pointer (`BuildingTip.tsx`), the workspace and its panels, the Try it runner, the charts and tables, the reports |
| `src/vendor/react-bits/` | Three third-party components, copied as source with their licence |
| `src/data/facts.json` | Every number on the site |
| `scripts/` | The validator, the fixture maker and the checks |
| `public/data/` | The gallery (empty until the export) |
| `public/reports/offline/` | The six proof-run reports |
| `public/guidelines/searches.json` | The proof run's guideline searches, citations and offline evidence, built by `scripts/make-guidelines.ts` |
| `public/model/` | The field model (git-ignored; copied in before a deploy) |
| `fixtures/`, `dist/`, `dist-fixtures/`, `checks/` | Generated; git-ignored |
