# Offline RAG + KR2 counting (Ridita)

This folder has my work for the next update. It has three parts:

1. **An offline search of disaster guidelines**, for DisasTeller (RAG v1).
2. **Building counting with the R1 model** (KR2).
3. **The guideline lookup for T2** (DisasTeller on local models): a copy of
   DisasTeller that works offline by default, and a test of the search (the
   "retrieval test").

Rule: files from other folders are copied into this folder.
The original files are never changed.


## Words used in this file

| Word | What it means here |
|---|---|
| DisasTeller | Our system that writes disaster reports. Four AI agents work on it together: the Expert team, the Alerts team, the Assignment team and the Emergency service team. |
| Agent | One AI worker in DisasTeller, with its own job and its own tools. |
| CrewAI | The Python library that runs DisasTeller's agents. |
| Gemini | Google's online AI. DisasTeller still uses it today. |
| LLM | Large language model: an AI that reads and writes text. |
| RAG | Retrieval-augmented generation. The AI first looks up the right text in documents, then writes its answer with that text. |
| Offline / online | Offline: no internet is used. Online: the internet is used. |
| Section | A small piece of a guideline book (in the code it is called a "chunk"). The search gives back sections. |
| Citation ID | The name of one section, for example `[EMS98-masonry-grade-5]`. A report puts it next to a fact, so a reader can find where the fact came from. |
| Index | All 405 sections, saved in a form that is ready to search. |
| Meaning search (embeddings) | Turns each text into a list of numbers (a "vector"). Texts with the same meaning get similar numbers, so it finds a section even when the words are different. The model is all-MiniLM-L6-v2. |
| Keyword search (BM25) | Finds sections that use the same words as the question. BM25 is the name of the scoring method. |
| Hybrid search | Uses both searches and joins their two lists into one list (by "reciprocal rank fusion"). DisasTeller uses this one. |
| Chroma | A small local database for this kind of search. The laptop uses it. |
| Backend | How the search runs: Chroma on the laptop, or numpy + torch on Kaggle. |
| Kaggle | A website that gives free computers for running notebooks. |
| Hugging Face | A website that stores AI models. |
| Notebook (`.ipynb`) | A file that holds code and the outputs of that code. |
| Commit | In git: one save of files. On Kaggle: "Save & Run All (Commit)" runs the whole notebook again from the start and keeps the outputs as a saved version. |
| Top 3 | The first 3 results of a search. |
| Hit | A test question where at least one expected section is in the top 3. |
| Byte for byte, sha256 | Ways to check that two files are exactly the same. |
| Telemetry | Usage data that a program sends to its maker over the internet. |
| ASR levels | INSARAG's levels of rescue work (ASR = Assessment, Search and Rescue). |
| USAR | Urban search and rescue. |
| T2, O3, KR2 | Names in the team plan. T2 = the task "DisasTeller on local models". O3 = the goal of a full report system that needs no internet. KR2 = the building-counting goal. |
| R1, R11, H2 | R1 and R11 are our models that mark damaged buildings in photos (R11 looks at the before photo and the after photo). H2's table lists every building that R11 found in the benchmark (test) images, one row per building. |


## Abrar's review of 26 Oct: what each step did

Abrar's review asked for 7 steps. Here is what each step did, and why.

1. **A copy of DisasTeller that is offline by default** (`disasteller_offline/`).
   - What: the guideline search is linked to this folder's index, and the
     online switch from System_Design_Notes §2 is added.
   - Why: O3 promises a full report with no internet. So offline is the
     default, and it is the only mode that is graded.
   - More: see "DisasTeller, offline by default".
2. **30 test questions, fixed before any search ran**
   (`retrieval_test/questions.csv`). The pass rule was also written down first.
   - Why: the reports cite what this search gives back, and nobody had
     measured the search before. When the test is fixed first, it can't be
     changed to fit the results.
   - More: see "Retrieval test of the guideline search".
3. **The test run: passed, 27 of 30** (24 were needed to pass).
   - The meaning search alone got 20, so the hybrid search stays.
   - More: also in "Retrieval test of the guideline search".
4. **Kaggle proof of the day-1 check: passed with version 2.**
   - It ran as a commit on 27 Oct, with Kaggle's Internet setting off. It
     printed `Internet is OFF`, search `16/16` and `Counter OK`, as expected
     before the run.
   - Version 1 had the internet on, so it doesn't count.
   - Why: the graded T2 run is on Kaggle with the internet off
     (System_Design_Notes §2.4). So the search must work there with nothing
     downloaded.
   - Version 2 (public):
     https://www.kaggle.com/code/riditaafrin/day1-kaggle-check?scriptVersionId=362688031
   - More: see "Running on Kaggle with internet turned off".
5. **Counter:** work on `hybrid_bdc_counter.py` has stopped.
   - Why: H2's table already lists R11's buildings one by one (see "Files").
6. **Sphere:** the Sphere PDF and its sections stay as they are until Abrar
   decides.
   - Why: we need Sphere's permission to put the handbook online, and this
     repository is public (see "Source documents").
   - Checked 27 Oct: the PDF is unchanged and kept out of git, and its 61
     sections are the same as in the first push.
7. **This README:** it gives each step's reasons, the expectation fixed before
   the test, and the result compared with that expectation.


## Files

**guideline_index.py**
- Reads the guideline PDFs and cuts them into sections.
- Saves the sections in a local search index (Chroma).
- Searches the index with meaning search (embeddings) and keyword search
  (BM25) together.
- Runs on a normal CPU. Needs no API key (a password for an online service)
  and no internet.

**pdf_search_tool.py**
- An offline copy of DisasTeller's `pdf_search_tool.py`.
- It is a CrewAI tool, so the agents can call it.
- Every result starts with a citation ID, for example `[EMS98-masonry-grade-5]`.
- DisasTeller itself imports `disasteller_offline/pdf_search_tool.py`, which
  searches the same index.

**hybrid_bdc_counter.py**
- A copy of Abrar's counter
  (`support/Abrar/Implementation_DisasterM3/hybrid_bdc_counter.py`).
- New option `--mode r1` for R1's labels:
  0 = Background, 1 = Intact, 2 = Damaged, 3 = Destroyed.
- The CSV also gets one count for each class (intact, damaged, destroyed).
- Work on it has stopped (review, 26 Oct). H2's table already lists R11's
  buildings one by one (117,687 buildings in 2,652 benchmark images). See
  [H2's README](../Champion_Task/H2-results/H2/README.md).

**guidelines/**
- The source documents (the guideline books). See the list below.

**guideline_chunks.jsonl**, **guideline_embeddings.npy** and **local_chroma_db/**
- `guideline_index.py` makes them.
- Make them again after you change anything in `guidelines/`.
- A search with the Chroma backend rewrites two files in `local_chroma_db/`
  (a lock row in `chroma.sqlite3`, and an index file `length.bin`). The data
  does not change, but git then shows these two files as modified. Undo this
  with `git checkout -- local_chroma_db/` before you commit.

**models/all-MiniLM-L6-v2/**
- A PyTorch copy of the meaning-search model (90 MB). Kaggle uses it.
- If it is missing, `make_kaggle_upload.py` downloads it from Hugging Face.

**make_kaggle_upload.py**
- Puts everything Kaggle needs into one file: `kaggle_upload/offline-rag-kr2.zip`.

**day1_kaggle_check.ipynb**
- A Kaggle notebook. It proves that the search and the counter work on Kaggle
  with the internet off.

**disasteller_offline/**
- A copy of DisasTeller (`support/Ridita_Integration_of_VLM__/DisasTeller/`),
  offline by default. See "DisasTeller, offline by default" below.

**retrieval_test/**
- `questions.csv`: 30 questions that a DisasTeller report needs, and the
  sections that answer them. See "Retrieval test of the guideline search" below.
- `run_retrieval_test.py` runs the test. It writes `results.csv` (the top 3 for
  each question, and whether it is a hit) and `results_summary.json` (the
  counts, the misses and every ranking).

`models/` and `kaggle_upload/` are listed in this folder's `.gitignore`, so git
does not save them. They are too big for git, and both can be made again.


## Source documents

**EMS98**: European Macroseismic Scale 1998
- Pages used: 8 to the end.
- Copied from `support/Ridita_Integration_of_VLM__/DisasTeller/Guidelines/`.

**XBD**: the xBD paper (Gupta et al., 2019)
- Pages used: 1 to 8 (page 9 is the list of references).
- From https://arxiv.org/pdf/1911.09296

**XBD-joint-damage-scale**: the damage labels 0 to 3 that xBD uses
- In the PDF, this table is a picture (Figure 4, page 4), so the program
  can't read it.
- So it is typed out word for word in
  `guidelines/xBD_Joint_Damage_Scale_Figure4.txt`.

**IWGSEM**: IWG-SEM Building Damage Assessment v1.0
- The damage guide that Copernicus EMS Rapid Mapping uses.
- Pages used: 3 to 8.
- From https://www.un-spider.org/sites/default/files/IWG_SEM_Guidelines_Building%20Damage%20Assessment_v1.0.pdf

**INSARAG3**: INSARAG Guidelines 2020, Volume III (Operational Field Guide)
- Pages used: 7 to the end.
- From https://www.insarag.org/guidelines

**INSARAG2B**: INSARAG Guidelines 2020, Volume II, Manual B (Operations)
- Pages used: 6 to 55.
- From https://www.insarag.org/guidelines

**SPHERE**: Sphere Handbook 2018, the Shelter and Settlement chapter
- Pages used: 275 to 324.
- The official website (spherestandards.org) blocks downloads by a script,
  so this copy is from globalprotectioncluster.org.
- Important: you may use it for study and research, but you need Sphere's
  permission to put it online. So do NOT push `Sphere_Handbook_2018_EN.pdf`
  to a public GitHub repo.
- Kept as it is until Abrar decides (review, 26 Oct): the PDF and its 61
  SPHERE sections. These sections hold the chapter's text, and they are in
  git, in `guideline_chunks.jsonl` and in `local_chroma_db/chroma.sqlite3`.


## How to run

List the sections that the program finds (this builds nothing):

    python guideline_index.py --dry_run

Build the index (about one minute):

    python guideline_index.py

Search the index:

    python guideline_index.py --query "collapsed ground floor"

Count buildings in R1's masks (a mask is a picture where each pixel has a
class number):

    python hybrid_bdc_counter.py --mask_dir masks/ --mode r1 --output counts.csv


## Running on Kaggle with internet turned off

Kaggle does not have `chromadb`. So on Kaggle, the search uses the saved
vectors (`guideline_embeddings.npy`) and a PyTorch copy of the same model.
It needs only `numpy`, `torch` and `transformers`, and Kaggle already has them.
So nothing needs to be installed or downloaded.

1. On the laptop, make the upload file:

       python guideline_index.py        # only if you changed guidelines/
       python make_kaggle_upload.py

2. On Kaggle: **Datasets → New Dataset**. Upload
   `kaggle_upload/offline-rag-kr2.zip`, name it `offline-rag-kr2`, and keep it
   **Private**.
3. **Code → New Notebook → File → Import Notebook**, and choose
   `day1_kaggle_check.ipynb`.
4. In the **Settings** menu, click **Turn off internet** (after that, the item
   reads "Turn on internet"), and set **Accelerator → None**. Then click
   **+ Add Input** → your `offline-rag-kr2` dataset.
5. **Run All**. You should see `Internet is OFF`,
   `Search backend: numpy + torch`, `16/16` and `Counter OK`.
6. **Save Version → Save & Run All (Commit)**. Kaggle runs the whole notebook
   again with these settings, and the saved version keeps its outputs as the
   proof.
7. When the version has finished, open it. Download into `results/` the
   notebook with its outputs, and `day1_kaggle_check.json` from its **Output**
   tab. Never change an output by hand.
8. **Share** the notebook with the Kaggle account `abrarmohammedtanzim` (or
   make it public). Put the version's link (the address with
   `scriptVersionId=`) under "Kaggle proof" below.

**Kaggle proof (review step 4): version 2, with the internet off, passed.**
https://www.kaggle.com/code/riditaafrin/day1-kaggle-check?scriptVersionId=362688031

**Version 2** (27 Oct, committed at 09:26, ran for 69 s). It was downloaded
without any change into `results/v2_internet_off/`
(`day1-kaggle-check.ipynb`, `day1_kaggle_check.json`).
- **The internet was off.** Kaggle's own record in the notebook (its
  metadata) says `"isInternetEnabled": false`. Cell 2 printed
  `Internet is OFF`, and the JSON says `"internet": "off"`. Cell 2 tried to
  connect and failed after 32 s; in version 1 it connected in 0.06 s.
- **Everything else passed:** no accelerator (`"accelerator": "none"`,
  `"isGpuEnabled": false`), `chromadb installed: False`,
  `Search backend: numpy + torch`, `16/16` and `Counter OK`. The demo search
  gave the same top 3 as version 1.
- **The same input as version 1:** both used dataset version 21290657. Cell 1
  lists the same files as `kaggle_upload/offline-rag-kr2/`. That folder's code
  and index files are exactly the same as this folder's, byte for byte (only
  its README is older).
- Checked: it is a committed run (Kaggle's papermill record shows 6 code cells
  run in order, with no error). Every cell's code is the same as in
  `day1_kaggle_check.ipynb`. The JSON file is exactly the summary that the
  notebook printed, byte for byte.
- In cell 3, the progress bar for loading the model is saved at `0/103`. This
  is because the notebook file keeps only the first picture of the bar. The
  next line shows that the search ran.
- Link: https://www.kaggle.com/code/riditaafrin/day1-kaggle-check?scriptVersionId=362688031
- The notebook is public: the link opens without a login (checked 27 Oct). The
  `offline-rag-kr2` dataset stays private (Kaggle shows it as
  "[Private Datasource]"). So anyone can see the outputs, but only people with
  access to the dataset can run the notebook again.

**Version 1** (27 Oct, committed at 08:31, ran for 48 s). Its files were
checked and then not kept, because only version 2 is the proof.
- **The internet was on.** The notebook printed `Internet is ON`, the JSON
  says `"internet": "on"`, and Kaggle's own metadata in the notebook says
  `"isInternetEnabled": true`. With the internet on, the run can't show that
  nothing was downloaded. So it isn't the offline proof.
- Everything else passed: no accelerator, the `offline-rag-kr2` dataset
  attached, `Search backend: numpy + torch`, `16/16` and `Counter OK`. The demo
  search's top 3 (`EMS98-rc-frame-mexico-city-2`,
  `EMS98-rc-frame-north-pelopponissos-2`, `INSARAG2B-5.8.2-p1`) is also what
  this PC gives on the upload folder.
- Checked: it is a committed run (Kaggle's papermill record shows 6 code cells
  run in order). Every cell's code is the same as in `day1_kaggle_check.ipynb`.
  The JSON file is exactly the summary that the notebook printed, byte for
  byte.

**Checked on 27 Oct, before version 1:**
- `kaggle_upload/offline-rag-kr2.zip` (made 25 Oct) still matches the index
  and the code byte for byte, and it holds no PDF. So it could be uploaded as
  it is. Only its copy of this README is older, and the notebook doesn't read
  the README.
- The notebook's search and counter checks were run on this PC, on the
  unpacked upload folder, with the Kaggle backend (numpy + torch): `16/16` and
  `Counter OK`.
- The notebook's last cell now asks for Save & Run All (Commit), not Quick Save.

In later notebooks (Day 3), add the same dataset and use:

    import glob, os, sys
    sys.path.insert(0, os.path.dirname(glob.glob("/kaggle/input/**/guideline_index.py", recursive=True)[0]))
    import guideline_index as gi
    print(gi.format_results(gi.search_guidelines("collapsed buildings, rescue priority", k=3)))


## DisasTeller, offline by default (T2 steps 4 and 6)

**What was copied**
- Everything in `support/Ridita_Integration_of_VLM__/DisasTeller/`, except
  `gemini_chroma_db/` and `__pycache__/` (no file is bigger than 50 MB): 20
  files. Before any change, each copy was checked byte for byte against its
  original.
- The six `.txt` reports at the top of `disasteller_offline/` are the outputs
  of the Gemini run. They were copied without any change, to compare with
  later.
- New runs write to `reports/offline/` or `reports/online/`, so they never
  write over those six reports. As in the original, the paths start from the
  folder you run in, so run it from inside `disasteller_offline/`.

**How the guideline search is linked**
- `disasteller_offline/pdf_search_tool.py` keeps the tool's name,
  `offline_pdf_search_tool`. So the main script imports it without any change
  (line 28).
- It imports `guideline_index.py` from the folder above. It does not copy the
  index into `disasteller_offline/`. Why:
  - `guideline_index.py` finds its built files (sections, vectors, Chroma
    folder, model) next to itself. So DisasTeller searches exactly the same
    index that the retrieval test checks.
  - One rebuild (`python guideline_index.py`) updates both, and no second copy
    can get old.
  - The backend choice stays the same: Chroma on the laptop, numpy + torch on
    Kaggle.
- To use a copy of this folder somewhere else (for example as a Kaggle input),
  set `GUIDELINE_INDEX_DIR` to that folder.
- The tool's description now names all six sources, because the agents choose
  their tools by reading these descriptions.

**The switch (System_Design_Notes §2.2)**
- Offline is the default. `DISASTELLER_ONLINE=1` turns on online mode. You can
  set it as an environment variable (a setting given to a program before it
  starts), or as a line in `.env`. The script prints which mode it runs in.
- Offline: no agent gets the two web tools, and `requests`, `bs4` and
  `duckduckgo_search` are not even imported.
- Online: the web tools and the original wording of tasks 3–6 come back
  without any change (checked letter by letter against the original).
- In both modes:
  - the Emergency service team and the Assignment team also get
    `offline_pdf_search_tool` (before, only the Expert team had it);
  - every report starts with `Mode: offline` or `Mode: online`;
  - CrewAI's telemetry is off. CrewAI 1.15.2 sends it to
    `telemetry.crewai.com` unless `CREWAI_DISABLE_TELEMETRY` is set.

**The offline wording for tasks 3–6**
- The original tells the agents to use the internet in five places: line 140
  (task3), 154 (task4), 176 (task5), 193 (task6) and 202–203 (task6's expected
  output). The review listed 154, 176 and 193. System_Design_Notes §2.1 also
  lists 140 and 202–203, so all five are changed. Why: if an agent is told to
  search but has no search tool, it calls a tool that doesn't exist, or it
  makes up the data.
- Each task is sent to the right guideline:
  - task3 (shelters and hospitals): Sphere for shelter (living space and site
    area for each person, location and access), and INSARAG for handing
    rescued people over to hospitals;
  - task4 (staff allocation): INSARAG (team types, ASR levels, triage and
    priorities at the work site, shifts);
  - task5 (public report): Sphere (shelter, household items) and INSARAG
    (rescue);
  - task6 (reconstruction plan): Sphere (repair, retrofit or rebuild, debris,
    building codes) and EMS-98 (damage grades).
- All four tasks end with the same rule: use only the facts given and the
  guideline search, cite the section IDs, and write "not available offline"
  for anything that needs data the agent does not have: costs, budgets, staff
  numbers from past disasters, population counts or contact details.
- Task6's expected output says "Money needed: not available offline". It asks
  for the order of the steps instead of timelines, so no time lengths are made
  up.

**What still calls Gemini (roadmap T2 steps 1–3, not changed yet)**

| File in `disasteller_offline/` | Lines | What | Used by |
|---|---|---|---|
| `DisasterManagement_teamwork_simulation.py` | 36–42; `llm=gemini_llm` at 93, 104, 116, 128 | `LLM(model="gemini/gemini-3.1-flash-lite")`, the LLM of all four agents | every task |
| `local_img_tool.py` | 7, 13–14, 38, 65 | `genai.GenerativeModel("gemini-3.1-flash-lite")` describes the local images | `local_img_interpreter`: Expert and Emergency service teams |
| `global_img_tool.py` | 7, 13–14, 38, 64 | the same, for the global map | `global_img_interpreter`: Alerts, Emergency service and Assignment teams |
| `global_annotation_tool.py` | 5, 15–16, 62, 100 | the same, to place the grade labels on the map | `global_map_annotation`: Expert team |

**Other things to fix before the offline proof run (System_Design_Notes §2.4)**
- Line 37 copies the Gemini key into `GEMINI_API_KEY`, and it fails if there
  is no key. So until T2 step 2 is done, even offline mode needs a Gemini key
  and the internet.
- The three image tools call `genai.configure` and prepare (encode) their
  images as soon as they are imported, before any task runs.
- `from langchain.tools import tool as langchain_tool` (line 23) is never used,
  but it still needs `langchain` to be installed. Also,
  `global_annotation_tool.py` imports `openai` without using it.
- On its first run, CrewAI asks if it may upload a trace (a record of the
  run). Nothing is sent unless the answer is yes.
- On a new computer, the Chroma backend downloads its ONNX model (the search
  model in another file format) once, to `~/.cache/chroma`. With the internet
  off, use `GUIDELINE_BACKEND=numpy` and `models/all-MiniLM-L6-v2/`, as on
  Kaggle.

**Not done here:**
- the §2.3 rules for online mode (web findings go in their own section, and
  text from a web page is treated as data, not as instructions);
- the H2 facts and T1 hot spots as input (T2 step 5);
- the consistency check (T2 step 7).

**How it was checked.** It can't run from start to end yet, because it still
needs Gemini.
- Each copy was compared with its original by sha256, before any change.
- The task wording was checked by reading both files with a program
  (DisasTeller's code was not run): the online wording is the same as the
  original for all six tasks, the offline wording never mentions the internet,
  tasks 3–6 have the offline rule, and the output paths are under
  `reports/<mode>/`.
- `py_compile` (a check that Python code has no syntax errors) on both changed
  files, and an import of the tool. The import finds `guideline_index` in this
  folder without loading the index.


## Retrieval test of the guideline search (T2 step 4)

**Why:** DisasTeller's reports cite what this search gives back. So the search
must find the section that answers each question a report needs. Nobody had
measured this before: the day-1 check only compares Kaggle's results with the
laptop's results.

**Expectation, written on 26 Oct before any search was run**

*Reworded in simpler English on 1 Nov 2026. The rule is the same. The first
wording is in git, in commit 5f5efb41e.*

- Pass: for at least 24 of the 30 questions, an expected section is in the
  top 3 of `search_guidelines(q, k=3)`.
- The same 30 questions are also scored with each search alone, from the same
  index: the meaning search (embeddings, its top 3) and the BM25 keyword
  search (the top 3 by BM25 score). If the meaning search alone gets at least
  as many hits as the hybrid, the simpler search is kept.
- The run uses this PC's default backend (Chroma). Then the 30 questions are
  run again with `GUIDELINE_BACKEND=numpy` (the Kaggle way), and any
  difference in the top 3 is reported.
- The questions and the expected IDs are not changed after the results are
  seen. If the test fails, it is reported as failed. Any fix is a second run,
  reported separately.

**The questions** (`retrieval_test/questions.csv`, with the columns
`question`, `expected_ids` and `source`)
- 30 questions that a DisasTeller report needs: damage grades by building
  type, rescue priority and triage (deciding who to help first), ASR levels,
  shelter space for each person, household items, the xBD damage labels and
  reconstruction.
- Questions per source: EMS98 5, XBD 4, IWGSEM 4, INSARAG3 4, INSARAG2B 6,
  SPHERE 7.
- `source` is the guideline that the question was written for.
  `expected_ids` lists every section whose own text gives the answer, fully or
  in part, separated by `;`. In 5 questions, one of these sections comes from
  another guideline. Sections that only mention the topic briefly, or need
  extra reasoning to give the answer, are not listed.
- The IDs were chosen by reading all 405 sections in `guideline_chunks.jsonl`.
  A plain text search (grep) of that file was used only to check that no other
  section also answers. The search being tested was not run.
- None of the 30 questions repeats one of the 16 `SANITY_QUERIES` in
  `make_kaggle_upload.py`, which were run while the index was being built. But
  they cover the same topics, so the result may be a little too good.

**Result (27 Oct): passed, 27 of 30.** The numbers come from
`retrieval_test/results.csv` and `results_summary.json`, made by
`run_retrieval_test.py`. "Qn" means row n of `questions.csv`.

| Search | Hits | EMS98 | XBD | IWGSEM | INSARAG3 | INSARAG2B | SPHERE |
|---|---|---|---|---|---|---|---|
| Hybrid, `search_guidelines` (graded) | **27/30** | 4/5 | 4/4 | 4/4 | 3/4 | 5/6 | 7/7 |
| Meaning search alone | 20/30 | 3/5 | 2/4 | 4/4 | 3/4 | 3/6 | 5/7 |
| BM25 keyword search alone | 25/30 | 4/5 | 4/4 | 4/4 | 1/4 | 6/6 | 6/7 |

- **Compared with the expectation:** the hybrid passes the bar of 24 by 3. The
  meaning search alone gets 7 fewer hits, so the hybrid search stays.
- **BM25 alone** gets 25, 2 fewer than the hybrid. The rule fixed before the
  test only compares the meaning search with the hybrid, so this decides
  nothing. The two give different results on four questions: the hybrid finds
  Q21, Q22 and Q28, which BM25 misses, and BM25 finds Q16, which the hybrid
  misses.
- **How sure we can be** (worked out after the run; it changes no decision):
  - The test is an exact sign test on the questions where two searches
    disagree (McNemar's test). It checks if a difference could be just luck.
    A p-value under 0.05 usually means it is probably not luck.
  - Against the meaning search, the hybrid wins 8 of these questions and loses
    1 (p = 0.04).
  - Against BM25, it wins 3 and loses 1 (p = 0.63).
  - So 30 questions show a clear gain over the meaning search, but they can't
    tell the hybrid and BM25 apart.
- **Repeated:** a second run on a copy of the index (27 Oct) gave the same
  `results.csv` byte for byte, and the same summary.
- **The Kaggle way** (`GUIDELINE_BACKEND=numpy`) gives the same top 3 as
  Chroma on all 30 questions, in all three searches.
- **Where the hits are:** the hybrid puts an expected section in first place
  for 16 of the 30. A hit needs only one expected section, and three hits give
  only part of the answer:
  - Q14 finds the meaning of ASR level 4, but not level 3;
  - Q27 finds repair and retrofit, but not rebuilding;
  - Q30 finds a checklist line, but not the structural check (`SPHERE-2-p6`).

**The three misses**
- **Q1, EMS98** ("A brick house has walls that have broken apart and part of
  its roof has fallen in..."): expected masonry grade 4, or one of its five
  examples. The search gave `EMS98-unreinforced-masonry-roermond-the` (a grade 2
  example), `EMS98-masonry-grade-3` and `EMS98-rc-frame-mexico-city` (a grade 3
  example for reinforced concrete, RC). So an agent would probably answer
  grade 3. The meaning search alone found it. This matters for task1, which
  grades buildings with this search.
- **Q16, INSARAG2B** ("One collapsed building has three people confirmed
  alive; at another, neighbours say people are missing..."): expected
  `INSARAG2B-5.8.1-p1`, which says that confirmed live victims come first. The
  search gave `INSARAG2B-5.8.1-p2` (what "confirmed" and "possible" live
  victims mean, but not the order), `INSARAG2B-6.4` (signals) and
  `INSARAG2B-5.7.1-p6` (ASR level 4). BM25 alone found it.
- **Q23, INSARAG3** ("Must medium and heavy USAR teams keep operations running
  24 hours a day?"): expected `INSARAG3-3.2-p3` ("Medium and Heavy Teams are to
  ensure 24-hour operations"). The search gave `INSARAG2B-3.8-p1` (a team
  contact person, ready 24 hours a day), `INSARAG3-2` (the introduction to the
  checklists) and `INSARAG2B-4.3-p1` (work cycles and rest). No search found it.

No fix was tried. A fix would be a second run, reported separately. These 30
questions have now been seen, so a fix judged only on them would be fitted to
this test. A new set of questions would be the fair check.
