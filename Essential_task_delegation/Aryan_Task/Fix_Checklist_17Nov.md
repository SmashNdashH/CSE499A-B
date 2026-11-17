# Did Aryan follow the review? Checklist for his push of 17 Nov

His push: commit `648b35c92` (17 Nov, 11:59), with his change list [CHANGES.md](CHANGES.md). The instructions: [Review_and_Fix_List.md](Review_and_Fix_List.md), sections 1 to 9.

**How to use this:** tick each box after you've checked it yourself. Each item says what the review asked, where to look, and what I found.
- **His site:** http://127.0.0.1:4180/, served from a built copy of exactly his pushed files, while it runs.
- **His files:** paths are relative to `Essential_task_delegation/Aryan_Task/`.

**What I found, in short:** of 39 items, 26 pass, 6 pass only in part, 6 fail, and 1 isn't due yet. Of the 6 fails:
- 3 are in the bridge: the safe areas, the default values, and new advice text;
- 3 are numbers: the counting card's baseline, the retrieval card's target, and the 23.58% note.

**What I ran:**
- his site's `npm run lint` and `npm run build` (both pass);
- headless Chrome on his built site: every request and console error recorded;
- the six embedded reports compared with the run's files;
- the review's bridge checks with the real building table and heatmap file;
- the U-Net row recomputed from his v3 run file.

---

## Section 1: invented assessments of real places

- [ ] **1. Pazarcık, Fort Myers, WorldView-3 and the drone imagery are gone.**
  - Check: the scenario buttons at the top of the site say "Sector Alpha Simulation (Illustration)" and "Sector Beta Simulation (Illustration)".
  - Found: **PASS.** No match for Pazarc, Fort Myers or WorldView anywhere in `Website/src`.
- [ ] **2. No real coordinates.**
  - Check: `Website/src/data/mockScenarios.ts`, lines 10–11: `centerLat: 0.0000`, `centerLng: 0.0000`.
  - Found: **PASS.**
- [ ] **3. "Illustration: not real data" on every view that shows the made-up buildings.**
  - Check: the map's watermark, the bottom of the layers panel, the inspector, the bottom bar, and the share panel.
  - Found: **PASS.** One small thing: the made-up grid still shows a ground scale, "0.3m/px equivalent" (bottom left of the map), and some made-up buildings carry advice-like notes ("Suitable for field staging"). Both are labelled as illustration, but a scale and advice are claims our data can't make.

## Section 2: invented data model, outputs and features

- [ ] **4. The building fields are H2's columns; floors, collapse type, void likelihood, sensor, confidence, polygon and xBD's four damage levels are gone.**
  - Check: `Website/src/types/disaster.ts`.
  - Found: **PASS.** It keeps a few display-only fields for the made-up buildings (id, name, quadrant, notes, lat, lng).
- [ ] **5. The console answers only what the table can answer, with no default values (`|| 300`, `|| 250`).**
  - Check: the inspector's "SQL Queries" tab; `Website/src/components/FixedQuestionConsole.tsx`.
  - Found: **PASS.** No data defaults left. Line 44's `||` only picks which building is selected.
- [ ] **6. The reports are the real proof-run files, with their path; no "MODE: OFFLINE, FIXED FLOW" or "TELEMETRY: OFF" labels on hand-written reports.**
  - Check: the "Proof Reports" button.
  - Found: **PASS.** I compared all six with the run's files: each is word for word the same.
  - The panel's note understates two errors. It calls the made-up hotline "a placeholder hotline number", and his README calls the wrong map reading "a misread map coordinate in section 2". In fact the map reading said there were no dangerous zones.
- [ ] **7. Thermal, sensor and K9 advice and "Tactical Directives" are removed, or moved to a "Future ideas" page.**
  - Check: the inspector's "Future Ideas" tab.
  - Found: **PASS.** Thermal imaging appears only there, labelled "(Concept)" and "Not Implemented".

## Section 3: wrong or mixed numbers

- [ ] **8. Find-then-grade: 0.316, 0.305 and 0.298 (mean 0.307), mean IoU 0.547. The before-and-after U-Net: 0.588 on all 645 pairs, 0.269 on the clean pairs.**
  - Check: "Scorecard (O1–O4)", the O1 card.
  - Found: **PASS** for the numbers. The source path it gives, E5 step 2's README, doesn't hold them: they're in `Champion_Task/R16c-results/step5b/README.md`.
- [ ] **9. The method is named "SAM 3 + grader", not "R11 + SAM 3".**
  - Found: **PASS.** "SAM 3 Building Finding + Siamese ResNet-18 Grader".
- [ ] **10. O1's baseline is 0.2689 (the first U-Net with TTA, clean pairs).**
  - Found: **PASS.**
- [ ] **11. Counting is 32.96% (32.47% without the copied images), below the 34.2% target.**
  - Check: "Scorecard (O1–O4)", the O2 card.
  - Found: **FAIL as shown.** The sentence is right, but the score bar reads "0.3296 (Baseline / Target: 0.3009)". That says the target was beaten.
    - 30.09% is our own fine-tuned 7B at full size, not a baseline or a target. The target is the base 7B's 34.2%, and it isn't met.
    - The card's reasoning line also calls 30.09% "base 7B direct counting", which is the wrong model.
- [ ] **12. The 0.2230 counting baseline (no source) is gone.**
  - Found: **PASS.**
- [ ] **13. Team names are right, and each person is credited only for work the ledger records as theirs.**
  - Check: "Scorecard (O1–O4)", then "3. Group 5 Team & Ledger"; also his `Website/README.md`, section 5.
  - Found: **PARTLY.** All five names are right. But Tamanna is credited as "Edge Quantization Lead" for the 8-bit field model's results. The ledger records those runs as yours, following her Plan 1. Check with her.
- [ ] **14. Other numbers on the cards.**
  - Found: **FAIL, small.**
    - The O3 card calls the fixed flow a "Fixed-Flow 4-Agent Pipeline". The fixed flow is the one without agents.
    - Its bar reads "0.9 (Baseline / Target: 0.667)". 0.667 is the meaning-only search (20 of 30); the pass bar was 24 of 30 (0.8).
- [ ] **15. Update 4's claims (the building schema, "no invented numbers", "zero requests") are corrected in update 5.**
  - Found: **not due yet.** Check his update 5 section.

## Section 4: offline, and cloud leftovers

- [ ] **16. Google Fonts are gone.**
  - Found: **PASS.** System fonts only.
- [ ] **17. Satellite tiles are off by default and labelled as online.**
  - Check: top left of the map, "Online satellite basemap (requires internet)", "OFF (Default)".
  - Found: **PASS.**
- [ ] **18. `@google/genai`, `express`, `dotenv`, `GEMINI_API_KEY`, the AI Studio capability in `metadata.json` and the Cloud Run URL are gone.**
  - Found: **PASS.**
- [ ] **19. Sounds are off by default, and confetti is gone.**
  - Check: the "Audio muted (default)" button.
  - Found: **PASS.**
- [ ] **20. With the site open, no request leaves the PC.**
  - Found: **PASS.** Headless Chrome recorded 4 requests on load, all to the local server. The only console error is a missing `favicon.ico`.

## Section 5: copied documents and junk

- [ ] **21. `Website/public/assets/aistudio/` is deleted.**
  - Found: **PASS.** The whole `public/` folder is gone.
- [ ] **22. `Untitled-1.ipynb` at the repository root is deleted.**
  - Found: **PASS.**
- [ ] **23. `Website/README.md` says what the site is, how to run it, where every number comes from, and what is illustration.**
  - Found: **PARTLY.** All four parts are there, but some sources are wrong:
    - SAM 3's 0.630 and the find-then-grade scores are credited to E5 step 2's README (they're in `Champion_Task/E3-results/E3/README.md` and `R16c-results/step5b/README.md`);
    - the 8-bit model's numbers are credited to update 3 and the ledger (they're in `Champion_Task/L1B-results/L1b/README.md`).
  - Not asked, but worth telling him:
    - four unused stock photos are still in `Website/src/assets/images/`;
    - `Website/` has no `.gitignore`, so an `npm install` followed by a broad `git add` would commit `node_modules`.

## Section 6: the counting study (`BDC-v4-results/`, `BDC_PIPELINE_REPORT_v4.md`)

- [ ] **24. The U-Net row shows the real run (23.96%), and the duplicate CSV is removed.**
  - Check: `BDC-v4-results/README.md`, line 23.
  - Found: **PARTLY.** 23.96% [22.0–26.0] is right, and the copied file is gone. But two other cells in that row are typed in, not taken from the run file (`BDC-v3-results/bdc_ft_unet-B1cls_image.csv`):
    - "Strict Acc (M)" says 23.96%; on those 1,701 questions the run file gives 23.93%;
    - "Unparsed" says 0; the run file has 4 answers that aren't a letter.
- [ ] **25. Criterion 2 is reported as failed, as written before the run; the paired test (230 against 177, p = 0.01) is a separate result; the 500-question comparison chosen after the run is removed.**
  - Check: README line 38; the report, lines 184–185.
  - Found: **PASS.**
- [ ] **26. The "32.96% upper bound" claim is replaced by 37.0% (the table alone) against 27.0% (the VLM given that count).**
  - Check: README line 39; the report, lines 189 and 200.
  - Found: **PASS.**
- [ ] **27. The TEOChat quote's second sentence is removed.**
  - Found: **PASS.**
- [ ] **28. The 23.58% fine-tuned baseline is corrected.**
  - Check: the report, lines 24–33.
  - Found: **FAIL.** The table still shows 23.58% with a "Regression −10.62%" row. The new note says both figures "come from the full benchmark evaluation (including intact buildings and SAR imagery)", which is wrong for 34.2%: that's the DisasterM3 paper's base model on optical questions. The note does add our measured 30.09% (32.01% at 512 px).
- [ ] **29. The README says every run used 4-bit.**
  - Found: **PASS.**
- [ ] **30. The empty `result` file is deleted.**
  - Found: **PASS.**

## Section 7: the bridge (`Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py`)

- [ ] **31. (7.1) An image that isn't in the table returns `"image_not_in_table"`.**
  - Found: **PASS** (line 34).
- [ ] **32. (7.2) Safe areas are read from `xy` and `distance_px`.**
  - Found: **FAIL.** Lines 110 and 112 still read `point_xy` and `dist_to_damage_px`. With the real heatmap file, `turkey_earthquake4_post_776.png` prints "Safe Zone #1: centroid at (x=0, y=0) … distance from rubble: 0 px". The review's check expects (268, 593), 219 px.
- [ ] **33. (7.3) Both statuses are checked, and an image with no data gets text saying so.**
  - Found: **PASS.** An image in neither file prints "Image not found in building database" and "Image not found in hotspots data", with no zero counts.
- [ ] **34. (7.4) No default values for missing fields.**
  - Found: **FAIL.** Lines 97–100 and 109–112 still fill a missing rank, position, sector, area or distance with 1, `[0, 0]`, "unspecified" or 0.
- [ ] **35. (7.5) No "GROUND TRUTH" title; a model or heatmap is named only when passed in.**
  - Found: **PARTLY.** The hard-coded "R11" and "T1 v3" are gone, but line 74 still prints `=== GROUND TRUTH DAMAGE FACTS FOR IMAGE: … ===` over a model's estimates.
- [ ] **36. A self-check covering the five cases.**
  - Run: `python disasteller_inputs.py` in that folder.
  - Found: **PARTLY.** It runs and passes, but:
    - case 4 checks only that hot spots exist, not that the safe areas' real positions and distances appear in the text. That's how 7.2 got through;
    - case 5 tests the lookup, not the text.
- [ ] **37. Not connected to the fixed flow; both paths are required parameters.**
  - Found: **PASS.**
- [ ] **38. Nothing new invented.**
  - Found: **FAIL (new).** The text now tells the report writer "deploy USAR teams here" (line 95) and "deploy triage/shelter here" (line 107). That's advice our system never produced: hot spots only show where damage is densest.

## Sections 8 and 9: the checks I promised him, and his change list

| Review check | Result | Items |
|---|---|---|
| 1. No Google Fonts, tiles, Cloud Run, Gemini | PASS (tiles only behind the labelled, off-by-default switch) | 16–18 |
| 2. No pancake, void, K9, FLIR, thermal, WorldView, Pazarcık, Fort Myers | PASS (thermal only in the Future Ideas tab) | 1, 7 |
| 3. No `fixed_flow.py`, Kaggle Offline Session or TELEMETRY on made-up reports | PASS | 6 |
| 4. Every number from a data file, with its source path | PARTLY: two cards mislabelled, several source paths wrong | 8, 11, 13, 14, 23 |
| 5. The files are gone | PASS | 21, 22 |
| 6. `npm run build` and `npm run lint` pass | PASS (I ran both on a copy) | — |
| 7. The counting study's three corrections | PASS for the three; two typed-in cells and the 23.58% note are wrong | 24–30 |
| 8. The bridge | FAIL: safe areas at (0, 0), and "GROUND TRUTH" | 31–38 |
| 9. `CHANGES.md` lists every change with file and line | PARTLY, see item 39 | 39 |

- [ ] **39. `CHANGES.md` is accurate.**
  - Found: **PARTLY.** It lists the files but gives no line numbers, and some entries don't match the files:
    - it says `.env.example` now holds `VITE_APP_TITLE` and `VITE_OFFLINE_MODE`; the file holds `PORT` and `HOST`;
    - for the counting study it lists "U-Net row: corrected destroyed IoU mean to 0.307", "Criterion 2 … FAIL at 32.96% (below 50% threshold)" and "Baseline IoU corrected to 0.2689". None of these is what changed, and the README itself is right on all three points;
    - it says the bridge used to raise `KeyError` for a missing image; it returned zeros with "ok";
    - it's dated 15 Nov, but was pushed on 17 Nov.

---

## What to ask him to fix

1. **The bridge** (items 32, 34, 35, 38): read safe areas from `xy` and `distance_px`; no default values; replace the "GROUND TRUTH" title; remove "deploy USAR teams here" and "deploy triage/shelter here"; make self-check case 4 assert that (268, 593) and 219 px appear in the text for `turkey_earthquake4_post_776.png`.
2. **The counting card** (item 11): show 34.2% as the target, label 30.09% as our fine-tuned 7B, and say the target isn't met.
3. **The retrieval card and the O3 label** (item 14): the bar is 24 of 30; the fixed flow has no agents.
4. **The counting study** (items 24, 28): take every cell of the U-Net row from the run file, and fix or remove the 23.58% row and its note.
5. **Sources and credits** (items 8, 13, 23): point each number at the file that holds it; check Tamanna's credit with her.
6. **`CHANGES.md`** (item 39): line numbers, and entries that match what changed.
