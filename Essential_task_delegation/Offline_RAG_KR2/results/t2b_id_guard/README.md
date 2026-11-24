# The ID guard's check: T2b's 7B on Palu and Beirut with the guard on (23 Nov, Kaggle account 4, 22 min)

## What, and why

**The problem:** in T2b (22 Nov), our 7B left three made-up guideline IDs in two finished reports, both
"Emergency service human resource allocation": `INSARAG2B-5.7.1` in Beirut, and `INSARAG2B-2` and `INSARAG2B-3.10`
in Palu. The number checker (T2 step 7) catches wrong numbers, not invented citations, so a reader would see a
citation that points nowhere.

**The guard:** `id_guard` in [fixed_flow_c4.py](../../disasteller_offline/fixed_flow_c4.py) runs after the number
guard on every model-written section. Any guideline ID in square brackets that wasn't among the passages shown for that
section is dropped, the leftover brackets, commas and spaces are tidied, and the drop is written to the run log and
`llm_calls.jsonl` (kind `id_guard`). IDs that were shown stay, and so do labels such as `[Note 1]` that aren't guideline
IDs.

**The check:** a copy of [t2b_writer_test.ipynb](../../t2b_writer_test.ipynb) with the 7B only and the two scenes where it
made up IDs, everything else as T2b (`tamannamou123/t2b-id-guard-check`, version 1). The reports are scored with
[t2b_score.ipynb](../../t2b_score.ipynb)'s own counts.

**Expectation, fixed before the run:** every unshown ID dropped and logged, 0 made-up IDs in the finished reports, and
both scenes pass T2b's five pass rules.

## Result: all three expectations met

| 7B, Palu and Beirut, 12 reports | T2b (no ID guard) | With the ID guard |
|---|---|---|
| Reports finished | 12 | 12 |
| Made-up guideline IDs in the finished reports | 3 | **0** |
| Real IDs cited that weren't shown | 0 | 0 |
| Real IDs cited | 67 | 61 |
| Contradictions (before the number guard, which replaced them) | 2 | 2 |
| Numbers the number guard replaced | 4 | 4 |
| Words | 5,765 | 5,787 |

- **What the guard dropped:** exactly T2b's three IDs. The writer invented the same IDs in the same section ("Allocation
  Plan") of the same report. Nothing else was dropped: its log lists only these.
- **Both scenes passed all five pass rules:** the run finished; all six reports, each starting "Mode: offline", each 50+
  words; nothing went outside this computer; no Gemini library loaded; every model question answered.
- **Real citations, 67 to 61:** not the guard. The writer's sampling (temperature 0.2) gives slightly different text
  each run: Palu's reconstruction plan cites 3 real IDs instead of 7, and Beirut's allocation plan 4 instead of 6. Palu's
  public report, which no guard touched, also changed length (549 to 606 words).
- **Time:** 6.4 and 7.0 min per scene, as in T2b (6.2 on average).

## What it leads to

The report chain now stops both kinds of error the checks found: wrong numbers (the number guard, 20 Nov) and invented
citations (this guard). The guard can't tell a fitting citation from an unfitting one among the IDs that were shown;
that is a reading question (T2b's blind pairs).

## Files

- `t2b-id-guard-check.ipynb`: the executed notebook; `t2b-id-guard-check.log`: its log
- `t2b_id_guard_internet_on/7b/run_<scene>/`: the reports, `run_log.txt`, `llm_calls.jsonl`, `netlog.json`,
  `t2_run_summary.json`
- `reports.csv`: T2b's counts per report
