# L2 step 2b: fp16 overflow in the 3B's training

The question, the rule and the expectation, fixed before the run, are in the notebook's first cell.

## The scan, as trained (fp16 compute under fp16 autocast)

440 option (c) training examples: 50 seeded per task and the 40 longest.

- A NaN label loss in **7** of them; a non-finite output somewhere in 7.
- Weighted by each task's share of the 53,838 training examples: **1.23%**. The failed run's logs imply about 1.3%: 13 of its 16 steps had a NaN among the first GPU's 128 examples.
- NaN by task: {'Disaster Scene Recognition': 2, 'Disaster Type Recognition': 2, 'disaster restoration advice': 2, 'relational reasoning': 1}.
- Where the overflow starts (examples): {'model.visual.blocks.31.mlp.down_proj': 7}.

The largest finite outputs (10 modules):

| module                               |   overflow_started_here |   max_finite_abs |
|:-------------------------------------|------------------------:|-----------------:|
| model.visual                         |                       0 |            64416 |
| model.visual.blocks.31               |                       0 |            64416 |
| model.visual.blocks.31.mlp.down_proj |                       7 |            64352 |
| model.visual.blocks.31.mlp           |                       0 |            64352 |
| model.visual.blocks.27               |                       0 |            15832 |
| model.visual.blocks.28               |                       0 |            15832 |
| model.visual.blocks.29               |                       0 |            15832 |
| model.visual.blocks.30               |                       0 |            15832 |
| model.visual.blocks.26               |                       0 |            15824 |
| model.visual.blocks.25               |                       0 |            15816 |

## The fixes, on 127 examples (every overflowing one and 15 others per task)

(a) kept 1 module(s) in fp32: ['model.visual.blocks.31.mlp.down_proj'].

| fix              |   nan_losses |   of |   sec_per_example |   mean_gap_to_c | note                            |
|:-----------------|-------------:|-----:|------------------:|----------------:|:--------------------------------|
| as trained       |            7 |  127 |             2.145 |          0.0017 | time includes the scan's checks |
| (a) fp32 islands |            0 |  127 |             1.741 |          0.0017 |                                 |
| (b) clamping     |            0 |  127 |             1.745 |          0.0017 |                                 |
| (c) fp32 compute |            0 |  127 |             5.579 |          0      |                                 |

**The fix by the rule:** (a) fp32 islands.

## Learning with it (8 optimizer steps of 4 examples, the trainer's fp16 mechanics)

|   step |   label_loss |   grad_norm |   learning_rate |   scale | skipped   |
|-------:|-------------:|------------:|----------------:|--------:|:----------|
|      1 |       1.5091 |    0.898189 |     0.0002      |   65536 | False     |
|      2 |       1.7928 |    0.340624 |     0.000190097 |   65536 | False     |
|      3 |       0.9329 |    0.359424 |     0.000162349 |   65536 | False     |
|      4 |       1.0401 |    0.434549 |     0.000122252 |   65536 | False     |
|      5 |       0.7946 |    0.383342 |     7.77479e-05 |   65536 | False     |
|      6 |       0.9382 |    0.35733  |     3.7651e-05  |   65536 | False     |
|      7 |       1.3113 |    0.44818  |     9.90311e-06 |   65536 | False     |
|      8 |       1.7821 |    0.466827 |     0           |   65536 | False     |

**Learning works:** True.

## Time

- With (a) fp32 islands, the forward pass alone takes 1.74 s per example on one T4. An epoch of 53,838 on two T4s then needs at least 13.0 h before the backward pass. Step 2's run took 912 s per step of 256: 7.1 s per example on each T4, backward pass included (53 h per epoch).
- The data step took 13 s with folder listings (step 2's: about 2,000 s).

Files: `per_example.csv`, `modules.csv`, `fixes.csv`, `train_steps.csv`, `config.json`.
