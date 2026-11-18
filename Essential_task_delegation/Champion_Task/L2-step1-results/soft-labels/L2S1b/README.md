# L2 step 1b: soft labels from the new 7B

The 7B `AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP` read each checkable training question with its label as the answer, at the 3B's image size (at most 602,112 pixels). At each answer token and at the end-of-answer token, the 20 most likely tokens are kept with their log-probabilities. 16,400 of 38,271 questions done; the 1,962 on held-out after-photos are left out.

## By task

| task | questions | answer_tokens | top1_is_label_% | mean_label_prob |
|---|---|---|---|---|
| Building Damage Counting | 9019 | 147701 | 86.7 | 0.835 |
| Disaster Bearing Bodies Recognition | 7381 | 162383 | 90.8 | 0.872 |

- `top1_is_label_%`: answer tokens where the 7B's most likely token is the label's.
- `mean_label_prob`: the 7B's mean probability of the label's token.

## Files

- `shards/*.npz`: per question `entry_idx` (its index among the 55,764 eligible entries), `offsets`, and per answer token `target_ids`, `topk_ids` and `topk_logp` (the top 20), `target_logp`.
- `by_task.csv`, `config.json`.
