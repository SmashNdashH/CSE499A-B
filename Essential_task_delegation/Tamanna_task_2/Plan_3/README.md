# H5 · Honest count ranges: results

**Owner:** Tamanna. **Plan:** [Plan_3_Honest_Count_Ranges.md](Plan_3_Honest_Count_Ranges.md) (approved by Abrar as H5, 24 Nov). **CPU only.**
**Where it stands:** step 2 (validation only). **No test file has been opened.** The test files stay closed until the freeze commit at the end of step 3.

Abrar's rules for H5 (24 Nov), kept throughout:
- **Quote numbers in pairs:** overall coverage with coverage on photos that have destroyed buildings; the overall median width with the width on earthquake photos that have destroyed buildings; 3.15× with 1.56× on destroyed counts. Never quote the 5-photo column on its own.
- **A 0 to 0 range is worded "none found"**, and its miss rate is reported here.
- **Freeze before test:** `count_ranges.py`, `ranges.json` and `question_ranges.json` are committed before any test file is opened.

## The choosing rule (copied from the plan, section 6, before step 2 ran)

1. The centre is C4's count, so the range always contains the number the report prints. That rules out F and the 17 Nov variant E.
2. Among C0, C1, G, G2 and G3, keep the variants whose overall coverage is at least 0.88 and whose median width is at most 3.
3. Of those, take the one with the highest coverage on photos with 5 or more destroyed buildings.
4. If two are within 0.02 of each other, keep the one with fewer groups. Use only these five, nothing new.

**How it is applied, fixed before the run:**
- **Seed:** the choice uses grader seed 42, the one C4 uses. Seeds 43 and 44 are a robustness check only.
- **Damaged:** the same rule with "damaged" in place of "destroyed", so rule 3 uses photos with 5 or more damaged buildings.
- **Rule 4:** start from the variant rule 3 picks. Among the variants whose coverage is within 0.02 of it, take the one with the fewest groups; if several tie on groups, keep the highest coverage.
- **Groups** are the distinct groups among the 605 photos.
- **Numbers:** all are compared unrounded.

## Step 2: what runs

[step2_validation.py](step2_validation.py) runs everything below in about a minute. It imports both pilot scripts, so their numbers can't drift.

**It reads only validation files:**
- `Champion_Task/E1-results/E1/gt/`: the true masks;
- `Champion_Task/R16-results/R16/R11_tta/`: R11's maps;
- `Champion_Task/R16c-results/step5/instances_val.csv`: grader seeds 42 and 43;
- `Champion_Task/R16c-results/step5b/instances_val.csv`: grader seed 44, the same 57,991 outlines;
- `Champion_Task/E5-results/E5/leaked_pairs_40.csv`: the 40 leaked pairs, left out.

**Method:** the 605 clean validation photos, alpha 0.10, the same 300 random 50/50 splits as the pilot (random seed 0).

## Expectations, fixed before the run

| Check | What it is | Expectation |
|---|---|---|
| a. Reproduction | Destroyed, seed 42, the five rule variants | Matches the plan's section 5, Part 1, to 3 decimals. If not, stop. |
| b. Damaged | The same Part 1 table for damaged buildings (class 2) | No number predicted. |
| c. Seed check | Seeds 43 and 44, each run as if C4 used that grader | No number predicted. Record how far coverage moves, and whether the rule would choose differently. |
| d. Leave-one-event-out | Calibrate on 23 events, check on the one left out, for each of the 24 events | Turkey (64 of the 67 earthquake photos) drops, since the earthquake group then has only Morocco's 3 photos. Record by how much. |
| e. Zero case | For the chosen variant, on the check halves: the share of "0 to 0" ranges whose photo has buildings of that class, and those photos' share of all such buildings | Destroyed: close to Abrar's 12% and 3.7%, and 11 of 116 "0 to 0" photos when calibrated on all 605. Damaged: no number predicted. |
| f. The choice | The rule above, for destroyed and for damaged | Destroyed picks **G**. Damaged: no prediction. |

## Step 2 results (27 Nov, validation only)

**In short:**
- **Destroyed:** the rule picks **G** under all three grader seeds, and it is now frozen. Coverage is 0.920 overall and 0.776 on photos with destroyed buildings. The median width is 2.1 overall and 12 on quake photos with destroyed buildings.
- **When the photo's whole event is left out of calibration,** G still covers 0.917 overall and 0.765 on photos with destroyed buildings.
- **Damaged:** the rule picks **no variant**, because every median width is above 3. That is a question for Abrar (below).
- **"None found" misses:** 11.6% of "0 to 0" ranges hide destroyed buildings, which is 3.7% of them all, as Abrar measured. 9 of the 11 misses in-sample are wildfire photos.

All numbers below come from [step2_results/](step2_results/): `part1.csv`, `leave_one_event_out.csv`, `zero_case.csv`, `choice.json`, and the full printout in `run_log.txt`.

### a. Reproduction: met

The destroyed, seed 42 rows of all five variants match the plan's section 5, Part 1, to 3 decimals (largest difference 0.000). The script stops if they don't.

### b. Damaged buildings (seed 42)

270 of the 605 photos have damaged buildings, and 144 have 5 or more. On the 67 quake photos, the truth is 187, R11 says 17 and the grader 308.

| Variant | Groups | All 605 | ≥1 damaged (270) | Quake ≥1 | Quake ≥10 | ≥5 damaged (144) | Other source ≥1 | Median width |
|---|---|---|---|---|---|---|---|---|
| C0 | 1 | 0.910 | 0.837 | 0.706 | 0.340 | 0.756 | 0.702 | 3.2 |
| C1 | 10 | 0.920 | 0.847 | 0.711 | 0.353 | 0.816 | 0.733 | 3.1 |
| G | 10 | 0.933 | 0.867 | 0.887 | 0.821 | 0.862 | 0.893 | 4.5 |
| G2 | 4 | 0.931 | 0.865 | 0.873 | 0.789 | 0.854 | 0.880 | 3.9 |
| G3 | 15 | 0.931 | 0.867 | 0.887 | 0.821 | 0.861 | 0.879 | 4.5 |

The second opinion helps damaged counts too: C1 to G adds +0.046 on photos with 5 or more damaged and +0.160 on "other" photos. But it costs 1.4 buildings of median width. Damaged buildings are more common than destroyed ones, so even the plainest range (C0) has a median width of 3.2.

### c. Seed check: destroyed is stable, and the choice doesn't change

| Destroyed, G | All 605 | ≥1 destroyed | Quake ≥1 | Quake ≥10 | ≥5 destroyed | Other source ≥1 | Median width | Rule picks |
|---|---|---|---|---|---|---|---|---|
| Seed 42 (C4's) | 0.920 | 0.776 | 0.836 | 0.997 | 0.777 | 0.851 | 2.1 | G |
| Seed 43 | 0.915 | 0.775 | 0.871 | 1.000 | 0.748 | 0.880 | 2.3 | G |
| Seed 44 | 0.920 | 0.780 | 0.921 | 1.000 | 0.776 | 0.927 | 2.1 | G |

- **The seeds disagree a lot on counts but little on coverage.** On the quake photos, the grader says 496, 812 and 697 destroyed buildings for seeds 42, 43 and 44, against a truth of 144. Yet G's coverage moves by at most 0.005 overall and 0.029 on photos with 5 or more destroyed. The second opinion widens the range wherever the grader overcounts.
- **Damaged, G:** coverage 0.928–0.933 overall and 0.856–0.869 on photos with damaged buildings; median width 4.5–4.7. The rule picks no variant under seeds 42 and 44, and C0 under seed 43, whose C0 median width is 2.9.

### d. Leave one event out

Each event's photos are checked with ranges calibrated on the other 23 events only: a stand-in for a disaster the ranges have never seen. Destroyed buildings; each cell gives coverage on all the event's photos / on its photos with destroyed buildings.

| Left-out event | Hazard | Photos | With ≥1 | C0 | C1 | **G** | G median width, ≥1 |
|---|---|---|---|---|---|---|---|
| portugal_wildfire | fire | 105 | 25 | 1.000 / 1.000 | 0.990 / 0.960 | 0.943 / 0.840 | 7.0 |
| turkey_earthquake | quake | 64 | 20 | 0.797 / 0.600 | 0.797 / 0.600 | **0.969 / 0.900** | 14.0 |
| hurricane_florence | wind | 57 | 4 | 0.965 / 0.500 | 0.965 / 0.500 | 0.965 / 0.500 | 2.0 |
| nepal_flooding | water | 48 | 14 | 0.854 / 0.500 | 0.833 / 0.429 | 0.854 / 0.500 | 1.0 |
| hurricane_harvey | wind | 44 | 11 | 0.818 / 0.273 | 0.864 / 0.455 | 0.886 / 0.545 | 6.0 |
| hurricane_michael | wind | 42 | 23 | 0.833 / 0.696 | 0.881 / 0.783 | 0.857 / 0.783 | 3.0 |
| pinery_bushfire | fire | 40 | 9 | 0.950 / 0.778 | 0.775 / 0.222 | **0.750 / 0.333** | 0.0 |
| socal_fire | fire | 38 | 11 | 1.000 / 1.000 | 0.974 / 0.909 | 0.974 / 0.909 | 6.0 |
| midwest_flooding | water | 35 | 4 | 0.943 / 0.500 | 0.943 / 0.500 | 0.971 / 0.750 | 2.0 |
| hurricane_matthew | wind | 25 | 21 | 0.640 / 0.571 | 0.800 / 0.762 | 0.720 / 0.667 | 16.0 |
| tuscaloosa_tornado | wind | 23 | 3 | 1.000 / 1.000 | 1.000 / 1.000 | 1.000 / 1.000 | 12.0 |
| santa_rosa_wildfire | fire | 20 | 14 | 0.950 / 0.929 | 0.950 / 0.929 | 1.000 / 1.000 | 7.5 |
| moore_tornado | wind | 16 | 6 | 0.938 / 0.833 | 0.938 / 0.833 | 0.938 / 0.833 | 25.0 |
| lower_puna_volcano | other | 8 | 2 | 1.000 / 1.000 | 1.000 / 1.000 | 1.000 / 1.000 | 18.0 |
| woolsey_fire | fire | 8 | 8 | 1.000 / 1.000 | 0.750 / 0.750 | 0.875 / 0.875 | 2.0 |
| palu_tsunami | water | 7 | 6 | 0.571 / 0.500 | 0.571 / 0.500 | 0.857 / 0.833 | 22.5 |
| kalehe_flooding | water | 5 | 1 | 0.800 / 0.000 | 1.000 / 1.000 | 1.000 / 1.000 | 62.0 |
| hawaii_wildfire | fire | 1 | 1 | 0.000 / 0.000 | 0.000 / 0.000 | 1.000 / 1.000 | 264.0 |
| 6 events with no destroyed buildings | — | 19 | 0 | 0.895 / – | 0.895 / – | 1.000 / – | – |
| **All 605, each with its event left out** | | 605 | 183 | 0.902 / 0.716 | 0.898 / 0.710 | **0.917 / 0.765** | 7.0 |

The six events with no destroyed buildings are sunda_tsunami, beriut_explosion, libya_flood, morroco_earthquake, bata_explosion and shovi_landslide. C0 and C1 miss 2 of Beirut's 4 photos.

- **Overall:** with its event left out, G covers 0.917 / 0.765, against 0.920 / 0.776 with random splits. The ranges transfer to unseen events almost unchanged.
- **Turkey did not drop with G** (0.969 / 0.900), against the expectation. C0 and C1 do drop, to 0.797 / 0.600. With Turkey left out, the quake group has only Morocco's 3 photos, so the pooled `q` is used. On Turkey, R11 says 0 where the grader says many, so G's scale is large, and that is what carries the transfer. The price is width: a median of 14 on Turkey's destroyed photos, against 12 in-sample.
- **Where G is weak:**
  - pinery_bushfire: 0.333 on its 9 destroyed photos, with a median width of 0. Both models miss single burned buildings, so the range is "0 to 0". C0 covers 0.778 there.
  - hurricane_harvey: 0.545 on 11 photos.
  - nepal_flooding: 0.500 on 14.
  - hurricane_matthew: 0.667 on 21.

  Reported as found. Nothing is re-tuned.

Damaged, all 605 with each event left out: C0 0.911 / 0.841, C1 0.912 / 0.844, G 0.926 / 0.852 (`leave_one_event_out.csv`).

### e. Zero case: "none found" is the right wording

| Class (variant) | "0 to 0" photos per check half | Share that hide buildings of the class | Their share of all such buildings | Calibrated on all 605 |
|---|---|---|---|---|
| Destroyed (G) | 70 | **0.116** | **0.037** | 11 of 116 hide some; true counts 3, 2 and nine of 1 (14 of 1,374 buildings) |
| Damaged (G, information only) | 12 | 0.126 | 0.001 | 2 of 28 hide some; true counts 1 and 1 (2 of 4,348) |

- **This matches Abrar's check** (12% and 3.7%; 11 of 116, with counts 3, 2 and nine of 1). Expectation met.
- **The misses are mostly wildfires:** of the 11 photos that hide destroyed buildings in-sample, 9 are wildfire photos (5 pinery_bushfire, 3 portugal_wildfire, 1 woolsey_fire) and 2 are turkey_earthquake. Single burned buildings are missed by both models.

### f. The choice

| Class | Rule picks | Frozen? | Why |
|---|---|---|---|
| Destroyed | **G** | **Yes** | All five variants pass rule 2. G3 has the highest coverage on photos with 5 or more destroyed (0.781). G is within 0.02 (0.777) with fewer groups (10 against 15). The same pick holds under seeds 43 and 44. |
| Damaged | **None** | No | Rule 2 asks for a median width of at most 3. Every variant is above it: C1 3.1, C0 3.2, G2 3.9, G and G3 4.5. |

### What went against the expectations

1. **Turkey didn't drop under leave-one-event-out** with G (0.900 on its destroyed photos). It did with C0 and C1 (0.600).
2. **Damaged has no variant under the rule.** The width cap of 3 was written for destroyed counts, which are rarer. It was applied to damaged unchanged, as fixed before the run.

### Open question for Abrar: damaged counts

The rule as written gives damaged counts no range. The options:
- **(i) Ship destroyed only.** Damaged counts stay as they are now, with no range. This is what the rule says, and it changes nothing that was fixed before the run.
- **(ii) A wider cap for damaged**, for example at most 5. That would be decided after seeing these numbers, so it must be labelled that way. Rules 3 and 4 would then pick **G2**: G has 0.862 on photos with 5 or more damaged, and G2's 0.854 is within 0.02 with 4 groups against 10. G2's median width is 3.9.

Until Abrar decides, step 3 builds the function and `ranges.json` for destroyed buildings only.

### What this means for step 3

- `ranges.json` is built for destroyed buildings with G: seed 42 grader, hazard × busy groups, `q` from all 605 photos.
- Damaged waits for Abrar's answer.
- The function's note says "none found" for a 0 to 0 range. On wildfire photos, that is where most of the misses are.
- Still no test file is opened before the freeze commit.
