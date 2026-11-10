# Offline RAG + KR2 counting (Ridita)

This folder has my work for the next update. It has three parts:

1. **An offline search of disaster guidelines**, for DisasTeller (RAG v1).
2. **Building counting with the R1 model** (KR2): stopped on 26 Oct, see
   review step 5 below.
3. **The guideline lookup for T2** (DisasTeller on local models): a copy of
   DisasTeller that works offline by default, and a test of the search (the
   "retrieval test"). Since 3 Nov the copy uses the team's own model instead
   of Gemini (T2 steps 1–3), with Kaggle notebooks to run and check it. On
   5 Nov it was fixed after Kaggle practice run 2, which stopped because one
   message to the model got too long (see "Practice run 2 and the fixes").
   Since 10 Nov, after practice run 4, it runs as a "fixed flow": the code
   calls the tools, and the model writes each report section by section (see
   "Practice run 4 and the fixed flow"). On 11 Nov the proof run passed: with
   the internet off, the fixed flow wrote all six reports with our model (see
   "Proof run: internet off").

Rule: files from other folders are copied into this folder.
The original files are never changed.


## Words used in this file

| Word | What it means here |
|---|---|
| DisasTeller | Our system that writes disaster reports. Four AI agents work on it together: the Expert team, the Alerts team, the Assignment team and the Emergency service team. |
| Agent | One AI worker in DisasTeller, with its own job and its own tools. |
| CrewAI | The Python library that runs DisasTeller's agents. |
| Gemini | Google's online AI. The original DisasTeller uses it. The copy here uses a local model instead (since 3 Nov). |
| Local model | A model that runs on the same computer, so nothing is sent over the internet. Here: the team's fine-tuned Qwen2.5-VL-7B. |
| vLLM | A program that runs a model fast on GPUs. It answers in the same format as OpenAI's online service, but on the same computer (`localhost`). |
| Token | A word or part of a word. A model's limit on how much it can read and write at once is counted in tokens. |
| Wheel | An installer file for one Python package. With the internet off, packages are installed from wheels. |
| LLM | Large language model: an AI that reads and writes text. |
| RAG | Retrieval-augmented generation. The AI first looks up the right text in documents, then writes its answer with that text. |
| Offline / online | Offline: no internet is used. Online: the internet is used. |
| Section | A small piece of a guideline book (in the code it is called a "chunk"). The search gives back sections. |
| Citation ID | The name of one section, for example `[EMS98-masonry-grade-5]`. A report puts it next to a fact, so a reader can find where the fact came from. |
| Index | All 405 sections, saved in a form that is ready to search. |
| Meaning search (embeddings) | Turns each text into a list of numbers (a "vector"). Texts with the same meaning get similar numbers, so it finds a section even when the words are different. The model is all-MiniLM-L6-v2. |
| Keyword search (BM25) | Finds sections that use the same words as the question. BM25 is the name of the scoring method. |
| Hybrid search | Uses both searches and joins their two lists into one list (by "reciprocal rank fusion"). DisasTeller uses this one. |
| Chroma | A small local database for this kind of search. The laptop used it until 4 Nov (see `local_chroma_db/` below). |
| Backend | How the search runs: Chroma, or numpy + torch (Kaggle, and the laptop since 4 Nov). Both give the same top 3 for all 30 test questions. |
| Delegation | In CrewAI, one agent handing part of its task to another agent. Off in this copy since 5 Nov. |
| Step limit | The most steps (tool calls and answers) an agent may take for one task before it must give its answer (CrewAI's `max_iter`). |
| Fixed flow | Since 10 Nov: DisasTeller run by plain code (`fixed_flow.py`). The code calls the tools in a fixed order, and the model only writes the reports, one section at a time. The agents no longer choose tools. |
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

**pdf_search_tool.py** (first version, not used now)
- The first offline copy of DisasTeller's `pdf_search_tool.py` (25 Oct). It is
  a CrewAI tool, and every result starts with a citation ID, for example
  `[EMS98-masonry-grade-5]`.
- Nothing imports it now. DisasTeller imports
  `disasteller_offline/pdf_search_tool.py`, which searches the same index. This
  file is kept as a record of the first version.

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
- Since 4 Nov `local_chroma_db/` is no longer in git: Aryan's commit
  `8d7203a6c` added it to `.gitignore` and removed it, so it is also gone from
  this laptop. Without the folder, the search uses numpy + torch by itself,
  as on Kaggle (checked on 5 Nov: `search_backend()` says `numpy + torch`).
  It gives the same top 3 as Chroma for all 30 test questions, so nothing
  needs to be brought back. `python guideline_index.py` would make the folder
  again, and git now ignores it.

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
- Since 3 Nov it uses a local model, not Gemini. See "DisasTeller on the local
  model" below.

**make_disasteller_upload.py**
- Packs `disasteller_offline/` for Kaggle into
  `kaggle_upload/disasteller-offline.zip` (the code and the pictures, with each
  file's sha256 and the git commit).

**t2_prep_packages.ipynb**, **t2_prep_model.ipynb**, **t2_disasteller_local_run.ipynb**
- Kaggle notebooks for T2 steps 1–3: the installer files, the model files, and
  the run with its checks. See "DisasTeller on the local model" below.

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
class number). Work on it stopped on 26 Oct, see review step 5 above.

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
  later. The old labelled map, `4_anotated.png`, is there too (moved there on
  3 Nov). Its labels name the same six places as `Expert_team_report.txt`.
- New runs write to `reports/offline/` or `reports/online/`, so they never
  write over those six reports. As in the original, the paths start from the
  folder you run in, so run it from inside `disasteller_offline/`.
- Since 3 Nov, a new run also saves its labelled map there, as
  `4_anotated.png` (see "Other things to fix" below).

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

**What called Gemini until 3 Nov (roadmap T2 steps 1–3), and what replaced it**

| File in `disasteller_offline/` | Gemini did | Since 3 Nov | Used by |
|---|---|---|---|
| `DisasterManagement_teamwork_simulation.py` | the LLM of all four agents (`gemini/gemini-3.1-flash-lite`) | `local_model.crew_llm()` | every task |
| `local_img_tool.py` | described the six photos, all in one request | `local_model.ask_with_images()`, one photo per question | `local_img_interpreter`: Expert and Emergency service teams |
| `global_img_tool.py` | read the map | the same, one picture per question | `global_img_interpreter`: Alerts, Emergency service and Assignment teams |
| `global_annotation_tool.py` | found where to put the grade labels on the map | the same, with the map's size in the question | `global_map_annotation`: Expert team |

**Other things to fix before the offline proof run (System_Design_Notes §2.4)**
- **Fixed on 3 Nov:** the main script copied the Gemini key into
  `GEMINI_API_KEY` and stopped if there was no key. That code is gone; no key
  is needed.
- **Fixed on 3 Nov:** the three image tools no longer call `genai.configure`.
  They still prepare (encode) their pictures as soon as they are imported, but
  that needs no network.
- **Fixed on 3 Nov:** the unused `from langchain.tools import tool as
  langchain_tool` is gone, so `langchain` isn't needed. The unused `openai`
  import in `global_annotation_tool.py` is gone too (`local_model.py` uses
  `openai` now).
- **Fixed on 3 Nov:** on its first run, CrewAI asked if it may upload a trace
  (a record of the run). `CREWAI_TRACING_ENABLED=false` turns this off.
- **Found and fixed on 3 Nov:** with `verbose=True`, CrewAI asks `pypi.org`
  for its newest version. `run_with_netlog.py` caught it in the laptop test.
  `CREWAI_DISABLE_VERSION_CHECK=true` turns it off.
- On a new computer, the Chroma backend downloads its ONNX model (the search
  model in another file format) once, to `~/.cache/chroma`. With the internet
  off, use `GUIDELINE_BACKEND=numpy` and `models/all-MiniLM-L6-v2/`, as on
  Kaggle. CrewAI brings `chromadb` with it, so the Kaggle run notebook sets
  `GUIDELINE_BACKEND=numpy` itself.
- **Fixed on 3 Nov: each run saw the last run's labelled map.**
  - The problem: `global_annotation_tool.py` saved its labelled map as
    `Disaster_image/Global_image/4_anotated.png`. But this tool and
    `global_img_tool.py` send every picture in that folder to Gemini. So the
    agents also saw the old labels, and could copy them instead of working
    out the answer. Each run also wrote over that file, which is in git. And
    the labels were too big: at font size 150, a label such as "South Central
    Asaichi Street: G5" is 2,165 pixels wide, but the map is 1,080 pixels
    wide. So the labels covered each other and ran off the map.
  - The fix: the old map is now at the top of `disasteller_offline/`, next to
    the six old reports. A new run saves its map in `reports/offline/` or
    `reports/online/`. The font size is now 40, so the same label is 575
    pixels wide. `Global_image/` now holds only `2.jpg`, so both map tools
    send only that picture.
  - Fixed later on 3 Nov: the tool's question still said to find the places
    in "the first image" and to label them in "the second image", but there
    was only one picture left (on this PC, the second picture had been the old
    labelled map). The question now talks about one map and gives its size in
    pixels.

**Not done here:**
- the §2.3 rules for online mode (web findings go in their own section, and
  text from a web page is treated as data, not as instructions);
- the H2 facts and T1 hot spots as input (T2 step 5);
- the consistency check (T2 step 7).

**How it was checked.** Until 3 Nov it couldn't run from start to end, because
it needed Gemini. For the local-model version, see "DisasTeller on the local
model" below.
- Each copy was compared with its original by sha256, before any change.
- The task wording was checked by reading both files with a program
  (DisasTeller's code was not run): the online wording is the same as the
  original for all six tasks, the offline wording never mentions the internet,
  tasks 3–6 have the offline rule, and the output paths are under
  `reports/<mode>/`.
- `py_compile` (a check that Python code has no syntax errors) on the two
  files changed then (the main script and `pdf_search_tool.py`), and an import
  of the tool. The import finds `guideline_index` in this folder without
  loading the index.
- The map fix (3 Nov) was tested without Gemini. A fake Gemini gave back six
  labels, so nothing went online. The map was saved in `reports/offline/`,
  and in `reports/online/` with `DISASTELLER_ONLINE=1`. `Global_image/` did
  not change, and each map tool sent one picture. Compared with the
  original, `global_annotation_tool.py` differs only in its header, the font
  size and where it saves the map.


## DisasTeller on the local model (T2 steps 1–3, built 3 Nov)

**Goal (roadmap T2):** no Gemini calls. The four agents and the three image
tools use the team's fine-tuned Qwen2.5-VL-7B, run by vLLM on the same Kaggle
machine. One model does all four jobs, because it reads both text and pictures.
The model is `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, the 7B that L0
kept on 28 Oct. It is the team's current fine-tuned 7B (confirmed 7 Nov; the
details are in [Task_Ledger.md](../Task_Ledger.md), "L0 step 2"). Its counting
score (BDC) is 30.31%, still below the base model's 34.2%, so it does not beat
the base model on counting.

**What changed in `disasteller_offline/`**
- `local_model.py` (new): the one place that says which model is used.
  - `crew_llm()` is the agents' LLM. `ask_with_images()` is what the image
    tools call. Both ask the same local server.
  - The server's address must be on the same computer (`localhost`); any other
    address stops the program, so a wrong setting can't send data out.
- The main script uses `local_model.crew_llm()`. No Gemini key is needed. The
  limit of 2 requests a minute (`max_rpm=2`, for Gemini's free plan) is gone.
- The three image tools ask the local model, one picture per question. The map
  tool's question now talks about one map and gives its size.
- `pdf_search_tool.py` prints each search (`Guideline search: ...`), so the
  check can count them.
- `run_with_netlog.py` (new) runs DisasTeller and records every network
  connection and name lookup it makes, in `netlog.json`. This is the "log
  proving no external API calls" that roadmap T2 asks for.
- `check_run.py` (new) checks a run against the pass rules below.
- `fixed_flow.py` (new, 10 Nov): the fixed flow, which the Kaggle notebook
  runs since practice run 5. See "Practice run 4 and the fixed flow".

**Why these choices**
- **Tool calls in CrewAI's text format** (`LOCAL_LLM_NATIVE_TOOLS=0`). CrewAI
  writes the tool list into the prompt and reads the tool calls from the
  model's text. This works with any model. The other way needs the server to
  handle tool calls itself, and Qwen2.5-VL's standard chat template has no
  section for tools.
- **Stop words go to the server.** CrewAI 1.15.2 cuts an answer at
  `Observation:` only after the whole answer arrives. Without the stop word,
  the model can keep writing a made-up tool result for minutes on a T4.
- **One picture per question.** A 7B handles one picture at a time better, and
  the server then needs to allow only one.
- **A limit of 16,384 tokens** (Abrar's vLLM setting was 4,096). CrewAI gives
  each task all the earlier reports, so task 6 reads tasks 1–5. In the Gemini
  run those were 3,187 words, already about 4,000 tokens or more, before task
  6's own instructions and answer. **Since 5 Nov: 32,768** (see "Practice run
  2 and the fixes").

**Settings** (environment variables, or lines in `disasteller_offline/.env`)

| Setting | Default | What it is |
|---|---|---|
| `LOCAL_LLM_PROVIDER` | `hosted_vllm` | `hosted_vllm` (vLLM) or `ollama` |
| `LOCAL_LLM_MODEL` | `disasterm3-7b` | the model's name on the server |
| `LOCAL_LLM_BASE_URL` | `http://localhost:8000/v1` (Ollama: `http://localhost:11434/v1`) | the server's address; must be on this computer |
| `LOCAL_LLM_CONTEXT` | `32768` (16384 until 5 Nov) | the server's token limit, question and answer together |
| `LOCAL_LLM_ANSWER_TOKENS` | `6144` | the longest answer an agent may write (since 5 Nov); the question is shortened to leave this much room |
| `LOCAL_LLM_TEMPERATURE`, `LOCAL_LLM_SEED` | `0.2`, `0` | how random the answers are; the seed makes a run repeatable |
| `LOCAL_LLM_NATIVE_TOOLS` | `0` | `1` = the server handles tool calls itself |
| `LOCAL_LLM_CALL_LOG` | `llm_calls.jsonl` | one line per model call (since 5 Nov), and per guideline search and finished report, with its time (since 7 Nov), in the folder you run in; empty = none |
| `LOCAL_LLM_MIN_REPORT_WORDS` | `150` | since 9 Nov: a Final Answer with fewer words is sent back to the model, at most twice (see "Practice run 3 and the fixes"); `0` = off. The fixed flow does not use it |
| `DISASTELLER_FLOW` | `agents` | since 10 Nov, read by `run_with_netlog.py`: `fixed` runs `fixed_flow.py`, `agents` the CrewAI version. The Kaggle notebook sets it from `FLOW` in its first cell (`"fixed"`) |

**How to run it on Kaggle**
1. On the laptop: commit, then run `python make_disasteller_upload.py`. Upload
   `kaggle_upload/disasteller-offline.zip` as a **private** dataset named
   `disasteller-offline`. (Run the script after the commit, so the file list
   inside the zip names a clean commit.)
2. On Kaggle, with the internet on, run each of these once with **Save & Run
   All (Commit)**:
   - `t2_prep_packages.ipynb`: the installer files for vLLM 0.25.1 (the version
     that ran on two T4s in Abrar's `3_vllm_evaluation.ipynb`) and CrewAI
     1.15.2;
   - `t2_prep_model.ipynb`: the model files (16.6 GB).
3. `t2_disasteller_local_run.ipynb`, with Accelerator **GPU T4 x2** and four
   inputs: `offline-rag-kr2`, `disasteller-offline`, and the outputs of the two
   prep notebooks. `FLOW` in its first cell says which DisasTeller runs
   (`"fixed"` since 10 Nov).
   - **Practice run:** internet on. Everything is still installed and loaded
     only from the inputs.
   - **Proof run:** internet off, then Save & Run All (Commit). Download
     `t2_run_internet_off.zip` and the notebook with its outputs into
     `results/`, without changing anything.
4. Compare the six new reports with the Gemini reports from 20 July (the six
   `.txt` files at the top of `disasteller_offline/`), in this README. Roadmap
   T2 asks for this.

**On a laptop (a wiring check only).** With Ollama, in PowerShell, from inside
`disasteller_offline/`:

    $env:LOCAL_LLM_PROVIDER = "ollama"
    $env:LOCAL_LLM_MODEL = "qwen3-vl:8b"
    $env:GUIDELINE_BACKEND = "numpy"
    $env:DISASTELLER_FLOW = "fixed"   # since 10 Nov; leave it out for the agent version
    python run_with_netlog.py

This PC has no NVIDIA GPU and 7.8 GB of memory, so a full run here would be
very slow.

**Pass rules, fixed on 3 Nov before any run** (`check_run.py` checks them)
1. The run finished, with no error.
2. All six reports are in `reports/offline/`. Each starts with `Mode: offline`
   and has at least 50 words.
3. Nothing went outside the computer: `netlog.json` lists no connection or
   name lookup outside `localhost`.
4. No Gemini library was loaded.
5. Every question to the model got an answer: the run log has no "Local model
   gave no answer after 3 tries".

The proof run must also have the internet off (Kaggle's setting, and the
notebook's own check). If a rule fails, the run is reported as failed, and any
fix is a new run, reported separately.

Reported, not graded: words, citation IDs (real ones, and ones not in the
index), "not available offline", searches, the labelled map, and the time.
Report quality is judged later: the comparison with the July reports, and the
consistency check (T2 step 7).

Expected risk, written down before the run: a small model may break CrewAI's
tool-call format, or loop (System_Design_Notes §1). If the practice run shows
this, the fallback (a fixed flow: the code calls the tools, and the model only
writes each section) is decided after that run.

**Checked on the laptop (3 Nov), with a pretend model server**
- The pretend server answers in vLLM's format with fixed text: "use each tool
  once, then give a final answer that cites a section from the search".
- A full run of all six tasks passed rules 1–5 (with the internet on):
  - six reports, each citing a real section ID;
  - all four tools used, and the labelled map saved (a Qwen-style box label
    and a normal label drawn, a broken one skipped);
  - every request named the model `disasterm3-7b`, held at most one picture,
    and used seed 0 and temperature 0.2;
  - the agents' requests carried the stop word `Observation:`.
- The first try of that test found CrewAI asking `pypi.org` for its newest
  version. That is now turned off, and the next run showed no connection
  outside the computer.
- With no server, a picture question tries 3 times, then returns "An error
  occurred", and the run log gets the line that rule 5 looks for.
- Every code cell of the three notebooks compiles. The backup chat template
  lays out a conversation in Qwen's format.
- **Not tested here:** vLLM, the real model and the install from wheels. The
  practice run on Kaggle checks these first.

**Kaggle practice run 1 (3 Nov, internet on): stopped before DisasTeller ran**
- What worked: both prep notebooks (248 installer files, 4.5 GB, with vLLM
  0.25.1, CrewAI 1.15.2 and torch 2.11.0; the model, 16.6 GB, float16, with
  its own chat template). In the run, the install from those files, the model
  loading on the two T4s, and the vLLM server (`Server has: ['disasterm3-7b']`).
- Where it stopped: the picture test, with `FileNotFoundError` for
  `Disaster_image/Local_image/Picture1.png`. The code files were in the
  dataset, but not at that path. The zip itself stores the path correctly
  (checked), so the folder layout changed on Kaggle.
- Fix: before anything uses the GPU, the notebook now finds each file listed
  in `disasteller_manifest.json` by its name, checks its sha256, and copies it
  to `/kaggle/working/disasteller/` at the listed path. DisasTeller runs from
  that copy. If a file is missing or changed, the notebook stops there. Tested
  on four made-up layouts: as zipped, all files at the top level, the pictures
  in another folder (all three put right), and one picture missing (stopped
  with its name). `t2_notebook_info.json` records where each file was found.
- This run's outputs were not downloaded, so this note is all that is kept of
  it. Practice run 2 uses the fixed notebook.


## Practice run 2 and the fixes (3–5 Nov)

**Kaggle practice run 2 (3 Nov, internet on): did not pass.** Rules 1 and 2
failed; rules 3, 4 and 5 passed. Its files are in `results/t2_practice_2/`,
as they came from Kaggle. The prep notebook's 4.2 GB of installer files were
moved out of the project on 5 Nov, to `D:\CSE499A_kaggle_downloads\t2_practice_2\`,
so they can't be added to git by mistake. They are also on Kaggle, as that
notebook's output.
- What worked:
  - the file fix from run 1;
  - the model: the team's 7B (`...-l0s2-mergedFP`, commit `def8f6c8`) on two
    T4s, with vLLM 0.25.1 and CrewAI 1.15.2;
  - all three quick tests (text, picture, CrewAI);
  - nothing went outside the computer: 18 connections, all to `127.0.0.1`;
  - every picture question got an answer.
- What happened in task 1 (the Expert team), in 11.4 minutes:
  1. **Photos.** The agent sent its own made-up description as the tool's
     input. The tool added that text to each photo question, and the model
     repeated it: **4 of the 6 descriptions are the same text, reworded.**
  2. **Search.** It searched for "earthquake, disaster, building, road,
     vegetation, Wajima, central area". The search gave `[XBD-6.2]`,
     `[XBD-5.2.2]` and `[EMS98-notes-to-the-table]`: the xBD dataset's
     statistics, not the damage grades.
  3. **Map.** It sent "Wajima: G1, central area: G4". Nothing it had seen
     before says these grades. The model wrote the labels inside a sentence,
     and repeated one label until its answer limit cut it off. The old code
     looked only for a ```json block, so **no label was drawn**.
  4. **The loop.** CrewAI adds its whole tool list (about 1,200 tokens) to
     every third tool result. Right after one such copy, the agent started
     again from step 1. After that it called the same tools with the same
     input, which CrewAI answers with "I tried reusing the same input".
     It also handed its report to the Assignment team once, and tried 6
     more times without naming a team (an error each time).
  5. **The stop.** Every step made the conversation longer, until one
     message had at least 16,385 tokens: one over vLLM's limit of 16,384.
     vLLM refused it. The same happened at the later steps, and for the
     final answer that CrewAI asks for at its step limit. CrewAI started the
     task again 3 times, and each time it ended the same way. No report was
     written.
- What this showed: the model can use CrewAI's text format, because every
  tool call was well formed. The problems are the loop, the length, and the
  weak inputs to the tools.

**The fixes (5 Nov), each for one finding above.** The pass rules are not
changed.

| Finding in run 2 | Fix | File |
|---|---|---|
| One message grew past 16,384 tokens | The limit is 32,768: vLLM's memory held 198,176 tokens in run 2, so this fits. Before every agent call, the conversation is measured. If it is too long, older tool results are shortened first, then the longest message (keeping its start and end). The run log says when this happens ("Model message shortened"). | `local_model.py`, run notebook |
| vLLM got no answer length, and computed "0 tokens left" | Every agent answer may be up to 6,144 tokens long, and the question is shortened to leave that room. If vLLM still says "too long", the call is tried again with a 25% smaller limit (at most twice). | `local_model.py` |
| The tool list came back every third tool use, and the agent started over | The copies after the first are replaced by a one-line reminder of the format. | `local_model.py` |
| The agent looped, and handed work to other teams | Each team may take at most 10 steps per task (CrewAI's default is 25), then must answer. Delegation is off. | main script |
| 4 of 6 photo descriptions were the agent's own text | The photo question no longer includes the agent's text. It asks for the place name on the sticker first. The photos are described once per run; later calls get the same descriptions. | `local_img_tool.py` |
| No label was drawn on the map | The labels are found anywhere in the answer, even in a cut-off list. The same label at the same place is drawn once. A position outside the map is skipped. The tool tells the agent whether the map was labelled. | `global_annotation_tool.py` |
| The search query was a list of loose keywords | The tool's description says: one thing at a time, in the guidelines' words, with two examples. | `pdf_search_tool.py` |
| Three tools said only "Process the text with the LLM" | Each tool now says what it does and what to send. | the three image tools |
| The log didn't show what the model answered | Every model call goes to `run/llm_calls.jsonl`, with vLLM's real token counts. `check_run.py` reports new signals from it. | `local_model.py`, `check_run.py` |

How the size is measured: there is no tokenizer in DisasTeller, so
`local_model.py` estimates the count on purpose a little too high. It counts
one token per 3.5 letters, one per digit, and one per non-English character.
Checked on 5 Nov with Qwen2.5-VL's real tokenizer:
- On the 405 guideline sections, the six old reports, the run-2 log and
  CrewAI's prompts, the estimate is 1.4 to 1.7 times the real count.
- On every agent prompt in the laptop runs below, it was 1.22 to 1.32 times.

**Checked on the laptop (5 Nov), with a stricter pretend server**

The new pretend server:
- counts every prompt with Qwen2.5-VL's real tokenizer;
- refuses a prompt that doesn't fit, with vLLM's own error message;
- reports real token counts;
- can act like run 2: it gives the run-2 photo input and search query, gives
  the two real map answers from run 2, then calls the same tool again and
  again until CrewAI forces an answer.

| Pretend model | Server limit | Biggest real prompt | Refused as too long | Messages shortened | Rules 1–5 |
|---|---|---|---|---|---|
| Uses each tool once, then answers | 32,768 | 10,921 | 0 | 0 | passed |
| Loops like run 2 | 32,768 | 20,629 | 0 | 2 | passed |
| Loops like run 2 | 16,384 (the old limit) | 7,668 | 0 | 35 | passed |
| Loops; the server's real limit (24,000) is lower than DisasTeller thinks (32,768) | 24,000 | 20,629 | 6, each tried again with a smaller limit, then answered | 14 | passed |

- In the loop runs, every team reached its 10-step limit and then wrote its
  report. All six reports were written each time.
- Run 2's first map answer (cut off) now gives 38 complete labels, which are
  1 label after duplicates are removed (G1 at [798, 702], next to the Wajima
  Morning Market). Its second answer gives 3 labels.
- The two example searches in the tool's description work:
  - "EMS-98 damage grade 4 very heavy damage masonry building" gives
    `[EMS98-masonry-grade-4]` first;
  - "Sphere covered living space per person" gives `[SPHERE-3-p1]` first.
- Run 2's own query gives the same 3 sections on the laptop as on Kaggle.
- The notebook's three quick tests work with the new `local_model.py`.
- Only the run notebook changed. The two prep notebooks are byte for byte
  the same, so their Kaggle outputs are used again.
- **Not tested:** how the real 7B behaves with these changes. The pretend
  server shows that a run can no longer stop because a message is too long,
  and that a looping model still ends with six reports. It does not show
  that the reports are good.

**Small fixes (7 Nov)**
- The four agents had `verbbose=True`, a spelling mistake copied from the
  original, which CrewAI ignores. It is now `verbose=True`. So the run log
  also shows "Maximum iterations reached" when a team hits its step limit,
  and CrewAI's error messages. The first two laptop runs above were run
  again: every request to the model had the same size and kind as on 5 Nov,
  all 5 rules passed, and the looping run printed "Maximum iterations
  reached" 6 times.
- Two comments in `guideline_index.py` said the wrong thing, and are fixed.
  Only comments changed, so the code and the search results are the same.
- The top-level `pdf_search_tool.py` is marked as the first version, which
  nothing uses (see "Files").

**Latency (7 Nov): how long each step takes**

Every run now records three kinds of time in `run/llm_calls.jsonl`:

| What | Unit | Where it is measured |
|---|---|---|
| Retrieval: each guideline search | milliseconds | `pdf_search_tool.py`, around the search only. The first search of a run also loads the index and the embedding model; that load is timed on its own. |
| Response: each model call (agent or picture question) | seconds, and answer tokens per second | `local_model.py`, from sending the question to getting the whole answer |
| Each of the 6 reports | minutes | the main script, from CrewAI's start and end time of each task |

- `check_run.py` adds the median, p90 (9 in 10 were at most this) and slowest
  to `t2_run_summary.json`, and prints them as a short table. Calls that ended
  in an error are left out of these times.
- Latency is measured, not graded: no pass rule uses it.
- On the laptop the fake model answers at once, so only the search times are
  real there. The model times mean something only on Kaggle.
- What the model is sent does not change. In the laptop runs, every request
  had the same kind and order as on 5 Nov. Some prompts were up to 9 tokens
  shorter, because each photo answer of the fake model has a random number of
  1 to 3 digits in it.
- Laptop, first test (7 Nov): loading the index took 23.2 s once, and the
  search took 145 ms.

**Expectation for practice run 3, written before it runs**
- Pass: rules 1–5, the same rules as before.
- Report quality is not graded by the rules. It is judged in the comparison
  with the July reports.
- Latency is recorded (see above), but no rule depends on it.
- If every team reaches its step limit (`step_limit_reached` is 6 or more in
  `t2_run_summary.json`), the model is not using the tools well. Then the
  fallback should be decided before the proof run. The fallback is a fixed
  flow: the code calls the tools, and the model only writes each section.

**Next steps (practice run 3)** (done 8 Nov; the result is in the next section)
1. Commit, then run `python make_disasteller_upload.py` (it must say
   `uncommitted changes: False`).
2. On Kaggle, open the `disasteller-offline1` dataset → **New Version** →
   upload the new `kaggle_upload/disasteller-offline.zip`.
3. Open the `t2-disasteller-local-run` notebook → **File → Import Notebook** →
   choose the new `t2_disasteller_local_run.ipynb`. Check that the 4 inputs
   are still attached, with the newest version of `disasteller-offline1`.
4. Accelerator **GPU T4 x2**, internet **on**, **Save Version → Save & Run All
   (Commit)**. The prep notebooks are not run again.
5. Check the printed git commit: it must be the new commit, not `124ad5e77`.
   Download the outputs and the notebook into `results/t2_practice_3/`.
6. If it passes: the proof run, the same with internet **off**.


## Practice run 3 and the fixes (8–9 Nov)

**Kaggle practice run 3 (8 Nov, internet on): did not pass.** Rule 2 failed;
rules 1, 3, 4 and 5 passed. Its files are in `results/t2_practice_3/`, as they
came from Kaggle: `t2_run_internet_on.zip` and the notebook with its outputs.
- The setup:
  - code: commit `0024ae8af`, with no uncommitted changes;
  - dataset: `disasteller-offline1`, Version 2;
  - model: the same 7B as in run 2 (commit `def8f6c8`), with a 32,768-token
    limit;
  - software: vLLM 0.25.1 and CrewAI 1.15.2.
- Timing: the notebook took 9.7 minutes, and DisasTeller itself took 2.6.
- Against the expectation written before the run:
  - no team reached its step limit (`step_limit_reached` is 0, not 6 or
    more), so the fixed-flow fallback is not needed for now;
  - rule 2 failed for a reason the expectation did not foresee: the reports
    are too short.

**What worked, compared with run 2**
- **The "message too long" problem is gone.** The biggest message was 2,808
  real tokens (the limit is 32,768). No conversation had to be shortened.
- **The 6 photo descriptions are all different** (run 2: 4 of 6 were the same
  text). Each one gives the place on its photo's sticker (the bridge photo
  only as "a concrete bridge").
- **The map got 5 labels** (run 2: none).
- Nothing went outside the computer: 12 lookups and connections, all to
  `127.0.0.1`. Gemini was not loaded. Every model question got an answer.

**What went wrong**

| Report | Words (July, Gemini) | What the team did |
|---|---|---|
| Expert team | 12 (524) | Used its three tools, then wrote as its whole report: "The final report is generated based on the provided data and tools." |
| Alerts team | 82 (379) | Used no tool. It wrote about "Region A, B and C" with grades 2, 4 and 6. These places and grades are made up: the Expert report it was given had none. |
| Emergency team | 17 (548) | Called the map tool with no input (`{}`). CrewAI refused the call ("Field required"), and the team wrote that the task "cannot be completed". |
| Resource allocation | 14 (824) | Searched for "INSARAG", then wrote a sentence about the report instead of the report. |
| Public community | 69 (912) | Repeated "Region A, B and C" and said that a full report "could not be generated". |
| Reconstruction plan | 228 (821) | The only real report, but it is built on "Region A, B and C" too. |

- No report cites a guideline ID, although each task asks for it.
- **The model often stops early.** After a tool result, CrewAI asks it to
  "provide the Final Answer" if the task is done. In the Expert and resource
  allocation tasks, the model then wrote a sentence about the report (26 and
  31 answer tokens), not the report.
- Quality warnings (not graded by the rules):
  - Photo 5 (North Asaichi Street) shows cracks in a building, but the model
    called it a "hurricane", with "streets inundated with water".
  - The Expert team gave the Wajima Drama Memorial Hall G2, although the photo
    tool said it has no visible damage (which the photo shows). It gave the
    four other places G4. Its only search was the five place names, which
    found `[XBD-5.2.2]` and two EMS-98 examples, not the grade rules.
  - The Concrete Bridge, which its photo shows broken in the middle, got no
    grade and no label.
  - On the map, the Hama Street label is on Hama Street, and the two Asaichi
    Street labels are on Asaichi Street. But the hall's G2 is next to the
    Morning Market, not on the hall. The "Central Nishikigawa Street" label is
    on Asaichi Street too, far from Nishikigawa Street.

**Latency, the first real times** (from `t2_run_summary.json`)

| What | Median | p90 | Slowest | Count |
|---|---|---|---|---|
| Guideline search | 564 ms | 6,291 ms | 6,291 ms | 3 searches |
| Agent model call | 6.0 s | 13.7 s | 18.3 s | 12 calls |
| Picture model call | 5.6 s | 10.6 s | 10.6 s | 7 calls |

- Loading the search index took 10.8 s, once per run.
- The three searches took 6,291 ms (the first one), 168 ms and 564 ms. The
  first search is probably slow because it is the first one; this is not
  checked.
- The model wrote 14.6 answer tokens per second (median).
- Each report took 0.1 to 1.3 minutes, but only because the reports are so
  short. These times will grow when the reports are full length.

**The fixes (9 Nov).** The pass rules are not changed.

| Finding in run 3 | Fix | File |
|---|---|---|
| A team called the map tool with no input, and gave up | The map tool and the photo tool now accept a call with no input. The map question is then only "Analyze the map for potential dangerous areas." The photo question never used the input. | `global_img_tool.py`, `local_img_tool.py` |
| The model wrote a sentence about the report instead of the report | If a Final Answer has fewer than 150 words, the model is asked again in the same conversation: "write the complete report". At most twice; after that, CrewAI gets the last answer as it is. The run log says "Final Answer too short" each time. | `local_model.py` |
| The tool error did not show in the notebook | The notebook also prints CrewAI's "Tool Error" lines and the new "Final Answer too short" lines. | run notebook |

About the second fix:
- **Why 150 words:** Gemini's six July reports had 379 to 912 words. In run 3
  our model wrote 12 to 228. Every agent's Final Answer in DisasTeller is one
  of the six reports.
- **It makes rule 2 easier to pass.** Rule 2 asks for 50+ words, and the model
  is now asked again below 150. `check_run.py` therefore reports two new
  signals: `final_answers_asked_again` (how often the model was asked again)
  and `final_answers_kept_short` (how often it was still short after two more
  tries). A report that stays short still fails rule 2. Whether a report is
  good must be judged by reading it, in the comparison with the July reports.
- **Why not CrewAI's own way** (a task "guardrail"). In CrewAI 1.15.2, a
  guardrail sends the whole task back, but:
  - it saves the first answer to the report file, not the accepted one;
  - the second try no longer sees the other teams' reports;
  - after its last try it stops the whole run.
- Only CrewAI's own record of the conversation is unchanged: the model sees
  the extra question, CrewAI sees only the final answer. Both questions are
  in `llm_calls.jsonl`.

**Not changed:** the missing citations, the made-up places and the weak photo
and map readings. They are about how well the model writes, and they are
judged in the comparison, not fixed by the code.

**Checked on the laptop (9 Nov)**, with the stricter pretend server, which
has two new modes that act like run 3:

| Pretend model | Asked again | Kept short | Tool errors | Rules 1–5 |
|---|---|---|---|---|
| Like run 3: calls the photo and map tools with `{}`, and its first Final Answer is run 3's 12-word sentence; asked again, it writes a full report | 6 (once per report) | 0 | 0 | passed |
| The same, but the Final Answer stays short | 12 (twice per report) | 6 | 0 | rule 2 failed (each report 12 words); the run still finished |
| Uses each tool once, then a full report (as on 5 and 7 Nov) | 0 | 0 | 0 | passed; the same 27 requests, of the same kinds, as on 7 Nov |

- In the last run, the biggest prompt was 10,932 tokens (10,921 on 7 Nov).
  The two tool descriptions now say the input "may be left out", and each
  fake photo answer has a random number in it, so the sizes differ a little.
- The run notebook was made again from its generator. Only two things in it
  changed: the note at the top and the list of printed lines. The two prep
  notebooks are byte for byte the same.

**Expectation for practice run 4, written before it runs**
- Pass: rules 1–5, the same rules as before.
- `final_answers_asked_again` and `final_answers_kept_short` are recorded.
  - If `final_answers_kept_short` is 1 or more, the model still writes
    sentences instead of reports after being asked. Then the fixed flow (the
    code calls the tools, and the model only writes each section) should be
    decided before the proof run.
- Report quality and latency are recorded, not graded.

**Next steps (practice run 4)** (done 10 Nov; the result is in the next section)
1. Commit, then run `python make_disasteller_upload.py` (it must say
   `uncommitted changes: False`).
2. On Kaggle, open the `disasteller-offline1` dataset → **New Version** →
   upload the new `kaggle_upload/disasteller-offline.zip`.
3. Open the `t2-disasteller-local-run` notebook → **File → Import Notebook** →
   choose the new `t2_disasteller_local_run.ipynb`. Check that the 4 inputs
   are still attached, with the newest version of `disasteller-offline1`.
4. Accelerator **GPU T4 x2**, internet **on**, **Save Version → Save & Run All
   (Commit)**. The prep notebooks are not run again.
5. Check the printed git commit: it must be the new commit, not `0024ae8af`.
   Download `t2_run_internet_on.zip` and the notebook into
   `results/t2_practice_4/`.
6. If it passes: the proof run, the same with internet **off**.


## Practice run 4 and the fixed flow (10 Nov)

**Kaggle practice run 4 (10 Nov, internet on): did not pass.** Rule 2 failed:
every report had 28 to 49 words. Rules 1, 3, 4 and 5 passed. Its files are in
`results/t2_practice_4/`, as they came from Kaggle: `t2_run_internet_on.zip`
and the notebook with its outputs.
- The setup:
  - code: commit `d76fd99a6`, with no uncommitted changes, in the newest
    version of the `disasteller-offline1` dataset;
  - the guideline index: a new copy of the dataset, `offline1-rag-kr2`. Its
    three searches gave the same 3 IDs as the laptop's index (3 of 3);
  - model: the same 7B (commit `def8f6c8`), with a 32,768-token limit;
  - software: vLLM 0.25.1 and CrewAI 1.15.2.
- Timing: the notebook took 13.2 minutes, and DisasTeller itself took 6.2.
- Against the expectation written before the run:
  `final_answers_kept_short` is 1, so the fixed flow had to be decided before
  the proof run. **Ridita decided on 10 Nov: the fixed flow, then practice run
  5, then the proof run.** Four teams reached their step limit
  (`step_limit_reached` 4).

**What went wrong**

| Report | Words (July, Gemini) | What the team did |
|---|---|---|
| Expert team | 49 (524) | Described the photos, called the search with no input, labelled the map with the example grades (point 2 below), then sent the same search 8 times in a row. The saved "report" is that search request. |
| Alerts team | 42 (379) | Used no tool, and wrote a short answer without the "Final Answer:" label. CrewAI takes such an answer as the report. The re-ask of 9 Nov only looks at answers with that label, so it did not see this one. |
| Emergency team | 28 (548) | Searched once, then wrote 28 words. Asked twice for the complete report, it wrote the same 28 words both times (`final_answers_kept_short` 1). |
| Resource allocation | 44 (824) | Searched "[INSARAG]", then sent the example-grades search 10 times in a row. The saved "report" is a search request. |
| Public community | 42 (912) | Sent the example-grades search 11 times in a row. The saved "report" is a search request. |
| Reconstruction plan | 42 (821) | The same; its text is word for word the Public report. |

1. **The model repeated the same step.** After a second identical tool call,
   CrewAI answers "I tried reusing the same input, I must stop using this
   action input. I'll try something else instead." The model ignored this and
   sent the same call again. At the step limit CrewAI asks once more for the
   final answer. The model sent the call again, and CrewAI 1.15.2
   (`handle_max_iterations_exceeded`) saves an answer that is still a tool
   call as the final answer, with all its text.
2. **The grades were copied from an example (a mistake in my 5 Nov change).**
   The map tool's description said: Send the places with their grades, e.g.
   "Hama Street: G4, Wajima Drama Memorial Hall: G2". The Expert team labelled
   the map with exactly this text, and searched for it; three later teams
   searched for it too. The map got these two labels, and every report names
   only these two of the six places. Run 3's map call started with the same
   two grades, and gave the
   other places G4. So the grades of runs 3 and 4 do not come from the photos
   (the hall's photo shows no damage). The example is now gone
   (`global_annotation_tool.py`).
3. **The search tool was called with no input** (`{}`). CrewAI refused it 3
   times ("Field required"). Only three searches ran: the example grades
   (found INSARAG sections 6.1.1, 6.1.2 and 5.5.5), "Hama Street: shelter,
   Wajima Drama Memorial Hall: hospital" (found the Sphere introduction) and
   "[INSARAG]". No report cites a guideline.
4. **Asking again did not help.** It made the Emergency team repeat its
   answer.

**What worked**
- The photo tool's fix of 9 Nov: the Expert team called it with no input, and
  it worked.
- Nothing went outside the computer (12 lookups and connections, all to
  `127.0.0.1`). Gemini was not loaded. Every model question got an answer.
- No conversation had to be shortened. The biggest message was 12,480 real
  tokens.
- The map has 2 labels, both in the right place: Hama Street on Hama Street,
  and the hall's label next to the hall's marker (it runs off the right edge
  of the map).
- The smoke test's photo answer was right this time: "The Wajima Drama
  Memorial Hall has sustained no visible damage".
- The six photo descriptions are word for word the same as in run 3. With
  seed 0 and temperature 0.2 the model gives the same answer to the same
  question, so photo 5 is still called a "hurricane".

**Latency** (from `t2_run_summary.json`)

| What | Median | p90 | Slowest | Count |
|---|---|---|---|---|
| Guideline search | 332 ms | 15,750 ms | 15,750 ms | 3 searches |
| Agent model call | 5.9 s | 7.8 s | 8.8 s | 49 calls |
| Picture model call | 5.8 s | 8.9 s | 8.9 s | 7 calls |

- Loading the search index took 11.3 s, once per run. The first search then
  took 15.8 s more, the other two 0.3 s each.
- The model wrote 12.3 answer tokens per second (median).

**Why the fixed flow.** In three runs, the 7B failed to lead CrewAI's tool
loop in three different ways. In run 2 it called the same tools until a
message was too long. In run 3 it wrote a sentence about the report instead
of the report. In run 4 it repeated the same call until the step limit. Each
fix showed a new problem, and asking again did not help. But the model
answered every single question it was given: the photos, the map and the
smoke tests. The fallback was written down on 3 Nov, before any run: "the
code calls the tools, and the model only writes each section".

**The fixed flow** (`disasteller_offline/fixed_flow.py`, 10 Nov)

The order is always the same:
1. The photo tool describes the six photos.
2. Five searches find the EMS-98 damage grades, one search per grade.
3. The model gives each photo's place a grade, one line per photo:
   "<place name>: G<1-5> - <why>, with the grade's ID". The code reads the
   grades from these lines.
4. The map tool labels the map with these grades.
5. The model writes the rest of the Expert report, section by section.
6. The map tool reads the map for dangerous areas, with the grades.
7. The other five reports follow, in the order of the main script. For each
   one: its searches, then its sections, in the order of the report.

| Report | Sections the model writes | Fixed searches | Facts it gets |
|---|---|---|---|
| Expert team | the grade lines; Overview; Description of the images and locations; Conclusion | "EMS-98 classification of damage to masonry buildings Grade 1 negligible to slight damage", and the same for grades 2–5 | the photo descriptions, the EMS-98 sections |
| Alerts team | Danger area alert; Social media news | none (this team has no search in the agent version either) | the Expert report, the map reading |
| Emergency team | Emergency shelters; Hospitals; Immediate transportation recovery | Sphere covered living space per person; Sphere settlement site area per person location and access; INSARAG handover of rescued patients to medical teams and hospitals | the Expert and Alerts reports, the map reading, the sections found |
| Resource allocation | the 7 headings of task 4 | INSARAG light medium and heavy USAR team types; INSARAG ASR levels assessment search and rescue; INSARAG worksite triage and priorities; INSARAG rescue team shifts and rotation | the Expert, Alerts and Emergency reports, the sections found |
| Public community | the 6 headings of task 5 | Sphere emergency shelter for displaced households; Sphere household items; INSARAG rescue operations | the same three reports, the sections found |
| Reconstruction plan | the 6 headings of task 6 | Sphere repair retrofit or rebuild damaged houses; Sphere debris removal; Sphere technical assistance building codes and construction practices; plus the EMS-98 sections from step 2 | the same three reports, the sections found |

- **What stays the same:**
  - the six reports, their order and their files;
  - the four teams: each team's role, goal and backstory are read from the
    main script when the flow runs, and the model gets them the way CrewAI
    gives them ("You are <role>. <backstory> Your personal goal is: <goal>");
  - what each task asks for, and the headings of tasks 4–6. Tasks 1–3 have
    no headings in the main script, so their sections are the parts their
    task text asks for;
  - the tools, with their questions to the model; the local model and its
    settings; the network log; the pass rules.
- **What changes:**
  - the code calls the tools, and the model never writes a tool call;
  - the searches are fixed: one per topic that the task's text names, in the
    guidelines' words. I tried the wordings on the laptop first and chose
    between a few for two of them (the public shelter search and the
    building-codes search);
  - each section asks for a size in words; the tasks' "around 2000 words"
    is left out;
  - no example names or grades in what the model reads. Left out are the
    main script's "street A: G1, street B: G4" (task 1), "Area A, B, C"
    (task 4), "such as 3" (task 3) and the example ID "[SPHERE-3-p1]". In
    run 3 the model wrote about "Region A, B and C", and in run 4 it copied
    the map tool's example;
  - every report gets the offline rules (before, only tasks 3–6), and starts
    with `Mode: offline, fixed flow`.
- **One change from the plan of 10 Nov:** I had planned to keep CrewAI
  running the six tasks, only without tools. CrewAI does not run in the fixed
  flow. With no tool to choose, it would only add its answer format
  ("Thought / Final Answer"), and that format caused two of run 4's problems.
  The tools are still CrewAI tools; the flow calls their functions directly.
- **Known weak spots:** two of the 18 searches find poor sections. The team
  types search finds hazardous materials, ethics and team ID codes, not team
  types. Of the 3 sections the shifts search finds, only INSARAG3-5.2-p1
  mentions shifts. The search itself was not changed.
- `DisasterManagement_teamwork_simulation.py`, the agent version, is not
  changed and still runs (`DISASTELLER_FLOW=agents`, the default).

**The pass rules are unchanged.** In the fixed flow the code writes each
report's title and its section headings (about 10 to 25 words), and they count
toward rule 2's 50 words. So rule 2 is now only a minimum check. `check_run.py`
therefore also shows each report's words without the headings (the model's
own words), and new signals: `flow`, `sections_written`, `section_words_median`
and `section_words_min`, `grades_found`, and the time of each section question.

**Checked on the laptop (10 Nov)**, with the pretend server (now also
answering the fixed flow's questions):

| Pretend model | Result |
|---|---|
| Fixed flow, full sections | Rules 1–5 passed. 36 model questions: 6 photos, the grade lines, the map labels, the map reading and 27 sections. 18 searches, 6 grades read, 100 citations, all real. The biggest question was 7,502 real tokens. Each text question had its team's role as the system message. |
| Fixed flow, every section 4–6 words | Rule 2 failed for 4 reports (29 to 46 words), as it should. The run finished. |
| Fixed flow, one section always fails | Rule 5 failed ("Local model gave no answer after 3 tries"), as it should. The run finished, with all six reports. |
| Agent version, normal | Rules 1–5 passed: the same 27 requests, of the same kinds, as on 7 and 9 Nov. |
| Agent version, like run 3 | Rules 1–5 passed: the 6 short answers were asked again, as on 9 Nov. |

- The run notebook was made again from its generator:
  - `FLOW = "fixed"` in the first cell;
  - a fourth smoke test (a question the way the fixed flow asks it);
  - more printed lines;
  - `"flow"` in `t2_notebook_info.json`.

  The two prep notebooks are byte for byte the same.

**Expectation for practice run 5, written before it runs**
- Pass: rules 1–5, the same rules as before.
- Expected signals: `flow` "fixed", `sections_written` 28 (27 sections and
  the grade lines), `grades_found` 6 (one per photo), and no step limit or
  re-ask (there are no CrewAI agents).
- If `grades_found` is less than 6, or `section_words_min` is less than 20,
  the result says so, and those answers are read before the proof run.
- Report quality is not graded by the rules: made-up places, citations, and
  whether the grades fit the photos. It is judged in the comparison with the
  July reports.
- Time: 28 section questions of about 10 to 30 seconds each, so DisasTeller
  should take about 10 to 15 minutes. Latency is recorded, not graded.

**Next steps (practice run 5)** (done 10 Nov; the result is in the next section)
1. Commit, then run `python make_disasteller_upload.py`. It must say
   `uncommitted changes: False` and pack 17 files (`fixed_flow.py` is new).
2. On Kaggle, open the `disasteller-offline1` dataset → **New Version** →
   upload the new `kaggle_upload/disasteller-offline.zip`.
3. Open the `t2-disasteller-local-run` notebook → **File → Import Notebook** →
   choose the new `t2_disasteller_local_run.ipynb`. Check that the 4 inputs
   are attached (the guideline index: `offline1-rag-kr2`), with the newest
   version of `disasteller-offline1`.
4. Accelerator **GPU T4 x2**, internet **on**, **Save Version → Save & Run All
   (Commit)**.
5. Check the printed git commit: it must be the new commit, not `d76fd99a6`.
   Download `t2_run_internet_on.zip` and the notebook into
   `results/t2_practice_5/`.
6. If it passes: the proof run, the same with internet **off**.


## Practice run 5: the fixed flow with our model (10 Nov)

**Kaggle practice run 5 (10 Nov, internet on): passed rules 1–5.** It was the
first run of the fixed flow with our model. Its files are in
`results/t2_practice_5/`, as they came from Kaggle: `t2_run_internet_on.zip`
and the notebook with its outputs (`t2-disasteller-local-run-5.ipynb`, from
the Kaggle notebook `notebookfd1ba7ee9c`, Version 2).
- The setup:
  - code: commit `258a4f381` (the merge after `a42622baa`), with no
    uncommitted changes, in the newest version of the `disasteller-offline1`
    dataset (17 files, with `fixed_flow.py`);
  - the guideline index: another copy of the dataset, `offline-rag-kr25`
    (its title on Kaggle is "offline-rag-kr2(5)"). All 18 searches gave the
    same 3 IDs as the laptop's index (18 of 18);
  - model: the same 7B (commit `def8f6c8`), with a 32,768-token limit;
  - software: vLLM 0.25.1. CrewAI 1.15.2 is installed, but the fixed flow
    does not run it.
- Timing: the notebook took 13.9 minutes, and DisasTeller itself took 6.2.

**Against the expectation written before the run**

| Expected | Run 5 |
|---|---|
| Rules 1–5 pass | passed |
| `flow` "fixed" | "fixed" |
| `sections_written` 28 | 28 |
| `grades_found` 6 | **5** (see below) |
| No step limit, no re-ask | 0 and 0 |
| `section_words_min` 20 or more | 37 |

**`grades_found` is 5, not 6.** As the expectation asked, the grade lines were
read before the proof run. The model wrote 5 lines and skipped the Concrete
Bridge. Its photo description gives no place name ("a catastrophic collapse
of a concrete bridge"), and the grade question says to take each place name
from the photo's description. The code read all 5 lines correctly. So the
bridge has no grade line and no map label. Only the Expert report's
description of the photos mentions it, as G5.

**The reports**

| Report | Words (the model's own, without headings) | July, Gemini |
|---|---|---|
| Expert team | 647 (620) | 524 |
| Alerts team | 211 (192) | 379 |
| Emergency team | 312 (293) | 548 |
| Resource allocation | 764 (736) | 824 |
| Public community | 506 (486) | 912 |
| Reconstruction plan | 818 (787) | 821 |

**What is good**
- Every report is a real report with all its sections, about the places in
  the photos. No report makes up places, as run 3 did with "Region A, B and C".
- The grades follow the photo descriptions, not an example:
  - Wajima Drama Memorial Hall G1 (its photo shows no damage);
  - Hama Street G4;
  - Central Nishikigawa Street G4;
  - North Asaichi Street G4;
  - South Central Asaichi Street G5.
- The Expert report cites 11 times, all real IDs.
- The map has 5 labels, with the grades only. The hall's G1 and Hama Street's
  G4 are in the right place.
- Nothing went outside the computer (4 lookups and connections, all to
  `127.0.0.1`). Gemini was not loaded. Every question got an answer. No
  question had to be shortened: the biggest was 6,405 real tokens.

**Quality problems.** The rules don't grade these; they go to the comparison
with the July reports.
- **The map reading was wrong, and other reports repeated it.** Asked for
  dangerous areas, with the grades, the model answered that there are "no
  areas with high or critical damage levels (G5)" and "no dangerous zones".
  - The Alerts report lists the four damaged streets as dangerous, then adds
    "No high-risk zones were detected".
  - The Emergency report says that no extra medical points are needed.
  - The Public report repeats "no high-risk zones".
- **A made-up phone number.** The Public report gives "our emergency response
  hotline at 123456789", although the offline rules say to write "not
  available offline" for contact details. No report uses that phrase.
- **Few citations.**
  - Only the Expert report cites in square brackets.
  - The Reconstruction plan names 6 real sections in its Appendices, all from
    its own searches, but without brackets, so `check_run.py` does not count
    them.
  - The other four reports cite nothing, although three of them were given
    guideline sections.
  - One Expert citation, `[EMS98-rc-grade-5]`, is a real section that the
    model was not shown.
- **The bridge:** apart from the missing grade, the Reconstruction plan puts
  "the collapsed bridge on South Central Asaichi Street", which no input says.
- **Repetition and mix-ups.**
  - In the resource allocation and public reports, the Introduction and the
    Current Situation say almost the same thing.
  - The allocation plan sends 10 medical staff "In South Central Asaichi
    Street ... in unaffected areas like the Wajima Drama Memorial Hall".
  - Its numbers are the model's own plan, from no input: 10 medical staff,
    3 light, 2 medium and 1 heavy USAR teams, and 10 vehicles.
- **Photo 5** is still called a "hurricane" (the six photo descriptions are
  word for word the same as in runs 3 and 4), and North Asaichi Street's
  grade line gives "water inundation" as a reason.
- On the map, the other three labels are not on their streets. Central
  Nishikigawa Street's G4 is on Asaichi Street, and the labels of North and
  South Central Asaichi Street are east of Asaichi Street.

**Latency** (from `t2_run_summary.json`)

| What | Median | p90 | Slowest | Count |
|---|---|---|---|---|
| Guideline search | 118 ms | 466 ms | 6,399 ms | 18 searches |
| Section question | 8.4 s | 14.0 s | 29.4 s | 28 questions |
| Picture question | 6.0 s | 11.3 s | 11.3 s | 8 questions |

- Loading the search index took 11.7 s, once per run. The first search then
  took 6.4 s; the others took 20 to 466 ms.
- The model wrote 14.9 answer tokens per second (median). Each report took
  0.3 to 2.0 minutes.

**Next: the proof run, as planned before the run.** The same notebook, inputs
and code, with the internet off. The quality problems above are not fixed
before it. They are about how the model writes, not about running offline.
Any fix is a new run, reported separately.

**Expectation for the proof run, written before it runs**
- Pass: rules 1–5, with the internet off (Kaggle's setting, and the
  notebook's own check), and the code commit `258a4f381`.
- The model gave the same answers to the same questions in runs 3, 4 and 5
  (seed 0). So the six reports are expected to be the same as in run 5, or
  nearly. Any difference is recorded, not graded.

**Steps for the proof run** (done 11 Nov; the result is in the next section)
1. Upload nothing and change nothing. Open the same Kaggle notebook
   (`notebookfd1ba7ee9c`), with the same four inputs.
2. In Session options, set the internet **off**. Accelerator **GPU T4 x2**.
3. **Save Version → Save & Run All (Commit)**.
4. The notebook must print "Internet is OFF" and `git commit 258a4f381`.
   Download `t2_run_internet_off.zip` and the notebook into
   `results/t2_proof/`.


## Proof run: internet off (11 Nov)

**The proof run passed.** On 11 Nov (Kaggle's clock: 10 Nov, 18:31 to 18:45
UTC), DisasTeller ran on Kaggle with the internet off, with the team's 7B and
the fixed flow, and passed rules 1–5. The notebook printed "PASSED: the
offline proof (internet off)". Its files are in `results/t2_proof/`, as they
came from Kaggle: `t2_run_internet_off.zip` and the notebook with its outputs.
Kaggle names the notebook file after the notebook's title, so it has the same
name as run 5's (`t2-disasteller-local-run-5.ipynb`). The folder says which
run it is.

**The internet was off, checked in two ways**
- Kaggle's own setting, saved in the notebook file: `"isInternetEnabled":
  false` (run 5: `true`).
- The notebook's own test could not reach `huggingface.co`, and printed
  "Internet is OFF: nothing below can download anything. This is the proof
  run." The test needed 32 seconds to give up. In run 5 it connected in 0.06
  seconds.

**The same setup as run 5**
- Code: commit `258a4f381`, packed 2026-11-10 19:53:06, with no uncommitted
  changes. All 17 files matched their sha256.
- The same four inputs, in the same versions. The notebook file names them by
  Kaggle's IDs, the same as in run 5: the datasets 21954144 and 21954333, and
  the outputs of the prep notebooks 365318266 and 365326389.
- The same model (`AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, commit
  `def8f6c8`) and software (vLLM 0.25.1, CrewAI 1.15.2, torch 2.11.0+cu130,
  transformers 5.20.2), on GPU T4 x2, with `FLOW = "fixed"`. The pip log is
  byte for byte the same as in run 5.

**The pass rules**

| Rule | Result |
|---|---|
| 1. The run finished, with no error | PASS: exit code 0 |
| 2. All six reports, each starting `Mode: offline`, each 50+ words | PASS: 192 to 787 words of the model's own |
| 3. Nothing went outside the computer | PASS: 4 lookups and connections, all to `127.0.0.1:8000` (our model's server); outside: none |
| 4. No Gemini library was loaded | PASS |
| 5. Every question to the model got an answer | PASS: no retries, no failed calls |

Also checked: no key, token or password in the notebook or in any file of the
zip, and no web address other than `127.0.0.1` in the three logs (vLLM,
DisasTeller and pip).

**Against the expectation written before the run**

| Expected | Proof run |
|---|---|
| Rules 1–5 pass, internet off, commit `258a4f381` | yes |
| The six reports the same as in run 5, or nearly | exactly the same |

- The six reports and the labelled map are byte for byte the same as in run 5.
- All 61 lines of the call log are the same as in run 5, apart from the times:
  the same 8 picture questions, 18 guideline searches and 28 section
  questions, with the same answers and the same token counts. The four short
  tests before the run gave the same answers too.
- The vLLM server printed the same 20 warnings as in run 5. They are normal
  on T4 GPUs (for example "FA2 is only supported on devices with compute
  capability >= 8").

So switching the internet off changed nothing: run 5 did not use it, and the
proof run could not.

**Time** (run 5 in brackets)

| What | Median | p90 | Slowest | Count |
|---|---|---|---|---|
| Guideline search | 136 ms (118) | 473 ms (466) | 7,167 ms (6,399) | 18 searches |
| Section question | 8.1 s (8.4) | 13.8 s (14.0) | 27.4 s (29.4) | 28 questions |
| Picture question | 5.4 s (6.0) | 17.4 s (11.3) | 17.4 s (11.3) | 8 questions |

- The notebook took 13.7 minutes (13.9). vLLM was ready after 7.4 minutes
  (7.3), including 2.0 minutes of installing. DisasTeller itself took 6.1
  minutes (6.2).
- The model wrote 16.0 answer tokens per second (14.9).

**What the proof shows, and what it does not**
- It shows that DisasTeller's fixed flow runs with the team's 7B on two T4
  GPUs, with no internet and no Gemini: 6 photo descriptions, the map
  reading, 18 guideline searches, 28 sections and the labelled map. Its
  network log is the "log proving no external API calls" that roadmap T2
  asks for.
- It does not show that the reports are good. They are the run 5 reports,
  with the same quality problems (see "Practice run 5": the wrong map reading
  repeated in three reports, the made-up hotline, few citations, the bridge).
  Report quality is judged in the comparison with the July reports and in the
  consistency check (T2 step 7).
- It is the fixed flow, where the code calls the tools and the model writes.
  The agent version, where the model chooses the tools through CrewAI, did
  not work with the 7B (practice runs 2–4).

**Next**
- Commit this README, `offline1.md` and the two notebooks
  (`results/t2_practice_5/` and `results/t2_proof/`). The zips are not
  committed: git ignores `*.zip`.
- Roadmap T2: compare the six reports with the Gemini reports of 20 July.
- Quality fixes (the map reading, the hotline, the citations, the bridge)
  only as a new run, reported separately.


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
