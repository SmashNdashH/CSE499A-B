# Offline DisasTeller: what I did on 3–4 Nov 2026 (Ridita)

All of this work is in the folder `Essential_task_delegation/Offline_RAG_KR2/`. The README in that
folder has more detail.


## The short version

- DisasTeller writes disaster reports with four AI "teams". Before, it needed Google's online AI
  (Gemini). **Now it can use our own AI model instead, with no internet.**
- The new code is on GitHub.
- On Kaggle, our model and all the software it needs now install and start with no internet.
- The first full test on Kaggle stopped early, before any report was written. The reason: one
  message to the model was too long. **This is the next thing to fix.**


## Words used in this file

| Word | Meaning |
|---|---|
| Our model | Our own trained AI (Qwen2.5-VL-7B). It can read text and look at pictures. |
| Kaggle | A website that gives free computers with GPUs (graphics cards that run AI fast). |
| vLLM | The program that runs our model on Kaggle's GPUs. |
| CrewAI | The program that runs DisasTeller's four teams. |
| Token | A word, or a piece of a word. Our model could read at most 16,384 tokens at once; since 5 Nov, 32,768. |
| Practice run | A test on Kaggle with the internet on, to find problems. |
| Proof run | The same test with the internet off. This is the real proof. |


## 1. I checked the old work (3 Nov)

All the old results are still correct:
- The guideline search still has 405 sections from 6 guideline books.
- The search test still passes: 27 of 30 questions were answered correctly (24 were needed).
- The Kaggle proof from 27 Oct is still public:
  https://www.kaggle.com/code/riditaafrin/day1-kaggle-check?scriptVersionId=362688031

I fixed two problems:
- **The old map was shown to the AI again.** DisasTeller writes damage grades on a map. It saved
  this map in the same folder as the input pictures, so in the next run the AI also saw the old
  grades and could copy them. Now a new map is saved next to the reports, and the old map is kept
  apart. The writing on the map is also smaller now: before, one label was twice as wide as the map.
- **The README said the building counter was still being worked on.** It now says that this work
  stopped on 26 Oct.


## 2. DisasTeller now uses our own model instead of Gemini

Before, DisasTeller used Gemini in 4 places: as the "brain" of all four teams, and in 3 tools that
look at pictures. **Now all 4 use our own model.**

New files in `disasteller_offline/`:

| File | What it does |
|---|---|
| `local_model.py` | Connects DisasTeller to our model. It only accepts a model on the same computer, so no data can be sent out by mistake. |
| `run_with_netlog.py` | Runs DisasTeller and writes down every internet connection it makes. This shows that nothing went online. |
| `check_run.py` | Checks a run against the 5 rules below. |

**The 5 rules for a run to pass.** I wrote them down before any test, so they can't be changed
later to fit the results.
1. The run finishes without an error.
2. All 6 reports are written. Each one starts with "Mode: offline" and has at least 50 words.
3. Nothing connects to the internet.
4. Gemini is not used at all.
5. Our model answers every question it is asked.

**Test on my laptop.** My laptop has no GPU, so I used a fake model that gives fixed answers.
All 5 rules passed. The test also found two hidden problems, and both are fixed now:
- CrewAI secretly went online to check for a newer version of itself. That would have broken the
  offline proof. It is switched off now.
- Nobody told the model where to stop writing, so it could keep writing for minutes at every step.
  Now it is told.


## 3. Tests on Kaggle

New files in `Offline_RAG_KR2/`:
- `make_disasteller_upload.py`: puts DisasTeller's code and pictures into one zip file for Kaggle.
- Three Kaggle notebooks: two that prepare everything, and one that runs the test.

| Step | What happened |
|---|---|
| Upload DisasTeller to Kaggle | Done (private, 8 MB). |
| Prepare the software | **Passed.** 248 packages (4.5 GB). A check showed they install on Kaggle with no internet. |
| Prepare our model | **Passed.** 16.6 GB, with every file complete. |
| Practice run 1 | **Stopped early.** The software installed and our model started, which is good. But Kaggle had moved our pictures to another folder, so DisasTeller could not find them. |
| The fix | The notebook now finds every file wherever Kaggle puts it, checks that it is exactly the same file, and moves it back to its place. |
| Practice run 2 | **Did not pass:** rules 1 and 2 failed. Rules 3, 4 and 5 passed. |

**Practice run 2, step by step** (the results are in `results/t2_practice_2/`):
- The picture fix worked.
- Our model passed 3 small tests: it answered a text question, it described a photo, and it worked
  with CrewAI.
- DisasTeller then worked for 11 minutes on the first job (the Expert team). It described the 6
  photos, searched the guidelines once, and tried to write grades on the map.
- Then one message to the model became longer than the model can read (16,384 tokens). The run
  stopped there, and no report was written.
- The good news: nothing went online, Gemini was not used, and our model answered every picture
  question.

**What we learned:**
- **No grades were written on the map.** The model gave the map positions inside a normal sentence,
  but the map tool expects them in a fixed format.
- **The conversation kept getting longer.** When the model's answer was not in the form CrewAI
  expects, CrewAI sent the whole list of tools again and asked again. After a few times, the message
  was too long. (We are still checking this.)
- **The same description was repeated.** 4 of the 6 photo descriptions were exactly the same text.
  So the model may not look at each photo carefully. This is a warning about quality.
- **The guideline search was too vague.** The team searched for very general words, so it got the
  wrong guideline sections (numbers about a dataset, instead of the rules for damage grades).


## 4. GitHub

- All of this work is on GitHub now.
- On the same day, Aryan also changed the same four DisasTeller files. We kept our versions,
  because the Kaggle tests use them.
- Aryan's new file `disasteller_inputs.py` is kept, but it is not connected to DisasTeller.
- The saves (commits) on GitHub:
  - `124ad5e77`: our own model, the map fix, the counter note and the Kaggle notebooks;
  - `bedf20e37`: Aryan's work joined with ours;
  - `01d002fd1`: our four DisasTeller files brought back, plus the notebook fix.


## 5. What comes next

1. Fix the "message too long" problem and the map grades, and test the fix on my laptop.
2. Practice run 3 (internet on). When it passes, the proof run (internet off).
3. Compare the new reports with the old Gemini reports from 20 July.
4. Tidy up:
   - move the 4.2 GB folder `results/t2_practice_2/t2-prep-packages(output)` out of the project, so
     it can never be added to git by mistake;
   - bring back the search database `local_chroma_db/` on my laptop, or keep using the other search
     mode, which gives the same results.


## 6. Update on 5 Nov: the fix for practice run 2

The README section "Practice run 2 and the fixes" has every detail.

**Why practice run 2 stopped.** The model kept calling the same tools again and again. Each step
made the conversation longer, until one message was too long for the model. Three other problems
made it worse:
- The photo tool added the team's own guess to each photo question, so the model repeated that guess.
- CrewAI added its whole list of tools (about 1,200 tokens) to every third tool result. Right after
  one such list, the team started its work again from the beginning.
- The team tried to hand its work to another team 6 times without naming the team.

**What I changed:**
- The model can now read 32,768 tokens (16,384 before). The memory on Kaggle has room for this.
- Before every question, DisasTeller measures the conversation. If it is too long, old tool results
  are shortened first. So a message can't be too long any more.
- Each team may take at most 10 steps per job, and then must write its report. Teams no longer
  hand work to each other.
- The photo question asks only about the photo, and names the place on its sticker. The photos are
  described once per run.
- The map tool finds the grades anywhere in the model's answer, so the grades are now drawn on the map.
- The guideline search tells the team to search for one thing at a time, with two examples.
- Every question to the model and its answer is saved in `llm_calls.jsonl`, so the next run shows
  what the model said at each step.

**Test on my laptop.** I used a stricter fake model. It counts the tokens like our real model does,
and it refuses a message that is too long, like the real server. Four tests all passed the 5 rules,
including one that repeats the tools again and again, like in run 2. In that test, each team stopped
after 10 steps and still wrote its report.

**Not tested yet:** how our real model behaves with these changes. Practice run 3 on Kaggle tests that.

**Tidy-up (point 4 above):**
- The 4.2 GB folder is moved out of the project, to `D:\CSE499A_kaggle_downloads\t2_practice_2\`.
- The search now uses the other search mode on my laptop by itself. It gives the same results, so
  `local_chroma_db/` is not needed.


## 7. Update on 7 Nov: the model is confirmed, and small fixes

**The model.** `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` is confirmed. It is our current
fine-tuned 7B (`Task_Ledger.md`, "L0 step 2"), and DisasTeller already uses it. Its counting score
(30.31%) is still below the base model's 34.2%, so it does not beat the base model on counting.

**Small fixes:**
- A spelling mistake from the original code (`verbbose`) is fixed. Now the run log also says when
  a team reaches its 10-step limit, and shows CrewAI's error messages. This will help us read
  practice run 3.
- Two wrong comments in `guideline_index.py` are fixed. Only comments changed, so the search gives
  the same results.
- The old `pdf_search_tool.py` at the top of the folder is marked as the first version, which
  nothing uses.

**Test on my laptop.** The two main fake-model tests were run again. All 5 rules passed, and the
model got exactly the same messages as on 5 Nov.

**Latency (how long each step takes).** Every run now also records:
- **retrieval:** how long each guideline search takes (in milliseconds);
- **response:** how long each answer from our model takes (in seconds), and how fast it writes
  (tokens per second);
- how long each of the 6 reports takes.

`check_run.py` prints these as a short table and saves them in `t2_run_summary.json`. On my laptop
only the search times are real, because the fake model answers at once. Practice run 3 on Kaggle
will give the first real model times. Latency is only measured: no pass rule uses it.
