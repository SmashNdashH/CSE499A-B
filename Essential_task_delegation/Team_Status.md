# Where the project stands (17 Nov 2026, evening)

From Abrar, for Noman, Aryan, Ridita and Tamanna. This puts you where I am: what the system is, every result so far, what's decided, what's still open and what comes next. It includes Aryan's and Ridita's pushes of 17 Nov. Your own part is in section 6. Every number links to the file it comes from: quote numbers from those files, not from this page.

**Two things first:**
- **Update 5 is tomorrow, Wed 18 Nov.** Section 3's results aren't in a weekly update yet. Until they are, keep them out of anything our supervisor or the public sees: the update PDFs, the README front page and any public website. Inside the team, use them freely.
- **`git pull` first:** several linked files are new in this push.

## 1. What you need to know first

| Term | What it means here |
|---|---|
| Pair | Two satellite photos of the same place, one taken before the disaster and one after, 1024 × 1024 px, from the DisasterM3 dataset. Most come from xBD; the Turkey earthquake pairs don't. |
| Damage map | A picture the size of the photo in which every pixel is labelled background, intact building, damaged building or destroyed building. |
| IoU | Intersection over union: how much a model's pixels of one class overlap the true pixels of that class, from 0 (none) to 1 (exact). **Destroyed-building IoU** is our hardest number; **mean IoU** averages the four classes. |
| Validation pairs: 645, of which 605 are "clean" | The pairs we tune and compare on. Ridita's audit found that 40 of them are near-copies of training pairs (they share the before-photo), so every score is now given on the other 605. |
| Test pairs: 2,007 | Clean pairs from the benchmark's own test split that no model of ours has seen. They only confirm results; nothing is tuned on them. 414 are from the Turkey earthquake. |
| U-Net | A network that turns a photo into a damage map, pixel by pixel; ours use a ResNet-50 encoder. The **after-photo U-Net** reads only the after photo. The **before-and-after U-Net** reads both, stacked as 6 colour channels. |
| TTA | Test-time augmentation: the map is averaged over 8 flipped and rotated copies of the photo. |
| SAM 3 | Meta's open segmentation model. Given the word "building", it outlines buildings in a photo without any training of ours. |
| Grader | A classifier we trained: a ResNet-18 that looks at a 128 px crop of one building before and the same crop after (one network reads both, a "Siamese" network) and answers intact, damaged, destroyed or not a building. It learned from the training photos' buildings as SAM 3 outlined them. Three exist, trained with seeds 42, 43 and 44. |
| Find-then-grade | SAM 3 finds each building on the before photo, then the grader grades it. |
| Building table | One row per building in a damage map: its class, area, centre, box and distance to the nearest destroyed building. Distances and areas are in pixels: DisasterM3 gives no ground scale. |
| Danger heatmap | Where damage is densest, with up to three hot spots (where to search first) and up to three safe areas (open ground farthest from any damage). Our reports call it the survivability heatmap. |
| 7B, 3B | Qwen2.5-VL-7B, the vision-language model we fine-tuned on DisasterM3's questions, and the smaller Qwen2.5-VL-3B we're training to imitate it ("distilling"), for a laptop. Our current 7B is `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP`, kept on 28 Oct. |
| DisasTeller | A published report system: teams of language-model agents write six reports (expert, alerts, emergency, resource allocation, public, reconstruction) from disaster photos and a map. We rewired it to run on our 7B with no internet. |
| Guideline search | Ridita's offline search over 405 sections of six response guidelines (EMS-98, INSARAG, Sphere and others), by meaning and by keywords. It returns each section with a citation ID such as `[EMS98-masonry-grade-5]`. |
| A rule fixed before a run | We write down how a result will be judged before the run, so it can't be bent afterwards to fit what we hoped. |

**Labels you'll meet in file names.** Use them to find files; in anything others read, say what the thing is instead.

| Label | What it is |
|---|---|
| R9 | The after-photo U-Net, the best of the October training sprint |
| R11 | The before-and-after U-Net |
| R16c | Find-then-grade (step 5 trained the grader on SAM 3's outlines) |
| E5 | The leak check: the 40 near-copied validation pairs |
| E6 | The test set: the 2,007 clean test pairs and their true masks |
| E7 | Find-then-grade against the before-and-after U-Net, scored on the same pairs |
| H2 | The building table and the fixed counting queries |
| T1 | The danger heatmap |
| T2, T2b | DisasTeller offline on our 7B; who should write the reports |
| T3 | The showcase website |
| L0, L1b, L2 | The 7B's retraining; the 8-bit field model; the 3B |
| O1 to O4 | Our four goals (section 2) |

## 2. The system, and what each part scores today

Since 4 Nov the plan is **one chain**, measured as one:

```text
before + after photos → find each building → grade it → building table → counts, hot spots, guideline passages → the six reports → the website
```

Every part below has been tested, but each with its own model and images. The parts don't run as one chain yet.

| Part | What does it | Best result so far | Source |
|---|---|---|---|
| Damage map | Find-then-grade, or the before-and-after U-Net: not chosen yet (section 4) | On the 605 clean validation pairs, destroyed-building IoU **0.3065** for find-then-grade (the mean of its three graders: 0.3161, 0.3051 and 0.2982) and **0.2692** for the before-and-after U-Net with TTA; mean IoU 0.547 and 0.581. The after-photo U-Net: 0.2874 and 0.540 | [find-then-grade](Champion_Task/R16c-results/step5b/README.md); [the U-Nets on clean pairs](Champion_Task/E5-results/E5/README.md) |
| Building table and counts | Fixed queries on the table, written and checked by hand. No language model counts | 32.96% of the benchmark's 3,583 counting questions (32.47% without the questions on copied photos), from the before-and-after U-Net's table. The target is the base 7B's 34.2% | [H2](Champion_Task/H2-results/H2/README.md) |
| Danger heatmap | Code on a damage map (no model) | 73.6% of hot spots have their marked point within 20 px of a building that is truly damaged or destroyed (645 validation images, 694 hot spots, on the after-photo U-Net's maps) | [T1 v3](Champion_Task/T1-results/T1-v3/README.md) |
| Guideline search | Ridita's hybrid search | 27 of 30 test questions answered from the right section (24 were needed) | [Offline_RAG_KR2 README](Offline_RAG_KR2/README.md) |
| Reports | DisasTeller on our 7B in a fixed flow: code calls the tools in a fixed order, and the 7B writes each section | Passed its internet-off proof run on 11 Nov: six reports, 18 guideline searches, 4 network connections, all to the model's own server on the same machine. Against July's reports written by Gemini (16 Nov): ours cite real guideline sections and invent fewer numbers, but read the photos worse, and none was judged fully useful (section 3, item 5) | [Ridita's README](Offline_RAG_KR2/README.md), "Proof run" and "Comparison with the July Gemini reports" |
| The benchmark's six tasks | Our fine-tuned 7B, at full image size | Kind of disaster 76.77%; kinds of objects damaged 19.99%; building counting 30.31%; share of damaged road 33.03%; land-use types 40.46%; how two objects relate 34.62%. Mean 39.20% | [part A](Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [part B](Champion_Task/L0-step2-results/new-partB/L0S2/README.md) |
| Field model | The after-photo U-Net stored as 8-bit numbers | 33 MB, 1.6 s a photo on a 4-thread server CPU, destroyed IoU down only 0.0003. In a web browser it gives the same map as a native run on 100% of pixels, in about 3 to 5 s | [L1b](Champion_Task/L1B-results/L1b/README.md); [website README](T3_Website/README.md) |
| 3B | The 3B learns from the 7B | Step 1 done: 1,146 checked answers from the 7B. Step 2's five training notebooks are built, not run | [L2 step 1](Champion_Task/L2-step1-results/new-teacher/L2S1-new-teacher/README.md) |

**Our four goals** (from our review report):

| Goal | Status |
|---|---|
| O1: a damage map with mean IoU above 0.52 and destroyed IoU above 0.30 | **Met on the clean validation pairs, narrowly,** by find-then-grade: only as the mean of its three graders (0.3065); one grader alone is at 0.2982 |
| O2: counting above the base 7B's 34.2%, and all six tasks re-scored | Six tasks re-scored. Counting not met: 32.96% at best. And this score can't show counting ability (section 3, item 1) |
| O3: one offline system, DisasTeller on our 7B with the damage map, counts and heatmap | The offline report run is done (11 Nov). Not one chain yet: the reports don't read our maps |
| O4: a 3B in about 6 GB, measured against the 7B | The field segmenter is done (33 MB). The 3B: training built, not run |

## 3. Results since update 4 (they go into update 5)

1. **The benchmark's counting questions give their answer away.** Whenever a question's largest option is above 20 (1,581 of the 3,583 optical counting questions), the five options are 0.6, 0.8, 1, 1.2 and 1.4 times the true count, so the middle one is always right.
   - A rule that never looks at the photo scores 66.98%. Always picking the middle option scores 53.95%.
   - So accuracy on these questions can't show that anything counts well: not our 32.96%, and not the 34.2% target.
   - We now also report **count error**: how far a count is from the true count in the masks.
   - [The check](Champion_Task/benchmark-option-rule-check.ipynb).
2. **Both damage-map methods on the 2,007 unseen test pairs** (run 7–8 Nov):

   | | Find-then-grade (mean of 3 graders) | Before-and-after U-Net (TTA) |
   |---|---|---|
   | Destroyed-building IoU | 0.3898 | 0.3984 |
   | Mean IoU | 0.5129 | 0.5721 |
   | Building IoU (finding buildings at all) | 0.5416 | 0.6944 |
   | Turkey only (414 pairs), destroyed | **0.3233** | 0.0867 |
   | Without Turkey, destroyed | 0.4105 | **0.4672** |
   | Counting, on the questions without copied photos | 32.7% | 32.53% |
   | Median count error | 40% | 38% |

   - **Is the overall gap real? No.** Redrawing the 2,007 pairs 10,000 times, the middle 95% of the gap runs from −0.038 to +0.022: it's noise (11 Nov).
   - **But the split by event is real.** Without Turkey the U-Net leads by 0.057; on Turkey, find-then-grade leads by 0.236. The U-Net almost never finds Turkey's destroyed buildings.
   - **The grader is the weak part:** with perfect grades on SAM 3's outlines, find-then-grade would reach 0.590. "Damaged" is its weakest class.
   - [The comparison](Champion_Task/E7-results/step2/README.md), [the resampling](Champion_Task/E7-results/step2b/README.md). Find-then-grade's building table on all the test pairs: [buildings_chain_s42.sqlite](Champion_Task/E7-results/step2/buildings_chain_s42.sqlite) (grader seed 42), in the same columns as H2's.
3. **On validation, counting from either method's table is level:** find-then-grade 37.73% against the U-Net's 39.24% on 1,055 questions (no clear difference, p = 0.39); median count error 40% against 33%. [Results](Champion_Task/E7-results/step1/README.md).
4. **The 3B's training is designed and built** (8 Nov). The 3B learns from the 7B in one of two ways:
   - (b) from the 7B's probabilities for each word of the answer, not only its final answer ("soft labels");
   - (c) from the 7B's answers with the benchmark's options shown.

   A rule fixed before training picks the better one on 1,962 held-out questions. Five Kaggle notebooks, [l2-step1b-soft-labels.ipynb](Champion_Task/l2-step1b-soft-labels.ipynb) to [l2-step4-winner-benchmark.ipynb](Champion_Task/l2-step4-winner-benchmark.ipynb); not run yet.
5. **Our six offline reports against July's six, written by Gemini with the internet on** (Ridita, 16 Nov, pushed 17 Nov). The same six photos and map; the measures and the expectation were written before anything was counted.

   | | July (Gemini) | Ours (7B) |
   |---|---|---|
   | Guideline citations a reader can check | 0 | 11, all real (Expert report) |
   | Numbers made up for the response plan (staff, budgets, costs) | 33 | 5 |
   | Sentences saying there is no danger | 0 | 4 |
   | Contradictions | 2 | 6 |
   | Useful to a rescue team: yes / partly / no | 3 / 3 / 0 | 0 / 5 / 1 |

   - **July reads the photos better.** Two of our 7B's six photo descriptions contradict their photos (undamaged buildings called collapsed; a dry street called flooded by a "hurricane"), and it missed the sign that names the bridge.
   - **One wrong answer spreads.** Our 7B's reading of the map caused all 4 "no danger" sentences and 3 of the 6 contradictions.
   - **Next: a quality-fix run, built and tested on Ridita's laptop, not yet run on Kaggle.** The map reading is now written by code from the grades; one more question reads each photo's sign; and every section is checked for invented contact details and for its citations. It doesn't fix the photo descriptions.
   - [Ridita's README](Offline_RAG_KR2/README.md), "Comparison with the July Gemini reports" and "Quality-fix run"; the counts in [report_comparison/](Offline_RAG_KR2/report_comparison/results.csv).
6. **The showcase website is built** (15–17 Nov), not deployed: section 5.

## 4. What's decided, and what's still open

**Decided:**
- **One chain before anything new** (4 Nov). No new module until a before-and-after pair goes all the way to a report with the internet off, and every number in the report matches the building table.
- **Counts come from fixed queries on the table, never from a language model** (23 Oct). No model we tried writes reliable queries. And giving the 7B the table's count loses 10 points against the table alone: 27.0% against 37.0% on Aryan's 1,701 questions.
- **Grading stays with the trained grader** (2 Nov, Tamanna's Part B). On 300 true buildings the grader was right on 212, the fine-tuned 7B on 100 and the base 7B on 99; the fine-tuned 7B answered "intact" for 298 of them. In the reports, the 7B describes what the table decided. It doesn't grade.
- **The reports use the fixed flow, not agents** (10 Nov, Ridita, by her rule written before run 4).
- **Our 7B is the one retrained in late October**, kept on 28 Oct: it gained on relations, and no task fell by more than a point.
- **The website** is built from Aryan's prototype, in the look Abrar chose ("Aftermap" is a placeholder name). Abrar deploys it by hand; nothing goes public from a push.

**Still open:**
- **Which method feeds the building table, the hot spots and the reports.** Abrar decides next, from section 3's results:
  - (a) the before-and-after U-Net: better outside Turkey, and at finding buildings at all;
  - (b) find-then-grade: the only method with one outline per building, and far better on Turkey;
  - (c) a mix, for example SAM 3's outlines graded by the U-Net's pixels: chosen on the validation pairs and confirmed once on the test pairs. Recommended, since each method wins where the other fails.

  Until it's chosen, nothing downstream (the bridge, the reports' facts, the website's gallery) should hard-code one method.
- **How we report the counting goal,** given the flaw: count error beside accuracy.
- **Who writes the reports:** our 7B, or a small text-only model (`Qwen/Qwen2.5-3B-Instruct`) given the same facts (T2b). Our goals name our 7B, so a swap needs the supervisor's agreement.
- **For the website:** its name, and whether xBD pairs could show metres (xBD's own label files give 1.25 to 2.82 m per pixel; the Turkey pairs have no scale).

## 5. The showcase website

- **Where:** [T3_Website/](T3_Website/README.md). To run it, in that folder: `npm install`, `npm run fixtures`, `npm run dev`, then open the address it prints. Without xBD's photos on your PC the maps show without photos; that's expected.
- **Seven pages:**
  - Home;
  - How it works: a scroll story on one real pair;
  - Explore: the building map. Click a building for its row of the table, ask a fixed question, zoom and pan, hide and search buildings, or switch to a 3D view of the results;
  - Try it: the field model runs in the visitor's browser on their own photo, and nothing is uploaded;
  - Results: charts, each number linked to its file;
  - Reports: the six offline reports word for word, with every known error from Ridita's README marked, and the guideline passages each report was given;
  - About: the limits, ideas not built, and the team.
- **Rules it keeps:**
  - no invented data;
  - every number comes from one facts file, checked against its source on every build;
  - nothing loads from another site, so it runs offline at the booth;
  - distances in pixels;
  - "A model's estimate, to be checked by people on the ground." on every page.
- **Still to do:**
  - the real gallery: Abrar's export replaces the four stand-in pairs;
  - the first deploy (Abrar);
  - a test on the booth laptop and on a phone;
  - later, a small local server for the booth that runs the guideline search and the report writer.
- **From Wed 18 Nov, Aryan takes over the build** by [his handover](Aryan_Task/T3_Website_Handover.md), which gives every path, the rules and the order of work. Noman can help: testing first, then the fixes Abrar picks ([his review](Noman_task/Review_AeroRescue_site.md), section 7).

## 6. What comes next, and your part

**Order of work:**
1. Abrar chooses the method (section 4).
2. Hot spots on that method's maps.
3. The reports read that method's table and hot spots (T2 step 5). Then every number in a report is checked against the table (step 7).
4. Who writes the reports (T2b).
5. A final internet-off run of the whole chain.
6. The website's live demo runs that chain.

**In parallel:** the 3B's training runs, and the website's gallery and deploy. The showcase is around 15 Dec.

### Noman
- **The four wireframe images are gone:** you deleted them on 17 Nov. Thanks.
- **If you want to keep working, work on the showcase website.** Section 7 of [your review](Noman_task/Review_AeroRescue_site.md) gives your part:
  - test the site where nobody has yet: Firefox, a screen reader, a real printer, and Safari if you have it;
  - write down what you find;
  - then fix what Abrar picks, agreeing with Aryan who edits which file.
- **Your own site:** the showcase website replaces it, so the rest of your review's fixes are optional. Instead, add one line to the top of its README saying it's an early prototype whose numbers aren't kept up to date (review, section 7.4).
- **The roadmap suggests you on the 3B:** L2, then L3, a 4-bit 3B that passes a question to the 7B when it's unsure.
  - L2's five notebooks are built and waiting to run. They push checkpoints to Abrar's Hugging Face account, so ask Abrar before you run any.
  - L3 starts once L2 has picked its 3B.

### Aryan
- **Your review's fixes:** you pushed them on 17 Nov, with a change list ([CHANGES.md](Aryan_Task/CHANGES.md)). Abrar checks them against the review's section 8 ([Review_and_Fix_List.md](Aryan_Task/Review_and_Fix_List.md)) next.
- **Already seen in the bridge** (`disasteller_inputs.py`, as pushed on 17 Nov):
  - **fixed:** an image that isn't in the table now returns the status `image_not_in_table`, not zeros with "ok" (7.1), and both statuses are checked (7.3); the hard-coded model names are gone;
  - **still open (7.2):** safe areas are still read as `point_xy` and `dist_to_damage_px`. The heatmap's file calls them `xy` and `distance_px`, so every safe area still prints at (0, 0), 0 px from damage;
  - **still open (7.4):** missing fields still get made-up defaults (`rank` 1, `point_xy` [0, 0], `area_px` 0);
  - **still open (7.5):** the text is still titled "GROUND TRUTH DAMAGE FACTS", over counts that are a model's estimate.
  - The website shows this text word for word, so these three need fixing before it can.
- **The bridge must also read the table of whichever method is chosen** (section 4), not a fixed one.
- **From Wed 18 Nov, the website:** [T3_Website_Handover.md](Aryan_Task/T3_Website_Handover.md), section 8.
  - Done on 17 Nov, so not yours any more: zoom and pan, hide and search, folding panels, the hover card, print, and the reports' error marks.
  - What's left is short: look at every page on a real phone, add a place for the supervisor line, and run the checks that wait for the gallery export and for 18 Nov.
  - **Noman may help.** He tests where nobody has yet (Firefox, a screen reader, a printer, Safari), then fixes only what Abrar picks. Before either of you edits a file, agree who has it.
- **In counting work,** report count error, not only accuracy.

### Ridita
- **Done on 16 Nov:** the comparison with July's Gemini reports (section 3, item 5).
- **Next in T2: the quality-fix run on Kaggle,** by the steps in your README ("Quality-fix run"), measured with the same script so its numbers sit beside the proof run's and July's.
- **T2 step 5, connecting the bridge:** `disasteller_inputs.py` isn't called by the main script yet. When you connect it:
  - **Missing must not read as zero.** Aryan's fix of 17 Nov does the first half: an image that isn't in the table now returns `image_not_in_table`. The safe areas are still read with the wrong keys (Aryan's part, above).
  - **One method for both inputs.** The table and the hot spots must come from the same method: today H2's table and T1's hot spots share only 7 images. Wait for the method choice (section 4) for the files.
- **Then T2b:** the same facts and guideline search with two writers, our 7B and a small text-only model, counted by number contradictions and invented citations.
- **The website's Reports page** shows your proof run's reports word for word, with the problems from your README's "Quality problems" list marked: 14 phrases, plus 8 notes for problems with no single phrase to mark ([reportNotes.ts](T3_Website/src/core/reportNotes.ts)). Your comparison's further findings (the two photo descriptions that contradict their photos, the hall "in the center of the region", "existing medical facilities remain unaffected", the Emergency report's "G4 and G5, respectively") aren't marked yet. Tell Abrar if any mark is wrong.

### Tamanna
- **Your Part B result is part of the design** (section 4): grading stays with the trained grader.
- **The roadmap suggests you on L4:** can EfficientSAM3, a smaller version of SAM 3, find buildings nearly as well, so the chain could run on a laptop? Not started, and it depends on the method choice: ask Abrar before you start.

## 7. Where to look

| File | What it holds |
|---|---|
| [Progress_Tracker.md](Progress_Tracker.md) | The latest state, newest first, and what is waiting on whom |
| [Task_Ledger.md](Task_Ledger.md) | Every finished task: what, why, how, the expectation fixed before it ran, and the result |
| [Next_Steps_Roadmap.md](Next_Steps_Roadmap.md) | The plan, every task and its suggested owner |
| [System_Design_Notes.md](System_Design_Notes.md) | How the parts fit together, and why |

These use the run labels; section 1 explains them.

## 8. Instruction for your AI assistant (paste everything in the box)

```text
You are helping a member of a student team (North South University, CSE499B, Section 13, Group 5) in the
repository SmashNdashH/CSE499A-B: offline disaster damage mapping from before-and-after satellite photos.

Read these first, completely:
  Essential_task_delegation/Team_Status.md   (where the project stands; section 6 has each member's part)
  every file it links for my part

Rules:
- Never invent numbers, results, files or quotes. Quote a number only from a file Team_Status.md links, and name the file.
- The results in Team_Status.md section 3 stay out of anything the supervisor or the public sees until update 5
  (Wed 18 Nov).
- In anything others read, explain each internal label (R9, R11, E7, T2 and so on) in plain words, or leave it out.
- Distances and areas are in pixels, never metres.
- Don't edit other members' folders. Ask Abrar before running anything that uses his accounts or tokens.

My name: <your name>
My task now: <your task from section 6, in your words>

When done, list the files you changed, and anything you could not do and why. Do not guess.
```
