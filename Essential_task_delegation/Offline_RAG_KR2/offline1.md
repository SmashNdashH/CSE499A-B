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


## 8. Update on 8–9 Nov: practice run 3, and the fixes

The README section "Practice run 3 and the fixes" has every detail. The files are in
`results/t2_practice_3/`.

**Practice run 3 (8 Nov, internet on) did not pass.** Rule 2 failed: 3 of the 6 reports were too
short. Rules 1, 3, 4 and 5 passed. DisasTeller took only 2.6 minutes.

**What got better since run 2:**
- The "message too long" problem is gone. The biggest message was 2,808 tokens (the limit is 32,768).
- The 6 photo descriptions are all different now (in run 2, 4 of 6 were the same).
- The map has 5 grade labels now (run 2 had none).
- Nothing went online, and Gemini was not used.

**What went wrong:**
- **The model wrote a sentence about the report, not the report.** The Expert team's whole report
  was: "The final report is generated based on the provided data and tools." (12 words).
- **A tool was called with no input.** The Emergency team used the map tool but gave it no text.
  The tool refused, and the team gave up (17 words).
- **Made-up facts.** The Expert report was empty, so the later teams invented "Region A, B and C".
- No report cites a guideline section.
- Quality warnings: photo 5 was called a "hurricane", but it shows cracks in a building after the
  earthquake. Some map
  labels are in the wrong place. The broken Concrete Bridge got no grade.

**Latency (the first real times):** a guideline search usually took 0.2 to 0.6 seconds (the first
one took 6.3 seconds). One answer from our model took about 6 seconds in the middle (median) and
18 seconds at the slowest. The model writes about 15 tokens per second.

**What I changed (9 Nov):**
- The map tool and the photo tool now work even when a team gives them no input.
- If a team's final answer is shorter than 150 words, the model is asked again: "write the complete
  report". At most twice; after that, the short answer is kept. Gemini's July reports had 379 to 912
  words, so 150 is well below a real report.
- Honest note: this makes rule 2 (at least 50 words) easier to pass. So `check_run.py` now also
  counts how often the model was asked again, and how often the answer stayed short. Whether the
  reports are good must be judged by reading them, in the comparison with the July reports.

**Test on my laptop.** I added two new fake-model modes that act like run 3. All three tests did
what they should:
- like run 3: each short answer was asked again once, then full reports came back; all 5 rules passed;
- a fake model that never writes a full report: it was asked twice per report, then the short answer
  was kept, and rule 2 failed honestly; the run still finished;
- a normal fake model: nothing was asked again; all 5 rules passed.

**Next:** practice run 4 on Kaggle (internet on). If it passes, the proof run (internet off).


## 9. Update on 10 Nov: practice run 4, and the "fixed flow"

The README section "Practice run 4 and the fixed flow" has every detail. The files are in
`results/t2_practice_4/`.

**Practice run 4 (10 Nov, internet on) did not pass.** Rule 2 failed: all 6 reports were too
short (28 to 49 words). Rules 1, 3, 4 and 5 passed.

**What went wrong:**
- **The model repeated the same step.** 4 teams sent the same search again and again, up to 11
  times. CrewAI told the model to stop, but it did not. At the step limit, CrewAI saved the last
  search request as the report.
- **Asking again did not help.** The Emergency team was asked twice for the full report, and wrote
  the same 28 words each time.
- **The grades were copied from an example. This was my mistake.** On 5 Nov I put an example in
  the map tool's description: "Hama Street: G4, Wajima Drama Memorial Hall: G2". The model used
  exactly this as its grades. Run 3 also started with these two grades. So the grades of runs 3
  and 4 do not come from the photos. The example is removed now.
- No report cites a guideline.

**What was fine:** nothing went online, Gemini was not used, every question got an answer, and
the 2 map labels are in the right places. The new copy of the search dataset (`offline1-rag-kr2`)
gives exactly the same search results as my laptop.

**The decision.** Before run 4, the README said: if a report stays short after the model is asked
again, decide on the "fixed flow". This happened. So on 10 Nov Ridita decided: the fixed flow
first, then practice run 5, then the proof run.

**The fixed flow** (the new file `disasteller_offline/fixed_flow.py`):
- The code does the steps, always in the same order: describe the photos → search the guidelines
  → the model gives each place a grade → label the map → read the map → write the six reports.
- The model only writes. It writes each report one section at a time (for example
  "Introduction", then "Current Situation"). It never chooses a tool.
- The teams, their tasks, the report files and the pass rules stay the same.
- The model no longer sees example names or grades, because it copies them.
- CrewAI does not run in the fixed flow. My first plan was to keep CrewAI, but with no tools to
  choose, it would only add its answer format, and that format caused problems in run 4.
- The old agent version is still there and still works.

**Honest notes:**
- Rule 2 (at least 50 words) is now easy to pass, because each report has several sections and
  headings. So the check also counts the model's own words, without the headings. Whether the
  reports are good must be judged by reading them.
- 2 of the 18 fixed searches find weak sections (rescue team types, and work shifts).

**Test on my laptop.** With the fake model, every test did what it should:
- fixed flow, normal answers: all 5 rules passed (36 questions to the model, 6 grades read, all
  citations real);
- fixed flow, very short sections: rule 2 failed, as it should;
- fixed flow, one question always fails: rule 5 failed, as it should, and the run still finished;
- the old agent version: still passes, the same as on 9 Nov.

**Next:** practice run 5 on Kaggle (internet on). If it passes, the proof run (internet off).


## 10. Update on 10 Nov: practice run 5 passed

The README section "Practice run 5: the fixed flow with our model" has every detail. The files
are in `results/t2_practice_5/`.

**Practice run 5 (10 Nov, internet on) passed all 5 rules.** It was the first run of the fixed
flow with our own model. DisasTeller took 6.2 minutes.

**What is good:**
- All 6 reports are real reports, with all their sections, about the places in the photos. The
  model wrote 192 to 787 words per report (in run 4: 28 to 49).
- The grades now come from the photo descriptions, not from an example. For example, the hall,
  whose photo shows no damage, got G1.
- Nothing went online, Gemini was not used, and every question got an answer.
- The new copy of the search dataset (`offline-rag-kr2(5)`) gives exactly the same results as my
  laptop (18 of 18 searches).

**What is not good yet.** This is about how well the model writes; the 5 rules don't grade it.
- The Concrete Bridge got no grade. Its photo description has no place name, and the grade
  question asked for the name.
- The map reading said there are "no dangerous zones". Other reports repeated this, although one
  street is G5.
- The Public report made up a phone number (123456789).
- Only the Expert report cites guideline IDs properly.
- Some sections repeat each other.

**Next: the proof run**, with the internet off and exactly the same code. The writing problems
are noted for the comparison with the July reports, and can be fixed later, in a separate run.


## 11. Update on 11 Nov: the proof run passed

The README section "Proof run: internet off" has every detail. The files are in
`results/t2_proof/`.

**The proof run (internet off) passed all 5 rules.** DisasTeller wrote all 6 reports with our own
model, with the internet switched off on Kaggle. The notebook printed "PASSED: the offline proof
(internet off)".

**How we know the internet was off:**
- Kaggle saved its own setting in the notebook file: internet off.
- The notebook tried to reach a website and could not. It printed "Internet is OFF".
- The network log shows only connections inside the computer, to our model's server.

**It is the same as run 5:**
- The same code (commit `258a4f381`), the same 4 inputs and the same model.
- The 6 reports and the labelled map are exactly the same as in run 5, letter for letter. Every
  question to the model got the same answer. So the internet made no difference.

**What this proves:** DisasTeller's fixed flow writes all 6 reports fully offline, with our own
model and no Gemini.

**What it does not prove:** that the reports are good. They are the run 5 reports, with the same
writing problems (the map reading, the made-up phone number, few citations). These are judged in
the comparison with the July reports.

**Next:** commit the README, this file and the two notebooks. Then compare the 6 reports with
the July Gemini reports (roadmap T2).
