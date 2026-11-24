# L2 step 4b: the chosen 3B's clean score and the counting options' pattern

From saved answers only, by `l2-step4b-clean-and-options-check.ipynb` on the PC, with the rule and expectation fixed in its first cell before the run. The 3B is option (c) in normal precision (run 5) and in 4 bits (L3). Our 7B is L0 step 2's, at full size.

## Check 1: the clean score

Each cell is all → clean (strict), in %. Clean drops the 186 questions whose after-photo is in DisasterM3's training images; strict drops all 512 flagged.

```
       task        3B (c), 4 bits          3B (c), fp16                our 7B
        DTR 60.06 → 58.89 (58.21) 58.92 → 57.73 (57.01) 76.77 → 76.09 (75.52)
        BBR 16.15 → 16.03 (15.66) 16.10 → 15.83 (15.55) 19.99 → 19.79 (19.54)
        BDC 47.20 → 47.00 (46.61) 48.20 → 48.00 (47.65) 30.31 → 30.05 (29.81)
        DRE 47.86 → 47.49 (47.41) 44.70 → 44.33 (44.18) 33.03 → 33.04 (32.94)
        DSR 34.43 → 34.08 (33.58) 35.23 → 34.94 (34.46) 40.46 → 40.11 (39.90)
        ORR 55.83 → 55.99 (56.03) 51.63 → 51.88 (51.77) 34.62 → 34.86 (34.87)
mean of six 43.59 → 43.25 (42.92) 42.46 → 42.12 (41.77) 39.20 → 38.99 (38.76)
```

Largest move from all to clean: 1.19 points. Tasks where the 3B/7B order flips: none. Every model, task and subset: `clean_scores.csv`.

## Check 2: the counting options' pattern

Fair: largest option 20 or less. Pattern: largest above 20, where the middle option is the right one.

```
       task    part  questions  middle_is_right_%  blind_rule_%  3B_fp16_%  3B_4bit_%  7B_%  3B_picks_middle_%  7B_picks_middle_%
        BDC    fair       2002               17.6         40.91      55.94      53.05 31.97               15.4               20.9
        BDC pattern       1581              100.0        100.00      38.39      39.78 28.21               38.4               28.2
        DRE    fair       1560               33.1         30.06      47.63      51.03 34.81               29.2               28.2
        DRE pattern        308              100.0        100.00      29.87      31.82 24.03               29.9               24.0
       both    fair       3562               24.4         36.16      52.30      52.16 33.21               21.4               24.1
       both pattern       1889              100.0        100.00      37.00      38.49 27.53               37.0               27.5
both, clean    fair       3473               24.4         36.08      51.97      51.83 32.97               21.6               24.1
```

## The rule (fixed before the run)

```
3B (c), fp16 against  questions  3B_%  other_%  only_3B_right  only_other_right             p
              our 7B       3562  52.3    33.21            847               167 4.916654e-110
      the blind rule       3562  52.3    36.16           1059               484  1.715943e-49
```

**Passes: on the fair counting questions the 3B beats our 7B and the blind rule by more than chance, so its counting lead is more than the options' pattern.**

## Expectation against result

```
                                                   expectation (23 Nov)                   result   met
                            clean: every score moves by at most 1 point largest move 1.19 points False
                 clean: no task changes which of the 3B and 7B is ahead              flips: none  True
the 3B picks the middle on pattern questions far more often than the 7B      37.0% against 27.5% False
               on fair questions the 3B beats the 7B and the blind rule                   passes  True
```

## Files

`clean_scores.csv`, `counting_options_pattern.csv`, `fair_counting_tests.csv`, `counting_per_question.csv`
