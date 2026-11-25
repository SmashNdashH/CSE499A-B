# Where the project stands (18 Nov 2026)

From Abrar, for Noman, Aryan, Ridita and Tamanna. This puts you where I am: what the system is, every result so far, what's decided, what's still open and what comes next. It includes Aryan's and Ridita's pushes of 17 Nov and Abrar's runs of 17–18 Nov. Your own part is in section 6. Every number links to the file it comes from: quote numbers from those files, not from this page.

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

Every part below has been tested, but until 19 Nov each with its own model and images. **Since 19 Nov (E7 step 3), the damage map, the building table and the hot spots come from one method, C4, on the same 2,065 test photos.** **Since 20 Nov (T2 step 5) the reports read them, in one offline run:** both test pairs pass the five pass rules. The 7B first turned one count into a wrong percentage. With two fixes (the shares stated in the facts, and a number check while it writes), the second run's twelve reports have no wrong or unsourced number, by T2 step 7's check. Read by eye, though, they reuse some damage counts as staff numbers, which the check doesn't catch yet.

| Part | What does it | Best result so far | Source |
|---|---|---|---|
| Damage map | **C4, chosen by Abrar on 19 Nov:** the before-and-after U-Net on xBD's coarser photos, find-then-grade on the sharper ones (section 3, item 2) | C4: destroyed-building IoU **0.3501** and mean IoU 0.5881 on the 605 clean validation pairs; **0.4296** and 0.5555 once on the 2,007 unseen test pairs. Alone: find-then-grade 0.3065 (the mean of its three graders) and the before-and-after U-Net with TTA 0.2692 on the clean validation pairs | [C4](Champion_Task/E7-results/step2c/README.md); [find-then-grade](Champion_Task/R16c-results/step5b/README.md); [the U-Nets on clean pairs](Champion_Task/E5-results/E5/README.md) |
| Building table and counts | Fixed queries on the table, written and checked by hand. No language model counts | **C4's table (19 Nov):** 125,439 rows on the 2,065 test photos, one per building SAM 3 outlined on the sharper photos, one per connected patch of pixels on xBD photos. Counting from C4's map: **35.34%** of the benchmark's 3,580 askable counting questions (34.89% without the questions on copied photos), above the base 7B's 34.2% target. Earlier, from the before-and-after U-Net's table alone: 32.96% (H2). Section 3, item 1 says why accuracy here can't show counting ability | [E7 step 3](Champion_Task/E7-results/step3/README.md); [H2](Champion_Task/H2-results/H2/README.md) |
| Danger heatmap | Code on a damage map (no model) | On C4's maps, on the 2,007 clean test pairs (19 Nov): 56.9% of hot spots have their marked point within 20 px of a truly damaged or destroyed building, and **82.7% on the 687 photos with destroyed buildings**. On photos without destroyed buildings most hot spots are false alarms. Earlier, on the after-photo U-Net's maps of 645 validation images: 73.6% | [E7 step 3](Champion_Task/E7-results/step3/README.md); [T1 v3](Champion_Task/T1-results/T1-v3/README.md) |
| Guideline search | Ridita's hybrid search | 27 of 30 test questions answered from the right section (24 were needed) | [Offline_RAG_KR2 README](Offline_RAG_KR2/README.md) |
| Reports | DisasTeller on our 7B in a fixed flow: code calls the tools in a fixed order, and the 7B writes each section | Passed its internet-off proof run on 11 Nov: six reports, 18 guideline searches, 4 network connections, all to the model's own server on the same machine. Against July's reports written by Gemini (16 Nov): ours cite real guideline sections and invent fewer numbers, but read the photos worse, and none was judged fully useful (section 3, item 5) | [Ridita's README](Offline_RAG_KR2/README.md), "Proof run" and "Comparison with the July Gemini reports" |
| The benchmark's six tasks | Our fine-tuned 7B, at full image size | Kind of disaster 76.77%; kinds of objects damaged 19.99%; building counting 30.31%; share of damaged road 33.03%; land-use types 40.46%; how two objects relate 34.62%. Mean 39.20% | [part A](Champion_Task/L0-step2-results/new-partA/L0S2/README.md), [part B](Champion_Task/L0-step2-results/new-partB/L0S2/README.md) |
| Field model | The after-photo U-Net and the before-and-after U-Net, stored as 8-bit numbers | After-photo U-Net (R9): 33 MB, 1.6 s a photo on a 4-thread server CPU, destroyed IoU down only 0.0003; in a web browser it gives the same map as a native run on 100% of pixels, in about 3 to 5 s. Before-and-after U-Net (R11, 18 Nov): 33.2 MB (`33,163,619` bytes), 1.75 s a pair (`1.35×` ONNX FP32), destroyed IoU down 0.0014 (0.0011 on the 605 clean pairs) | [L1b](Champion_Task/L1B-results/L1b/README.md); [L1c](Champion_Task/L1C-results/L1c/README.md); [website README](T3_Website/README.md) |
| 3B | The 3B learns from the 7B | Step 1 done: 1,146 checked answers from the 7B. Step 1c (the options rerun for Mode c, 18 Nov) done: 806 kept of 2,249. Step 1b (soft labels for Mode b): done 19 Nov, all 38,271, in three sessions on account 3. Mode c's training stopped on 18 Nov with every update skipped: some examples give NaN in half precision. Step 2b (19 Nov) found the cause and the fix: one layer at the end of the 3B's vision part overflows on about 1.2% of examples, and keeping that layer in full precision fixes it at no cost. Training restarts with that fix in the training notebook (19 Nov) | [L2 step 1](Champion_Task/L2-step1-results/new-teacher/L2S1-new-teacher/README.md); [L2 step 1c](Champion_Task/L2-step1-results/options-rerun/L2S1c/README.md); [L2 step 1b](Champion_Task/L2-step1-results/soft-labels/L2S1b/README.md); [step 2b](Champion_Task/l2-step2b-fp16-overflow-diagnostic.ipynb) |

**Our four goals** (from our review report):

| Goal | Status |
|---|---|
| O1: a damage map with mean IoU above 0.52 and destroyed IoU above 0.30 | **Met by the chosen method, C4 (chosen 19 Nov):** 0.3501 destroyed IoU and 0.5881 mean IoU on the clean validation pairs, with each grader seed above 0.30. It scores 0.4296 once on the unseen test pairs, ahead of both single methods beyond noise. (Find-then-grade alone meets it only narrowly: 0.3065, the mean of its three graders.) |
| O2: counting above the base 7B's 34.2%, and all six tasks re-scored | Six tasks re-scored. **Counting: 35.34% from C4's map (19 Nov), above 34.2% on the measure the review promised.** But this score can't show counting ability (section 3, item 1), so count error is reported beside it. *(25 Nov, E7 step 3c: on the 2,000 fair questions, whose largest option is 20 or less, C4 scores 42.2%, no better than the blind rule's 40.9% (p = 0.46). The distilled 3B picks right on 57.45% there (53.90% in 4 bits), but asked for a number with no options it does no better than the blind rule (L2 step 4d), so its lead came from the options. [Results](Champion_Task/E7-results/step3c/README.md).)* |
| O3: one offline system, DisasTeller on our 7B with the damage map, counts and heatmap | The offline report run is done (11 Nov), and its quality-fix run (17 Nov). The map, the table and the hot spots now come from one method on the same photos (19 Nov). **The first offline run of the whole chain is done (20 Nov, T2 step 5):** both test pairs pass the five pass rules. On one, all six reports turn "96 destroyed areas" into "96% of the area". *(20 Nov, 22:08: after four runs, run 4's twelve reports have no wrong, unsourced or misused number by T2 step 7's check, and both pairs pass the five pass rules. The fixes: the shares stated in the facts; a number check while the 7B writes; and staffing and shelter requests that no longer ask for numbers the facts don't give.)* |
| O4: a 3B in about 6 GB, measured against the 7B | Both field segmenters are done in 8-bit (33 MB and 33.2 MB). The 3B: options rerun done (806 kept), soft labels done (all 38,271); the half-precision fix is found (step 2b, 19 Nov: one vision layer kept in full precision). Both 3Bs now train with that fix in place, started automatically by a script on Abrar's PC since 20 Nov, 05:35. *(23 Nov: both 3Bs are trained, one full epoch each. (c) finished 22 Nov, 13:56 (211 steps, last loss 0.563); (b) finished 23 Nov, 04:50 (208 steps, last loss 0.633), after a storage crash and a GPU stall it continued from. The held-out choice between them (L2 run 4) runs on account 2 since 07:02; then the winner on the benchmark. L3, the winner in 4 bits with its hand-off to the 7B, is built and its smoke test runs on account 3.)* *(23 Nov, 09:31: the rule keeps (c), the 3B trained on the 7B's checked answers. It scored 45.1% against (b)'s 36.0% on 1,962 held-out questions (p < 0.0001), ahead on counting and relational reasoning. In 4 bits it peaks at 3.0 GB on one GPU, inside "about 6 GB". Its benchmark run and L3's full run go on now.)* *(24 Nov, after a rerun that fixed an overflow:*
*- **Six tasks:** the 3B (c) averages 43.74% (44.49% in 4 bits), against our 7B's 39.20% and DisasterM3's own fine-tuned 7B's 40.45%. It leads on both counting tasks and relational reasoning, and trails the 7B on disaster type, bearing bodies and scene.*
*- **Counting:** on the counting questions whose options don't give the answer away, it gets 53.3% against the 7B's 33.2%.*
*- **(b):** 32.47%.*
*- **In 4 bits:** 1.72 s per question against the 7B's 4.83 s, at 3.03 GB peak.*
*- **O4's 3B part is met.** [Comparison](Champion_Task/L2-step4-results/full/comparison/README.md).)* *(25 Nov, on a laptop with no GPU (L3 step 6, llama.cpp on the CPU): the 4-bit 3B peaks at 4.67 GB and answers as on the T4, 39.72% against 40.83% on the same 360 questions (no difference beyond chance), but takes about 84 s per question, mostly reading the photos (about 47 s each). So it suits background work, not live answers. [Laptop results](Champion_Task/L3-results/laptop/README.md).)* |

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
   - **Option (c), a mix chosen on validation and confirmed once on test (17 Nov):** C4 (the before-and-after U-Net on xBD images, find-then-grade on the other sources) leads on validation (**0.3501** destroyed IoU, 0.5881 mean IoU) and confirms once on the 2,007 test pairs (**0.4296** destroyed IoU, +0.031 over the U-Net and +0.040 over find-then-grade, both beyond noise). [The mix comparison](Champion_Task/E7-results/step2c/README.md).
   - **Chosen by Abrar on 19 Nov: C4 makes the system's damage map.** Every option is explained in plain words in [the ledger](Task_Ledger.md#every-option-in-plain-words-written-19-nov-for-the-decision): what it means, what it gives, what it costs.
   - **Aligning each pair's crops at grading time does not help (18 Nov):** moving the after-photo back by phase correlation (47% of clean pairs shifted > 2 px, 17% > 5 px, max 48.8 px) gives 0.3048 destroyed IoU against 0.3066 unaligned (95% interval −0.0072 to +0.0029). [Results](Champion_Task/R16c-results/step6/README.md).
   - [The comparison](Champion_Task/E7-results/step2/README.md), [the resampling](Champion_Task/E7-results/step2b/README.md). Find-then-grade's building table on all the test pairs: [buildings_chain_s42.sqlite](Champion_Task/E7-results/step2/buildings_chain_s42.sqlite) (grader seed 42), in the same columns as H2's.
   - **C4's table and hot spots on the test photos (E7 step 3, 19 Nov, Abrar's PC).** All six checks passed, and C4's scores reproduce (0.4295 against 0.4296). [Results](Champion_Task/E7-results/step3/README.md).
     - **The table** (`buildings_c4.sqlite`): 125,439 rows. On the sharper photos, one per building SAM 3 outlined (57,849). That's 24.5% more than joining touching pixels gave, because touching buildings no longer merge, most of all in dense cities (Beirut +39%, Turkey +30%). On xBD photos, one per connected patch of the U-Net's pixels (67,590). A column, `kind`, says which.
     - **The hot spots** (`hotspots.json`, the heatmap method unchanged): on photos with destroyed buildings, 82.7% of marked points are within 20 px of real damage. Over all 2,007 clean pairs it's 56.9%, below the 70–85% expected, because on photos without destroyed buildings most hot spots are false alarms.
     - **Counting from C4's map:** 34.89% on the questions without copied photos, ahead of either method alone (32.53% and 32.70%) beyond chance; 35.34% on all 3,580.
   - **Three follow-up checks (E7 step 3b, 20 Nov, Abrar's PC).** [Results](Champion_Task/E7-results/step3b/README.md).
     - **Counting from the table's per-building rows scores lower on the benchmark:** 33.18% against 34.89%. The benchmark's own true count is the number of joined blobs in its masks, so touching buildings count as one, and separate rows overshoot it (for intact buildings on the sharper photos, the rows are above the true count on 54% of questions). The benchmark figure stays the joined blobs'.
     - **The hot spots' weakness is false alarms on new photos, not the maps:** on the same validation photos, C4's maps do as well as the after-photo U-Net's (0.565 against 0.584 on photos without destroyed buildings). On the unseen test photos they mark false damage on undamaged photos about twice as often.
     - **A stricter rule for when a photo gets hot spots doesn't help** (the test hit share moves from 0.569 to 0.573), so the heatmap method stays as it was (T1 v3).
3. **On validation, counting from either method's table is level:** find-then-grade 37.73% against the U-Net's 39.24% on 1,055 questions (no clear difference, p = 0.39); median count error 40% against 33%. [Results](Champion_Task/E7-results/step1/README.md).
4. **The 3B's training is designed and built** (8 Nov), and **the teacher passes are running / done** (18 Nov). The 3B learns from the 7B in one of two ways:
   - (b) from the 7B's probabilities for each word of the answer, not only its final answer ("soft labels"; done 19 Nov, all 38,271);
   - (c) from the 7B's answers with the benchmark's options shown (done 18 Nov: **806 kept of 2,249** answered across building counting, road counting and relational reasoning, meeting the 700–900 expectation; [results](Champion_Task/L2-step1-results/options-rerun/L2S1c/README.md)).

   A rule fixed before training picks the better one on 1,962 held-out questions. Five Kaggle notebooks, [l2-step1b-soft-labels.ipynb](Champion_Task/l2-step1b-soft-labels.ipynb) to [l2-step4-winner-benchmark.ipynb](Champion_Task/l2-step4-winner-benchmark.ipynb); Mode (c)'s 3B training is ready to start now. *(23 Nov: both 3Bs are trained, one full epoch each; the held-out choice between them runs now, then the winner on the benchmark.)*
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
   - **Then the quality-fix run (Ridita, 17 Nov, Kaggle, internet off; commit `aaabf5bd4`).** The map reading is now written by code from the grades; one more question reads each photo's sign; and every section is checked for invented contact details and for its citations. It passed the offline proof again. "No danger" sentences 4 → 0, made-up contact details 1 → 0, citations 11 in 1 report → 24 in 4, all real, and 19 of the 24 support their sentence fully or partly; contradictions 6 → 3; useful yes / partly / no 2 / 4 / 0 (one "yes" borderline). New problems the checks can't see: the Hospitals section copies the Shelters section, the bridge's G5 cites `[EMS98-rc-grade-1]`, the labelled map wasn't made, and the Public report says "visit our website". The photo descriptions are unchanged and now the largest known source of error.
   - [Ridita's README](Offline_RAG_KR2/README.md), "Comparison with the July Gemini reports" and "Quality-fix run"; the counts in [report_comparison/](Offline_RAG_KR2/report_comparison/results.csv).
6. **The showcase website is built** (15–17 Nov), not deployed: section 5.
7. **Can the 7B learn to see damage? (L0b, 19 Nov, account 2.)** Its vision part was trained, for the first time, on 1,800 building crops drawn as in Tamanna's Part B. Then it was scored on Part B's 300 buildings.
   - It got **176 of 300** right, against 100 for our 7B with its vision part frozen and 212 for the grader. Both differences are clear.
   - On destroyed buildings it beats the grader (86 against 66), but it calls many intact buildings damaged.
   - By the rule fixed before the run, the grader keeps the grading, and the 34-GPU-hour full training isn't needed. [Results](Champion_Task/L0b-results/L0b/README.md).

## 4. What's decided, and what's still open

**Decided:**
- **One chain before anything new** (4 Nov). No new module until a before-and-after pair goes all the way to a report with the internet off, and every number in the report matches the building table.
- **Counts come from fixed queries on the table, never from a language model** (23 Oct). No model we tried writes reliable queries. And giving the 7B the table's count loses 10 points against the table alone: 27.0% against 37.0% on Aryan's 1,701 questions.
- **Grading stays with the trained grader** (2 Nov, Tamanna's Part B). On 300 true buildings the grader was right on 212, the fine-tuned 7B on 100 and the base 7B on 99; the fine-tuned 7B answered "intact" for 298 of them. In the reports, the 7B describes what the table decided. It doesn't grade.
- **The reports use the fixed flow, not agents** (10 Nov, Ridita, by her rule written before run 4).
- **Our 7B is the one retrained in late October**, kept on 28 Oct: it gained on relations, and no task fell by more than a point.
- **The website** is built from Aryan's prototype, in the look Abrar chose ("Aftermap" is a placeholder name). Abrar deploys it by hand; nothing goes public from a push.

- **The damage map comes from C4** (19 Nov, Abrar's choice): the before-and-after U-Net on xBD's coarser photos, find-then-grade on the sharper ones. It was the only option ahead on destroyed buildings on both the validation and the unseen test pairs. Its table and hot spots exist for all 2,065 test photos (E7 step 3). Still, nothing downstream should hard-code one method's file paths.
- **The 3B's two trainings run one full epoch each** (19 Nov, option A), started session by session by a script on Abrar's PC.

**Still open:**
- **How we report the counting goal,** given the flaw: count error beside accuracy. C4's counts clear the 34.2% bar (35.34%); whether update 5 claims O2 on that number, with the flaw stated beside it, is Abrar's call. *(25 Nov: the fair questions settle part of it. There C4 is no better than the blind rule (E7 step 3c), and the 3B beats it only when it sees the options (L2 step 4d), so O2 is reported as met as written, with that beside it.)*
- **Who writes the reports:** our 7B, or a small text-only model (`Qwen/Qwen2.5-3B-Instruct`) given the same facts (T2b). Our goals name our 7B, so a swap needs the supervisor's agreement. *(22 Nov: tested on ten scenes, and our 7B stays: 3 contradictions against the 3B's 15, 60 reports each. The 7B left 3 made-up guideline IDs in two staffing reports. [Results](Offline_RAG_KR2/results/t2b/README.md).)* *(23 Nov: Abrar added an ID guard to `fixed_flow_c4.py`. After the number guard, it drops any bracketed guideline ID the section wasn't shown. On Kaggle with the 7B on those two scenes, made-up IDs went from 3 to 0, and all reports finished. [Results](Offline_RAG_KR2/results/t2b_id_guard/README.md). Five blind pairs of reports are being read by Abrar and by Gemini as a second judge.)*
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
- **Done on 17–18 Nov:**
  - the real gallery: Abrar's export ([T3-gallery-export-results/](Champion_Task/T3-gallery-export-results/README.md), 6 validation pairs) replaced the four stand-in pairs in `T3_Website/public/data/`;
  - the before-and-after U-Net's 8-bit export ([L1c](Champion_Task/L1C-results/L1c/README.md), `33,163,619` bytes, `1.35×` ONNX FP32, Destroyed IoU drop 0.0014 / 0.0011 clean).
- **Still to do:**
  - the first deploy (Abrar);
  - a test on the booth laptop and on a phone;
  - later, a small local server for the booth that runs the guideline search and the report writer.
- **From Wed 18 Nov, Aryan takes over the build** by [his handover](Aryan_Task/T3_Website_Handover.md), which gives every path, the rules and the order of work. Noman can help: testing first, then the fixes Abrar picks ([his review](Noman_task/Review_AeroRescue_site.md), section 7).

## 6. What comes next, and your part

**Order of work:**
1. Abrar chooses the method (section 4). *Done 19 Nov: C4.*
2. Hot spots on that method's maps. *Done 19 Nov: E7 step 3.*
3. The reports read that method's table and hot spots (T2 step 5; **done 20 Nov** by Abrar, on two test pairs, internet off: both pass the five pass rules; [results](Offline_RAG_KR2/results/t2_step5_c4/README.md)). Next, every number in a report is checked against the table (step 7), after a fix for the numbers the 7B got wrong. *(Done 20 Nov: run 1 fails with 13 wrong numbers. Runs 2 and 3 fail a stricter rule that also catches building counts reused as staff numbers. Run 4 passes both rules with 0, so the reports' numbers all match the facts on both test pairs; [results](Offline_RAG_KR2/results/t2_step5_c4_fix3/README.md).)*
4. Who writes the reports (T2b).
5. A final internet-off run of the whole chain.
6. The website's live demo runs that chain.

**In parallel:** the website's gallery and deploy, and our supervisor's review of the whole repository. The review's findings are in [Repo_Review.md](Repo_Review.md) (step 1 of 4 done, 24 Nov), including any in your folders. *(The 3B's training ended 23 Nov; its benchmark, hand-off and laptop test are done, section 2.)* The showcase is around 15 Dec.

### Noman
- **The four wireframe images are gone,** and your later pushes of 17 Nov fixed the numbers, names and claims in your review's sections 2 and 4, plus the README and the gallery. I checked every number against its source file: they all match. Thanks.
- **If you want to keep working, work on the showcase website.** Section 7 of [your review](Noman_task/Review_AeroRescue_site.md) gives your part:
  - test the site where nobody has yet: Firefox, a screen reader, a real printer, and Safari if you have it;
  - write down what you find;
  - then fix what Abrar picks, agreeing with Aryan who edits which file.
- **Your own site:** the showcase website replaces it, so nothing more is needed there except one thing still missing: add one line to the top of its README saying it's an early prototype whose numbers aren't kept up to date (review, section 7.4).
- **The roadmap suggests you on the 3B:** L2, then L3, a 4-bit 3B that passes a question to the 7B when it's unsure.
  - L2's five notebooks are built and waiting to run. They push checkpoints to Abrar's Hugging Face account, so ask Abrar before you run any.
  - L3 starts once L2 has picked its 3B. *(23 Nov: Abrar built L3 and runs it: [the Kaggle notebook](Champion_Task/l3-4bit-3b-handoff.ipynb) and [the PC notebook](Champion_Task/l3-handoff-calibration.ipynb). Its smoke test passed; L2 chose (c) at 09:31, and L3's full run with it runs on account 3. Ask Abrar before running either.)* *(24 Nov: L3's steps 1–5 are done, rerun with an overflow fix. The 4-bit 3B averages 44.49% on the six tasks at 3.03 GB peak and 1.72 s per question; by the fixed rule it answers every question itself. [Hand-off results](Champion_Task/L3-results/full/L3/handoff/README.md).)* *(25 Nov: step 6 is done. On a laptop with no GPU the 4-bit 3B peaks at 4.67 GB and keeps the T4's accuracy, but takes about 84 s per question. [Laptop results](Champion_Task/L3-results/laptop/README.md).)* *(23 Nov, 15:30: the first benchmark runs of the 3B lost about 2–3% of answers to a half-precision overflow in its vision part, the one L2 step 2b fixed for training. Both are rerun with the fix. If you ever run this 3B in fp16 or 4 bits, keep `visual.blocks.31.mlp.down_proj` at full precision: see cell 2b of `l2-step4-winner-benchmark.ipynb`.)*

### Aryan
- **Your review's fixes:** you pushed them on 17 Nov, with a change list ([CHANGES.md](Aryan_Task/CHANGES.md)). Abrar checks them against the review's section 8 ([Review_and_Fix_List.md](Aryan_Task/Review_and_Fix_List.md)) next.
- **Already seen in the bridge** (`disasteller_inputs.py`, as pushed on 17 Nov):
  - **fixed:** an image that isn't in the table now returns the status `image_not_in_table`, not zeros with "ok" (7.1), and both statuses are checked (7.3); the hard-coded model names are gone;
  - **fixed by Abrar on 17 Nov, so don't redo them** (pull first):
    - safe areas are read with the heatmap file's own keys, `xy` and `distance_px` (7.2);
    - a missing field prints "missing", never a made-up 0 (7.4);
    - the text is titled "MODEL-ESTIMATED DAMAGE FACTS", says the counts are estimates, and no longer adds its own "deploy USAR teams here" advice (7.5).

    The file's self-check now tests all three on the real building table and heatmap file.
- **The bridge must also read the table of whichever method is chosen** (section 4), not a fixed one.
- **From Wed 18 Nov, the website:** [T3_Website_Handover.md](Aryan_Task/T3_Website_Handover.md), section 8.
  - Done on 17 Nov, so not yours any more: zoom and pan, hide and search, folding panels, the hover card, print, and the reports' error marks.
  - What's left is short: look at every page on a real phone, add a place for the supervisor line, and run the checks that wait for the gallery export and for 18 Nov.
  - **Noman may help.** He tests where nobody has yet (Firefox, a screen reader, a printer, Safari), then fixes only what Abrar picks. Before either of you edits a file, agree who has it.
- **In counting work,** report count error, not only accuracy.
- **(25 Nov) Two website gaps, for Abrar to decide on** ([System_Design_Notes §4.7](System_Design_Notes.md)):
  - "Try it" gives no written guidance or report for a visitor's photos.
  - The Reports page shows DisasTeller's own sample reports (ground photos from Wajima), not ours.
  - The cheapest fixes are written guidance from code in the browser, and our chain's 12 reports of 20 Nov on the site. Wait for Abrar's go before building either.

### Ridita
- **Started 18 Nov: Layer 3, generated before-photos** ([Layer3_Task/Layer3_Task_Brief.md](Layer3_Task/Layer3_Task_Brief.md)). Step 0's smoke test passed all 7 checks (6,443 pairs, 5,798 training and 645 validation with 560 xBD, 1,808,111 destroyed pixels, E5's 40 leaked pairs found again, 0 new leaks, 605 clean pairs); go given for Step 0's full run and Step 1's smoke test. `abrarmohammedtanzim/disasterm3-r11-r9-checkpoints` is shared with the Kaggle group for Step 1.
  - **Step 0 done 18 Nov: the full run passed all 7 checks** ([results](Layer3_Task/results/step0/README.md), commit `36894c0e2`).
  - **Step 1 done 23 Nov: all five checks passed** ([results](Layer3_Task/results/step1/README.md), commit `a37b21452`). R11 and R9 reproduce E5 step 2 exactly, so the bar stays mIoU 0.5604. A before-photo with no information is worse than none: R11 gets 0.4046 with the after-photo copied in and 0.2464 with a gray picture, against R9's 0.5402. Step 2a (pix2pix) waits for Abrar's go.
  - **Checked by Abrar on 19 Nov against E5's own files:**
    - the same 645 validation pairs, with the same true pixels per class in each;
    - the same pixel hashes for all 12,886 photos;
    - exactly E5's 40 leaks, and none new in any of the four combinations.
  - **Next: Step 1's smoke test** (go given), with gray = (86, 91, 69).
- **Done on 16 Nov:** the comparison with July's Gemini reports (section 3, item 5).
- **Done on 17 Nov: the quality-fix run,** our second offline proof (section 3, item 5). Checked on 18 Nov against your files: "PASSED", internet off, all five rules, commit `aaabf5bd4`; 24 citations, 13 supporting their sentence, 6 partly, 5 not. It is in update 5.
- **Your questions of 18 Nov:**
  - **Is T2 step 5 yours, and which method?** Yes, it's yours. The method: the mix (the before-and-after U-Net on xBD's images, find-then-grade on the others) leads on both the validation and the test pairs, and **Abrar confirmed it on 19 Nov: C4.** Both methods' tables have H2's columns, so write step 5 with the table file and the hot-spot file as inputs, never fixed paths. *The hot spots on C4's maps are done (E7 step 3, 19 Nov): use its two files, below, not the 7 shared images.*
  - **Should you add your laptop tests to the repository?** Yes: the pretend server's five modes and the 45 small checks, in `Offline_RAG_KR2/`, with a line in your README on how to run them. Today nobody else can re-run them.
- **T2 step 5 moves to Abrar (20 Nov), so the chain can move while you do Layer 3 step 1.** He works in a copy and leaves your `fixed_flow.py`, `disasteller_inputs.py` and run notebook as they are. Please push any unpushed changes to them first, then leave them until he says step 5 is in. The notes below stay as the record. *(20 Nov, 08:35: step 5 is in, so your files are yours again. It was built in new files and changed none of yours: [results](Offline_RAG_KR2/results/t2_step5_c4/README.md).)*
- **T2 step 5, connecting the bridge: your inputs are ready (19 Nov).** `disasteller_inputs.py` isn't called by the main script yet. Connect it to these two files, both from C4 on the same 2,065 test photos:
  - [`Champion_Task/E7-results/step3/buildings_c4.sqlite`](Champion_Task/E7-results/step3/README.md): tables `buildings` (H2's columns plus `kind`) and `images` (each photo's source and method);
  - `Champion_Task/E7-results/step3/hotspots.json`: the heatmap method's format, as T1 v3 wrote it.

  Abrar's check 6 already ran your bridge, unchanged, on both files for one xBD photo and one other photo; its printout is in the [step 3 README](Champion_Task/E7-results/step3/README.md), "What Ridita's report writer reads". Pass both paths in as inputs, never fixed in the code. When you connect it:
  - **Patches aren't buildings.** On xBD photos (`kind` = `patch`) each row is a connected patch of pixels of one class, which can hold several touching buildings. There the reports must say "damaged areas" or "patches", never "N buildings". On the sharper photos (`kind` = `outline`) each row is one building. *(E7 step 3b, 20 Nov: there the rows count more intact buildings than the benchmark's answers do, because the benchmark joins touching buildings into one; the rows are the right unit for a report.)*
  - **Every hot spot is a guess to be checked, never a finding.** On photos that really have destroyed buildings, 83% of hot spots sit near real damage. On photos without, only 29% do, so most are false alarms (E7 step 3). The report writer can't tell which kind of photo it has, so every hot spot must be written as the model's estimate ("the model estimates damage here, to be checked on the ground"), as the bridge's title already says, never as "destroyed buildings found here".
  - **Missing must not read as zero.** Done on 17 Nov. An image that isn't in the table returns `image_not_in_table` (Aryan). Safe areas are read with the right keys, and a missing field prints "missing" (Abrar).
  - **One method for both inputs:** met by these two files. The old pair, H2's table and T1's hot spots, shared only 7 images.
- **Then T2b:** the same facts and guideline search with two writers, our 7B and a small text-only model, counted by number contradictions and invented citations.
- **The website's Reports page** shows your proof run's reports word for word, with the problems from your README's "Quality problems" list marked: 14 phrases, plus 8 notes for problems with no single phrase to mark ([reportNotes.ts](T3_Website/src/core/reportNotes.ts)). Your comparison's further findings (the two photo descriptions that contradict their photos, the hall "in the center of the region", "existing medical facilities remain unaffected", the Emergency report's "G4 and G5, respectively") aren't marked yet. You checked all 14 marks and 8 notes against the proof run on 17 Nov: all correct.

### Tamanna
- **Your Plan 3 is approved as H5, honest count ranges (24 Nov).** I reran your two pilots on my PC: every table in your section 5 matches to 3 decimals, and splitting Part 2 by photo gives 3.12×, so your number holds. Before the test run: the 78% on photos with destroyed buildings beside the 92%, no "99.7%" from 5 photos, 1.56× beside 3.15×; a zero worded "none found" (about 1 in 8 "0 to 0" ranges hides a destroyed building); and your frozen ranges committed before you open any test file. The test files are in your private Kaggle dataset `tamannamou123/h5-inputs`. Your validation pilot is in update 6.
- **Your Part B result is part of the design** (section 4): grading stays with the trained grader.
- **Your Part B set was the test for L0b (19 Nov):** the 7B with its vision part trained got 176 of your 300 buildings right, against 212 for the grader and 100 for the frozen 7B (section 3, item 7). The grader stays.
- **L4, once suggested for you, is done (Abrar, 18 Nov):** EfficientSAM3's three released models find almost no buildings in our satellite photos. Building IoU is 0.010–0.054 against full SAM 3's 0.6302, so SAM 3 stays the finder ([results](Champion_Task/L4-results/L4/README.md)).

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
