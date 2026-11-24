# T2b · Who writes the report: our 7B or a small text model

Full run on Kaggle account 4, 21 Nov 2026, 07:27–11:40 (253 min, GPU T4 x2), notebook
[t2b_writer_test.ipynb](../../t2b_writer_test.ipynb), saved over the repo copy with its outputs; it differs from it
only in `SMOKE_TEST = False`. Scored on the PC by [t2b_score.ipynb](../../t2b_score.ipynb), run in place with its
outputs. What T2b is, the ten scenes, the decoding and the rule are in the run notebook's first cell and in the
roadmap (T2b). The smoke test (Turkey only) is in [../t2b_smoke/](../t2b_smoke/scores.md).

## The run

- **Both writers finished all 60 reports** (10 scenes × 6), and every scene passed the five pass rules. Nothing went
  outside the computer: the internet was used only to download the two models and step 5's exact packages before the
  flow started.
- **Time:** our 7B 6.2 min per scene; Qwen2.5-3B-Instruct 18.0 min, since it writes about 2.5 times as much and the
  flow asks it again more often. Weights per GPU: 7.9 GiB against 2.9 GiB.

## The rule: our 7B stays the writer

| Test (the text model must not be worse) | Our 7B | Qwen2.5-3B-Instruct | |
|---|---|---|---|
| Contradictions (wrong or misused numbers left after the flow asked again) | 3 | 15 | ✗ |
| Fake citations (IDs not in the index, in the finished reports) | 3 | 0 | ✓ |
| Reports finished | 60 | 60 | ✓ |

The text model fails the first test, so the 7B stays, by the rule fixed before the run. A swap would also have needed
the supervisor's agreement.

**The contradictions:**
- **The 3B (15):** mostly pixel figures written with a wrong digit grouping or size ("221,070 pixels" and "283,810
  pixels" in Turkey, "55,000,400 pixels" in Moore, "280,750 pixels" in Beirut), a wrong share, and three damage counts
  used for something else ("96" in Santa Rosa, "216" in Joplin, "15" in Libya).
- **The 7B (3):** three wrong shares ("49%" and "33%" in Palu's reconstruction plan, "54%" in Tuscaloosa's overview).

The last guard replaced all of them in the finished reports, so no wrong number reaches a reader from either writer.
The rule counts them because they show how often each writer gets numbers wrong.

**The 7B's three fake citations** are all in human-resource reports: `INSARAG2B-5.7.1` (Beirut), `INSARAG2B-2` and
`INSARAG2B-3.10` (Palu). The flow asked again and the second answer still had them. On step 5's two scenes the 7B had
none; across ten scenes it has three. That's a gap in the report chain, not in the writer choice: a guard like the
number guard could drop an ID that isn't in the index.

## Beside the rule

| | Our 7B | Qwen2.5-3B-Instruct |
|---|---|---|
| First-answer number problems (before asking again) | 22 | 46 |
| Unsourced numbers left after asking again | 1 | 12 |
| Numbers the guard replaced | 5 | 35 |
| Sections asked again | 56 | 73 |
| Real citations (shown to that report) | 246 | 604 |
| Real IDs cited but not shown to that report | 0 | 37 |
| Figures the writer itself wrote as "not available offline" | 15 | 58 |
| Median words per section | 95 | 232 |

The 3B cites more and writes fuller sections, but it also invents more numbers and cites sections it wasn't shown.

## Against the expectation, fixed before the run

- Both finish every report: **met** (60 and 60).
- At most 3 contradictions per writer: **met for the 7B (3), missed for the 3B (15).**
- At most 2 fake citations per writer: **missed for the 7B (3)**; met for the 3B (0).
- The text model writes longer sections (median at least 1.2 × the 7B's): **met** (232 against 95 words).
- The text model is faster (at most 0.7 × the 7B's minutes per scene): **missed**: it was 2.9 times slower.
- Which writer wins: not predicted.

## For a person to read

`blind/` holds five pairs of the same report for the same scene, one from each writer, as A and B in a drawn order.
Read them and note which is more useful before opening `key_do_not_open_before_reading.json`. This reading is reported
beside the rule; it doesn't decide it.

*(23 Nov: a second judge, Gemini in its web chat, scored the five pairs, each in both orders. The same report won in
both orders in every pair: B, A, B, A, A. [Its verdict](blind/gemini/RESULT.md) is recorded by A and B only. The writers
stay sealed until Abrar's own reading is in, then both views are added here.)*

## Files

`scores.md` (the scoring notebook's tables), `reports.csv` (one row per writer, scene and report),
`flagged_numbers.csv`, `writers.csv`, `blind/`, `t2b_full_internet_on/` (the unpacked run: every report, call log,
network log and pass-rule summary), `t2b-writer-test.log`.
