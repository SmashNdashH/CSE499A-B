# T3 website

The showcase website of Group 5 (NSU, CSE499B, Section 13): an offline system that maps disaster damage from before-and-after satellite images. It is a static site: Vite, React 19, TypeScript and Tailwind 4. The same build is served by Vercel for the public and, later, by a local API at the booth.

- **Status (16 Nov 2026):** phase 1 done. Direction A (`/a`) is the chosen look; B and C are removed at the start of phase 2. The seven pages come in phase 2, the model in the browser in phase 3.
- **Who builds it now:** Aryan Sami, from 16 Nov. His handover, with the rules, file paths and order of work: [../Aryan_Task/T3_Website_Handover.md](../Aryan_Task/T3_Website_Handover.md).
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
| `npm run selfcheck` | Self-checks of the building table, the outlines and the fixed queries. |
| `npm run typecheck`, `npm run lint` | TypeScript and ESLint. |
| `npm run build:fixtures`, `npm run preview:fixtures` | A build with the fixtures, into `dist-fixtures/`, and a local server for it on port 4173. For review only. |
| `npm run browser-check` | With `preview:fixtures` running: screenshots at 390 px and 1440 px, a network log, and a click-through of the map, into `checks/`. |
| `npm run deploy:check` | Everything a deploy needs to pass, with unpushed sources as an error. |

## Where every number comes from

- **One file holds every number on the site:** [src/data/facts.json](src/data/facts.json). Each fact has its value, what it measures in plain words, the set of images it was measured on, its model, its source file in this repository, and the date it becomes public (`public_from`).
- **Each fact carries `find` strings:** exact text that must be in its source file. `npm run facts` fails if one isn't there, so every number can be traced by a text search.
- **Facts not public yet are left out of the build.** The build drops every fact whose `public_from` is after the build date, so the text isn't in the published files at all. To preview a later date: `FACTS_DATE=2026-11-18 npm run build:fixtures`.
- **Sources link to GitHub.** `npm run facts` lists every linked file that git doesn't track yet. Push those before deploying, or their links are dead.
- **Pages read facts with `fact(id)`** from `src/core/facts.ts`, and must work when it returns nothing.

## Where the gallery comes from

- The gallery is read from `public/data/`, in the shape of [DATA_CONTRACT.md](DATA_CONTRACT.md). Until the export lands the folder is empty, and the site says it has no pairs.
- **Fixtures** stand in during development: four real validation pairs with the after-image-only U-Net's output. They are marked, kept outside `public/`, and refused by the release build (contract, section 5).
- **What is an illustration:** nothing. The site has no invented places, buildings, numbers or reports. The 3D view planned for phase 2 will be labelled "a 3D view of our 2D results, not a reconstruction".

## The six reports

`public/reports/offline/` holds the six reports of the 11 Nov proof run, byte for byte as in `../Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/`. The site never edits them: known errors are marked in place by `src/components/DisasTellerReportsModal.tsx`.

## Third-party component source

`src/vendor/react-bits/` holds three components copied as source from [React Bits](https://reactbits.dev), with its licence beside them (MIT with the Commons Clause: free to use in a website, not to resell as components). They need no extra package and make no network request.

| Component | Where it is used | What it shows |
|---|---|---|
| `Crosshair` | On the building map, for a mouse | The pointer's position in image pixels, and brackets around the building under it. Changed here to report image pixels instead of screen pixels (noted at the top of the file). |
| `Counter` | The counts under the map | The digits roll to the new value when the pair changes: each image has its own counts. Unchanged. |
| `Topography` | Behind the opening section, on screens 760 px and wider | Slow contour lines of a landscape, the language of maps. It is atmosphere only, so it is set quiet: thin blue-grey lines, no reaction to the pointer. Unchanged. |

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
4. **Put the field model in place** (from phase 3). Copy `../Champion_Task/L1B-results/L1b/r9_int8_static_keep1_3.onnx` to `public/model/`. It is never in git: `*.onnx` is ignored for the whole repository.
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
   - `vercel build` runs `npm run build` on this PC and packs `dist/`, with the model file. `--prebuilt` uploads that result, so nothing is built from the repository.
7. **Check the live site.** Open the address Vercel prints, then in the browser's developer tools:
   - Network: every request goes to the site's own address;
   - Console: `crossOriginIsolated` prints `true`.

## Folders

| Path | What it holds |
|---|---|
| `src/core/` | The building table from a mask (`buildings.ts`), the fixed queries, the facts and gallery loaders, the palette |
| `src/components/` | The map view (`OfflineCanvas.tsx`), the workspace and its panels, the reports and benchmark panels |
| `src/directions/` | The three directions of phase 1 |
| `src/vendor/react-bits/` | Two third-party components, copied as source with their licence |
| `src/data/facts.json` | Every number on the site |
| `scripts/` | The validator, the fixture maker and the checks |
| `public/data/` | The gallery (empty until the export) |
| `public/reports/offline/` | The six proof-run reports |
| `fixtures/`, `dist/`, `dist-fixtures/`, `checks/` | Generated; git-ignored |
