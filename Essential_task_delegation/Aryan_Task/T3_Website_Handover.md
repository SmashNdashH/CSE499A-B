# Handover: the showcase website (T3), 16 Nov 2026

From Abrar. You're taking over the build of our showcase website. This file says where everything is, how to run it, what's settled, what's next, and what must not break. Read it all once before you change anything.

The site is in [`Essential_task_delegation/T3_Website/`](../T3_Website/). It started as a copy of your prototype (`Aryan_Task/Website/`), reworked to our data. Your own `Website/` folder is untouched: it stays your record, and sections 1 to 6 of [Review_and_Fix_List.md](Review_and_Fix_List.md) still apply to it.

## 1. What the site is for

- **Who sees it:** the judges at the showcase (about 15 Dec), our supervisor, and anyone who opens the link later. Most aren't remote-sensing people.
- **The test it must pass:** in 30 seconds a judge knows what the system does; in 3 minutes they've clicked a building, seen its facts, and run a model on an image.
- **How it beats last season's winner** (DhakaDriveX, https://nipunsaif.github.io/CSE499B/): one strong look, results in motion and one interactive proof, like theirs, plus real numbers traced to their files and limits stated plainly.

## 2. Where it stands

**Done (phase 1, with Abrar's choices made):**
- A cleaned copy of your site. Your workspace layout and your file names survive; most of the code behind them was rewritten, and some features were removed. Section 3 lists every change and why.
- **The look is chosen: direction A, "Aftermap"** ([src/directions/DirectionA.tsx](../T3_Website/src/directions/DirectionA.tsx), [a.css](../T3_Website/src/directions/a.css)). Abrar asked for:
  - the faint 80 px gridlines across the whole page;
  - a small before/after pair beside the headline, not a full-screen one;
  - the slow contour-line background behind the opening section (React Bits "Topography");
  - an on/off switch for the damage map and the heatmap wherever the map appears without a layers panel.
- **"How it works"** told by scrolling: one real pair stays pinned and changes at each of 7 steps ([src/components/ChainStory.tsx](../T3_Website/src/components/ChainStory.tsx)).
- **The building map** ([src/components/Workspace.tsx](../T3_Website/src/components/Workspace.tsx)): layers on the left, the pair in the centre, the building inspector on the right, the counts underneath.
- **The data contract** for the gallery export, its validator, the facts file with its checks, and four development stand-in pairs.

**Not started (phase 2 and later):** see section 8.

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

These were dropped to keep the first version small, not because they were wrong. Bring them back if they're built on real data:

- **Pan and zoom on the map** (mouse wheel, drag, the zoom and reset buttons).
- **The 3D view.** It returns as the 3D damage city (section 8), built from the real outlines. Yours used invented floor counts for heights.
- **Hiding single buildings** (the eye icon) and **search** in the layers list.
- **Collapsing the side panels** ("Hide").
- **Print** in the reports view. (Copy and download are back: 3.6.)
- **The hover tooltip** beside the pointer. Today the facts of the building under the pointer show in a line under the map.
- **The "team" tab** of the benchmark panel. The team will go on the About page instead.
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
| `App.tsx` | One full-screen workspace | A router: the chosen look at `/a` (B and C are removed next; section 8) | A site of several pages |
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
- [src/directions/](../T3_Website/src/directions/): the three looks of phase 1.
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

## 4. Run it on your PC

Requirements: Node 22.18 or later (`node -v`), npm, and Chrome for the checks.

1. `git pull` so you have `Essential_task_delegation/T3_Website/`.
2. In that folder:
   ```text
   npm install
   npm run fixtures
   npm run dev
   ```
3. Open the address it prints (http://127.0.0.1:3000, or the next free port), then `/a` for the chosen look.

**What you'll see that Abrar doesn't:** no satellite photos. The stand-in pairs take their photos from xBD's original files, which are only on Abrar's PC (`data/` is git-ignored). Without them the map shows "No photo of this pair is on this device"; the outlines, masks and numbers are still real. That's expected. If you have xBD's `train/images` folder, put it at `data/xView2 Challenge Dataset - train and test/train/images/` in the repository and run `npm run fixtures` again.

## 5. Where everything is

| Path | What it holds | Can you change it? |
|---|---|---|
| [T3_Website/README.md](../T3_Website/README.md) | Every command, the deploy steps, the rules the code keeps | Yes, keep it current |
| [T3_Website/NOTES.md](../T3_Website/NOTES.md) | Contradictions found and open questions for Abrar | Add to it; don't delete his questions |
| [T3_Website/DATA_CONTRACT.md](../T3_Website/DATA_CONTRACT.md) | The exact files the gallery export must write | **No.** Abrar's export notebook is built against it. Ask first |
| [src/data/facts.json](../T3_Website/src/data/facts.json) | **Every number on the site**, with its source file and date | Only by the rules in section 6 |
| [src/core/](../T3_Website/src/core/) | The building table from a mask, the fixed queries, the facts and gallery loaders, the damage colours | Carefully; `npm run selfcheck` and `npm run palette` test it |
| [src/components/](../T3_Website/src/components/) | The map view (`OfflineCanvas.tsx`), the workspace and its panels, the reports and benchmark panels, the scroll story | Yes |
| [src/directions/](../T3_Website/src/directions/) | The three looks of phase 1; A is chosen | Yes (see section 8, item 1) |
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
- **Lighthouse:** the site must keep 90 or more for performance and accessibility with phone settings (Chrome's developer tools, Lighthouse tab, "Mobile"). It was last measured before the scroll story, the background and the crosshair went in, so measure it again before your first push.
- `browser-check` takes screenshots at 390 px and 1440 px into `checks/screenshots/`, clicks a building, a count and a fixed question, and fails if any request leaves 127.0.0.1. Look at the screenshots yourself too.
- Then check that `git status` shows changes only inside `T3_Website/`, and stage only that folder:
  ```text
  git add -- Essential_task_delegation/T3_Website
  ```

## 8. What's next, in order

Do them one at a time, push each, and tell Abrar what you changed.

1. **Make A the site.** Remove directions B and C (`DirectionB.tsx`, `DirectionC.tsx`, `b.css`, `c.css`), the review bar and chooser in [src/App.tsx](../T3_Website/src/App.tsx), and [src/review.css](../T3_Website/src/review.css). Then set up the seven pages below as routes, sharing A's header and footer.
   - **Update [scripts/browser-check.ts](../T3_Website/scripts/browser-check.ts) in the same change.** Its page list defaults to `/,/a,/b,/c`, and it expects the building map on every page it visits. Point it at the new routes, and run the map checks only on the page that has the map. Change what it visits, never what it checks.
2. **The seven pages** (names and order can change; the content is fixed):
   1. **Home:** the small before/after pair with the damage map, one sentence on what the system does, the decision-support line. It exists now as A's opening section.
   2. **How it works:** the scroll story, already built ([ChainStory.tsx](../T3_Website/src/components/ChainStory.tsx)).
   3. **Explore:** the building map ([Workspace.tsx](../T3_Website/src/components/Workspace.tsx)), plus **the 3D damage city**: each building's outline raised into a block coloured by class, with schematic heights (destroyed as low slabs), labelled "a 3D view of our 2D results, not a reconstruction". It replaces your old 3D toggle, built from the outlines in `buildings.json`.
   4. **Try it:** the field model running in the visitor's browser. **Phase 3: ask Abrar before starting.** It has its own pass rules (the same class as the native run on at least 99.9% of pixels, and a heatmap port matched against T1 v3).
   5. **Results:** the benchmark tables as charts, each number with its source link and its image set. The tables exist in [ResultsTables.tsx](../T3_Website/src/components/ResultsTables.tsx).
   6. **Reports:** the six reports in full, from [DisasTellerReportsModal.tsx](../T3_Website/src/components/DisasTellerReportsModal.tsx) turned into a page, plus:
      - above them: about DisasTeller's Wajima sample photos, not our pairs; written by our 7B with the internet off; quality not judged yet;
      - the run's evidence from `t2_run_summary.json` and `netlog.json` (the rules it passed, 4 network connections all to 127.0.0.1, no Gemini library loaded);
      - the 18 guideline searches behind the reports. **Done as data:** [public/guidelines/searches.json](../T3_Website/public/guidelines/searches.json) holds all 18 with their passages, and [GuidelineSearch.tsx](../T3_Website/src/components/GuidelineSearch.tsx) shows them; reuse both on the Reports page;
      - **download and copy** for each report: done (3.6);
      - each of the Expert team report's 11 citations beside the passage it cites, from `llm_calls.jsonl` and the guideline files in `Offline_RAG_KR2/`. If a passage can't be found, say so; don't guess. One of them, `[EMS98-rc-grade-5]`, is a real passage the model wasn't shown;
      - say plainly that only one report cites passages by name;
      - flag known errors inline, never edit the text. Two are flagged now (the hotline "123456789" and the hall as a "temporary command center"). The others are in Ridita's [README](../Offline_RAG_KR2/README.md), section "Practice run 5", "Quality problems" (for example the wrong map reading repeated in three reports).
   7. **About:** the limitations below, the future ideas, the team, and the credits (DisasterM3, xBD, Qwen2.5-VL, SAM 3, DisasTeller, ONNX Runtime Web), and that the workspace began as your prototype. Leave a place for the supervisor line: Abrar adds it. **The limitations and the future ideas exist** as sections of A ([AboutSections.tsx](../T3_Website/src/components/AboutSections.tsx)); move them onto the About page and add the team and credits.
3. **The limitations the About page states** (already written in `AboutSections.tsx`; each number from `facts.json`, in plain words, as rule 6 of section 6 says):
   - the parts don't run as one chain yet;
   - distances and areas are in pixels;
   - building counts are weak: about a third of the benchmark's counting questions answered right, like the base 7B;
   - from 18 Nov: those questions can be answered 66.98% right without looking at the image, so counts are judged by their error against the true masks;
   - without a before-image, damage is much harder to find: on the after-image alone, SAM 3 covers only 9% of the destroyed-building area;
   - in 52% of the pairs measured, the before and after images are shifted by more than 2 px (Ridita's audit);
   - from 18 Nov: on the test pairs, the before-and-after model largely misses the Turkey earthquake's destroyed buildings (destroyed IoU 0.0867, against 0.3233 for find-then-grade);
   - the reports' quality hasn't been judged, and they contain errors;
   - no language model has been measured on a laptop CPU or a phone yet.
4. **Your bridge feeds this site.** When `format_disaster_facts` is fixed (review, section 7), the gallery export writes its text as `report_inputs.txt` per pair, and the inspector shows it word for word under "What the report writer is given for this pair". Until then it shows as missing.

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
- Never weaken a check in scripts/. You may change which pages scripts/browser-check.ts visits (section 8, item 1),
  never what it checks.
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
