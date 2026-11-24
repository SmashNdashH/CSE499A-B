# R16c step 8: the graders' destroyed setting, re-tuned for destroyed IoU

Run on your PC, no GPU, from saved files only. The question, the rule and the expectation are in [r16c-step8-destroyed-bias.ipynb](../../r16c-step8-destroyed-bias.ipynb)'s first cell, fixed before the sweep.

**Verdict:** today's setting stays: no shift of the destroyed bias beats it on validation.

## Check first: the rebuilt scores reproduce the published ones

```
                                             check  rebuilt  published  pass
validation, find-then-grade seed 42: destroyed IoU   0.3161     0.3161  True
validation, find-then-grade seed 43: destroyed IoU   0.3063     0.3051  True
validation, find-then-grade seed 44: destroyed IoU   0.2982     0.2982  True
           validation, R11 with TTA: destroyed IoU   0.2692     0.2692  True
                    validation, R11 with TTA: mIoU   0.5805     0.5805  True
      test, find-then-grade seed 42: destroyed IoU   0.4055     0.4055  True
               test, find-then-grade seed 42: mIoU   0.5180     0.5179  True
      test, find-then-grade seed 43: destroyed IoU   0.3982     0.3983  True
               test, find-then-grade seed 43: mIoU   0.5121     0.5121  True
      test, find-then-grade seed 44: destroyed IoU   0.3657     0.3657  True
               test, find-then-grade seed 44: mIoU   0.5086     0.5087  True
                 test, R11 with TTA: destroyed IoU   0.3984     0.3984  True
                          test, R11 with TTA: mIoU   0.5721     0.5721  True
```

## The sweep on the 605 clean validation pairs (C4, mean of three graders)

```
 delta  c4_destroyed_iou  c4_miou  c4_building_iou  sharper_photos_destroyed_iou  sharper_photos_miou
  0.00            0.3501   0.5881           0.6822                        0.2628               0.4440
  0.25            0.3481   0.5876           0.6822                        0.2623               0.4435
  0.50            0.3467   0.5874           0.6822                        0.2628               0.4437
  0.75            0.3456   0.5873           0.6822                        0.2633               0.4436
  1.00            0.3410   0.5861           0.6822                        0.2585               0.4413
  1.25            0.3378   0.5851           0.6822                        0.2570               0.4391
  1.50            0.3326   0.5840           0.6822                        0.2528               0.4378
  1.75            0.3260   0.5819           0.6822                        0.2462               0.4336
  2.00            0.3159   0.5789           0.6821                        0.2356               0.4281
  2.25            0.3066   0.5763           0.6821                        0.2262               0.4239
  2.50            0.2957   0.5735           0.6822                        0.2148               0.4202
  2.75            0.2868   0.5709           0.6822                        0.2070               0.4161
  3.00            0.2728   0.5665           0.6822                        0.1941               0.4099
  3.25            0.2609   0.5628           0.6822                        0.1825               0.4042
  3.50            0.2508   0.5598           0.6822                        0.1729               0.4001
  3.75            0.2398   0.5563           0.6822                        0.1626               0.3952
  4.00            0.2287   0.5529           0.6823                        0.1524               0.3905
```

The rule's pick: delta = 0.0.

Files: `sweep_validation.csv`.
