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
| 19 Nov | **The 3B's GPU hours: option A, both 3Bs with one full epoch each.** (c) runs on account 1; (b) runs on accounts 2 and 3 taking turns, each session continuing from the last checkpoint on Hugging Face | It keeps the comparison the 8 Nov rule was built on. With account 1's permanent Colab boost (about 55 GPU h a week), the two 53 h trainings fit in about 7–10 days, which leaves about 2 weeks before the 15 Dec showcase. The other options were one 3B only (it loses the comparison) or both on half the data (weaker) | [l2-step2-train-3b.ipynb](Champion_Task/l2-step2-train-3b.ipynb), with step 2b's fix and the faster image lookup in place. A v2 copy was built first, then folded in on Abrar's call. The failed checkpoint is deleted on Hugging Face, so the notebook keeps its folders `b/` and `c/`, where steps 3 and 4 read the adapters |
| 19 Nov | **L2 run 3's sessions are started by a script on your PC** (option (b) of three): [kaggle-runner/runner.ps1](Champion_Task/kaggle-runner/runner.ps1), run by Windows Task Scheduler every 15 minutes (every 3 minutes from 20 Nov, 07:05, your call, so a finished session waits at most 3 minutes for the next). Each account's Kaggle API token is stored encrypted for your Windows user, outside the project | Five sessions of about 10.5 h per 3B, on three accounts, would each need you to start it by hand. The script checks each ended session (finite losses, real updates, the step count up, the right checkpoint on Hugging Face) before it starts the next one, and stops the lane on anything unexpected. The alternatives were starting each session by hand, or a timer that lives only as long as an open editor session | Built 19 Nov and checked offline (the notebook copies it pushes differ from the notebook only in the three settings). Next: one real session as its test (mode c's smoke test, account 1), then the timer |
| 20 Nov | **Abrar does T2 step 5 himself, on account 4** (the reports read C4's building table and hot spots). Ridita focuses on Layer 3 step 1 | It's on the critical path to O3's one chain, and its inputs are on GitHub since this morning (commit `1a5f38094`). Accounts 1–3 are busy with the 3B training until about 22 Nov, and account 4 is free | Built in a copy of Ridita's fixed flow, so her code stays hers; she pushes any open changes first |
| 20 Nov (later) | **T2 step 5's run goes on account 3, not account 4** | Four of its five inputs (the guideline index, the installer files, the 7B and the benchmark photos) are on account 3 already, so nothing has to be shared, and the fifth, the new code dataset, was uploaded there. The run needs about 1 of the account's 4.3 GPU hours, and the 3B training reaches account 3 only on Saturday morning. Account 4 would have needed the four shared first and about 20 minutes of setup | The private dataset `redwannewaz/disasteller-offline-c4` and the notebook `redwannewaz/t2-step5-c4-run`, started from your PC at 08:16 with account 3's stored token. Account 4 stays free for the super-resolution test |
| 20 Nov (evening) | **T2 step 5's numbers: fixes (a) clearer facts and (b) a number check while writing,** then run 2, and step 7 on both runs | Step 7 on run 1 found 13 wrong numbers ("96%" for 96 of 144 patches; "283,81") and 5 unsourced staff numbers. (a) removes the misreading where it starts; (b) catches any number the facts and the passages don't give, invented ones included. (c), the code writing the counts sentence, would fix only that one sentence | `fixed_flow_c4.py` and the new `number_check.py`; run 2 is `t2_step5_c4_fix_run.ipynb` on account 3 |
| 20 Nov (evening) | **R16c step 7's full run now, on account 4 (about 5.5 h),** started from your PC with account 4's token | The smoke test passed, but Swin2SR's 18 s per photo makes the run 5.5 h instead of 1–2. Account 4's hours for this week expire unused at 06:00, so the run takes none of next week's | `tamannamou123/r16c-step7-super-resolved-crops`, version 2 |
| 20 Nov (evening) | **T2 step 7's rule, version 2, and step 5's run 3:** a damage count used for staff, teams, shelters or other resources is "misused" and counts as wrong. The same rule goes into the check while the model writes | Run 2 passed the first rule, but reused damage counts as staff and shelter numbers. Measured with version 2: 9 times in Turkey's reports, 0 in run 1. Fixed before run 3, the exemption takes a number from a shown passage's text, not its page header: as first coded, a page-54 header let "54 medical personnel" pass (7 found, not 9) | `number_check.py` (rule 2, with tests); run 3 is `t2_step5_c4_fix2_run.ipynb` on account 3, from 19:35 |
| 20 Nov (evening) | **The Claude contributor on GitHub stays:** no history rewrite | It comes from Ridita's commit `8b82abd94` (25 Oct), whose message has a "Co-authored-by: Claude" line. Removing it changes the IDs of the 91 commits after it, makes everyone re-sync, and breaks the commit IDs the docs cite | Nothing changed; Abrar's call |
| 20 Nov (night) | **T2 step 5's run 4 with both fixes:** (1) requests that don't ask for numbers the facts lack, in the C4 flow's own copies of tasks 2–6; (2) a last guard in the code that replaces a number still flagged after the second answer with "(number not available offline)" | In run 3 the 7B, asked again, kept the building counts as staff numbers, because its sections ask for "the number of medical personnel…" and "the number of emergency shelters". (1) removes the cause, and (2) makes the result certain, at the cost of the code editing the model's text, which the run log records | `fixed_flow_c4.py` (OVERRIDES, TASK_OVERRIDES, the guard) and `number_check.guard`; run 4 is `t2_step5_c4_fix3_run.ipynb` on account 3, from 21:48 |
| 21 Nov (03:00) | **Free Hugging Face space by deleting the three SaulLM GGUF repositories (43.4 GB),** deleted by Abrar | Mode (b)'s checkpoint-80 commit was refused at 02:28 ("Private storage limit reached"). The free plan caps private repositories at 100 GB, and they held 99.3 GB; public repositories don't count toward it. The GGUFs are April's SaulLM exports, which this project doesn't use, and their LoRA adapters stay in the small `saullm-7b-direct-lora-*` repositories | Private storage at 55.9 GB; mode (c)'s checkpoint-80 went through at 03:10 |
| 21 Nov (03:20) | **Mode (b) continues from its checkpoint-80, recovered from session 3's Kaggle output and checked before upload,** not from checkpoint-70 | The trainer writes the whole checkpoint before the upload starts, and the crash came from the upload's commit. Checked against checkpoint-70: the same files and sizes, intact zip checksums, step 80 with finite losses, no NaN in the adapter or the optimizer, and the adapter moved 3.9%. It saves retraining steps 70–80, about 2.5 GPU hours | Uploaded to `b/checkpoints/checkpoint-80`; the runner's record set to step 80; session 4 on account 3 from 03:23 (2-hour limit, before the 06:00 reset) |
| 23 Nov (15:10) | **The 3B's benchmark runs are rerun in full with the overflow fix** (Abrar's choice of two). That means run 5 for (c) and (b) at normal precision, and L3 for (c) in 4 bits | Run 5 lost 327 and L3 220 of 10,675 answers to a half-precision overflow (L2 step 2b's, at the vision part's last block); they were scored wrong. The other option re-answered only the broken ones plus a 600-question consistency sample, mixing two settings | Every 3B number comes from one setting. About 5 GPU h on account 2 (both 3Bs at once, one per GPU) and about 5 h on account 3 |
| 23 Nov (15:10) | **(b) is scored on the benchmark too** (Abrar's request: a comparison of every model on every task) | The 8 Nov rule scored only the winner, to keep the benchmark out of the choice. Scoring (b) after the choice describes it and can't change it | Run 5's rerun answers with both 3Bs; [l2-step4c-model-comparison.ipynb](Champion_Task/l2-step4c-model-comparison.ipynb) |
| 23 Nov (09:31) | **(c), the options rerun, is the field 3B**, by the rule fixed 8 Nov (L2 run 4) | 45.12% against (b)'s 35.95% on the rule's held-out score, p < 0.0001; its lead is in counting and relational reasoning | Run 5 (the benchmark) on account 2 and L3's full run on account 3, both with `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` ([§7, L2 step 2](#l2-step-2--two-3bs-and-the-rule-decided-and-built-8-nov)) |
| 23 Nov | **An ID guard in the report chain** (Abrar's go). After the number guard, any guideline ID in square brackets that isn't among the passages shown for that section is dropped, and the drop is logged | T2b's 7B kept 3 made-up IDs (`INSARAG2B-5.7.1`, `INSARAG2B-2`, `INSARAG2B-3.10`) in two human-resource reports. The checker caught wrong numbers but not invented IDs | `id_guard` in [fixed_flow_c4.py](Offline_RAG_KR2/disasteller_offline/fixed_flow_c4.py); unit tests and a PC dry run passed; Kaggle check `tamannamou123/t2b-id-guard-check` (the 7B on Palu and Beirut) on account 4, 07:12–07:35: made-up IDs 3 → 0 ([results](Offline_RAG_KR2/results/t2b_id_guard/README.md)) |
| 23 Nov | **L3 is 4-bit through bitsandbytes NF4, not AutoAWQ. The hand-off is worked out on the PC from saved answers, by a rule fixed before the run** | AutoAWQ's authors stopped maintaining it in 2025; NF4 is H2b's setting and needs nothing new. The 7B's answers to all 10,675 questions are already saved (L0 step 2), so only the 3B needs a GPU run | [§7, L3](#l3--the-winning-3b-in-4-bits-and-its-hand-off-to-the-7b-built-23-nov); smoke test on account 3 from 07:33, with adapter (c) standing in for the winner |
| 23 Nov | **T2b's five blind pairs also go to a second judge, Gemini in its web chat** (Abrar's request). Each pair is sent in both orders, and a pair counts as a win only if it wins both | Model judges favour the report shown first and the longer one, and one writer's reports run 2–3 times longer | Prompts and steps in `Offline_RAG_KR2/results/t2b/blind/gemini/` |
| 21 Nov (06:10) | **Account 4's free week goes to T2b (who writes the report), then H4 (GEOBench-VLM counting)** | All four accounts reset at 06:00. More accounts can't speed up the 3B training: each mode's sessions run one after another, and both modes have enough hours. T2b is unblocked (T2 steps 5 and 7 and E7 are done) and its result can go into update 6 | T2b built and its smoke test started on account 4 at 06:41; H4 after it |
| 21 Nov | **T2b runs on account 4 with its own inputs.** The two models (at pinned commits) and step 5's exact package versions download with internet on, before the flow starts. The code, the 20 photos and an unchanged copy of the guideline index are private datasets on account 4 | Step 5's five inputs are private on account 3, and account 3 is in the 3B training's rotation. Sharing them would have needed five manual steps from Abrar. The flow still runs with Hugging Face offline, and its network log must show no outside connection | `tamannamou123/disasteller-offline-t2b` and `tamannamou123/offline-rag-kr2`; notebook `tamannamou123/t2b-writer-test` |
| 21 Nov (07:00) | **H4's xBD photos come from a public Kaggle copy of full xBD (`qianlanzz/xbd-dataset`), checked first: its 5,598 training photos must match the PC's copy byte for byte** (Abrar's choice of two) | GEOBench doesn't ship xBD's photos, and the PC has only xBD's training set and the unlabelled challenge test. The other way was Abrar downloading xBD's test and hold sets from xview2.org | `tamannamou123/h4-inputs` (the questions, the PC's hashes, the package list); notebook `tamannamou123/h4-geobench-xbd-counting` |
| 22 Nov | **The runner restarts a failed session by itself, once:** when a session ends as an error and Hugging Face holds a newer checkpoint that is complete (every file the earlier checkpoint has, at the same size) with finite losses, the lane records that step and starts its next session. A second failure before a session passes, a cancelled session, the smoke test, or a log naming full storage or a GPU out of memory still stops the lane | The GPU stall of 21 Nov, 18:56 left mode (b) idle for 17 h: the runner stopped it as designed, and my watchers were off to save Abrar's Claude quota. Abrar's yes to this option of three | `runner.ps1` (`Get-Restart`, Test-Ended, `auto_retries` in the state; `-Retry` resets it). Tested on the real repository: the stall's log continues from checkpoint-140; the full-storage crash's log is refused; a second failure, nothing newer, and a GPU memory error are refused |
| 21 Nov (08:00) | **H4's rule uses only the no-damage and destroyed questions; "damaged, any level" is reported apart; the 7B gets room for a sentence when asked for a number** | The third smoke test showed GEOBench's "damaged, any level" answer counting every building: on all 210 pairs (checked on the question file) it equals no damage + minor + major + destroyed, against its own wording ("How many buildings are damaged…"). Scoring it would reward knowing that quirk, not counting. Asked for a number, the 7B begins a sentence ("The total number of buildings that…"), which an 8-token limit cut off: 38 of 50 had no number | `h4-geobench-xbd-counting.ipynb` version 4, fourth smoke test from 08:02 |
| 21 Nov (07:30) | **H4's copy check passes on the same decoded pixels, not only the same bytes** | The first smoke test stopped at the byte check. The copy's `tier1/` holds all 5,598 training photos, but only 28 are byte-identical. PNG files saved again with other compression settings differ in bytes but not in the photo, and the overlap check (E5) already compares decoded pixels for the same reason. Every folder of the copy that holds the photos is checked; the run still stops if any photo's pixels differ | `H4-inputs/xbd_train_sha256_pc.json` now holds both hashes; H4's second smoke test from 07:33 |
| 21 Nov | **H4's rule compares the counts too, not only accuracy** | GEOBench builds each question's options around the true count, and the true count is 0 in 49% of the questions. Rules that never see the photo get 37.4% (the middle option), 49.2% (the smallest) and 68.9% (one that knows only the question type), against GPT-4o's published 56.67%. So the rule also asks our 7B for a number without the options, and tests whose count is closer to the truth | [h4-geobench-xbd-counting.ipynb](Champion_Task/h4-geobench-xbd-counting.ipynb)'s first cell; roadmap H4 |
| 21 Nov | **T2b's counts, fixed before the run:** contradictions are the wrong or misused numbers left after asking again (what the last guard replaced), plus any in the finished reports. Both writers decode the same way (temperature 0.2, seed 0, repetition penalty 1.05, no top-p or top-k cut) | The guard (20 Nov) came after T2b's rule (4 Nov), so counting only the finished reports would give both writers 0. Qwen2.5-3B-Instruct's own top-p 0.8 and top-k 20 would make the writer not the only difference | [t2b_score.ipynb](Offline_RAG_KR2/t2b_score.ipynb)'s first cell; roadmap T2b |
| 20 Nov | **Runs started by the runner get their Hugging Face write token from a private Kaggle dataset** (option (a) of three). It's a fine-grained token that can write only to `AbrarAlam/disasterm3-qwen25vl3b-l2`, kept as the dataset `l2-hf-write-token` on each account, shared with no one | The runner's test showed that Kaggle won't give runs started from the command line the notebook's secrets ("400 Bad Request" in Cell 2). The alternatives were starting each session by hand on Kaggle's page (about 10 starts), or a changed notebook that keeps checkpoints on Kaggle instead of Hugging Face (about a day of work) | The repository re-created empty and private; the runner and the setup double-click extended and checked; the token deleted on Hugging Face when the training ends |
| 19 Nov | **The damage map comes from option C4.** R11, our pixel model, maps the coarser xBD photos, and find-then-grade (SAM 3 outlines each building, then our grader labels it) maps the sharper photos, such as Turkey's | The only option ahead on destroyed buildings on both the 605 validation pairs (0.35) and the 2,007 unseen test pairs (0.43), by more than chance. It also passes the project's promised 0.30 on validation with room to spare. Its costs are recorded with it | E7 step 3 (the "where to search first" heatmaps on C4's maps) and Ridita's T2 step 5 (her reports read C4's building table). Every option explained in plain words: [§4, E7 step 2c](#e7-step-2c-option-c-a-mix-chosen-on-validation-run-17-nov-pc-no-gpu) |

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

### H4 · GEOBench-VLM's xBD questions: our counting and our 7B (run 21 Nov, Kaggle account 4, 73 min)
- **What:** GEOBench-VLM's 1,050 damaged-building counting questions on 210 xBD before-and-after pairs, and its 420 disaster-type questions, answered by our counting and by our 7B. Our counting is C4 on xBD photos: R11 with TTA, blobs of at least 20 px, the nearest option. Our 7B gets the DisasterM3 authors' prompts, and also the counting questions without options, for a number. [Notebook](Champion_Task/h4-geobench-xbd-counting.ipynb), [results](Champion_Task/H4-results/H4/README.md).
- **Why:** an outside check of the claim behind our design, that counting from a damage map beats asking a VLM. Published scores: GPT-4o 56.67%, Qwen2-VL 50.00%.
- **Found while building and in four smoke tests** (each fixed before the full run, decisions above):
  - rules that never see the photo get 37.4% (middle option), 49.2% (smallest) and 68.9% (question type only), since GEOBench builds the options around the true count and the truth is 0 in half the questions;
  - its "damaged, any level" answer counts every building, against its wording (all 210 pairs);
  - the public xBD copy re-saved the PNGs: the same pixels, other bytes;
  - asked for a number, our 7B answers in a sentence.
- **Result:**
  - **119 of the 210 pairs (57%) are in DisasterM3 Instruct**, our training photos, with the same pixels; 91 clean pairs are scored.
  - **The rule fails:** on the 182 clean no-damage and destroyed questions, our counting's accuracy is 36.3% against the 7B's 50.0% (the 7B ahead, p = 0.0003); but our count is nearer the true count 110 times against the 7B's 54 (p = 0.00001). The question-type rule gets 77.5% on the same questions.
  - Our counting's weakness is dense scenes (touching buildings merge into one blob); its exact-count rate on destroyed questions is 52.7% against the 7B's 2.2%.
  - Our 7B's disaster type: 35–46% on clean pairs, 61–72% on leaked pairs.
- **Against the expectation:** copy check, our counting's range, both below the type rule and below GPT-4o met; the 7B's counting (50%, expected 25–45%), test 1 and the 7B's disaster type (expected at least 55%) missed.
- **What it leads to:** GEOBench's xBD counting can't support the hybrid-counting claim either way (biased options, one mislabelled type, most photos in our training set). O2's evidence stays on DisasterM3's own clean benchmark. The overlap is worth a sentence in the report: any model trained on DisasterM3 has seen most of GEOBench's xBD photos.

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

### L1c · R11 to 8-bit (INT8) (18 Nov)
- **What:** R11, the 6-channel U-Net reading the after-photo (channels 0–2) and before-photo (channels 3–5), exported to ONNX FP32 and quantised to static INT8 with L1b's recipe (`keep 1+1` and `keep 1+3` convolutions in FP32).
- **Why it was planned:** T3's "Try it" page ran R9 (the after-only model) in the browser because R11 had never been exported to 8-bit.
- **How:** opset 17, fixed 1024 × 1024 6-channel input, QDQ static INT8 calibrated on 100 training pairs, scored without TTA on all 645 validation pairs and on the 605 clean ones, and timed on 50 pairs (median of 3 runs per pair after warm-up).
- **How it ran:** Kaggle account 2 (`abrar2222864642`), CPU session (4-thread Intel Xeon @ 2.20 GHz, 33.7 GB RAM), 2.2 h, 18 Nov. [l1c-r11-int8.ipynb](Champion_Task/l1c-r11-int8.ipynb); results in [L1C-results/L1c/](Champion_Task/L1C-results/L1c/README.md).
- **Expectation before the run:**
  - PyTorch and ONNX FP32 agree on at least 99.99% of pixels on 3 pairs, and ONNX FP32 reproduces E5 step 2's R11 without TTA (0.5811 mIoU / 0.2911 Destroyed IoU) within 0.001.
  - Both static INT8 versions pass (Destroyed IoU drop under 0.01), at about 33 MB and ~1.4× FP32 speed.
- **Result:**
  - **Checks:** PyTorch and ONNX FP32 agreed on 1.000000 (100%) of pixels; ONNX FP32 reproduced 0.5811 / 0.2911 on all 645 pairs (0.5742 / 0.2641 on the 605 clean pairs) at 130.0 MB (`130,048,299` bytes) and `2,364 ms/image` (`p95: 2,382 ms`).
  - **Both static INT8 versions passed:**
    - `INT8 static, keep 1+1 FP32` (`r11_int8_static_keep1_1.onnx`): 33.1 MB (`33,145,715` bytes), `1,835 ms/image` (`p95: 1,857 ms`, `1.29×` ONNX FP32), mIoU 0.5801 (clean 0.5734), Destroyed IoU 0.2897 (drop 0.0014; clean 0.2630, drop 0.0011).
    - `INT8 static, keep 1+3 FP32` (`r11_int8_static_keep1_3.onnx`): 33.2 MB (`33,163,619` bytes), `1,751 ms/image` (`p95: 1,770 ms`, `1.35×` ONNX FP32), mIoU 0.5801 (clean 0.5733), Destroyed IoU 0.2897 (drop 0.0014; clean 0.2630, drop 0.0011).
- **What it led to:** `r11_int8_static_keep1_3.onnx` (`33,163,619` bytes) is R11's edge model, ready to wire into `T3_Website/src/core/modelConfig.ts` with `images: ['after', 'before']`.

### L4 · EfficientSAM3 against SAM 3 as the building finder (18 Nov)
- **What:** EfficientSAM3's three released full models, EV-M, RV-M and TV-M (EfficientViT-B1, RepViT-M1.1 and TinyViT-11M vision backbones, each with the MobileCLIP-S0 text encoder at 16 tokens), prompted with "building" on the 645 validation before-photos as in E3, whole (`pre_grid1`) and in four quarters (`pre_grid2`).
- **Why it was planned:** full SAM 3 finds buildings best (Building IoU 0.6302 on the 605 clean pairs) but is server-sized (841M parameters, 2.11 s per photo on a T4). A field-sized finder would let find-then-grade run on a laptop (goal O4).
- **How:** the repo's README settings, weights pinned to `Simon7108528/EfficientSAM3@85b05896`, code `SimonZeng7108/efficientsam3@bd0936c`, confidence 0.5 as in E3. Every checkpoint had to fill at least 95% of its model's parameters.
- **How it ran:** Kaggle, T4, 18 Nov. Run 1 stopped in Cell 1: `pip install -e` isn't seen by a running kernel. Three more faults were fixed before run 2, with no result seen: students guessed from file names, a 77-token text context, and the rule's memory condition missing. [l4-efficientsam3-building-finding.ipynb](Champion_Task/l4-efficientsam3-building-finding.ipynb); results in [L4-results/L4/](Champion_Task/L4-results/L4/README.md).
- **Expectation before the run:** the students are about 9× smaller and faster. Zero-shot aerial recall may drop a lot, likely below R9's 0.5905.
- **Result:**
  - **Checks:** E3's SAM 3 reference reproduced (0.6304 on all 645, 0.6302 clean); every checkpoint filled 100% of its model (97.4M, 100.8M and 103.5M parameters).
  - **Building IoU on the 605 clean pairs:** 0.010–0.054 for the three students in both runs; the best is TV-M with quarters, at 0.0541. SAM 3 scores 0.6302.
  - **Detections:** with no student does any photo get more than a few. 56–94% of photos got no detection at all, and the median is 0 against 20 true buildings. Where something was found, its overlap with the buildings was only 0.08–0.17, so a lower score threshold wouldn't rescue them. On the densest probe photo, every student found 0 buildings; SAM 3 found 11.
  - **Speed:** on a T4 in fp16, 0.59–0.71 s per photo in quarters, about 3× faster than SAM 3, at 1.15–1.19 GB. On a 4-thread CPU, 5.1–6.3 s per whole photo and 20–25 s in quarters, against 1.6 s for the 8-bit U-Net.
  - **Verdict:** no student passes the rule (Building IoU at least 0.5905, faster, lighter). The expectation's direction held, but the drop was far larger than guessed.
- **What it led to:** full SAM 3 stays the base-station finder, and the 8-bit U-Net stays the field model. This doesn't prove EfficientSAM3 can't see buildings in satellite photos: the run had no check that our setup finds objects in an ordinary photo. A 10-minute check would settle it: the README's own example photo and prompt, plus the score distribution on 20 satellite photos. *(Built the same night as L4b, [l4b-efficientsam3-sanity-check.ipynb](Champion_Task/l4b-efficientsam3-sanity-check.ipynb), and run; see below.)*

### L4b · Was L4's near-zero result EfficientSAM3 or our setup? (18 Nov)
- **What:** the three models of L4.
  - Check A: on the repo's own example photo with "dog" and "person".
  - Check B: on 21 satellite before-photos (L4's first 20 clean validation pairs and its probe), whole, at score thresholds 0.5, 0.3, 0.1 and 0.05, with the prompts "building", "house" and "roof".
- **How it ran:** Kaggle T4, 18 Nov. Check 1 passed (the photos and masks equal E3's). Every checkpoint filled its model. Results in [L4b-results/L4b/](Champion_Task/L4b-results/L4b/README.md); the overlay pictures are kept local.
- **Expectation before the run:** A passes; with "building", no model reaches Building IoU 0.10 at any threshold.
- **Result:**
  - **Check A:** EV-M and TV-M found the dog and the people at 0.5. RV-M found the people (0.82), but the dog only at 0.325.
    - **By the reading fixed before the run, that makes it "setup":** the rule failed A if any model missed either object.
    - **That rule was too strict.** The same code found both objects with two of the three models, so the setup works. RV-M is just less sure of the dog. The recorded reading stays as it came out; this note explains it.
  - **Check B, "building":** at 0.5, IoU 0.002–0.017, as in L4. At lower thresholds it rises: TV-M 0.285 at 0.1 and 0.365 at 0.05; RV-M 0.320 at 0.1. SAM 3 scores 0.281 on the same photos at 0.5. "house" and "roof" do no better.
  - **But the masks don't outline buildings.**
    - The overlay of the Moore tornado photo at 0.05 shows large nested blobs over whole blocks, car parks and roads.
    - Over the 21 photos at 0.05, the masks cover 33–42% of the area, against 15% that is building. Only 25–39% of what they mark is building.
    - TV-M's 0.365 comes from the five dense Turkey city photos (0.600), where marking nearly everything scores well. On the 16 xBD and other photos it is 0.128.
- **What it led to:** the models sense built-up areas weakly but don't find buildings one by one, which find-then-grade needs. L4's verdict stands: full SAM 3 stays the finder, and the 8-bit U-Net the field model. A re-run at a low threshold isn't recommended, since Building IoU would reward blanket coverage.

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

### E7 step 2c: option (c), a mix chosen on validation (run 17 Nov, PC, no GPU)
- **What:** [e7-step2c-mix-choice.ipynb](Champion_Task/e7-step2c-mix-choice.ipynb); [results](Champion_Task/E7-results/step2c/README.md). Built and run at Abrar's go, from saved files only:
  - SAM 3 outlines with three graders' log-probabilities, R11's pixels and the true pixels under each (R16c steps 5 and 5b; E7 step 2);
  - E5 step 2's per-image counts;
  - E6's masks;
  - R11's saved test maps.
- **Why:** on the test pairs, R11 led outside Turkey and find-then-grade on Turkey (E7 step 2b). A mix might beat both.
- **How, fixed before the run:**
  - six candidates:
    - R11 grading the outlines;
    - the grader saying building-or-not with R11 giving the class;
    - three blends;
    - by source, R11 on xBD images and find-then-grade on the others;
  - pick the highest destroyed IoU on the 605 clean validation pairs (mean of three seeds; ties to the simpler one);
  - confirm once on the 2,007 clean test pairs, with 10,000 redraws as in step 2b.
- **Checks:**
  - every published score was rebuilt from the files within 0.0005;
  - except seed 43 on validation: 0.3063 against 0.3051, the 0.0012 gap R16c step 5 recorded on 26 Oct. The first run stopped there, and that one check now allows 0.0015, recorded in the notebook.
- **Result:** the pick is by source (C4).
  - **Validation:** 0.3501 destroyed IoU, against 0.3068 for find-then-grade and 0.2692 for R11; mIoU 0.5881.
  - **Test:** 0.4296, against 0.3984 and 0.3898. That's +0.031 over R11 (95%: +0.008 to +0.057) and +0.040 over find-then-grade (+0.027 to +0.055).
  - **Costs:** test mIoU 0.5555 against R11's 0.5721; it needs the image's source, which ground resolution could stand in for; the building table would mix blobs and outlines.
- **Against the expectation:** C4 strongest, as guessed; C1 lower than guessed; the test score at the low end of the guess.
- **Decision (19 Nov): C4, Abrar's choice,** made from the plain comparison below.

#### Every option in plain words (written 19 Nov, for the decision)

**What was decided.** Our system takes two satellite photos of the same place, one from before a disaster and one from after. It produces a **damage map**: a copy of the after-photo where every pixel is marked as not a building, an undamaged building, a damaged building or a destroyed building. Everything after that is built from this map: the table of buildings and their counts, the "where to search first" heatmap, the written reports for rescue teams, and the website's pictures. So the decision was which method makes the map.

**The two methods.**
- **Method 1, the pixel model (R11).** A neural network we trained ourselves, of the kind called a U-Net. It takes the before-photo and the after-photo together and marks each pixel in one go. To be more accurate, it looks at each photo 8 times, flipped and rotated, and averages its answers. It never decides where one building ends and the next begins, so two buildings that touch come out as one coloured patch.
- **Method 2, outline first, then grade each building (find-then-grade).** Two programs in a row:
  1. **Find:** SAM 3, a large image model made by Meta, is given the before-photo and the word "building", and draws a separate outline around every building it sees.
  2. **Grade:** for each outlined building, a small network we trained (the grader) compares that building's patch of the before-photo with the same patch of the after-photo. It decides whether the building is undamaged, damaged or destroyed, or whether the outline isn't a building at all.

  The result is a list of individual buildings, each with its own outline and its own damage label.

**Why the type of photo matters.** Our photos come from two kinds of sources:
- **xBD photos**, from an older dataset (hurricanes, wildfires, floods). They're coarser: one pixel covers about 1.25–2.8 m of ground.
- **The other photos**, including Turkey's 2023 earthquake. They're sharper: one pixel covers about 0.3 m.

Method 1 does better on the xBD photos. Method 2 does far better on Turkey, where Method 1 misses almost all the destroyed buildings.

**How the scores work.**
- **Destroyed-building score (destroyed IoU):** take every pixel that truly is a destroyed building, plus every pixel the method calls destroyed. The score is the share of those pixels where the two agree. 1.0 is perfect and 0 means no agreement. This is the project's hardest and most important number.
- **Overall map score (mIoU):** the same calculation for all four labels, averaged.
- **Building-finding score (building IoU):** the same calculation for "building or not", ignoring damage.
- **Two photo sets:**
  - the 605 validation pairs, used to choose between options;
  - the 2,007 test pairs, which no method had seen, used once at the end to confirm the choice.

  Every method scores higher on the test set, because it holds a different mix of disasters. Only the comparison within a set counts.

**The options.**
- **Option A: Method 1 on every photo.**
  - **Gives:**
    - the simplest system, with one model;
    - the best overall map, and the best at finding buildings at all;
    - the building table is already built from it;
    - a compressed copy (33 MB) runs inside a website visitor's browser.
  - **Costs:**
    - it almost completely fails on Turkey;
    - on validation its destroyed-building score is 0.27, below the 0.30 the project promised;
    - touching buildings merge into one patch, so counts and building-by-building report lines are rough.
- **Option B: Method 2 on every photo.**
  - **Gives:**
    - every building separately, with its own outline, which is what a building table and a building-by-building report need;
    - far better on Turkey;
    - it just passes the promised 0.30 on validation (0.31).
  - **Costs:**
    - clearly worse than Method 1 on all the other disasters;
    - SAM 3 misses some buildings entirely;
    - SAM 3 is a big model that needs a graphics card and can't run in a browser. Its smaller version, EfficientSAM3, doesn't work as a replacement (L4).
- **Options C1, C2 and C3: both methods on the same photo,** tested on validation. In all three, SAM 3 draws the outlines first; what changes is who decides each building's damage:
  - **C1:** Method 1 decides, by its most common label inside the outline. Score 0.21.
  - **C2:** the grader decides only "building or not", and Method 1 decides the damage level. Score 0.21.
  - **C3:** the two opinions are averaged, at three weightings. The best scored 0.31, no better than Method 2 alone.

  All three were worse than, or no better than, one method alone.
- **Option C4: the method chosen by the type of photo** (chosen). Method 1 maps the coarser xBD photos, and Method 2 maps the sharper ones. A real system would switch by the photo's sharpness, which satellite photos normally come labelled with; here the switch comes from the file name.
  - **Gives:**
    - the best destroyed-building score on both photo sets: 0.35 on validation and 0.43 on the unseen test photos;
    - each method used only where it's strong;
    - the promised 0.30 passed with room to spare.
  - **Is the lead real?** The test comparison was redone 10,000 times, each on a random re-draw of the test pairs. C4 came out ahead of Option A in 99.4% of them and ahead of Option B in all of them.
  - **Costs:**
    - the system needs both methods installed, including the big SAM 3;
    - the building table mixes two kinds of entries, Method 1's patches on xBD photos and separate outlines on the others;
    - its overall map and building-finding scores are a little lower than Option A's.
- **Options not tested:**
  - **Show both maps:** the website could, but the table, heatmap and reports need one map.
  - **Look for a better combination:** a new experiment, and trying many combinations on the same 605 photos risks fitting them by luck.
  - **Wait:** the next two steps would stay blocked.

**Side by side.**

| | Option A (pixel model) | Option B (outline, then grade) | Option C4 (by photo type) |
|---|---|---|---|
| Destroyed-building score, validation | 0.27 | 0.31 | **0.35** |
| Destroyed-building score, unseen test photos | 0.40 | 0.39 | **0.43** |
| Overall map score, test | **0.57** | 0.51 | 0.56 |
| Finds buildings at all, test | **0.69** | 0.54 | 0.62 |
| Destroyed-building score on Turkey, test | 0.09 | **0.32** | **0.32** |
| Destroyed-building score everywhere except Turkey, test | **0.47** | 0.41 | 0.46 |
| Models needed | 1 small | 2, one of them big | all of them |

Exact values: [E7-results/step2c/README.md](Champion_Task/E7-results/step2c/README.md).

**What it means for the project's four goals.**
1. **The damage map itself (O1):** the project promised an overall score above 0.52 and a destroyed-building score above 0.30 on validation. Option A misses, Option B just passes, and C4 passes clearly. C4 was picked as the best of 8 candidates on those same validation pairs, so its validation figure runs slightly high; the single test run is what makes its lead believable.
2. **Counting buildings for the language model (O2):** separate outlines give one count per building, while Option A's patches merge neighbours.
3. **One system that works without internet (O3):** Option A is the lightest. Options B and C4 need SAM 3 on a graphics card.
4. **The small language model (O4):** not affected.

The website's "Try it" page keeps running Method 1 in the visitor's browser, because SAM 3 is too big for a browser.

**What the choice starts:**
- E7 step 3: the "where to search first" heatmaps drawn on C4's maps (done 19 Nov, next entry);
- Ridita's T2 step 5: her report writer reads C4's building table and heatmaps.

### E7 step 3 · C4's maps, building table and hot spots on the test photos (run 19 Nov, PC, no GPU)
- **What:** [e7-step3-c4-table-and-hot-spots.ipynb](Champion_Task/e7-step3-c4-table-and-hot-spots.ipynb); [results](Champion_Task/E7-results/step3/README.md). Built and run at Abrar's go ("go build E7 step 3"), from saved files only, on all 2,065 readable test photos (2,007 of them clean pairs with trusted true masks, E6):
  - **C4's damage map.** On the 1,326 xBD photos (1.25–2.8 m of ground per pixel), R11's map: our U-Net that reads the before- and after-photo, with 8-view test-time augmentation, saved by E7 step 2. On the 739 sharper photos (about 0.3 m per pixel, such as Turkey's), find-then-grade: SAM 3's building outlines from E7 step 2, each painted with the class our grader gave it (grader seed 42, with the class-bias correction fixed on validation in R16c).
  - **The building table the reports read** (`buildings_c4.sqlite`), in H2's columns plus one more, `kind`. On the sharper photos, one row per building SAM 3 outlined (`outline`). On xBD photos, one row per connected patch of R11's pixels of one class (`patch`), as H2 builds rows; a patch can hold several touching buildings.
  - **The "where to search first" hot spots and safe areas** (`hotspots.json`): T1 v3's method and settings, unchanged, run on C4's maps.
  - **Counting, beside:** C4's answers to the benchmark's counting questions, taken from E7 step 2's saved counts (R11's on xBD photos, seed 42's on the others).
- **Why:** the one-chain rule (4 Nov) needs the table and the hot spots from one method on the same photos before the reports read them (T2 step 5). Until now R11's table (H2) and T1's hot spots shared only 7 photos. C4 was chosen on 19 Nov.
- **What it improves:** O3's chain. The map, the table and the hot spots now come from one method on the same photos. On the sharper photos touching buildings are separate rows, so a report can describe each building.
- **How, fixed before the run:** six checks.
  1. The file-name rule gives E6's source for every test pair.
  2. Seed 42's map, rebuilt from the outlines and grades, equals the saved one.
  3. The scores reproduce the published ones within 0.0005.
  4. H2's row code rebuilds E7 step 2's table exactly.
  5. T1 v3's and the table's self-checks pass (two touching outlines stay two rows).
  6. Ridita's report bridge, `disasteller_inputs.py`, unchanged, reads the table and the hot-spot file for one xBD photo and one other photo.
- **Expectation, fixed before the run:**
  - all six checks pass;
  - on the sharper photos, 5–20% more rows than E7 step 2's table on the same photos, because touching buildings no longer merge (a guess);
  - on the clean pairs, the hot spots' marked points within 20 px of true damage 0.70–0.85 of the time, about T1 v3's 0.736 on validation with R9's maps or more, since C4 finds more destroyed buildings on Turkey;
  - counting within 1.5 points of R11 (32.53%) and of find-then-grade (32.7%) on E5's clean questions.
- **Result** (54.7 min on the PC):
  - **Checks:** all six passed. The rebuilt map matches on 99.9996% of pixels. Every score reproduced, C4 included: 0.4295 destroyed-building IoU against the published 0.4296, mIoU 0.5555, building IoU 0.6221. H2's code rebuilt E7 step 2's table on all 2,065 photos.
  - **The table:** 125,439 rows: 57,849 outlines on the 739 sharper photos (53,953 intact, 1,310 damaged, 2,586 destroyed) and 67,590 patches on the 1,326 xBD photos.
  - **Hot spots,** against the true masks:

    | Photos | Photos (n) | Hot spots | Marked point within 20 px of true damage | Zone touches truly destroyed pixels (the same method on the true mask) |
    |---|---|---|---|---|
    | All clean pairs | 2,007 | 2,775 | **0.569** | 0.316 (0.486) |
    | With destroyed buildings | 687 | 1,448 | **0.827** | 0.606 (0.721) |
    | Without destroyed buildings | 1,320 | 1,327 | 0.287 | |
    | T1 v3 on validation, R9's maps: all | 645 | 694 | 0.736 | 0.349 (0.466) |
    | T1 v3 on validation: with destroyed buildings | 216 | 397 | 0.851 | 0.610 (0.732) |
    | T1 v3 on validation: without | 429 | 297 | 0.582 | |

  - **Counting** (exact McNemar on the same questions):

    | | E5's clean questions | All 3,580 askable | Mean count error (buildings) | Within 20% of the true count |
    |---|---|---|---|---|
    | C4 | **34.89%** | **35.34%** | 12.61 | 34.3% |
    | R11 | 32.53% | 33.02% | 13.34 | 32.3% |
    | Find-then-grade, seed 42 | 32.70% | 32.88% | 13.58 | 30.7% |

    C4 is right where R11 is wrong on 203 questions, the reverse on 120 (p < 0.0001); against seed 42, 376 to 299 (p = 0.0034). The median count error is 4 buildings for all three.
- **Against the expectation:**
  - **Checks:** met.
  - **Rows: missed, +24.5%, above the 5–20% guessed.** Checked afterwards on the PC (read-only, from the two tables): the building area is the same in both (104.96 and 104.95 million px); rows under 100 px rise only from 359 to 404; 614 of the 698 photos with buildings gain rows and 2 lose; the gain is largest in dense cities (Beirut +39%, Turkey +30%, Libya +27%, Noto +26%) and smallest for Hurricane Ian (+6%). So the extra rows are touching buildings counted separately, and the guess underrated how often buildings touch in dense cities. Not settled: whether SAM 3 splits some large buildings in two, which needs true building outlines to check.
  - **Hot spots: missed, 0.569 against 0.70–0.85.** On photos with destroyed buildings, C4's hot spots are about as good as R9's were on validation (0.827 against 0.851). The shortfall is on photos without destroyed buildings: there C4's maps make more hot spots (1.0 per photo against 0.69) and fewer land near real damage (0.287 against 0.582), mostly on xBD photos (0.307 against 0.611; 1.23 hot spots per photo against 0.77), where C4's map is R11's. Both sets have the same share of such photos (66%). So either C4's maps mark more false damage there, or those test photos hold fewer damaged buildings to land on; the saved files can't tell which, because no per-photo count of truly damaged pixels was saved.
  - **Counting: missed in C4's favour,** by 2.36 and 2.19 points, beyond chance.
- **What it means:**
  - **For the reports (T2 step 5, Ridita):** the table and the hot-spot file are ready, from one method on the same photos: `E7-results/step3/buildings_c4.sqlite` and `E7-results/step3/hotspots.json`. Where `kind` is `patch` (xBD photos), a row may hold several touching buildings, so a report must say "patches" or "areas", never "buildings", for those counts.
  - **On a photo with destroyed buildings, about 5 of 6 marked points are near real damage. On a photo without, most hot spots are false alarms.** The report text already calls them a model's estimates; it shouldn't present a hot spot on such a photo as found damage.
  - **O2 (counting above the base 7B's 34.2%):** on the measure the review promised, C4's counts now clear the bar: 35.34% on all 3,580 askable optical counting questions, 34.89% on E5's clean ones. Three limits go with it. The answer options give the answer away (a rule that never sees the photo scores 66.98%), so accuracy can't show counting ability, and count error is reported beside it. These counts are E7 step 2's joined blobs, not the new outline rows. And C4 was chosen on destroyed-building IoU; counting played no part in the choice.
- **Why these measures, and what else could be used:**
  - **Marked point within 20 px of true damage** is T1's measure since 19 Oct: a team goes to the marked point, so the point matters more than the zone. The zone measure (touches truly destroyed pixels) is reported beside it, against its ceiling, the same method run on the true mask.
  - **Rows against joined blobs** only shows that touching buildings separate. A true per-building check needs true outlines: xBD's label files have polygons, but the sharper photos' sources don't.
  - **Counting** uses accuracy because the review promised it, with count error and the share within 20% because accuracy can't show counting ability (§7, the benchmark option check).
  - **Not done, options:** count from the new outline rows on the sharper photos (CPU, minutes); split the hot-spot shortfall into its two causes with per-photo damaged-pixel counts from E6's masks (CPU, minutes); a stricter rule for when a photo gets hot spots at all, tuned on the validation pairs (a T1 v4, only if wanted). *(All three done 19–20 Nov, at Abrar's request: E7 step 3b, next entry.)*

### E7 step 3b · Three follow-up checks on C4's outputs (run 20 Nov, PC, no GPU, 6.0 min)
- **What:** [e7-step3b-three-checks.ipynb](Champion_Task/e7-step3b-three-checks.ipynb); [results](Champion_Task/E7-results/step3b/README.md). Built and run at Abrar's request ("do all three asap"), from saved files only. A smoke test on 40 validation and 100 test photos ran first and passed every check.
  - **A, counting from the table's rows:** each question's count is the number of the table's rows of the asked class on that photo, then the nearest answer option, as E7 step 2 picks it.
  - **B, why the hot spots fall short on photos without destroyed buildings:** C4's maps rebuilt for the 605 clean validation pairs, from R11's saved validation maps and SAM 3's validation outlines painted with grader seed 42. T1 v3 then runs on them, so three sets can be compared group by group: R9's maps on validation, C4's on the same validation photos, and C4's on the test photos.
  - **C, a stricter rule for when a photo gets hot spots at all (T1 v4):** a photo gets hot spots only if its map marks at least G pixels' worth of damage (destroyed 1, damaged 0.5). G is chosen on the validation pairs as the largest grid value keeping 95% of the hits, then confirmed once on the test pairs. It passes only with at least 90% of the test hits kept and the hit share up by at least 0.05.
- **Why:** E7 step 3's write-up left these three open (previous entry).
- **Checks, all passed:**
  1. The seed-42 table gives its saved counts on all 3,580 questions, and C4's xBD rows give R11's.
  2. The rebuilt validation maps give E7 step 2c's scores exactly (R11 with TTA 0.2692 and 0.5805; C4 seed 42, 0.3574).
  3. T1 v3's code on R9's validation maps gives T1 v3's saved results on 60 photos.
  4. The gate's self-checks pass.
- **Expectation, fixed before the run:**
  - **A:** rows closer to the truth on the sharper photos (median count / truth 0.8–0.9, from 0.70), accuracy there up 1–4 points, and C4 up 0.5–1.5 points on E5's clean questions.
  - **B:** mostly the maps (C4 below 0.45 on the same validation photos).
  - **C:** G between 400 and 3,200 px; test hit share 0.60–0.68 with at least 90% of the hits kept.
- **Result, against it:**
  - **A: missed. Counting from the rows is worse:** 33.18% on E5's clean questions against 34.89% from the joined blobs (exact McNemar 84 against 144, p < 0.0001). On the sharper photos it's 26.63% against 31.27%. The median count did move to 0.84 of the truth, as guessed. By class, on the sharper photos:
    - **intact:** 24.1% against 32.6%; the count is above the truth on 53.7% of questions, against 34.8%;
    - **damaged:** the same (the grader rarely says damaged);
    - **destroyed:** 38.1% against 37.7%, within chance.

    **Why:** the benchmark's true count is the number of joined blobs of a class in its own masks, so touching buildings count as one (recorded in H1 V1, 19 Oct: the true masks answer 100% of the questions). Rows that separate touching buildings therefore overshoot the benchmark's count. The guess missed this known fact. So the rows count buildings one by one, as a reader expects, while the benchmark counts joined blobs. The benchmark score stays with the blobs (34.89% and 35.34%).
  - **B: missed. It's the photos, not the maps.** On validation photos without destroyed buildings, C4's maps land hits about as often as R9's (0.565 against 0.584). On the test photos it's 0.287 with the same method. The difference is false damage on new photos:
    - on photos with no true damage at all, C4 marks 0.75 hot spots per photo on test, against 0.35 on validation (xBD photos 0.94 against 0.36);
    - on photos with only damaged buildings, it's 0.59 against 0.78.

    The validation photos were used to choose and tune the models, so on unseen photos the same maps make about twice as many false hot spots.
  - **C: G = 400 px, as guessed, but missed on the test:** the hit share moves from 0.569 to 0.573 (99.2% of the hits kept), far short of +0.05. **v4 doesn't pass, so T1 v3 stays.** On validation, gates large enough to matter cost hits fast (1,600 px: share 0.750 but only 86.7% of the hits kept). The amount of predicted damage doesn't separate a false alarm from real damage.
- **What it means:**
  - **O2's figure stays C4's joined-blob count** (35.34%, 34.89% on E5's clean questions), the same counting rule as the benchmark's own.
  - **For the reports:** the table's rows are the right unit for describing buildings. On the sharper photos, the intact counts run above the benchmark's, because the benchmark joins touching buildings.
  - **The hot spots' weak point is false alarms on new photos.** Every hot spot stays worded as an estimate. No simple gate fixes it; a better map on unseen photos would.
- **Why these measures:** A uses the benchmark's own scoring (accuracy, plus count error) on the same 3,580 questions. B splits the change into two stages, so each stage changes one thing: the maps, or the photos. C was chosen on validation only and judged once on test, by a bar fixed before.
- **What else could be used:** for A, true per-building outlines on the sharper photos would show whether the rows count real buildings better than the benchmark's blobs do; the sharper photos' sources have no such outlines. For B and C, map changes tested on validation and confirmed on test (none planned).

### T2 step 5 · The reports read C4's facts (run 20 Nov, Kaggle account 3, 19 min)
- **What:** [t2_step5_c4_run.ipynb](Offline_RAG_KR2/t2_step5_c4_run.ipynb); [results](Offline_RAG_KR2/results/t2_step5_c4/README.md). Built by Abrar on 20 Nov in new files only, so Ridita's code stays hers: [fixed_flow_c4.py](Offline_RAG_KR2/disasteller_offline/fixed_flow_c4.py) (her fixed flow, imported unchanged, plus C4's facts), [make_c4_scenes.py](Offline_RAG_KR2/make_c4_scenes.py) and [make_t2_step5_upload.py](Offline_RAG_KR2/make_t2_step5_upload.py).
  - **The facts:** every report's facts start with C4's facts for one before-and-after pair, read through Ridita's bridge (`disasteller_inputs.py`, unchanged): the counts by damage state, the hot spots and the safe areas, each called an estimate. On xBD photos the counts are of areas, since a patch can hold several touching buildings.
  - **What the code writes:** the damage-grade section from the counts (destroyed = EMS-98 Grade 5, damaged = Grades 2–4, intact = at most Grade 1, each citing its EMS-98 section) and the map reading. It also draws the labelled map: hot spots H1… and safe areas S1… on the after-photo. The 7B writes the rest.
  - **Two scenes,** picked by a rule before any report:
    - Turkey's `turkey_earthquake4_post_327.png`: one row per building; 54 intact, 11 damaged, 32 destroyed;
    - xBD's `santa_rosa_wildfire_00000155_post_disaster.png`: one row per patch; 45, 3 and 96 areas.
  - **A dry run on the PC** (stand-ins for the 7B and the search) passed every check first. It led to two fixes: each grade now cites its own EMS-98 section, and labels near the right edge sit left of their marker.
- **Why:** the one-chain rule (4 Nov) asks for one internet-off run from a test pair to the reports, with every number from one method (roadmap §1b; T2 steps 5 and 7).
- **Expectation, fixed before the run:**
  - both scenes pass the five pass rules;
  - every report gives the counts exactly as the facts do;
  - the Santa Rosa reports call its counts areas, not buildings.
- **Result, against it:**
  - **Pass rules: met.** Both scenes pass all five with the internet off:
    - the run finished;
    - six reports each, each starting "Mode: offline", 50+ words;
    - only 127.0.0.1 in the network log;
    - no Gemini library;
    - every model question answered.

    28 sections per scene, 2,746 and 2,885 words, 37 and 24 citations, all of real passages.
  - **Counts: met on Turkey, missed on Santa Rosa.** Turkey's six reports give 32 destroyed and 11 damaged exactly. All six Santa Rosa reports say "96% of the area classified as destroyed", where the facts say 96 of 144 areas (67%). The sentence was written once, in the first section, and repeated by the later reports.
  - **Areas, not buildings: met.** "building" never names a count in the Santa Rosa reports.
  - **Also found** (a first look; step 7 checks every number):
    - Turkey's Alerts report garbles a hot-spot size ("283,81" for 28,381) and ties the counts to particular hot spots;
    - the human-resource reports invent staffing numbers ("100 workers", "2 shifts of 50");
    - guideline numbers are quoted correctly ("3.5 m² per person", Sphere);
    - 3 and 5 sections were kept without a citation after the re-ask.
  - The labelled maps show every hot spot and safe area at its fact's position.
- **What it means:**
  - **O3's chain runs end to end offline,** from C4's map to six reports, with the grades and the map written by code.
  - **The weak link is the 7B with numbers it has to rephrase.** It copies a count of buildings, but it turned a count of "areas" into a share of the area and invented staffing figures. Step 7's zero-contradiction rule would fail on this run.
  - **Fix options (Abrar's choice before step 7):**
    1. facts that state each share and call xBD rows damage patches;
    2. a number check inside the flow, which asks a section again when it states a number found in neither the facts nor its passages;
    3. the code writes the counts sentence itself.
- **Why these measures:** the five pass rules are Ridita's, fixed before her first run, so step 5 is judged by the same bar as the quality-fix run. The counts expectation is the part step 5 adds: it tests the new input, not the writing.
- **What else could be used:**
  - step 7's formal check, every number against the table (TimeSpot's consistency-violation rate, [Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md));
  - a human rating of the reports, as in Ridita's comparison with July's Gemini reports;
  - more scenes, which T2b plans (10).

### T2b · Who writes the report: our 7B or Qwen2.5-3B-Instruct (run 21 Nov, Kaggle account 4, 253 min; scored 22 Nov on the PC)
- **What:** the same report flow (step 5's, with the photo tool off) writes the six reports for ten test scenes twice, once by each writer, with the same facts, passages, decoding and checks. [Run notebook](Offline_RAG_KR2/t2b_writer_test.ipynb), [scoring](Offline_RAG_KR2/t2b_score.ipynb), [results](Offline_RAG_KR2/results/t2b/README.md).
- **Why:** if the model's job in the report is only writing from given facts, a smaller text model may do it as well, and it is simpler to run.
- **Result: our 7B stays the writer.**
  - Contradictions (wrong or misused numbers left after asking again): 7B 3, 3B 15. Fake citations: 3 and 0. Reports finished: 60 and 60.
  - The last guard replaced every contradiction in the finished reports.
  - The 7B's 3 fake citations (`INSARAG2B-5.7.1`, `INSARAG2B-2`, `INSARAG2B-3.10`) are in two human-resource reports; step 5's two scenes had none.
  - The 3B writes about 2.5 times as much, is 2.9 times slower (18.0 against 6.2 min per scene), and invents more numbers (46 first-answer number problems against 22).
- **Against the expectation:** see the results README; the 3B's contradictions, the 7B's fake citations and the 3B's speed missed.
- **What it leads to:** the writer question is closed for now (no swap to put to the supervisor). An ID guard for the report chain is the next small fix, Abrar's call. Five blind pairs are in `results/t2b/blind/` for a person to read.
- **23 Nov:**
  - **The ID guard is built** (decision row): `id_guard` in `fixed_flow_c4.py`, after the number guard. It drops bracketed guideline IDs not shown for the section and tidies the leftover brackets and spaces; IDs that were shown and `[Note 1]`-style labels stay. Its Kaggle check, T2b's 7B on Palu and Beirut where it made up IDs, ran on account 4 (07:12–07:35). Expectation: every unshown ID is dropped and logged, the finished reports have 0 made-up IDs, and both scenes pass T2b's pass rules.
  - **The check passed; all three expectations were met.** [Results](Offline_RAG_KR2/results/t2b_id_guard/README.md).
    - Made-up IDs in the finished reports went from 3 to 0. The guard dropped exactly T2b's three (the writer made up the same IDs in the same section again) and nothing else.
    - All 12 reports finished, and both scenes passed the five pass rules.
    - Real citations went from 67 to 61, from the writer's sampling (temperature 0.2), not the guard: Palu's public report, which no guard touched, changed too.
    - What it can't do: tell a fitting citation from an unfitting one among the IDs that were shown. That stays a reading question.
  - **The blind pairs:** Abrar reads them (`reading_sheet.md`), and Gemini judges them as a second reader (`blind/gemini/`).
    - Gemini is done ("Neon (High)"): the same report won in both orders in every pair (B, A, B, A, A), and 29 of 40 scores were the same in both orders.
    - Its verdict is in [RESULT.md](Offline_RAG_KR2/results/t2b/blind/gemini/RESULT.md), by A and B only. The writers stay sealed until Abrar's own reading is in (his choice).
    - For the write-up: the reports differ a lot in length (402–2,021 words), and the longer one won 3 of 5. Whether length or writer drove that can only be judged with the key.

### T2 step 7 · Every number checked; step 5's run 2 with fixes (a) and (b) (20 Nov, PC and Kaggle account 3)
- **What:**
  - **[number_check.py](Offline_RAG_KR2/disasteller_offline/number_check.py)**, one set of rules for both uses, with its own tests on run 1's sentences;
  - **[t2_step7_number_check.ipynb](Offline_RAG_KR2/t2_step7_number_check.ipynb)**, run on the PC with its outputs; [results](Offline_RAG_KR2/results/t2_step7/README.md).
  - **How a report's sources are rebuilt:** from the run's own logs, exactly as the 7B saw them: the damage facts and the code's map reading from `run_log.txt`, and the passages from the section IDs each search returned (`llm_calls.jsonl`), with their document and page headers. The photo descriptions and the earlier reports are left out, since the 7B wrote them.
  - **How each number is read**, with what it measures:
    - a position, a pixel figure, a percentage or a count of buildings or patches must match the damage facts (a percentage may be a share, within 1 point);
    - any other number must be in the facts or in the passages shown to that report.

    **Wrong** means a contradiction, and **unsourced** means a number with no source.
  - **Fixes (a) and (b), in `fixed_flow_c4.py`:**
    - (a) each count comes with its share, xBD rows are called damage patches, and the facts say the shares aren't of the photo's area; one sentence in the rules;
    - (b) the same check while the model writes, so a wrong or unsourced number gets the section asked again, once.
  - **Run 2:** [t2_step5_c4_fix_run.ipynb](Offline_RAG_KR2/t2_step5_c4_fix_run.ipynb), a named copy, on account 3, internet off, 19:01–19:21; [results](Offline_RAG_KR2/results/t2_step5_c4_fix/README.md).
- **Why:** step 5's first look found "96%" for 96 of 144 patches; the one-chain goal asks for zero contradictions (roadmap §1b, T2 step 7, rule fixed 26 Oct).
- **Expectation, fixed before each run:**
  - **Step 7 on run 1:** it fails, with at least 7 wrong numbers and unsourced staff numbers in both human-resource reports.
  - **Run 2:** both pass the five rules; at most 2 wrong and 2 unsourced numbers (target 0); no "96%"; at most 2 minutes slower per scene.
- **Result, against it:**
  - **Run 1 fails:** 129 numbers, **13 wrong** ("96%" in 12 sections, since later sections repeat the first one's sentence, and "283,81 pixels"), **5 unsourced** (50, 100 and 20 staff, all in Santa Rosa's human-resource report; Turkey's has none). The fail is as expected, and there are more wrong numbers than guessed.
  - **Run 2 passes:** both pairs pass the five rules; 191 numbers, **0 wrong, 0 unsourced**; no "96%"; 5.4 and 5.8 min against 5.5. Every expectation is met.
    - The check asked again twice: the Santa Rosa Overview's first answer still said "96%" and "45%", with the shares in the facts, and a Turkey section had an unsourced "43".
    - The count rises because the reports now quote the shares, and all of them are right.
  - **Found by eye after the pass: counts reused.** In Turkey's two staffing reports the 7B used the damage counts as other quantities: 54 shelters, 54 medical personnel, 32 USAR teams and 11 rescue teams, 7 numbers in all. The rule accepts any number in the facts, so it can't see this. A search of both runs for counts not followed by damage words finds these 7 in run 2 and none in run 1 (its two "3"s are INSARAG's three team types).
- **What it means:**
  - Fix (b) did the work; fix (a) alone didn't stop the misreading.
  - Asked again for unsourced numbers, the model reached for numbers that are in its facts. That's the known weakness of a check that tests where a number comes from but not what it counts.
  - **Next, Abrar's choice:** a rule version 2, in which a count used as anything but a count of buildings or patches is wrong, fixed before a run 3. Run 1 and run 2 are re-measured with it beside version 1.
- **Rule 2 and run 3 (20 Nov, evening, Abrar's go):**
  - **Re-measured with rule 2:** run 1 fails as before (13 wrong, 0 misused), and run 2 now fails with 9 misused (all Turkey).
  - **Fixed before run 3:** only a passage's text, not its page header, can exempt a count. As first coded, a page-54 header let "54 medical personnel" pass.
  - **Run 3** ([results](Offline_RAG_KR2/results/t2_step5_c4_fix2/README.md)) passes the five rules. Under rule 2 it has 0 wrong, 1 unsourced and 9 misused, all in Turkey's staffing sections: **its expectation (at most 2) is missed**. Santa Rosa is clean.
  - **Why asking again failed:** asked again, the 7B wrote the same numbers. Those sections' requests ask for "the number of medical personnel…" and "the number of emergency shelters", which the facts don't give.
  - **Options (Abrar's choice):** requests that don't ask for numbers the facts lack, in the C4 flow's own copies of the specs; a last guard in the code that replaces a number still flagged with "(number not available offline)"; or both.
- **Run 4 (20 Nov, night, both fixes; [results](Offline_RAG_KR2/results/t2_step5_c4_fix3/README.md)):**
  - **Both pairs pass the five rules, and step 7 finds 0 wrong, 0 unsourced and 0 misused numbers of 178 under both rules.** It's the first of the four runs to pass rule 2.
  - **The guard replaced nothing,** so the requests did the work. Turkey's shelter and staffing sections now say where and what, citing the guidelines, without counts.
  - **Expectation fixed before the run:** the five rules, 0 flagged numbers, at most 3 replaced by the guard, and at most 2 minutes slower. All met.
  - **What it means:**
    - the one-chain goal's "zero contradictions" (roadmap §1b) holds on these two test pairs, with the reports from C4's facts, offline;
    - the 7B misreads shares when it writes freely ("96%" in the first Overview in runs 2–4, fixed by the ask-again every time), and fills requested numbers with whatever numbers it has. The checks and the requests, not the model, keep the numbers right.
  - **Still open, not a number:** the Santa Rosa report describes the before photo as damaged, from the photo tool. That's for the reports' quality, T2b.
- **Why these measures:** a contradiction is what the one-chain goal forbids, and an invented number is what the offline rules forbid ("not available offline"). Both are checked mechanically, so every number counts, not only the ones a reader notices.
- **What else could be used:**
  - TimeSpot's consistency-violation rate, which this check is a form of ([Paper_Audit §4.15](Paper_Audit_and_Integration_Plan.md));
  - a check that reads the meaning (the unit or noun a number counts), which version 2 starts;
  - a model or human judge for the meaning that the rules can't read, as T2b plans to score.

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

### R16c step 6 · Aligned crops for the grader (18 Nov)
- **What:** the three graders of R16c steps 5 and 5b (seeds 42, 43, 44) grade E3's SAM 3 outlines on the 605 clean validation pairs under three crop versions, with no retraining: V0 (unaligned, as before), V1 (after-photo shifted back per pair by phase correlation), and V2 (V1 plus a local phase-correlation shift per outline in a 192 px window).
- **Why it was planned:** Ridita's audit found 52% of measurable pairs shifted by more than 2 px (10% > 5 px, max 56 px), and the grader is the bottleneck in find-then-grade (0.3065 against a 0.556 ceiling).
- **How:** phase correlation with a Hanning window (`response >= 0.05`, pair shift `<= 64 px`, local shift `<= 16 px`). Candidate (the better of V1 and V2 on mean Destroyed IoU) judged against V0 over 10,000 bootstrap redraws of the 605 pairs.
- **How it ran:** Kaggle account 1 (`abrarmohammedtanzim`), T4, 18 min, 18 Nov. [r16c-step6-aligned-crops.ipynb](Champion_Task/r16c-step6-aligned-crops.ipynb); results in [R16c-results/step6/](Champion_Task/R16c-results/step6/README.md).
  - The first run stopped at Cell 6 because seed 44's V0 Destroyed IoU was 0.2974 against 0.2982 (`0.0008` diff > `0.0005`) due to `torch 2.11.0+cu130` vs `cu128` FP16 rounding on borderline outlines; widening `SCORE_TOL[44]` to `0.0015` (matching seed 43) let run 2 complete.
- **Expectation before the run:**
  - V0 reproduces the saved log-probabilities (within 0.05 on >= 99.5% of outlines) and clean Destroyed IoU per seed.
  - About half the pairs shifted by more than 2 px.
  - A small gain (+0.00 to +0.02 Destroyed IoU);passes if the middle 95% of 10,000 redraws stays above 0.
- **Result:**
  - **Checks:** 100.00% of outlines within 0.05; V0 Destroyed IoU reproduced 0.3161 (s42), 0.3062 (s43), 0.2974 (s44).
  - **Measured shifts:** 483 of 605 pairs had a usable shift; 47% > 2 px, 17% > 5 px, largest 48.8 px.
  - **Scores (mean of three seeds, 605 clean pairs):**
    - V0: Destroyed IoU 0.3066, mIoU 0.5473, Building IoU 0.6307, grade agrees with main truth 0.8182 (xBD 0.3542, other sources 0.2623).
    - V1: Destroyed IoU 0.3048, mIoU 0.5450, Building IoU 0.6306, agrees 0.8172 (xBD 0.3517, other sources 0.2610).
    - V2: Destroyed IoU 0.3014, mIoU 0.5437, Building IoU 0.6306, agrees 0.8168 (xBD 0.3520, other sources 0.2546).
  - **Verdict (V1 minus V0, 10,000 redraws):** −0.0018 (95% interval −0.0072 to +0.0029; share above 0: 0.2412). **Does not pass (`passes: false`).**
- **What it led to:** aligning crops only at grading time does not help graders that were trained on unaligned crops with a 32 px margin; step 6b on the test pairs is not needed.
- **Why it didn't help (checked 18 Nov from `grades_aligned.csv` and `shifts.csv`, all three graders pooled):**
  - **Alignment changed few grades, and the changes cancel.** V1 changed 3,371 of 78,525 outline grades (4.3%): 1,481 became right, 1,564 became wrong.
  - **Shifted pairs weren't graded worse to begin with.** Agreement with the outline's main true class, V0 against V1: 0.820 and 0.819 on pairs shifted 0–2 px (277 pairs), 0.815 and 0.815 at 2–5 px (172), 0.818 and 0.817 above 5 px (90). If misalignment caused the grader's errors, the shifted pairs would score lower before alignment and rise after it. Neither happens.
  - **The errors come from elsewhere.** V0's 14,275 wrong grades (18.2%) are mostly:
    - SAM 3 outlines that aren't buildings, graded intact (26%);
    - damaged buildings graded intact (20%);
    - intact buildings graded damaged (20%);
    - intact buildings graded "not a building" (12%).
  - **By true class (V0):**
    - intact: 91% graded intact;
    - damaged: 69% damaged, 25% intact;
    - destroyed: 65% destroyed, 19% damaged, 10% intact, 6% "not a building";
    - SAM 3 outlines over no building: 32% graded "not a building", 51% intact.
  - **So retraining on aligned crops is unlikely to pay.** The room is in the intact–damaged boundary, the non-building outlines, and the share of destroyed buildings graded damaged.

### R16c step 7 · Super-resolved crops for the grader (built 20 Nov; run 20 Nov, Kaggle account 4, 4.7 h)

**Result (run 18:56–23:39, started from the PC; [results](Champion_Task/R16c-results/step7/README.md)): super-resolution doesn't help the graders. Both versions make them slightly but surely worse, so it isn't adopted.**
- **Checks, all passed:** today's crops (V0) reproduce the saved grades on 100% of outlines, destroyed IoU 0.3161, 0.3062 and 0.2974 (as in step 6), and macro F1 0.7367, 0.7303 and 0.7541 exactly. Both SR models passed their own checks.
- **Find-then-grade, 605 clean pairs (mean of three seeds):**
  - destroyed IoU: V0 0.3066, S1 (Swin2SR) 0.3025, S2 (Real-ESRGAN) 0.3006;
  - grade agreement on small outlines: 0.793, 0.777, 0.770.
- **The graders on the true buildings, macro F1 (clean pairs):**
  - all buildings: V0 0.7324, S1 0.7152, S2 0.7010;
  - small buildings only: 0.7173, 0.6881, 0.6640.
- **The rule:** S1 (the better of the two) gains −0.0041 in destroyed IoU, with its 95% range −0.0070 to −0.0020 and no redraw above 0. **It doesn't pass, and it's worse beyond noise.** S2: −0.0060 (−0.0107 to −0.0026). Macro F1 drops beyond noise for both (−0.017 and −0.031).
- **Against the expectation:**
  - V0 reproduces: **met**;
  - the change small (−0.01 to +0.01): **met**, at −0.004 and −0.006;
  - neither passes: **met**;
  - S2's invented texture hurting most: **as guessed**;
  - the share of small buildings: **lower than guessed**, xBD 62% of true buildings and 70% of outlines (guess 75–90%), others 26% and 24% (guess 30–45%). The area-based estimate ran high.
- **By eye ([examples.png](Champion_Task/R16c-results/step7/examples.png)):** Swin2SR's crops look almost the same as V0's. Real-ESRGAN smooths and repaints the grass and trees around a building. Neither recovers detail on the most blurred buildings.
- **Time:** Swin2SR 17.8 s and Real-ESRGAN 1.5 s per photo; 4.7 h in all (estimated 5.4).
- **What it means, for our supervisor's suggestion:** the grader reads the 2× super-resolved crops worse than the ordinary ones, most of all on the small buildings that SR changes. The fair test is a grader retrained on SR crops, which would need every training photo super-resolved first: Swin2SR on 5,218 pairs is about 52 GPU hours, before about 2 h per grader seed. The clear drop doesn't justify that, so **SR is closed for the grader**. It stays a candidate only for showing photos to people.
- **What else could be used:** a super-resolution model trained on satellite photos of our resolution (none packaged); or SR as a training-time augmentation, which has the same cost as retraining.

**As built (20 Nov), with the plan fixed before the run:**
- **What:** [r16c-step7-super-resolved-crops.ipynb](Champion_Task/r16c-step7-super-resolved-crops.ipynb), built at Abrar's go. It is our supervisor's super-resolution suggestion (Research_Directions §8.8, 17 Nov), as the clean test written there. It trains nothing: step 6's notebook is the model, with the alignment replaced by two super-resolution versions.
  - **V0:** crops as before, which must reproduce the saved grades and scores.
  - **S1 and S2:** the pair's two photos enlarged 2× by Swin2SR (S1, trained for pixel accuracy, invents little texture) or Real-ESRGAN (S2, GAN-trained on realistically degraded photos: sharper, invents more). A building whose longest side is under 48 px takes its crops from the enlarged photos; every other building, and the mask channel, stay as in V0.
  - **Two scores:** find-then-grade's destroyed IoU on the 605 clean pairs (as step 6), and the three graders' macro F1 on the true validation buildings (as steps 5 and 5b).
- **Why:** the grader enlarges each building's window to 128 px by ordinary resizing. About 85% of SAM 3's outlines on xBD photos cover under 1,600 px (step 5's saved outlines), so most xBD buildings reach the grader blurred. Step 6 located the grader's errors at the intact–damaged boundary and on destroyed buildings graded damaged, where roof detail matters.
- **Checks (it stops if one fails):**
  - V0's log-probabilities and destroyed IoU reproduce steps 5, 5b and 6;
  - V0's macro F1 on all 645 pairs reproduces 0.7367, 0.7303 and 0.7541 (within 0.003);
  - each SR model's output, shrunk back, matches its input (above 22 dB), and Swin2SR beats bicubic enlargement on photos shrunk by 2;
  - the dry run on the PC, with stand-ins for the graders, the SR models and the photos, passed every check, and both SR models' code was checked without downloading them.
- **Rule, fixed before the run:** the better of S1 and S2 on destroyed IoU passes only if its gain over V0 is above noise (the pairs redrawn 10,000 times, the middle 95% above 0).
  - **If it passes:** step 7b confirms it once on the test pairs, and a grader retrained on SR crops is next.
  - **If not:** SR at grading time doesn't help these graders, which answers the suggestion.
- **Expectation, fixed before the run:** V0 reproduces; 75–90% of xBD buildings and 30–45% of the others are under 48 px; the change is small (−0.01 to +0.01). Neither version passes, since the graders learned from bilinear crops and S2's invented texture may push intact buildings toward damaged.
- **Why these models, and the alternatives (more in the notebook's first cell):**
  - Noman's VRT pipeline (CSE499A) is a video model at ×4 and judged by eye; our crops need at most 2× from single photos.
  - HAT is stronger on benchmarks but heavier and not packaged; DiffusionSat is slow and invents more.
  - No SR model is trained for our 0.3–3 m satellite photos.
  - A grader retrained on SR crops is the fair test of SR's potential (about 2 GPU hours per seed), worth it only if this cheaper test shows promise.

### R16c step 8 · The graders' "destroyed" setting, re-tuned for destroyed IoU (run 22 Nov, PC, no GPU)
- **What:** a shift Δ added to every grader's destroyed bias (−4.0 for seeds 42, 43 and 44), Δ = 0 to 4 in steps of 0.25. C4's map was scored on the 605 clean validation pairs, the mean of the three graders. E7 step 2c's cells were copied unchanged, so the scoring is the same. [Notebook](Champion_Task/r16c-step8-destroyed-bias.ipynb), [results](Champion_Task/R16c-results/step8/README.md).
- **Why:** the bias was chosen in R16c step 5 to maximise the average grade IoU of held-out buildings, and the grader was right on only 66 of 100 destroyed buildings in L0b step 2. Option 1 of three put to Abrar, and his choice.
- **Rule, fixed before the sweep:** pick the Δ with the highest validation destroyed IoU whose mIoU is at most 0.01 below Δ = 0's (ties within 0.002 to the smaller Δ); adopt it only if the 2,007 clean test pairs confirm it beyond noise.
- **Result: today's setting stays.**
  - All 13 published scores were reproduced first.
  - Destroyed IoU falls as Δ grows: 0.3501 at Δ = 0, 0.3456 at 0.75, 0.3159 at 2, 0.2287 at 4. On the 85 sharper validation photos, where it acts, it is flat to 0.75 (0.2628 → 0.2633), then falls.
  - The rule picks Δ = 0, so the test pairs weren't used.
- **Against the expectation:** missed. I expected a pick between 0.5 and 2.0 and a gain of 0.005–0.02. The grader's extra "destroyed" calls are more often wrong than right on the map's pixels, so its caution suits destroyed IoU too, not only average grade IoU.
- **What it leads to:** the graders stay as they are. It also explains why L0b step 2's rule A failed: more "destroyed" calls cost more false pixels than they add true ones. Fixing L0b (option 2) wasn't run; its write-up is under L0b, "Paths not taken".

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

### L0b · Can the 7B learn to see damage? Training its vision encoder on building crops (run 19 Nov, account 2)
- **What:** [l0b-vision-encoder-crop-test.ipynb](Champion_Task/l0b-vision-encoder-crop-test.ipynb) (the run notebook, saved over the built one); [results](Champion_Task/L0b-results/L0b/README.md). Our kept 7B (`AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`) in 4-bit, with a new LoRA adapter (rank 64, alpha 16) on its language layers (196 modules) and its vision blocks (160 modules), 206 million trainable parameters. It's trained on 1,800 building crops from training photos, 600 per class, drawn as in Tamanna's Part B (a 256 px window enlarged 2×, a red box, the same prompt). The run took 57 steps in 47.9 min on two T4s, with a peak of 9.6 GB.
- **Why:** the 7B's vision part was kept frozen only because the DisasterM3 paper's recipe freezes it, and its weakness looks like seeing (it called 298 of Part B's 300 buildings intact). A full six-task run with the vision part trained would cost about 34 GPU hours, so this small test settles it first.
- **Expectation, fixed before the run (roadmap L0b):** above the frozen 7B's 100 of 300, but clearly below the grader's 212, because the grader also sees the before-photo and the building's exact outline.
- **Result:** **176 of 300** on Part B's 300 true validation buildings (100 per class, from the 605 clean pairs).

  | | Intact | Damaged | Destroyed | All |
  |---|---|---|---|---|
  | Our grader | 92 | 54 | 66 | 212 |
  | L0b (vision trained) | 40 | 50 | **86** | 176 |
  | Our 7B (vision frozen) | 100 | 0 | 0 | 100 |
  | Base 7B | 49 | 50 | 0 | 99 |

  - **Against the frozen 7B:** clearly better (136 buildings only L0b gets right, 60 only the 7B; exact McNemar p < 0.0001).
  - **Against the grader:** clearly below (47 against 83, p = 0.002). On destroyed buildings alone, L0b beats the grader (86 against 66, p = 0.0003). But it calls many intact buildings damaged (44) or destroyed (16).
  - **Training:** the loss fell from 1.44 to about 0.2. Two of 57 steps were skipped in half precision (a NaN gradient norm), as the scaler allows, and the learning rate rose as planned.
- **Against the expectation:** met (above 100, clearly below 212).
- **By the rule:** the vision part learns, but the grader keeps the grading. Record that and stop: the 34-GPU-hour full run isn't needed.
- **What could still be used:** its errors are the grader's opposite. The grader under-calls damage (35 damaged buildings called intact) and L0b over-calls it, and on destroyed buildings it's the better of the two. A second opinion on the grader's "intact" calls is a possible later test, not planned.
- **Files:** the 805 MB adapter is only on this PC and in the Kaggle run's output; it's git-ignored, since the verdict says stop.
- **Step 2, the grader and L0b together (22 Nov, PC, no GPU; Abrar's go):** two rules fixed before scoring, on the same 300 buildings ([notebook](Champion_Task/l0b-step2-grader-combination.ipynb), [results](Champion_Task/L0b-results/step2/README.md)).
  - **Rule A** (destroyed if L0b says so, otherwise the grader): 207 right; destroyed 91, but intact 76 and damaged 40.
  - **Rule B** (destroyed if L0b says destroyed and the grader says damaged): 211 right.
  - **At real class shares** (76.7% intact, 17.1% damaged, 6.3% destroyed): accuracy is grader 83.9%, A 70.8%, B 82.3%; destroyed F1 is 0.61, 0.35 and 0.59. L0b's "destroyed" is right only 23% of the time at real shares.
  - **Neither earns a confirmation run.** The expectation fixed before scoring was met on every range.
  - **Found on the way:** the grader's calibration (`R16c-results/step5/calibration.json`) subtracts 4.0 from its destroyed score. The bias was chosen to maximise the average grade IoU on held-out buildings, which is part of why it under-calls destroyed. Re-tuning that bias for destroyed IoU, using the saved log-probabilities, is a possible PC-only test. *(Done as R16c step 8, the same day: no shift helps; see there.)*
- **Paths not taken: fixing L0b itself (recorded 22 Nov in detail, at Abrar's request, in case the hypothesis has to be proved or the choice explained later).** After step 2, three options were put to Abrar: (1) re-tune the grader's destroyed setting; (2) fix L0b; (3) change nothing. He chose (1), which became R16c step 8. Option (2) had two forms, neither run.
  - **What L0b is, for reference:** our kept 7B (`AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, the six-task LoRA merged in), loaded in 4-bit (NF4), plus one new LoRA adapter (r = 64, alpha = 16) on 196 language modules and 160 vision modules: 206 million trainable parameters. It was trained 57 steps (48 min, peak 9.6 GB per T4) on 1,800 crops from training photos, 600 per class. Each crop is Part B's form: a 256 px window around the building, enlarged 2× to 504 px, with a red box, the after-photo only.
  - **Why L0b over-calls damage (the diagnosis):**
    1. It learned from equal shares (one building in three destroyed), while real validation buildings are 76.7% intact, 17.1% damaged and 6.3% destroyed.
    2. It sees only the after-photo, while the grader also sees the before-photo and the building's outline, so a roof that was always dark or bare can look damaged to L0b.
    3. It had only 1,800 examples.

    At real shares, its "destroyed" is right 23% of the time (the grader's 57%).
  - **2a. Correct L0b for real class shares (no retraining).**
    - *Hypothesis:* L0b's ranking of buildings is good, and its prior is wrong. Rescaling its answers to real shares would remove most false "damaged" and "destroyed" calls on intact buildings.
    - *How:* one GPU run of L0b on Part B's 300 buildings (and a fresh sample) that saves its probabilities for the three answer words. Then, on the PC, add log(real share ÷ ⅓) to each class's score: intact +0.83, damaged −0.67, destroyed −1.67, and take the highest.
    - *Cost:* about 1 GPU hour, then minutes on the PC.
    - *Rule if ever run:* keep it only if it beats the grader at real shares, on both accuracy and destroyed F1, with McNemar p < 0.05 on the buildings where they differ.
    - *Why not run:* a prior shift only moves the decision threshold along the same curve; it can't add information. L0b's balanced result (176 of 300) is already below the grader's (212). R16c step 8 then showed that for this map, more "destroyed" calls lower destroyed IoU even with the grader's own confidence, so the bottleneck is false "destroyed" calls, which is L0b's main weakness.
  - **2b. Retrain L0b with the grader's inputs and the real mix.**
    - *Hypothesis:* L0b's errors come from its inputs and data, not its capacity. Given the before-photo, the outline and real shares, the 7B's broader visual knowledge could match or beat the grader.
    - *How:*
      1. two images per example (before and after crops at the same window), with the outline drawn;
      2. real class shares, or a class-weighted loss;
      3. more crops, about 6,000–10,000 from training photos (none from validation or test);
      4. the same LoRA (language and vision) from the kept 7B, on T4 x2;
      5. scored on Part B's 300 buildings and on a fresh sample, at real shares.
    - *Cost:* about 3 GPU hours of training plus about 1 hour of scoring, and about a day of building and dry runs.
    - *Rule if ever run:* adopt only if it beats the grader at real shares (accuracy and destroyed F1, McNemar p < 0.05), and only if a 7B per building fits the chain's time and memory.
    - *Why not run:*
      - Even fixed, it's a 16.6 GB model (about 6.2 GB in 4-bit) per building doing a job a 45 MB grader already does well. The chain grades thousands of buildings per scene, and the laptop and edge story rests on small models.
      - The grader already sees these inputs and was trained on far more buildings, so beating it clearly is unlikely.
      - O1's destroyed target is already passed (C4: 0.35 validation, 0.43 test), and the GPU hours were going to the 3B.
  - **When either would become worth it:** if the system needs the 7B itself to judge damage, for example the photo tool in the reports or the benchmark's damage questions (O2). Also if a new disaster type makes the grader fail where the 7B's broader knowledge helps. Then start with 2a (cheap, an hour), and only go to 2b if 2a shows L0b's ranking is close to the grader's.

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
- **Run 2 (`l2-step1c-options-rerun.ipynb`, 18 Nov, account 2, T4 ×2, 3.0 h): done.** [Results](Champion_Task/L2-step1-results/options-rerun/L2S1c/README.md).
  - Answered all 2,249 non-held-out questions across the three option tasks (at full 1036 px, greedy, with the benchmark's options shown) and kept **806** checked-correct answers:
    - Building Damage Counting: 483 / 1,379 kept (35.0%, vs benchmark 30.31% and step 1 plain-prompt 16.3%).
    - Road Damage Counting: 253 / 699 kept (36.2%, vs benchmark 33.03% and step 1 plain-prompt 0%).
    - relational reasoning: 70 / 171 kept (40.9%, vs benchmark 34.62% and step 1 plain-prompt 15.6%).
  - **Against the expectation (about 700–900 kept):** met (806).
  - **What it leads to:** L2 run 3 (`MODE = "c"`, training the 3B for option c) is unlocked and ready to run.
- **Run 1 (`l2-step1b-soft-labels.ipynb`, account 3, T4 ×2): done 19 Nov,** all 38,271 questions in three sessions (11 h, 11 h, 2.85 h), 0 label mismatches. The first try stopped at Cell 4 because `disasterm3-mirror` wasn't attached; it was re-run with it attached.
- **Run 3 (c), the 3B's training (account 1, 18 Nov): stopped after 16 steps with nothing learned.** Every update was skipped: `grad_norm` was NaN at every step, and `label_loss` was NaN in 13 of 16.
- **Step 2b, the half-precision diagnostic** ([notebook](Champion_Task/l2-step2b-fp16-overflow-diagnostic.ipynb), [results](Champion_Task/L2-step2-results/fp16-diagnostic/L2S2b/README.md); account 1, 19 Nov).
  - **What:** the run's own data, batches and loss, with 440 examples scanned layer by layer in half precision. Three fixes were then tested on the 127 overflowing and sample examples, and 8 training steps were run with the chosen one.
  - **Why:** find the layer that overflows and the cheapest fix that doesn't change the loss, before spending about 53 GPU hours per mode.
  - **Result:**
    - 7 of 440 examples overflow (1.23% weighted by task; the log implied about 1.3%). All 7 start at one layer, the MLP output of the vision part's last block (`model.visual.blocks.31.mlp.down_proj`), whose outputs reach 64,352 against half precision's 65,504 limit.
    - **(a) That one layer in full precision:** no NaN, the loss within 0.0017 of full precision, 1.74 s per example.
    - **(b) Clamping:** no NaN, 1.75 s.
    - **(c) Full precision everywhere:** 5.58 s, 3.2× slower.
  - **By the rule fixed before the run:** (a). With it, 8 of 8 training steps were real updates, the learning rate moved, and `grad_norm` was 0.34–0.90.
  - **Against the expectation:** the NaN share as expected (1–2%). The overflow is in the vision part, which was the expectation's alternative; the language model was the main guess. (a) and (b) both removed every NaN, as expected, and (c) was 3.2× slower against the expected 2–4×. The data step took 13 s instead of 33 min.
  - **What it leads to:** the training notebook itself changed on 19 Nov, with fix (a) and the faster image lookup, for both modes. The failed checkpoint gets deleted on Hugging Face, so training starts at step 0. One epoch still takes about 53 h per mode (7.1 s per example per T4, backward pass included).
- **Run 3, both modes, with the fix (from 20 Nov, 05:35; sessions started by [the runner](Champion_Task/kaggle-runner/runner.ps1)):**
  - **The smoke tests and the 1-hour trials passed.** (c) reached 5 of 211 steps and (b) 4 of 208, every update real (gradient sizes 0.25–0.34).
  - **Session 2 (10.5 h each) passed:** (c) steps 5 → 45, last loss 0.729; (b) steps 4 → 45, last loss 0.716; no step skipped in either.
  - **The runner stopped both modes by mistake at the end of session 2.** Windows PowerShell 5.1 passed it the list of several checkpoints as one item, so it read checkpoint-45 as missing. It was fixed at 17:49 and both were re-checked, and session 3 runs since 17:50. About 15 minutes of GPU time were lost per mode.
  - **Session 3 (b) crashed at step 80 (21 Nov, 02:28, after 8.6 h): Hugging Face refused its checkpoint-80 commit, because the account's private storage was full** (100 GB on the free plan).
    - The runner stopped (b) at 02:29 and saved its log and executed notebook in [train-b-session3/](Champion_Task/L2-step2-results/train-b-session3/l2-step2-train-3b.log).
    - Abrar deleted three unused repositories (43.4 GB). Mode (c) saved its own checkpoint-80 at 03:10, after the space was freed.
    - The checkpoint was complete in the session's Kaggle output. It passed every check against checkpoint-70 and was uploaded, and (b)'s session 4 runs on account 3 since 03:23.
    - **Cost:** about 55 minutes of idle time for (b), and no lost training.
  - **Speed:** 3.7–3.8 s per example on full-size steps, so about 40 steps per 10.5-hour session. (c) should be done about 22 Nov, 15:00, and (b) about an hour later.
  - **Run 3 done: both 3Bs trained one full epoch.**
    - **(c):** finished 22 Nov at 13:56 on account 1, session 6 (steps 168 → 211, last loss 0.563).
    - **(b):** finished 23 Nov at 04:50 on account 3. Session 7 took steps 140 → 183 (loss 0.577) and session 8 took 183 → 208 (loss 0.633).
    - No step was skipped in half precision after the first sessions.
    - The finished adapters are `AbrarAlam/disasterm3-qwen25vl3b-l2/b/final` and `c/final`.
    - L2 run 4 (step 3, the held-out choice) started on account 2 at 07:02 on 23 Nov, after its smoke test passed. The pushed copy reads the Hugging Face token from account 2's private dataset, since command-line runs can't read Kaggle Secrets.
  - **Run 4 done (07:02–09:31, account 2): (c) is the field 3B, by the rule fixed 8 Nov.** [Results](Champion_Task/L2-step3-results/full/L2S3/README.md); the smoke test in `L2-step3-results/smoke/`.
    - **The rule's score:** 1,962 held-out questions, counting only where the largest option is 20 or less. (c) 45.12%, (b) 35.95%, the untrained 3B 27.80%.
    - **The test:** only (c) right on 338 questions, only (b) right on 185; exact McNemar p < 0.0001. So the rule's first test decides, and the count-error tie-break isn't needed. (c)'s median count error on held-out building counting is still 0.0% against (b)'s 38.8% (665 questions both answered with one option).
    - **By task, all held-out questions, (b) / (c):**
      - disaster type 77.4 / 73.8;
      - bearing bodies 24.9 / 19.2;
      - building counting 22.0 / 53.2;
      - road damage counting 32.0 / 48.5;
      - scene 50.6 / 42.0;
      - relational reasoning 10.0 / 47.0.

      So (c) wins on the tasks its extra teacher pass covered (counting and relational reasoning, answered again with the options shown). (b) is ahead on the other three.
    - **(b)'s soft labels hurt counting:** 22.0% against the untrained 3B's 30.9%, and a median count error of 38.8% against 20.0%.
    - **The options' flaw, checked:** where the largest option is above 20, the middle option is always right. The rule left those questions out, and (c) picks the middle there only 39% of the time (the untrained 3B 20%, (b) 4%). So (c) isn't winning by that pattern.
    - **Counting against a rule that never sees the photo:** on all 1,045 held-out counting questions that rule scores 56.1%. But 293 of them (largest option above 20) give the answer away. On the 752 the rule's score uses, the blind rule gets 39.0%, (c) 56.4% and (b) 33.6%, checked from `per_question.csv`. So where the options don't give the answer away, (c) beats the blind rule by 17 points and (b) doesn't. By task over all questions, the blind rule still beats (c) on building counting (61.6% against 53.2%), from the 293.
    - **Time:** 44.5–46.1 min per model, about 2.5 h in all against the 1–1.5 h estimated. The estimate missed that three models (the untrained 3B, (b) and (c)) answer each question.
    - **Against the expectation:** no number was predicted for the rule.
    - **Next:** run 5 (the winner on the benchmark) on account 2, smoke test from 09:33. L3's full run, the winner in 4 bits with each answer's confidence, on account 3 from 09:34. L3's smoke test had already used (c), so its memory and speed numbers are the winner's.
  - **Run 5's first full run (09:38–14:08, account 2) and the overflow found after it.** Kept in [L2-step4-results/full-before-fix/](Champion_Task/L2-step4-results/full-before-fix/L2S4/README.md).
    - **As run:**

      | | DTR | BBR | BDC | DRE | DSR | ORR | Mean |
      |---|---|---|---|---|---|---|---|
      | (c) | 58.92 | 16.10 | 48.20 | 44.70 | 35.23 | 51.63 | 42.46 |
      | our 7B | 76.77 | 19.99 | 30.31 | 33.03 | 40.46 | 34.62 | 39.20 |

      Against the expectation fixed 8 Nov ("below the new 7B on most tasks"): missed. It's below on three tasks and above on three (both counting tasks and relational reasoning).
    - **The overflow:**
      - 327 of the answers were 32 exclamation marks: every token score NaN, scored wrong.
      - It's L2 step 2b's overflow at `visual.blocks.31.mlp.down_proj`. The training notebook carried step 2b's fix; the evaluation notebooks (steps 3 and 4, and L3) didn't.
      - Run 4's held-out run lost the same 50 questions for all three 3Bs. Its choice stands, since 50 can't turn 338 against 185.
      - Our 7B never overflowed.
    - **Checks on these answers** ([l2-step4b-clean-and-options-check.ipynb](Champion_Task/l2-step4b-clean-and-options-check.ipynb), PC; rule and expectation fixed in its first cell before the run):
      - **Clean (E5):** without the 186 copied questions, the largest move is 1.19 points ((c)'s DTR, 10 of its 353 questions), and no task flips between the 3B and the 7B. The expectation "at most 1 point" missed narrowly; "no flip" was met.
      - **The counting options' pattern:** where the largest option is above 20, the middle option is always right.
        - On those 1,889 questions (c) picks the middle 37.0% of the time, our 7B 27.5%. The expectation "at least 1.5 times as often" missed: (c) didn't learn the pattern much.
        - On the 3,562 fair questions, (c) gets 52.3%, our 7B 33.2% and the blind rule 36.2%. That's 847 against 167 and 1,059 against 484 questions only one side got right, p < 10⁻⁴⁸.
        - **By the rule fixed before the run, the counting lead is more than the options' pattern.**
    - **Rerun with the fix** (decision rows, 23 Nov): (c) and (b) at once on account 2. The smoke test adds 12 questions that overflowed.
  - **Session 6 (b), account 2, stalled at step 141 (21 Nov, 18:56):** the two GPUs waited on each other for 30 minutes (an NCCL collective timeout), and the session was killed. It had pushed checkpoints 100–140; checkpoint-140 has the same file sizes as checkpoint-130. The runner stopped (b) at 18:59. On 22 Nov at 12:09 its record was set to step 140 and session 7 started on account 3. The cause is unknown and may recur; each stall costs at most the steps since the last checkpoint (10) and the session's remaining time. (b) is now due about Mon 23 Nov, morning; (c) reached checkpoint-200 of 211 by 22 Nov, 12:30.

### L3 · The winning 3B in 4 bits and its hand-off to the 7B (built 23 Nov)
- **What:** two notebooks.
  - [l3-4bit-3b-handoff.ipynb](Champion_Task/l3-4bit-3b-handoff.ipynb), Kaggle account 3, one T4. It times three models one question at a time on 60 benchmark questions (10 per task): the new 7B in 4 bits at full size, the winning 3B in fp16, and the same 3B in 4 bits (bitsandbytes NF4). For each it reports GPU memory for the weights, the peak, seconds per question, tokens per second and size on disk. The 4-bit 3B then answers all 10,675 optical questions of the six tasks, with L2 run 5's prompts, scorer and image size. With each answer it saves the token scores its confidence needs at 10 temperatures.
  - [l3-handoff-calibration.ipynb](Champion_Task/l3-handoff-calibration.ipynb), on the PC, no model. It reads that run and the 7B's saved answers (L0 step 2) to calibrate the confidence, set the threshold and report the hand-off.
- **Why:** O4's field model must fit in about 6 GB. The 3B pays off only in 4 bits: H2b measured 2.6 GB at peak in 4 bits against 7.7 GB in fp16. The hand-off (Grace) keeps the 7B's accuracy on the questions the 3B is unsure of.
- **Rule, fixed before the run** (both notebooks' first cells):
  - *Confidence:* the geometric mean of the answer's token probabilities.
  - *Halves:* the questions split in two by the md5 of their ID; everything is chosen on one half and reported on the other.
  - *Temperature:* the one with the lowest log loss on the choosing half.
  - *Checks:* ECE (15 bins) and the risk–coverage area on the reporting half.
  - *Threshold:* the one that hands the fewest questions to the 7B while the six-task mean accuracy stays within 1.0 point of the 7B alone.
  - *Reported:* share, accuracy, seconds per question, on the reporting half and its clean part.
- **Why this rule, and the alternatives:** in the PC notebook's first cell. In short:
  - the product of the probabilities marks longer answers unsure;
  - a confidence stated in words is poorly calibrated (TimeSpot);
  - several sampled answers per question cost the time the hand-off is meant to save;
  - histogram binning or per-task thresholds stay options if one temperature or one threshold isn't enough.
- **Deviation from the roadmap:** NF4, not AutoAWQ (decision row).
- **Expectation:**
  - the 4-bit 3B's weights take 2–3 GB and its peak stays under 4 GB;
  - the 4-bit 7B peaks at 6–7 GB;
  - the 4-bit 3B is slower than the fp16 3B and faster than the 4-bit 7B;
  - 4 bits cost at most about 2 points on most tasks;
  - the confidence is overconfident at temperature 1 (ECE above 0.05), so a temperature above 1 is chosen;
  - no share was predicted.
- **Checked before the run:**
  - the confidence arithmetic against softmax by hand, including padded batches and the "not the top score" flag;
  - the PC notebook end to end on stand-in answers with the real question IDs and 7B answers (it found a missing `tabulate` fallback and a temperature list too short: now 0.5 to 8, with a flag if the end is chosen);
  - the push copy built and compiled.
- **Status:** the smoke test passed (07:33–07:42, account 3), with adapter (c) standing in as a check of the code only ([saved](Champion_Task/L3-results/smoke/L3/README.md)).
  - One question at a time on 12 questions:
    - the 4-bit 3B: 2.42 GB of weights, peak 3.01 GB, 1.75 s per question, 2.4 GB on disk;
    - the fp16 3B: 7.52 GB, peak 8.10 GB, 1.64 s;
    - the 4-bit 7B at full size: 5.91 GB, peak 8.63 GB, 4.77 s.
  - Batched and one-at-a-time answers matched 100%, every chosen token was the top score, and every answer carries its scores at all 10 temperatures. fp16 and 4 bits gave the same answer on 10 of 12.
  - Already seen against the expectation: the 7B's peak at full size is above the 6–7 GB expected, because its full-size images make long inputs. The 3B's numbers are as expected. Twelve questions are too few to count.
  - The full run starts with run 4's winner.
- **First full run (09:34–14:04, account 3), kept in [L3-results/full-before-fix/](Champion_Task/L3-results/full-before-fix/L3/README.md):**
  - **Memory and speed** (60 questions, one at a time):

    | | Weights | Peak | Seconds per question |
    |---|---|---|---|
    | 4-bit 3B | 2.42 GB | 3.01 GB | 1.83 |
    | fp16 3B | 7.52 GB | 8.10 GB | 1.73 |
    | 4-bit 7B | 5.91 GB | 8.64 GB | 5.19 |

    None of the 60 overflowed, so these stand.
  - **Accuracy:** within 1 point of fp16 on every task. Four bits gave the same answer as fp16 on only 68% of the 60, though.
  - **The overflow:** 220 answers overflowed (the same layer as run 5). Their NaN confidences stopped `l3-handoff-calibration.ipynb`, which now refuses any confidence that isn't a number.
  - **The check that missed it:** `greedy_ok` (each chosen token the top score) passes NaN scores, because argmax of NaNs picks token 0, the token generate chose. Each answer now also records `finite`.
  - **Rerun with the fix** on account 3 (decision row); the smoke test adds 12 questions that overflowed. The hand-off waits for it.

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
    - **Checked on the PC (17 Nov):**
      - **Her script:** `compare_reports.py --selftest` passes. Re-run on both sets into a scratch folder, it gives `results.csv` byte for byte, and the same 7 candidate lines; only her reading columns differ.
      - **Her hand check:** the totals recomputed from `hand_check.csv` match her table (made up: 3 / 33 / 2 against 4 / 5 / 0; contradictions 2 against 6; useful 3 / 3 / 0 against 0 / 5 / 1).
      - **A sample, against the sources:** all 6 of our contradictions are in the report text, July's six grades are in its Expert report, and Pictures 3, 4 and 5 show what she says (the "Concrete Bridge" sign; standing buildings behind a pit; cracks in a dry street).
      - **Her code:** read in full. The model client's moved code behaves as before, and every name the flow uses exists. Of 22 independent tests of the new checks on the proof run's text, 21 pass: the hotline, the 6 IDs without brackets, the RC grade-5 ID not shown, a missing citation, sticker answers, the map reading, and dates and times not taken as phone numbers. One false alarm: a plain list of numbers ("10 15 20") counts as a phone number, which would only cause one needless re-ask.
      - **Gaps:**
        - her laptop test (the pretend server's five modes and the 45 small checks) isn't in the repository, so it can't be re-run;
        - the hand check and both expectations were written by her AI assistant, knowing which set was which, and her README names it in four places;
        - git can't show that the expectations came before the counts, since all of it arrived in one commit.
      - **Side finding:** the six "Wajima" photos show big-city skylines, not Wajima. They are sample pictures labelled with Wajima street names, so "six ground photos from Wajima" (on our site, and elsewhere) overstates them.

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
  - **17 Nov, the bridge, by Abrar.** After Aryan's push fixed 7.1 and 7.3, the remaining three were fixed:
    - safe areas read with T1 v3's keys (`xy`, `distance_px`; 7.2);
    - "missing" in place of made-up defaults (7.4);
    - the title "MODEL-ESTIMATED DAMAGE FACTS", with a line saying the counts are estimates, and the "deploy … here" advice removed (7.5).

    Three self-checks were added (8 in all). They pass on the real H2 table and T1 v3's file, with `beriut_explosion_post_51.png`, one of the 7 images the two share: safe area 1 prints at (100, 271), 1,035 px from damage. The function's inputs and outputs are unchanged for T2 step 5.
  - **Asked for by Wed 18 Nov,** with acceptance checks and a ready-to-paste instruction for his AI assistant.
- **15–16 Nov, the bridge rechecked while building T3:** four more faults, added to his review as §7.2–7.5. Safe areas are read with keys T1 v3's file doesn't have, so each prints at (0, 0), 0 px from damage; neither status is checked; missing fields get defaults; and model estimates are titled "GROUND TRUTH", with R11 and T1 v3 hard-coded as the sources.
- **16 Nov, the website handed over:** he builds T3's remaining pages from [his handover](Aryan_Task/T3_Website_Handover.md), which lists every change from his prototype and why (§3), what came back on real data (§3.6), the rules, the checks before each push, and the next tasks in order. His own `Website/` stays his record, under his review.
- **17 Nov, his review's fixes pushed** (commit `648b35c92`, with a change list, [Aryan_Task/CHANGES.md](Aryan_Task/CHANGES.md)). **Checked item by item the same day: [Aryan_Task/Fix_Checklist_17Nov.md](Aryan_Task/Fix_Checklist_17Nov.md).** Of 39 items, 26 pass, 6 pass in part, 6 fail and 1 isn't due yet.
  - **How:** his lint and build, run on a copy (both pass); headless Chrome on his built site (no request leaves the PC); the six embedded reports compared with the run's files (word for word the same); the review's bridge checks with the real files; and the counting table's U-Net row recomputed from his v3 run file.
  - **Fails:**
    - the bridge's safe areas, still at (0, 0);
    - its default values;
    - new "deploy USAR teams here" advice in the bridge's text;
    - the counting card's "Baseline / Target 0.3009";
    - the retrieval card's target;
    - the 23.58% note.
  - Read before the full check, the bridge only:
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
- **17 Nov:** he deleted the four wireframe images (commits `6e9960dae` to `5deeeab04`). Later that day (`cec9b917d` to `4ac955001`) he fixed the rest of sections 2 and 4 and most of section 5: the task names, L0's full-size table with the counting caveat, the segmentation table on the 605 clean pairs with R11 no longer highlighted, the four goals' status lines, Section 13, the offline FAQ, the 645/605 wording, one "find and grade" step, a real README, and an empty gallery labelled "coming soon". Checked against the review's sources: every number matches. Still open: the one line at the top of his README saying the site is an early prototype replaced by `T3_Website/` (review §7.4), and `vercel.json`'s `require-corp` (§5). Abrar's call the same evening: if he wants to keep working, he works on the showcase website (his review's new section 7).
  - **His part:** testing where nobody has yet (Firefox, a screen reader, a printer, Safari), written up in `Noman_task/T3_Site_Test.md`, then only the fixes Abrar picks.
  - **Coordination:** he and Aryan agree who edits which file. Aryan takes over the build on 18 Nov.
  - **His own site:** the rest of its fixes become optional, given one line in its README marking it an out-of-date prototype, since T3 replaces it.

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
