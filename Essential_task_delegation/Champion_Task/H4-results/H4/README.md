# H4 · GEOBench-VLM's xBD questions: our counting and our 7B on an outside benchmark

Full run on Kaggle account 4, 21 Nov 2026, 08:23–09:37 (73 min, GPU T4 x2), notebook
[h4-geobench-xbd-counting.ipynb](../../h4-geobench-xbd-counting.ipynb), saved over the repo copy with its outputs; it
differs from it only in `SMOKE_TEST = False`. What H4 is, the data, the methods, the rule and the expectation are in
that notebook's first cell and in the roadmap (H4). Four smoke tests came first; what each found is in the ledger.

## The checks

- **Copy check: passed.** The public xBD copy (`qianlanzz/xbd-dataset`, `xbd/tier1/images`) has all 5,598 of the PC's
  xBD training photos with the same pixels (28 with the same bytes; the copy saved the PNGs again).
- **Overlap with our training photos: 119 of GEOBench's 210 xBD pairs (57%) are in DisasterM3 Instruct**, both photos
  with the same pixels and the same names. Our 7B and R11 trained on DisasterM3 Instruct, so only the **91 clean pairs**
  are scored. The leaked pairs are mostly the hurricanes, floods and Palu (list in `summary.json`, matches in
  `overlap.csv`). Any model trained on DisasterM3 has seen most of GEOBench's xBD photos.

## The rule: our counting does not hold

On the clean pairs' no-damage and destroyed questions (182):

| Test | Our counting | Our 7B | Result |
|---|---|---|---|
| 1. Accuracy (the nearest option against the 7B's letter) | 36.3% | 50.0% | **fails**: the 7B is ahead (McNemar: 11 only ours, 36 only the 7B; p = 0.0003) |
| 2. Count closer to the true count (our count against the 7B's own number) | closer 110 times | closer 54 times | **passes** (sign test, p = 0.00001) |

So our count is nearer the truth twice as often, but the 7B picks the right option more often. These options reward
something else: the question-type rule that never sees the photo gets **77.5%** on the same 182 questions. The 7B
acts much like it on the destroyed questions (71.4%; the smallest option gets 72.5%), and our counting loses where its
blobs merge touching buildings (no damage: ours 13.2%, the 7B 28.6%, the middle option 82.4%).

## By question type (clean pairs)

| Type | Ours | 7B | Middle option | Smallest option | Type rule |
|---|---|---|---|---|---|
| no damage | 13.2% | 28.6% | 82.4% | 8.8% | 82.4% |
| destroyed | 59.3% | 71.4% | 8.8% | 72.5% | 72.5% |
| minor (our damaged count) | 30.8% | 57.1% | 15.4% | 74.7% | 74.7% |
| major (our damaged count) | 25.3% | 68.1% | 11.0% | 69.2% | 69.2% |
| damaged, any level (its answer counts every building) | 8.8% | 27.5% | 91.2% | 3.3% | 91.2% |

**Exact counts** (clean pairs): destroyed, ours 52.7% against the 7B's 2.2%; no damage, 12.1% against 5.5%.
Average miss, no damage: 153 buildings for ours, 154 for the 7B (dense pairs have hundreds of buildings).

**All five types:** clean pairs, ours 27.5% and the 7B 50.6%; all 210 pairs, 40.2% and 52.0%. Published (all 1,050
questions, no overlap check): GPT-4o 56.7%, Qwen2-VL 50.0%. Rules that never see the photo, all 1,050: middle 37.4%,
smallest 49.2%, type rule 68.9%.

**Disaster type (our 7B):** clean pairs 35.2% (after-photo alone) and 46.2% (both photos); leaked pairs 60.5% and
72.3%. Published (both photos): GPT-4o 63.0%, Qwen2-VL 59.9%.

## Against the expectation, fixed before the run

- Copy check passes: **met.**
- Overlap: not predicted; **57% of pairs leak.**
- Our counting 35–55%: **met** (36.3%). Our 7B 25–45%: **missed** (50.0%). Both tests pass: **missed** (test 1 fails).
- Both below the type rule: **met.** Our counting below GPT-4o on all five types: **met.**
- Our 7B at least 55% on disaster type: **missed** on clean pairs (35–46%); met only on leaked pairs (61–72%), which
  suggests memory of training photos, not skill.

## What it means

- GEOBench's xBD counting can't support our hybrid-counting claim either way. Its options reward rules that never see
  the photo (68.9–77.5%), one of its five question types is mislabelled, and most of its xBD photos are in DisasterM3
  Instruct.
- On the one measure the options don't distort (whose count is nearer the truth), our counting beats our 7B clearly.
  Its weakness is dense scenes, where touching buildings merge into one blob.
- Our 7B's disaster-type skill drops by about 25 points from leaked to clean pairs.

## Files

`summary.json` (every number above, the leaked pairs, the copy check), `per_question.csv` (every question: both
methods' answers and counts, the 7B's raw replies), `accuracy_by_type.csv`, `count_errors.csv`, `counts.csv` (our
blob counts per pair), `overlap.csv` (each matched photo), `vllm_server.log`, `h4-geobench-xbd-counting.log`.
