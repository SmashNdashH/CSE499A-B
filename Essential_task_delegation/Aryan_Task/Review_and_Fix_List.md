# Review of Aryan's work, and the fixes needed (15 Nov 2026)

From Abrar. This covers four pieces of your work:
1. the website (`Website/`, pushed 12 Nov);
2. your section of update 4 (11 Nov);
3. the counting study (`BDC-v3-results/`, `BDC-v4-results/`, the v4 report);
4. the DisasTeller bridge (`Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py`, 4 Nov).

Every finding gives its evidence (file and line) and the correct value with its source. Section 8 lists the checks I'll run on your fixes. Section 9 is an instruction you can paste into your AI assistant as it is.

**Please have everything fixed and pushed before the next update (Wed 18 Nov).** Sections 1 and 2 come first.

## In short

**What holds up:**
- **The counting result we build on.** Your v4 data, once rechecked, show that the building table alone beats the VLM given the same count by 10 points. That's the evidence behind answering counting questions from the table, not the VLM.
- **The oracle ceiling (96.5%)** from your v3 study.
- **On the site:** the map and building-inspector layout, the offline-mode idea, and several correct numbers: SAM 3's 0.630, the edge model's 33 MB, 1.6 s and 1.43×, the table's 117,687 buildings, and the 27 of 30 retrieval score.

**What must change, most serious first:**
1. **The website presents invented damage assessments of real buildings, at real coordinates in Pazarcık, Türkiye, as our system's output.**
2. **Invented data and numbers are presented as ours:**
   - a building table with fields our system doesn't produce;
   - reports labelled as output of `fixed_flow.py`;
   - mixed-up scores.

   Your update 4 section repeats the table claim.
3. **The three corrections to the counting study,** open since 28 Oct.
4. **The bridge's missing-image bug,** open since 4 Nov.
5. **Housekeeping:**
   - our internal documents copied into the site's public folder;
   - cloud leftovers in an "offline" site;
   - a junk notebook at the repository root;
   - team members' names wrong.

## Where my work stands (15 Nov), so you can work in parallel

These results aren't in the weekly updates yet; they go into update 5 (Wed 18 Nov).

- **A second test set (E6, 7 Nov):** 2,007 clean before-and-after pairs from the benchmark's own test split, with true damage masks rebuilt from its per-class masks. The masks give the exact true count for all 3,470 counting questions on these pairs. [E6 results](../Champion_Task/E6-results/E6/README.md).
- **The benchmark's counting questions give their answer away (7 Nov):**
  - Whenever a question's largest option is above 20 (1,581 of the 3,583 optical counting questions), the five options are 0.6, 0.8, 1, 1.2 and 1.4 times the true count, so the middle one is always right.
  - A rule that never sees the image scores 66.98%; always picking the middle option scores 53.95%.
  - So accuracy on these questions can't show counting ability. That covers the 34.2% target and your v3 and v4 numbers too. We now report count error (the distance from the true count) beside accuracy.
  - [benchmark-option-rule-check.ipynb](../Champion_Task/benchmark-option-rule-check.ipynb).
- **Both damage-map models on unseen pairs (E7 step 2, 11 Nov):**
  - Destroyed-building IoU 0.3898 for find-then-grade (the mean of three graders) and 0.3984 for R11; mean IoU 0.5129 and 0.5721.
  - A resampling test (step 2b) shows the overall gap is noise, but the models split by event: R11 is clearly better outside Turkey (by 0.057), and find-then-grade is far better on Turkey (by 0.236).
  - By the rule fixed before the run, which model feeds the building table is open again; I'm deciding it next.
  - Counting from either model's table: 32.7% and 32.53% on the clean questions (no clear difference, p = 0.87); median count error 40% and 38%.
  - [Step 2](../Champion_Task/E7-results/step2/README.md), [step 2b](../Champion_Task/E7-results/step2b/README.md).
- **The 3B (L2 step 2, built 8 Nov, not run yet):** two training variants, chosen between on 1,962 held-out questions by a rule fixed before training:
  - (b) the 7B's soft labels;
  - (c) the 7B's answers with the options shown.

  The five Kaggle notebooks are `Champion_Task/l2-step1b-soft-labels.ipynb` to `l2-step4-winner-benchmark.ipynb`.
- **What this means for your tasks:**
  - The bridge's table must come from whichever model is chosen (section 7).
  - In counting work, report count error, not only accuracy.
  - The site's building table should have exactly the chosen model's columns (H2's).
  - Keep these results off the public website until they're in update 5. The site sticks to the facts in section 9.

## 1. The website shows invented assessments of real places (fix first)

**Evidence:**
- `src/data/mockScenarios.ts`, lines 15–25: a scenario called "Kahramanmaraş Urban Sector 4, Pazarcık, Türkiye", with "WorldView-3, 0.3 m" imagery from January and February 2023.
- Lines 46–300: twelve buildings with names ("Municipal Annex A" and so on), real latitudes and longitudes (37.5768, 36.9208), floor counts, "Pancake" collapse, void likelihood and sensor advice.
- `src/components/ResponderMap.tsx` (lines 56–57) and `SplineCanvas.tsx` (lines 46–47) draw them over real satellite tiles of that town.
- `sampleVlmResponse` (line 34 on) is a "Tactical Directive": "multi-tier pancake collapse (4–5 residential storeys…)".
- The second scenario, lines 368–378, is "Fort Myers Coastal Strip, Florida" from "Drone RGB 0.1 m".

**Why it's serious:**
- Pazarcık was hit by the February 2023 earthquake that killed tens of thousands of people.
- The site puts collapse verdicts, floor counts and void estimates on real buildings at real coordinates, and presents them as our system's output. None of it was produced by our system or taken from any data.
- A visitor can't tell it from a real assessment.
- We have no WorldView-3 or drone imagery of these places.

**Fix, one of:**
- **(a)** Show only real outputs of our pipeline on DisasterM3 images, each with its source file.
- **(b)** Use clearly fictional placeholders, with no real place names and no real coordinates, labelled **"Illustration: not real data"** on every view where they appear.

Until (a) is possible, use (b).

## 2. Invented data model, outputs and features

**The building fields** (`src/types/disaster.ts`, lines 4–22):
- Our per-building table (H2) has these columns: `image`, `building_id`, `class_id`, `class_name` (intact, damaged or destroyed), `area_px`, `centroid_x`, `centroid_y`, `bbox_x`, `bbox_y`, `bbox_w`, `bbox_h`, `dist_to_nearest_destroyed_px`.
- The site adds `floors`, `collapseType`, `voidLikelihood`, `sensorRecommendation`, `confidence` and `polygon`. Our system produces none of them.
- It also uses xBD's four damage levels (no, minor, major, destroyed). DisasterM3, and so our system, uses three (intact, damaged, destroyed).
- Source: the table as built in [h2-sql-counting-agent.ipynb](../Champion_Task/h2-sql-counting-agent.ipynb).

**The console's "computed" answers** (`src/components/FixedQuestionConsole.tsx`):
- They are computed over the invented buildings.
- Missing areas are filled with made-up values: `b.areaM2 || 300` (line 71) and `b.areaM2 || 250` (line 150).
- The questions it offers ("pancake collapse", "live-void probability") can't be answered by our system.

**The reports:**
- `DisasTellerReportsModal.tsx` (lines 143–149) shows "MODE: OFFLINE, FIXED FLOW" and "TELEMETRY: OFF".
- `mockScenarios.ts` (lines 311–313 and 526–528) labels them `fixed_flow.py (deterministic tool execution)`, "10 Nov 2026, 08:14 UTC (Kaggle Offline Session, Telemetry: OFF)".
- They are hand-written Turkey reports. The real reports from that flow are about Wajima, Japan, and have known problems: a wrong map reading, a made-up hotline number, few citations. They are in `../Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/`.
- Show those, labelled with their path, or label yours as illustrations.

**Features we don't have:** the "FLIR thermal simulation" layer, sensor and K9 recommendations, and "Tactical Directives" all come from the CSE499A proposal's first plan, which was replaced by DisasterM3. Remove them, or move them to a clearly marked "future ideas" page.

## 3. Wrong or mixed numbers (website and update 4)

| Claim | Where | What's wrong | Correct value and source |
|---|---|---|---|
| "Destroyed IoU 0.3161 on clean validation data (0.3065 3-seed mean), mIoU 0.588" | `mockScenarios.ts`, line 583 | 0.3161 is find-then-grade's grader seed 42 on the 605 clean pairs; 0.588 is R11's mean IoU on all 645 pairs, a different model on a different set | Find-then-grade, clean: destroyed IoU 0.316, 0.305 and 0.298 with three graders (mean 0.307), mean IoU 0.547. R11: mean IoU 0.588 (all 645 pairs), clean destroyed IoU 0.269. [Update 3](../../others/CSE499B_update_3.pdf); [Task_Ledger.md](../Task_Ledger.md), E5 entry |
| "R11 6-Channel U-Net + SAM 3 Find-then-Grade" | line 581 | The map that passed is SAM 3's outlines graded by our grader, without R11. The versions that used R11's pieces failed on clean data | As above |
| Baseline 0.2686 for O1 | line 585 | R1's score on all 645 pairs, compared with a clean-pair score | Same set on both sides: R1 with TTA on the clean pairs, 0.2689 ([E5 step 2's per-image counts](../Champion_Task/E5-results/step2/README.md)) |
| Counting 39.2% (0.3924) | lines 600 and 603 | That's R11 on 1,055 training-split questions on the validation images, not the benchmark | Benchmark: 32.96% (32.47% without duplicated images), below the 34.2% target ([H2's results](../Champion_Task/H2-results/H2/README.md)) |
| Counting baseline 0.2230 | line 602 | No source found | Remove, or cite its file |
| Team names | lines 672–676 | "Aryan Bin Karim", "Tamanna Chowdhury" and "Noman" are wrong | Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam (the header of every update). Credit each person only for work the task ledger records as theirs, and check each role with them |
| **Update 4:** "the full H2 building schema … polygon footprint, floor count, EMS-98 grade (1–5), live trapped-person estimate and ingress vector" | your section of update 4 | Not our schema (section 2) | Correct it in update 5 |
| **Update 4:** "computed from the table: no format errors, no invented numbers" | same | The table is invented, and missing areas default to 300 and 250 m² | Correct it in update 5 |
| **Update 4:** "zero HTTP or WebSocket requests to outside services" | same | Google Fonts load on every page; satellite tiles load in online mode (section 4) | True only after section 4's fixes |

These are correct as they stand:
- "59.5% in E1" (line 582);
- SAM 3's 0.630 (line 590);
- 117,687 buildings across 2,652 images (line 600);
- 27 of 30 retrieval, bar 24 (line 617);
- 33 MB, 1.6 s per 1024 px image, 1.43×, a 0.0003 drop (line 634).

## 4. "Offline", but not offline, and cloud leftovers

- **Google Fonts** (`index.html`, lines 12–14) load from `fonts.googleapis.com` on every visit. Put the font files in the site.
- **Satellite tiles** (`ResponderMap.tsx` lines 56–57, `SplineCanvas.tsx` lines 46–47) come from `server.arcgisonline.com`. Keep online mode off by default and label it; offline, show our own images.
- **Leftovers from Google AI Studio:**
  - `@google/genai`, `express` and `dotenv` in `package.json`;
  - `GEMINI_API_KEY` in `.env.example`;
  - `"MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"` in `metadata.json`;
  - a hard-coded Cloud Run URL in `ShareExportModal.tsx`, line 41.

  Our system uses no cloud model, so remove them.
- **Effects:** radio-chirp sounds play on every click (`src/utils/audio.ts`, called from the modals and the console), and `canvas-confetti` is a dependency. A decision-support tool shouldn't play effects by default. Remove them, or make them opt-in and off.

## 5. Copied internal documents and junk

- **`public/assets/aistudio/`** holds copies of our old README, the T2 README, System_Design_Notes, the Task Ledger and update 3. A deployed site would serve them to anyone.
  - They are stale snapshots.
  - The ledger includes the team's review notes.
  - Delete the folder. If the site needs them, link to the files on GitHub.
- **`Untitled-1.ipynb`** at the repository root: a single cell ("tell me") with a syntax error and your PC's path. Delete it.
- **There's no README in `Website/`.** Add one saying:
  - what the site is;
  - how to run it (`npm install`, `npm run dev`);
  - where every number comes from;
  - what is illustration.

## 6. The counting study: three corrections open since 28 Oct

These were sent on 28 Oct and again on 4 Nov. `BDC-v4-results/README.md` hasn't changed since 27 Oct. The full recheck is in [Task_Ledger.md](../Task_Ledger.md), §9, "Aryan · Counts in the prompt".

1. **The U-Net row is a copy.** `bdc_ft_unet-B1cls_image.csv` is byte-identical to `bdc_ft_image_only.csv`, so the U-Net row (15.56%, README line 23) is the image-only run. Remove it, and cite the real U-Net run, 23.96%.
2. **Criterion 2 failed, as written before the run** (line 10: "non-overlapping 95% Wilson confidence intervals").
   - R11's 27.04% [25.0, 29.2] and the U-Net's 23.96% [22.0, 26.0] overlap. Report it as failed.
   - Add the paired test as a separate result: R11 is ahead on 230 questions against 177 (exact McNemar, p = 0.01).
   - Line 36's comparison on the 500-question subset was chosen after the run. Remove it, or label it that way.
3. **"32.96% … the table's upper bound … retaining ~82–91%" (line 37) is wrong.**
   - 32.96% is H2's score on all 3,583 optical questions, intact included.
   - On your own 1,701 questions, picking the option nearest R11's count scores 37.0% (35.4% if ties count as wrong). That's 10 points above the VLM given that count (27.0%): only the table is right on 290 questions, only the VLM on 121 (p < 10⁻¹⁶).
   - Your update 4 text already says this. The README must match it.

**Smaller points:**
- the TEOChat quote's second sentence isn't in the paper;
- the 23.58% fine-tuned baseline doesn't match our measurements (30.09% at full size, 32.01% at 512 px, optical);
- say that every run used 4-bit;
- delete the empty `result` file.

## 7. The DisasTeller bridge (`disasteller_inputs.py`)

- **The bug, unchanged since 4 Nov:**
  - Line 44 starts the counts at zero with `"status": "ok"`, so an image that isn't in the table returns 0 intact, 0 damaged and 0 destroyed with status "ok". A report could then say "0 buildings" about an image that was never analysed.
  - Return `"status": "image_not_in_table"` instead, as the hot-spot function already does (line 71, `"image_not_found"`). The caller must then stop, or write "no data" for that image.
- **Add a self-check:** a few `assert`s for three cases: an image in the table, an image not in it, and a missing database.
- **Don't connect it to the fixed flow yourself.** Ridita owns `fixed_flow.py`, and the model that feeds the table is chosen before T2 step 5; E7 reopened that choice on 11 Nov (see "Where my work stands"). Keep the function's inputs and outputs stable.
- **Take both inputs from the same model.** Today the table (H2) comes from R11 and the hot spots (T1) from R9, and they share only 7 images. Make both paths required parameters, with no defaults pointing at the current, mismatched files.

## 8. The checks I'll run on your fixes

1. `grep -rn "fonts.googleapis\|arcgisonline\|run.app\|genai\|GEMINI" Website/`: no match, except a labelled online-tiles option that is off by default.
2. `grep -rn -i "pancake\|void\|K9\|FLIR\|thermal\|Tactical Directive\|WorldView\|Pazarc\|Fort Myers" Website/src`: no match, except inside text labelled as illustration.
3. `grep -rn "fixed_flow.py\|Kaggle Offline Session\|TELEMETRY" Website/src`: no match, unless the real proof-run reports are shown with their path.
4. **Every number on the site comes from one data file with a source path next to it.** I'll check each against the repository.
5. **The files are gone:** `public/assets/aistudio/`, `Untitled-1.ipynb` and the AI Studio leftovers.
6. **The site builds and type-checks:** `npm run build` and `npm run lint` pass. Paste their last lines.
7. **The counting study:** `BDC-v4-results/README.md` and `BDC_PIPELINE_REPORT_v4.md` carry the three corrections, and the duplicate CSV is removed.
8. **The bridge:** `get_building_counts("not_in_table.png", db_path)` returns `"image_not_in_table"`, and the self-check passes.
9. **`CHANGES.md` in `Aryan_Task/`** lists every change, with file and line.

## 9. Instruction for your AI assistant (paste everything in the box)

```text
You are fixing a student project in the GitHub repository SmashNdashH/CSE499A-B. Work only inside
Essential_task_delegation/Aryan_Task/ (the website is in Website/), plus deleting the file Untitled-1.ipynb at the
repository root, plus the single file Essential_task_delegation/Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py.
Do not edit any other member's folder.

HARD RULES
1. Never invent data, numbers, building attributes, place names, coordinates, imagery sources, report text or provenance.
   Every number shown on the site must come from the list of allowed facts below or from a file in this repository,
   and the site must show or store its source path. If a fact is missing, leave a visible "TODO: source needed" and tell me.
2. Anything illustrative must use fictional names, no real place names, no real coordinates, and be labelled
   "Illustration: not real data" on every screen where it appears.
3. Nothing may claim to be output of our system (fixed_flow.py, DisasTeller, Kaggle runs) unless it is the real file from
   Essential_task_delegation/Offline_RAG_KR2/results/t2_proof/t2_run_internet_off/run/reports/offline/, shown with its path.
4. The site must make no network request by default: self-host the fonts; online map tiles only behind a toggle that is
   off by default and labelled "online". No cloud AI SDKs, no API keys, no deployment URLs.
5. No new dependencies. Keep the existing look where you can. Keep every change small and list it in Aryan_Task/CHANGES.md.

TASKS (details, with file and line, are in Essential_task_delegation/Aryan_Task/Review_and_Fix_List.md)
A. Website, data:
   - remove or relabel the invented scenarios (Pazarcik, Fort Myers), buildings and sample VLM responses (section 1);
   - make the building type match our table: image, building_id, class_name (intact | damaged | destroyed), area_px,
     centroid_x, centroid_y, bbox_x, bbox_y, bbox_w, bbox_h, dist_to_nearest_destroyed_px; drop floors, collapseType,
     voidLikelihood, sensorRecommendation, confidence, polygon, and xBD's four damage levels;
   - make the console answer only questions that this table can answer, with no default values (no "|| 300", "|| 250");
   - replace the hand-written reports labelled fixed_flow.py with the real report files (with their path), or label
     them as illustrations;
   - remove the thermal-simulation layer, sensor and K9 advice and "Tactical Directives" (or move them to a page
     titled "Future ideas, not built").
B. Website, numbers: fix every row of the table in section 3 of the review, using only the allowed facts below.
C. Website, offline and cleanup: self-host fonts; online tiles off by default; remove @google/genai, express, dotenv,
   GEMINI_API_KEY, the AI Studio metadata capability and the Cloud Run URL; remove sound effects and confetti (or make
   them opt-in, off by default); delete public/assets/aistudio/; add Website/README.md (what it is, how to run it,
   where every number comes from, what is illustration).
D. Delete Untitled-1.ipynb at the repository root.
E. Counting study: in BDC-v4-results/README.md and BDC_PIPELINE_REPORT_v4.md apply the three corrections in section 6
   of the review, word for word in meaning, and remove the duplicate U-Net CSV and the empty result file.
F. disasteller_inputs.py: return "status": "image_not_in_table" when an image has no rows; make db_path and
   hotspots_path required parameters; add a small assert-based self-check under if __name__ == "__main__" covering an
   image in the table, an image not in it, and a missing database. Do not import it anywhere else.

ALLOWED FACTS (from update 3 and the repository; nothing else)
- Team: Abdullah Al Noman, Tamanna Akter Mou, Aryan Sami, Ridita Afrin Riya, Abrar Mohammed Tanzim Alam.
  CSE499B, Section 13, Group 5, North South University.
- Damage map, validation, the 605 clean pairs: find-then-grade (SAM 3 outlines + Siamese ResNet-18 grader) destroyed IoU
  0.316, 0.305, 0.298 with three graders (mean 0.307), mean IoU 0.547. R11 (U-Net, before + after images): mean IoU 0.588
  on all 645 pairs, clean destroyed IoU 0.269 (with test-time augmentation). R9: clean destroyed IoU 0.287.
- SAM 3 finds buildings with IoU 0.630 on validation.
- Counting on the benchmark: 32.96% (32.47% without duplicated images) from the building table; target 34.2% (base VLM).
- Retrieval test of the offline guideline search: 27 of 30 (bar 24; meaning-only search 20).
- Edge segmenter: 8-bit, 33 MB, 1.6 s per 1024 px image on a CPU, 1.43x faster than the 32-bit ONNX model, destroyed IoU
  down 0.0003.
- Offline report proof run (Ridita, 11 Nov): six reports written by our fine-tuned Qwen2.5-VL-7B with the internet off,
  no connection outside the machine. The reports are in the t2_proof folder above.

WHEN DONE
Give me: the list of changed files; Aryan_Task/CHANGES.md; and the output of these commands, run from the repository root:
  grep -rn "fonts.googleapis\|arcgisonline\|run.app\|genai\|GEMINI" Essential_task_delegation/Aryan_Task/Website
  grep -rn -i "pancake\|void\|K9\|FLIR\|thermal\|Tactical Directive\|WorldView\|Pazarc\|Fort Myers" Essential_task_delegation/Aryan_Task/Website/src
  grep -rn "fixed_flow.py\|Kaggle Offline Session\|TELEMETRY" Essential_task_delegation/Aryan_Task/Website/src
  (cd Essential_task_delegation/Aryan_Task/Website && npm run build && npm run lint)
  python Essential_task_delegation/Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py
List anything you could not fix, and why. Do not guess.
```
