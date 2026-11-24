# Plan 3 · Honest count ranges: every count says how sure it is

**Owner:** Tamanna. **Status:** proposed 17 Nov 2026, **revised 24 Nov for C4**; Abrar decides. **Suggested task ID:** H5 (still free in the roadmap on 24 Nov; Abrar assigns IDs).
**Goals:** O2 (counting you can trust) and O3 (reports and demo). **GPU:** none; laptop CPU only.
**Starter code, already working:** [pilot_count_ranges_c4.py](pilot_count_ranges_c4.py) reproduces section 5 in about a minute. It imports [pilot_count_ranges.py](pilot_count_ranges.py) (the 17 Nov pilot), so keep both.

> This replaces the old Plan 3 (offline interactive demo). That idea became T3, the showcase website.

### What changed since the 17 Nov version

| Since 17 Nov | What it changes here |
|---|---|
| **Abrar chose C4 on 19 Nov:** R11 on xBD photos, find-then-grade on the others ([E7 step 2c](../../Champion_Task/E7-results/step2c/README.md)) | The range is now centred on **C4's count**, the number the report prints. The 17 Nov choice (F, halfway between the two models) is out: it can leave out the report's own number. On Turkey image 573 the report says 52 and F's range was 4 to 48. |
| On Turkey, C4 uses the grader, not R11 | Turkey's problem flipped. It was "R11 says 0" (truth 144, R11 5); now it's "C4 says 496" on the same 67 quake photos, **3.4 times too many**. C4 also says 0 on 59 of the 183 validation photos that do have destroyed buildings. |
| The whole chain ran end to end on 20 Nov ([roadmap §1b](../../Next_Steps_Roadmap.md), "Done when", met 22:08) | The "no new module until the chain runs" rule no longer blocks this. |
| Most test files are now in your local copy (E7 steps 2, 3 and 3b) | The question-level test (section 6, step 4) needs nothing from Abrar. Only the photo-level test still needs E6's masks and R11's test maps. |
| How to report O2 is still open ([Team_Status §4](../../Team_Status.md), "Still open") | **New, part 2:** a counting score with no options. At 90% coverage, our range is **3.15 times narrower** than one from a rule that never sees the photo. |
| Hot spots on new photos are mostly false alarms, and a stricter pixel gate didn't fix it ([E7 step 3b](../../Champion_Task/E7-results/step3b/README.md)) | **New, optional:** label hot spots by the range's low end (section 9a). The pilot effect is modest. |
| Reports now run through Abrar's `fixed_flow_c4.py`, with a number guard and an ID guard. The website is now Aryan's build. | The handover goes to Abrar (facts and guard), Ridita (T2) and Aryan (website). |

---

## 1. The idea in one paragraph

Today the chain gives one number per photo, for example "Destroyed buildings: 52". It never says how sure it is, and it is often badly wrong in both directions: 496 destroyed on the Turkey validation photos where the truth is 144, and 0 on 59 photos that do have destroyed buildings. Nothing in the report or on the website warns anyone.

This plan gives every count a **range**, for example "about 52 destroyed (likely 9 to 95)", built so the true count lands inside about **9 times in 10**. That rate is measured on our own data, not guessed. The method is *split conformal prediction*. It needs no training, no GPU and no new model, only a few hundred lines of Python on files we already have.

Three twists make it ours:
1. **The model C4 doesn't use becomes the second opinion.** C4 keeps one model per photo and drops the other. The range widens when they disagree, so R11's "0" on Turkey and the grader's overcount on xBD now earn their keep. Without the second opinion, coverage on big quake collapses is 0.788; with it, 0.997 (section 5).
2. **Ranges are calibrated separately for each hazard** (earthquake, wind, water, fire, other) and for busy against calm photos, because our models fail differently on each.
3. **The same method gives O2 an honest counting score.** At the same 90% coverage, how much narrower is our range than a blind one? A rule that never sees the photo can't win that, by construction.

## 2. Why this, and why now

| Problem today | Evidence in the repo | What the ranges change |
|---|---|---|
| O2's counting score can't show that we count, and how to report it is still open. | C4 scores 35.34%, above the 34.2% target, but a rule that never sees the photo scores 66.98% ([Team_Status §3](../../Team_Status.md), item 1). | Part 2: on the benchmark's own questions, with no options, our 90% range is 3.15× narrower than a blind 90% range (4.2× on intact, 4.0× on damaged, 1.6× on destroyed). |
| C4's counts carry no error bar and are often far off. | Turkey: 496 against a truth of 144. C4 says 0 on 59 of 183 photos with destroyed buildings (section 5). | Ranges widen where the counts go wrong. They cover 99.7% of the big quake photos and 85% of the "other"-source photos with destroyed buildings. |
| C4 throws one model away per photo. | E7: each model wins where the other fails (Turkey destroyed IoU 0.323 against 0.087; without Turkey 0.410 against 0.467). | The unused model sets the width. That adds +0.209 coverage on big quake photos, +0.077 on photos with 5 or more destroyed and +0.121 on "other" photos (G against C1, section 5). |
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
| Destroyed buildings: 0 | 0 (likely 0 to 0) |

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
5. **The range for a new photo:** `[centre − q·s, centre + q·s]`, rounded inward to whole buildings, never below 0.
6. **The promise:** if a new photo is like the calibration photos of its group, its true count is inside the range at least 90% of the time. A disaster unlike anything in validation can break "like", and that is exactly what the test pairs check (section 6, step 4).

**Per question (the O2 score):** the same steps on the benchmark's counting questions. The truth is the benchmark's own answer, for intact, damaged or destroyed, and the groups are class × source. The **blind rule** for comparison sees no photo. It knows the class, the source (xBD or not) and the hazard, and its centre is the median true answer of its group. Both are calibrated to 90%, so the one with narrower ranges knows more. One caveat: the benchmark asks about a class only when the photo has some, so every true answer is at least 1. These ranges are for scoring, not for the reports.

**Worked examples** (validation, variant G, `q` from all 605 photos, so for illustration only):

| Photo | Source | Truth | R11 | Grader | C4 = centre | Group, q | Range | Inside? |
|---|---|---|---|---|---|---|---|---|
| turkey_earthquake1_post_573 | other | 30 | 0 | 52 | 52 | quake busy, 0.729 | 9–95 | yes |
| turkey_earthquake4_post_785 | other | 27 | 0 | 28 | 28 | quake busy, 0.729 | 3–53 | yes (F's range missed it by 1) |
| portugal_wildfire_00000666 | xBD | 9 | 12 | 8 | 12 | fire busy, 0.804 | 6–18 | yes |
| hawaii_wildfire_post_995 | other | 121 | 15 | 166 | 166 | fire busy, 0.804 | 34–298 | yes, but too wide to act on: a "check by eye" case |
| pinery_bushfire_00000022 | xBD | 0 | 0 | 0 | 0 | fire calm, 0.5 | 0–0 | yes |

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

G's median width on quake photos with destroyed buildings is 12 (in-sample), against 9.0 for F on 17 Nov: the price of centring on C4's overcount.

**Part 2: per question, the O2 score** (974 clean validation counting questions: 521 intact, 270 damaged, 183 destroyed).

| Questions | Blind: coverage | Blind: median width | Ours: coverage | Ours: median width | Blind width ÷ ours |
|---|---|---|---|---|---|
| All | 0.913 | 60.7 | 0.908 | 19.3 | **3.15×** |
| Intact | 0.907 | 95.9 | 0.906 | 22.6 | 4.24× |
| Damaged | 0.919 | 60.6 | 0.907 | 14.9 | 4.05× |
| Destroyed | 0.921 | 24.2 | 0.914 | 15.5 | 1.56× |
| True answer ≥ 20 | 0.767 | 95.9 | 0.837 | 48.6 | 1.97× |

For reference, C4's point count on the same questions has a median error of 2.0 and is within 20% of the truth on 40.0% of them.

**Part 3: hot spots** (C4's 726 validation hot spots, 511 of them hits, share 0.704). Each photo's range is calibrated on the other half of the photos.

| Photos | Share of photos with hot spots | Hot spots | Hit share | Share of all hits |
|---|---|---|---|---|
| Range says "at least 1 destroyed" (low ≥ 1) | 0.144 | 129 | 0.780 | 0.197 |
| The rest | 0.856 | 597 | 0.687 | 0.803 |

Of the "at least 1" photos, 86.6% truly have destroyed buildings.

**What it shows:**
- Every variant keeps the 90% promise overall. The plain C0 looks narrow only because most photos have 0 destroyed buildings, and it fails where it matters: 0.211 on big quake collapses.
- The second opinion is what does the work (C1 → G): +0.209 on big quakes, +0.077 on photos with 5 or more destroyed, +0.121 on "other" photos, for 0.1 more median width.
- Part 2 is the headline for O2: same coverage, ranges 3 to 4 times narrower than a blind rule on intact and damaged. On destroyed counts it's 1.6×; our models know least where it matters most, and that's worth saying.
- Part 3 is modest: a "damage likely here" label, not a fix for false alarms (section 9a).

**Honest limits of the pilot:**
- Only 20 quake photos have destroyed buildings, and 5 have 10 or more, so the quake columns are noisy.
- All variants were looked at on the same 605 photos, so the test pairs, used once, are the only unbiased check.
- Coverage on hard photos (≥5 destroyed) is still below 0.90. The 90% holds on average over photos, not for every kind of photo.
- On the sharper photos the centre counts outlines, while the truth counts joined blobs (touching buildings merge into one; E7 step 3b). The range absorbs that offset, but its unit is the benchmark's joined blobs. Say so in the README.

## 6. The plan, step by step

Four steps. Steps 1 to 3 use validation only. Step 4 is the one test run and the handover. Do them in order: each step's check must pass before the next one starts.

### Step 1: send the plan, reproduce the pilot

| Do | Check before moving on |
|---|---|
| **Send this plan to Abrar first:** it has never been pushed. Push only the three new files (section 8). In the same message, ask for everything in section 8's "From Abrar" list at once: the go-ahead, a task ID and the two photo-level test files. Asking now means the files can arrive while you do steps 2 and 3. | The push holds only the three files. |
| Run both pilots and read section 4 until each step makes sense. | Your three tables match section 5 to 3 decimals. |

### Step 2: extend on validation, then freeze the variant

All of this goes in one script that extends `pilot_count_ranges_c4.py`. It runs on the same files in about a minute.

| Do | Check before moving on |
|---|---|
| Write the choosing rule (below) into your README **before** running anything in this step. | The rule is in the README, unchanged from this plan. |
| Add the **damaged** count (class 2) with the same code. | Damaged gets its own Part 1 table, with the same columns. |
| **Seed check:** rerun Part 1 with grader seeds 43 and 44 (`step5/instances_val.csv`; seed 44 in `step5b/`). The centre stays seed 42, the one C4 uses. | Seed 42 alone still gives section 5. Write down how far coverage moves with the other seeds. |
| **Leave-one-event-out check** (a stand-in for an unseen disaster): calibrate on every validation event but one, check on the event left out, and repeat for each event. | A table of coverage by left-out event. Expect Turkey to drop, since it is nearly all of the quake group. Write down by how much. |
| **Choose the variant by the rule**, for destroyed and for damaged, then freeze it. | The choice follows from the rule alone, with no new variant. |

### Step 3: build the function

| Do | Check before moving on |
|---|---|
| Write `count_ranges.py`: `count_range(r11_count, grader_count, source, hazard, cls) -> (centre, low, high, note)`, plus `ranges.json` (each group's `q`, alpha, the variant, the data used, the date). | The function reads only `ranges.json`; nothing is hard-coded. |
| Freeze Part 2's question-level `q`s in `question_ranges.json`. | Its coverage on validation matches section 5, Part 2. |
| Add the 5 worked examples of section 4 as a self-test. | The self-test passes. Running on validation reproduces step 2's coverage. |

**The choosing rule (step 2), fixed now:**
1. The centre is C4's count, so the range always contains the number the report prints. That rules out F and the 17 Nov variant E.
2. Among C0, C1, G, G2 and G3, keep the variants whose overall coverage is at least 0.88 and whose median width is at most 3.
3. Of those, take the one with the highest coverage on photos with 5 or more destroyed buildings.
4. If two are within 0.02 of each other, keep the one with fewer groups. Use only these five, nothing new.

With section 5's numbers this picks **G** (0.777; G3's 0.781 is within 0.02 and has more groups).

### Step 4: one test run, write-up and handover

| Do | Check before moving on |
|---|---|
| **Reproduce first.** Question level (all local): read `Champion_Task/E7-results/step3b/counting_per_question.csv`, the 3,514 clean test questions with the truth, `R11 \| count`, `chain_s42 \| count` and `C4 blobs \| count`. Photo level: with Abrar's two files (section 8), count R11, grader and truth on E6's 2,007 clean test pairs, the same way as the pilot. | Accuracy with the nearest option on the clean questions: C4 blobs 34.89%, R11 32.53%, find-then-grade seed 42 32.70% ([E7 step 3b](../../Champion_Task/E7-results/step3b/README.md), Check A). R11's destroyed IoU from its maps against E6's masks: **0.3984**. If either is off, stop and ask Abrar. |
| **One run** on the test pairs with the frozen JSON files, unchanged. Report coverage and width: overall, by hazard, by event, by source, and separately for the five events the segmenter never trained on: **Mexico (191 pairs) and Noto (44)**, both earthquakes; Joplin (148, tornado); Ian (104, hurricane); Guatemala (26, volcano). Then Part 2's blind comparison on the 3,514 questions. | Each expectation in section 7 marked met or not met. |
| Write `README.md` in the team's results format: what ran, the expectations, the results, what went against them. | Every number has its file next to it. |
| **Handover** (section 8): a short note with the function, the JSON files and the sentence format. Don't edit their files. | They can call it in 3 lines. |

**If Abrar's photo-level files haven't arrived by step 4,** run the question-level test, write it up and hand over the function anyway, marked "not yet cleared for reports" until the photo-level keep rule (section 7) is checked. Add the photo-level run when the files arrive. The function and the O2 score don't depend on them.

## 7. Expectations, fixed before the test run

**Photo level** (2,007 clean test pairs):
- **Overall coverage: 0.85 to 0.95.** The test pairs differ from validation: about twice the destroyed pixels per pair, Turkey at 20% of the pairs against 10%, and five new events. So slightly under 0.90 would not surprise.
- **Quake photos with at least 1 destroyed building:** the chosen variant beats C0 by at least 0.15.
- **Photos with 5 or more destroyed:** the chosen variant beats C0.
- **Median width:** at most 4 buildings.
- **The five unseen events:** no number predicted. The two unseen earthquakes test whether calibrating on Turkey and Morocco transfers to other earthquakes.

**Question level** (3,514 clean test questions):
- Our coverage 0.85 to 0.95.
- Our median width at least **2×** narrower than the blind rule's overall (validation: 3.15×), and narrower on each class.

**Keep rule:** the ranges go into reports and the website only if photo-level overall test coverage is at least 0.85. If not, that is reported as the result, and nothing is re-tuned on the test pairs. The O2 score (question level) is reported either way.

## 8. Who gives what

**To push first (step 1)** (only these; your working copy also deletes the old `Plan_3_Offline_Interactive_Demo.md`, which the roadmap still links, so leave that to Abrar):
`Plan_3_Honest_Count_Ranges.md`, `pilot_count_ranges.py`, `pilot_count_ranges_c4.py`.

**From Abrar:**
1. The go-ahead and a task ID.
2. For the photo-level test only: E7 step 2's `r11_tta_maps.zip` ([E7 step 2 README](../../Champion_Task/E7-results/step2/README.md), "Files") and E6's four-class test masks (`Champion_Task/E6-results/E6/`). Neither is in your local copy.
3. Whether this goes in your part of update 6. The validation results could; the test results come after the test run (step 4).

**Already in your local copy, nothing to ask for:** every validation file, `instances_test.csv`, `buildings_chain_s42.sqlite`, `buildings_c4.sqlite`, `hotspots_per_image.csv` and the per-question test counts.

**What you hand over (in this folder, or wherever Abrar prefers):**
- `count_ranges.py`, `ranges.json` and `question_ranges.json`;
- `README.md` with the validation and test results;
- a three-line usage note for each of:
  - **Abrar**, for `fixed_flow_c4.py`: the range goes into the facts, so the number guard accepts its two numbers;
  - **Ridita**, for T2;
  - **Aryan**, for the website's Explore and Results pages.

The sentence format for reports and the website is `about {centre} (likely {low} to {high})`, with "buildings" on the sharper photos and "areas" on xBD photos. When the range is wider than 10, add: *"our two models disagree here; check this area by eye"*.

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
| Abrar wants a different centre later. | The function takes the centre's source as data, so only `ranges.json` is redone, on validation. |

## 11. Done when

- `count_ranges.py`, `ranges.json`, `question_ranges.json` and `README.md` exist, and the self-test passes;
- the variant was chosen on validation by the choosing rule (step 2), and the test pairs were used **once**;
- every expectation in section 7 is marked met or not met;
- Abrar, Ridita and Aryan have the usage note.

## 12. How to explain it (viva, or weekly update 6)

> "A count with no error bar can't be trusted. Our chosen map counted 496 destroyed buildings on Turkey photos with 144, and none at all on a third of the photos that had some. So we added conformal count ranges: a range around every count, calibrated on validation by hazard, that widens when the model we didn't pick disagrees with the one we did. It holds the true count about 9 times in 10, and 99.7% of the time on big earthquake collapses, with a median range of two buildings. It also gives our counting goal a score with no options to exploit: at the same 90% coverage, our ranges are three times narrower than a rule that never sees the photo. It needs no GPU and no training."

**Background reading (short):**
- Angelopoulos and Bates, *A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification* (2021, arXiv 2107.07511). Read section 1 (split conformal), section 2.3 (dividing the error by an uncertainty scale, which is our `s`) and section 4.1 (coverage per group, which is our hazard groups).
- The per-group version is called *Mondrian* conformal prediction, after Vovk, Gammerman and Shafer, *Algorithmic Learning in a Random World* (2005). Use the name in the viva.
