# Review of the website prototype (AeroRescue-site), 11 Nov 2026

From Abrar, on your pushes of 9 and 10 Nov (`AeroRescue-site/` and `Project Website Test Wireframe/`). I read every source file. I didn't install or build the site, so this review covers content and code, not a test run.

## In short

- **The site is a good base.** It has a clear structure, its content lives in data files, the demo is honest about its sample output, and every page carries the decision-support warning.
- **Before anyone outside the team sees it,** three things need fixing:
  1. remove the four wireframe images (section 3);
  2. fix the numbers and task names in `src/data/results.js` (section 2);
  3. correct four claims (section 4).
- Every corrected number below links to the file it comes from, so you can check it.

## 1. What works

- **Seven pages** (Home, Data, Method, Results, Gallery, Demo, About), with their text and numbers in `src/data/`. Updating a result never touches a page.
- **An honest demo.** Without an API it shows "Backend not connected: sample output" and tags the result "sample output". The API it expects is written down in `src/services/api.js`.
- **The warning.** "Decision-support only" is on Home, Demo and in the footer.
- **`vercel.json`** sets the cross-origin isolation headers that ONNX Runtime Web needs to run the segmenter in the browser with several threads. Our in-browser test (24 Oct, System_Design_Notes §4.3) relies on that.
- **The tooling.** `package-lock.json` is committed, `node_modules` isn't, and the libraries are current (React 19, Vite 8, Tailwind 4).
- **Most numbers come from our own files.** The errors below are about which file a number came from, or what it means.

## 2. Numbers and names to fix (`src/data/results.js`)

### 2.1 The six benchmark task names (lines 36–41)

| Code | On the site | Correct name | What the task asks |
|---|---|---|---|
| DTR | Disaster-type reasoning | Disaster Type Recognition | which kind of disaster happened |
| ORR | Relational reasoning | Relational Reasoning (correct) | how two boxed objects relate in space |
| BDC | Building counting | Building Damage Counting | how many intact, damaged or destroyed buildings |
| BBR | **Bounding-box reasoning** | **Disaster Bearing Bodies Recognition** | which kinds of objects were damaged: buildings, roads, farmland and so on |
| DRE | **Damage reasoning** | **Road Damage Counting** | what share of the image is intact or damaged road |
| DSR | Disaster scene reasoning | Disaster Scene Recognition | which land-use types the scene has |

The names are the ones in the benchmark file and in L0 step 2's notebook ([l0-step2-full-size-rescore.ipynb](../Champion_Task/l0-step2-full-size-rescore.ipynb), Cell 2).

### 2.2 Two numbers swapped (line 40)

For DRE, the base model scores **29.3** and our 7B **32.9**. The site has them the other way round.
- Base: the DisasterM3 paper, Table 2.
- Ours: [H1 V2's results](../Champion_Task/H1-V2-results/H1V2/README.md), 32.87.

### 2.3 The VLM table shows a 7B we no longer use

The "ours" column is the old 7B at 512 px (H1 V2). Since 28 Oct the project uses L0's 7B, scored at full size (1036 px) on the benchmark's 10,675 optical questions:

| Task | Base 7B (paper) | Our 7B (L0, full size) | Paper's fine-tune |
|---|---|---|---|
| Disaster Type Recognition | 66.6 | 76.77 | 83.6 |
| Bearing Bodies Recognition | 4.7 | 19.99 | 21.5 |
| Building Damage Counting | 34.2 | 30.31 | 34.3 |
| Road Damage Counting | 29.3 | 33.03 | 29.4 |
| Disaster Scene Recognition | 28.3 | 40.46 | 37.7 |
| Relational Reasoning | 23.9 | 34.62 | 36.2 |

Sources: [L0 step 2, part A](../Champion_Task/L0-step2-results/new-partA/L0S2/README.md) and [part B](../Champion_Task/L0-step2-results/new-partB/L0S2/README.md); the decision in the [tracker](../Progress_Tracker.md) (L0 step 2).

**Put the target beside it.** Our 7B's building counting (30.31%) is still below the base model's 34.2%, so say that next to the number; counting is answered from the building table, not the VLM.

### 2.4 The segmentation table mixes two sets of images (lines 22–27)

- The R9 and R11 rows are scored on all 645 validation pairs, including the 40 that leaked from training.
- The SAM 3 + grader row (0.3065) is scored on the 605 clean pairs.
- The note under the table says 645.
- The leak helped R11 most, so this mix makes R11 look better than it is.

On the same 605 clean pairs:

| Model | mIoU | Destroyed IoU | mIoU (TTA) | Destroyed IoU (TTA) |
|---|---|---|---|---|
| R9 (sampler + copy-paste, after-image only) | 0.5338 | 0.2800 | 0.5402 | 0.2874 |
| R11 (before + after images, 6 channels) | 0.5742 | 0.2641 | 0.5805 | 0.2692 |
| SAM 3 + grader (mean of 3 grader seeds) | 0.547 | **0.3065** | — | — |

Sources:
- R9 and R11: E5 step 2's per-image counts ([per_image_counts.csv](../Champion_Task/E5-results/step2/per_image_counts.csv)), minus E5 step 1's 40 pairs ([val_train_leaks_hash.csv](../Champion_Task/E5-results/step1/val_train_leaks_hash.csv), rows with `counted` True).
- SAM 3 + grader: R16c steps 5 and 5b ([Task_Ledger.md](../Task_Ledger.md), the E5 entry: 0.3161, 0.3051 and 0.2982).

Two more changes to this table:
- **Don't highlight R11 as the best.** On clean validation it has the higher mIoU but the lower Destroyed IoU.
- **Which model the system uses is still being decided,** so wait for that before choosing what to highlight.

### 2.5 The goals' status lines (lines 9–12)

- **O1:** "Met narrowly on leak-free data" is right for validation. Add "on validation".
- **O2:** the text says counts are "fed to the VLM". Since H2b (23 Oct), counting questions are answered from the building table with fixed queries, not through the VLM. The counting score is 32.47% on E5's clean questions, against the base 7B's 34.2%.
- **O3:** the offline proof passed on 11 Nov (Ridita, T2). DisasTeller wrote all six reports with our 7B, with the internet off, on Kaggle's two T4 GPUs. The reports' quality and the single chain of models are still open ([Offline_RAG_KR2/README.md](../Offline_RAG_KR2/README.md), "Proof run").
- **O4:** L0 is done (28 Oct), and the 3B's training is next. The INT8 edge segmenter is done (L1b). "Next (after L0/L2)" is out of date.

## 3. The four wireframe images: please remove them from the repository

The images in `Project Website Test Wireframe/` (about 12 MB) follow the CSE499A proposal's first plan (the archived half of the root README): Qwen2-VL-7B, FloodNet, AIDER and RescueNet, a "Rescue Actionability Rubric", comparisons with GPT-4o. That plan changed to DisasterM3 and Qwen2.5-VL-7B, and none of its metrics was ever measured: CSE499A's final report has no RAR, ROUGE-L or BERTScore. So the images show a project that doesn't exist:
- **A different model and data:** a fine-tuned Qwen2-VL-7B, with "12.8k triplets" from xBD, FloodNet, AIDER and RescueNet drafted with GPT-4o. We use Qwen2.5-VL-7B on DisasterM3, and never used FloodNet, AIDER, RescueNet or GPT-4o.
- **Results that don't exist:**
  - a "Rescue Actionability" score of 4.28 out of 5 from "3 experts, kappa 0.81";
  - "+12.4% ROUGE-L";
  - a table where our model beats GPT-4o Vision and Gemini 1.5 Flash;
  - "+10.4 pts, +33%";
  - "9.2 h, 14.3 GB peak".
- **Features that don't exist:** a live "Hatay sector" console, "Push to TAK/ATAK", a sensor fleet, Hugging Face Spaces hosting and an "IEEE report".
- **Sign-in pages for FEMA and UN-OCHA coordinators**, with "FEMA SSO" and "UN-OCHA SSO" buttons.

**Why they have to go:**
- The repository is public. A reader can't tell these images from our results, and they carry our group's name.
- The sign-in pages imitate real agencies.

**What to keep:** the layout and colours, if you like them. Every number and claim on the site should come from our results files.

## 4. Claims to correct

- **The course section** (`src/config/site.js`, line 4): CSE499B is **Section 13**, not 15 (NSU's schedule and our updates 1–4); Section 15 was CSE499A. The wireframes say "Sec 15" too.
- **Offline FAQ** (`src/data/about.js`, line 19): "a local API that runs every model on the laptop with the internet off".
  - No local API exists yet.
  - The offline proof ran on Kaggle's two T4 GPUs, not on a laptop, and no VLM has been measured on a laptop CPU yet (roadmap L3, step 6).
  - Suggested: "Planned: at the booth, the site calls a local API on the laptop with the internet off. The offline run is already proven on two T4 GPUs."
- **"All headline scores are re-scored without them"** (`src/data/about.js`, line 13; `src/pages/Data.jsx`, line 9). That's only true once section 2.4 is fixed.
- **"645 validation images, never trained on"** (`src/pages/Data.jsx`, line 6). 40 of them share images with training. Suggested: "645 validation images; 605 after removing 40 that leaked from training".
- **Pipeline steps 01 and 02** (`src/data/pipeline.js`, lines 2–3). These are two alternatives, not two steps of one pipeline: either R11's pixel map or SAM 3's outlines with the grader give the damage map, and which one the system uses is being chosen. Suggested: one step, "Find and grade the buildings", that names both.

## 5. Smaller points

- **`AeroRescue-site/README.md` is Vite's template.** Replace it with:
  - what the site is;
  - how to run it (`npm install`, `npm run dev`, and `VITE_API_URL` for the demo);
  - where its numbers come from.
- **Gallery** (`src/data/gallery.js`): three placeholder entries whose images don't exist (there's no `public/gallery/`).
- **`vercel.json`:** `Cross-Origin-Embedder-Policy: require-corp` blocks images, fonts and scripts from other sites unless they send matching headers. Host everything on the site itself, or use `credentialless`.
- **The demo's API contract** (`src/services/api.js`) needs agreeing with what the pipeline will return:
  - counts per class from the building table;
  - hot spots from T1's code;
  - the report from T2's fixed flow.
- **The name:** "DisasterM3 Triage" in `src/config/site.js` and "AeroRescue" in the folder names. That's fine while the name is undecided; use one when it's chosen.

## 6. Suggested order

1. Remove the wireframe images (section 3).
2. Fix `results.js` and the claims (sections 2 and 4), taking each number from the file linked next to it.
3. Replace the README and fill or hide the gallery.
4. Connect the demo to the local API once T2's fixed flow and the chain's building table are ready.

This site covers the same ground as T3 in the roadmap (the showcase website). How the two fit together is still to be agreed.
