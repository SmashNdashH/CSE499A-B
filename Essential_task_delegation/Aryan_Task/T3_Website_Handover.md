# Handover: the showcase website (T3), 16 Nov 2026, updated 17 Nov

From Abrar. You're taking over the build of our showcase website. This file says where everything is, how to run it, what's settled, what's next, and what must not break. Read it all once before you change anything.

> **Changed 16 Nov: don't start on the site before Wed 18 Nov.** Until the end of 17 Nov, Abrar builds as much of section 8 as he can himself. Your work until then is your review's fixes (sections 1 to 7 of [Review_and_Fix_List.md](Review_and_Fix_List.md), due 18 Nov). On 18 Nov, `git pull`, then read section 8 again: whatever is marked done there is done, and you take the rest from the first open item.

The site is in [`Essential_task_delegation/T3_Website/`](../T3_Website/). It started as a copy of your prototype (`Aryan_Task/Website/`), reworked to our data. Your own `Website/` folder is untouched: it stays your record, and sections 1 to 6 of [Review_and_Fix_List.md](Review_and_Fix_List.md) still apply to it.

## 1. What the site is for

- **Who sees it:** the judges at the showcase (about 15 Dec), our supervisor, and anyone who opens the link later. Most aren't remote-sensing people.
- **The test it must pass:** in 30 seconds a judge knows what the system does; in 3 minutes they've clicked a building, seen its facts, and run a model on an image.
- **How it beats last season's winner** (DhakaDriveX, https://nipunsaif.github.io/CSE499B/): one strong look, results in motion and one interactive proof, like theirs, plus real numbers traced to their files and limits stated plainly.

## 2. Where it stands

**Done by the end of 16 Nov (all three phases of Abrar's brief are built):**
- A cleaned copy of your site. Your workspace layout and your file names survive; most of the code behind them was rewritten, and some features were removed. Section 3 lists every change and why.
- **The look is chosen: direction A, "Aftermap"**, and it is now the whole site ([src/site/Layout.tsx](../T3_Website/src/site/Layout.tsx), [site.css](../T3_Website/src/site/site.css)). Directions B and C are deleted. Abrar asked for:
  - the faint 80 px gridlines across the whole page;
  - a small before/after pair beside the headline, not a full-screen one;
  - the slow contour-line background behind the top of **every** page (React Bits "Topography"), reacting gently to the pointer;
  - an on/off switch for the damage map and the heatmap wherever the map appears without a layers panel.
- **Seven pages**, one file each in [src/pages/](../T3_Website/src/pages/):

  | Address | Page | What is on it |
  |---|---|---|
  | `/` | Home | The small before/after pair with the damage map, one sentence, the decision-support line |
  | `/how` | How it works | The scroll story: one real pair stays pinned and changes at each of 7 steps ([ChainStory.tsx](../T3_Website/src/components/ChainStory.tsx)) |
  | `/explore` | Explore | The building map ([Workspace.tsx](../T3_Website/src/components/Workspace.tsx)) and, behind its "3D damage city" button, each building raised into a block ([DamageCity.tsx](../T3_Website/src/components/DamageCity.tsx)) |
  | `/try` | Try it | The field model running in the visitor's browser on their own image ([TryItRunner.tsx](../T3_Website/src/components/TryItRunner.tsx)); result shown in the same building map |
  | `/results` | Results | The benchmark numbers as bar charts, each bar ending in its linked number, with the table under each chart ([ResultsTables.tsx](../T3_Website/src/components/ResultsTables.tsx)) |
  | `/reports` | Reports | The six reports in full, the guideline passages each was given, the Expert report's citations beside their passages, and the offline evidence ([pages/Reports.tsx](../T3_Website/src/pages/Reports.tsx)) |
  | `/about` | About | The limitations, the future ideas, the team and the credits |
- **The data contract** for the gallery export, its validator, the facts file with its checks, and four development stand-in pairs.
- **Added on 17 Nov** (the old items 2 and 3 of section 8, and a design pass; details in 3.7):
  - on the building map: zoom and pan, a card beside the pointer, hide and search in the buildings list, folding side panels;
  - on the Reports page: print for a report, and the rest of the known problems from Ridita's README;
  - a design and accessibility pass over all seven pages.
- **Checks measured on 17 Nov:** type check, lint, both builds and the browser check pass on all seven pages; no request leaves 127.0.0.1; no page is wider than the screen from 320 px to 1920 px; Lighthouse with phone settings gives 94 to 99 for performance and 100 for accessibility on all seven pages; the in-browser model gives the same class as the native run on 100% of pixels (README, "The model in the browser").

**Still open:** see section 8.

**Not decided yet:** the project's name ("Aftermap" is a placeholder), and the open questions in [NOTES.md](../T3_Website/NOTES.md), section 3. Ask Abrar; don't settle them yourself.

## 3. What changed from your prototype, and why

Your prototype is unchanged at [Aryan_Task/Website/](Website/), so you can compare any file side by side. Most changes follow your review ([Review_and_Fix_List.md](Review_and_Fix_List.md)), sections 1 to 5; the section is given where it applies.

### 3.1 Removed, and must not come back

| What | Where it was | Why |
|---|---|---|
| The Pazarcık and Fort Myers scenarios: named buildings at real coordinates, floors, collapse types, void likelihood, sensor advice, EMS-98 grades on buildings, the sample "Tactical Directive" | `src/data/mockScenarios.ts`, and everything drawn from it | Invented damage assessments of real places, shown as our system's output (review §1, §2) |
| The thermal simulation, ingress route and void radar tools | `SplineTopBar.tsx`, `OfflineCanvas.tsx` | Features our system doesn't have; they came from CSE499A's first plan (review §2). Since 16 Nov they are described in words only, under "Future ideas, not built" (3.6) |
| The "Directives", "Voids" and "Ingress" tabs, the "Dispatch GPR / Geophones / K9" buttons, "Read guidance aloud" and "Copy SitRep" | `SplineInspectorPanel.tsx` | Advice our system never produced (review §2) |
| The EMS-98 incident action plan pop-up | `App.tsx` | Invented directives (review §2) |
| Questions about pancake collapse, void sensors and standoff perimeter, and computed Sphere shelter and INSARAG triage answers | `FixedQuestionConsole.tsx` | Our table can't answer them (review §2). Sphere and INSARAG are back as quoted guideline passages, with nothing computed (3.6) |
| Default values for missing data (`areaM2 \|\| 300`, `\|\| 250`, `\|\| 320`, `?? 0`) | `FixedQuestionConsole.tsx`, `SplineInspectorPanel.tsx`, `OfflineCanvas.tsx` | A missing value shown as a real one (review §2). Missing now shows as missing |
| The hand-written Turkey reports labelled as `fixed_flow.py` output, "MODE: OFFLINE, FIXED FLOW" and "TELEMETRY: OFF" | `DisasTellerReportsModal.tsx`, `mockScenarios.ts` | Not output of our system (review §2) |
| The map's status badges: "OFFLINE SAFE (0 API CALLS)", "GSD 0.3m/px" with a latitude and longitude, "QWEN2.5-VL 4-BIT EDGE", "Route Alpha Cleared" | `OfflineCanvas.tsx`, `SplineTopBar.tsx`, `SplineBottomBar.tsx` | Claims the data doesn't support: our images have no ground resolution or coordinates, and no language model runs on the map |
| The benchmark panel's "audit" tab | `BenchmarkPanelModal.tsx` | Its caveats included invented ones (thermal attenuation) and a wrong counting figure (39.2%). The real limitations are now a section of the page (3.6) |
| The online map tiles and the online/offline toggle | `SplineCanvas.tsx`, `ResponderMap.tsx` (with `ResponderResponsePanel.tsx`, which nothing used) | Requests to an outside server; and our images have no coordinates (review §4) |
| The share and export pop-up | `ShareExportModal.tsx` | A hard-coded cloud URL (review §4). Saving is back without any cloud: a map picture and the report files download from the visitor's own browser (3.6) |
| Radio-chirp and sonar sounds, and confetti | `src/utils/audio.ts`, `canvas-confetti` | Effects don't belong in a decision-support tool (review §4) |
| Google Fonts | `index.html` | An outside request on every visit. The fonts now come from npm packages, built into the site (review §4) |
| `@google/genai`, `express`, `dotenv`, `.env.example`, `metadata.json`, the package name `react-example`, the AI Studio comments in `vite.config.ts` | the project root | Cloud leftovers in an offline site (review §4) |
| Copies of our internal documents | `public/assets/aistudio/` | A deployed site would serve them to anyone (review §5) |
| Stock photos | `src/assets/images/` | Not our images |
| `bun.lock` | the project root | Replaced by `package-lock.json`, so `npm ci` installs the same versions everywhere |

### 3.2 Not carried over yet, and allowed to return

These were dropped to keep the first version small, not because they were wrong. Most are back, built on real data:

- **Pan and zoom on the map: back since 17 Nov** (3.7).
- **The 3D view: back since 16 Nov** as the 3D damage city, built from the real outlines ([DamageCity.tsx](../T3_Website/src/components/DamageCity.tsx)). Yours used invented floor counts for heights; here a block's height only repeats its class, and the view says so.
- **Hiding single buildings** (the eye icon) and **search** in the layers list: **back since 17 Nov** (3.7).
- **Collapsing the side panels** ("Hide"): **back since 17 Nov** (3.7).
- **Print** in the reports view: **back since 17 Nov** (3.7). (Copy and download came back on 16 Nov: 3.6.)
- **The hover tooltip** beside the pointer: **back since 17 Nov** (3.7).
- **The "team" tab** of the benchmark panel. The team is on the About page instead.
- **The `motion` package** was dropped because nothing used it after the rework. Ask before adding it back.

### 3.3 Reworked: same name, new inside

| File | Your version | Now | Why |
|---|---|---|---|
| `src/types/disaster.ts` | `BuildingFeature` with name, latitude and longitude, floors, collapse type, void likelihood, sensor; xBD's four damage levels | `Building`: exactly the building table's columns, plus each building's outline; three classes (intact, damaged, destroyed) | Our table's real schema (review §2) |
| `OfflineCanvas.tsx` | A canvas drawing a made-up street grid with rectangles for buildings; the before/after slider drew only labels | SVG over the real before and after photos, with each building drawn from its outline; the slider uncovers the real before photo; ground truth and heatmap layers come from the real files | Only real outputs on the map (review §1) |
| `SplineTopBar.tsx` | Project name, offline badge, the four tools | Pair picker, a method switch (shown only when a pair has two methods), and buttons for the reports and the benchmark | The tools are gone (3.1) |
| `SplineLayersPanel.tsx` | Buildings grouped into invented zones ("Zone A (NE) · Pancake Collapses") | A checkbox for each class, the hot spots, the heatmap and the ground truth, and every building listed by class | Real layers; the list is also the keyboard's way to a building |
| `SplineInspectorPanel.tsx` | Coordinates, floors, area, EMS-98 grade, and directive tabs | The selected building's row of the table; this image's accuracy against the ground truth; where the map comes from (model, checkpoint, notebook, date); the report writer's input for this pair; and the questions tab | Every fact traceable to a file |
| `SplineBottomBar.tsx` | Filters for destroyed, major, voids and ingress, with invented counts | One button per class with its count; pressing it highlights those buildings | Counts from the table |
| `FixedQuestionConsole.tsx` | Six templates computed over invented buildings | Four: counts per class; buildings within 50, 100 or 200 px of a destroyed one; the largest damaged or destroyed building; the hot spots and safe areas. Each shows its fixed query and highlights its buildings | Only what the table can answer, with no defaults (review §2) |
| `DisasTellerReportsModal.tsx` | Hand-written Turkey reports with invented citations | The six real proof-run reports, word for word, with known errors marked in place; a native dialog | Real outputs only (review §2) |
| `BenchmarkPanelModal.tsx` | Scorecards from `mockScenarios.ts` with mixed-up numbers | Tables read from the facts file, each number linked to its source | Correct, traceable numbers (review §3) |
| `App.tsx` | One full-screen workspace | A router with the seven pages inside one shared header and footer | A site of several pages |
| `index.css` | Leaflet overrides and two Google font names | Shared styles driven by colour and font variables that each look sets | One stylesheet for every page |
| `vite.config.ts` | Dev server open on the network (`0.0.0.0`) | Local only (`127.0.0.1`); sends the two isolation headers; leaves facts not public yet out of the build; serves the stand-in data in development | Offline, and multi-threaded in-browser models |
| `package.json` | `lint` was `tsc --noEmit`; TypeScript 7 | `typecheck` is `tsc --noEmit` and `lint` is ESLint; TypeScript 6, because the lint tooling doesn't support 7 yet; the check scripts | Section 7 |
| `tsconfig.json`, `.gitignore`, `index.html` | AI Studio defaults | Strict type checking; generated folders and the model file ignored; a plain title and description, with no outside links | |

### 3.4 Your numbers

- **Now in the facts file and shown on the site**, from the ones your review marked correct: 117,687 buildings in 2,652 images; 27 of 30 on the retrieval test; 33 MB, 1.6 s per image, 1.43 times as fast, and a 0.0003 drop for the field model.
- **In the facts file but not shown yet:** SAM 3's 0.630 (`sam3_building_iou`). Use it with `<Num id="sam3_building_iou" />` if a page needs it.
- **Not carried over:** the 59.5% from E1. Add it as a fact, with its source, if a page needs it.
- **Corrected:** the website rows of your review's §3 table (the mixed 0.3161 / 0.588, the find-then-grade label, the 0.2686 baseline, the 39.2%, the 0.2230 baseline, the team names). The site uses the corrected values from the facts file. The table's last three rows are about your update 4 section, not the site; they're yours to correct in update 5.

### 3.5 Added

- [src/core/](../T3_Website/src/core/): the building table built from a mask, the fixed queries, the facts loader, the gallery loader and the damage colours.
- [src/components/Workspace.tsx](../T3_Website/src/components/Workspace.tsx), [ChainStory.tsx](../T3_Website/src/components/ChainStory.tsx), [ResultsTables.tsx](../T3_Website/src/components/ResultsTables.tsx): the building map, the scroll story and the results tables.
- [src/site/](../T3_Website/src/site/) and [src/pages/](../T3_Website/src/pages/): the shared header, footer, background and look, and the seven pages. (The three trial looks of phase 1 lived in `src/directions/`, now deleted.)
- [src/components/DamageCity.tsx](../T3_Website/src/components/DamageCity.tsx): the 3D damage city.
- [src/components/TryItRunner.tsx](../T3_Website/src/components/TryItRunner.tsx), [src/core/segment.worker.ts](../T3_Website/src/core/segment.worker.ts), [modelConfig.ts](../T3_Website/src/core/modelConfig.ts), [heatmap.ts](../T3_Website/src/core/heatmap.ts): the field model in the browser, and the heatmap computed from its mask.
- [src/core/view.ts](../T3_Website/src/core/view.ts), [src/components/BuildingTip.tsx](../T3_Website/src/components/BuildingTip.tsx), [src/core/reportNotes.ts](../T3_Website/src/core/reportNotes.ts): the map's zoom and pan arithmetic, the card beside the pointer, and the list of the reports' known problems (17 Nov).
- [src/vendor/react-bits/](../T3_Website/src/vendor/react-bits/): the crosshair, the rolling counts and the contour background, with their licence.
- [scripts/](../T3_Website/scripts/): the data validator, the fixture maker, and the checks for facts, colours, logic and the browser.
- [src/data/facts.json](../T3_Website/src/data/facts.json), [public/reports/offline/](../T3_Website/public/reports/offline/), [vercel.json](../T3_Website/vercel.json), and the three documents (README, NOTES, DATA_CONTRACT).

### 3.6 Brought back on 16 Nov, built on real data

Abrar asked for whatever could come back. Each item below is real output or plain description, never invented values:

| Was in your prototype | Now | Where |
|---|---|---|
| Sphere shelter and INSARAG triage questions | A fifth fixed question, "What do the response guidelines say?". It shows the 18 searches the report system ran in the 11 Nov proof run and the three passages the offline search returned for each, word for word. It computes nothing, and says the passages aren't advice about the pair on the map | [GuidelineSearch.tsx](../T3_Website/src/components/GuidelineSearch.tsx); data in [public/guidelines/searches.json](../T3_Website/public/guidelines/searches.json), built and checked by [scripts/make-guidelines.ts](../T3_Website/scripts/make-guidelines.ts) on every build |
| Share and export | "Save this map as a picture (PNG)" under the map, drawn in the browser, with the model's name, the decision-support line and the fixture mark printed under the picture; and "Download this report (.txt)" and "Copy the text" for each report, which give the file byte for byte | [src/core/exportMap.ts](../T3_Website/src/core/exportMap.ts), [DisasTellerReportsModal.tsx](../T3_Website/src/components/DisasTellerReportsModal.tsx) |
| The benchmark panel's audit tab | "What it can't do yet": the real limitations, each number from the facts file | [AboutSections.tsx](../T3_Website/src/components/AboutSections.tsx) |
| Thermal, void radar, K9 and sensor advice, ingress routes | "Future ideas, not built": each described in words only, with why it isn't built, beside the team's own planned extras (a generated before photo, real 3D reconstruction, shaking from damage) | [AboutSections.tsx](../T3_Website/src/components/AboutSections.tsx) |

Two kinds of item stay out: online map tiles (they need the internet, and the booth runs offline) and sounds and confetti.

### 3.7 Brought back on 17 Nov, built on the real table

| Was in your prototype | Now | Where |
|---|---|---|
| Pan and zoom (wheel, drag, zoom and reset buttons) | Three buttons on the map, Ctrl (⌘ on a Mac) with the wheel, a two-finger pinch, a drag once zoomed, and the arrow keys from the zoom buttons. A plain wheel still scrolls the page: your canvas filled the screen, ours sits in a page that scrolls, so the map says which key to hold. The view stays in image pixels, so the crosshair still reads true positions | [OfflineCanvas.tsx](../T3_Website/src/components/OfflineCanvas.tsx); the arithmetic in [src/core/view.ts](../T3_Website/src/core/view.ts), tested by `npm run selfcheck` |
| The hover tooltip | A card beside the pointer with the building's row: number, class, area in pixels, distance to the nearest destroyed building. On the flat map and the 3D view. Nothing is defaulted: a missing distance is said in words | [BuildingTip.tsx](../T3_Website/src/components/BuildingTip.tsx) |
| The eye icon and the search box | The eye hides one outline on the map. The search takes digits only and keeps the buildings whose number starts with them, because our buildings have numbers, not names. **Both change only what is shown:** counts, answers and the saved picture always use the whole table, and the panel says how many outlines are hidden | [SplineLayersPanel.tsx](../T3_Website/src/components/SplineLayersPanel.tsx), [Workspace.tsx](../T3_Website/src/components/Workspace.tsx) |
| "Hide" on the side panels | Each panel folds to its title and opens again ("Hide", "Show"), with the browser's own `<details>` element | [SplineLayersPanel.tsx](../T3_Website/src/components/SplineLayersPanel.tsx), [SplineInspectorPanel.tsx](../T3_Website/src/components/SplineInspectorPanel.tsx) |
| Print in the reports view | "Print this report" on the Reports page prints the chosen report alone, with the four caveats, its marks and notes, each link's address and the decision-support line. Any page can also be printed: on paper the dark look turns to dark ink on white | [DisasTellerReportsModal.tsx](../T3_Website/src/components/DisasTellerReportsModal.tsx); the print rules at the end of [index.css](../T3_Website/src/index.css) |

**Three rules these keep, which a later change must not break:**
- **Hiding never changes a number.** If you ever make the saved picture leave hidden buildings out, print how many are hidden in its label band.
- **Building numbers start again in every table.** So the hidden set, the search and the selection are cleared when the pair or the method changes (`clear()` in `Workspace.tsx`), and the zoom when the pair changes.
- **The keyboard reaches everything.** The eyes are out of the Tab order so the list stays one stop a building; the same switch is the "Hide its outline on the map" button under the selected building's facts. The browser check runs the 3D view from the keyboard alone.

## 4. Run it on your PC

Requirements: Node 22.18 or later (`node -v`), npm, and Chrome for the checks.

1. `git pull` so you have `Essential_task_delegation/T3_Website/`.
2. In that folder:
   ```text
   npm install
   npm run fixtures
   npm run dev
   ```
3. Open the address it prints (http://127.0.0.1:3000, or the next free port). The pages are `/`, `/how`, `/explore`, `/try`, `/results`, `/reports` and `/about`.
4. **For Try it only:** copy `Essential_task_delegation/Champion_Task/L1B-results/L1b/r9_int8_static_keep1_3.onnx` into `T3_Website/public/model/`. The file is on Abrar's PC, not in git; ask him for it. Without it the Try it page says the model isn't part of this copy, and everything else works.

**What you'll see that Abrar doesn't:** no satellite photos. The stand-in pairs take their photos from xBD's original files, which are only on Abrar's PC (`data/` is git-ignored). Without them the map shows "No photo of this pair is on this device"; the outlines, masks and numbers are still real. That's expected. If you have xBD's `train/images` folder, put it at `data/xView2 Challenge Dataset - train and test/train/images/` in the repository and run `npm run fixtures` again.

## 5. Where everything is

| Path | What it holds | Can you change it? |
|---|---|---|
| [T3_Website/README.md](../T3_Website/README.md) | Every command, the deploy steps, the rules the code keeps | Yes, keep it current |
| [T3_Website/NOTES.md](../T3_Website/NOTES.md) | Contradictions found and open questions for Abrar | Add to it; don't delete his questions |
| [T3_Website/DATA_CONTRACT.md](../T3_Website/DATA_CONTRACT.md) | The exact files the gallery export must write | **No.** Abrar's export notebook is built against it. Ask first |
| [src/data/facts.json](../T3_Website/src/data/facts.json) | **Every number on the site**, with its source file and date | Only by the rules in section 6 |
| [src/core/](../T3_Website/src/core/) | The building table from a mask, the fixed queries, the facts and gallery loaders, the damage colours, the map's zoom and pan arithmetic (`view.ts`), the reports' known problems (`reportNotes.ts`) | Carefully; `npm run selfcheck` and `npm run palette` test it |
| [src/components/](../T3_Website/src/components/) | The map view (`OfflineCanvas.tsx`), the workspace and its panels, the reports and benchmark panels, the scroll story | Yes |
| [src/site/](../T3_Website/src/site/) | What every page shares: header, footer, background (`Layout.tsx`, `HeroBackground.tsx`) and the look (`site.css`) | Yes |
| [src/pages/](../T3_Website/src/pages/) | The seven pages, one file each | Yes |
| [src/core/modelConfig.ts](../T3_Website/src/core/modelConfig.ts), [segment.worker.ts](../T3_Website/src/core/segment.worker.ts), [heatmap.ts](../T3_Website/src/core/heatmap.ts) | The in-browser model: what it reads, how it runs, and the heatmap from its mask | **Ask first.** They are matched pixel for pixel against a native run and the heatmap notebook (`npm run check:model`, `npm run check:heatmap`); a small change can break that |
| `public/model/` | The field model file, git-ignored | Never commit it |
| [src/vendor/react-bits/](../T3_Website/src/vendor/react-bits/) | Three third-party components, copied as source with their licence | Only as the README says |
| [public/reports/offline/](../T3_Website/public/reports/offline/) | The six proof-run reports, byte for byte | **Never edit.** They must match Ridita's files exactly |
| [scripts/](../T3_Website/scripts/) | The validator, the fixture maker and the checks | Don't weaken a check to make it pass |
| `public/data/` | The real gallery. Empty until Abrar's export lands | **No.** Only the export goes here |
| `fixtures/`, `dist/`, `dist-fixtures/`, `checks/`, `node_modules/` | Generated, git-ignored | Never commit them |

**The files the site reads from the rest of the repository** (read-only for you):
- the stand-in data: [Champion_Task/E1-results/E1/gt/](../Champion_Task/E1-results/E1/gt/), [preds/R9_tta/](../Champion_Task/E1-results/E1/preds/R9_tta/), [T1-results/T1-v3/](../Champion_Task/T1-results/T1-v3/), [E5-results/step1/val_train_leaks_hash.csv](../Champion_Task/E5-results/step1/val_train_leaks_hash.csv);
- the reports: [Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/](../Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/);
- the source file of every fact: the `source` field in `facts.json`.

## 6. Rules that must not break

These come from Abrar's brief for the site. Breaking one is worse than leaving a page unfinished.

1. **No invented data.** No made-up numbers, places, coordinates, buildings, reports, quotes or footage. When something is missing, the page says so. This is what went wrong in your prototype (review, sections 1 and 2).
2. **Missing is never zero.** A missing table, distance or file shows as missing, never as 0. No default values (`|| 300`, `?? 0`) for data.
3. **Every number comes from `facts.json`,** read with `fact(id)` from [src/core/facts.ts](../T3_Website/src/core/facts.ts), shown with `<Num id="…" />`. Never type a number into a page.
   - To add a fact: give it `value`, `display`, `measures` (plain words), `image_set`, `model`, `source` (its file in the repository), `find` (exact text from that file) and `public_from`.
   - `npm run facts` fails if the `find` text isn't in the source file.
   - If two files disagree on a number, stop and ask Abrar. Don't pick one.
4. **Dates on facts.** Results from 18 Nov (update 5) carry `"public_from": "2026-11-18"`: the 2,007 test pairs, the counting benchmark's flaw (66.98%), the count errors and anything about the 3B. The build leaves them out before that date, so every page must still read well without them.
5. **Label honestly.**
   - Model output is labelled as model output, with what the model is.
   - The parts don't run as one chain yet: each part shows its own model and its own images.
   - The six reports are about DisasTeller's Wajima sample photos, not our satellite pairs, and their quality hasn't been judged.
6. **Plain words on the page.** No bare internal labels (R9, R11, E7, H2, T1, O3) in text a visitor reads; they're fine in source links. Explain each measure where it first appears (IoU: the overlap between predicted and true pixels, 0 to 1).
7. **This line on every page:** "A model's estimate, to be checked by people on the ground."
8. **Distances and areas are in pixels.** Never metres: the dataset gives no ground resolution.
9. **No request leaves our own site.** No CDN, Google Fonts, analytics, map tiles or online AI service. Fonts are npm packages. At the booth it runs with the internet off.
10. **Sober.** These are real disasters. No shake, glitch or explosion effects; any motion must explain something, or it goes. Respect reduced motion.
11. **The damage colours live only in [src/core/palette.ts](../T3_Website/src/core/palette.ts).** `npm run palette` checks they stay distinguishable for colour-blind visitors. Every coloured mark also has a text label.
12. **Names, exactly:** Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam. NSU, CSE499B, Section 13, Group 5.
13. **No mention of AI coding assistants** anywhere in the site, its code comments, its README or its metadata.
14. **Work only inside `T3_Website/`.** Don't edit other members' folders. Report problems in their files to Abrar instead.
15. **Nothing goes public from a push.** Abrar deploys by hand from his PC (README, "Deploying to Vercel"). Don't connect the repository to Vercel or any host.

## 7. Before every push

Run these in `T3_Website/`. All must pass. Paste their last lines into your commit message or your message to Abrar.

```text
npm run typecheck
npm run lint
npm run build
npm run build:fixtures
npm run preview:fixtures      (leave running, then in a second terminal:)
npm run browser-check
```

- `npm run build` runs the data validator, the facts check, the colour check and the self-checks first.
- **Lighthouse:** the site must keep 90 or more for performance and accessibility with phone settings (Chrome's developer tools, Lighthouse tab, "Mobile"). Measured on 17 Nov with everything in, performance and accessibility: Home 98 and 100, How it works 96 and 100, Explore 94 and 100, Try it 97 and 100, Results 99 and 100, Reports 96 and 100, About 98 and 100. Performance moves by a point or two between runs. Measure again after any change to a page's first screen.
- `browser-check` takes screenshots of all seven pages at 390 px and 1440 px into `checks/screenshots/`, and fails if any request leaves 127.0.0.1. Look at the screenshots yourself too. On 17 Nov it passed against the built copy and against the dev server (`BASE_URL=http://127.0.0.1:<the port npm run dev prints> npm run browser-check`). It also works the site:
  - on Explore it clicks a building, a count and a fixed question;
  - it turns the wheel over the map without Ctrl (the page must scroll, and the map must say which key zooms) and with Ctrl (the map must zoom about the pointer, and the page must stay);
  - it zooms with the buttons, chooses a building outside the zoomed view from the list (the view must go to it), clicks it there (the facts must be that building's), drags the view, hides an outline (the counts must stay), searches the list and folds a panel;
  - it runs the 3D view from the keyboard alone: a building from the list, the turn slider, and the hide switch;
  - on Reports it reads what "Print this report" puts on paper, and saves it as `checks/report-print.pdf`.
- **If you touched Try it or anything in `src/core/`:** with the model file in place, also run `npm run build`, then `npm run preview` in one terminal and `npm run check:model` in another (it needs one xBD after-image; README, "The model in the browser"), and `npm run check:heatmap`.
- Then check that `git status` shows changes only inside `T3_Website/`, and stage only that folder:
  ```text
  git add -- Essential_task_delegation/T3_Website
  ```

## 8. What's next, in order

**Done on 16 Nov, so don't redo these** (the earlier version of this list had them as your items 1 and 2):
- A is the site: directions B and C, the review bar and `review.css` are deleted; `scripts/browser-check.ts` visits the seven new addresses and runs its map checks on Explore only.
- All seven pages (table in section 2), including the 3D damage city, Try it, the Results charts, and the Reports page with its searches, citations, offline evidence, download and copy, and 12 known errors marked in place.

**Done on 17 Nov, so don't redo these either** (they were items 2 and 3 of this list, and part of item 1):
- **Everything section 3.2 listed for the map and the reports:** pan and zoom, search and hide in the buildings list, folding side panels, the card beside the pointer, and print for a report. How each was built, and three rules they keep, are in 3.7.
- **The Reports page's known problems.** Every problem that Ridita's [README](../Offline_RAG_KR2/README.md) lists ("Practice run 5", "Quality problems") is now on the page:
  - 14 wrong phrases are marked in the text (12 before; new: the 10 vehicles, and the sentence that sends the medical staff to two places at once);
  - 8 notes sit under the reports, for problems with no single phrase to mark: the bridge's missing grade, the misplaced labels on the run's map, the two sections that repeat each other, the reports that were given guideline passages and cite none, and the Reconstruction plan's passage names without brackets (real passages, so a note, not an error mark);
  - the list moved to [src/core/reportNotes.ts](../T3_Website/src/core/reportNotes.ts). `npm run selfcheck` fails if a marked phrase is in no report or if two marks overlap;
  - one line of the page was wrong and is corrected: it said the other five reports "cite nothing by name", but the Reconstruction plan names its passages in an appendix.
- **A design and accessibility pass over all seven pages**, at 390 px and 1440 px, with nine more widths checked for overflow. What it changed:
  - one name for the heatmap, "danger heatmap", on every page (Results says once that our reports call it the survivability heatmap);
  - SAM 3 and U-Net are explained where How it works first uses them, and "safe areas" are described as what they are, the open ground farthest from any damage;
  - event names read as names ("Hurricane Harvey", "Santa Rosa wildfire");
  - on a phone, the header's row of links fades at its right edge, to show it goes on;
  - the selected row of the buildings list had numbers at too low a contrast (about 4 to 1; now 4.9 to 1);
  - How it works skipped a heading level, which Lighthouse counts as a fault;
  - the team's five names sit on one line on a wide screen;
  - an alignment figure on About named "Ridita's audit"; it now gives her full name.

**What's left, in order.** Do them one at a time, push each, and tell Abrar what you changed.

1. **Look at every page on a real phone and on your own screen,** against section 6. The 17 Nov pass used a desktop browser at phone width, never a real phone, and one person's eyes. Report anything that reads badly, overflows or is unclear to someone who isn't a remote-sensing person. On the phone, also try the new map controls: pinch to zoom, drag the zoomed map, tap a building in it.
2. **About:** a place for the supervisor line (Abrar gives the wording).
3. **When Abrar's gallery export lands** in `public/data/`: run `npm run validate`, then check every page with the real pairs (the fixture banner disappears by itself), and the Turkey pair where the model fails is shown with its real accuracy. Check the buildings list too: a pair with several hundred buildings is the first real test of its length.
4. **On 18 Nov:** build once with `FACTS_DATE=2026-11-18` (`npm run build:fixtures` with that variable set) and check that the test-set rows, the counting-flaw sentence and the Turkey sentence appear and read well on Results and About. Their wording lives in `facts.json` (`note` fields), never in a page.
5. **Try it on other devices:** the README's numbered steps for the booth laptop and a mid-range phone. The phone test waits for Abrar's first deploy.
6. **Not yours to start:** the booth's local API (a later, separate brief), the deploy (Abrar's), and anything in `src/core/` for the model (ask first).

**The limitations the About page states** (already written in `AboutSections.tsx`; each number from `facts.json`, in plain words, as rule 6 of section 6 says):
   - the parts don't run as one chain yet;
   - distances and areas are in pixels;
   - building counts are weak: about a third of the benchmark's counting questions answered right, like the base 7B;
   - from 18 Nov: those questions can be answered 66.98% right without looking at the image, so counts are judged by their error against the true masks;
   - without a before-image, damage is much harder to find: on the after-image alone, SAM 3 covers only 9% of the destroyed-building area;
   - in 52% of the pairs measured, the before and after images are shifted by more than 2 px (Ridita's audit);
   - from 18 Nov: on the test pairs, the before-and-after model largely misses the Turkey earthquake's destroyed buildings (destroyed IoU 0.0867, against 0.3233 for find-then-grade);
   - the reports' quality hasn't been judged, and they contain errors;
   - no language model has been measured on a laptop CPU or a phone yet.
**Your bridge feeds this site.** When `format_disaster_facts` is fixed (review, section 7), the gallery export writes its text as `report_inputs.txt` per pair, and the inspector shows it word for word under "What the report writer is given for this pair". Until then it shows as missing.

## 9. When you're stuck

- **A check fails:** read its message; each one names the file and the problem. Fix the cause, not the check.
- **Something here conflicts with Abrar's review or with what you see in the files:** stop and ask him.
- **You want to add a library:** ask first. Each one must work offline and send no request to another site.

## 10. Instruction for your AI assistant (paste everything in the box)

```text
You are continuing a student project's showcase website in the repository SmashNdashH/CSE499A-B.
The site is in Essential_task_delegation/T3_Website/ (Vite, React 19, TypeScript, Tailwind 4, static build).

Read these first, completely:
  Essential_task_delegation/Aryan_Task/T3_Website_Handover.md   (this handover: rules, paths, order of work)
  Essential_task_delegation/T3_Website/README.md
  Essential_task_delegation/T3_Website/NOTES.md
  Essential_task_delegation/T3_Website/DATA_CONTRACT.md

HARD RULES (from the handover, section 6)
- Work only inside Essential_task_delegation/T3_Website/. Everything else is read-only.
- Never invent data, numbers, places, coordinates, buildings, reports or quotes. Missing data is shown as missing,
  never as 0, with no default values.
- Every number shown comes from src/data/facts.json via fact(id) or <Num id=...>. Never hard-code a number in a page.
  If two source files disagree, stop and report it.
- Never edit public/reports/offline/ (the six real reports), public/data/ or DATA_CONTRACT.md.
- Never weaken a check in scripts/. You may add a check to scripts/browser-check.ts or scripts/selfcheck.ts,
  never remove or loosen one.
- No request may leave the site's own origin: no CDN, web font, analytics, map tiles or online AI service.
- No internal run labels (R9, R11, E7, H2, T1, O3) in visible text; plain words instead.
- "A model's estimate, to be checked by people on the ground." on every page.
- Distances and areas in pixels, never metres. Motion only when it explains something; respect reduced motion.
- No mention of AI coding assistants in the site, its code comments, README or metadata.
- No new npm dependency without asking.

TASK
Do the next item in section 8 of the handover, only that one. Keep the existing look (direction A).

WHEN DONE
Run, in T3_Website/: npm run typecheck; npm run lint; npm run build; npm run build:fixtures;
then npm run preview:fixtures and, in a second terminal, npm run browser-check.
Give me: the list of changed files, the last lines of each command, and anything you could not do and why.
Do not guess.
```
