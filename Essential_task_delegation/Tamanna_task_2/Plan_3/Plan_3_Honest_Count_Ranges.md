# Plan 3 · Honest count ranges: every count says how sure it is

**Owner:** Tamanna. **Task ID:** H5. **Status:** **approved by Abrar on 24 Nov**, with three changes before the test run, all made in this version (see "Abrar's go-ahead" below). Proposed 17 Nov 2026, revised 24 Nov for C4.
**Goals:** O2 (counting you can trust) and O3 (reports and demo). **GPU:** none; laptop CPU only.
**Starter code, already working:** [pilot_count_ranges_c4.py](pilot_count_ranges_c4.py) reproduces section 5 in about a minute. It imports [pilot_count_ranges.py](pilot_count_ranges.py) (the 17 Nov pilot), so keep both.

> This replaces the old Plan 3 (offline interactive demo). That idea became T3, the showcase website. Keep the old file, `Plan_3_Offline_Interactive_Demo.md`: the roadmap links to it as where T3 came from.

### Abrar's go-ahead (24 Nov): three changes, all made here

Abrar reran both pilots on his PC with the scripts unchanged. Every table in section 5 and the five worked examples match to 3 decimals ([Task_Ledger, H5](../../Task_Ledger.md#h5--honest-count-ranges-tamannas-plan-3-approved-24-nov)).

| Abrar asked for | Where it is now |
|---|---|
| **1. Honest wording**, in the summary lines, section 12 and anything that goes into an update: <br>• next to "9 in 10" (an average over all photos, 70% of which have no destroyed buildings), the 0.776 on photos with destroyed buildings; <br>• no "99.7% on big earthquake collapses", which comes from 5 photos; <br>• next to the median width of 2.1, the 12 on earthquake photos with destroyed buildings; <br>• next to the 3.15×, the 1.56× on destroyed counts. | Sections 1, 2, 5 and 12 |
| **2. A zero is worded "none found"**, never "likely 0 to 0". About 1 in 8 "0 to 0" ranges hides destroyed buildings, usually just one; together they're 3.7% of all destroyed buildings. A planner reads "0 to 0" as "skip this area". Report the rate in your README. | Sections 3, 4, 5 and 8; step 2 measures it |
| **3. A freeze commit.** Commit `count_ranges.py`, `ranges.json` and `question_ranges.json` **before you open any test file**, including the per-question test counts already on your PC. The commit time proves the test was used once. | End of step 3; section 8 has the commands |

**Also settled:**
- **Test files:** they're in a private dataset on your Kaggle account (section 8).
- **Update 6:** your validation pilot is in your section, as written by Abrar. The test result goes in a later update.
- **Part 2 holds when split by photo:** 3.12× instead of 3.15× (section 5).
- **Git:** never force-push to main. Your second push replaced your first; nothing was lost this time, but a force-push can wipe out a teammate's push that lands in between.

### What changed since the 17 Nov version

| Since 17 Nov | What it changes here |
|---|---|
| **Abrar chose C4 on 19 Nov:** R11 on xBD photos, find-then-grade on the others ([E7 step 2c](../../Champion_Task/E7-results/step2c/README.md)) | The range is now centred on **C4's count**, the number the report prints. The 17 Nov choice (F, halfway between the two models) is out: it can leave out the report's own number. On Turkey image 573 the report says 52 and F's range was 4 to 48. |
| On Turkey, C4 uses the grader, not R11 | Turkey's problem flipped. It was "R11 says 0" (truth 144, R11 5); now it's "C4 says 496" on the same 67 quake photos, **3.4 times too many**. C4 also says 0 on 59 of the 183 validation photos that do have destroyed buildings. |
| The whole chain ran end to end on 20 Nov ([roadmap §1b](../../Next_Steps_Roadmap.md), "Done when", met 22:08) | The "no new module until the chain runs" rule no longer blocks this. |
| Every test file is now available: the question-level ones in your local copy (E7 steps 2, 3 and 3b), the photo-level ones in your private Kaggle dataset (section 8) | Step 4 waits on no one. Open none of them before the freeze commit at the end of step 3. |
| How to report O2 is still open ([Team_Status §4](../../Team_Status.md), "Still open") | **New, part 2:** a counting score with no options. At 90% coverage, our range is **3.15 times narrower** than one from a rule that never sees the photo, and 1.56 times narrower on destroyed counts. |
| Hot spots on new photos are mostly false alarms, and a stricter pixel gate didn't fix it ([E7 step 3b](../../Champion_Task/E7-results/step3b/README.md)) | **New, optional:** label hot spots by the range's low end (section 9a). The pilot effect is modest. |
| Reports now run through Abrar's `fixed_flow_c4.py`, with a number guard and an ID guard. The website is now Aryan's build. | The handover goes to Abrar (facts and guard), Ridita (T2) and Aryan (website). |

---

## 1. The idea in one paragraph

Today the chain gives one number per photo, for example "Destroyed buildings: 52". It never says how sure it is, and it is often badly wrong in both directions: 496 destroyed on the Turkey validation photos where the truth is 144, and 0 on 59 photos that do have destroyed buildings. Nothing in the report or on the website warns anyone.

This plan gives every count a **range**, for example "about 52 destroyed (likely 9 to 95)", built so the true count lands inside about **9 times in 10** on average. That average is over all photos, and 70% of them have no destroyed buildings. On the photos that do, the range holds the true count about **3 times in 4** (0.776). Both rates are measured on our own data, not guessed. The method is *split conformal prediction*. It needs no training, no GPU and no new model, only a few hundred lines of Python on files we already have.

Three twists make it ours:
1. **The model C4 doesn't use becomes the second opinion.** C4 keeps one model per photo and drops the other. The range widens when they disagree, so R11's "0" on Turkey and the grader's overcount on xBD now earn their keep. On the 72 photos with 5 or more destroyed buildings, coverage rises from 0.700 to 0.777 (section 5).
2. **Ranges are calibrated separately for each hazard** (earthquake, wind, water, fire, other) and for busy against calm photos, because our models fail differently on each.
3. **The same method gives O2 an honest counting score.** At the same 90% coverage, how much narrower is our range than a blind one? A rule that never sees the photo can't win that, by construction. Ours is 3.15 times narrower overall, and 1.56 times narrower on destroyed counts, the class our models know least.

## 2. Why this, and why now

| Problem today | Evidence in the repo | What the ranges change |
|---|---|---|
| O2's counting score can't show that we count, and how to report it is still open. | C4 scores 35.34%, above the 34.2% target, but a rule that never sees the photo scores 66.98% ([Team_Status §3](../../Team_Status.md), item 1). | Part 2: on the benchmark's own questions, with no options, our 90% range is 3.15× narrower than a blind 90% range (4.2× on intact, 4.0× on damaged, 1.6× on destroyed). |
| C4's counts carry no error bar and are often far off. | Turkey: 496 against a truth of 144. C4 says 0 on 59 of 183 photos with destroyed buildings (section 5). | Ranges widen where the counts go wrong. On photos with destroyed buildings they cover 0.776 (0.851 on the "other"-source ones), against 0.725 for a plain range. A zero is worded "none found", because about 1 in 8 zeros hides destroyed buildings. |
| C4 throws one model away per photo. | E7: each model wins where the other fails (Turkey destroyed IoU 0.323 against 0.087; without Turkey 0.410 against 0.467). | The unused model sets the width. That adds +0.077 coverage on photos with 5 or more destroyed and +0.121 on "other" photos (G against C1, section 5). |
| The website says "A model's estimate, to be checked by people on the ground" on every page, but never says how far to trust each number. Reports must match their facts exactly. | [Team_Status §5](../../Team_Status.md); T2 step 7's number check and `fixed_flow_c4.py`'s number guard. | Each count comes with "likely X to Y" and a "check by eye" flag when the range is wide. Because the range is part of the facts, the guard accepts it. |

**Why nobody has it yet.** A search of every planning document on 17 Nov, and again on 24 Nov, found no conformal, prediction-interval or count-range work besides this plan. E7 reports point counts and the median count error, H2 gives point counts, and the reports state point counts.

**How it fits the chain.** It adds no model and no hand-off. It reads the two counts the chain already computes and adds two numbers (low, high). It changes no one else's file.

## 3. What the user would see

| Today (C4's count) | With this plan |
|---|---|
| Destroyed buildings: 52 | about 52 destroyed buildings (likely 9 to 95). *Our two models disagree here; check this area by eye.* |
| Destroyed buildings: 28 | about 28 (likely 3 to 53). *Check this area by eye.* |
| Destroyed areas: 12 | about 12 destroyed areas (likely 6 to 18). *Check this area by eye.* |
| Destroyed buildings: 166 | about 166 (likely 34 to 298). *Check this area by eye.* |
| Destroyed buildings: 0 | No destroyed buildings found. |

**A zero is worded "none found", never "likely 0 to 0".** A planner reads "0 to 0" as "skip this area", but about 1 in 8 of those photos does have destroyed buildings, usually one (Abrar's check, section 5). "None found" says what the models saw without promising there's nothing there.

These are real validation photos; section 4 shows how each was computed. A wide range is not a failure: it is the system honestly saying "look here yourself", which is what a rescue planner needs. On xBD photos the count is of *areas* (patches of pixels), never buildings, as the bridge already says ([Team_Status §6](../../Team_Status.md), Ridita: "Patches aren't buildings").

## 4. How it works, in plain words

**Per photo (the version that ships):**
1. **Two counts of destroyed buildings.**
   - *R11's count:* blobs of destroyed pixels in R11's map, 8-connected, at least 20 pixels each (H2's rule).
   - *The grader's count:* SAM 3 outlines that the grader (seed 42, the one C4 uses) labels destroyed, at least 20 pixels.
   - *The truth*, for calibration only: the same blob rule on the true mask.
2. **The centre is C4's count:** R11's count on xBD photos, the grader's on the others. Because the range is built around it, it always contains the number the report prints.
3. **A difficulty scale:** `s = √max(R11, grader) + 1 + |R11 − grader|`. Bigger counts and bigger disagreement both give a bigger `s`.
4. **Calibration**, on validation photos only. For each photo, the error ratio is `e = |truth − centre| / s`. The photos are split into groups: hazard × busy, where *busy* means either model counts 3 or more. For each group of m photos, `q` is the ⌈(m+1)·0.9⌉-th smallest `e`. A group with fewer than 9 photos uses the `q` from all photos pooled.
5. **The range for a new photo:** `[centre − q·s, centre + q·s]`, rounded inward to whole buildings, never below 0. A range of 0 to 0 is shown as "none found" (section 3).
6. **The promise:** if a new photo is like the calibration photos of its group, its true count is inside the range at least 90% of the time. A disaster unlike anything in validation can break "like", and that is exactly what the test pairs check (section 6, step 4).

**Per question (the O2 score):** the same steps on the benchmark's counting questions. The truth is the benchmark's own answer, for intact, damaged or destroyed, and the groups are class × source. The **blind rule** for comparison sees no photo. It knows the class, the source (xBD or not) and the hazard, and its centre is the median true answer of its group. Both are calibrated to 90%, so the one with narrower ranges knows more. One caveat: the benchmark asks about a class only when the photo has some, so every true answer is at least 1. These ranges are for scoring, not for the reports.

**Worked examples** (validation, variant G, `q` from all 605 photos, so for illustration only):

| Photo | Source | Truth | R11 | Grader | C4 = centre | Group, q | Range | Inside? |
|---|---|---|---|---|---|---|---|---|
| turkey_earthquake1_post_573 | other | 30 | 0 | 52 | 52 | quake busy, 0.729 | 9–95 | yes |
| turkey_earthquake4_post_785 | other | 27 | 0 | 28 | 28 | quake busy, 0.729 | 3–53 | yes (F's range missed it by 1) |
| portugal_wildfire_00000666 | xBD | 9 | 12 | 8 | 12 | fire busy, 0.804 | 6–18 | yes |
| hawaii_wildfire_post_995 | other | 121 | 15 | 166 | 166 | fire busy, 0.804 | 34–298 | yes, but too wide to act on: a "check by eye" case |
| pinery_bushfire_00000022 | xBD | 0 | 0 | 0 | 0 | fire calm, 0.5 | 0–0, shown as "none found" | yes |

## 5. The pilot: already done (24 Nov, validation only, checked)

Run [pilot_count_ranges_c4.py](pilot_count_ranges_c4.py) to reproduce all three tables. No test file is read.
- **Data:**
  - the 605 clean validation photos (E5's 40 leaked pairs removed), 520 xBD and 85 other;
  - truth: `Champion_Task/E1-results/E1/gt/`;
  - R11: `Champion_Task/R16-results/R16/R11_tta/`;
  - grader, seed 42, and each photo's source: `Champion_Task/R16c-results/step5/instances_val.csv`;
  - questions: `Champion_Task/E7-results/step1/e7_step1_per_question.csv`;
  - hot spots: `Champion_Task/E7-results/step3b/val_c4_hotspots_per_image.csv`.
- **Method:** 300 random 50/50 splits, calibrating on one half and checking on the other; alpha 0.10.
- **Sanity check that passed:** on the 67 quake photos (all "other", so C4 uses the grader), destroyed buildings are truth 144, R11 5 and grader = C4 496. The 17 Nov pilot still reproduces too (variant F's row below is its row).

**Part 1: per photo, destroyed buildings.** Coverage is the share of check photos whose true count is inside the range.

| Variant | What it is | All 605 | ≥1 destroyed (183) | Quake ≥1 (20) | Quake ≥10 (5) | ≥5 destroyed (72) | Other source ≥1 (22) | Median width |
|---|---|---|---|---|---|---|---|---|
| F | 17 Nov choice: centre halfway between the models (ruled out) | 0.920 | 0.775 | 0.821 | 0.840 | 0.785 | 0.837 | 2.1 |
| C0 | Centre C4, one group, scale √C4+1 | 0.904 | 0.725 | 0.613 | 0.211 | 0.580 | 0.561 | 1.4 |
| C1 | C0, by hazard × busy | 0.920 | 0.759 | 0.794 | 0.788 | 0.700 | 0.730 | 2.0 |
| **G** | **C1 + second opinion in the scale** | **0.920** | **0.776** | **0.836** | **0.997** | **0.777** | **0.851** | **2.1** |
| G2 | G, by source × busy instead | 0.916 | 0.753 | 0.841 | 1.000 | 0.731 | 0.855 | 1.8 |
| G3 | G, by hazard × busy × source | 0.921 | 0.778 | 0.836 | 0.997 | 0.781 | 0.851 | 2.1 |

G's median width is 2.1 over all photos, but **12 on quake photos with destroyed buildings** (in-sample), against 9.0 for F on 17 Nov: the price of centring on C4's overcount. Quote the two widths together.

**The zero case** (Abrar's check, 24 Nov, same files; [Task_Ledger, H5](../../Task_Ledger.md#h5--honest-count-ranges-tamannas-plan-3-approved-24-nov)):
- On the check halves, 12% of "0 to 0" ranges belong to photos that have destroyed buildings. Those photos hold 3.7% of all destroyed buildings.
- Calibrated on all 605 photos, 11 of the 116 "0 to 0" photos have destroyed buildings: true counts 3, 2 and nine of 1.
- Hence the "none found" wording (section 3). Step 2 measures the rate again with your own code, for the README.

**Part 2: per question, the O2 score** (974 clean validation counting questions: 521 intact, 270 damaged, 183 destroyed).

| Questions | Blind: coverage | Blind: median width | Ours: coverage | Ours: median width | Blind width ÷ ours |
|---|---|---|---|---|---|
| All | 0.913 | 60.7 | 0.908 | 19.3 | **3.15×** |
| Intact | 0.907 | 95.9 | 0.906 | 22.6 | 4.24× |
| Damaged | 0.919 | 60.6 | 0.907 | 14.9 | 4.05× |
| Destroyed | 0.921 | 24.2 | 0.914 | 15.5 | 1.56× |
| True answer ≥ 20 | 0.767 | 95.9 | 0.837 | 48.6 | 1.97× |

For reference, C4's point count on the same questions has a median error of 2.0 and is within 20% of the truth on 40.0% of them.

**Abrar's check (24 Nov):** splitting by photo instead of by question, so that a photo's three questions stay on the same side, gives **3.12×** (destroyed 1.50×) with the same coverage. The number holds, and nothing here needs to change.

**Part 3: hot spots** (C4's 726 validation hot spots, 511 of them hits, share 0.704). Each photo's range is calibrated on the other half of the photos.

| Photos | Share of photos with hot spots | Hot spots | Hit share | Share of all hits |
|---|---|---|---|---|
| Range says "at least 1 destroyed" (low ≥ 1) | 0.144 | 129 | 0.780 | 0.197 |
| The rest | 0.856 | 597 | 0.687 | 0.803 |

Of the "at least 1" photos, 86.6% truly have destroyed buildings.

**What it shows:**
- Every variant keeps the 90% promise overall. The plain C0 looks narrow only because most photos have 0 destroyed buildings, and it fails where it matters: 0.580 on photos with 5 or more destroyed.
- The second opinion is what does the work (C1 → G): +0.077 on photos with 5 or more destroyed and +0.121 on "other" photos, for 0.1 more median width. The 5 big earthquake collapses (10 or more destroyed) gain the most, but 5 photos can't carry a claim, so that column is never quoted on its own.
- Part 2 is the headline for O2: same coverage, ranges 3.15 times narrower overall and 4 times narrower on intact and damaged. On destroyed counts it's 1.56×; our models know least where it matters most, and that's worth saying.
- Part 3 is modest: a "damage likely here" label, not a fix for false alarms (section 9a).

**Honest limits of the pilot:**
- **Averages hide the hard photos, so quote numbers in pairs:** coverage 0.920 overall with 0.776 on photos with destroyed buildings; median width 2.1 overall with 12 on quake photos with destroyed buildings; 3.15× overall with 1.56× on destroyed counts.
- **"0 to 0" isn't a promise:** about 1 in 8 hides destroyed buildings (3.7% of them all). It is worded "none found".
- Only 20 quake photos have destroyed buildings, and 5 have 10 or more, so the quake columns are noisy. Don't quote the 5-photo column (0.997) as a result.
- All variants were looked at on the same 605 photos, so the test pairs, used once, are the only unbiased check.
- Coverage on hard photos (≥5 destroyed) is still below 0.90. The 90% holds on average over photos, not for every kind of photo.
- On the sharper photos the centre counts outlines, while the truth counts joined blobs (touching buildings merge into one; E7 step 3b). The range absorbs that offset, but its unit is the benchmark's joined blobs. Say so in the README.

## 6. The plan, step by step

Four steps. Steps 1 to 3 use validation only. Step 4 is the one test run and the handover. Do them in order: each step's check must pass before the next one starts.

### Step 1: send the plan, reproduce the pilot (done 24 Nov)

- The plan and both pilots were pushed, and Abrar approved them as H5.
- The pilot was rerun on your PC and on Abrar's, and both match section 5 to 3 decimals.
- The old demo file was restored in your copy.
- **Left for you:** read section 4 until you can explain each part in your own words.

### Step 2: extend on validation, then freeze the variant

All of this goes in one script that extends `pilot_count_ranges_c4.py`. It runs on the same files in about a minute.

| Do | Check before moving on |
|---|---|
| Write the choosing rule (below) into your README **before** running anything in this step. | The rule is in the README, unchanged from this plan. |
| Add the **damaged** count (class 2) with the same code. | Damaged gets its own Part 1 table, with the same columns. |
| **Seed check:** rerun Part 1 with grader seeds 43 and 44 (`step5/instances_val.csv`; seed 44 in `step5b/`). The centre stays seed 42, the one C4 uses. | Seed 42 alone still gives section 5. Write down how far coverage moves with the other seeds. |
| **Leave-one-event-out check** (a stand-in for an unseen disaster): calibrate on every validation event but one, check on the event left out, and repeat for each event. | A table of coverage by left-out event. Expect Turkey to drop, since it is nearly all of the quake group. Write down by how much. |
| **Choose the variant by the rule**, for destroyed and for damaged, then freeze it. | The choice follows from the rule alone, with no new variant. |
| **Zero case**, for the chosen variant: on the check halves, the share of "0 to 0" ranges whose photo has destroyed buildings, and those photos' share of all destroyed buildings. Do it for damaged too. | Destroyed is close to Abrar's 12% and 3.7%. Both rates go in the README. |

### Step 3: build the function

| Do | Check before moving on |
|---|---|
| Write `count_ranges.py`: `count_range(r11_count, grader_count, source, hazard, cls) -> (centre, low, high, note)`, plus `ranges.json` (each group's `q`, alpha, the variant, the data used, the date). | The function reads only `ranges.json`; nothing is hard-coded. |
| Freeze Part 2's question-level `q`s in `question_ranges.json`. | Its coverage on validation matches section 5, Part 2. |
| Add the 5 worked examples of section 4 as a self-test, and make the note for a 0 to 0 range say "none found". | The self-test passes. Running on validation reproduces step 2's coverage. |
| **Freeze commit** (Abrar's rule): commit `count_ranges.py`, `ranges.json` and `question_ranges.json` and push them (commands in section 8). **Open no test file before this**, including the ones already on your PC (section 8 lists them). | The commit is on GitHub. Its time proves the test was used once. |

**The choosing rule (step 2), fixed now:**
1. The centre is C4's count, so the range always contains the number the report prints. That rules out F and the 17 Nov variant E.
2. Among C0, C1, G, G2 and G3, keep the variants whose overall coverage is at least 0.88 and whose median width is at most 3.
3. Of those, take the one with the highest coverage on photos with 5 or more destroyed buildings.
4. If two are within 0.02 of each other, keep the one with fewer groups. Use only these five, nothing new.

With section 5's numbers this picks **G** (0.777; G3's 0.781 is within 0.02 and has more groups).

### Step 4: one test run, write-up and handover

| Do | Check before moving on |
|---|---|
| **Reproduce first.** Question level (all local): read `Champion_Task/E7-results/step3b/counting_per_question.csv`, the 3,514 clean test questions with the truth, `R11 \| count`, `chain_s42 \| count` and `C4 blobs \| count`. Photo level: download the Kaggle files (section 8) and count R11, grader and truth on E6's 2,007 clean test pairs, the same way as the pilot. Use only the pairs listed in `Champion_Task/E6-results/E6/test_clean_pairs.csv`. | Accuracy with the nearest option on the clean questions: C4 blobs 34.89%, R11 32.53%, find-then-grade seed 42 32.70% ([E7 step 3b](../../Champion_Task/E7-results/step3b/README.md), Check A). R11's destroyed IoU from its maps against E6's masks: **0.3984**. If either is off, stop and ask Abrar. |
| **One run** on the test pairs with the frozen JSON files, unchanged. Report coverage and width: overall, by hazard, by event, by source, and separately for the five events the segmenter never trained on: **Mexico (191 pairs) and Noto (44)**, both earthquakes; Joplin (148, tornado); Ian (104, hurricane); Guatemala (26, volcano). Then Part 2's blind comparison on the 3,514 questions. | Each expectation in section 7 marked met or not met. |
| Write `README.md` in the team's results format: what ran, the expectations, the results, what went against them. Include the zero-case rates from step 2 and from the test, and quote numbers in pairs (section 5, "Honest limits"). | Every number has its file next to it. |
| **Handover** (section 8): a short note with the function, the JSON files and the sentence format. Don't edit their files. | They can call it in 3 lines. |
| **Delete the Kaggle dataset** `tamannamou123/h5-inputs` once H5 is done (Abrar's request). | The dataset page is gone. |

## 7. Expectations, fixed before the test run

**Photo level** (2,007 clean test pairs):
- **Overall coverage: 0.85 to 0.95.** The test pairs differ from validation: about twice the destroyed pixels per pair, Turkey at 20% of the pairs against 10%, and five new events. So slightly under 0.90 would not surprise.
- **Quake photos with at least 1 destroyed building:** the chosen variant beats C0 by at least 0.15.
- **Photos with 5 or more destroyed:** the chosen variant beats C0.
- **Median width:** at most 4 buildings.
- **The five unseen events:** no number predicted. The two unseen earthquakes test whether calibrating on Turkey and Morocco transfers to other earthquakes.
- **The zero case:** no number predicted. Report the share of "none found" photos that have destroyed buildings, and their share of all destroyed buildings (validation: 12% and 3.7%).
- **Coverage on photos with at least 1 destroyed building** is reported beside the overall coverage, never left out.

**Question level** (3,514 clean test questions):
- Our coverage 0.85 to 0.95.
- Our median width at least **2×** narrower than the blind rule's overall (validation: 3.15×), and narrower on each class.

**Keep rule:** the ranges go into reports and the website only if photo-level overall test coverage is at least 0.85. If not, that is reported as the result, and nothing is re-tuned on the test pairs. The O2 score (question level) is reported either way.

## 8. Who gives what

**From Abrar, all answered on 24 Nov:**
1. **Go-ahead:** yes, as H5, with the three changes above (all made in this version).
2. **The photo-level test files** are in a private dataset on your Kaggle account, `tamannamou123/h5-inputs`:
   - two folders, `r11_tta_maps/` and `test_masks_4class/`, with 2,065 PNGs each, named after the after-image (0 background, 1 intact, 2 damaged, 3 destroyed);
   - download them from the dataset page, or with `kaggle datasets download tamannamou123/h5-inputs --unzip`, into a folder outside the repository (the repository is public, and test masks don't go there);
   - use only the pairs listed in `Champion_Task/E6-results/E6/test_clean_pairs.csv`;
   - download them only in step 4, after the freeze commit, and delete the dataset when H5 is done.
3. **Update 6:** yes. Your validation pilot is in your section: 92% overall, 78% on photos with destroyed buildings, and ranges 3.2× narrower than a blind rule's (1.6× on destroyed counts). The test result goes in a later update.

**Test files already in your local copy. Don't open any of them before the freeze commit:** `Champion_Task/E7-results/step3b/counting_per_question.csv` (the per-question test counts), `instances_test.csv`, `buildings_chain_s42.sqlite`, `buildings_c4.sqlite` and `Champion_Task/E7-results/step3/hotspots_per_image.csv`. The validation files are free to use.

**Git (Abrar's commands):**
- **Never force-push to main** (`--force`). A force-push can wipe out a teammate's push that lands in between.
- Before you start, get the latest: `git pull --rebase --autostash origin main`.
- **The freeze commit**, at the end of step 3:
  ```bash
  git add -- Essential_task_delegation/Tamanna_task_2/Plan_3/count_ranges.py Essential_task_delegation/Tamanna_task_2/Plan_3/ranges.json Essential_task_delegation/Tamanna_task_2/Plan_3/question_ranges.json
  git commit -m "H5: ranges frozen on validation, before the test run"
  git pull --rebase --autostash origin main
  git push origin main
  ```

**What you hand over (in this folder, or wherever Abrar prefers):**
- `count_ranges.py`, `ranges.json` and `question_ranges.json`;
- `README.md` with the validation and test results;
- a three-line usage note for each of:
  - **Abrar**, for `fixed_flow_c4.py`: the range goes into the facts, so the number guard accepts its two numbers;
  - **Ridita**, for T2;
  - **Aryan**, for the website's Explore and Results pages.

The sentence format for reports and the website is `about {centre} (likely {low} to {high})`, with "buildings" on the sharper photos and "areas" on xBD photos. When the range is wider than 10, add: *"our two models disagree here; check this area by eye"*. When the range is 0 to 0, write *"none found"* instead of a range.

**What you don't do:** edit `fixed_flow.py`, `fixed_flow_c4.py`, `disasteller_inputs.py` or `T3_Website/`. Abrar, Ridita and Aryan decide whether and where to call your function.

## 9. Optional extras, only after section 6 is done

**(a) A "damage likely here" label for hot spots.**
- The rule, fixed now: a photo's hot spots get the label when its destroyed range's low end is at least 1. Nothing is removed (E7 step 3b showed that removing hot spots by a pixel gate doesn't help).
- Pilot on validation: labelled photos' hot spots hit 0.780, against 0.687 for the rest. But only 14% of photos with hot spots get the label, holding 20% of the hits.
- Confirm once on test with `Champion_Task/E7-results/step3/hotspots_per_image.csv`. The expectation: the labelled hit share is above the rest by at least 0.05.

**(b) The bigger VLM from CraftX, scored honestly** (Abrar's request; CraftX's GPU type and hours are still unknown).
- Ask the big model *"How many destroyed buildings are in this after-image?"* on the 605 validation photos, with **no options shown**.
- Use its count as a third opinion. A better counter gives **narrower ranges at the same 90% coverage**, which answers "does a bigger VLM help?" without the middle-option trap.
- Candidates suggested on 8 Nov: Qwen3.6-27B, and Qwen2.5-VL-72B-AWQ as the anchor from the DisasterM3 paper's Table 2.

**(c) A "look here first" list:** sort photos by range width, widest first. Report how many of the true destroyed buildings sit in the 10% widest. If that share is high, width is a useful signal for where people should check first.

## 10. Risks, and what to do about them

| Risk | What to do |
|---|---|
| The quake group is small (67 photos, 20 with destroyed buildings). | Report coverage over the 300 repeats, and the leave-one-event-out table (step 2). Never claim more than the data shows. |
| Unseen events (Mexico, Noto) behave differently. | That is the point of the test. Report it either way; a failure there is a real finding about transfer. |
| Ranges on big collapses are wide (median 12 on quake photos in-sample; 34 to 298 on one Hawaii wildfire photo), because C4 overcounts there. | That's honest. Show it as "check by eye", and count how often it happens. |
| The live chain may skip SAM 3 on xBD photos, leaving no grader count there. | Use C1 (C4 alone, by hazard × busy) on those photos: 0.759 on photos with destroyed buildings instead of 0.776. The website's in-browser "Try it" runs one U-Net only, so it shows no ranges unless Abrar wants C1 there. |
| Question-level truths are always at least 1. | Use those ranges only for the O2 score, never in reports. The photo-level ranges are the ones that ship. |
| A zero hides destroyed buildings (about 1 in 8 "0 to 0" photos on validation). | Word it "none found", and report the rate (step 2 and the test). |
| A test file gets opened before the ranges are frozen. | The freeze commit at the end of step 3 comes first. Section 8 lists the test files already on your PC. |
| An average makes the result look better than it is. | Quote numbers in pairs (section 5, "Honest limits"), in the README and in every update. |
| Abrar wants a different centre later. | The function takes the centre's source as data, so only `ranges.json` is redone, on validation. |

## 11. Done when

- `count_ranges.py`, `ranges.json`, `question_ranges.json` and `README.md` exist, and the self-test passes;
- the variant was chosen on validation by the choosing rule (step 2);
- the freeze commit is on GitHub **before** any test file was opened, and the test pairs were used **once**;
- every expectation in section 7 is marked met or not met, and the README reports the zero-case rate;
- Abrar, Ridita and Aryan have the usage note;
- the Kaggle dataset `tamannamou123/h5-inputs` is deleted.

## 12. How to explain it (viva, or a weekly update)

> "A count with no error bar can't be trusted. Our chosen map counted 496 destroyed buildings on Turkey photos with 144, and none at all on a third of the photos that had some. So we added conformal count ranges: a range around every count, calibrated on validation by hazard, that widens when the model we didn't pick disagrees with the one we did. It holds the true count about 9 times in 10 over all photos, and about 3 times in 4 on the photos that do have destroyed buildings. The median range is two buildings overall, but twelve on earthquake photos with destroyed buildings. When the range is zero we say 'none found', because about 1 in 8 of those photos still has a destroyed building. It also gives our counting goal a score with no options to exploit: at the same 90% coverage, our ranges are three times narrower than a rule that never sees the photo, and one and a half times narrower on destroyed counts, where our models know least. It needs no GPU and no training."

**Background reading (short):**
- Angelopoulos and Bates, *A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification* (2021, arXiv 2107.07511). Read section 1 (split conformal), section 2.3 (dividing the error by an uncertainty scale, which is our `s`) and section 4.1 (coverage per group, which is our hazard groups).
- The per-group version is called *Mondrian* conformal prediction, after Vovk, Gammerman and Shafer, *Algorithmic Learning in a Random World* (2005). Use the name in the viva.
