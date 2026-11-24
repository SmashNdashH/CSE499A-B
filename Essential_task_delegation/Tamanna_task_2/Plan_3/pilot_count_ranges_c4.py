"""Plan 3 pilot, C4 version (24 Nov 2026). Validation only: no test file is read.

Reproduces the three tables in Plan_3_Honest_Count_Ranges.md, section 5. CPU only, about 40 s:

    python pilot_count_ranges_c4.py

Part 1  Destroyed-building ranges per photo, centred on C4's count (Abrar's choice of 19 Nov: R11 on xBD photos,
        find-then-grade on the others), widened when R11 and the grader disagree.
Part 2  An option-free counting score on the benchmark's own validation counting questions (E7 step 1):
        at 90% coverage, how much narrower is our range than one from a rule that never sees the photo?
Part 3  Hot spots: are they better on photos whose range says "at least 1 destroyed"?

Reads (all already in the repo, besides what pilot_count_ranges.py reads):
  Champion_Task/R16c-results/step5/instances_val.csv          each photo's source (xBD or other)
  Champion_Task/E7-results/step1/e7_step1_per_question.csv    validation counting questions, true answers, both counts
  Champion_Task/E7-results/step3b/val_c4_hotspots_per_image.csv   C4's hot spots on validation, and their hits
"""
import os
import sys

import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.argv = sys.argv[:1]          # pilot_count_ranges reads argv[1] as its data folder
import pilot_count_ranges as P   # noqa: E402  (17 Nov pilot: load_counts, q_hat, event_of, hazard_of)

CT = P.CT
REPEATS = 300


def ranges(t, centre, scale, groups, cal):
    """Split conformal by group. q per group from the calibration indices; small groups use the pooled q."""
    score = np.abs(t - centre) / scale
    pooled = P.q_hat(score[cal])
    q = np.full(len(t), pooled)
    for g in np.unique(groups):
        cg = cal[groups[cal] == g]
        qg = P.q_hat(score[cg]) if len(cg) else np.inf
        q[groups == g] = qg if np.isfinite(qg) else pooled
    lo = np.maximum(0, np.ceil(centre - q * scale - 1e-9))
    hi = np.floor(centre + q * scale + 1e-9)
    return lo, hi


def repeat(t, centre, scale, groups, masks):
    """Mean over REPEATS random 50/50 splits of coverage (overall, then each mask) and median width."""
    rng = np.random.default_rng(0)
    out = []
    for _ in range(REPEATS):
        perm = rng.permutation(len(t))
        cal, chk = perm[: len(t) // 2], perm[len(t) // 2:]
        lo, hi = ranges(t, centre, scale, groups, cal)
        hit = (t >= lo) & (t <= hi)
        row = [hit[chk].mean()] + [hit[chk[m[chk]]].mean() if m[chk].any() else np.nan for m in masks]
        out.append(row + [np.median((hi - lo)[chk])])
    return np.nanmean(np.array(out), axis=0)


def photos():
    df = P.load_counts()
    inst = pd.read_csv(os.path.join(CT, "R16c-results", "step5", "instances_val.csv"))
    df["source"] = df.image.map(inst.drop_duplicates("image").set_index("image").source)
    miss = df.source.isna()
    df.loc[miss, "source"] = np.where(df.image[miss].str.contains("_post_disaster"), "xBD", "other")
    df["c4"] = np.where(df.source == "xBD", df.r11, df.grader)
    return df


def part1(df):
    t, r, g, c4 = (df[c].values.astype(float) for c in ("truth", "r11", "grader", "c4"))
    hz, xbd = df.hazard.values, (df.source == "xBD").values
    quake, pos = hz == "quake", t > 0
    print(f"PART 1  {len(df)} clean validation photos; source {df.source.value_counts().to_dict()}")
    print(f"  quake photos (all 'other', so C4 uses the grader): destroyed truth {t[quake].sum():.0f}, "
          f"R11 {r[quake].sum():.0f}, grader = C4 {c4[quake].sum():.0f}")
    print(f"  C4 says 0 on {(c4[pos] == 0).sum()} of the {pos.sum()} photos that have destroyed buildings")
    second = np.sqrt(np.maximum(r, g)) + 1 + np.abs(r - g)
    busy = np.where(np.maximum(r, g) >= 3, "busy", "calm")
    hzb = np.char.add(hz.astype(str), busy)
    masks = [pos, pos & quake, (t >= 10) & quake, t >= 5, pos & ~xbd]
    variants = [
        ("F  17 Nov choice: centre (R11+grader)/2", (r + g) / 2, second, hzb),
        ("C0 centre C4, one group", c4, np.sqrt(c4) + 1, np.zeros(len(t), int)),
        ("C1 centre C4, hazard x busy", c4, np.sqrt(c4) + 1, hzb),
        ("G  centre C4, hazard x busy, 2nd opinion", c4, second, hzb),
        ("G2 centre C4, source x busy, 2nd opinion", c4, second,
         np.char.add(df.source.values.astype(str), busy)),
        ("G3 centre C4, hazard x busy x source, 2nd opinion", c4, second,
         np.char.add(hzb, df.source.values.astype(str))),
    ]
    print(f"  {'variant':50s} {'all':>6s} {'>=1':>6s} {'qk>=1':>6s} {'qk>=10':>7s} {'>=5':>6s} {'oth>=1':>7s} {'med w':>6s}")
    for name, centre, scale, groups in variants:
        v = repeat(t, centre, scale, groups, masks)
        print(f"  {name:50s} {v[0]:6.3f} {v[1]:6.3f} {v[2]:6.3f} {v[3]:7.3f} {v[4]:6.3f} {v[5]:7.3f} {v[6]:6.1f}")

    # worked examples for the plan: G with q from all 605 photos (illustration only, in-sample)
    lo, hi = ranges(t, c4, second, hzb, np.arange(len(t)))
    print(f"  G in-sample: median width on quake photos with >=1 destroyed {np.median((hi - lo)[pos & quake]):.1f}")
    ex = ["turkey_earthquake1_post_573.png", "turkey_earthquake4_post_785.png",
          "portugal_wildfire_00000666_post_disaster.png", "hawaii_wildfire_post_995.png",
          "pinery_bushfire_00000022_post_disaster.png"]
    for name in ex:
        i = int(np.flatnonzero(df.image.values == name)[0])
        print(f"    {name:46s} truth {t[i]:4.0f}  R11 {r[i]:4.0f}  grader {g[i]:4.0f}  C4 {c4[i]:4.0f}  "
              f"range {int(lo[i])}-{int(hi[i])}  {'inside' if lo[i] <= t[i] <= hi[i] else 'OUTSIDE'}")


def part2():
    pq = pd.read_csv(os.path.join(CT, "E7-results", "step1", "e7_step1_per_question.csv"))
    pq = pq[pq.clean].reset_index(drop=True)
    xbd = pq.image.str.contains("_post_disaster").values
    hz = pq.image.map(P.event_of).map(P.hazard_of).values.astype(str)
    cls = pq["class"].values.astype(str)
    t = pq.truth.values.astype(float)
    r, g = pq["R11 | count"].values.astype(float), pq["chain_s42 | count"].values.astype(float)
    c4 = np.where(xbd, r, g)
    second = np.sqrt(np.maximum(r, g)) + 1 + np.abs(r - g)
    grp = np.char.add(cls, np.where(xbd, "xBD", "other"))
    blind_grp = np.char.add(grp, hz)
    n = len(t)
    print(f"\nPART 2  {n} clean validation counting questions (E7 step 1), {pd.Series(cls).value_counts().to_dict()}")
    print("  The benchmark only asks about a class when the photo has some, so every true answer is at least 1.")
    keys = ["all", "intact", "damaged", "destroyed", "truth>=20"]
    sel = {"all": np.ones(n, bool), "intact": cls == "intact", "damaged": cls == "damaged",
           "destroyed": cls == "destroyed", "truth>=20": t >= 20}
    acc = {k: [] for k in ("blind", "ours")}
    rng = np.random.default_rng(0)
    for _ in range(REPEATS):
        perm = rng.permutation(n)
        cal, chk = perm[: n // 2], perm[n // 2:]
        # blind rule: sees no photo; knows the class, the source and the hazard. Centre = the group's median truth.
        centre = np.zeros(n)
        for gname in np.unique(blind_grp):
            m = blind_grp == gname
            cm = cal[m[cal]]
            if len(cm) < 9:                      # too few: fall back to class x source
                cm = cal[(grp == grp[m][0])[cal]]
            centre[m] = np.median(t[cm])
        lo_b, hi_b = ranges(t, centre, np.ones(n), blind_grp, cal)
        lo_o, hi_o = ranges(t, c4, second, grp, cal)
        for name, lo, hi in (("blind", lo_b, hi_b), ("ours", lo_o, hi_o)):
            hit = (t >= lo) & (t <= hi)
            acc[name].append([v for k in keys for v in (hit[chk[sel[k][chk]]].mean(), np.median((hi - lo)[chk[sel[k][chk]]]))])
    b, o = np.array(acc["blind"]).mean(0), np.array(acc["ours"]).mean(0)
    print(f"  {'questions':12s} {'blind cover':>12s} {'blind width':>12s} {'our cover':>10s} {'our width':>10s} {'blind/ours':>11s}")
    for j, k in enumerate(keys):
        print(f"  {k:12s} {b[2 * j]:12.3f} {b[2 * j + 1]:12.1f} {o[2 * j]:10.3f} {o[2 * j + 1]:10.1f} {b[2 * j + 1] / o[2 * j + 1]:10.2f}x")
    print(f"  For reference, C4's point count: median error {np.median(np.abs(c4 - t)):.1f}, "
          f"within 20% of the truth on {np.mean(np.abs(c4 - t) <= 0.2 * t):.3f} of questions")


def part3(df):
    hs = pd.read_csv(os.path.join(CT, "E7-results", "step3b", "val_c4_hotspots_per_image.csv"))
    d = df.merge(hs[["image", "hot_spots", "point_on_gt_damage"]], on="image", how="inner")
    t, r, g, c4 = (d[c].values.astype(float) for c in ("truth", "r11", "grader", "c4"))
    second = np.sqrt(np.maximum(r, g)) + 1 + np.abs(r - g)
    grp = np.char.add(d.hazard.values.astype(str), np.where(np.maximum(r, g) >= 3, "busy", "calm"))
    spots, hits = d.hot_spots.values, d.point_on_gt_damage.values
    n = len(d)
    print(f"\nPART 3  {n} validation photos, {spots.sum()} hot spots, {hits.sum()} hits (share {hits.sum() / spots.sum():.3f})")
    rng = np.random.default_rng(0)
    out = []
    for _ in range(REPEATS):                     # each photo's range is calibrated on the other half (cross-fitting)
        perm = rng.permutation(n)
        a, b = perm[: n // 2], perm[n // 2:]
        lo = np.zeros(n)
        for cal, app in ((a, b), (b, a)):
            lo_all, _ = ranges(t, c4, second, grp, cal)
            lo[app] = lo_all[app]
        sure = lo >= 1
        out.append([sure[spots > 0].mean(), spots[sure].sum(), hits[sure].sum() / spots[sure].sum(),
                    spots[~sure].sum(), hits[~sure].sum() / spots[~sure].sum(), hits[sure].sum() / hits.sum(),
                    (t[sure] > 0).mean()])
    v = np.array(out).mean(0)
    print(f"  photos with hot spots whose range says 'at least 1 destroyed': {v[0]:.3f}")
    print(f"  those photos: {v[1]:.0f} hot spots, hit share {v[2]:.3f}, {v[5]:.3f} of all hits; "
          f"{v[6]:.3f} of them truly have destroyed buildings")
    print(f"  the other photos: {v[3]:.0f} hot spots, hit share {v[4]:.3f}")


if __name__ == "__main__":
    photos_df = photos()
    part1(photos_df)
    part2()
    part3(photos_df)
