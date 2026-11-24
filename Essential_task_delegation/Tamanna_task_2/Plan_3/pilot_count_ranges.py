"""Plan 3 pilot: honest count ranges for destroyed buildings, on validation only.

Reproduces the pilot table in Plan_3_Honest_Count_Ranges.md (section 5).
CPU only, about 1-2 minutes. Run from anywhere:

    python pilot_count_ranges.py

Reads (all already in the repo):
  Champion_Task/E1-results/E1/gt/                 true 4-class masks (0 bg, 1 intact, 2 damaged, 3 destroyed)
  Champion_Task/R16-results/R16/R11_tta/          R11's maps (8-view TTA), same classes
  Champion_Task/R16c-results/step5/instances_val.csv   SAM 3 outlines + the step-5 grader's log-probabilities
  Champion_Task/E5-results/E5/leaked_pairs_40.csv the 40 leaked validation pairs, left out
"""
import os
import re
import sys

import numpy as np
import pandas as pd
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
CT = os.path.normpath(os.path.join(HERE, "..", "..", "Champion_Task"))
if len(sys.argv) > 1:
    CT = sys.argv[1]

MIN_PX = 20          # a destroyed blob counts if it has at least 20 pixels (H2's rule)
ALPHA = 0.10         # ranges should hold the true count 90% of the time
REPEATS = 300        # random 50/50 calibration/check splits of the 605 images
SEED = 0
EIGHT = np.ones((3, 3), int)


def event_of(name):
    # turkey_earthquake1_post_573.png -> turkey_earthquake; portugal_wildfire_00000666_post_disaster.png -> portugal_wildfire
    return re.sub(r"\d*(_\d+)?_post.*$", "", name)


def hazard_of(event):
    if "earthquake" in event:
        return "quake"
    if "hurricane" in event or "tornado" in event:
        return "wind"
    if "flood" in event or "tsunami" in event:
        return "water"
    if "fire" in event:
        return "fire"
    return "other"   # explosions, volcano


def count_blobs(mask):
    lab, n = ndimage.label(mask, structure=EIGHT)
    if n == 0:
        return 0
    return int((np.bincount(lab.ravel())[1:] >= MIN_PX).sum())


def load_counts():
    gt_dir = os.path.join(CT, "E1-results", "E1", "gt")
    r11_dir = os.path.join(CT, "R16-results", "R16", "R11_tta")
    leaked = set(pd.read_csv(os.path.join(CT, "E5-results", "E5", "leaked_pairs_40.csv")).validation_pair)
    rows = []
    for f in sorted(os.listdir(gt_dir)):
        if f in leaked:
            continue
        gt = np.array(Image.open(os.path.join(gt_dir, f)))
        r11 = np.array(Image.open(os.path.join(r11_dir, f)))
        rows.append(dict(image=f, event=event_of(f), truth=count_blobs(gt == 3), r11=count_blobs(r11 == 3)))
    df = pd.DataFrame(rows)

    inst = pd.read_csv(os.path.join(CT, "R16c-results", "step5", "instances_val.csv"))
    inst = inst[inst.found_by == "sam3"]
    logp = inst[["logp_intact_s42", "logp_damaged_s42", "logp_destroyed_s42", "logp_none_s42"]].values
    inst = inst.assign(destroyed=(logp.argmax(1) == 2) & (inst.area_px >= MIN_PX))
    df["grader"] = df.image.map(inst.groupby("image").destroyed.sum()).fillna(0).astype(int)
    df["hazard"] = df.event.map(hazard_of)
    return df


def q_hat(scores):
    """Split-conformal quantile: the ceil((m+1)(1-alpha))-th smallest score."""
    m = len(scores)
    k = int(np.ceil((m + 1) * (1 - ALPHA)))
    return np.inf if k > m else np.sort(scores)[k - 1]


def evaluate(df, centre, scale, groups):
    """Average over REPEATS random splits: calibrate on one half, check on the other."""
    t = df.truth.values.astype(float)
    hz = df.hazard.values
    n = len(df)
    score = np.abs(t - centre) / scale
    rng = np.random.default_rng(SEED)
    out = []
    for _ in range(REPEATS):
        perm = rng.permutation(n)
        cal, chk = perm[: n // 2], perm[n // 2:]
        pooled = q_hat(score[cal])
        q = np.full(n, pooled)
        if groups is not None:
            for g in np.unique(groups):
                in_cal = cal[groups[cal] == g]
                qg = q_hat(score[in_cal]) if len(in_cal) else np.inf
                q[groups == g] = qg if np.isfinite(qg) else pooled   # tiny groups fall back to the pooled range
        lo = np.maximum(0, np.ceil(centre - q * scale))
        hi = np.floor(centre + q * scale)
        hit = (t >= lo) & (t <= hi)
        width = hi - lo

        def cover(mask):
            sel = chk[mask[chk]]
            return hit[sel].mean() if len(sel) else np.nan

        quake_pos = (t > 0) & (hz == "quake")
        sel_qp = chk[quake_pos[chk]]
        out.append((hit[chk].mean(), cover(t > 0), cover(quake_pos), cover((t >= 10) & (hz == "quake")),
                    cover(t >= 5), np.median(width[chk]),
                    np.median(width[sel_qp]) if len(sel_qp) else np.nan))
    return np.nanmean(np.array(out), axis=0)


def main():
    df = load_counts()
    t, r, g = (df[c].values.astype(float) for c in ("truth", "r11", "grader"))
    hz = df.hazard.values
    quake = df[df.hazard == "quake"]
    print(f"{len(df)} clean validation images; by hazard: {df.hazard.value_counts().to_dict()}")
    print(f"Images with >=1 destroyed: {(t > 0).sum()}; with >=5: {(t >= 5).sum()}; "
          f"quake images with >=1 destroyed: {((t > 0) & (hz == 'quake')).sum()}")
    print(f"Quake images, destroyed buildings: truth {quake.truth.sum()}, R11 {quake.r11.sum()}, grader {quake.grader.sum()}")

    plain = np.sqrt(r) + 1                                   # bigger counts, bigger errors
    second = np.sqrt(np.maximum(r, g)) + 1 + np.abs(r - g)   # ... and wider when the two models disagree
    busy = np.where(np.maximum(r, g) >= 3, "busy", "calm")
    hz_busy = np.char.add(hz.astype(str), busy)
    variants = [
        ("A  one group", r, plain, None),
        ("B  by hazard", r, plain, hz),
        ("C  by hazard + second opinion", r, second, hz),
        ("D  hazard x busy + second opinion", r, second, hz_busy),
        ("E  D, grader as centre on quakes", np.where(hz == "quake", g, r), second, hz_busy),
        ("F  D, centre halfway R11-grader", (r + g) / 2, second, hz_busy),
    ]
    print(f"\nalpha {ALPHA}, {REPEATS} random 50/50 splits; coverage = share of check images whose true count is inside")
    print(f"{'variant':36s} {'all':>6s} {'>=1':>6s} {'qk>=1':>6s} {'qk>=10':>7s} {'>=5':>6s} {'med w':>6s} {'med w qk>=1':>12s}")
    for name, centre, scale, groups in variants:
        cov, pos, qk, qk10, five, medw, medwq = evaluate(df, centre, scale, groups)
        print(f"{name:36s} {cov:6.3f} {pos:6.3f} {qk:6.3f} {qk10:7.3f} {five:6.3f} {medw:6.1f} {medwq:12.1f}")


if __name__ == "__main__":
    main()
