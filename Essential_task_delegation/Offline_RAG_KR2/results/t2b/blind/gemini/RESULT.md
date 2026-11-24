# T2b blind pairs: Gemini's verdict (writers still sealed)

Gemini (model "Neon (High)", web chat, 23 Nov) judged the five pairs from the prompts in this folder: each pair in a
new chat, once with A shown first (`order_AB`) and once with B first (`order_BA`). Each report was scored 1–5 on four
criteria. The replies, as pasted, are in `HOW_TO.md`. `verdicts.csv` has one row per reply, mapped back to A and B;
`pairs.csv` has one row per pair. Both are written by `score_gemini.py` from `HOW_TO.md`, so the numbers are exact. With
`--reveal` it also adds the writers from the key; that waits for Abrar's reading.

**The writers stay sealed until Abrar's own reading is in** (his choice, 23 Nov). Then the key is applied and the result
goes into `../../README.md` beside the checker's counts.

## The verdict, by A and B

The rule: a report wins a pair only if it wins in both orders; otherwise the pair counts as "same".

| Pair | Report | More useful | Same in both orders | Useful A / B | Clear A / B | Trustworthy A / B | Cites A / B |
|---|---|---|---|---|---|---|---|
| 1 | Staffing, Hawaii wildfire | B | yes | 2.0 / 4.0 | 2.0 / 2.0 | 3.0 / 2.0 | 2.0 / 3.0 |
| 2 | Reconstruction plan, Turkey earthquake | A | yes | 3.0 / 2.0 | 3.0 / 2.0 | 3.5 / 2.0 | 3.0 / 2.5 |
| 3 | Reconstruction plan, Santa Rosa wildfire | B | yes | 2.5 / 3.5 | 2.0 / 2.5 | 4.0 / 2.0 | 2.0 / 3.0 |
| 4 | Public report, Joplin tornado | A | yes | 4.0 / 2.0 | 2.5 / 1.5 | 2.0 / 3.0 | 3.0 / 2.0 |
| 5 | Emergency team report, Moore tornado | A | yes | 3.5 / 2.5 | 4.0 / 2.0 | 4.0 / 3.0 | 4.5 / 3.0 |

Scores are the mean of the two orders.

- **Order made no difference to the verdicts:** in all five pairs the same report won in both orders. Of the 40 scores,
  29 were the same in both orders, 10 moved by one point, and one by two (pair 4 B's trustworthy: 2 with A first, 4 with
  B first). So the verdicts aren't an artefact of which report came first.
- **Length:** the longer report won 3 of 5 (pairs 1, 3 and 4) and lost 2 (pairs 2 and 5).
- **Usefulness against trust:** in three pairs (1, 3 and 4) the report Gemini found more useful scored lower on
  trustworthy. It rewarded concrete detail (coordinates, distances, team assignments, ground-check warnings), even
  alongside invented field feedback, numbers the guard removed, or a contradiction.
- **What Gemini found that the checker can't:**
  - unsafe advice: shelters or hospitals sited in collapsed areas (pair 2 B, pair 5 B);
  - invented events: "field feedback" (pair 1 B);
  - paragraphs or sections copied word for word (in every pair, in at least one of the two reports);
  - sentences cut off mid-way (pairs 1, 2, 3, 4 and 5).
- **What Gemini couldn't check:** the numbers against the facts the writers were given. The checker did that (T2b:
  3 contradictions for one writer, 15 for the other).
