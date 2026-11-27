"""H5 step 2, validation only: the damaged class, the grader-seed check, leave-one-event-out, the zero case,
and the frozen variant chosen by the plan's rule. No test file is read.

    python step2_validation.py

CPU only, about a minute. Reads (all validation, all already in the repo):
  Champion_Task/E1-results/E1/gt/                        true 4-class masks (0 bg, 1 intact, 2 damaged, 3 destroyed)
  Champion_Task/R16-results/R16/R11_tta/                 R11's maps, same classes
  Champion_Task/R16c-results/step5/instances_val.csv     SAM 3 outlines, grader seeds 42 and 43
  Champion_Task/R16c-results/step5b/instances_val.csv    the same outlines, grader seed 44
  Champion_Task/E5-results/E5/leaked_pairs_40.csv        the 40 leaked validation pairs, left out
Writes step2_results/: counts_val.csv, part1.csv, leave_one_event_out.csv, zero_case.csv, choice.json.

It imports both pilots (pilot_count_ranges.py, pilot_count_ranges_c4.py) and reuses their ranges and repeats,
so the destroyed / seed 42 rows must reproduce Plan_3_Honest_Count_Ranges.md, section 5, Part 1.
"""
import json
import os
import sys

import numpy as np
import pandas as pd
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.argv = sys.argv[:1]
import pilot_count_ranges as P       # noqa: E402  count_blobs, event_of, hazard_of, q_hat, MIN_PX
import pilot_count_ranges_c4 as C    # noqa: E402  ranges (split conformal by group), repeat (300 splits)

CT = P.CT
OUT = os.path.join(HERE, "step2_results")
CLASSES = {"destroyed": 3, "damaged": 2}             # pixel value in the masks
GRADER_IDX = {"destroyed": 2, "damaged": 1}          # column in [intact, damaged, destroyed, none]
SEEDS = {42: "step5", 43: "step5", 44: "step5b"}     # grader seed -> R16c folder holding its log-probabilities
RULE_VARIANTS = ["C0", "C1", "G", "G2", "G3"]
COLS = ["all", "ge1", "quake_ge1", "quake_ge10", "ge5", "other_ge1", "med_w"]

# Plan section 5, Part 1 (destroyed, seed 42): the reproduction check
EXPECTED = {"C0": [0.904, 0.725, 0.613, 0.211, 0.580, 0.561, 1.4],
            "C1": [0.920, 0.759, 0.794, 0.788, 0.700, 0.730, 2.0],
            "G":  [0.920, 0.776, 0.836, 0.997, 0.777, 0.851, 2.1],
            "G2": [0.916, 0.753, 0.841, 1.000, 0.731, 0.855, 1.8],
            "G3": [0.921, 0.778, 0.836, 0.997, 0.781, 0.851, 2.1]}


# ---------------------------------------------------------------- counts per photo
def load_counts():
    """One row per clean validation photo: truth and R11 per class, the grader per class and seed, source, hazard."""
    gt_dir = os.path.join(CT, "E1-results", "E1", "gt")
    r11_dir = os.path.join(CT, "R16-results", "R16", "R11_tta")
    leaked = set(pd.read_csv(os.path.join(CT, "E5-results", "E5", "leaked_pairs_40.csv")).validation_pair)
    rows = []
    for f in sorted(os.listdir(gt_dir)):
        if f in leaked:
            continue
        gt = np.array(Image.open(os.path.join(gt_dir, f)))
        r11 = np.array(Image.open(os.path.join(r11_dir, f)))
        row = dict(image=f, event=P.event_of(f))
        for cls, v in CLASSES.items():
            row[f"truth_{cls}"] = P.count_blobs(gt == v)
            row[f"r11_{cls}"] = P.count_blobs(r11 == v)
        rows.append(row)
    df = pd.DataFrame(rows)
    df["hazard"] = df.event.map(P.hazard_of)

    inst5 = pd.read_csv(os.path.join(CT, "R16c-results", "step5", "instances_val.csv"))
    for seed, folder in SEEDS.items():
        inst = inst5 if folder == "step5" else pd.read_csv(os.path.join(CT, "R16c-results", folder, "instances_val.csv"))
        inst = inst[inst.found_by == "sam3"]
        label = inst[[f"logp_{k}_s{seed}" for k in ("intact", "damaged", "destroyed", "none")]].values.argmax(1)
        for cls, idx in GRADER_IDX.items():
            hit = (label == idx) & (inst.area_px.values >= P.MIN_PX)
            per_image = pd.Series(hit, index=inst.image.values).groupby(level=0).sum()
            df[f"grader{seed}_{cls}"] = df.image.map(per_image).fillna(0).astype(int)

    # each photo's source, as in pilot_count_ranges_c4.photos()
    df["source"] = df.image.map(inst5.drop_duplicates("image").set_index("image").source)
    miss = df.source.isna()
    df.loc[miss, "source"] = np.where(df.image[miss].str.contains("_post_disaster"), "xBD", "other")
    return df


# ---------------------------------------------------------------- the five rule variants
def variants(df, cls, seed):
    """Centre, scale and groups of C0, C1, G, G2, G3 for one class and one grader seed (as in the C4 pilot)."""
    r = df[f"r11_{cls}"].values.astype(float)
    g = df[f"grader{seed}_{cls}"].values.astype(float)
    src = df.source.values.astype(str)
    hz = df.hazard.values.astype(str)
    c4 = np.where(src == "xBD", r, g)
    plain = np.sqrt(c4) + 1
    second = np.sqrt(np.maximum(r, g)) + 1 + np.abs(r - g)
    busy = np.where(np.maximum(r, g) >= 3, "busy", "calm")
    hzb = np.char.add(hz, busy)
    return {"C0": (c4, plain, np.zeros(len(r), int)),
            "C1": (c4, plain, hzb),
            "G": (c4, second, hzb),
            "G2": (c4, second, np.char.add(src, busy)),
            "G3": (c4, second, np.char.add(hzb, src))}


def masks(df, cls):
    t = df[f"truth_{cls}"].values.astype(float)
    quake = (df.hazard == "quake").values
    other = (df.source != "xBD").values
    pos = t > 0
    return t, [pos, pos & quake, (t >= 10) & quake, t >= 5, pos & other]


def part1(df, cls, seed):
    t, ms = masks(df, cls)
    rows = []
    for name, (centre, scale, groups) in variants(df, cls, seed).items():
        v = C.repeat(t, centre, scale, groups, ms)
        rows.append(dict(cls=cls, seed=seed, variant=name, groups=len(np.unique(groups)), **dict(zip(COLS, v))))
    return pd.DataFrame(rows)


def choose(tab):
    """The plan's rule (section 6), as written in README.md before the run."""
    tab = tab.set_index("variant")
    keep = [v for v in RULE_VARIANTS if tab.loc[v, "all"] >= 0.88 and tab.loc[v, "med_w"] <= 3]
    if not keep:
        return None
    best = max(keep, key=lambda v: tab.loc[v, "ge5"])
    near = [v for v in keep if tab.loc[best, "ge5"] - tab.loc[v, "ge5"] <= 0.02]
    fewest = min(tab.loc[v, "groups"] for v in near)
    return max((v for v in near if tab.loc[v, "groups"] == fewest), key=lambda v: tab.loc[v, "ge5"])


# ---------------------------------------------------------------- leave one event out
def leave_one_event_out(df, cls, seed=42):
    t, _ = masks(df, cls)
    ev = df.event.values
    rows = []
    for name, (centre, scale, groups) in variants(df, cls, seed).items():
        hit_all = np.zeros(len(t), bool)
        width_all = np.zeros(len(t))
        for e in np.unique(ev):
            out = ev == e
            lo, hi = C.ranges(t, centre, scale, groups, np.flatnonzero(~out))
            hit = (t >= lo) & (t <= hi)
            hit_all[out], width_all[out] = hit[out], (hi - lo)[out]
            pos = out & (t > 0)
            rows.append(dict(cls=cls, variant=name, event=e, hazard=P.hazard_of(e), photos=int(out.sum()),
                             photos_ge1=int(pos.sum()), cover_all=hit[out].mean(),
                             cover_ge1=hit[pos].mean() if pos.any() else np.nan,
                             med_w=np.median((hi - lo)[out]),
                             med_w_ge1=np.median((hi - lo)[pos]) if pos.any() else np.nan))
        pos = t > 0
        rows.append(dict(cls=cls, variant=name, event="ALL (each photo with its event left out)", hazard="",
                         photos=len(t), photos_ge1=int(pos.sum()), cover_all=hit_all.mean(),
                         cover_ge1=hit_all[pos].mean(), med_w=np.median(width_all),
                         med_w_ge1=np.median(width_all[pos])))
    return pd.DataFrame(rows)


# ---------------------------------------------------------------- the zero case
def zero_case(df, cls, variant, seed=42):
    """How often a "0 to 0" range ("none found") hides buildings of this class."""
    t, _ = masks(df, cls)
    centre, scale, groups = variants(df, cls, seed)[variant]
    rng = np.random.default_rng(0)                 # the same 300 splits as the pilot
    per_split = []
    for _ in range(C.REPEATS):
        perm = rng.permutation(len(t))
        cal, chk = perm[: len(t) // 2], perm[len(t) // 2:]
        lo, hi = C.ranges(t, centre, scale, groups, cal)
        zero = np.zeros(len(t), bool)
        zero[chk] = (lo[chk] == 0) & (hi[chk] == 0)
        per_split.append([zero.sum(), (t[zero] > 0).mean() if zero.any() else np.nan,
                          t[zero].sum() / t[chk].sum() if t[chk].sum() else np.nan])
    n_zero, hides, share = np.nanmean(np.array(per_split), axis=0)

    lo, hi = C.ranges(t, centre, scale, groups, np.arange(len(t)))   # calibrated on all 605 (in-sample)
    zero = (lo == 0) & (hi == 0)
    missed = np.sort(t[zero & (t > 0)].astype(int))[::-1]
    return dict(cls=cls, variant=variant, seed=seed,
                check_half_zero_ranges=n_zero, check_half_share_hiding=hides,
                check_half_share_of_all_buildings=share,
                all605_zero_ranges=int(zero.sum()), all605_zero_hiding=int(len(missed)),
                all605_true_counts_hidden=" ".join(map(str, missed)),
                all605_buildings_hidden=int(missed.sum()), all605_buildings_total=int(t.sum()))


# ---------------------------------------------------------------- run
def show(tab, title):
    print(f"\n{title}")
    print(f"  {'variant':8s} {'groups':>6s} {'all':>6s} {'>=1':>6s} {'qk>=1':>6s} {'qk>=10':>7s} {'>=5':>6s} {'oth>=1':>7s} {'med w':>6s}")
    for _, x in tab.iterrows():
        print(f"  {x.variant:8s} {x.groups:6d} {x['all']:6.3f} {x.ge1:6.3f} {x.quake_ge1:6.3f} {x.quake_ge10:7.3f} "
              f"{x.ge5:6.3f} {x.other_ge1:7.3f} {x.med_w:6.1f}")


def main():
    os.makedirs(OUT, exist_ok=True)
    df = load_counts()
    df.to_csv(os.path.join(OUT, "counts_val.csv"), index=False)
    quake = df.hazard == "quake"
    print(f"{len(df)} clean validation photos, {df.event.nunique()} events; source {df.source.value_counts().to_dict()}")
    for cls in CLASSES:
        t = df[f"truth_{cls}"]
        print(f"  {cls:9s}: photos with >=1 {int((t > 0).sum())}, with >=5 {int((t >= 5).sum())}; quake photos: truth "
              f"{int(t[quake].sum())}, R11 {int(df[f'r11_{cls}'][quake].sum())}, "
              + ", ".join(f"grader s{s} {int(df[f'grader{s}_{cls}'][quake].sum())}" for s in SEEDS))

    # a + b + c: Part 1 per class and seed
    p1 = pd.concat([part1(df, cls, seed) for cls in CLASSES for seed in SEEDS], ignore_index=True)
    p1.to_csv(os.path.join(OUT, "part1.csv"), index=False)
    for cls in CLASSES:
        for seed in SEEDS:
            show(p1[(p1.cls == cls) & (p1.seed == seed)], f"PART 1  {cls}, grader seed {seed}"
                 + ("  (the choice)" if seed == 42 else "  (seed check)"))

    ref = p1[(p1.cls == "destroyed") & (p1.seed == 42)].set_index("variant")
    worst = max(abs(round(ref.loc[v, c], 3 if c != "med_w" else 1) - e)
                for v, exp in EXPECTED.items() for c, e in zip(COLS, exp))
    print(f"\n(a) reproduction of the plan's section 5 (destroyed, seed 42): largest difference {worst:.4f} "
          f"-> {'OK' if worst < 1e-9 else 'MISMATCH, stop'}")
    if worst >= 1e-9:
        sys.exit(1)

    # f: the choice, and whether other seeds would choose differently
    choice = {cls: choose(p1[(p1.cls == cls) & (p1.seed == 42)]) for cls in CLASSES}
    by_seed = {cls: {s: choose(p1[(p1.cls == cls) & (p1.seed == s)]) for s in SEEDS} for cls in CLASSES}
    print(f"(f) the rule chooses: {choice}; by seed: {by_seed}")

    # when the rule keeps no variant for a class, G (the destroyed choice) is shown for information only
    shown = {cls: choice[cls] or "G" for cls in CLASSES}
    for cls in CLASSES:
        if choice[cls] is None:
            print(f"    {cls}: no variant passes rule 2 (overall coverage >= 0.88 and median width <= 3); "
                  f"G is shown below for information only, not as a choice")

    # c: how far the chosen variant moves with the seed
    print("\n(c) seed check: range over seeds 42-44")
    for cls in CLASSES:
        x = p1[(p1.cls == cls) & (p1.variant == shown[cls])]
        tag = "" if choice[cls] else " (information only)"
        print(f"  {cls:9s} {shown[cls]}{tag}: " + "  ".join(f"{c} {x[c].min():.3f}-{x[c].max():.3f}" for c in COLS))

    # d: leave one event out
    loeo = pd.concat([leave_one_event_out(df, cls) for cls in CLASSES], ignore_index=True)
    loeo.to_csv(os.path.join(OUT, "leave_one_event_out.csv"), index=False)
    for cls in CLASSES:
        print(f"\n(d) leave one event out, {cls}: coverage on the left-out event (all photos / photos with >=1)")
        print(f"  {'event':42s} {'hazard':6s} {'n':>4s} {'n>=1':>5s} | " + " | ".join(f"{v:^13s}" for v in ("C0", "C1", shown[cls]))
              + f" | {'med w >=1':>9s}")
        sub = loeo[loeo.cls == cls]
        events = sub[sub.variant == "G"].sort_values("photos", ascending=False).event
        for e in list(events[events != "ALL (each photo with its event left out)"]) + ["ALL (each photo with its event left out)"]:
            r = {v: sub[(sub.variant == v) & (sub.event == e)].iloc[0] for v in ("C0", "C1", shown[cls])}
            x = r[shown[cls]]
            cells = " | ".join(f"{r[v].cover_all:5.3f} / {r[v].cover_ge1:5.3f}" if not np.isnan(r[v].cover_ge1)
                               else f"{r[v].cover_all:5.3f} /   -  " for v in ("C0", "C1", shown[cls]))
            mw = f"{x.med_w_ge1:9.1f}" if not np.isnan(x.med_w_ge1) else f"{'-':>9s}"
            print(f"  {e[:42]:42s} {x.hazard:6s} {x.photos:4d} {x.photos_ge1:5d} | {cells} | {mw}")

    # e: the zero case
    zc = pd.DataFrame([dict(zero_case(df, cls, shown[cls]), chosen=choice[cls] is not None) for cls in CLASSES])
    zc.to_csv(os.path.join(OUT, "zero_case.csv"), index=False)
    print("\n(e) zero case: how often 'none found' (a 0 to 0 range) hides buildings of that class")
    for _, z in zc.iterrows():
        print(f"  {z.cls:9s} {z.variant}{'' if z.chosen else ' (information only)'}: check halves: {z.check_half_zero_ranges:.0f} '0 to 0' photos per half, "
              f"{z.check_half_share_hiding:.3f} of them hide some, holding {z.check_half_share_of_all_buildings:.3f} "
              f"of all {z.cls} buildings")
        print(f"  {'':9s}    calibrated on all 605: {z.all605_zero_hiding} of {z.all605_zero_ranges} '0 to 0' photos hide "
              f"some, true counts {z.all605_true_counts_hidden} ({z.all605_buildings_hidden} of {z.all605_buildings_total})")

    with open(os.path.join(OUT, "choice.json"), "w") as fh:
        json.dump({"task": "H5 step 2", "date": "2026-11-27", "alpha": P.ALPHA, "repeats": C.REPEATS,
                   "grader_seed": 42, "choice": choice,
                   "no_choice_reason": {c: "no variant passes rule 2: every median width is above 3"
                                        for c in CLASSES if choice[c] is None}, "choice_by_seed": {c: {str(s): v for s, v in d.items()}
                                                                         for c, d in by_seed.items()},
                   "rule": "plan section 6: overall coverage >= 0.88 and median width <= 3; highest coverage on photos "
                           "with >= 5 of the class; within 0.02, fewest groups",
                   "data": "605 clean validation photos only; no test file read",
                   "inputs": ["Champion_Task/E1-results/E1/gt/", "Champion_Task/R16-results/R16/R11_tta/",
                              "Champion_Task/R16c-results/step5/instances_val.csv",
                              "Champion_Task/R16c-results/step5b/instances_val.csv",
                              "Champion_Task/E5-results/E5/leaked_pairs_40.csv"]}, fh, indent=2)
    print("\nwrote step2_results/ next to this script")


if __name__ == "__main__":
    main()
