"""Reads Gemini's ten JSON replies from blind/gemini/HOW_TO.md, maps report 1/2 back to A/B (order_AB: 1 = A; order_BA:
1 = B), applies the both-orders rule (a pair is won only if the same report wins in both orders, otherwise "same") and
writes verdicts.csv (one row per reply) and pairs.csv (one row per pair). Writers are added only with --reveal."""
import json
import re
import sys
from pathlib import Path

import pandas as pd

sys.stdout.reconfigure(encoding="utf-8")
BLIND = Path(__file__).resolve().parent.parent                  # results/t2b/blind
text = (BLIND / "gemini" / "HOW_TO.md").read_text(encoding="utf-8")
replies = text[text.index("## Replies"):]
model = re.search(r"Gemini model:\s*(.+)", replies).group(1).strip()
starts = [(m.group(1), int(m.group(2)), m.group(3), m.end()) for m in re.finditer(r"^\| (pair_(\d)_order_(AB|BA)) \|", replies, re.M)]
assert len(starts) == 10, f"{len(starts)} replies found"
CRITERIA = ("useful", "clear", "trustworthy", "cites")
rows = []
for k, (name, pair, order, pos) in enumerate(starts):
    chunk = replies[pos:starts[k + 1][3] - len(f"| {starts[k + 1][0]} |") if k + 1 < len(starts) else len(replies)]
    reply = json.loads(chunk[chunk.index("{"):chunk.rindex("}") + 1])
    first, second = ("A", "B") if order == "AB" else ("B", "A")
    side = {first: reply["report_1"], second: reply["report_2"]}
    pick = reply["more_useful"].strip().lower()
    winner = {"report_1": first, "report_2": second, "same": "same"}[pick]
    rows.append({"pair": pair, "order": order, **{f"{s}_{c}": side[s][c] for s in "AB" for c in CRITERIA},
                 "more_useful": winner, "why": reply["why"], "A_notes": side["A"]["notes"], "B_notes": side["B"]["notes"]})
V = pd.DataFrame(rows).sort_values(["pair", "order"]).reset_index(drop=True)
assert sorted(map(tuple, V[["pair", "order"]].values)) == [(p, o) for p in range(1, 6) for o in ("AB", "BA")]
P = []
for pair, g in V.groupby("pair"):
    picks = set(g["more_useful"])
    P.append({"pair": pair, "more_useful": picks.pop() if len(picks) == 1 else "same",
              "same_in_both_orders": len(set(g["more_useful"])) == 1,
              **{f"{s}_{c}": g[f"{s}_{c}"].mean() for s in "AB" for c in CRITERIA},
              "A_words": len((BLIND / f"pair_{pair}_A.txt").read_text(encoding="utf-8").split()),
              "B_words": len((BLIND / f"pair_{pair}_B.txt").read_text(encoding="utf-8").split())})
P = pd.DataFrame(P)
P["longer"] = ["A" if a > b else "B" for a, b in zip(P["A_words"], P["B_words"])]
P["longer_won"] = P["longer"] == P["more_useful"]
if "--reveal" in sys.argv:
    key = json.loads((BLIND / "key_do_not_open_before_reading.json").read_text(encoding="utf-8"))
    for df in (V, P):
        df["A_writer"] = [key[f"pair {p}"]["A"] for p in df["pair"]]
        df["B_writer"] = [key[f"pair {p}"]["B"] for p in df["pair"]]
    P["winner_writer"] = [r[f"{r['more_useful']}_writer"] if r["more_useful"] in "AB" else "same" for _, r in P.iterrows()]
V.to_csv(BLIND / "gemini" / "verdicts.csv", index=False)
P.to_csv(BLIND / "gemini" / "pairs.csv", index=False)
print(f"Gemini model: {model}")
print(P.drop(columns=[c for c in P if c.endswith(("_clear", "_cites"))]).to_string(index=False))
print("\nmean over the five pairs:", {f"{s}_{c}": round(P[f"{s}_{c}"].mean(), 2) for s in "AB" for c in CRITERIA})
