# L2 step 4b: the chosen 3B's clean score and the counting options' pattern

From saved answers only, by `l2-step4b-clean-and-options-check.ipynb` on the PC, with the rule and expectation fixed in its first cell before the run. The 3B is option (c) in normal precision (run 5) and in 4 bits (L3). Our 7B is L0 step 2's, at full size.

## Check 1: the clean score

Each cell is all → clean (strict), in %. Clean drops the 186 questions whose after-photo is in DisasterM3's training images; strict drops all 512 flagged.

```
       task        3B (c), 4 bits          3B (c), fp16                our 7B
        DTR 63.17 → 62.10 (61.49) 62.04 → 60.93 (60.30) 76.77 → 76.09 (75.52)
        BBR 16.55 → 16.44 (16.07) 16.65 → 16.39 (16.12) 19.99 → 19.79 (19.54)
        BDC 48.17 → 48.00 (47.62) 49.79 → 49.62 (49.30) 30.31 → 30.05 (29.81)
        DRE 48.72 → 48.36 (48.30) 46.63 → 46.29 (46.19) 33.03 → 33.04 (32.94)
        DSR 34.63 → 34.28 (33.78) 35.38 → 35.09 (34.61) 40.46 → 40.11 (39.90)
        ORR 55.71 → 55.87 (55.91) 51.98 → 52.23 (52.13) 34.62 → 34.86 (34.87)
mean of six 44.49 → 44.17 (43.86) 43.74 → 43.43 (43.11) 39.20 → 38.99 (38.76)
```

Largest move from all to clean: 1.11 points. Tasks where the 3B/7B order flips: none. Every model, task and subset: `clean_scores.csv`.

## Check 2: the counting options' pattern

Fair: largest option 20 or less. Pattern: largest above 20, where the middle option is the right one.

```
       task    part  questions  middle_is_right_%  blind_rule_%  3B_fp16_%  3B_4bit_%  7B_%  3B_picks_middle_%  7B_picks_middle_%
        BDC    fair       2002               17.6         40.91      57.39      53.85 31.97               16.0               20.9
        BDC pattern       1581              100.0        100.00      40.16      40.99 28.21               40.2               28.2
        DRE    fair       1560               33.1         30.06      48.14      51.15 34.81               29.9               28.2
        DRE pattern        308              100.0        100.00      38.96      36.36 24.03               39.0               24.0
       both    fair       3562               24.4         36.16      53.34      52.67 33.21               22.1               24.1
       both pattern       1889              100.0        100.00      39.97      40.23 27.53               40.0               27.5
both, clean    fair       3473               24.4         36.08      53.04      52.35 32.97               22.2               24.1
```

## The rule (fixed before the run)

```
3B (c), fp16 against  questions  3B_%  other_%  only_3B_right  only_other_right             p
              our 7B       3562 53.34    33.21            871               154 5.367154e-122
      the blind rule       3562 53.34    36.16           1083               471  1.286317e-55
```

**Passes: on the fair counting questions the 3B beats our 7B and the blind rule by more than chance, so its counting lead is more than the options' pattern.**

## Expectation against result

```
                                                   expectation (23 Nov)                   result   met
                            clean: every score moves by at most 1 point largest move 1.11 points False
                 clean: no task changes which of the 3B and 7B is ahead              flips: none  True
the 3B picks the middle on pattern questions far more often than the 7B      40.0% against 27.5% False
               on fair questions the 3B beats the 7B and the blind rule                   passes  True
```

## Files

`clean_scores.csv`, `counting_options_pattern.csv`, `fair_counting_tests.csv`, `counting_per_question.csv`
