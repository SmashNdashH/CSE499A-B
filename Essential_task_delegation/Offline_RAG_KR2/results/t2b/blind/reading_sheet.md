# T2b blind reading: your sheet

Five pairs. In each pair, A and B are the same report for the same scene, one by our 7B and one by
Qwen2.5-3B-Instruct, in an order drawn at random. **Don't open `key_do_not_open_before_reading.json` until all five
pairs below are filled in.** A second judge, Gemini, scores the same pairs on the same four criteria from the prompts
in `gemini/` (steps in `gemini/HOW_TO.md`). Fill in this sheet before you look at its replies.

## How to read a pair (about 3 minutes each)

1. Read `pair_N_A.txt`, then `pair_N_B.txt`.
2. Read as the person each report is for (the table below says who).
3. Score A and B from 1 to 5 on each criterion:
   - **Useful:** could the reader act on it? 5 = clear priorities (where to go first, what to send or build, what to
     avoid), tied to this scene. 3 = some guidance, mostly generic. 1 = nothing to act on.
   - **Clear:** 5 = plain, well organised, no repetition or filler. 3 = some repetition or padding. 1 = hard to follow.
   - **Trustworthy:** 5 = stays with the facts it states, no contradictions between its own numbers or sections, says
     when something is an estimate, invents no places, people or events. 3 = a few unsupported claims.
     1 = contradictions or invented specifics. "(number not available offline)" means the guard removed a wrong number,
     so count each one as the writer's slip.
   - **Cites properly:** 5 = the claims that need support cite a guideline (an ID in square brackets or a named
     handbook), and the citation fits the claim. 3 = some citations, some missing or generic. 1 = none, or ones that
     don't fit.
4. Write which is more useful overall (**A**, **B** or **same**) and one line on why.

Don't prefer a report for being longer: one report in some pairs is two or three times the length of the other. Extra
length counts only if it helps the reader; repetition counts against Clear.

## The pairs

| Pair | Report | Scene | Its reader |
|---|---|---|---|
| 1 | Emergency service human resource allocation | Hawaii wildfire (`hawaii_wildfire_post_646`) | a coordinator assigning rescue staff and teams |
| 2 | Reconstruction plan | Turkey earthquake (`turkey_earthquake4_post_327`) | government planners deciding what to rebuild and in what order |
| 3 | Reconstruction plan | Santa Rosa wildfire (`santa_rosa_wildfire_00000155`) | government planners deciding what to rebuild and in what order |
| 4 | Public community report | Joplin tornado (`joplin_tornado_00000147`) | the public living in and near the affected area |
| 5 | Emergency team report | Moore tornado (`moore_tornado_00000045`) | responders choosing where to set up shelters and medical care and how to move people |

## Your scores

| Pair | A: useful | A: clear | A: trustworthy | A: cites | B: useful | B: clear | B: trustworthy | B: cites | More useful: A, B or same | Why (one line) |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 5 | 4 | 5 | cant comment as I dont have the energy to check the citations with real citations one my one manually that is too much work for me, do it yourself | 3 | 5 | 5 | cant comment as I dont have the energy to check the citations with real citations one my one manually that is too much work for me, do it yourself | A | A, as it used more useful and followable directions for USAR teams but the recommendations are more elaborate on B.
| 2 |  |  |  | cant comment as I dont have the energy to check the citations with real citations one my one manually that is too much work for me, do it yourself  | 4 | 3 | 4 | | |
| 3 | | | | | | | | | | |
| 4 | | | | | | | | | | |
| 5 | | | | | | | | | | |

When the table is full, open the key, note which writer each of your choices was, and tell me. I'll add your verdict and
Gemini's to T2b's results beside the scores. It doesn't change the rule's result (our 7B stays the writer). It's a
person's view of quality, which the numbers can't give.
