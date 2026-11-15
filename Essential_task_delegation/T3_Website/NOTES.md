# T3 website: notes from the first read (15 Nov 2026)

What I understood from the brief and the files it lists, the contradictions I found, and the questions still open. Written at the end of Phase 0 and updated at the Phase 1 stop.

## 1. What I understood

- **The site's job:** in 30 seconds a judge knows what the system does; in 3 minutes they've clicked a building, seen its facts, and run the model on an image. It must beat last season's winner on the same three things (one look, results in motion, one interactive proof), plus a model running in the browser, traceable numbers and plainly stated limits.
- **The system is not one chain yet.** Each part was tested alone:
  - the damage map by two methods (find-then-grade, and the before-and-after U-Net), neither chosen;
  - the building table and counts, from the before-and-after U-Net's map;
  - the heatmap, from the after-image-only U-Net's map;
  - the offline guideline search;
  - the six reports, about DisasTeller's Wajima sample inputs, not our pairs;
  - the field model, the after-image-only U-Net in 8 bits.

  So the site names the model and the image set beside every number. The gallery pairs are the one place where map, table, counts and heatmap come from one model on the same pair.
- **What is settled:** the stack (Aryan's Vite, React 19, TypeScript, Tailwind 4 site as the base), static hosting on Vercel deployed by hand, the seven pages and their content, the data contract's shape, fixed question templates with no question box, the reports shown word for word with errors flagged, one facts file, and the hard rules of section 4.
- **What is mine to decide:** the page order and names, the three directions' design, the contract's details, and anything the brief leaves open. Those decisions are listed in the Phase 1 report.

## 2. Contradictions and problems found

### In the bridge (`Offline_RAG_KR2/disasteller_offline/disasteller_inputs.py`)

1. **A second missing-as-zero bug, not in the review.** `format_disaster_facts` reads each safe area with `sa.get("point_xy", [0, 0])` and `sa.get("dist_to_damage_px", 0)` (lines 109–111). The heatmap's file has neither key: its safe areas use `xy` and `distance_px` (`T1-results/T1-v3/hotspots.json`). So every safe area would print as "centroid at (x=0, y=0) … distance from rubble: 0 px". Hot spots are read with the right key.
2. **The known bug** (the review's §7): an image missing from the table returns 0 buildings with status "ok".
3. **It calls model estimates ground truth.** Its header line is `=== GROUND TRUTH DAMAGE FACTS FOR IMAGE … ===`, over counts that are a model's output.
4. **It hard-codes one model's name.** Line 83 prints "Building Counts (R11 Dual-Input U-Net)" whatever table it is given, so a find-then-grade table would be mislabelled. It also prints "T1 v3".

   The site will show `report_inputs.txt` word for word. So points 3 and 4 would put a wrong claim and bare internal labels on a public page, in a box labelled as the report writer's input.

### In the numbers

5. **The wireframes' damage colours fail the colour-vision rule.** Under simulated deuteranopia, damaged `#8a5a00` and destroyed `#b3261e` are 5 apart (CIE76); under protanopia, 20. The site uses `#13705d`, `#c07f00`, `#a3141f` on light surfaces and `#35c9a5`, `#ffc233`, `#ff5d52` on dark ones. Both sets pass in every simulation (`npm run palette`), and destroyed buildings are also hatched.
6. **Two counting scores for nearly the same thing.** The counting notebook gives 32.96% on 3,583 optical questions. The 11 Nov chain run re-scores the same table at 33.02% on 3,580 (three questions sit on two pairs with an unreadable image). The site shows 32.96% now. After 18 Nov both would be public: see question 3.
7. **The field model has no score on the clean pairs.**
   - The 8-bit model was scored on all 645 validation pairs without TTA: mean IoU 0.5363, destroyed IoU 0.2918.
   - The clean-pair anchors (0.2874 / 0.5402) are the full-precision model with TTA.
   - The browser will run the 8-bit model without TTA. So "its own numbers" for Try it are the 645-pair ones, which include the 40 leaked pairs. See question 4.
8. **The heatmap's 73.6% is on all 645 validation images,** leaked pairs included, and on the after-image-only U-Net's masks. The facts file says so.
9. **Two limitation numbers, traced to their sources.**
   - **"SAM 3 finds only 9% of destroyed buildings on the after image":** the SAM 3 results give 0.0894 (`E3-results/E3/README.md`, row `post_grid1`, all 645 pairs). It is the share of true destroyed-building pixels that SAM 3's outlines cover, with the whole after image in one pass. So it is a share of pixels, not of buildings. The facts file words it that way.
   - **"52% of pairs are shifted by more than 2 px":** the ledger's entry on Ridita's audit gives it on 2,966 measurable pairs (`Task_Ledger.md`, §9). The audit's own file isn't in the repository as text, so the link goes to the ledger. See question 5.
10. **A citation the model wasn't shown.** The report system's README says one of the Expert report's 11 citations, `[EMS98-rc-grade-5]`, is a real passage that the model was not given. The Reports page (Phase 2) will say that beside it.

### In the files

11. **A segmentation mask merges touching buildings.** In the Palu fixture, the table has 34 rows, and one "destroyed building" is a single region of 238,405 px covering a whole neighbourhood. One row is one connected region, not one real building, wherever buildings touch. This is part of why counts are weak, and the site's wording ("buildings found") overstates it for the U-Net methods. See question 6.
12. **The repository's name.** The brief's GitHub link (`SmashNdashH/CSE499A.15-Msrb-`) matches `git remote`, but a push on 15 Nov answered that the repository has moved to `SmashNdashH/CSE499A-B`, the name Aryan's review uses in §9. GitHub redirects the old address for now. The site's source links still use the brief's address: see question 10.
13. **Two sources aren't tracked by git yet:** `Champion_Task/E7-results/step2/README.md` and `step2b/README.md`. Only facts held back until 18 Nov link to them. `npm run facts` lists them on every build.

14. **xBD's original label files carry a ground resolution and coordinates (found 16 Nov).** A sample of 12 `*_post_disaster.json` files under `data/` gives `gsd` from 1.25 to 2.82 m per pixel and each building as a longitude/latitude polygon. DisasterM3's masks carry neither, and the Turkey pairs aren't from xBD. So "the dataset gives no ground resolution" holds for DisasterM3's files, not for xBD's. See question 12.
15. **The 7B's memory: two numbers, both right.** The design notes give 5.8 GB (§4.3) and 6.2 GB (§6). H2b's table measures both: 5.78 GB to hold the model in 4-bit and 6.17 GB at peak while answering. §4.3 now says which is which.

### Between instructions

16. **The progress tracker.** A standing rule says to update `Progress_Tracker.md` whenever a task starts or finishes; this brief says everything outside `T3_Website/` is read-only. I followed the brief, so the tracker has no T3 entry from me.
17. **Fixture photos.** The brief lists masks, heatmaps and overlays as fixture sources; none of them contains a photo, and a before/after slider needs two. xBD's original files for three of the validation pairs are on this PC under `data/`. I checked by eye that they line up with the DisasterM3 ground truth, and used them. They stay local: `fixtures/` is git-ignored.

## 3. Open questions

1. **The name.** *(The direction is answered: A, on 16 Nov.)* Is "Aftermap" the project's name, or another?
2. **The repeated "temporary command center" sentence.** The brief names it as made up in the Public community report. The same claim is in the Expert, Emergency team and Resource allocation reports. I flag it in all four. Say if it should be flagged only where the brief names it.
3. **After 18 Nov, which counting score leads:** 32.96% (3,583 questions) or 33.02% (3,580, with the count-error numbers beside it)?
4. **The field model's numbers on Try it:** the 645-pair, no-TTA scores of the 8-bit model (0.5363 / 0.2918), with a note that 40 of those pairs leaked? Or do you want the 8-bit model re-scored on the 605 clean pairs first?
5. **The 9%, as a limitation line.** The brief says "SAM 3 finds only 9% of destroyed buildings". The measurement is 9% of destroyed-building pixels. May the About page say "covers only 9% of the destroyed-building area"? And is there a file of Ridita's audit to link for the 52%, in place of the ledger?
6. **Wording for a table row** when the map comes from a U-Net: "building", as now, or "building region"? With find-then-grade each row is one SAM 3 outline, so "building" fits there.
7. **`report_inputs.txt`:** once the bridge is fixed, should its header and model line also change (problems 3 and 4), or should the site show the text as it is, with a note?
8. **The Vercel project:** its name, and whether you want a custom domain. The deploy steps in the README are written but not run: they need your Vercel login.
9. **Gallery method ids:** `before-after-unet` and `find-then-grade`, as in the contract. Rename now if you prefer others; later it means renaming folders.
10. **The address for source links.** *(Done 16 Nov: switched to `SmashNdashH/CSE499A-B`, where the repository now lives; one constant in `src/core/facts.ts`.)*
11. **Metres for xBD pairs?** xBD's label files give each tile's ground resolution (finding 14). For the xBD gallery pairs, the site could show distances and areas in metres beside pixels; the Turkey pairs would stay in pixels. That would change the brief's "never metres" rule, and needs a check that DisasterM3's xBD images are xBD's tiles unchanged. Yours to decide.
12. **Motion beyond the brief's rule.** Three React Bits components are in: a crosshair with live pixel coordinates on the map and rolling digits in the counts, because each shows something, and the contour background you chose. Most of that library is decorative (glitch text, sparks, shader backgrounds), which the brief rules out. Say if you want that rule relaxed.
