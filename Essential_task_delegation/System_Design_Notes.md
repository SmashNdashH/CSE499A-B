# System design notes: the offline report system (O3)

The reasoning behind design choices for the final system, kept so the team can follow it later without the chat history. Each section says whether it is a decision or still a recommendation.

Related: [Next_Steps_Roadmap.md](Next_Steps_Roadmap.md) (T2 and H2b), [Task_Ledger.md](Task_Ledger.md) (H2b), [H2b's results](Champion_Task/H2b-results/H2b/README.md), and DisasTeller's code in `support/Ridita_Integration_of_VLM__/DisasTeller/`.

| Section | Topic | Status |
|---|---|---|
| 1 | Agent frameworks: LangChain, LangGraph, LangSmith | Assessment, 24 Oct |
| 2 | DisasTeller's offline and online modes (T2) | Recommended 24 Oct; to be confirmed before T2 is built |
| 3 | Free-form questions and the SQL agent | Decided by H2b's rule (fixed 22 Oct, run 23 Oct) |
| 4 | The showcase: what the public sees (T3) | Agreed 24 Oct; all seven pages built 15–16 Nov, not deployed (§4.6) |
| 5 | Beyond Layer 1: the day-1 Layers 2–5 | Order and the 3D damage city agreed 24 Oct; the rest open |
| 6 | The one chain, and who writes the report | Agreed 4 Nov; the writer is tested by T2b |

## 1. Agent frameworks: LangChain, LangGraph, LangSmith

**What DisasTeller uses today.** Ridita's implementation runs on CrewAI: four agents (the Expert, Alerts, Emergency service and Assignment teams) do six tasks in order, all on Gemini 3.1 Flash-Lite. LangChain supplies the guideline search in `pdf_search_tool.py`: a PDF loader, a text splitter, a Chroma store and Gemini embeddings.

- **LangChain: keep the part we already use.** T2 swaps the Gemini embeddings for a local model and keeps Chroma (roadmap T2, step 4). In offline mode the two web tools go (§2).
  - Ridita built the replacement on 25 Oct as hybrid search: local MiniLM embeddings plus BM25 keywords, merged by reciprocal rank fusion, over 405 cited sections from six sources.
  - It runs on Chroma on a laptop, and on the saved vectors with numpy and torch on Kaggle.
  - Roadmap T2 step 4b tests it against meaning-only and keyword-only search before it's wired in.
- **LangGraph: a fallback only.**
  - CrewAI lets the model choose its tools and write each call in a set format. Small local models often break that format or loop, and H2b showed the same weakness when our 7B wrote its own queries (§3).
  - If T2's first run hits this, switch to a fixed flow: code runs the segmenter, the fixed queries and the heatmap, and the model only writes each team's section from those facts.
  - **8 Nov: partly.** In T2's practice run 2 (Ridita 3 Nov, Abrar 7 Nov) the 7B's tool calls were well formed, but its agent looped on the same tools and the conversation passed the 16,384-token limit; no report was written (Task_Ledger, T2). Ridita's fixes keep CrewAI (step limit, no delegation, message shortening, a 32,768-token limit). The fixed flow stays the fallback if practice run 3 fails.
  - **11 Nov: yes, and the fixed flow is now T2's design.**
    - Runs 3 and 4 with CrewAI failed in new ways: one-sentence reports, then a tool call repeated until the step limit and saved as the report.
    - By the rule Ridita wrote before run 4, she switched to the fixed flow on 10 Nov (`disasteller_offline/fixed_flow.py`). Code calls the photo tool, the map tool and 18 guideline searches in a fixed order, and the 7B writes 28 sections, with each team's role from the main script.
    - It passed practice run 5 and the proof run with the internet off (11 Nov; Task_Ledger, T2).
    - The agent version still runs (`DISASTELLER_FLOW=agents`) but isn't used.
    - The reports' quality is the open part: a wrong map reading repeated in three reports, a made-up hotline, few citations.
  - LangGraph can express that flow, with retries and saved state. Plain Python can too, with fewer packages to ship. Decide after T2's first run.
- **LangSmith: no.**
  - It's a hosted service, so every prompt, image and report would leave the machine, which an offline product can't allow. Self-hosting it needs a paid enterprise licence.
  - Our notebooks already test against rules fixed before each run, and CrewAI's verbose log is enough for debugging T2.
- **No use for O1, O2 or O4.** Segmentation, counting and the six tasks, distillation and the edge model are PyTorch and transformers training and evaluation.

## 2. DisasTeller's offline and online modes (T2)

**Principle.** Offline is the default and the only mode we grade. O3 promises a complete report with no internet, and disaster zones often lose their connection. Online mode may only add context.

### 2.1 Where DisasTeller uses the internet today

- **Two web tools** in `DisasterManagement_teamwork_simulation.py`: `internet_search` (DuckDuckGo, 2 results) and `process_search_results` (downloads a page and keeps its first 10,000 characters). They are attached to all four agents.
- **Four tasks tell the agents to search the internet for "historical disaster data":**

  | Task | Agent | Line | What it asks for |
  |---|---|---|---|
  | task3 | Emergency service team | 140 | the number and locations of shelters and hospitals, and which places need transport repaired first |
  | task4 | Assignment team | 154 | staff allocation: medical staff, rescue teams, logistics |
  | task5 | Assignment team | 176 | the report for the public |
  | task6 | Assignment team | 193, and 202–203 in its expected output | the reconstruction plan, including how much money it needs |

- **The guideline search already works offline, but only the Expert team has it.** Its PDF is EMS-98 (`Guidelines/EMS98_Original_english__earthquake.pdf`), the European scale for grading earthquake damage to buildings.

### 2.2 What offline mode changes

1. **One switch, off by default,** for example an environment variable `DISASTELLER_ONLINE=1` that turns online mode on. With it off, no agent gets the web tools, and the "search the internet" sentences are left out of all four tasks.
2. **New wording for those four tasks.**
   - EMS-98 grades damage. It holds no historical costs, staffing levels or hospital counts, so pointing these tasks at the PDF would not work.
   - Offline, the agents work only from the facts the system gives them: building counts and grades (H2's table, through fixed queries), the damage map, the hot spots (T1) and the EMS-98 grades.
   - A figure that needs outside data, such as a reconstruction budget, is written as "not available offline", never estimated.
3. **Optional, if the team wants those figures offline:** a small local table of past disasters (costs, staffing), with a source for each row, given to the Emergency service and Assignment teams as a tool.
4. **Each report states the mode** that produced it.

Why the wording matters: an agent told to search, with no search tool, either calls a tool that isn't there or makes the "historical data" up. Made-up numbers are most likely in task6's budget lines (202–203).

### 2.3 Rules for online mode

- **Its own section.** Web findings go in a separate "Context from the web" section, each with its link and the date it was read.
- **Never over our numbers.** Counts, the damage map, grades and the heatmap come only from our models and fixed queries; a web page can't change them.
- **Page text is data, not instructions.** Web pages can carry false reports, or text written to steer an AI, and a small local model isn't good at telling the difference.
- **The current limits stay:** 2 search results, and 10,000 characters per page.

### 2.4 How it's tested

- **The graded T2 run is offline:** Kaggle's internet turned off, with the models and the guideline database attached as inputs, since downloading them needs the internet. That run is the proof behind O3's "offline" claim; roadmap T2 already asks for a log proving no external API calls.
- **Every number in a report is checked against the fixed queries** (added 26 Oct). The pass check is zero contradictions.
  - Why: a report can read well and still state a wrong count, and this check needs no human grader.
  - It follows TimeSpot's consistency-violation rates (ICML 2026; Paper_Audit §4.15), which count answers that contradict themselves.
  - Alternatives: a human rubric, or an AI judge such as DisasterM3's GPT-4.1 scoring (§3.7). Both can grade the wording, but neither checks numbers exactly. They stay options for judging report quality, after the numbers pass.
- **Online mode is a demo extra.** It is never graded, and never compared with the offline score.

## 3. Free-form questions and the SQL agent

**Status:** decided by the rule fixed on 22 Oct, before H2b ran. Free-form questions are not shipped now. They can come back only through a new test (§3.4).

### 3.1 What H2b found (23 Oct)

- **The bar:** at least 90% right on the five-table check (test-suite accuracy), and RS(10) above 0.
- **No model reached it.**
  - Our 7B in 4-bit got 69.0%. 46 of its 261 answers (17.6%) were wrong numbers, and its RS(10) was −89.6.
  - The best accuracy was Coder-3B in fp16, at 73.9%. Every RS(10) was negative.
- Full results: [H2b-results/H2b/](Champion_Task/H2b-results/H2b/README.md), and H2b's entry in [Task_Ledger.md](Task_Ledger.md).

### 3.2 Why a wrong answer costs 10 points

In a disaster report, a wrong count ("12 destroyed buildings" when there are 3) is worse than "I can't answer that". RS(10), from TrustSQL and the EHRSQL 2024 shared task, gives +1 for a right answer or a correct refusal, 0 for refusing an answerable question and −10 for a wrong answer. For our 7B to reach 0, more than half of its 46 wrong answers would have had to become refusals.

### 3.3 Why a framework's SQL agent (LangChain's) wouldn't fix it

- **Same model, more steps.** LangChain's SQL agent lists the tables, reads the schema, writes the query, has the model check its own query, runs it, then answers.
- **H2b already gave the model what those steps provide:** the full schema with column notes (the CREATE TABLE format the papers found best), 4 worked examples, and up to 2 retries with the error message.
- **The steps don't target the actual errors.**
  - The wrong answers came from queries that ran fine but used the wrong logic: empty values (the "no destroyed building nearby" case, 0–22% right across models), pairs of buildings (6–28%), positions (0–52%) and distances (44–70%).
  - Retries with the error message fixed none of the 200 retried items.
  - A self-check by the same model is unlikely to catch logic it got wrong in the first place.
- **It costs more.** Several model calls per question instead of one (our 7B in 4-bit takes 3.3 s per question on a T4), and each extra step is another chance for a small model to break the agent's format.

### 3.4 What could bring free-form questions back

- **A model that passes a new test with the same bar and the five-table check,** for example the distilled 3B trained with question–SQL pairs added to L2, or a stronger local model.
- **A new question bank.** H2b's questions have now been seen. Trying wrappers or prompts on them until one passes would be tuning on the test.
- **LangChain's SQL agent can be one configuration in that re-test.** No gain is expected, for the reasons in §3.3.
- **A cheaper middle ground: a menu of fixed question templates** the responder fills in (damage class, size threshold, part of the image).
  - No model writes SQL, so it needs no GPU.
  - Each template's query is written and tested once by us, so it's right for every question type, including the ones every model got wrong.
- **Benchmark counting always uses the fixed query,** whatever happens here.

### 3.5 Has anyone passed a bar like ours? (literature checked 24 Oct)

All 35 papers in `others/lit review_research papers/` were searched, along with the folder's notes and spreadsheets. Only two papers score refusals the way H2b does: TrustSQL and the EHRSQL 2024 shared task. None reports our full bar (90% on a strict check and RS(10) above 0), and none tests small local models without in-domain training data.

| Source | What it reached | How |
|---|---|---|
| **EHRSQL 2024 shared task** (hospital records; 1,167 test questions, 20% unanswerable) | 7 of 8 teams scored above 0 at RS(10); the winner 81.32. Small fine-tuned models passed 0 too: a T5-3B pipeline (AIRI NLP) 44.04, and a SQLCoder-7B pipeline (LTRC-IIITH) 43.7. The one team that didn't fine-tune (Project PRIMUS, SQLCoder-7B prompted only) scored −713.37. No team was above 0 at RS(N), where one error outweighs everything. | Every team above 0 fine-tuned on the task's training set: about 4,700 question–SQL pairs for the same database, plus 450 unanswerable questions. Each added an abstention gate: three models must agree (PromptMind), a log-probability threshold (ProbGate, LTRC-IIITH), several samples must agree (KU-DMIS), or a classifier for unanswerable questions plus an executability check (AIRI NLP). The winner also fine-tuned at test time on pseudo-labels, which the organisers say may not carry over to real deployment. |
| **TrustSQL** (four databases; half the questions can't be answered) | The simplest gate worked on every database: SQLPROMPT[VOTING] (GPT-3.5, sampled five times, answer only if all five agree) scored 41.0, 40.2, 45.0 and 29.8 at RS(10), including Spider, the cross-database setting closest to ours. Almost every method stayed below "refuse everything", which scores 50 here because half the questions are infeasible. | Each prompt carries 8 solved examples retrieved from the same database. Abstention by agreement between samples, by probability or entropy thresholds on a fine-tuned T5, or by GPT-4o question and error classifiers. The authors' summary: reducing errors gains more score than answering more. |
| **GeoDisaster** (disaster geo-intelligence agents that call tools) | 90.11% answer accuracy and 94.24% task success | Supervised fine-tuning on the benchmark's own training trajectories, then reinforcement learning (GRPO). Graded by an LLM judge (GPT-5.5), with no penalty for wrong answers and no refusals. |
| **Accuracy-only text-to-SQL** (DAIL-SQL, Qwen2.5-Coder, Rajkumar et al., Self-Debugging) | Best 86.6% on Spider (DAIL-SQL with GPT-4). Qwen2.5-Coder-7B: 82.0% on Spider and 51.1% on BIRD. | Prompt design and similar-example selection. Graded on one database, with no refusals. |

What the successes share, and what it means for us:
- **In-domain examples or training,** meaning question–SQL pairs or trajectories for the same database, and **an abstention gate** that turns uncertain answers into refusals. H2b had neither: small local models, four generic worked examples, no gate.
- **The one prompted-only 7B in EHRSQL failed badly (−713.37), much as ours did,** while fine-tuned 3B and 7B models passed 0. Fine-tuning plus a gate made the difference, not model size alone.
- **EHRSQL flatters fine-tuning:** 100 of its 134 answerable question templates also appear in training. A fair re-test for us must include question types the model never trained on.
- **A route back:**
  1. Build question–SQL pairs for our table: templates times paraphrases, each checked by running its reference query.
  2. Use them two ways: retrieve similar solved examples into the prompt (TrustSQL's SQLPROMPT), and fine-tune (as part of L2's 3B training, or a small LoRA on the 7B).
  3. Add an agreement gate: sample five queries and answer only if they agree (TrustSQL's VOTING). It costs five model calls per question.
  4. Re-test on a new question set that includes unseen question types, scored as in §3.6.

### 3.6 How H2b scored, and the alternatives

**Accuracy: test-suite accuracy** (Zhong, Yu & Klein, EMNLP 2020). An answer counts as right only if its query gives the reference query's result on five versions of the table: the real one, classes redrawn, sizes and positions redrawn, no destroyed buildings, and no buildings. Why: a wrong query can hit the right number by luck on one table. Cell 7 confirmed the suite catches 6 near-miss queries; one of them (integer division in a percentage) passed on the real table alone.

| Alternative | Why it wasn't used | Usable later? |
|---|---|---|
| Execution accuracy on the real table only (the Spider and BIRD standard; EHRSQL uses it too) | Lets lucky queries pass: every model scored 4–6 points higher this way | Reported alongside, as `ex_real_acc_%`, to show what the suite catches |
| Exact match against the reference query's text | Marks correct rewrites wrong, since the same query can be written many ways | No |
| An LLM judge (GeoDisaster grades with GPT-5.5) | Needs a stronger online model, can be wrong itself, and can't check a number | For free text only, such as T2's reports |
| Human grading | Slow, and needs a written rubric to be consistent | For T2's reports, with a rubric fixed in advance |

**Reliability: RS(10)** (TrustSQL; the main score of the EHRSQL 2024 shared task). Each item scores +1 for a right answer or a correct refusal, 0 for refusing an answerable question, and −10 for a wrong answer or an answer to an unanswerable question; the mean is shown per 100 items. Why: in a disaster report, a wrong number is worse than "I can't answer that", and 10 is the moderately strict penalty both sources use.

**Why the bar has two halves (90% accuracy, and RS(10) above 0):** RS alone can be met by refusing everything. In H2b, refusing all 297 items scores +12.1 (36 correct refusals), so the accuracy half is what makes the system useful. TrustSQL and EHRSQL report the same baseline ("abstain all": 50 and 20).

**Sensitivity to the penalty,** recomputed from `graded.csv` on 24 Oct. The decision used RS(10), fixed before the run.

| Setup | RS(0) | RS(5) | RS(10) | Break-even penalty | Accuracy |
|---|---|---|---|---|---|
| Our 7B, 4-bit | 72.1 | −8.8 | −89.6 | 4.46 | 69.0% |
| Our 7B, full precision | 76.1 | +3.7 | −68.7 | 5.26 | 73.6% |
| VL-3B, 4-bit | 45.1 | −160.3 | −365.7 | 1.10 | 46.4% |
| VL-3B, full precision | 55.9 | −99.0 | −253.9 | 1.80 | 56.3% |
| Coder-1.5B, 4-bit | 52.9 | −115.5 | −283.8 | 1.57 | 56.7% |
| Coder-1.5B, full precision | 52.5 | −124.2 | −301.0 | 1.49 | 55.6% |
| Coder-3B, 4-bit | 73.1 | −44.8 | −162.6 | 3.10 | 72.0% |
| Coder-3B, full precision | 74.1 | −38.7 | −151.5 | 3.28 | 73.9% |

- The break-even penalty is the penalty at which a model's score reaches 0. Our 7B is net useful only if one wrong number costs no more than about 4–5 right answers.
- At a penalty of 5, only our 7B in full precision is above 0. The decision is the same at any penalty, because no model reached the 90% half.

**Other weightings considered, and why they weren't used:**
- **Each question type counting equally** (a macro average): our 7B in 4-bit goes from 69.0% to 66.3%. Not used, because each item is a real question a responder could ask; shown here for transparency.
- **By importance,** for example a destroyed-building count weighing more than the smallest intact building's area: needs weights agreed with responders before a run. Usable in the re-test if agreed in advance.
- **By the size of the error** (off by 1 versus off by 100): a query with wrong logic can be close on one table and far off on another, and a responder can't see how far off a number is.
- **RS(N),** where one error outweighs all correct answers (EHRSQL): no system in either paper passes it except one that refuses almost everything, so it can't separate models.

**For the re-test,** set before the run: test-suite accuracy, RS at 0, 5 and 10, a risk–coverage curve if the system has an abstention gate (accuracy as the gate lets fewer questions through, the selective-prediction view both papers cite), and any importance weights agreed in advance.
- Summarise the risk–coverage curve by its RC-AUC (the area under risk against coverage; lower is better), and report the confidence's expected calibration error. Both are defined in TimeSpot (ICML 2026, Appendix D.1; Paper_Audit §4.15), which is the source to cite.

### 3.7 Free-form questions in the remote-sensing VLM papers (checked 24 Oct)

These projects do take free-form or conversational questions, but none tests those answers the way H2b did:

| Project | How it answers | How it was scored | Penalty for wrong answers, or refusals |
|---|---|---|---|
| TEOChat | The VLM answers from the image sequence, over several turns | Closed tasks: building localization and damage classification (F1), change detection | No |
| BDAChat (repository) | Segmentation (a modified SAM) finds buildings, then the VLM (Video-LLaVA, 7B) grades and explains each one | Damage classification: macro F1 0.763 on xBD | No |
| GeoPixel | The VLM writes a description with a mask for each object it mentions | Caption metrics plus mask overlap; referring segmentation | No |
| ImageRAG | Finds the relevant crops of a very large image, then the VLM answers | Multiple-choice accuracy (MME-RealWorld-RS, including 1,255 counting questions) | No |
| Change-Agent | An LLM writes Python that calls a change-detection model, for example to count changed buildings | Only the detection and captioning model is scored (IoU, BLEU, CIDEr). The agent's answers are shown in two example conversations, never measured | No |
| Grace | A small VLM on the satellite, a larger one on the ground | VQA and caption accuracy, and latency | No |
| DisasterInsight | The VLM answers building-level tasks, such as "Count the commercial buildings with major-damage" | Counting by mean absolute error; reports by BLEU, ROUGE and BERTScore | No |
| DisasterM3 | The VLM; its nine tasks include an open caption and restoration advice | Multiple-choice accuracy for six tasks, including building counting; open tasks scored by GPT-4.1 on a 5-point scale | No |

- **They ask a different question.** These papers ask whether a model can produce a good answer. H2b asked whether a system can ship free-form numeric answers to responders. No paper checks free-form numbers strictly, or scores a confident wrong answer below "I can't answer".
- **Change-Agent is the closest design to our SQL agent** (an LLM writing code to compute the answer), and its answers were only demonstrated, not measured.
- **BDAChat's design is closest to our current system:** find each building first, then let the VLM grade it, as our segmenter and table do.
- **Where they do count, it's weak.** In DisasterM3 the base 7B counts damaged buildings at 34.2%, and our 7B at about 30–32%. That's why counts come from the table. (7 Nov: a rule that reads only the answer options scores 66.98% on these questions, so judge the table by count error against the true masks, not by this accuracy alone; Task_Ledger §7.)

**What H2b did and didn't rule out.** H2b tested free-form questions turned into database queries, which produce numbers. It didn't test descriptive questions answered by the VLM, such as "what kind of disaster is this?" or "describe the damage near the river" (our 7B gets disaster type 75.6% right at full size, L0 step 1). A descriptive question box could be offered, labelled as an AI description, with numbers still routed to fixed queries. It would need its own check before shipping, for example DisasterM3's 5-point judge scoring or a human rubric fixed in advance.

## 4. The showcase: what the public sees (T3)

**Status:** agreed 24 Oct. There are two pieces, and the demo (piece 2) is an interactive, animated website deployed on Vercel. The build steps are in the roadmap's T3 section. **16 Nov:** phase 1 is built in [T3_Website/](T3_Website/README.md), as one site holding both pieces; Abrar chose the look (direction A, name not chosen yet); Abrar builds the remaining pages until 17 Nov, and Aryan takes over what's left from 18 Nov, by [his handover](Aryan_Task/T3_Website_Handover.md). What is built and what changed from this plan is in §4.6.

### 4.1 What last season's winner showed (observed 24 Oct)

DhakaDriveX was Champion at NSU ACM SC's Innovation Challenge (Season 19, 84 projects). Its "Project UI & Demonstration" link opens a static site on GitHub Pages (`nipunsaif.github.io/CSE499B`).

- **No live model.** There's no upload, no inference and no backend: plain HTML, CSS and a little JavaScript.
- **One strong look:** a full-screen neon city illustration, a neon logo and a car crossing the bottom of the page, with the same palette and font on every page.
- **Results in motion:** four YouTube videos in pop-up players. Two are the team's own (pedestrian crossing intent, and BanglaTesla trajectory prediction). The other two come from another lab's channel (INVETT-UAH).
- **One interactive proof of the main claim:** a knowledge graph of about 500 nodes, linking pedestrians to features such as crossing, near junction and occluded. Visitors can drag and zoom it. It's built with vis-network.
- **A team page** with photos and contacts, and a menu that works on phones.

The lesson: the public piece needs a clear look, results in motion, and one interactive element that proves the main claim. The public doesn't need a live model, but a reliable live run is stronger evidence at the booth.

### 4.2 Our two pieces

1. **Public showcase site (the story):**
   - a name and a look taken from our subject (satellite images, damage colours), chosen by the team, not a borrowed theme;
   - before/after sliders on the gallery images, with the damage map on top;
   - screen recordings of the live offline run, all our own footage;
   - our version of their knowledge graph: a building map where clicking a building shows its class, its area and its distance to the nearest destroyed building, from H2's table, so every number traces back to a building;
   - the benchmark panel with our real numbers, a limitations section, and the team.
2. **Interactive demo website on Vercel (the product):**
   - the chain in roadmap T3: a gallery image or an upload, the damage map, counts linked to their buildings, the heatmap, fixed question templates, the report and the benchmark panel;
   - animated, with current UI/UX (§4.4).

Both can live in one Next.js project, with a story page and a demo page: one design, one codebase, one deployment. *(16 Nov: one project, as planned, but Vite and React (from Aryan's prototype), not Next.js; §4.6.)*

### 4.3 How the website runs our models

- **Vercel can't run them.** It has no GPU, and its serverless functions are far too small for PyTorch and a 7B. So the public deployment works from results computed in advance for the gallery images.
- **Live mode at the booth, offline:**
  - The same front end, built on the laptop, calls a local Python API (for example FastAPI). The API runs the chain: the segmenter, H2's fixed queries, T1's heatmap and T2's report, streamed as it's written.
  - The 7B needs a GPU with about 6 GB of memory in 4-bit (H2b: 5.8 GB to hold the model, 6.2 GB at peak while answering). Without one, the gallery's reports computed in advance are shown, labelled as such.
  - *(16 Nov)* The guidance step is meant to move to the 3B distilled from the 7B (L2): a 3B of the same family peaked at 2.6 GB in 4-bit (H2b), so a laptop graphics card could hold it. L2's training hasn't run, and no language model has been measured on a laptop, a phone or in a browser (L3 step 6). A browser can't run the 7B, and running even a 3B there is untested.
  - *(23 Nov)* **The 3B is trained and chosen: (c), `AbrarAlam/disasterm3-qwen25vl3b-l2/c/final` on Qwen2.5-VL-3B.**
    - On one T4, one question at a time: 2.42 GB for its weights in 4 bits, 3.01 GB at peak, 1.8 s per question.
    - **A requirement for running it anywhere in half precision (fp16, or 4 bits with fp16 compute):** the last block of its vision part, `visual.blocks.31.mlp.down_proj`, must run at full precision. Without that, about 3% of photos make it overflow, and the answer comes out as exclamation marks.
    - The fix is in `l2-step4-winner-benchmark.ipynb`'s cell 2b. The same overflow stopped the 3B's training until L2 step 2b (19 Nov).
    - On a laptop CPU nothing overflows (L3 step 6, 25 Nov: llama.cpp, the language part in 4 bits, the image part in 16 bits). The 3B peaks at 4.67 GB and answers as on the T4 (39.7% against 40.8% on 360 questions), but takes about 84 s per question, mostly reading the photos (about 47 s each). That suits background work, not live answers.
    - *(24 Nov) Measured with the fix:*
      - *The 4-bit 3B averages 44.49% on the benchmark's six tasks, against our 7B's 39.20%. It leads on counting and relational reasoning, and trails on disaster type, bearing bodies and scene.*
      - *It takes 1.72 s per question at 3.03 GB peak; the 4-bit 7B takes 4.83 s at 8.64 GB.*
      - *Two ways to run the field model's questions:*
        - *the 3B alone (fits "about 6 GB");*
        - *a per-task split that sends disaster type, bearing bodies and scene to the 7B: 48.15% against 45.04% on the reporting half, but both models loaded, about 11 GB.*
      - *Abrar's call. Ledger, L3.*
- **Stretch: uploads on the public site with no server (decided 24 Oct: try it).**
  - ONNX Runtime Web can run an ONNX model in the visitor's browser, so their images never leave their device.
  - Only the segmenter, counts and heatmap could run this way, not the report.
  - **Feasibility test first**, with its pass rule fixed before it runs:
    - Model: L1b's INT8 edge model, `Champion_Task/L1B-results/L1b/r9_int8_static_keep1_3.onnx` (33 MB). It is R9, which sees only the after image. R11's version needs L1 again, but its speed should be about the same, since only the first layer differs.
    - Run it in Chrome and Edge on the demo laptop with ONNX Runtime Web (WebAssembly, several threads), and the full-precision model (`L1-results/L1/r9_fp32.onnx`, 130 MB) on WebGPU where the browser offers it.
    - Measure: whether it loads (every operation supported), the time per 1024 × 1024 image (first and later runs), and agreement with the same model run natively on the same input. On a normal CPU, the native INT8 model takes 1.6 s.
    - Pass: it runs in both browsers, takes 10 s or less per image after the first, and gives the same class as the native run on at least 99.9% of pixels.
    - Note for the build: several threads in the browser need cross-origin isolation, so the Vercel deployment must send the COOP and COEP headers.
  - **Result (24 Oct): passed, in two runs.** Run on this PC (20 threads, with a GPU) in headless Chrome 153 and Edge 153, with ONNX Runtime Web 1.20.1, on one xBD after-image (Hurricane Harvey) at 1024 × 1024. The second run used a fresh copy of the test kit, to check the kit itself:

    | Model and engine | Chrome: first run / later runs | Edge: first run / later runs | Same class as the native run |
    |---|---|---|---|
    | INT8 (33 MB), WebAssembly | 3.3–4.0 s / 2.1–4.8 s | 4.8–6.4 s / 3.3–5.5 s | 100% of pixels, both runs |
    | Full precision (130 MB), WebAssembly | 3.5–5.0 s / 3.9–6.5 s | 4.6–5.9 s / 3.7–4.3 s | 100% |
    | Full precision, WebGPU | 4.8–5.6 s / 1.2–1.7 s | 3.4–3.8 s / 1.0–1.3 s | 100% |
    | INT8, WebGPU | failed | failed | — |

    - Timings vary between runs on the same PC, so read them as ranges. Agreement and the per-class pixel counts were identical in both runs, and every later run stayed under the 10 s limit.
    - The same models run natively (onnxruntime-node 1.20.1, CPU) take 0.75–1.05 s, so the browser takes about 2.5–7 times as long on WebAssembly.
    - INT8 on WebGPU fails in this version: its DequantizeLinear kernel doesn't support int32 values without a zero point. Options: a newer ONNX Runtime Web, re-quantizing with zero points, or a half-precision model (about 65 MB) for WebGPU.
    - **Recommended setup:** INT8 on WebAssembly as the default (it works in both browsers and is a 33 MB download), and a full- or half-precision model on WebGPU as the faster option where the visitor's browser offers it. *(16 Nov: the site's first build uses WebAssembly and INT8 only; WebGPU comes later.)*
    - **How it was scored, and why:** agreement with the native run on every pixel, because the question was whether the browser runs the same model faithfully; and the time per image after the first run, because that's what a visitor waits. Accuracy against ground truth wasn't the question: the model is the same, and its accuracy was measured in L1b.
    - **Alternatives:** IoU against the native mask gives the same answer when agreement is 100%. A comparison on all 645 validation images is left for R11's version. A visual check is subjective.
    - **Caveats:** one image, on a fast PC, in headless browsers. A typical laptop has fewer threads and phones are slower, so re-test on the booth laptop and a mid-range phone. The test model is R9 (after image only); R11's version needs L1 again. Without the COOP and COEP headers, the browser runs on one thread.
    - The test kit is in [Champion_Task/T3-browser-test/](Champion_Task/T3-browser-test/README.md): the scripts, the pinned packages, this run's results, and a README with the caveats and an audit checklist for teammates or their AI helpers. The models and generated files stay out of git.
- **Gradio** (`support/Abrar/Implementation_DisasterM3/gradio_app.py`) stays as the API's test page, and the fallback if the website isn't ready. Its `share=True` opens a public tunnel, so it must be off for offline runs.

### 4.4 What "current UI/UX" means here, as checks

- **Interactive:**
  - a before/after slider, and damage layers switched on and off by class;
  - hovering over or clicking a building shows its facts, and each count links to its buildings;
  - a heatmap layer, the report appearing as it's written, and charts for the benchmark panel.
- **Animation with a purpose:** the steps of the chain appear in order, so the animation explains the pipeline. It respects the visitor's reduced-motion setting.
- **Works for everyone:** on phones and by keyboard, with readable contrast, and clear loading, empty and error states.
- **Fast:** compressed images and lazy loading, with a measurable target such as Lighthouse 90+ for performance and accessibility.
- **Ready for the booth offline:** fonts and assets are bundled with the build (Next.js can host fonts itself), and live mode makes no outside calls.
- **Honest:** every number is labelled as a model estimate. Gallery images come from the validation set, so the site can show the real accuracy on each one.

### 4.5 What has to exist first

- **T2's reports:** DisasTeller on local models.
- **A gallery export:** a short Kaggle notebook that runs R11 with TTA on 4–6 validation pairs and saves the masks, the building outlines with their facts, the heatmaps and each image's accuracy.
- **L1 repeated on R11,** if the CPU and in-browser segmenter must match the champion. L1b's INT8 model is R9, which sees only the after image.
- **A Vercel account** linked to the repository. The free Hobby plan covers non-commercial projects. *(16 Nov: changed. The site is deployed by hand from Abrar's PC with the Vercel CLI, not from pushes, so nothing goes public until he deploys. Steps in [T3_Website/README.md](T3_Website/README.md).)*
- **Abrar's choice of name and look.** *(16 Nov: the look is chosen; the name isn't.)*

### 4.6 What is built (16 Nov)

- **Where:** [T3_Website/](T3_Website/README.md): Vite, React 19, TypeScript and Tailwind 4, a static build, started from a copy of Aryan's prototype. Every change from the prototype, and why, is in [Aryan's handover](Aryan_Task/T3_Website_Handover.md), section 3.
- **The look (Abrar, 16 Nov):** direction A, "Aftermap" (a placeholder name): Aryan's dark workspace made sober, with B's faint gridlines, a small before/after pair beside the headline, a slow contour-line background behind the top of every page, and on/off switches for the damage map and the heatmap.
- **Built:** the opening section; "How it works" told by scrolling, one real pair pinned and changing at each of 7 steps; the building map (layers, building inspector, counts that highlight their buildings, five fixed questions, a saved PNG of the map); the results tables; the six real reports word for word with known errors marked; "What it can't do yet"; and "Future ideas, not built".
- **Rules the code enforces at every build:**
  - every number comes from one facts file, checked against its source file and the anchors;
  - facts dated after the build date (the 18 Nov results, anything about the 3B) are left out of the build;
  - the gallery export must match [DATA_CONTRACT.md](T3_Website/DATA_CONTRACT.md);
  - the damage colours stay distinguishable under simulated colour-vision deficiencies. The wireframes' colours failed this (damaged and destroyed 5 apart under deuteranopia), so the site uses adjusted ones;
  - no request leaves the site's own origin.
- **Built on 16 Nov (evening):**
  - **seven pages** in direction A: Home, How it works, Explore, Try it, Results, Reports, About, with the contour background behind the top of each (it reacts gently to the pointer and is hidden while the in-browser model runs);
  - **the 3D damage city** on Explore: each building's outline raised into a block, drawn as plain SVG with no 3D library. The model measures no heights, so a block's height only repeats its class (intact tallest, destroyed almost flat), and the view says "A 3D view of our 2D results, not a reconstruction";
  - **Try it:** the 8-bit after-image-only U-Net (33 MB) runs in the visitor's browser (ONNX Runtime Web 1.20.1, WebAssembly, in a worker) on their own image; the building table and the heatmap are then computed from its mask by the same code as the gallery, and shown in the same building map. Nothing is uploaded. A picture that isn't 1024 × 1024 has its middle square cut out and resized, and the page says so. The input spec is one config file, so a before-and-after export needs a config change and a second photo;
  - **Results as bar charts**, each bar ending in its linked number, with the table under each chart; and **the Reports page** with the passages each report was given, the Expert report's 11 citations beside their passages, and the offline evidence.
- **Measured on 16 Nov** (Abrar's PC, 20 threads, headless Chrome):
  - the in-browser model gives the same class as the native run (ONNX Runtime Node 1.20.1) on **100% of pixels** of October's test image, fed through the page's real file input (the brief's rule: at least 99.9%), and the native run's class counts equal October's;
  - **4.1–5.2 s per image** after the first run (October: 2.1–5.5 s). Drawing the moving background during a run cost about 2 s more, which is why it is hidden then;
  - the preprocessing must round to 32-bit floats at each step as the October kit's numpy code does: with 64-bit arithmetic the 8-bit model's class counts on the test image moved by 25 pixels (so at least 25 pixels changed class);
  - the heatmap code matches the heatmap notebook's version 3 on 23 images: 5 of 4,521,984 map pixels differ, each by 1 grey level of 255; all 51 hot spots and 63 safe areas identical;
  - Lighthouse with phone settings: performance 95–99, accessibility 99–100 on Home, Explore, Results and Try it; no request leaves 127.0.0.1 on any page or during a model run.
- **Added on 17 Nov** (the items the handover had left for Aryan, and a design pass):
  - **Zoom and pan on the building map.** The zoomed view is a window on the image, kept in image pixels, so the crosshair and every distance still read true positions, and the before/after line stays at its place on the screen.
    - A plain mouse wheel still scrolls the page; Ctrl with the wheel, a pinch, the map's buttons or the keyboard zoom. The prototype's wheel zoomed directly, but its map filled the screen; ours sits in a page that scrolls.
    - Alternatives considered: a wheel that always zooms (it would hold the page still whenever the pointer crossed the map), and zoom buttons only (no pinch on a phone, where zoom matters most: a 1024 px image is about 360 px wide there).
  - **A card beside the pointer** with a building's row of the table, on the flat map and the 3D view; on a touch screen a tap selects the building instead.
  - **Hide and search in the buildings list.** Both change only what is shown: counts, answers and the saved picture always use the whole table, and the panel says how many outlines are hidden. The search takes a building's number, since buildings have no names.
  - **Side panels that fold to their title,** and **print for a report:** the chosen report alone, with the page's caveats, its marks and notes, each link's address and the decision-support line, because a printed sheet travels without the page.
  - **The reports' known problems, completed against Ridita's README:** 14 wrong phrases marked in the text, and 8 notes for problems with no single phrase to mark (the bridge's missing grade, the misplaced labels on the run's map, sections that repeat, reports that cite none of the passages they were given). The Reconstruction plan's passage names are real but written without brackets, so that is a note, not an error mark. The build fails if a marked phrase is in no report.
  - **The design pass** gave the heatmap one name on the site ("danger heatmap"; Results says once that our reports call it the survivability heatmap), explained SAM 3 and U-Net where How it works first uses them, and fixed event names, a low-contrast list row, a skipped heading level and the phone header.
- **Measured on 17 Nov:**
  - Lighthouse with phone settings, performance and accessibility: Home 98 and 100, How it works 96 and 100, Explore 94 and 100, Try it 97 and 100, Results 99 and 100, Reports 96 and 100, About 98 and 100;
  - the browser check passes against the built copy and against the dev server, with the wheel tested without Ctrl (the page scrolls) and with it (the map zooms about the pointer);
  - no page is wider than the screen at 11 widths from 320 px to 1920 px; no request leaves 127.0.0.1;
  - the in-browser model again gives the native run's class on 100% of pixels, at 3.1–3.3 s per image after the first run;
  - on an emulated phone (a desktop browser sending touches): a swipe on the map still scrolls the page, a pinch zooms, a finger drags the zoomed map, and a tap selects the right building. A real phone and a real printer are not tested yet.
- **Not built or not done:** the gallery export (four validation pairs with R9's masks stand in, marked), the booth API (a small local FastAPI app on 127.0.0.1 serving this same build and running the language model and the guideline search; a later brief), the deployment, and the Try it test on the booth laptop and a mid-range phone (numbered steps in the site's README).
- **Brought back from the prototype on 16 Nov, on real data:** the Sphere and INSARAG questions as the 18 guideline searches of the proof run with their passages word for word; saving a map picture and the reports; the caveats as the limitations section; thermal, sensor and route ideas as text under "Future ideas, not built". Online map tiles stay out: the booth runs offline.
- **Found while building:**
  - The bridge `disasteller_inputs.py` reads safe areas with keys T1 v3's file doesn't have (`point_xy`, `dist_to_damage_px` instead of `xy`, `distance_px`), so every safe area would print at (0, 0), 0 px away; it also titles model estimates "GROUND TRUTH" and hard-codes R11 and T1 v3 as the sources. In Aryan's review, §7.2–7.5.
  - **xBD's original label files carry a ground resolution and coordinates.** A sample of 12 `*_post_disaster.json` files under `data/` gives `gsd` from 1.25 to 2.82 m per pixel and each building as a longitude/latitude polygon. DisasterM3's masks carry neither, and the Turkey pairs aren't from xBD. So metres would be possible for xBD pairs (560 of the 645 validation pairs), after checking that DisasterM3's xBD images are the same tiles. The site keeps pixels until Abrar decides.

### 4.7 A visitor's own photos: what they get, and the text gap (found 25 Nov)
- **What runs on them in the browser** ("Try it", checked in the code):
  - the 8-bit before-and-after U-Net, one view, no TTA. On the 605 clean validation pairs it scores mIoU 0.5733 and destroyed IoU 0.2630, against the gallery maps' 0.5805 and 0.2692 at full precision with TTA;
  - the before/after slider with the map on top;
  - the buildings (connected patches of one class, at least 20 pixels), counts, hot spots and safe areas;
  - the 3D damage city;
  - the fixed questions answered from the table;
  - downloads of the mask and the map.
- **What doesn't run:**
  - find-then-grade, because SAM 3 needs a GPU, so touching buildings merge into one patch;
  - written guidance, and any report.
  - The guideline passages shown are fixed quotes from the 11 Nov proof run, not advice about the visitor's photos.
- **Why there's no report:** our 7B writes the reports, from C4's facts, with the guideline search and the number and ID checks. A browser can't run that: the 7B needs a GPU, about 6–9 GB even in 4 bits, and the public site's host (Vercel) has none. On a Kaggle T4, one pair's six reports took about 5.7 minutes (T2 step 5, run 4, 20 Nov). On a laptop with no GPU, the 3B alone took about 84 s per question (L3 step 6).
- **The Reports page shows DisasTeller's own six sample reports,** about ground photos from Wajima, Japan, not our satellite photos. Our chain's 12 reports of 20 Nov aren't on the site (T2 step 5, run 4: two test pairs, offline, 0 wrong numbers).
- **Ways to add text, cheapest first** (Abrar's call; the site is Aryan's build):

  | Option | What the visitor gets | Cost and catch |
  |---|---|---|
  | 1. Written guidance from code, in the browser (recommended) | A short paragraph and a "look here first" list from their own map: counts by grade, the top hot spots and what's in them, the safe areas, the limits | About half a day. Instant and offline, and its numbers come straight from the table. It isn't written by an AI model, and it says so |
  | 2. Our chain's reports on the site | The 12 reports of 20 Nov, beside the maps of their two test pairs | A few hours, no model needed. A real report about our photos, but not about the visitor's |
  | 3. A real report on uploads, through the booth laptop's helper program | Our chain's six reports for the visitor's pair | About 6 minutes per pair on a T4-class GPU. On a laptop without one, likely tens of minutes (an estimate, untested). Needs a GPU laptop at the booth |
  | 4. A small language model in the browser | An AI-written report | A 1–2 GB download, slow on phones. In T2b a small text model made five times our 7B's contradictions (15 against 3). Not recommended |
- **Also possible:** TTA in the browser as an optional "more accurate" setting. Each run would take about 8 times longer (about 30–40 s) for roughly +0.007 mIoU.

### 4.8 Who the system serves, and which photos it reads (noted 25 Nov)
- **Built for the planning level of search and rescue.** The users are rescue coordinators who need, within hours, which buildings collapsed, how many and where to search first, often offline on a laptop (README). It isn't a tool for a rescuer at one building.
- **Its input is satellite photos, or aerial photos taken straight down.** For the before-and-after model, both photos must show the same place at the same size and angle, because it compares them pixel by pixel.
  - After major disasters such imagery is released free through public programmes: the International Charter "Space and Major Disasters", the EU's Copernicus emergency mapping and Maxar's open-data releases, with UNOSAT for UN coordination.
  - Today it mostly reaches responders as maps that analysts draw. Our system turns the raw images into the map, counts, hot spots and reports on one laptop, offline.
- **Why phone photos can't do this job:**
  - A ground photo shows one building's side, at an angle, so it can't give area-wide counts or where to search across a town.
  - Our U-Nets and VLMs were trained and tested only on satellite images. On phone photos they're untested, and the U-Net would fail.
  - A phone photo can give a description. DisasTeller's original reports came from six ground photos with a general model (Gemini); our 7B's quality on such photos is unmeasured.
- **Drones are the middle ground.** Many search-and-rescue teams fly them, and a photo taken straight down is close to what our models read, at far finer detail: a few centimetres per pixel, against roughly 0.5–3 m in our satellite photos (xBD's label files list 1.25–2.82 m). It needs resizing to satellite scale, or training on drone data. RescueNet and FloodNet have building-damage labels from drones; both are listed in the CSE499A README.
- **No before-photo:** R9, the after-only U-Net, covers it today, and Layer 3 tests generated before-photos.
- **Options, cheapest first (Abrar's call):**
  1. **State the scope plainly** in the final report and on the website: the planning level, satellite or straight-down aerial images, not ground photos. Worth doing whatever else is chosen.
  2. **Let "Try it" take an after-photo alone,** with R9. The site's code already has that variant.
  3. **Test drone photos:** R9 on RescueNet's labelled straight-down images, for a real score; train on them if it's poor. Needs GPU time.
  4. **A ground-photo path:** our 7B describes phone photos for the reports. A description, never a map, and it needs its own test.
- **In short:** it isn't only for teams with their own satellites; it suits any coordinator who can get free post-disaster imagery. The rescuer with a phone stays unserved, and option 3 is the realistic way towards field teams.

## 5. Beyond Layer 1: the day-1 Layers 2–5

The day-1 proposal stacked five layers and marked only Layer 1 as this project:

| Layer | What it is | Day-1 label |
|---|---|---|
| 5 | Unified 3D dashboard (UI/UX) | — |
| 4 | Inverse physics, collapse trajectory (PINNs) | research frontier |
| 3 | Generative pre-disaster reconstruction (diffusion) | research frontier |
| 2 | 3D reconstruction (NeRF, Gaussian splatting) | active research |
| 1 | VLM aerial image to textual rescue guidance | this project |

Layer 1 grew well beyond the day-1 arrow (image, VLM, text). The VLM alone couldn't read damage reliably (our 7B counts buildings at about 30–32%), so Layer 1 now includes:
- the damage segmenter (O1 met on all 645 validation images, but at risk until the leak check, E5, gives the clean score);
- per-building counts from a table (H2), and the H2b test of free-form questions;
- the heatmap (T1) and the edge segmenter (L1b);
- the stronger 7B and the 3B path (L0, L2).

The T3 website (map, counts, heatmap and report on one screen) is a 2D version of Layer 5's dashboard.

### 5.1 The smallest version of each layer that would stand (estimates, 24 Oct)

These are rough estimates for one person working mainly on that layer.

| Layer | Smallest version | What it shows | Time | GPU | Risk |
|---|---|---|---|---|---|
| 2 or 5 | **3D damage city** in the website: building outlines raised into 3D blocks, coloured by damage, with schematic heights | A 3D view of our 2D results; strictly a Layer 5 piece, not reconstruction | about 1 week | none | low |
| 2 | A real 3D reconstruction (Gaussian splatting) of one disaster site, from openly licensed drone video, viewable in the browser | That the technique works; not connected to our satellite pipeline, since 3D needs images of one place from several angles, which our data lacks | 2–3 weeks | 5–10 h | medium: licensed footage, and camera positions can fail on blurry video |
| 3 | A model that turns an after-image into the likely before-image, trained on our 5,798 training pairs: a pix2pix baseline, then a diffusion model | Tested by running R11 with the real before-image, a generated one, and none (R9) on the 645 validation images. If generated beats none, it helps when no real before-image exists. Either outcome is a result | 3–4 weeks | 30–50 h | medium: slow diffusion training on a T4, and invented buildings |
| 4 | For one earthquake, fit a physics-based model (damage falls off with distance from the source) to the per-building damage grades, and compare the inferred shaking with the USGS ShakeMap | An inverse-physics result checked against real data; a PINN is optional | 3–4 weeks | little | high: needs map coordinates for each image (not yet checked), and earthquakes are our weakest case (E4) |

Real collapse trajectories (how each building fell) need structural data and simulations: months of work, out of reach this semester. All three of Layers 2–4 together would take about 7–9 person-weeks, competing with T2, T3, L0 and L2, which O3 and O4 need. None of Layers 2–4 is in O1–O4.

### 5.2 Decisions

- **Agreed 24 Oct:** T2, T3, L0 and L2 come first.
- **Agreed 24 Oct:** the 3D damage city goes into the T3 website, labelled as a 3D view of our 2D results.
- **Open:** Layer 3, if time allows after the above; recommended as the one extra layer, because it uses data we already have, plugs into R11 and gives a measured answer either way.
  - The final showcase is about 15 Dec (tentative, given 24 Oct), about 7 weeks away. T2, T3 (which Abrar builds), L0, L2 and H2c take most of that.
  - Layer 3 fits only as a side track: notebooks built for teammates to run on their GPU accounts, with exact steps. Decide in mid-November, from where L2 and the website stand.
  - **17 Nov: still open, and parked.** Abrar finishes the system work first: the damage-map method, the chain to the reports, the 3B. L2 hasn't started training yet, so the mid-November check found no room for it. It is decided later, or left as future work.
  - **17 Nov, later: delegated as a side track.** One member, full-time, reporting every run through Abrar, under [Layer3_Task/Layer3_Task_Brief.md](Layer3_Task/Layer3_Task_Brief.md). *(18 Nov: Ridita started Layer 3; Step 0's smoke test passed all 7 checks, and `disasterm3-r11-r9-checkpoints` is shared with the Kaggle group for Step 1. 18 Nov, later: Step 0's full run passed all 7 checks ([results](Layer3_Task/results/step0/README.md)). Checked on 19 Nov, it agrees with E5's files on the validation pairs, every photo's pixel hash and the 40 leaks. Step 1's smoke test is next.)*
    - **The question:** can a before-photo generated from the after-photo let R11 beat R9 when the real one is missing?
    - **The rule, fixed before any training:** on the 605 clean pairs, R11 with the generated before-photo must reach R9's mIoU plus half the gap to R11 with the real one (0.5604), above noise, and beat the after-photo copied in its place.
    - **The steps:** pix2pix first, a diffusion model only on Abrar's go, and one confirmation on the test pairs.
- **Recommended, not yet decided:** Layer 4 and real 3D reconstruction stay as future work.

## 6. The one chain, and who writes the report

**Status:** the chain was agreed on 4 Nov ([roadmap §1b](Next_Steps_Roadmap.md)). **Its damage map was settled on 19 Nov: option C4,** Abrar's choice ([every option in plain words](Task_Ledger.md#every-option-in-plain-words-written-19-nov-for-the-decision)). The writer is still open and is tested by T2b. **20 Nov: the chain ran end to end offline for the first time** (T2 step 5, two test pairs; [results](Offline_RAG_KR2/results/t2_step5_c4/README.md)). Both pairs pass the five pass rules, but the 7B turned one count into a wrong percentage, so step 7's number check comes next. *(Later on 20 Nov: with a number check while the model writes, run 2 has 0 wrong and 0 unsourced numbers. The 7B then reused damage counts as staff numbers. **Run 4 passes the stricter rule too, with 0,** once the staffing and shelter requests stopped asking for numbers the facts don't give. For the design, it's the facts and the checks, not the model, that keep the reports' numbers right.)*

**The chain:** before + after photos → the damage map, made by the method that suits the photo:
- on the coarser xBD-type photos (1.25–2.8 m per pixel), R11 labels every pixel;
- on the sharper photos (about 0.3 m per pixel, such as Turkey's), SAM 3 finds each building and the grader grades it.

→ one building table → fixed queries + hot spots + guideline search → the report.

- **Why C4.** It's the only option ahead on destroyed buildings on both the validation pairs (0.3501) and the unseen test pairs (0.4296), by more than chance. Each method is used where it's strong: R11 outside Turkey, find-then-grade on Turkey.
- **What C4 asks of the system:**
  - It must know which kind of photo it has. A real system reads the ground resolution (metres per pixel) that satellite photos come labelled with. E7 step 2c used the file name.
  - It must carry all three models: R11, SAM 3 and the grader. SAM 3 needs a graphics card. The website's "Try it" page keeps running R11 alone in the browser.
  - The building table mixes two kinds of rows: R11's patches, where touching buildings can merge into one, and SAM 3's outlines, one building each. The table must say which kind each row is, and a report must never call a patch "one building".
- **Built on the test photos (E7 step 3, 19 Nov):** [`E7-results/step3/`](Champion_Task/E7-results/step3/README.md).
  - The table is `buildings_c4.sqlite`, in H2's columns plus `kind` (`outline` or `patch`), with an `images` table giving each photo's source and method. It has 125,439 rows on 2,065 photos.
  - The hot spots are `hotspots.json`, T1 v3's method unchanged.
  - **What it showed about the design:**
    - Outlines separate touching buildings: 24.5% more rows than joined blobs on the sharper photos, up to 39% in dense cities.
    - On photos with destroyed buildings, 83% of the hot spots' marked points are near real damage. On photos without, most hot spots are false alarms, so a report must call hot spots estimates and never found damage.
    - Counting from C4's map beats either method alone (34.89% against 32.53% and 32.70%, E5's clean questions).
  - **Two ways of counting, and which serves what (E7 step 3b, 20 Nov):**
    - The benchmark's true count is the number of joined blobs in its masks, so touching buildings count as one. So benchmark questions are answered by counting joined blobs (34.89%). Counting the table's rows scores 33.18%, because separate rows overshoot that definition.
    - A report describes buildings, so it uses the rows.
  - **The hot spots' weakness is false alarms on new photos:** the same maps that do well on validation photos mark false damage on undamaged test photos about twice as often. A stricter rule for when a photo gets hot spots doesn't fix it, so T1 v3 stays and every hot spot is reported as an estimate.

- **Why one chain.** Each part was tested alone. The destroyed-building target came from SAM 3 + grader, counting from R11's table, and the field model from R9, and R11's table and T1's hot spots share only 7 images. E7 scores one chain on the same images. Where §2.2 says "H2's table" and "T1", that now means this chain's table and hot spots.
- **The guideline search (RAG) stays in the chain.** It's the part that lets a report cite official guidance with no internet. Tamanna's "Visual RAG" is a different thing: it picks image crops for the VLM, not documents, and Tamanna's Part B showed it doesn't make the 7B a grader (grader 212 of 300 right, new 7B 100).
- **Who writes.** O3 promises our VLM. Yet the fine-tuned 7B answers in one sentence, a plain text model matched it at writing SQL (H2b), and neither has been tested on reports. T2b gives both the same facts and guideline search, then counts number contradictions and fake citations. Scene questions stay with the VLM either way.
- **What the 3B is for.** Size and speed, not being offline: the 7B already runs offline on two T4s. In 4-bit at peak, the 7B needs 6.2 GB and a 3B 2.6 GB (H2b). A 3B in full precision needs 7.7 GB. No VLM has been measured on a laptop CPU or a phone yet (L3 step 6).
- **Edge cases the chain must handle:**
  - No before-photo: on the after-photo, SAM 3 covers only 9% of destroyed buildings. Say so instead of guessing.
  - Misaligned pairs: 52% of measured pairs are shifted by more than 2 px (Ridita's audit), so crops can be off.
  - A building SAM 3 misses is never graded or counted.
  - Missing facts must not read as zero: `disasteller_inputs.py` returns zeros with status "ok" for an image that isn't in the table.

## 7. Notes for the final report (drafts; the report waits for Abrar's go)

### 7.1 Transfer learning in our models (added 22 Nov, from the CSE deep learning and pattern recognition lecture)

**The lecture's rule:** copy the lower layers of a network trained on a larger, similar task, and train only what's new. Lower layers hold generic features such as edges and textures; upper layers hold task-specific ones. The more similar the tasks, the more layers can be reused; the more labelled data, the more layers can be unfrozen. The steps:
1. drop the old output layer and add a new one;
2. freeze the reused layers while the new head learns;
3. unfreeze the top blocks with a learning rate about 10 times lower;
4. check validation after each change;
5. feed inputs exactly as the pretrained model expects.

**Where our system uses it:**

| Model | What is reused | What is trained | The lecture's case |
|---|---|---|---|
| R11, the damage map (U-Net) | a ResNet-50 encoder pretrained on ImageNet (`encoder_weights="imagenet"`); smp adapts its first layer to our 6 channels (after-photo and before-photo) | the whole network, on 5,798 training pairs, with ImageNet's normalisation | a task different from ImageNet with plenty of data → fine-tune everything |
| Our 7B and the 3B (Qwen2.5-VL) | the whole model, frozen | small LoRA adapters added to the language layers (the 3B learns from the 7B the same way, L2) | a huge model and little data for its size → freeze the reused layers and train only the new parts |
| L0b (19 Nov) | the kept 7B, frozen | one LoRA adapter on both its language layers and its upper vision blocks, on 1,800 building crops | step 3: unfreeze upper blocks when the task differs from the original |

**Two results the lecture explains:**
- **L0b.** The 7B's vision part was frozen only because the DisasterM3 paper's recipe freezes it. Frozen, the 7B called 298 of Part B's 300 buildings intact (100 of 300 right). With its upper vision blocks trained, it got 176 right, and on destroyed buildings it beat our grader (86 against 66). Satellite damage is far from the everyday photos the vision part was pretrained on, so this is the case where the lecture says to unfreeze.
- **Super-resolution (R16c step 7).** The grader learned on ordinary crops. Crops enlarged by Swin2SR or Real-ESRGAN looked different from what it learned on, and it got slightly but surely worse (destroyed IoU 0.3066 → 0.3025 and 0.3006). This is the lecture's warning to feed a pretrained model inputs like the ones it learned from.

**What wasn't tried, and why:** a staged schedule for R11 or the grader (head first, then the top blocks at a 10 times lower rate). The fine-tuning runs R1–R12 had stopped improving beyond noise (about 0.005 mIoU), and the GPU hours went to the system instead.
