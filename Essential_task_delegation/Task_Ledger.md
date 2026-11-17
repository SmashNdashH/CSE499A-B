# Task ledger: why each task ran, and what it decided

The record of every task finished so far, with the decisions that started each one and the decisions each one led to. It is written so you, or a teammate, can follow the reasoning without the chat history.

For every task:
- **What:** the task in plain words.
- **Why it was planned:** the goal and the finding behind it.
- **How:** the method, and what stayed the same so the comparison is fair.
- **How it ran:** where and how long. Each notebook's first cell has the full run steps.
- **Expectation before the run:** the rule fixed in advance. It says so when no number was predicted.
- **Result:** the numbers against the reference.
- **What it led to:** the decision or notebook that followed.

Status is kept in [Progress_Tracker.md](Progress_Tracker.md); the plans are in [Next_Steps_Roadmap.md](Next_Steps_Roadmap.md) and [Phase2_Plan.md](Phase2_Plan.md). Numbers come from each task's results folder in [Champion_Task/](Champion_Task/).

## 1. Reference points used throughout

- **The goals:**
  - **O1:** a U-Net with mIoU above 0.52 and Destroyed IoU above 0.30, on two seeds.
  - **O2:** building counting above the base model's 34.2%, with all six tasks re-scored.
  - **O3:** DisasTeller on our model, with a damage map, counts and a survivability heatmap.
  - **O4:** a distilled 3B model plus an edge segmenter.
- **The validation set** is always the same 645 images (560 xBD, 85 other), scored at full resolution on a dataset-level confusion matrix (the E-protocol). TTA means averaging 8 flipped or rotated copies of each image.
- **The current champion is R11:** mIoU 0.581 and Destroyed IoU 0.291, or 0.588 and 0.297 with TTA.
- **Seed noise:** Destroyed IoU moves by about 0.013 from the random seed alone (R1 against R1s7, which was called R6 until 20 Oct).
- **The keep rule for training runs:** mIoU may not drop by more than about 0.005, and Destroyed IoU must rise by more than 0.013. The O1 gate needs two seeds, or their mean.
- **The two-model rule:** a model trained on DisasterM3 benchmark images never answers benchmark questions.

## 2. Your decisions so far

| Date | Decision | Why | What it led to |
|---|---|---|---|
| 26 Oct | Build and run R16c step 5b (a third grader seed, 44) before claiming O1 on clean data; build a merge-only copy of L0's training notebook | On clean data only step 5's SAM 3 map passes O1's gate, and seed 43 clears it by 0.005. L0's merge failed on torchao, while its training is complete | [r16c-step5b-third-grader-seed.ipynb](Champion_Task/r16c-step5b-third-grader-seed.ipynb) and [l0-step2-merge.ipynb](Champion_Task/l0-step2-merge.ipynb), built and dry-run checked 26 Oct |
| 26 Oct | E5: settle the leak on DisasterM3's own images and check the benchmark against the training images, with a near-copy check; save per-image pixel counts for R11, R11s7, R9 and R1 | The PC check (21 pairs) and the audit (40) disagree. A copy in the benchmark would raise O2's numbers. Per-image counts let any leak list be applied without another GPU run | Step 1 (CPU) and step 2 (GPU) for account 2 ([E5](#e5--trainvalidation-leak-and-the-benchmarks-copies-opened-26-oct)) |
| 26 Oct | Teammates' follow-ups, sent as prompts: Ridita wires the offline search into DisasTeller with a retrieval test; Aryan re-scores the sentence answers and adds R11's counts; Tamanna cleans up Plan 2, re-runs it, then tests crops against ground truth | The review of their pushes ([§9](#9-teammates-work-what-we-use-reviewed-26-oct)) | Prompts given 26 Oct |
| 5 Oct | Plan Phase 2 (Phase2_Plan) instead of more fine-tuning | Destroyed IoU missed 0.30 in every run, and the seed noise was about as big as the gap | E1, R11, R12, R15, R16 |
| 8 Oct | R7 = R1's recipe; run two combinations (R9, R10) | None of R2–R5 or R8 beat R1 by more than the noise | R9, R10, then R9s7 |
| 18 Oct | Close fine-tuning. Use R9's seed-42 model downstream. Rename the tasks (P2-x to E/R/D5) | R9s7 confirmed the R9 recipe but missed the gate (two-seed mean 0.2971 with TTA) | The roadmap and its task IDs |
| 18 Oct | Gate G2: run R11 before R12 | E1: 59.5% of missed destroyed pixels are predicted as background | R11 |
| 18 Oct | Don't adopt majority voting | E2 lowered Destroyed IoU | — |
| 18 Oct | Gate G3: SAM 3 does R16's finding | E3: SAM 3 finds buildings better than R9 | R16 |
| 19 Oct | Greedy decoding is the standard for the 7B; the U-Net fact line is not kept | H1 V2: greedy answers raised four tasks; the fact line lowered every task | H1 V2b |
| 19 Oct | INT8 static, with the first and last convolutions kept in FP32, is the edge segmenter | L1b kept accuracy (drop 0.0003) at 1.43× ONNX FP32 | O4's edge part met |
| 19 Oct | T1 v3 is the final heatmap | v3 kept circles off the image edge | T2 and T3 will use it |
| 19 Oct | The 3B learns short checked answers; "why?" explanations become a second skill (L2b) | L2's teacher answers in one sentence; Paper_Audit §5.3 weighs the options | L2 step 1, L2b plan |
| 19 Oct | R16 runs regardless of R12 | One grade per building helps counting and DisasTeller, and it can answer benchmark questions | R16 |
| 19 Oct | R12 takes option A (tier3's 612 exam tiles, for O1 only). R16 and R15 run regardless. R16 runs on account 1 | No clean source of extra destroyed buildings exists | D5b, R12 |
| 19 Oct | Improve the 7B before distilling | Like for like, our 7B trails the paper's own fine-tune by 4.3 points | L0 |
| 19 Oct | Go for R16b (grader correction) and L0 step 1 | R16 over-graded intact buildings; L0 needed a first, cheap check | R16b, L0 step 1 |
| 19 Oct | `.gitignore` update; the commit holds `Essential_task_delegation/`, `others/`, `.gitignore`, `README.md` and `UPDATE.md` | Collaborators should get the current work | Commit `1b33574` |
| 19 Oct | Test R16 rigorously (R16c steps 1–3) | R16 was a key bet, and one run plus one correction isn't a fair test | R16c |
| 19 Oct | Go for E4 (R12 by source and event) | Check, rather than argue, why R12's extra data didn't help | E4 |
| 19 Oct | L0 step 2 at full size, judged on every optical question; run R11s7 | Prefer the thorough option: the gap stayed open after L0 step 1 | L0 step 2, R11s7 |
| 20 Oct | Run the grader on SAM 3's outlines now on account 1, as a stretch. It replaces step 2 only if it beats step 2's kept map on both seeds by the keep margin | Step 2 was kept but lost on xBD images; training on SAM 3's own outlines may win that back | R16c steps 4 and 5 (first called 3a and 3b) |
| 20 Oct | Build R16c's saved graders with R11s7's pieces | The O1 gate claim needs two U-Net seeds, not only two grader seeds | R16c step 3 (first called 2b), after R11s7 |
| 20 Oct | Account 3 (30 h) runs the old 7B's full-size re-score of the other four tasks first, then L0 step 2's training, then the new 7B's evaluation. Account 2 joins the old 7B's re-score after R11s7 | The baseline at full size is needed for L0 step 2's keep rule, and its notebook is the quicker one to build | L0 step 2 |
| 20 Oct | Rename R6 to R1s7 (R1 with seed 7), with a note that it was R6 | A seed repeat keeps the run's name plus `s7`; R6 predated the rule | `d4-champion-model-R1s7.ipynb`, `R1s7-results/` |
| 20 Oct | "Step", never "stage" | One word for a task's parts | L2 step 1's files renamed; R16's two parts are "the finding" and "the grading" (a find-then-grade model) |
| 20 Oct | Keep R16, R16b and R16c; number R16c's steps 1–5 (2b → 3, 3a → 4, 3b → 5) | R16's naming had become a mix of letters, numbers and stages | Renamed notebooks; step 5 got its own notebook |
| 20 Oct | You make the renames inside notebooks that already ran, by hand | Editing a code cell programmatically wipes its recorded outputs | [Manual_Notebook_Renames.md](Manual_Notebook_Renames.md) |
| 20 Oct | L0 step 2's training keeps the equal replay (option A): 7,018 examples, about 19.5 h in 2–3 sessions, rather than half the replay (about 15 h) | The replay protects the other four tasks, and the keep rule fails if any of them drops by more than 1 point | L0 step 2: session 1 on account 3 |
| 22 Oct | H2 builds its table from R11 with 8-view TTA, not R9 | R11's blobs of at least 20 px are our best counter on validation (39.24% against R9's 33.3%), and R11's counting on the benchmark had never been measured | `Champion_Task/h2-sql-counting-agent.ipynb` (Noman's original unchanged) |
| 22 Oct | Set Soup (trysoup.dev, a fine-tuning tool) aside for now, and record that it's barely usable for us | Its docs (v0.76.0) don't list Qwen2.5-VL, and don't cover the vision encoder freeze, the image-size cap, two-GPU training or Kaggle resumes that our recipe needs. Its only possible uses here are text-only (a local server for T2; GGUF export or a refusal fine-tune of a text model) | [Paper_Audit_and_Integration_Plan.md §4.14](Paper_Audit_and_Integration_Plan.md); our training notebook stays the recipe for every Qwen2.5-VL fine-tune |
| 24 Oct | T3 becomes two pieces: a public showcase site, and an interactive, animated demo website deployed on Vercel, with a live offline mode at the booth. You build it, and choose its name and look later | Last season's winner showed a designed site, results in motion and one interactive proof of its claim. Vercel can't run our models, so the live part runs on the booth laptop | Roadmap T3; [System_Design_Notes.md §4](System_Design_Notes.md) |
| 24 Oct | Finish T2, T3, L0 and L2 before any work on Layers 2–4 of the day-1 vision, and add a "3D damage city" view to the T3 website (building outlines raised into 3D blocks coloured by damage, labelled as a view of our 2D results) | O3 and O4 need T2, T3, L0 and L2, and Layers 2–4 aren't in O1–O4. The 3D view takes about a week with no GPU | Roadmap T3; [System_Design_Notes.md §5](System_Design_Notes.md) |
| 26 Oct | Record TimeSpot (ICML 2026) and use its evaluation methods, citing it wherever they're used: calibration error and risk–coverage curves for L3's handoff and H2c's gate, and a consistency check for T2's reports. Its dataset isn't used | Its methods measure whether a model's confidence can be trusted and catch answers that contradict facts, both needed before the system acts on a model's answer | [Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md); roadmap L3, H2c and T2 |
| 24 Oct | Add H2c, a second try at free-form questions: question–SQL pairs for our table, a fine-tuned adapter, a five-sample agreement gate, and a new test with unseen question types. If it fails, fall back to the system as it was | In the literature, models passed a similar bar only with in-domain training and an abstention gate, which H2b didn't have | Roadmap H2c; [System_Design_Notes.md §3.5](System_Design_Notes.md) |
| 24 Oct | Try running the INT8 segmenter in the visitor's browser (ONNX Runtime Web) | Uploads would work on the public site with no server, and images never leave the visitor's device | A feasibility test first, with its pass rule fixed in advance ([System_Design_Notes.md §4.3](System_Design_Notes.md)) |
| 22 Oct | Build H2b, a graded test of the SQL agent. The deployment rule was fixed before any run: benchmark counting uses a fixed query, our VLM writes the SQL if it passes in 4-bit, and a separate model is only a fallback | H2's counting questions can't separate the models, and a second model works against the low-resource target | [h2b-sql-agent-graded-test.ipynb](Champion_Task/h2b-sql-agent-graded-test.ipynb), after H2 |
| 4 Nov | One chain before any new module: SAM 3 → grader → one table → fixed queries + hot spots + guideline search → report. E7 replaces H1 V3 and scores it as one. L2's 3B becomes a side experiment that the main report doesn't depend on | Parts had been tested alone, never together. The best numbers came from three different models, and R11's table and T1's hot spots share only 7 images | Roadmap §1b, E7 |
| 4 Nov | Test who writes the report: the 7B or a small text model, on the same facts and guideline search, counted by number contradictions and fake citations | The fine-tuned 7B answers in one sentence, a plain text model matched it at writing SQL, and report writing has never been tested. O3 names our VLM, so a swap needs the supervisor's agreement | Roadmap T2b |
| 4 Nov | The focus is the finder and grader, grader first; everything else runs in parallel. T3's wireframes can start now | The rest of the chain only reads what they produce, and they have the most room left (0.33 against 0.556 with perfect grades). The screens follow the chain's steps, whichever model E7 keeps | Roadmap §1b, T3 |
| 4 Nov | Test later whether training the 7B's vision encoder helps, starting with a small crop test (L0b) | It's frozen only to follow the DisasterM3 paper's recipe, and the 7B's weakness looks like seeing. A small test on Part B's 300 buildings settles it before about 34 GPU hours are spent on a full run | Roadmap L0b |
| 8 Nov | L2: train two 3Bs, (b) with the 7B's soft labels and (c) with the options rerun, and keep the better one by a rule fixed before any run | (b) is the cleaner distillation O4 promises; (c) gives counting and relational reasoning more checked teacher answers, but shows the options whose middle value is always right above 20 | Five notebooks built and dry-run checked 8 Nov ([L2 step 2](#l2-step-2--two-3bs-and-the-rule-decided-and-built-8-nov)) |
| 11 Nov | Before choosing the chain, test whether E7's 0.0086 gap is more than noise | The rule fixed before E7 step 2 reopened the choice on a small gap | E7 step 2b: noise; the models split by event |
| 11 Nov | The front-page README gives a broad overview and links every weekly update and presentation (the supervisor's request) | — | README rewritten 11 Nov |
| 15 Nov | T3 is built in `T3_Website/` from a copy of Aryan's prototype (Vite, React, TypeScript, Tailwind), one codebase for both pieces, deployed by hand with the Vercel CLI | His map-and-inspector layout held up in review; a manual deploy keeps teammates' pushes from going public | [T3_Website/README.md](T3_Website/README.md); [System_Design_Notes.md §4.6](System_Design_Notes.md) |
| 16 Nov | The site's look is direction A, "Aftermap" (name not final), with B's gridlines, a small before/after pair, a contour-line background, and on/off switches for the overlays | Your pick among three working directions | [System_Design_Notes.md §4.6](System_Design_Notes.md) |
| 16 Nov | Bring back from Aryan's prototype only what real data supports: guideline passages quoted from the proof run, local downloads, the limitations, and thermal and sensor ideas as text only | The removed features showed values our system never produced | [Aryan's handover](Aryan_Task/T3_Website_Handover.md), §3.6 |
| 16 Nov | Aryan builds the website's remaining pages; Abrar keeps the gallery export, the deployment and the decisions | Hand-over, with rules and checks so nothing breaks | [Aryan's handover](Aryan_Task/T3_Website_Handover.md) |
| 16 Nov (later) | The handover moves to 18 Nov: Abrar builds as much of the site as he can until 17 Nov, and Aryan takes over what's left after his review's fixes | Abrar's best front-end tooling is available only until 17 Nov; Aryan's fixes are due 18 Nov anyway | The note at the top of [Aryan's handover](Aryan_Task/T3_Website_Handover.md) |
| 16 Nov (evening) | The website's in-browser model keeps the October test's exact setup (ONNX Runtime Web 1.20.1, WebAssembly, the 8-bit after-image-only U-Net), with its preprocessing rounded to 32-bit floats as in that test, and the moving background hidden during a run. The booth's models that can't run in a browser (the language model, the guideline search) will sit behind a small local FastAPI app, as a later brief | With 64-bit arithmetic the 8-bit model's class counts on the test image moved by 25 pixels; with the background drawing, a run took about 2 s longer. Measured: 100% of pixels equal to the native run, 4.1–5.2 s per image | [T3_Website/README.md](T3_Website/README.md), "The model in the browser"; [System_Design_Notes.md §4.6](System_Design_Notes.md) |
| 17 Nov | On the building map, a plain mouse wheel keeps scrolling the page; zooming takes Ctrl with the wheel, a pinch or the map's buttons (built so; Abrar can overrule it) | The map sits in a page that scrolls, where Aryan's prototype filled the screen. A wheel that zoomed would hold the page still whenever the pointer crossed the map | [Aryan's handover](Aryan_Task/T3_Website_Handover.md), §3.7 |
| 17 Nov | Hiding a building's outline, and searching the buildings list, change only what is shown. Counts, answers to the fixed questions and the saved picture always use the whole building table | A count or a picture labelled as model output, with buildings quietly removed, would break the site's honest-labelling rule | [Aryan's handover](Aryan_Task/T3_Website_Handover.md), §3.7 |
| 17 Nov | A known problem in a report that has no wrong phrase (something left out, a section that repeats another, real passage names written without brackets) is listed as a note under the report, not marked in its text | A red error mark on words that aren't wrong would say the opposite of the truth. All of Ridita's listed problems are now on the page: 14 marked phrases and 8 notes | [reportNotes.ts](T3_Website/src/core/reportNotes.ts); her [README](Offline_RAG_KR2/README.md), "Practice run 5" |

**Standing working rules** (from you, kept in memory):
- Nothing is changed, installed or run without your go, and the decisions stay yours.
- You run git yourself.
- No AI attribution in commits; no emojis.
- A seed repeat keeps the run's name plus `s7`.
- Every task is reported with the fields above.
- Notebooks are changed in a named copy; local notebooks keep their outputs.
- The tracker is in Markdown.
- Data missing from the PC is downloaded only with your steps.
- Submitted deliverables in `others/` stay frozen.

## 3. Before Phase A: the fine-tuning sprint (R1–R10, R9s7)

- **What:** one change per run to the D4 U-Net recipe (U-Net + ResNet-50, 768 px crops, Focal Tversky then Lovász loss, 40 epochs), scored against R1.
- **Why it was planned:** the first route to O1, cheap changes before structural ones.
- **How it ran:** Kaggle T4, about 6–7 h per run, notebooks `d4-champion-model-R*.ipynb`.
- **Expectation before the run:** a change is kept only if it beats R1's mIoU by more than the noise (0.0028 at the time) and doesn't lower Destroyed IoU.
- **Result** (mIoU / Destroyed IoU; TTA in brackets):

  | Run | Change | Result |
  |---|---|---|
  | R1 | Reference | 0.5374 / 0.2686 (0.5440 / 0.2822) |
  | R2 | Copy-paste of destroyed buildings | 0.5369 / 0.2681 |
  | R3 | Loss weights 0.25 / 0.75 / 1.33 | 0.5402 / 0.2790 (Destroyed 0.2845) |
  | R4 | U-Net++ | 0.5267 / 0.2551 |
  | R5 | Sampler favouring damaged images | 0.5354 / 0.2898 (Destroyed 0.2917) |
  | R1s7 (called R6 until 20 Oct) | R1 with seed 7 | 0.5402 / 0.2815 |
  | R8 | Extra augmentation | 0.5342 / 0.2703 |
  | R9 | Sampler + copy-paste | 0.5373 / 0.2921 (0.5440 / 0.3001) |
  | R10 | Sampler + R3's loss | 0.5345 / 0.2891 (0.5406 / 0.2969) |
  | R9s7 | R9 with seed 7 | 0.5382 / 0.2847 (0.5453 / 0.2941) |

- **What it led to:**
  - No change passed, so R7 = R1.
  - R9 was best for destroyed buildings, but its two-seed mean with TTA was 0.2971, just short of the gate.
  - Fine-tuning closed on 18 Oct, and Phase 2 started. The full table is in [Ablation_Study_Reference_and_QA_Prep.md](Ablation_Study_Reference_and_QA_Prep.md) §7.

## 4. Phase A: diagnosis, no training

### E1 · Error diagnosis and champion predictions
- **What:** score R9, R9s7 and R1 again, and find out where the missed destroyed pixels go.
- **Why it was planned:** Phase2_Plan §3. Before training anything new, learn *why* destroyed pixels are missed. BRIGHT showed that finding buildings and grading them are separate problems.
- **How:** an evaluation-only notebook (copied from E0). It produced:
  - the 4×4 confusion matrices and building IoU;
  - the share of missed destroyed pixels that went to background, intact or damaged;
  - scores per event and per source.

  It also exported R9's predictions and the true masks for later tasks.
- **How it ran:** Kaggle, GPU T4 ×1, `HF_TOKEN`, 18 min. [d4-champion-model-E1.ipynb](Champion_Task/d4-champion-model-E1.ipynb).
- **Expectation before the run:**
  - Each model must reproduce its D4 CSV.
  - Gate G2: if 40% or more of missed destroyed pixels are predicted as background, run R11 (the before-image) first; otherwise R12 (more destroyed examples).
- **Result:** all three models reproduced their CSVs. 59.5% of R9's missed destroyed pixels were predicted as background (24% intact, 17% damaged). Building IoU was 0.584 (0.591 with TTA).
- **What it led to:** R11 first. Its prediction files fed E2, E3's comparison, H1 and T1.

### E2 · Majority vote per building
- **What:** give every predicted building blob its majority class.
- **Why it was planned:** BRIGHT reports this lifts per-event scores. It is free post-processing.
- **How:** extra cells in E1, with and without a 20 px minimum blob size.
- **How it ran:** inside E1.
- **Expectation before the run:** adopt it only if Destroyed IoU rises by more than 0.005 without lowering mIoU, and it repeats on R9s7.
- **Result:** Destroyed IoU fell, from 0.292 to 0.228 (0.300 to 0.234 with TTA). It fell on R1 and R9s7 too.
- **What it led to:** voting dropped.

### D5 · xBD converter check and the 1,007 extra tiles
- **What:** turn the xBD tiles DisasterM3 left out into masks, using DisasterM3's own label rules.
- **Why it was planned:** R12's data (Phase2_Plan §2). It also had to find out exactly how DisasterM3 mapped xBD's five damage labels.
- **How:**
  - Matched tile IDs: 1,792 already in DisasterM3, 1,007 new.
  - Drew the xBD polygons of the overlapping tiles and compared them with DisasterM3's masks.
  - Converted the new tiles with the measured mapping.
- **How it ran:** on your PC (CPU, about 3 min). [d5-xbd-converter.ipynb](Champion_Task/d5-xbd-converter.ipynb).
- **Expectation before the run:**
  - minor and major damage both map to Damaged;
  - no new tile is already in DisasterM3;
  - the counts match Phase2_Plan: 1,007 tiles and 3,472 destroyed polygons.
- **Result:**
  - The mapping is `[0, 1, 2, 2, 3, 255]`: no-damage → Intact, minor and major → Damaged, destroyed → Destroyed, un-classified ignored. It agrees on 97.8% of building pixels.
  - The counts matched.
  - **A leak was found:** 447 of the new tiles are benchmark images, holding 3,466 of the 3,472 destroyed buildings.
- **What it led to:** R12's first pool, and the two-model rule. A model trained on those tiles never answers benchmark questions.

### D5b · xBD tier3 check and masks
- **What:** the same check and conversion for xBD's tier3 part.
- **Why it was planned:** after D5, more destroyed buildings were wanted for R12, so the other sources were checked.
- **How:**
  - Matched tier3's 6,369 tiles against DisasterM3's training and benchmark lists.
  - Converted the tiles chosen in option A with D5's code.
- **How it ran:** on your PC (2 s for the check, 2.3 min for the masks), after you downloaded tier3. [d5b-xbd-tier3-converter.ipynb](Champion_Task/d5b-xbd-tier3-converter.ipynb).
- **Expectation before the run:** the lookup table matches D5's, and the counts match the zip check: 612 tiles, 4,549 destroyed.
- **Result:**
  - The same table, 97.2% agreement.
  - The 3,122 tiles that aren't benchmark images hold no destroyed building at all.
- **What it led to:** your option-A decision: R12 adds the 612 benchmark tiles, for O1 only.

### E3 · SAM 3 building finding
- **What:** SAM 3, prompted with "building", on the validation images, without training.
- **Why it was planned:** to decide whether SAM 3 can do the finding for a find-then-grade model (Gate G3), and to measure it on a T4 for O4. SegEarth-OV3 reports 64.3% zero-shot building IoU on xBD.
- **How:** three runs: the before-image, the after-image, and the before-image as a 2×2 grid. Each was scored on building IoU, counts and footprint recall per class.
- **How it ran:** Kaggle account 1, GPU T4 ×1, `HF_TOKEN` with gated SAM 3 access, fp16, 58 min. [e3-sam3-building-finding.ipynb](Champion_Task/e3-sam3-building-finding.ipynb).
- **Expectation before the run:** Gate G3. If SAM 3 on the before-image finds buildings at least as well as R9, it does R16's finding.
- **Result:** the before-image grid scored building IoU 0.630 against R9's 0.591, at 2.1 s per image. With R9's pieces added, it covers 86% of destroyed footprints.
- **What it led to:** SAM 3 does R16's finding.
- **Checked on clean data, 27 Oct:** SAM 3 never trained on DisasterM3, so the leak can't flatter it. Without the 40 leaked pairs it scores 0.6302 against R9's 0.5905, so Gate G3 still passes.

### H1 V1 · U-Net counting
- **What:** answer the building-counting questions by counting blobs in R9's predicted mask.
- **Why it was planned:**
  - O2 needs counting above 34.2%.
  - DisasterM3's answers are blob counts of its masks: the true masks answer 100% of the 1,055 validation questions.
  - So a good segmenter should count well.
- **How:**
  - Tuned the counter on the 1,055 validation questions (never on the benchmark).
  - Then answered all 4,982 benchmark counting questions with the nearest option.
- **How it ran:** Kaggle, GPU T4 ×1. Its first run found no benchmark images and scored 0%; it was fixed and run again. [h1-v1-unet-counting.ipynb](Champion_Task/h1-v1-unet-counting.ipynb).
- **Expectation before the run:** Gate G4. Above 34.2% meets the counting half of O2.
- **Result:**
  - 22.3% overall; optical 26.5%, radar 11.3%.
  - Median count errors on optical were 45% for intact and 75–83% for damaged and destroyed, because the U-Net merges touching houses and splits damaged ones.
- **What it led to:**
  - G4 was not met.
  - Its fact file fed H1 V2.
  - Counting separate buildings (R16) became the route for counting.

### H2 · Per-building table and SQL counting agent
- **What:** a per-building SQLite table of the benchmark images, so counts and other questions become database queries, plus a small-LLM SQL agent over it.
- **Why it was planned:**
  - O2 and O3: exact, queryable counts for DisasTeller (T2) and the demo (T3).
  - It was also the first chance to measure R11's counting on the benchmark itself.
- **How:**
  - Noman built the notebook. Its run copy switched from R9 to R11 with 8-view TTA (after- and before-images) and a 20 px minimum, the best counter on validation (39.24%).
  - Two LLMs, Qwen2.5-Coder-3B and our 7B (text only), wrote SQL for 100 sampled optical counting questions.
- **How it ran:** Kaggle account 2, T4 ×2, 22 Oct, about 1.5 h with the smoke test. [h2-sql-counting-agent.ipynb](Champion_Task/h2-sql-counting-agent.ipynb). H1 V1's per-question file was uploaded as an input, because the `h1-v1-facts` dataset lacked it.
- **Expectation before the run:** R11's counting near 30% on the optical questions (validation numbers run high), with the base 7B's 34.2% as the bar.
- **Result:**
  - **R11's counting:** 32.96% on the optical questions and 27.46% over all 4,978 questions in the table. That beats R9's tuned counter (26.51%) and our 7B (30.09% at full size), but is still 1.2 points under 34.2%.
  - **The agent:** both models wrote valid SQL for all 100 questions; their counts matched the table on 99 and 100, so both scored the table's 34%.
  - **The demo:** a free-form distance question got a query with no image filter from the 3B (answer 33,880).
  - **The table:** 117,687 buildings in 2,652 images; 3 images couldn't be segmented.
  - Results in [H2-results/H2/](Champion_Task/H2-results/H2/README.md).
- **What it led to:**
  - R11's blobs are now our best benchmark counter, but the counting half of KR2 is still not met.
  - The open-question failure confirmed the need for H2b's graded test.
  - Its table is H2b's input.

### H2b · Graded test of the SQL agent
- **What:** a graded test of which model, if any, should turn free-form questions into SQL over H2's per-building table in the deployed system.
- **Why it was planned:**
  - O3 and O4: H2's 100 counting questions all need the same query, so they couldn't separate the models, and counting needs no model at all.
  - A second model costs memory on low-resource hardware, so a separate SQL model had to earn its place.
- **How:**
  - 297 items on 90 images of R11's table: 29 answerable questions in 12 groups, each in 3 phrasings on up to 3 images (261 items), plus 12 unanswerable questions in 3 phrasings (36 items). The questions, the prompt and the rule were fixed before any run.
  - An answer counts only if its query matches the reference on 5 versions of the table (test-suite accuracy, Zhong et al. 2020).
  - RS(10) scores reliability, in points per 100 items: +1 for a right answer or a correct refusal, 0 for refusing an answerable question, −10 for a wrong answer (TrustSQL; EHRSQL 2024).
  - 95% intervals come from a cluster bootstrap over questions.
  - 4 models, each in 4-bit and fp16: our 7B and the base VL-3B (text only, no extra memory), and Qwen2.5-Coder 1.5B and 3B (separate models). One prompt, greedy decoding, up to 2 retries with the error message.
- **How it ran:** Noman's Kaggle account, T4 ×2, 23 Oct, 47 min, after two smoke tests on account 2 on 22 Oct. [h2b-sql-agent-graded-test.ipynb](Champion_Task/h2b-sql-agent-graded-test.ipynb); the run's code matches the built notebook cell by cell.
- **Expectation before the run:**
  - The rule: a configuration passes with test-suite accuracy of at least 90% and RS(10) above 0.
  - Our VLM writes the SQL if it passes in 4-bit, a separate model is only a fallback, and if nothing passes, fixed queries only.
  - No accuracy number was predicted. The smoke test's 6 items had shown both small models answering unanswerable questions and missing the NULL case.
- **Result:**
  - **No configuration passes.** The best accuracy was Coder-3B in fp16's 73.9%, and every RS(10) was negative.
  - **Our 7B in 4-bit:** 69.0% [57.1, 80.5], RS(10) −89.6. It refused 94% of the unanswerable questions, the most of any model, and adds no memory (5.8 GB, 3.3 s per question on a T4). It's level with Coder-3B in 4-bit (72.0%; the difference, −3.0 points [−10.7, 3.8], isn't clear).
  - **The base VL-3B in 4-bit:** 46.4%, RS(10) −365.7, refusing 36%; 22.6 points below our 7B [9.2, 36.8].
  - **The separate coders in 4-bit:** Coder-1.5B 56.7% (RS(10) −283.8, +1.1 GB) and Coder-3B 72.0% (RS(10) −162.6, +2.0 GB).
  - **Weak for every model:** pairs of buildings (6–28%), the "no destroyed building nearby" NULL case (0–22%), positions (0–52%) and distances (44–70%). Our 7B in 4-bit gets counts, percentages, rankings and size thresholds 89–100% right.
  - **Wording:** with responder words, our 7B in 4-bit drops to 52.9%, from 74.7% with plain words.
  - **The five table versions mattered:** on the real table alone, every model scores 4–6 points higher.
  - **Retries never fixed a query:** all 200 retried items ended refused or failed again.
  - **4-bit** costs our 7B 4.6 points [0.8, 8.8] and the VL-3B 9.9 [3.4, 17.6]; the coders lose nothing measurable.
  - Results in [H2b-results/H2b/](Champion_Task/H2b-results/H2b/README.md).
- **What it led to:**
  - By the rule fixed 22 Oct, the system answers through fixed queries only, with no free-form questions. Benchmark counting already used the fixed query, so O2's numbers don't change.
  - DisasTeller (T2) takes its facts from fixed queries, as planned.
  - The re-run on the distilled 3B is needed only if free-form questions come back. The follow-ups (a menu of fixed question templates, or question–SQL pairs in L2's training) wait on your call, and either needs a new question bank for its test.
  - The full reasoning, including why LangChain's SQL agent wouldn't change the result: [System_Design_Notes.md §3](System_Design_Notes.md).

### H1 V2 · Counts as text, and all six tasks re-scored
- **What:** our fine-tuned 7B on all six benchmark tasks, with and without a U-Net fact line before each question.
- **Why it was planned:** O2's "textual bridge", and a clean re-score of all six tasks. Our CSE499A scores had been sampled at temperature 1.0 and moved by several points between runs.
- **How:** greedy decoding, the official prompts and 512 px images. Each question was asked plain and with facts (relational: plain only).
- **How it ran:** Kaggle account 2, GPU T4 ×2, 4.3 h. [h1-v2-counts-as-text.ipynb](Champion_Task/h1-v2-counts-as-text.ipynb).
- **Expectation before the run:** keep the facts only if no task drops by more than 1 point.
- **Result:**
  - Greedy answers beat our CSE499A scores on 4 of 5 tasks: disaster type 70.7%, bearing bodies 20.5%, road damage 31.9%, land use 37.9%, relational 22.1%.
  - The fact line lowered every task (bearing bodies by 9.9 points).
  - The six-task mean was 34.2%, against the base model's 31.2%.
- **What it led to:**
  - Facts dropped, and greedy decoding became the standard.
  - H1 V2b asked counting to the 7B itself.
  - The like-for-like comparison with the paper (optical only) led to L0.

### H1 V2b · Counting asked to the 7B
- **What:** the 4,982 counting questions asked to our 7B, plain and with the fact line.
- **Why it was planned:** counting was never asked to the 7B with greedy answers. It is also the one task where the fact line is about the question itself.
- **How:** H1 V2's setup, on the counting questions only.
- **How it ran:** Kaggle account 2, GPU T4 ×2, 2.9 h. [h1-v2b-counting-by-vlm.ipynb](Champion_Task/h1-v2b-counting-by-vlm.ipynb).
- **Expectation before the run:** the counting half of O2 is met only above 34.2%.
- **Result:**
  - Plain: 30.5%, or 32.0% on optical questions.
  - With facts: 26.6%.
  - Best so far, but short of 34.2%. Like for like (optical, as the paper scores it), the gap is 2.2 points.
- **What it led to:** the O2 like-for-like correction, and the decision to improve the 7B (L0).

### T1, T1 v2, T1 v3 · Survivability heatmap
- **What:** danger, safety and search-priority maps from the predicted damage, with circled hot spots and marked safe areas.
- **Why it was planned:** O3, one of the four required outputs of the offline report. The idea comes from CSE499A's future work and BDAChat's damage-aware heatmap.
- **How:**
  - Danger is a blurred mix of destroyed and damaged pixels; safety is the distance from damage.
  - v2 fixed three faults found by eye.
  - v3 kept hot-spot markers off the image edge.
- **How it ran:** v1 on Kaggle CPU; v2 and v3 on your PC from E1's predictions. [t1-survivability-heatmap-v3.ipynb](Champion_Task/t1-survivability-heatmap-v3.ipynb).
- **Expectation before the run:** on 20 images checked by eye, the circles sit on damage and the safe areas sit off the edge. v3 needed fewer circles on the edge than v2, with no fewer on damage.
- **Result:**

  | Version | Circles on damage (20 checked images) | On the edge |
  |---|---|---|
  | v1 | 36 of 48 | 52 of 57 safe spots |
  | v2 | 39 of 46 | 12 circles; no safe spot |
  | v3 | 41 of 46 | 1 circle (1% of all 645 images, against v2's 20%) |

- **What it led to:** T1 finished; T2 and T3 will use v3.

### L1 · Edge benchmark (ONNX, INT8)
- **What:** R9 exported to ONNX and quantised to INT8, measured on a CPU.
- **Why it was planned:** O4 needs a measured speed, size and accuracy table for the field segmenter. This followed Tamanna's Plan 1.
- **How:** PyTorch FP32, ONNX FP32, and dynamic and static INT8, on the same CPU and the 645 validation images.
- **How it ran:** Kaggle CPU (no GPU quota). [l1-edge-benchmark.ipynb](Champion_Task/l1-edge-benchmark.ipynb).
- **Expectation before the run:** INT8 is usable if Destroyed IoU drops by less than 0.01.
- **Result:**
  - ONNX FP32: 1.71× PyTorch, no accuracy loss.
  - Static INT8: 2.57× PyTorch, but Destroyed IoU dropped 0.0104, just over the limit.
  - Dynamic INT8: slower than PyTorch.
- **What it led to:** L1b.

### L1b · Static INT8, second try
- **What:** L1's static INT8 with a few convolutions kept in FP32.
- **Why it was planned:** L1's fastest version missed the accuracy limit by 0.0004.
- **How:** two versions. "Keep 1+1" keeps the first and last convolutions in FP32; "keep 1+3" also keeps the two full-resolution decoder convolutions.
- **How it ran:** Kaggle CPU, about 1.5 h. Its first run stopped because the mirror wasn't attached. [l1b-static-int8-retry.ipynb](Champion_Task/l1b-static-int8-retry.ipynb).
- **Expectation before the run:** the fastest version that drops Destroyed IoU by less than 0.01 becomes the edge model; otherwise ONNX FP32 does.
- **Result:** both versions passed (drop 0.0003). Keep 1+3 runs at 1.43× ONNX FP32, 1.6 s per image, 33 MB.
- **What it led to:** the edge segmenter part of O4 is met. It will be repeated on the final champion.

### E4 · R12 against R11, by source and by event
- **What:** both models scored per image source and per event, without training.
- **Why it was planned:** to test, rather than argue, why R12's extra data didn't help. Was it the wrong place (all xBD), or the wrong problem (rubble called background)?
- **How it ran:** Kaggle account 2, GPU T4 ×1, `HF_TOKEN`, 18 min. [e4-r12-vs-r11-by-source.ipynb](Champion_Task/e4-r12-vs-r11-by-source.ipynb), results in [E4-results/](Champion_Task/E4-results/E4/README.md).
- **Expectation before the run:**
  - If R12 beats R11 on xBD images by more than 0.013 (TTA, Destroyed IoU) but not on the others, the cause is the wrong place.
  - Otherwise it isn't.
- **Result:**
  - Both models reproduced their CSVs.
  - On xBD images Destroyed IoU went 0.456 → 0.463 (+0.007), within noise; on the others 0.071 → 0.069. So by the rule: **not the wrong place**.
  - Per event, the gain follows the extra data (rank correlation +0.73 over 13 xBD events). Palu got the most extra destroyed buildings (2,206) and gained +0.047.
- **Found alongside** (read-only checks on your PC, from R16's saved R11 masks, E1's true masks and R16's per-building table):
  - **Turkey's earthquake** holds 37% of the validation's destroyed pixels. R11 scores Destroyed IoU 0.000 there: it calls 91.5% of them intact and predicts destroyed on only 5 pixels.
    - Training has 557 Turkey images with 3.75 million destroyed pixels, so it isn't a lack of examples.
    - **Without Turkey, R11's Destroyed IoU is 0.410** (mIoU 0.618).
  - **The floods** (Harvey, Midwest, Florence) also score about 0: R11 calls their destroyed buildings damaged.
  - **R16's grader**, comparing before and after crops per building, finds 72–83% of Turkey's destroyed pixels (Destroyed IoU 0.13, or 0.19 corrected). It is held down by over-grading.
- **What it led to:** O1's gap is almost entirely Turkey, and the building-by-building comparison sees what the pixel model misses. R16c step 2 is now watched on Turkey, from its saved per-building table.

### E5 · Train/validation leak and the benchmark's copies (opened 26 Oct)
- **What:** check whether validation images are copies of training images, and whether benchmark test images are copies of DisasterM3 Instruct images.
- **Why it was planned:**
  - Ridita's audit (pushed 25 Oct) found 40 of the 645 validation pairs are near-copies of training pairs: xBD's `socal_fire` and `woolsey_fire` share before-images.
  - Every O1 score (R1–R16c) is measured on those 645 images.
  - The 7B and R11 were trained on Instruct images, so benchmark copies would raise O2's numbers too.
- **How, so far:**
  - A check on your PC hashed xBD's original before-images and found 21 leaked pairs (80,709 destroyed pixels).
  - R16c was re-scored from its per-building file without them.
  - Details: [E5-results/E5/](Champion_Task/E5-results/E5/README.md).
- **Result so far:**
  - R16c's four combinations score 0.3006–0.3159 on all 645 images, 0.2915–0.3070 without the 21, and 0.2826–0.2976 without all 86 fire images. O1 is at risk.
  - From E1's per-image counts (26 Oct), R9 with TTA drops from 0.3001 to 0.2937 without the 21 pairs.
  - E1's Gate G2 still sends R11 first: 58.7% of missed destroyed pixels are called background without the 21 pairs, and 56.8% without all fire images, against the 40% rule. Table in [E5-results/E5/](Champion_Task/E5-results/E5/README.md).
- **What it led to:**
  - **Go given 26 Oct for two notebooks on account 2:**
    - step 1 (CPU) hashes DisasterM3's own images to settle 21 against 40, and checks the benchmark against Instruct, with a near-copy check (dHash plus thumbnail correlation) and pictures for review;
    - step 2 (GPU, about 1 h) saves per-image pixel counts for R11, R11s7, R9 and R1, so any leak list can be removed on your PC.
  - **Both notebooks built 26 Oct and dry-run checked on your PC,** with the real manifest and masks and stand-in images: [e5-step1-hash-check.ipynb](Champion_Task/e5-step1-hash-check.ipynb) and [e5-step2-per-image-counts.ipynb](Champion_Task/e5-step2-per-image-counts.ipynb).
    - The split check passes: 6,443 pairs, 645 validation pairs (560 from xBD), 1,808,111 destroyed pixels.
    - Planted copies are found exactly: the known twin, an identical after-image, a recompressed before-image (listed as a near-copy, not counted), and benchmark copies on the right questions.
    - Step 2 ran with a stand-in model. On Kaggle, its own check is that every model reproduces its D4 CSV.
  - Ridita's prompt asks for `val_train_leaks.csv` and the audit's scripts: [Ridita_Task/E5_leak_audit_prompt.md](Ridita_Task/E5_leak_audit_prompt.md).
  - **A rule from now on:** any validation or benchmark score is checked for copies by image content, not by name. D5's check compared names only and missed this leak.
  - **Decided 26 Oct: every score a leak touched is re-scored, with no 1% threshold.** The first plan re-scored the 7B and H2 only if over 1% of the benchmark's optical questions were copies. Dropped, because the re-score is a filter over saved per-question and per-image files (minutes on the PC), and a reviewer can ask about any affected number. Each score is reported twice: all, and clean. The full list is in the roadmap's E5 step 3. R2–R8 and R10 aren't re-scored (no checkpoints or per-image counts). Without the 40 pairs, every U-Net measured drops by a similar 0.012–0.013, so the gaps between U-Net runs move by about 0.001, under the 0.005 noise margin, and their decisions stand. *(Narrowed later on 26 Oct, after step 2: this holds for the after-only U-Nets R1–R10, which these runs are all compared with. The before + after models R11 and R11s7 drop 0.027.)*
- **Result, 26 Oct: the full list of 40, and the clean scores.**
  - Ridita's audit README settles 21 against 40: her 40 include our 21. We missed 19 because their socal_fire side isn't an xBD tier-1 image. Her section 4 lists the 19; with ours they make [leaked_pairs_40.csv](Champion_Task/E5-results/E5/leaked_pairs_40.csv).
  - The list checks out: 155,812 destroyed pixels, as she reports, and E1's per-image ground truth matches each pair. Her `val_train_leaks.csv`, sent later the same day, matches it exactly (pairs, twins and pixels).
  - **Without the 40 (605 clean pairs):** R16c's four combinations score 0.2838–0.2980 (mean 0.2917), all below 0.30. **O1 isn't met on clean data;** the best combination is 0.002 short. R9 with TTA is 0.2874.
  - E1's Gate G2 still holds (55.7–58.4% of missed destroyed pixels called background).
  - Table in [E5-results/E5/](Champion_Task/E5-results/E5/README.md).
  - **Still open:**
    - R11 and R11s7 alone (step 2);
    - R16c step 5;
    - the benchmark check (step 1). Ridita couldn't run it, because the benchmark images aren't on her PC.
    - Step 1's validation part now serves as a third, independent check of the 40.
- **Result, 26 Oct: steps 1 and 2 done (account 2), and every affected score re-scored on your PC.**
  - **How it ran:** step 1 on CPU, fingerprinting in 15.4 min; step 2 on GPU, 31 min for the four models.
  - **Checks:**
    - Both rebuilt the split as in every D4 run.
    - All 8 model rows reproduced their D4 CSVs.
    - Step 1 found the same 40 pairs: three independent checks now agree.
    - Its 3 validation "review" matches are different places.
    - Every "all" score below reproduces its published number (one exception, explained in the E5 README).
  - **Against the expectations fixed before the run:**
    - 21–40 leaked pairs: 40, yes.
    - All of the PC's 21 found: yes.
    - Benchmark: no prediction was made. 186 of 10,675 optical questions (1.74%) use a copied after-image.
  - **Segmentation, clean (605 pairs), Destroyed IoU:**
    - R16c step 5's SAM 3-only map: **0.3161 and 0.3051, the only map that passes O1's gate on clean data**, with mIoU 0.547.
    - Steps 2 and 3: 0.2838–0.2980, so they fail.
    - R11 and R11s7 with TTA: 0.2692 and 0.2652.
    - R9 with TTA: 0.2874.
  - **The leak helped the before + after models twice as much** (−0.027, against −0.012 to −0.013 for the after-only U-Nets). Each leaked pair shares its before-image with a training pair. So on clean data, R11's Destroyed IoU is 0.018 below R9's. R11's mIoU gain (+0.04) and its lower share of misses called background (28% against 58%) still hold.
  - **Benchmark, clean:**
    - O2 counting (R11's TTA counts, optical): 32.96% → 32.47%. The gap to 34.2% grows from 1.24 to 1.73 points.
    - The old 7B's six tasks at full size drop by at most 0.7 points (mean 38.37 → 38.14).
    - Everything else drops by 0.0–0.7 points, and no decision changes.
  - Full tables, review notes, and how it was scored: [E5-results/E5/](Champion_Task/E5-results/E5/README.md). Step outputs: [step1/](Champion_Task/E5-results/step1/README.md) and [step2/](Champion_Task/E5-results/step2/README.md), moved there from `E5-step1-results/` and `E5-step2-results/`.
  - **What it leads to:**
    - O1 rests on step 5's SAM 3 map on clean data. A third grader seed is proposed to confirm seed 43's narrow pass. *(Done 27 Oct: seed 44 scores 0.2982 clean, so O1 is met on the three-seed mean only, 0.3065. See step 5b below.)*
    - O2's counting still needs about 2 points.
    - Every future split is grouped by before-image fingerprint.
    - The new 7B's scores will be reported both ways.

### E6: the test split's ground truth (7 Nov)

- **What:** one four-class mask per optical test pair (0 background, 1 intact, 2 damaged, 3 destroyed), merged from the benchmark's black-and-white segmentation masks with the training rule (intact, then damaged, then destroyed). Input: the benchmark mirror, the D4 split and E5 step 1's copy list. No model is trained or scored. [Notebook](Champion_Task/e6-test-split-ground-truth.ipynb); [results](Champion_Task/E6-results/E6/README.md).
- **Why, and what it improves:** every segmentation score so far is on 645 validation pairs (605 clean). This gives a second, larger and unseen test set, and true counts for count error. E7 scores the whole chain on it.
- **Expectation, fixed on 4 Nov:** 2,067 pairs, 57 copies, 2,010 clean, masks like the training ones, no overlaps. No number was predicted for outlines. Revised on 7 Nov to 2,008 after the first full run stopped on an unreadable image and E5's fingerprints showed a second one.

| Check | Rule | Result |
|---|---|---|
| Inventory | 2,067 pairs, no file missing | 2,067 pairs (1,030 / 558 / 479); **NO**: 2 with an unreadable image |
| Masks like the training masks | values 0 and 255, 1024 px, unasked masks empty | **NO** on 1 pair: `sunda_tsunami_00000042`, an unreadable mask |
| Overlaps | at most 0.5% of building pixels | yes: 0 of 291,904,133 |
| Copies | 57 left out (56 training, 1 validation) | yes, exactly |
| Clean pairs | 2,010 | **NO: 2,007** |
| Outlines drawn alike | median piece-area ratio within 0.67–1.5 in at least 80% of shared events | yes: 12 of 12 |

- **Against the expectation:** one pair fewer than the 2,008 revised figure. E5's fingerprints cover images, not masks, so they couldn't show the Sunda mask. Its intact and destroyed masks gave pixels and its damaged count is 0, so the damaged mask is probably the unreadable one; the output doesn't name it.
- **The left-out pairs:** `mexico_earthquake_00000140` (after-image), `tuscaloosa_tornado_00000278` (before-image, an empty file) and `sunda_tsunami_00000042`. All are listed in `test_pairs.csv`. The Sunda pair's mask is in the zip but must not be used: only `test_clean_pairs.csv` counts.
- **What the clean set holds:** intact 252,819,282, damaged 24,791,802 and destroyed 13,225,057 pixels; validation has 1,808,111 destroyed. Turkey has 414 pairs. Of the 28 events in the clean set, 16 couldn't be compared because they have fewer than 20 pairs in validation or test, including Mexico (191 test pairs), Joplin (148), Palu (124) and Ian (104).
- **Closest to the outline limits:** Turkey 0.695 and SoCal 1.465. They pass the rule but are worth reading first if a per-event score looks odd.
- **Why these checks, and the alternatives:** the rules were fixed before the run so an unseen set can't be shaped by its results. The median-area ratio is a limited check: it shows whether outlines are drawn at a similar size, not whether their shapes match, and it covers only 12 of the 28 events. Keeping the copied pairs was rejected, because a model has seen them in training.
- **Runs:** [run 1, stopped at Cell 4](Champion_Task/E6-results/run1-stopped-at-cell4/e6-test-split-ground-truth.log), and [run 2, the smoke test](Champion_Task/E6-results/run2-smoke-test/e6-test-split-ground-truth.ipynb). Between the smoke test and the full run only Cell 1's flag, Cell 4's unreadable-image check and the first cell's text changed (compared cell by cell).

### E7: the chain scored as one (built 7 Nov)

- **Step 1, on your PC, done 7 Nov.** [Notebook](Champion_Task/e7-step1-validation-counting.ipynb); [results](Champion_Task/E7-results/step1/README.md).
  - **What:** the first counting number for the chain: SAM 3 (prompt "building", on the before-photo in four quarters) finds each building, and a Siamese ResNet-18 trained on SAM 3's outlines labels it intact, damaged, destroyed or not a building. Each map's 8-connected blobs of at least 20 px are counted, and the nearest option is picked, on the 1,055 training-split counting questions on the 645 validation images.
  - **Why:** no counting figure existed for this map, and step 2 needs an expectation before any test score exists.
  - **Expectation, fixed before the run:** about 36–40%, near R11's 39.24% (R11: U-Net with a ResNet-50 encoder, before and after photos as input); median count error about R11's 33%.

    | Method | Accuracy | On the 605 clean pairs | Median count error | Counts within 20% of the truth |
    |---|---|---|---|---|
    | Chain, grader seed 42 | 37.73% | 37.47% | 40.0% | 32.8% |
    | Chain, grader seed 43 | 37.63% | 36.55% | 37.5% | 32.5% |
    | Chain, grader seed 44 | 38.67% | 37.99% | 36.4% | 34.8% |
    | R11 | 39.24% | 39.01% | 33.3% | 38.8% |
    | Rule that never sees the image | 59.72% | 60.06% | n/a | n/a |

  - **Against the expectation:** accuracy met. Seed 42 against R11 isn't clearly different (exact McNemar: 143 questions only the chain gets right, 159 only R11, p = 0.39). Count error is a little worse than expected (40% against 33%), so R11 still counts slightly better on this measure.
  - **Checks:** the painted maps rebuild the published pixel scores (largest difference 0.0012, seed 43's known one); every one of 26,834 outlines matches its row; the true masks answer all 1,055 questions; R11 reproduces 39.24%.
  - **Limit:** these are training-split questions, and the no-image rule was found on them, so its figure here is only a reference. Its fair test is on the benchmark's questions (66.98%).
- **Step 2, done (account 1; output files from 7–8 Nov, downloaded 11 Nov).** [Notebook](Champion_Task/e7-step2-chain-on-test-pairs.ipynb); [results](Champion_Task/E7-results/step2/README.md).
  - **What:** find-then-grade (SAM 3's outlines on the before-image, three grader seeds) against R11 with TTA, on the 2,065 readable optical test pairs; maps scored on E6's 2,007 clean pairs, counting on the benchmark's 3,580 askable counting questions.
  - **Why:** every segmentation score so far came from the 645 validation pairs, which were also used to choose models. The rule fixed before the run (roadmap G6): find-then-grade stays the chain only if its destroyed-building IoU beats R11's and its counting isn't clearly below.
  - **Expectation, fixed before the run:** both lower on test than on clean validation (0.3065 and 0.2692); counting level with R11's.
  - **Result:**
    - Destroyed-building IoU 0.3898 (mean of seeds 42, 43, 44: 0.4055, 0.3983, 0.3657) against R11's 0.3984.
    - Mean IoU 0.5129 against 0.5721; building IoU 0.5416 against 0.6944.
    - Turkey (414 pairs): 0.3233 against 0.0867. Without Turkey: 0.4105 against 0.4672.
    - Counting on E5's clean questions: 32.7% against 32.53% (p = 0.87); median count error 40% against 38%.
    - With perfect grades on SAM 3's outlines, 0.5898. The graders' macro F1 on the true test buildings was 0.68–0.70 (validation 0.73–0.75).
  - **Against the expectation:** both scored higher on test (0.39 and 0.40), not lower; counting level, as expected.
  - **By the rule:** not above, so the choice of chain reopens before T2 step 5.
  - **Checks:** safety checks on 12 validation images passed (SAM 3 0.9997, graders within 0.0117, R11's pixels within 0.05%); R11's table reproduced H2's 32.96% (33.02% on the 3,580 askable questions).
- **Step 2b, on your PC (11 Nov), on your go: is the gap noise?** [Notebook](Champion_Task/e7-step2b-resampling-test.ipynb); [results](Champion_Task/E7-results/step2b/README.md).
  - **How:** step 2's saved maps and per-outline scores scored per pair; the gap (find-then-grade, mean of three, minus R11) recomputed on 10,000 redraws of the pairs, and of the 28 events with all their pairs.
  - **Expectation, fixed before the run:** the interval includes 0 overall, at both levels; R11's lead without Turkey holds; find-then-grade's lead on Turkey holds; the intervals by event are wider. **All met.**
  - **Result:**
    - Overall: −0.0086, with 95% intervals of −0.038 to +0.022 by pair and −0.098 to +0.089 by event. That's noise.
    - Without Turkey: −0.057 (−0.078 to −0.036 by pair; −0.111 to −0.020 by event).
    - Turkey: +0.236 (0.161 to 0.304).
  - **The first run stopped at its own check:** seed 43, rebuilt from scores saved to 6 decimals, differed from step 2 by 0.0006 on Turkey. Seed 42 is now scored from its saved maps; seeds 43 and 44 are allowed 0.001 (11–19 near-tied outlines per seed).
  - **What it leads to:** your choice of chain (tracker, "Needs you now"). Recommended: a mix of SAM 3's outlines and R11's pixels, chosen on validation and confirmed once on test.
  - **Dry-run checks on your PC:** the notebook's real cells ran on a mock of Kaggle's inputs, with the real benchmark, E6's pairs and masks, E5's flags and the three graders' weights, and with stand-ins for SAM 3, R11 and OpenCV. A smoke-size run used the real graders; a full-size run covered all 2,065 pairs and every code path a smoke test skips, with a quick stand-in for the graders' forward pass. Three planted faults stopped the run as they should. Given H2's real counts for R11, the notebook reports 32.96% and 32.47% and says it reproduces them.
  - **Not tested until Kaggle:** SAM 3 installed in its own folder (SAM 3 needs `timm` 1.0.17 or later, and R11's library pins 0.9.7, so SAM 3 runs in a separate process), and all three models on real pictures. Cell 7 checks those on validation images before the long run: SAM 3 against E3's maps, the graders against their saved log-probabilities, R11 against its saved pixels.
- **E6's masks against the benchmark, on your PC:** the merged masks give the exact true count on all 3,470 optical counting questions on the 2,007 clean pairs, so count error can be trusted on them.
- **Why count error was added (7 Nov):** accuracy on these options can't show counting ability (§7, the benchmark option check). The alternatives are in that entry.

## 5. Phase B: structural training runs

### R11 · Before + after images (6 channels)
- **What:** the U-Net sees the before-image as well as the after-image.
- **Why it was planned:**
  - Phase2_Plan's main bet. All of xView2's top five used both images, and BRIGHT's before-image raised Destroyed IoU from 59.5 to 64.9.
  - Gate G2 put it first: rubble is called background, and the before-image shows where the building stood.
- **How:**
  - R5's recipe (the sampler, without copy-paste, which would paste rubble where the before-image shows nothing).
  - Both images get the same crop, flip and rotation and are stacked into 6 channels.
  - It checked first that the image pairs line up.
- **How it ran:** Kaggle main account, GPU T4, 6.6 h. [d4-champion-model-R11.ipynb](Champion_Task/d4-champion-model-R11.ipynb).
- **Expectation before the run:** the keep rule against R5 and R9.
- **Result:**
  - mIoU 0.581 (0.588 with TTA), the biggest gain so far: +0.046 over R5.
  - Destroyed IoU 0.291 (0.297), unchanged. So it didn't pass the Destroyed part of the rule, but it didn't drop either.
  - 6 of the 20 checked pairs are shifted by more than 5 px.
- **What it led to:** the new champion recipe and the base of R12, R16 and R11s7.

### R12 · Add the extra xBD tiles
- **What:** R11's recipe plus 1,619 extra xBD tiles holding 8,021 destroyed buildings (D5's 1,007 and D5b's 612).
- **Why it was planned:** O1's gate fails only on Destroyed IoU, and destroyed is the rarest class (about 0.3% of pixels). More destroyed examples was Phase2_Plan's second bet.
- **How:**
  - The tiles were added to training only, with un-classified pixels ignored in the loss.
  - The same 5,798 samples per epoch and 40 epochs were kept, so the change was more data, not more training.
- **How it ran:** Kaggle account 2, GPU T4, 6.4 h of training.
  - The first run stopped after 6 minutes on a bug in Cell 4b: it took the uploaded masks folder, which shares the photos' file names, for the photos. It was fixed in one line.
  - [d4-champion-model-R12.ipynb](Champion_Task/d4-champion-model-R12.ipynb).
- **Expectation before the run:**
  - No number was predicted. E1 had already pointed to "missed as background" more than to misgrading, so R12 was the second bet.
  - The keep rule against R11.
- **Result:** mIoU 0.582 (0.588 with TTA), Destroyed IoU 0.290 (0.295). Within noise of R11, so not kept.
- **What it led to:** R11 stays the champion, and E4 tests why.
- **Checked by content, 27 Oct:** two of the 1,619 extra tiles share a before-image with a validation pair outside E5's 40: `socal-fire_00000876` with `woolsey_fire_00000669`, and `woolsey-fire_00000262` with `socal_fire_00000202` (6,860 destroyed pixels in all). So R12 trained on 42 leaked pairs. A leak can only flatter R12, which still didn't beat R11, so the verdict stands. Details in [E5-results/E5/](Champion_Task/E5-results/E5/README.md).

### R11s7 · R11 with seed 7
- **What:** R11's recipe again, with seed 7 instead of 42.
- **Why it was planned:** O1's gate needs two seeds (or their mean) above the bar. Nothing beyond R11 passed the keep rule, so R11's second seed runs as R11s7 instead of R15 (your decision, 19 Oct).
- **How:** R11's notebook with two edits in Cell 2: `EXPERIMENT = "R11s7"` and a preset with `seed=7`.
- **How it ran:** Kaggle account 2, 6.8 h, after E4. [d4-champion-model-R11s7.ipynb](Champion_Task/d4-champion-model-R11s7.ipynb), results in [R11s7-results/](Champion_Task/R11s7-results/d4_R11s7/D4_R11s7.csv).
  - Checked: its config says seed 7 and 6 channels, its history has 40 continuous epochs, and the last epoch matches the CSV.
- **Expectation before the run:** no number was predicted. The rule was fixed: the gate needs both seeds, or their mean, above 0.30.
- **Result:**
  - mIoU 0.587 (0.591 with TTA), Destroyed IoU 0.287 (0.293).
  - Against R11 with TTA: mIoU +0.004, Destroyed IoU −0.004. The seed moves R11 far less than it moved R1 (0.013).
  - The two seeds' TTA mean is 0.5894 / 0.2947: the U-Net alone misses O1's 0.30 on two seeds.
- **What it led to:** O1's two-seed claim rests on R16c step 3, which grades SAM 3's buildings plus R11s7's pieces with step 2's graders.

## 6. Phase C: the find-then-grade model

### R16 · Find each building, then grade it
- **What:**
  - The finding: SAM 3 finds buildings in the before-image, plus R11's pieces SAM 3 missed.
  - The grading: a Siamese ResNet-18 grades each building from 96 px before and after crops.
- **Why it was planned:**
  - Phase2_Plan's fallback; xView2's 1st place and BRIGHT both find buildings first, then grade them.
  - One grade per building helps counting (O2) and DisasTeller (O3).
  - It is clean for the benchmark.
  - You decided it runs regardless of R12.
- **How:**
  - The grader was trained on 102,716 true building pieces, with the grades drawn equally often, for 10 epochs.
  - Three maps were scored: SAM 3 only, SAM 3 + R11's pieces, and a vote with R11.
- **How it ran:** Kaggle account 1, GPU T4, with E3's output and `HF_TOKEN`, 29 min. [r16-find-then-grade.ipynb](Champion_Task/r16-find-then-grade.ipynb) (named `r16-two-stage-grader` until 20 Oct, here and on Kaggle).
- **Expectation before the run:** the keep rule against R11 with TTA: Destroyed IoU up by more than 0.013, mIoU down by at most 0.005.
- **Result:**
  - Not kept. The best Destroyed IoU was 0.261 (the vote), against 0.297.
  - The grader over-graded intact buildings: 1,924 of 19,624 were graded destroyed, giving destroyed precision 0.35 and recall 0.89.
  - On the 85 non-xBD images it doubled R11's Destroyed IoU (0.128 against 0.071).
- **What it led to:** R16b.

### R16b · The grader corrected by the real grade shares
- **What:** R16's grades recomputed with a fixed rule, without retraining.
- **Why it was planned:** equal-share training made the grader act as if a third of all buildings were destroyed, when the real share is 8%.
- **How:**
  - Each grade's probability was multiplied by its real share among the training buildings (73.7%, 18.4%, 8.0%) and divided by a third.
  - It rebuilt R16's scores exactly first.
- **How it ran:** on your PC (CPU, 7.3 min). [r16b-grader-prior-correction.ipynb](Champion_Task/r16b-grader-prior-correction.ipynb).
- **Expectation before the run:** the same keep rule. The rule comes from training data only, so nothing is tuned on validation.
- **Result:**
  - Every map improved; the vote reached mIoU 0.585 and Destroyed IoU 0.274.
  - Intact buildings graded destroyed fell from 3,539 to 1,500.
  - Still below R11, so not kept.
- **What it led to:** your request for a rigorous R16 test, which became R16c.

### R16c step 1 · The ceiling, and a counting check
- **What:**
  - The best score R16's outlines could reach with a perfect grader.
  - How well each method answers the 1,055 validation counting questions.
- **Why it was planned:** to tell whether the outlines or the grader limit R16, and whether R16's counts would beat counting from R11's pixel map before any GPU time goes to the benchmark.
- **How:** from saved outputs only (R16, R16b, E3, E1). Every rebuilt building was checked against R16's per-building table, and the true masks had to answer 100% of the counting questions.
- **How it ran:** on your PC (CPU, 2.6 min). [r16c-step1-ceiling-and-counting.ipynb](Champion_Task/r16c-step1-ceiling-and-counting.ipynb).
- **Expectation before the run:** no number; it is a diagnosis.
- **Result:**
  - With a perfect grader, SAM 3 + R11's pieces reach Destroyed IoU 0.614 and mIoU 0.766. Our grader gets 0.208 and 0.541.
  - Counting:
    - R11's blobs: 39.2%;
    - R16's best map: 36.9%;
    - a perfect grader: 55.3%.
- **What it led to:** the grader is the bottleneck. R16c step 2, and the grader on SAM 3's outlines (now steps 4 and 5), were built.

### R16c step 2 · A stronger grader
- **What:** R16 with a better-trained grader, the same finding, and the same three maps.
- **Why it was planned:** step 1 showed the grader is the bottleneck (ceiling 0.614 against 0.208). E4 then found that R16's grader sees Turkey's collapses, which R11 misses.
- **How:**
  - 128 px crops with a 32 px margin, 20 epochs with the best kept.
  - The epoch and a bias per grade were picked on 580 held-out training images, never on validation.
  - Two seeds; R11 (seed 42) supplies the extra pieces.
- **How it ran:** Kaggle account 1, GPU T4 ×2 (one used), with E3's output and `HF_TOKEN`, 1.37 h. [r16c-step2-stronger-grader.ipynb](Champion_Task/r16c-step2-stronger-grader.ipynb), results in [R16c-results/step2/](Champion_Task/R16c-results/step2/README.md) (Kaggle's output folder: `R16c-truth`).
- **Expectation before the run:** the keep rule against R11 with TTA on both seeds (Destroyed IoU up by more than 0.013, mIoU down by at most 0.005). The grader on SAM 3's outlines only if no map is kept on both seeds.
- **Result:**
  - **SAM 3 + R11's pieces was kept on both seeds, and the O1 gate passed on both:**
    - seed 42: mIoU 0.587, Destroyed IoU 0.316;
    - seed 43: mIoU 0.585, Destroyed IoU 0.311;
    - R11: 0.588 and 0.297.
  - **Caveat added 26 Oct (E5):** these scores are on all 645 validation images, some of which are near-copies of training images. Without the 21 leaked pairs found so far, the four combinations of steps 2 and 3 score 0.2915–0.3070. The clean score decides O1.
  - The grader on the true buildings scored macro F1 0.778 and 0.784, against R16's 0.656 and BDAChat's 0.763.
  - It closed 25–27% of the gap to the ceiling.
  - Read-only checks on your PC, from its per-building table:
    - Turkey: 0.000 → 0.24–0.27;
    - xBD images: 0.456 → 0.35–0.38;
    - counting: 37–39% on the validation questions, about R11's level.
- **What it led to:** the gate passes on one U-Net seed and two grader seeds. Proposed next, and both decided 20 Oct:
  - step 3: the same graders with R11s7's pieces, for two U-Net seeds;
  - steps 4 and 5, a stretch: a grader trained on SAM 3's outlines, which may recover xBD.

  Counting from it on the benchmark (H1 V3) waits.

R16c's steps were renumbered 1–5 on 20 Oct (your decision): step 3 was first called 2b, step 4 was 3a, and step 5 was 3b.

### R16c step 3 · Step 2's graders with R11s7's pieces (first called 2b)
- **What:** step 2's two graders and their biases, loaded as they were kept, with R11s7's pieces in the finding. Evaluation only. [r16c-step3-r11s7-pieces.ipynb](Champion_Task/r16c-step3-r11s7-pieces.ipynb).
- **Why:** step 2's gate pass rests on one U-Net seed (R11); O1 asks for two.
- **How it ran (21 Oct):**
  - Kaggle account 2. Validation took 26.7 min.
  - E3's and step 2's outputs were attached by sharing account 1's notebooks with account 2.
  - Results in [R16c-results/step3/](Champion_Task/R16c-results/step3/README.md).
- **Expectation, fixed before the run:**
  - SAM 3 + R11s7's pieces passes the gate and the keep rule on both grader seeds, within about 0.01 of step 2.
  - Sanity checks: the graders reproduce step 2's macro F1 on the true buildings, and R11s7 reproduces its D4 CSV.
- **Result:**
  - **Sanity checks:** both pass. R11s7 reproduces its CSV, and the graders give step 2's macro F1 (0.7779 and 0.7843).
  - **Gate (mIoU > 0.52, Destroyed IoU > 0.30): passes on both grader seeds:**
    - seed 42: 0.5843 / 0.3090;
    - seed 43: 0.5830 / 0.3006, only 0.0006 above the bar.
  - **Keep rule against R11s7 with TTA (0.5913 / 0.2928): not kept on either seed:**
    - mIoU falls by 0.0070 and 0.0083, more than the 0.005 allowed;
    - Destroyed IoU rises by 0.016 and 0.008.
  - **Against step 2 (R11's pieces):** mIoU −0.0026 and −0.0022, Destroyed IoU −0.0069 and −0.0100. That's within about 0.01, as expected.
  - **Against the expectation:** the gate and the closeness to step 2 came out as expected; the keep rule didn't.
- **What it led to:**
  - **O1's gate is met on two U-Net seeds**, with every combination of U-Net seed and grader seed above 0.30. The mean of the four is 0.585 / 0.309.
  - **At risk since 26 Oct (E5):** measured on all 645 validation images, which include leaked pairs. Without the 21 found so far, the mean of the four is 0.3000, and one combination is at 0.2915.
  - **The honest caveats:**
    - the weakest combination clears 0.30 by only 0.0006;
    - against the stronger U-Net seed, the system trades about 0.007 mIoU for its Destroyed gain, so our stricter keep rule (against the U-Net) holds on one U-Net seed only.

### R16c steps 4 and 5 (step 4 done 20 Oct, step 5 done 26 Oct; first called 3a and 3b)
- **What:** step 4 runs SAM 3 on the 5,798 training images (about 3.5–4 h). Step 5 trains the grader on SAM 3's own outlines, with a "not a building" label (about 1.5–2 h).
- **Why:** by step 2's rule they aren't needed, since step 2 was kept. But training on the outlines it grades may recover the xBD loss and cut Turkey's false alarms. You chose to run them as a stretch (20 Oct).
- **How it runs:**
  - Step 4: [r16c-step4-sam3-training-images.ipynb](Champion_Task/r16c-step4-sam3-training-images.ipynb).
  - Step 5: [r16c-step5-grader-on-sam3-outlines.ipynb](Champion_Task/r16c-step5-grader-on-sam3-outlines.ipynb), step 2's notebook with `TRAIN_OUTLINES = "sam3"` set, and step 4's output attached.
  - Kaggle account 1, about 5–6 h in all.
- **Expectation, fixed before the run:** step 5 replaces step 2 only if it beats step 2's kept map on both seeds by the keep margin (Destroyed IoU up by more than 0.013, mIoU down by at most 0.005). It is also checked for whether xBD recovers without losing Turkey.
- **Step 4 result (20 Oct, account 1, 4.6 h):** complete, 5,798 of 5,798 maps.
  - Building IoU 0.629 and destroyed footprint recall 0.693 on the training images, against 0.630 and 0.634 on validation (E3).
  - So step 5's grader trains on outlines as good as the ones it grades.
  - Results in [R16c-results/step4/](Champion_Task/R16c-results/step4/README.md). Step 5 is running.
- **Step 5 result (account 1, finished 26 Oct; graders 60 min, validation 36 min): it doesn't replace step 2. But its SAM 3-only map is the one map that passes O1's gate on clean data.**
  - **Against the rule fixed before the run:** its SAM 3 + R11 map scores 0.5496 / 0.2434 (grader 42) and 0.5410 / 0.2158 (grader 43), against step 2's 0.5869 / 0.3159 and 0.5852 / 0.3106. That's 0.07–0.09 lower in Destroyed IoU, so it doesn't replace step 2.
  - **The SAM 3-only map** (SAM 3's outlines graded, with no R11 pieces added):
    - All 645 pairs: 0.5520 / 0.3347 and 0.5522 / 0.3242, so it passes the gate on both seeds.
    - Clean (E5's 605 pairs): 0.5469 / 0.3161 and 0.547 / 0.3051.
    - It isn't kept against R11 with TTA, because its mIoU is 0.035 lower. The keep rule decides the champion; O1's gate is a separate test.
  - **Why adding R11's pieces hurts here:** this grader learned on SAM 3's outlines and over-calls R11's pieces as destroyed. Destroyed precision falls from 0.63 to 0.32. Step 2's grader, trained on true outlines, handled them better.
  - **On the true validation buildings:** macro F1 0.737 and 0.730, against step 2's 0.778 and 0.784. SAM 3's rougher outlines make a weaker grader overall.
  - **The Destroyed bias sits at the search grid's lowest value (−4.0) in 38 of the 40 epoch searches.** The search wanted a stronger penalty than the grid allows. A wider grid, still picked on held-out training images, is a possible next try.
  - **Checks:**
    - R11 reproduces its D4 CSV.
    - Seed 42's maps are rebuilt exactly from `instances_val.csv`.
    - Seed 43's aren't: 0.3254 rebuilt against 0.3242 published. Rounding, the biases and file errors were ruled out ([E5-results/E5/](Champion_Task/E5-results/E5/README.md)). Its clean score uses the lower value.
  - **Files:**
    - Results in [R16c-results/step5/](Champion_Task/R16c-results/step5/README.md), moved there from `R16c-step5-results/`.
    - The graders (`grader_seed42.pth`, `grader_seed43.pth`) stay local and are git-ignored.
  - **What it leads to:** O1's status on clean data rests on this map. A third grader seed (44) would show whether seed 43's narrow pass is typical.
    - **Built 26 Oct on your go** as [r16c-step5b-third-grader-seed.ipynb](Champion_Task/r16c-step5b-third-grader-seed.ipynb): step 5 with seed 44 and its own output folder.
    - Additions: clean scores (E5's 40 listed in Cell 2), 6-decimal log-probabilities, and a rebuild check of the saved rows against the maps' own counts.
    - **O1's verdict rule, fixed before the run:** every seed above 0.52 / 0.30 on the clean pairs means met on three seeds; otherwise a passing three-seed mean means met on the mean only, narrowly; otherwise not met.
    - **Dry-run checked on your PC:** Cell 10 on step 5's real data reproduced R11 and seed 42's clean 0.5469 / 0.3161. Cells 9 and 10 ran end to end on synthetic images, and their clean counts and rebuild check were exact.
    - About 2.5–3.5 h on account 1 (my first estimate of 1 h left out the masks and crops).
  - **Step 5b's result (27 Oct, account 1, 2.3 h): seed 44 misses the gate on clean data by 0.002.**
    - Seed 44's SAM 3-only map: 0.5527 / 0.3156 on all 645 pairs (gate passed), 0.548 / 0.2982 on the 605 clean ones (failed).
    - **Expectation, fixed before the run:** about 0.30–0.32 on the clean pairs. Just under it.
    - **O1's verdict by the rule:** seeds 42 and 43 pass, 44 doesn't, and the three-seed mean passes (0.5473 / 0.3065). **Met on the mean only, narrowly.**
    - **Checks:** R11 reproduces its D4 CSV; the saved rows rebuild the maps exactly (step 5's seed 43 rebuilt only to within 0.0012); the run notebook matches the build cell by cell.
    - The grader on true buildings: macro F1 0.754, the best of the three seeds (0.737 and 0.730), below step 2's 0.778 and 0.784.
    - The other maps repeat step 5's pattern: SAM 3 + R11's pieces 0.1813 and the vote map 0.2805 (all 645). None is kept against R11 (the SAM 3 map's mIoU is 0.553 against R11's 0.588).
    - Results in [R16c-results/step5b/](Champion_Task/R16c-results/step5b/README.md); the grader (`grader_seed44.pth`) stays local and git-ignored.
  - **What it leads to:** O1 is reported as met on clean data on the mean of three grader seeds, narrowly, with both numbers (all 645, and clean). More seeds aren't recommended: adding them until one passes would bend the rule fixed before the run.

## 7. The 7B and distillation

### L0 step 1 · Our 7B at the paper's image size
- **What:** disaster type and relational reasoning re-scored at three image sizes.
- **Why it was planned:**
  - Like for like (optical questions, as the paper's Table 2), our 7B trails the paper's own fine-tune by 4.3 points, mostly on these two tasks.
  - Our training recipe matches the paper's Appendix B.3, but we tested at 512 px and the paper at full size.
  - You decided to improve the 7B before distilling.
- **How:** the 1,211 optical questions at 504 px (H1 V2's size, as the control), at 616 px (our training cap) and at 1036 px (full size). Same model, prompts and greedy scorer as H1 V2.
- **How it ran:** Kaggle account 1, GPU T4 ×2, 1.7 h. [l0-step1-image-size-check.ipynb](Champion_Task/l0-step1-image-size-check.ipynb).
- **Expectation before the run:**
  - Gap closed: within 3 points of the paper on both tasks.
  - Partly closed: half of each gap recovered.
  - Otherwise: step 2.
- **Result:**
  - The control reproduced H1 V2 exactly.
  - Full size gave disaster type 71.1 → 75.6 and relational 23.3 → 31.1. That recovers 36% and 61% of the gaps: not closed.
- **What it led to:**
  - Full size became the 7B's test setting.
  - You chose step 2: a short extra round of training of our adapter at full size, judged on every optical question for both models.

### L0 step 2 (built 20 Oct; the old 7B's re-score done, the training's smoke test running)
- **The old 7B's re-score:** [l0-step2-full-size-rescore.ipynb](Champion_Task/l0-step2-full-size-rescore.ipynb), a copy of L0 step 1's notebook.
  - It covers the other four tasks at full size: 9,464 optical questions, about 11 h.
  - It runs in two parts: account 3 now, account 2 after R11s7.
  - It was dry-run on your PC: the question counts match H1 V2, nothing is asked twice when it continues, and the scoring was checked by hand.
  - The same notebook later scores the new 7B (`MODEL = "new"`).
- **The top-up training:** [l0-step2-topup-training.ipynb](Champion_Task/l0-step2-topup-training.ipynb), the original recipe on today's Kaggle libraries.
  - Data: DTR 1,627 + ORR 1,882, plus 3,509 replayed from the other tasks (7,018 examples), at full size.
  - Global batch 256, about 28 steps.
  - **A technical change from the plan:** the old adapter's saved layer pattern (`model.layers.N`, transformers 4.49) matches nothing in transformers 5 (`model.language_model.layers.N`). So a new rank-64 adapter is trained on the merged 7B, which starts from exactly the same model, and is merged into it at the end.
  - Two memory savings make full-size images fit a T4:
    - the output layer runs only over the answer;
    - the embeddings stay fp16.
  - Its logic was checked on your PC on the real manifest: the replay mix, the image sizing, and that the trimmed loss equals the full-sequence loss.
- **Expectation, fixed before the runs:**
  - Re-score: no decision hangs on it. The tasks move by a few points at most from 512 px; counting has the most to gain.
  - Training: DTR and ORR rise by about 1–4 points, and the other tasks stay within about a point.
  - Keep rule (19 Oct): DTR and ORR rise, and no other task drops by more than 1 point.
- **The re-score's result (20 Oct):**
  - **How it ran:** part A (BDC, BBR) on account 3, 8.6 h; part B (DRE, DSR) on account 2, 4.1 h. Run notebooks [l0-step2-full-size-rescore-old-partA.ipynb](Champion_Task/l0-step2-full-size-rescore-old-partA.ipynb) and [-old-partB.ipynb](Champion_Task/l0-step2-full-size-rescore-old-partB.ipynb); results in [L0-step2-results/old-partA/](Champion_Task/L0-step2-results/old-partA/L0S2/README.md) and [old-partB/](Champion_Task/L0-step2-results/old-partB/L0S2/README.md).
  - **The old 7B at full size, against 512 px:**
    - DTR 75.64 (71.10) and ORR 31.12 (23.31), both from L0 step 1;
    - BBR 20.94 (19.54), BDC 30.09 (32.01), DRE 32.39 (32.87), DSR 40.06 (37.87).
  - **Checked:**
    - every accuracy recounted from the per-question answers;
    - the 8 questions whose images can't be read are scored wrong, the same 8 as at 512 px.
  - **Against the expectation:** the four tasks moved by a few points at most, as expected (−1.9 to +2.2). Counting fell instead of gaining, so the 7B alone still misses the counting half of KR2.
  - **What it led to:** the full-size baseline for the keep rule is complete. Next is the training's smoke test.
- **The training's smoke test (20 Oct, account 3, about 45 min):**
  - 16 examples, including the longest (3,092 tokens), in 2 steps on both T4s.
  - Losses 0.844 → 0.461, within the expected 0.4–1.2.
  - Peak memory 14.7 GB of 15.8 GB.
  - **Against the expectation (7–14 h):** 10.0 s per example projects 19.5 h for the full 7,018 examples. Your choice: the equal replay in two sessions plus a short third, or half the replay (about 15 h).
- **The full training's first two attempts (20 Oct, account 3): both out of GPU memory, both fixed without changing the data or the batch.**
  1. **Committed about 13:12; crashed at the first step, after 11 min.**
     - The trainer collects all 128 micro-batches of a step before training on any, and the data loader puts each one on the GPU: 3–6 GB of waiting full-size images per GPU. The smoke test collected only 4.
     - **Fix:** a `StepOnCpu` trainer keeps the waiting batches on the CPU, with images in fp16, the dtype the model casts them to.
  2. **Version #7, committed about 17:50.**
     - Step 1 finished (40.8 min, loss 0.564).
     - Step 2's backward pass then ran out of memory, about 40 MiB short (it needed 926 MiB with 887 MiB free).
     - **Fix:** 8-bit paged AdamW (`paged_adamw_8bit`, QLoRA's optimizer). It frees about 1 GB per GPU and moves optimizer memory to the CPU when the GPU runs short. This is a small change from the original's 32-bit AdamW.
  - **If that still isn't enough, the next options, from smallest change to largest:**
    1. leave out the few longest examples (two images and the most text), after counting how many there are;
    2. use a slightly smaller image size for two-image examples only;
    3. halve the LoRA rank from 64 to 32, which frees about 0.6 GB more but changes the adapter.

    Each changes the recipe, so each is your decision, and its effect is measured before asking. A failure would most likely show within the first few steps, so a check costs about 1–2 GPU hours, not 10.
- **Session 1 of the full training (account 3, finished 21 Oct):**
  - 15 of 28 steps, about 42 min each (2,535 s on average), then a clean stop at the time limit.
  - No out-of-memory error: peak 14.2 GB on GPU 0 and 14.1 GB on GPU 1.
  - Checkpoints 4, 8, 12 and 15 pushed to `AbrarAlam/disasterm3-qwen25vl7b-qlora/l0s2/checkpoints`.
  - Loss 0.563 at step 1 and 0.557 at step 15 (range 0.522–0.577). It's nearly flat, because our 7B already knows these tasks. The keep rule's evaluation decides whether it helped.
  - Results in [L0-step2-results/train-session1/](Champion_Task/L0-step2-results/train-session1/L0S2-train/README.md).
  - **Left:** 13 steps, about 8.8 h of training, plus the merge.
- **Session 2 (account 3, 21 Oct, about 1 h): crashed at step 16, nothing saved.**
  - It restored checkpoint-15 and ran step 16's 128 micro-batches. Then the optimizer update failed on both GPUs: `Error invalid argument at line 580 in file /src/csrc/pythonInterface.cpp`, bitsandbytes' paged-memory prefetch.
  - **Cause:**
    - the paged optimizer flags its state tensors `is_paged`, and `torch.save` keeps the flag;
    - on resume, the trainer loads the state into ordinary GPU memory, and bitsandbytes' reload keeps the flag;
    - the step then prefetches that memory as paged, which CUDA rejects.
    - Checked on your PC with torch's save, load and deepcopy. Session 1 started fresh, so it never reloaded the state.
  - **Fix:** `adamw_bnb_8bit`, the same 8-bit AdamW without paging. The maths and the optimizer's memory are unchanged, and it loads checkpoint-15's state as is. Session 2 itself held that state in ordinary GPU memory through a full step without running out. `time_limit_h` is 5.0 for account 3's remaining 7.2 h.
  - **Expectation:** steps 16–23 in about 6 h, then session 3 does steps 24–28 and the merge.
- **Session 2 again (account 3, 21–22 Oct, about 6 h): steps 16–24 done.**
  - **Against the expectation:** one step further than planned (24, not 23), because each step took about 37 min (2,170–2,259 s) instead of session 1's 42.
  - **The fix held:** the 8-bit AdamW resumed checkpoint-15's state with no crash.
  - **Memory:** peak 14.4 GB on GPU 0 and 14.5 GB on GPU 1.
  - **Loss:** 0.520 at step 24, still in session 1's band (0.52–0.60). The learning rate is down to 1.6e-5 on the cosine schedule.
  - **Checkpoints:** 16, 20 and 24 are on Hugging Face (log lines, plus a sha256 check of the local copies before deleting them).
  - **A misleading number:** the summary's `train_loss` of 0.205 is this session's 9 losses divided by all 24 steps, a quirk of resumed runs; ignore it.
  - Results in [L0-step2-results/train-session2/](Champion_Task/L0-step2-results/train-session2/L0S2-train/README.md).
  - **Left:** 4 steps (about 2.5 h) plus the merge. Session 3a takes one step with account 3's last 1 h 26 min, and 3b finishes next week.
- **Session 3a (account 3, 22 Oct, about 1 h): step 25 done, exactly as planned.**
  - It resumed from checkpoint-24, trained one step (2,541 s), and the 0.3 h time limit stopped it.
  - **Loss:** 0.537; the learning rate is down to 1.1e-5.
  - **Memory:** peak 14.3 GB on each GPU.
  - **Checkpoint:** checkpoint-25 is on Hugging Face (log line and sha256 match).
  - **Its own `train_loss` (0.021)** is the same resume quirk: one step's loss divided by 25.
  - Results in [L0-step2-results/train-session3a/](Champion_Task/L0-step2-results/train-session3a/L0S2-train/README.md).
  - **Left:** steps 26–28 (about 2.1 h) and the merge, in session 3b with `time_limit_h` back to 5.0.
- **Session 3b (account 3, finished 26 Oct, about 2 h): training complete, but the merge failed** (the merge-only copy merged it on 27 Oct, below).
  - **Training:**
    - It resumed from checkpoint-25 and ran steps 26–28 (5,941 s, about 33 min a step).
    - Losses 0.491, 0.537 and 0.533. All 28 losses stay in 0.49–0.60, nearly flat, as in every session.
    - Peak memory 14.4 GB.
    - **Checkpoint-28 is on Hugging Face** (log: `✓ Pushed checkpoint-28 to AbrarAlam/disasterm3-qwen25vl7b-qlora/l0s2/checkpoints`).
    - `train_loss` 0.0557 is the resume quirk again: 3 losses divided by 28 steps.
  - **The merge (Cell 6) stopped after 5 s:**
    - The error: `ImportError: Found an incompatible version of torchao. Found version 0.10.0, but only versions above 0.16.0 are supported`.
    - **Cause:** Kaggle's image ships torchao 0.10.0, and the peft that Cell 1 upgrades (0.21.2) refuses torchao below 0.16 when it tries its torchao layer type. That only happens on an fp16 base. Training loaded the base in 4-bit, so bitsandbytes' layer type matched first and training never hit the check.
    - **Fix:** uninstall torchao before peft loads, since nothing uses it. Then merge only: restore checkpoint-28 from Hugging Face, merge on the CPU in fp16, and push `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`. No GPU and no retraining is needed.
    - **Built 26 Oct on your go:** [l0-step2-merge.ipynb](Champion_Task/l0-step2-merge.ipynb), the training notebook's Cells 1, 2 and 6.
      - It removes torchao, pins peft 0.21.2 (the training's version) and downloads only checkpoint-28's adapter.
      - It checks that exactly the 196 adapted projections changed, that none holds an inf or NaN, and that every uploaded file has its local size. The weight checks run before the push.
      - **Dry run on your PC:** a tiny Qwen2.5-VL with a random adapter and a stand-in Hugging Face. It merged correctly (base + 2·B·A to within 3e-5, nothing else changed). An adapter with one projection left at zero was stopped before anything was pushed.
    - **Run 1 (27 Oct, account 3, CPU, 35 s): stopped in Cell 2 on a check of mine.**
      - The check expected the adapter config to list 196 target modules, and it lists 88. Given more than 20 module names, peft saves the shortest name patterns that pick the same modules: q/k/v/o_proj plus each layer's three MLP names (4 + 28 × 3 = 88).
      - The adapter itself is right: one LoRA pair per module, and train.py asserted the 161,480,704 LoRA parameters.
      - The dry run missed it because its 2-layer model had 14 targets, under peft's threshold of 20.
      - Cell 1 worked (peft 0.21.2, no torchao, 34 GB of RAM). Nothing was merged or pushed.
      - Log in [L0-step2-results/merge/run1-stopped-at-cell2/](Champion_Task/L0-step2-results/merge/run1-stopped-at-cell2/l0-step2-merge.log).
    - **The fix (27 Oct):** Cell 2 counts the adapter's LoRA pairs (196) instead of the config's name patterns.
      - Dry-run again with a 4-layer model, where peft shortens 28 names to 16 patterns: 28 pairs counted, exactly the 28 projections merged, and the broken adapter still stopped before the push.
      - Run 2 goes in the same Kaggle notebook (re-imported) on account 3.
      - **Lesson for future dry runs:** match the real model's size wherever a library changes behaviour above a threshold.
    - **Run 2 (27 Oct, account 3, CPU session, 10 min): merged, checked and pushed.**
      - **Expectation, fixed before the run:** 196 tensors change, all of them language-model projections; about 16.6 GB pushed; 30–45 min.
      - **Result:**
        - Cell 2: checkpoint-28 restored (step 28 of 28, rank 64, alpha 16) with 196 LoRA pairs in 88 saved name patterns. Its last three losses (0.4905, 0.5365, 0.5335) match session 3b's log.
        - Cell 3: 196 of 729 weight tensors changed, exactly the adapted projections (none outside them, none unchanged), and none holds an inf or NaN. Merge 4.3 min.
        - Pushed `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` (public): 7 files, 16.6 GB, every file's size on the Hub matching the local copy. Upload 2.4 min.
      - **Against the expectation:** met in full, in 10 min instead of 30–45 (the transfers were faster than assumed).
      - The run notebook's code matches the build cell by cell, and it replaced the output-free copy. Results in [L0-step2-results/merge/](Champion_Task/L0-step2-results/merge/L0S2-merge/README.md).
  - **Files:**
    - The log is in [L0-step2-results/train-session3b/](Champion_Task/L0-step2-results/train-session3b/l0-step2-topup-training.log).
    - The run notebook replaced `l0-step2-topup-training.ipynb`, as with the earlier sessions.
    - The session's `L0S2-train/` outputs (README, loss curve, `train_summary.json`) weren't downloaded. The notebook's Cell 5 output holds the same numbers.
  - **The new 7B's six tasks (27 Oct) and the verdict (28 Oct): kept.**
    - **How:** the re-score notebook with `MODEL = "new"` in two parts, A (BDC, BBR; 7.8 h) and B (DRE, DSR, DTR, ORR; 5.9 h), on the 10,675 optical questions at full size with greedy decoding. Each run notebook differs from the output-free one only in `MODEL` and `RUN_TASKS`. The old 7B's answers come from its own two parts (20 Oct) and, for DTR and ORR, from L0 step 1, which used the same settings (greedy, batch 8, 32 new tokens, transformers 5.16.1). The merge's README had said parts A, B and C; two parts covered all six tasks.
    - **Expectation, fixed before the run:** DTR and ORR rise by about 1–4 points; the other four stay within about a point.
    - **Result,** against the old 7B at full size:

      | Task | Old | New | Change | Change, clean |
      |---|---|---|---|---|
      | DTR | 75.64 | 76.77 | +1.13 | +1.17 |
      | ORR | 31.12 | 34.62 | +3.50 | +3.52 |
      | BBR | 20.94 | 19.99 | −0.95 | −0.91 |
      | BDC | 30.09 | 30.31 | +0.22 | +0.20 |
      | DRE | 32.39 | 33.03 | +0.64 | +0.71 |
      | DSR | 40.06 | 40.46 | +0.40 | +0.41 |
      | Mean of six | 38.37 | 39.20 | +0.83 | +0.85 |

    - **The verdict, by the rule fixed 19 Oct:** DTR and ORR rise and no other task drops by more than 1 point, so **the new 7B is kept**, on all questions, on E5's clean set (186 questions with a copied after-image dropped) and on the strict set (all 386 flagged optical questions dropped).
    - **How sure, paired over the same questions:** ORR's gain is clear (33 gained, 3 lost, McNemar p < 0.001; 95% bootstrap interval +2.2 to +4.9). DTR's is 4 questions net (5 gained, 1 lost, p = 0.22; 0.0 to +2.6), within noise. BBR's drop is real (24 gained, 43 lost, p = 0.03; −1.7 to −0.2) and sits just inside the limit.
    - **Why this way, and the alternatives:** the point-based rule was fixed before the run, so it decides. The paired tests and intervals only show how much of each change could be noise. A significance-based rule would call DTR's rise unproven; the mean of the six (+0.83) is the simplest single summary. Both are reported here, neither changes the verdict.
    - **Counting (BDC) is 30.31%,** still under the base model's 34.2%: the 7B alone still misses the counting half of KR2.
    - **Checks:** every published accuracy reproduces from the per-question answers for both models, and the old 7B's clean and strict numbers match E5's table; both models answer the same 10,675 questions; the 8 questions with unreadable images count as wrong for both.
    - **What it leads to:** `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` is our 7B and L2's teacher. L2 step 1 runs again with it, on your go.
    - Results in [L0-step2-results/new-partA/](Champion_Task/L0-step2-results/new-partA/L0S2/README.md) and [new-partB/](Champion_Task/L0-step2-results/new-partB/L0S2/README.md). The verdict was computed on your PC with a short read-only script; its numbers are all in this entry.
- **Weight-space edit, step 1: does the 7B have a removable obstacle? (7 Nov, read-only, on your PC)**
  - **What and why:** the MIT report "Sparks of Weight-Space Programming" raised a small text model's maths score by removing a thinking loop from its weights, and reports little gain on a model without loops. So an edit is only worth trying if the 7B has an obstacle of that kind. Input: the new 7B's saved answers to the 10,675 optical benchmark questions, and the options in `train_release.json` and Aryan's `augmented_bdc_benchmark_v4.json`.
  - **Expectation, stated before the check:** if there is no clear pattern, stop. No numeric expectation was fixed.
  - **Loops: none.** No answer contains words or repeats; the longest is 22 characters. Only 8 answers are empty, the same count as the unreadable images.
  - **Skew: strong on road damage, mild on building counting.**

    | Task | Accuracy | Commonest answer | Share of answers | How often that letter is right |
    |---|---|---|---|---|
    | Road damage | 33.03% | B | 73.1% | 19.9% |
    | Building counting | 30.31% | D | 31.7% | 20.3% |
    | Relational reasoning | 34.62% | B | 28.6% | 20.2% |
    | Disaster type | 76.77% | C | 22.1% | 23.5% |

    Disaster type is balanced, so this is not a general habit of favouring a letter. Options in the counting tasks are often close to size order, so a favoured letter may be a favoured size; the two can't be separated without the test questions' options for road damage.
  - **Found on the way: the correct count can often be read from the options alone.** Checked on `benchmark_release.json` and `train_release.json`, optical questions only.
    - **How the options are built:** on all 1,581 test questions whose largest option is above 20, the options are 0.6, 0.8, 1, 1.2 and 1.4 times the correct count (within rounding), so the correct answer is the middle value. Training shows the same on all 3,316 such questions.
    - **The rule, fixed on the 10,667 optical training questions only:** if the largest option is above 20, pick the middle value; otherwise pick the second smallest. No image is used. It scores 59.48% on those training questions.
    - **On all 3,583 test questions** (ids and correct letters match our L0 file on every question; the Kaggle run [benchmark-option-rule-check.ipynb](Champion_Task/benchmark-option-rule-check.ipynb), on the benchmark mirror, gives the same counts as the check on your PC):

      | Question type | Questions | Always middle | Rule | New 7B |
      |---|---|---|---|---|
      | Intact | 1,880 | 73.9% | 77.8% | 32.9% |
      | Damaged | 974 | 31.2% | 54.8% | 27.0% |
      | Destroyed | 729 | 32.8% | 55.4% | 28.1% |
      | **All** | **3,583** | **53.95%** | **66.98%** | **30.31%** |

      By largest option: above 20 (1,581 questions), rule 100%, 7B 28.2%; 20 or below (2,002), rule 40.9%, 7B 32.0%. Road damage shows the same construction: always-middle scores 44.11% against the 7B's 33.03%, and all 308 questions with a largest option above 20 have the middle value correct.
    - **Why this score was recorded:** accuracy on these options is what the review's target uses, so the comparison must sit beside it. The no-image rule measures how much of that accuracy can come from option construction alone.
    - **What it means:** beating 34.2% doesn't show that a model can count. That covers R11's 32.96% and the base model's own 34.2%. Our 7B doesn't use the pattern, so its 30.31% isn't inflated by it. I haven't checked whether the DisasterM3 paper mentions this.
    - **Options for scoring counts:**
      1. Keep accuracy, with the no-image rule reported beside it. Recommended, because the review promised this measure.
      2. Add count error against the true masks (mean absolute error, and share within a tolerance). Recommended as the main measure of counting; E7 can do it once E6's masks exist.
      3. Report only questions with a largest option of 20 or below. Partial: the rule still beats the 7B there (40.9% against 32.0%), so these options leak too.
      4. Rebuild the options so they don't reveal the answer. Fair, but it's no longer the benchmark the published scores use, so no direct comparison with 34.2% would be possible.
      5. Use the rule to raise a score. Rejected: it uses no image.
    - **Risk for training, corrected 7 Nov:** an earlier version of this note said a model trained on these options could learn the pattern. Our training can't: the prompts in `train_qwen_disasterm3_3b_distill.ipynb` and the 7B's training show only the question, without the options, and the target is a sentence stating the count (for example, "The total number of undamaged buildings after the disaster is 231."). It would only matter for L2's option (c), which shows the teacher the options, so the 3B's targets could carry the pattern. Any model is still scored on these options, so report count error for the 3B as well.
  - **Against the expectation:** a pattern exists, so the check doesn't stop the idea, but counting can't judge an edit: an edit that nudged the model towards middle values could raise the score without improving its vision.
  - **What it leads to:** steps 2 and 3 are on hold. They need your go on a paid OpenAI key. The cleaner target is the grading habit in Tamanna's Part B (Intact for 298 of 300 buildings), scored on those 300 true buildings against the grader's 212 correct. Why not the alternatives: road damage's skew has the same option problem; a rule that shifts answer letters after the model runs is cheaper than an edit but adds no vision; and L0b (training the vision encoder) stays the planned test of whether the 7B can learn to see damage.

### L2 step 1 · Teacher answers for the 3B
- **What:** the 7B answers 4,000 training questions, and only answers checked correct against their labels are kept.
- **Why it was planned:** O4's distilled 3B learns from the 7B's answers.
- **How:** a copy of the original teacher notebook, changed in three ways:
  - Kaggle's own torch, because the old pins no longer install;
  - fp16 on two T4s in batches of 8;
  - strict per-task answer checks.
- **How it ran:** Kaggle account 1, GPU T4 ×2, about 2 h. [l2-step1-teacher-rationales.ipynb](Champion_Task/l2-step1-teacher-rationales.ipynb) (named `l2-stage1-teacher-rationales` until 20 Oct, here and on Kaggle); results in `L2-step1-results/`.
- **Expectation before the run:** answers that fail the check fall back to their labels, so the 3B never learns the teacher's mistakes.
- **Result:**
  - 1,085 of 4,000 (27%) were kept: disaster type 89.4%, land use 50.9%, bearing bodies 42.7%, building counting 15.6%, relational 13.3%, road counting 0%.
  - The push to the Kaggle dataset failed silently.
- **What it led to:** step 2 waits for L0; if L0 changes the 7B, this step reruns with the new teacher. Explanations became L2b.
- **Again with the new teacher (built 28 Oct, on your go "build L2 step 1"):** [l2-step1-new-teacher.ipynb](Champion_Task/l2-step1-new-teacher.ipynb), a named copy; the first notebook stays as it ran.
  - **Why:** L0 kept the new 7B on 28 Oct, so it is the 3B's teacher.
  - **What changed, and why:**
    - the new 7B, at full size, as L0 trained and measured it;
    - greedy decoding with every sampling setting explicit, since the answers are one sentence and sampling only adds noise;
    - the plain training prompt, without the "think step by step" instruction the 7B ignored, so the teacher answers the prompt the 3B will see;
    - the first run's 4,000 entries minus road counting (3,265): none of the 735 first-run road answers could match an exact-percentage label;
    - no Kaggle push (step 2 reads the notebook output), and progress rows that carry the teacher's ID, so a resume never mixes teachers.

    The answer check is unchanged.
  - **Dry run on your PC (28 Oct):** with the first run's output manifest as stand-in data, the first run's subset was reproduced exactly; the unchanged check re-kept the first run's 1,085 answers; resume and the output files worked. The first run's longest answer (177 characters) fits the new 96-token limit.
  - **Expectation, fixed before the run:** more kept answers for disaster type (89.4%) and relational reasoning (13.3%), partly from memory, since L0's top-up trained on these entries again; building counting, bearing bodies and land use within about 3 points of 15.6%, 42.7% and 50.9%; at least 1,085 kept in all; about 5.5 h on account 1.
  - **Result (checked 4 Nov):** 3,265 of 3,265 answered; 1,146 kept. By task: disaster type 91.2%, land use 54.2%, bearing bodies 45.2%, building counting 16.3%, relational 15.6%. Expectation met. [Results](Champion_Task/L2-step1-results/new-teacher/L2S1-new-teacher/README.md).

### L2 step 2 · Two 3Bs and the rule (decided and built 8 Nov)
- **What:** two distilled 3Bs, trained alike except for what they learn from, and one rule, fixed before any run, to keep the better. Both: `Qwen/Qwen2.5-VL-3B-Instruct` in 4-bit with a new LoRA adapter (rank 64, alpha 16) on the language model, the 7B's recipe (lr 2e-4, cosine, global batch 256, one epoch), images at most 768 × 28 × 28 pixels, and 53,032 training entries.
  - **(b) soft labels:** the new 7B reads each of the 38,271 checkable training questions with its correct answer, and its 20 most likely tokens at every answer token are saved. The 3B's loss is 0.5 × the label loss + 0.5 × the match to that spread.
  - **(c) the options rerun:** the 7B answers L2 step 1's counting and relational questions again with the benchmark's options shown, and the correct letters are added to L2 step 1's data.
- **Why both:** your decision of 8 Nov (§2). (b) is the cleaner distillation O4 promises. (c) gives counting more checked teacher answers, but shows the options whose middle value is always right when the largest is above 20.
- **The rule:**
  - All questions on 501 held-out after-photos (1,962 checkable) are left out of both trainings and both teacher passes.
  - The winner is the more accurate on them, counting only where the largest option is 20 or less (exact McNemar, p < 0.05); then the lower median count error on held-out building counting; then (b).
  - Only the winner is scored on the benchmark's 10,675 optical questions.
- **How:** five Kaggle notebooks, `l2-step1b-soft-labels`, `l2-step1c-options-rerun`, `l2-step2-train-3b`, `l2-step3-heldout-select` and `l2-step4-winner-benchmark`, on accounts 3, 1 and 2. Account 4 isn't used: (b)'s training needs your write token, and account 4 is Tamanna's.
- **Checked on your PC (dry runs):** each notebook's own cells ran on a tiny random Qwen2.5-VL with the real `train_release.json` and `benchmark_release.json`.
  - The counts matched: 55,764 usable entries, 53,032 for training, 1,962 held-out questions, 10,675 benchmark questions.
  - Stopping and resuming worked in the soft labels, the training and the benchmark run.
  - Every soft label lined up with the 3B's target token.
  - All five branches of the rule picked the expected winner on made-up answers.
  - Missing and unreadable pictures were scored wrong, as in L0 step 2.
  - Runs 4 and 5 remove torchao first: the clash that stopped L0's merge.
- **Found while checking:** the held-out training questions share the benchmark's flaw. When the largest option is above 20 (293 of 1,045 counting questions), the middle option is right every time.
- **Expectations, fixed before the runs:**
  - Soft labels: the 7B's top token equals the label's on most answer tokens, lowest on counting numbers.
  - Options rerun: about 700–900 kept.
  - Training: the loss starts near 0.5–1.2 and falls.
  - The rule: no number predicted.
  - The winner on the benchmark: below the new 7B on most tasks.
- **Not tested yet:** the real models' time and memory on Kaggle (the smoke tests measure them).

## 8. Housekeeping

- **Step 1 again, with the new 7B as teacher (results checked 4 Nov):** 3,265 of 3,265 entries answered, all by `l0s2-mergedFP`, at full size, greedy, with the plain training prompt. 1,146 answers match their label and are kept (first run, old 7B: 1,085).
  - **Against the expectation:** met. At least 1,085 were kept; disaster type rose to 91.2% and relational to 15.6%. Building counting (16.3%) and bearing bodies (45.2%) stayed within about 3 points; land use (54.2%) rose by 3.3.
  - The first run changed four things at once (teacher, image size, decoding, prompt), so the comparison is a reference, not a controlled test.
  - The answers are one sentence each (median 14 words), as L2's smoke test found, so this is answer-level distillation; explanations come from L2b.
  - Results in [L2-step1-results/new-teacher/](Champion_Task/L2-step1-results/new-teacher/L2S1-new-teacher/README.md).

### Commit and push of the Phase A-onward work
- **What:** `Essential_task_delegation/`, `others/`, `.gitignore`, `README.md` and `UPDATE.md` committed and pushed for the team.
- **Why:** so collaborators can pull the current work and continue it.
- **How:** the `.gitignore` keeps out:
  - bulk masks that no notebook reads;
  - the 71 MB L2 training file;
  - personal samples and the next report's draft;
  - the local settings.

  You ran the commands.
- **Result:** pushed as `1b33574`.

## 9. Teammates' work: what we use (reviewed 26 Oct; follow-ups checked 28 Oct)

Every push since 22 Oct was read file by file, and each number was checked against its notebook's outputs or its data. Only what holds up is used.

### Ridita · Offline guideline search (`Offline_RAG_KR2/`, pushed 25 Oct)
- **What:** a local guideline search with citations for DisasTeller's report writers, plus an `r1` mode for the old building counter.
- **What we use:**
  - The search, for T2 step 4. It has 405 sections from six sources (EMS-98 167, INSARAG Vol II 90, Sphere 61, INSARAG Vol III 47, xBD 34, IWG-SEM 6), each with a citation ID such as `[EMS98-masonry-grade-5]`.
  - It ranks sections by meaning (MiniLM embeddings) and by keywords (BM25), merged by reciprocal rank fusion. It runs offline on CPU: Chroma on a laptop, the saved vectors with numpy and torch on Kaggle.
  - DisasTeller already imports a tool with the same name, so swapping it in is a file copy.
  - Checked: 405 sections, 405 vectors and 405 database rows, with no duplicate IDs.
- **Not yet shown:**
  - that it ran on Kaggle (the check notebook was pushed without outputs);
  - that real report questions bring back the right sections (its 16 test questions only check that Kaggle and the laptop agree).
- **Not used:** the counter's `r1` mode. H2's table already holds R11's buildings one by one, while the counter counts blobs, so touching buildings merge into one.
- **Open:** Sphere's text is in the public repo three times: the PDF, the chunks file and the database. Your decision.
- **Next:** wire it into a copy of DisasTeller, offline by default, and test it on 30 report questions with their expected sections, with the pass rule fixed first (an expected section in the top 3 for at least 24 of 30).
- **28 Oct, the follow-up (pushed 27 Oct), checked:**
  - **Retrieval test passed, 27 of 30** (bar 24; meaning alone 20, keywords alone 25). Her README says the questions and expected sections were fixed before any search ran; the files can't prove the order. Recounted on your PC from `questions.csv` and the returned sections: 27, 20 and 25 again. The Kaggle path gives the same top 3 on all 30. The hybrid beats meaning alone (8 questions won, 1 lost, p = 0.04) but can't be told apart from keywords alone (3 won, 1 lost).
  - **The Kaggle run with the internet off is real:** Kaggle's own metadata says internet off and no GPU, the committed run finished without errors in 69 s, and the search matched the laptop on 16 of 16.
  - **The DisasTeller copy is offline by default:** offline, the web tools aren't imported or given to any agent, CrewAI's telemetry is off, and tasks 3–6 point at the guideline search. Checked line by line against the original.
  - **Still Gemini:** the four agents' LLM and the three image tools (T2 steps 1–3), so it can't run without a key and the internet yet. Her README says so.
  - **Open:** `local_chroma_db/` (8 MB, rebuilt from the chunks) is tracked and changes on every search, so it belongs in `.gitignore`. Five more guideline PDFs (EMS-98 twice, xBD, IWG-SEM, INSARAG Vol II and III) are now in the public repo. *(Licences checked 28 Oct: none of the six documents allows posting it online. Sphere's copyright page requires written permission for it, EMS-98 grants no reuse, the xBD paper is under arXiv's own licence, and INSARAG and IWG-SEM carry no licence. The options are in the tracker.)* Her miss on Q1 (masonry grade 4 found as grade 3) matters for task1, which grades buildings with this search.
  - **Next:** T2 steps 1–3, the local LLM and the local image tools.
- **4 Nov, T2 steps 1–3 built (pushed 3–4 Nov), read:** the four agents and the three image tools now ask our new 7B (`l0s2-mergedFP`) through a local vLLM server (`local_model.py`; any address other than `localhost` stops the program). No Gemini key or 2-a-minute limit remains.
  - **Proof tools:** `run_with_netlog.py` logs every connection and name lookup during a run; `check_run.py` checks five pass rules fixed on 3 Nov before any run (finished without error; six reports marked offline, 50+ words each; nothing outside `localhost`; no Gemini library loaded; every model call answered). The proof run must also have Kaggle's internet off.
  - **So far:** a laptop run against a pretend model server passed all five rules, after it caught CrewAI asking `pypi.org` for updates (now off). Kaggle practice run 1 (internet on, 3 Nov) installed vLLM 0.25.1 and CrewAI 1.15.2 from wheels and served the 7B on two T4s, then stopped on a file-path error in the uploaded dataset; fixed with a manifest and sha256 check, not yet rerun. Its outputs weren't kept.
  - **Choices worth knowing:** tool calls in CrewAI's text format with the stop word sent to the server; one picture per question; a 16,384-token context, since task 6 reads tasks 1–5.
  - **Practice run 2 (account 3, run by Abrar, 7–8 Nov, internet on): failed.** [Results](Offline_RAG_KR2/results/t2_practice_2_abrar/t2_run/run/t2_run_summary.json).
    - **What worked:** both prep notebooks; the install from wheels; vLLM serving the new 7B on two T4s; the three short tests (text, picture, a CrewAI call); the guideline search; the labelled map; 18 network events, all on `127.0.0.1`. Pass rules 3, 4 and 5 hold.
    - **What failed:** rules 1 and 2. After 11 minutes the crew stopped with `LLMContextLengthExceededError` (16,385 tokens against 16,384), and no report was written.
    - **Cause (corrected 8 Nov):** the Expert team's agent looped. It called the same tools with the same input again and again (CrewAI answered "I tried reusing the same input" 33 times) and tried to hand its work to other teams, until one message passed the 16,384-token limit and vLLM refused it. The 7B's tool calls were well formed. A first reading said the 7B copied CrewAI's template; that was wrong, because the quoted lines were CrewAI's own instructions, printed in the log.
    - **Photos:** they do reach the model (Picture 1: the Wajima hall; Picture 3: a collapsed bridge). For Pictures 2, 4, 5 and 6, the 7B repeated the description the agent had written into its question.
    - **Ridita's run 2 (3 Nov) and fixes (5–7 Nov, pushed 8 Nov):** her run, on the code before the file-placement fix, failed the same way (11.4 min; [results](Offline_RAG_KR2/results/t2_practice_2/)). Her fixes, one per finding: a 32,768-token limit, with older tool results and then the longest message shortened before each call; at most 10 steps per team; delegation off; photo questions without the agent's text; map labels found anywhere in the answer; clearer tool descriptions; every model call logged with vLLM's token counts. Her laptop tests with a pretend server that loops like run 2 ended with all six reports. Not tested with the real 7B.
    - **What it leads to:** practice run 3 with her fixed code. The fixed flow (System_Design_Notes §1) stays the fallback if that run fails, or if its reports don't rest on the tools' results. O3 names our VLM, so another model as the agent isn't an option.
  - **Practice run 3 (account 3, run by Abrar, 8 Nov, internet on, commit `0024ae8af`): failed rule 2.** [Results](Offline_RAG_KR2/results/t2_practice_3_abrar/t2_run/run/t2_run_summary.json).
    - **Expectation (Ridita's, written before the run):** rules 1–5 pass; if 6 or more teams reach the step limit, the fixed flow is decided before the proof run.
    - **What happened:** the run finished in 3.9 minutes with 12 agent calls, 7 picture calls and 3 guideline searches; no team reached its step limit; the six photo descriptions all differ; 5 labels were drawn on the map; no message needed shortening; every call was answered; nothing went outside the machine. Rules 1, 3, 4 and 5 passed.
    - **Rule 2 failed:** the reports have 12, 82, 17, 14, 69 and 228 words, so three are under 50. Three are one sentence about the report instead of the report ("The final report is generated based on the provided data and tools."). The emergency team called `global_img_interpreter` without its required `text` input, got a validation error and gave up. No report cites a guideline section. Two invent "Region A, B and C" with damage grades 2, 4 and 6, on a scale that stops at 5.
    - **Against the expectation:** the step-limit sign didn't trigger (0 of 6), but the reports fail anyway. The failure moved from the loop to the writing: our 7B answers in one sentence, as it was trained to, and uses no facts from the tools.
    - **What it led to (8 Nov):** (a) the fixed flow, recommended, or (b) CrewAI with changed instructions and run 4. Ridita ran (b) first, then chose (a) by her own rule (below).
  - **Her runs 3–5 and the proof run (pushed 9–11 Nov), checked 11 Nov** against her README and her two run notebooks:
    - **Run 3 (8 Nov, hers):** failed like Abrar's run 3 (reports too short). Her fixes (9 Nov): tools accept an empty input; a Final Answer under 150 words is asked again, at most twice. Her expectation for run 4: if a report stays short after asking again, the fixed flow is decided before the proof run.
    - **Run 4 (10 Nov): failed rule 2,** with every report 28–49 words. The 7B repeated the same tool call until the step limit (4 teams), and CrewAI 1.15.2 saved that call as the report. The grades in runs 3 and 4 came from an example in the map tool's description (her 5 Nov change; now removed). `final_answers_kept_short` was 1, so by her rule the fixed flow was decided on 10 Nov.
    - **The fixed flow (`disasteller_offline/fixed_flow.py`):** code calls the photo tool, five EMS-98 searches, the map tool and the other teams' searches (18 in all) in a fixed order. The 7B writes the grade lines and 27 sections, with each team's role from the main script. There are no example names or grades in the prompts. The pass rules are unchanged; `check_run.py` adds the model's own word counts and the grades found.
    - **Run 5 (10 Nov, internet on): passed rules 1–5.** 28 sections; 5 of 6 grades, since the bridge photo's description has no place name. Reports of 192–787 words of the model's own (July's Gemini reports: 379–912). The Expert report cites 11 real sections.
    - **The proof run (11 Nov, internet off): passed rules 1–5.** It printed "PASSED: the offline proof (internet off)". Its reports are word for word run 5's. 4 network events, all to `127.0.0.1`; commit `258a4f381`; DisasTeller took 6.1 minutes. Checked on the PC: Kaggle's metadata says internet off (run 5: on), and both notebooks print the same commit and the same 28 section word counts.
    - **Not solved (her list):**
      - the map reading says "no dangerous zones", and three reports repeat it;
      - a made-up hotline, "123456789";
      - only the Expert report cites in brackets;
      - photo 5 is called a "hurricane";
      - three of the five map labels are off their streets;
      - the staff and team numbers are the model's own.
    - **What it leads to:** T2's choice is settled (the fixed flow), and O3 has its offline proof. Next: the comparison with the July Gemini reports, quality fixes as a new run, then steps 5 and 7 with the chosen chain's table.
  - **Done as asked:** `local_chroma_db/` is git-ignored and removed from the repo.
  - **17 Nov, the comparison with July's Gemini reports (16 Nov) and a quality-fix run (pushed 17 Nov), read from her README:**
    - **How:** nine measures and an expectation, written before anything was counted. Measures 1–5 are counted by `report_comparison/compare_reports.py`; 6–9 were read by hand (one reader, who knew which set was which).
    - **Result:** ours cite 11 real sections and make up 5 plan numbers (July: 0 and 33). But ours say "no danger" 4 times (July 0) and contradict themselves 6 times (July 2). Useful, yes / partly / no: July 3 / 3 / 0, ours 0 / 5 / 1. Two of our 7B's six photo descriptions contradict their photos, and one wrong map reading caused all 4 "no danger" sentences and 3 of the 6 contradictions.
    - **Leads to:** a quality-fix run, built and tested on her laptop with a pretend model. The map reading is now written by code from the grades; one more question reads each photo's sign; sections are checked for invented contact details and for their citations. It doesn't fix the photo descriptions. Not yet run on Kaggle.
    - **Not on the website yet:** the comparison's further errors aren't marked on the Reports page.

### Ridita · The DisasterM3–BRIGHT audit (corrected 22 Oct, pushed 25 Oct)
- **What we use:**
  - **The leak:** 40 of the 645 validation pairs are near-copies of training pairs. Followed up as E5.
  - **BRIGHT can't add destroyed examples:**
    - BRIGHT released no colour after-photos (all 4,246 are radar), so it adds only before-photos, where every building is intact.
    - The five usable events (La Palma, Goma, Les Cayes, Marshall, Noto; 1,285 tiles) don't leak.
    - But 1,056 of those tiles are volcano scenes, and validation has only 8 volcano pairs. R13 should expect little change in Destroyed IoU.
  - **Never train on BRIGHT's Turkey, Morocco or Libya tiles:** they are the before-photos of 66 validation pairs.
  - **Before- and after-photos don't line up:**
    - 52% of the 2,966 measurable pairs are shifted by more than 2 px, 10% by more than 5 px, the worst by 56 px.
    - The audit says this doesn't hurt the champion because it reads only the after-photo. That holds for R1, not R11: R11 stacks both photos, and R16c uses R11's pieces.
    - Aligning the pairs first is a candidate R11 variant.
  - **File names hide radar:** 73% of DisasterM3's radar after-files have no "sar" in the name. Our notebooks filter by the `image_type` tag and are unaffected; any filter by file name isn't.
  - **Resolution:** DisasterM3's copies of BRIGHT tiles are 0.30 m per pixel, not the 0.8 m its paper says, and BRIGHT's own table is wrong for 6 of its 14 events.
- **Not yet available:** the scripts and files behind the numbers, `val_train_leaks.csv` among them. The prompt in [Ridita_Task/E5_leak_audit_prompt.md](Ridita_Task/E5_leak_audit_prompt.md) asks for them.

### Aryan · Counts in the prompt (`Aryan_Task/BDC_PIPELINE_REPORT_v3.md`, pushed 25 Oct)
- **What:** the fine-tuned 7B in 4-bit, asked 1,703 optical counting questions from the benchmark about damaged or destroyed buildings (multiple choice, chance 20%), with and without a count in the prompt.
- **How it was scored:**
  - Strict: only a single letter A–E counts, and anything else is wrong.
  - Wilson 95% intervals. The base 7B was asked an evenly spread sample of 500.
  - The notebook's outputs match the report.
- **What we use:**
  - **The counting gap is seeing, not reasoning.**
    - With the right count from the ground-truth mask, the fine-tuned 7B scores 96.5% (92.7% without the image). With the image alone it scores 15.7%, with the question alone 21.1%.
    - On the 500, the base 7B scores 89.4% with counts and 34.4% without; the fine-tuned 7B scores 97.2% and 18.2%.
    - So the fine-tuned 7B reads a count it's given better than the base model does. This backs feeding counts as text (H1 V2, H2).
  - **Each question needs its own mask:** damaged questions the damaged mask, destroyed questions the destroyed mask. Counting connected components in the right mask then gives the benchmark's answer 93.9% of the time.
  - **Answer format:**
    - 189 of the 1,703 image-only answers (11%) were sentences with a number ("…is 37") instead of a letter.
    - Our own scorer, the 499A scorer used by H1 V2 and L0, also counts those as wrong.
    - A CPU check of our 7B's counting answers would show how much of its gap is format rather than counting.
- **Not usable for O2:** the run with a real segmenter used B1 (24.0%), not R11. The next run takes R11's counts from H2's table.
- **Not checked yet:** whether benchmark images are copies of training images. E5's hash check covers it.
- **28 Oct, v4 (pushed 27 Oct), checked:** R11's counts in the prompt (`r11_image`, from H2's table) on 1,701 questions, the base 7B on 500.
  - **Reported:** the fine-tuned 7B with R11's counts scores 27.0% [25.0, 29.2], against 15.6% with the image alone; O2's bar (34.2%) isn't reached.
  - **What the check found:**
    - **R11's table alone beats every VLM condition.** The option nearest R11's own count (from his file's `r11_count`) is right on 37.0% of the same 1,701 questions (35.4% if ties count as wrong), and on 39.4% of the 500. Passing that count through the fine-tuned 7B loses 10 points: 290 questions only the table gets right, 121 only the VLM (p < 10⁻¹⁶). The 7B picks the option nearest the count it was given only 56% of the time. On the 500, the base 7B alone (35.2%) also beats the base 7B with R11's counts (30.2%). So counts should go from the table to the answer, as H2's fixed queries and the system design already do.
    - **The U-Net row in v4 is a copy:** `bdc_ft_unet-B1cls_image.csv` is byte-identical to `bdc_ft_image_only.csv`, so v4's U-Net numbers (15.56%) are the image-only ones. The real U-Net result is v2's 23.96%.
    - **Criterion 2, as written before the run, fails:** R11's 27.04% [25.0, 29.2] and the U-Net's 23.96% [22.0, 26.0] have overlapping Wilson intervals. After the run the report judged a comparison on the 500 instead, without intervals (they overlap there too). A paired test, the better test, does show R11 ahead (230 questions against 177, p = 0.01).
    - **Not O2's measure:** 34.2% is on all 3,583 optical counting questions, intact ones included; this subset leaves intact out. Comparing its 27.0% with H2's 32.96% (all optical) mixes question sets too.
    - **The duplicate check is done (E5):** 36 of the 1,703 questions use a copied after-image. Without them every number moves by 0.4 points or less.
    - **Smaller points:** the TEOChat blockquote's second sentence ("Injecting U-Net findings … closes this gap") isn't in the paper as far as our notes go; the 23.58% fine-tuned baseline in §2 doesn't match our measurements (30.09% at full size, 32.01% at 512 px, optical); everything ran in 4-bit, which cost our 7B 4.6 points in H2b; the empty `result` file can go.
  - **What we use:** the evidence that counts must not pass through the VLM ([System_Design_Notes §2.2](System_Design_Notes.md)), and the oracle ceiling (96.5%) as before.
- **4 Nov, `BDC-v3-results/` and `BDC-v4-results/` (pushed 3–4 Nov), checked:** the same runs, filed with a README each. Every CSV matches a file already in `BDC_Results/` or `BDC_Results_v4/` by content, except v3's base image-only run on 844 questions (32.94%), which is new.
  - **None of the three corrections is applied:** v4's U-Net file is still byte-identical to the image-only file; criterion 2 is still judged on the 500 after the run ("beats U-Net on MB") instead of as written; and the README still calls 32.96% the table's "upper bound" (it is H2's score on all optical questions, intact included), so "the prompt keeps 82–91% of it" compares different question sets. On his own 1,701 questions the table alone scores 37.0%.
  - **New, rechecked on your PC:** on the 66 questions his set shares with H2's graded sample, H2's SQL agent is right on 26 (39.4%), the fine-tuned 7B with R11's counts on 20 (30.3%) and the image alone on 10. Same direction as the 37.0% against 27.0%; 66 questions is too few to separate H2 from the prompt on its own.
  - Feedback drafted 4 Nov (in the tracker).
- **15 Nov, his website (pushed 12 Nov) and his section of update 4, checked; review and fix list pushed** ([Aryan_Task/Review_and_Fix_List.md](Aryan_Task/Review_and_Fix_List.md), commit `6ec05307e`).
  - **The website** was generated in Google AI Studio. It shows invented damage assessments (building names, floors, "pancake collapse", void likelihood, sensor advice) at real coordinates in Pazarcık, Türkiye, over real satellite tiles. It labels hand-written Turkey reports as `fixed_flow.py` output from a Kaggle offline session. Its console fills missing areas with made-up defaults. It mixes scores (0.3161 with R11's 0.588; a validation-split 39.2% as the counting headline). It loads Google Fonts and ArcGIS tiles, carries AI Studio and Gemini leftovers, copies our internal docs (the Task Ledger included) into its public folder, and gets team names wrong.
  - **His update 4 section** claims a building table with polygons, floors, EMS-98 grades 1–5, trapped-person estimates and ingress vectors. Our H2 table has none of these.
  - **Still open:** the three corrections to the counting study (v4's README unchanged since 27 Oct); the bridge `disasteller_inputs.py` still returns zeros with status "ok" for an image not in the table, and nothing calls it; a junk `Untitled-1.ipynb` at the repository root.
  - **Asked for by Wed 18 Nov,** with acceptance checks and a ready-to-paste instruction for his AI assistant.
- **15–16 Nov, the bridge rechecked while building T3:** four more faults, added to his review as §7.2–7.5. Safe areas are read with keys T1 v3's file doesn't have, so each prints at (0, 0), 0 px from damage; neither status is checked; missing fields get defaults; and model estimates are titled "GROUND TRUTH", with R11 and T1 v3 hard-coded as the sources.
- **16 Nov, the website handed over:** he builds T3's remaining pages from [his handover](Aryan_Task/T3_Website_Handover.md), which lists every change from his prototype and why (§3), what came back on real data (§3.6), the rules, the checks before each push, and the next tasks in order. His own `Website/` stays his record, under his review.
- **17 Nov, his review's fixes pushed** (commit `648b35c92`, with a change list, [Aryan_Task/CHANGES.md](Aryan_Task/CHANGES.md)). Not yet checked against the review's section 8. Read so far, the bridge only:
  - **fixed:** 7.1 (an image not in the table returns `image_not_in_table`) and 7.3 (both statuses checked); the hard-coded model names are gone;
  - **still open:** 7.2 (safe areas read as `point_xy` and `dist_to_damage_px`, so each still prints at (0, 0), 0 px away), 7.4 (made-up defaults for missing fields) and 7.5 (the "GROUND TRUTH" title).
  - Seen in the change list, to check: its sources for several site numbers look wrong. For example, SAM 3's 0.630 is credited to his counting report and the field model's 33 MB to the proof run's logs.

### Noman · Website prototype (`Noman_task/AeroRescue-site/`, pushed 9–10 Nov)
- **What:** a 7-page React site for Vercel (Home, Data, Method, Results, Gallery, Demo, About) and four wireframe images. Reviewed 11 Nov from the source files (not built or run). The full review, written for him, is [Noman_task/Review_AeroRescue_site.md](Noman_task/Review_AeroRescue_site.md).
- **Usable:**
  - its content lives in data files;
  - the demo labels its sample output honestly;
  - the decision-support warning is on every page;
  - `vercel.json` sets the cross-origin isolation headers the in-browser segmenter needs.
- **To fix:**
  - wrong task names (BBR, DRE, DTR, DSR);
  - DRE's base and fine-tuned scores swapped;
  - the old 7B's 512 px scores;
  - a segmentation table mixing leaked (645) and leak-free (605) scores, which flatters R11;
  - Section 15 instead of 13 (15 was CSE499A's);
  - an offline FAQ claiming the laptop already runs every model.
- **The wireframes:** they follow the CSE499A proposal's first plan, with metrics never measured (CSE499A's final report has no RAR, ROUGE-L or BERTScore) and FEMA and UN-OCHA sign-in pages, in the public repository. Asked to be removed.
- **Fit:** it covers the same ground as T3 (Abrar's, decided 24 Oct); how they fit together is open. *(16 Nov: settled. T3 is built from Aryan's prototype in `T3_Website/`; Noman's pages and his pattern of keeping content in data files can be ported into it, with the corrections from his review. Nothing of his is ported yet.)*

### Tamanna · Plan 2, building-by-building crop inspection (`Tamanna_task_2/Plan_2/`, pushed 17–22 Oct)
- **What we use:**
  - **The idea:** crop each building at full resolution and ask the VLM about it. It overlaps R16c's per-building grader and T2's report, and the dashboard code may help T3's visuals.
  - **Two lessons:**
    - Telling the VLM the segmenter's class and asking whether it agrees gets agreement nearly every time (100% for the fine-tuned 7B on 10 tiles). So agreement can't stand in for accuracy, and checks in T2 and H2c must never show the model the answer being checked.
    - Filtering by file name let radar images into a colour-photo set: 4 of the tiles used were radar.
- **Not used:** any number from Plan 2.
  - None traces back to a recorded run of the committed code (the notebooks' run timestamps and git history were checked on 26 Oct).
  - Several numbers were typed in.
  - The tiles used were training or radar images.
- **Next:** a clean re-run, then a test against ground truth on the benchmark's test images: does a zoomed crop let the 7B grade buildings better than R11?
- **28 Oct, the rebuilt demo (pushed 27 Oct), checked:** both notebooks are committed Kaggle runs that finished without errors; the 10 tiles are validation pairs, none of them leaked; no prompt shows the segmenter's class. The README and the audit response now label everything "demo, not an evaluation" and list what was wrong.
  - **What the demo shows (agreement, not accuracy):** the fine-tuned 7B called all 30 inspected buildings Intact, the base 7B 24 of 30, while the segmenter said 19 Damaged, 9 Intact and 2 Destroyed. The VLM's one-word class matches its own EMS-98 grade on only 15 of 30 crops (base: 8 of 30), so its two answers often contradict each other.
  - **For Part B:** score against the true validation buildings (E1's masks), and compare with R16c's grader on the same buildings (macro F1 0.754 in step 5b), so the question becomes whether the 7B grades better than our trained grader. Mark the building in the crop: its longest side is 46 px at the median (7 of 30 under 32 px) in a 256 px window, so other buildings fill most of it.
    - **29 Oct, the comparator:** with equal numbers per class, compare per-class recall, not F1, since precision depends on the class mix. R16c step 5b's grader on the true validation buildings it graded ([grader_true_buildings.csv](Champion_Task/R16c-results/step5b/grader_true_buildings.csv)): Intact 0.940, Damaged 0.669, Destroyed 0.702. Counting the 601, 121 and 132 ungraded buildings as wrong gives the file's 0.911, 0.650 and 0.644. The VLM sees every sampled building, so the first set is the fair one. Part B should use the new 7B (`l0s2-mergedFP`), which L0 step 2 kept.
  - **2 Nov, Part B's result (checked 3 Nov): no.** [Tamanna_task_2/Plan_2/README.md](Tamanna_task_2/Plan_2/README.md#result), committed Kaggle run, 28 min on two T4s.
    - Design: 300 true validation buildings, 100 per class, from the 605 clean images; a red box around the target in a 256 px window shown at 504 px; the same two prompts for every building; R16c step 5b's grader (seed 44) on the same buildings, after reproducing its recorded grades (2 of 25,594 differ). The decision rule (exact McNemar, p < 0.05) was fixed before the run.
    - Right answers out of 300: grader 212, new fine-tuned 7B 100, base 7B 99. Recall (Intact / Damaged / Destroyed): grader 0.93 / 0.57 / 0.73 on parsed answers; fine-tuned 1.00 / 0.00 / 0.00 (it answers Intact for 298 of 300); base 0.49 / 0.50 / 0.00 (it never answers Destroyed).
    - **What it means:** a zoomed, marked crop doesn't make either 7B a grader. Grading stays with the trained grader. The 7B's role in reports is to describe what the grader and the per-building table already decided, not to grade. This also explains Part A's all-Intact demo.
    - **Limits stated by Tamanna:** the grader sees before and after, the 7Bs only the after-crop (a before-and-after version would be H3's V3); one prompt, one crop setting, greedy decoding.
    - Recomputed on your PC from `part_b_answers.csv`: the confusion tables and both McNemar tests match.
  - **Open:** the older part of the audit response quotes what reads as a prompt to an AI assistant ("To answer the prompt's core question…", line 250). Your call, as with Ridita's README.
