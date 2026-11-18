# Review of the website prototype (AeroRescue-site), 11 Nov 2026

From Abrar, on your pushes of 9 and 10 Nov (`AeroRescue-site/` and `Project Website Test Wireframe/`). I read every source file. I didn't install or build the site, so this review covers content and code, not a test run.

**Updated 17 Nov (evening):**
- **Thanks for removing the four wireframe images** (section 3).
- **Your pushes later on 17 Nov fixed sections 2 and 4 and most of section 5.** I checked every number you changed against the files linked below, and they all match. Two things are left:
  - the one line at the top of your README from section 7.4: your README now presents the site as the project's showcase, but `T3_Website/` is that now;
  - the Gallery page's heading still says "Drag the slider to compare" above the "coming soon" note.
- **If you want to keep working, work on my showcase website,** in `Essential_task_delegation/T3_Website/`. Section 7 says what to do and how.
- **It replaces your prototype,** so the rest of this review's fixes to your own site are optional (section 7.4).
- The whole project's current status, for all four of you, is in [Team_Status.md](../Team_Status.md), with your part in its section 6.

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

**A caveat to put under this table.** On building counting, a rule that never looks at the image scores 66.98%. Whenever a question's largest option is above 20, the five options are 0.6, 0.8, 1, 1.2 and 1.4 times the correct count, so the middle value is always right. Accuracy on this task can't show counting ability ([benchmark-option-rule-check.ipynb](../Champion_Task/benchmark-option-rule-check.ipynb)).

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
- **A new result exists.** On 2,007 test pairs no model was trained or tuned on (E7 step 2, 11 Nov), the two are close: Destroyed IoU 0.3898 for SAM 3 + grader against 0.3984 for R11, and mIoU 0.5129 against 0.5721 ([results](../Champion_Task/E7-results/step2/README.md)). Which one the system uses is being decided now, so wait for that before choosing what to highlight.

### 2.5 The goals' status lines (lines 9–12)

- **O1:** "Met narrowly on leak-free data" is right for validation. Add "on validation", since the test pairs now have their own number (2.4).
- **O2:** the text says counts are "fed to the VLM". Since H2b (23 Oct), counting questions are answered from the building table with fixed queries, not through the VLM. The counting score is 32.47% on E5's clean questions, against the base 7B's 34.2%, with the caveat in 2.3.
- **O3:** the offline proof passed on 11 Nov (Ridita, T2). DisasTeller wrote all six reports with our 7B, with the internet off, on Kaggle's two T4 GPUs. The reports' quality and the single chain of models are still open ([Offline_RAG_KR2/README.md](../Offline_RAG_KR2/README.md), "Proof run").
- **O4:** L0 is done (28 Oct). L2's five notebooks are built (8 Nov) but not run yet. The INT8 edge segmenter is done (L1b). "Next (after L0/L2)" is out of date.

## 3. The four wireframe images: please remove them from the repository

**Done 17 Nov:** you deleted all four (commits `6e9960dae` to `5deeeab04`). The text below stays as the record.

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
- **Pipeline steps 01 and 02** (`src/data/pipeline.js`, lines 2–3). These are two alternatives, not two steps of one pipeline: either R11's pixel map or SAM 3's outlines with the grader give the damage map, and E7 is choosing between them. Suggested: one step, "Find and grade the buildings", that names both.

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

1. Remove the wireframe images (section 3). *(Done 17 Nov.)*
2. Fix `results.js` and the claims (sections 2 and 4), taking each number from the file linked next to it.
3. Replace the README and fill or hide the gallery.
4. Connect the demo to the local API once T2's fixed flow and the chain's building table are ready.

This site covers the same ground as T3 in the roadmap (the showcase website). *(Settled 16 Nov: the showcase website is `T3_Website/`, built from Aryan's prototype. So items 2–4 above are optional now; section 7 is how you can help instead.)*

## 7. If you want to keep working: the showcase website (added 17 Nov)

From Abrar. If you want to keep working, work on my showcase website, `Essential_task_delegation/T3_Website/`. It has seven pages, built from Aryan's prototype in the look I chose. Aryan takes over its build on Wed 18 Nov. Your part below is separate from his, so you two won't be changing the same files.

### 7.1 Set up (about an hour)

1. Pull: `git pull origin main`.
2. Read Aryan's handover, [T3_Website_Handover.md](../Aryan_Task/T3_Website_Handover.md), sections 1, 2, 4, 5, 6 and 7. It's written to Aryan, but its rules (section 6) hold for everyone, and section 7 lists the checks to run before every push.
3. You need Node 22.18 or later. In `T3_Website/`, run `npm install`, `npm run fixtures` and `npm run dev`, then open http://127.0.0.1:3000.
   - Without xBD's photos on your PC, the maps show without photos. That's expected.
   - Try it needs the model file, which isn't in git: ask me for `r9_int8_static_keep1_3.onnx` (33 MB), and put it in `T3_Website/public/model/`.

### 7.2 Your part: test what nobody has tested yet

So far the site has been checked in Chrome and Edge on one PC, mostly by automated tools. Nobody has tried it on these:
1. **Firefox:**
   - every page;
   - on Explore, the map's controls: Ctrl with the mouse wheel to zoom, the zoom buttons, dragging, hiding and searching buildings, and the 3D view;
   - on Try it, one after-image (the site's [README](../T3_Website/README.md), "The model in the browser", says how). Note how many seconds it took.
2. **A screen reader:** NVDA (free, for Windows) on every page. Note anything it skips, reads wrongly or reads in a confusing order. Can the map's buildings be reached and read without a mouse?
3. **A real printer:** on Reports, "Print this report". Is the printout complete and readable?
4. **Safari, if you have a Mac or an iPhone:** the same as item 1, plus a two-finger pinch on the map.

Write what you find in a new file, `Noman_task/T3_Site_Test.md`. For each finding, give the page, the browser or device, what you did, what happened, and a screenshot. **Don't fix anything yet.** Push the file and tell me.

### 7.3 Then: the fixes I pick

- **I'll pick which findings to fix.** Before you edit, tell Aryan which files you'll change, so you don't both edit the same file.
- **One fix per push.** Pull before you start.
- **Run the checks in the handover's section 7 before every push,** and stage only the site's folder: `git add -- Essential_task_delegation/T3_Website`.
- **Not yours without asking me first:**
  - anything in `src/core/` (the model, the facts and the colours);
  - `src/data/facts.json`;
  - the deploy;
  - the booth's local server.
- **The rules that matter most** (handover, section 6):
  - no invented data;
  - every number comes from `facts.json`, shown with `<Num id="…" />`;
  - missing is never zero;
  - pixels, not metres;
  - nothing loads from another site;
  - no mention of AI tools in the site, its code, its README or your commit messages.

### 7.4 Your own prototype

The showcase website replaces it, so you don't have to finish sections 2, 4 and 5 of this review. Instead, put one line at the top of `AeroRescue-site/README.md` saying:
- it's an early prototype, replaced by the showcase website in `Essential_task_delegation/T3_Website/`;
- its numbers aren't kept up to date.

That way no one takes them for our results. The showcase site keeps its numbers in one data file, as yours did, and labels stand-in data as such.
