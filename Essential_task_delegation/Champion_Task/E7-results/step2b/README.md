# E7 step 2b: is the chain's gap to R11 on the test pairs more than noise?

Run on the PC from E7 step 2's saved files ([step 2](../step2/README.md)); notebook `e7-step2b-resampling-test.ipynb`.

**On all 2,007 clean test pairs, the chain's destroyed-building IoU (mean of three graders) minus R11's is -0.0086: within noise. The middle 95% of resampled gaps runs from -0.0378 to 0.0218 by pair, and from -0.0978 to 0.0894 by event.**

## Resampled gaps (chain minus R11, destroyed-building IoU)

```
                      scope    level  units  observed_gap  ci95_low  ci95_high  share_chain_ahead_%  zero_inside_ci
                clean pairs  by pair   2007       -0.0086   -0.0378     0.0218                 28.1            True
                clean pairs by event     28       -0.0086   -0.0978     0.0894                 38.3            True
clean pairs, without Turkey  by pair   1593       -0.0567   -0.0779    -0.0363                  0.0           False
clean pairs, without Turkey by event     27       -0.0567   -0.1114    -0.0204                  0.0           False
                Turkey only  by pair    414        0.2364    0.1614     0.3040                100.0           False
```

- `by pair`: the clean pairs drawn with replacement, 10,000 times. `by event`: the disaster events drawn with replacement, each with all its pairs, because pairs from one event aren't independent.
- `share_chain_ahead_%`: the share of resamples in which the chain's score is higher.

## Against the expectation, fixed before the run

- Met: all clean pairs, by pair: the interval includes 0.
- Met: all clean pairs, by event: the interval includes 0.
- Met: without Turkey, by pair: R11's lead holds (interval below 0).
- Met: Turkey only, by pair: the chain's lead holds (interval above 0).
- Met: the intervals by event are wider than by pair.

## Checks

- R11 and grader seed 42 are scored from step 2's saved maps and reproduce its published destroyed IoU and mIoU exactly (`reproduction_check.csv`).
- Seeds 43 and 44 have no saved maps, so they're rebuilt from the graders' scores, which step 2 saved rounded to 6 decimals; an outline whose two best labels were nearly tied can flip. They match step 2 within 0.0006 (outlines within 2e-6, by seed: {42: 14, 43: 19, 44: 11}). Rebuilding seed 42 the same way changes 0.0004% of its pixels. This is far below the resampled spread.

## Files

- `resampling.csv`, `reproduction_check.csv`, `per_pair_destroyed.csv` (each pair's destroyed-class intersection and union for every method)
