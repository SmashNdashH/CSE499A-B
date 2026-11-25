# Repository review (started 24 Nov 2026)

Our supervisor asked us to go through every part of the code and the GitHub repository. This file records what the review finds and what is fixed, so the whole team can see it. Nothing here changes a file by itself: each fix is applied in a batch on Abrar's go, and a finding in a teammate's folder goes to that teammate.

## How the review works

| Step | What it checks | Status |
|---|---|---|
| 1. Automatic checks | Every link in every document and notebook (against what is on GitHub, not just on Abrar's PC, headings included); tokens, keys and e-mail addresses; local folder paths and AI-tool traces; notebooks with error messages or no outputs; tracked files over 20 MB and junk files | **Done 24 Nov** |
| 2. Read-through | Every folder in the order a reader meets it: the README, the core documents, `Champion_Task/` task by task, the reports (`Offline_RAG_KR2/`), the website, Layer 3, the teammates' folders, then `support/`, `data/`, `dataset/`, `others/` and the top level. For each piece of code: what it does, its inputs and outputs, and whether its README matches its outputs | Next |
| 3. Numbers | The headline numbers in the README, the tracker's goals, the beginner's guide and the weekly update, checked against the CSV and JSON files they come from | After step 2 |
| 4. A user's view | The website built and used page by page with the real data; whether the README tells a reader how to run one photo pair through the whole system | After step 3 |

Notebooks are not re-run: most need Kaggle GPUs. Their saved outputs and results files are checked instead.

## Step 1 in numbers

| Check | Result |
|---|---|
| Files tracked by git | 12,134 (`Essential_task_delegation/` 8,908, `data/` 2,947, `support/` 184, `others/` 60, `dataset/` 20, 8 at the top level) |
| Links checked | 1,705 in 188 documents and the notebooks' text cells |
| Links that don't work on GitHub | **38** (below) |
| Tokens, keys or passwords | **None found** (Hugging Face, GitHub, Kaggle, OpenAI-style, Google and AWS key patterns, and private keys) |
| AI-tool traces | 59 lines in 9 files (below) |
| Local folder paths | 118 lines in 27 files, mostly in notebook outputs run on Abrar's PC |
| E-mail addresses | 1, in a teammate's report |
| Notebooks | 175: 15 with an error message in their outputs, 15 with no outputs at all (below) |
| Files over 20 MB | 10, the largest 47.1 MB (all under GitHub's 100 MB limit) |
| Junk files (`.DS_Store`, `__pycache__`, checkpoints, temporary files) | None |

## Findings

Ranked: **broken** (doesn't work for a reader), **wrong** (says something untrue), **unclear**, **tidy-up**. "Owner" is who fixes it.

### Broken links

| # | Where | Problem | Fix | Owner |
|---|---|---|---|---|
| B1 | `README.md`, line 1 | The link to the weekly updates (`#weekly-updates-and-presentations`) misses the section's number | `#5-weekly-updates-and-presentations` | Abrar |
| B2 | `Task_Ledger.md`, line 35 | The link to section 9 uses its old heading | The current anchor, `#9-teammates-work-what-we-use-reviewed-26-oct-follow-ups-checked-28-oct` | Abrar |
| B3 | `Paper_Audit_and_Integration_Plan.md`, line 63 | Links a file that was never committed (`pathways to still try (Consolidated_Audit_Report).md` at the top level) | Commit it, or drop the link | Abrar |
| B4 | `Paper_Audit_and_Integration_Plan.md`, line 94 | Links a folder kept off GitHub (`others/lit review_research papers/BDAChat_repo/`) | Link the paper's own repository instead | Abrar |
| B5 | `Progress_Tracker.md`, lines 1399 and 1407 | Link update 2's `.tex` files, which are kept off GitHub | Link the PDFs, or plain text | Abrar |
| B6 | `Archive/mIoU_vs_Recall_Talking_Points.md`, lines 15 and 24 | `Ablation_Study_Reference_and_QA_Prep.md` is one folder up | `../Ablation_Study_Reference_and_QA_Prep.md` | Abrar |
| B7 | `Tamanna_task_2/Plan_1/Plan_1_Edge_Model_Compression.md` line 22 and `Plan_3/Plan_3_Offline_Interactive_Demo.md` line 25 | `../Research_Directions_Beyond_Finetuning.md` is two folders up | `../../Research_Directions_Beyond_Finetuning.md` | Tamanna |
| B8 | `Tamanna_task_2/Plan_2/Audit_Response_and_Scientific_Fixes.md`, lines 289–298 | Ten links start with `Plan_2/` although the file is already in `Plan_2/`, and some targets aren't in the repository | Drop the `Plan_2/` prefix; commit or drop the missing files | Tamanna |
| B9 | The 17 run copies of `l2-step2-train-3b.ipynb` in `Champion_Task/L2-step2-results/*/`, and `Offline_RAG_KR2/results/t2b_smoke/t2b_writer_test_smoke.ipynb` | A run copy keeps its notebook's links, which point the wrong way from the results folder | Leave as they are: they are records of runs, and each results README links the right files | — |

### AI-tool traces

Abrar's rule: commit messages and committed files carry no AI-tool names and no temporary-folder paths.

| # | Where | What | Fix | Owner |
|---|---|---|---|---|
| T1 | `Progress_Tracker.md` lines 150, 1950 and 1982; `Task_Ledger.md` lines 93 and 107 | An AI product's name, in notes about quota and about a contributor line on GitHub | Reword without the name | Abrar |
| T2 | `Offline_RAG_KR2/README.md` (5 lines) and `report_comparison/citation_support_fix.csv`, `hand_check.csv` (42 rows) | Names the AI assistant that checked the reports in part B | Keep that a model, not a person, did the check (a reader must know); decide whether to keep the product name | Ridita, with Abrar |
| T3 | `Archive/segmentation_improvement_guide.md` and `segmentation_improvement_guide.html` (2 lines each) | Names the two AI tools whose analyses the guide combined | Same choice as T2 | Abrar |
| T4 | `BRIGHT_DisasterM3_Integration/audit_outputs/README.md`, lines 245–255 | Temporary-folder paths from a teammate's PC, which also name an AI tool | Describe the files without the paths | Ridita |
| T5 | `others/CSE499B Review Presentation (2).html`, 1 line | An AI product's name | None: a submitted file, kept as submitted | — |

Not a finding: `Layer3_Task/Layer3_Task_Brief.md` matched only because it tells the reader not to add such lines.

### Privacy and local paths

| # | Where | What | Fix | Owner |
|---|---|---|---|---|
| P1 | `support/Tamanna/final_report_tamanna.tex`, 1 line | A personal e-mail address in a public repository | Her choice: keep or remove | Tamanna |
| P2 | `Project_Guide.md` (renamed from `Project_Guide_for_Beginners.md`), line 288 | A folder path that includes a Windows user name | Describe it as the shared helpers folder on Abrar's PC | Abrar |
| P3 | 26 other files (118 lines), the most in `Progress_Tracker.md` (40 lines) | Abrar's project folder path, in run steps and in outputs of notebooks run on his PC | Tidy-up only: harmless, and notebook outputs stay as run | — |

### Notebooks

| # | What | Why | Fix |
|---|---|---|---|
| N1 | 15 notebooks with an error message in their outputs | Most are records of runs that failed and were explained: L2's training sessions 3 and 6 of mode (b) (a GPU stall and full storage, 21 Nov), L0's top-up run (a merge error, 26 Oct), Ridita's practice run 2 of the reports, and older CSE499A notebooks in `support/` | Step 2 checks that each one's README says why |
| N2 | 15 notebooks with no outputs | Most are master notebooks whose executed copies are in their results folders (`l2-step2`, `l2-step3`, `l2-step4`, `l3-4bit-3b-handoff`, `l0-step2-full-size-rescore`); the rest are older or teammates' notebooks | Step 2 checks that each master's README points to its executed copy |

### Large files

All are under GitHub's 100 MB limit; the repository's packed history is 2.6 GB. The largest: `others/CSE499A/CSE499A_Proposal_Presentation.pptx` (47.1 MB), four papers in `others/lit review_research papers/` (20.9–45.7 MB), `E7-results/step2/instances_test.csv` (29.3 MB), three building tables (`.sqlite`, 21.4–26.7 MB) and `support/Abrar/Implementation_DisasterM3/benchmark_release.json` (21.7 MB). No action needed now.

## Fixes applied

None yet. The first batch (B1–B6, T1, P2: Abrar's own files) waits for Abrar's go. Teammates' items (B7, B8, T2, T4, P1) go to them.
