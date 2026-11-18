# The showcase website, in pictures

Screenshots of **Aftermap** (a working name), our project's showcase website. Its code is in [`T3_Website/`](../T3_Website/README.md). They were taken on 17 Nov 2026 from the built site running on one PC. The site isn't online yet and is still being built, so these show it as of that day.

**What the site shows.** Our system takes one satellite photo of a place from before a disaster and one from after. It marks every building as intact, damaged or destroyed, counts them, and marks where to search first, all with no internet. Every page ends with the same line: *a model's estimate, to be checked by people on the ground.*

**Real data, not mock-ups.**
- The maps show six image pairs from the validation set of DisasterM3, the dataset we train and test on. No model was trained on them.
- The damage maps on them are our models' real outputs, made by [t3-gallery-export.ipynb](../Champion_Task/t3-gallery-export.ipynb) ([its results and checks](../Champion_Task/T3-gallery-export-results/README.md)).
- Every number on the site links to the results file it comes from.
- Two exceptions to "our satellite pairs":
  - on **Try it**, a visitor brings their own photo (here, a gallery photo was loaded as a file);
  - the **six reports** are about the sample photos that come with DisasTeller, the published report system we run on our own model, not about our pairs.

Desktop views are 1,440 px wide, phone views 390 px. File names are numbered in the order of the site's menu.

## Words used below

| Word | What it means here |
|---|---|
| Before-and-after model | A U-Net (a network that labels every pixel) that reads the before-photo and the after-photo together |
| Find-then-grade | SAM 3 (a model that outlines objects) outlines each building on the before-photo; our grader compares each building's before and after crops and grades it |
| Field model | A lighter U-Net that reads only the after-photo, stored as 8-bit numbers (a 33 MB file) so it runs inside a web browser. It's the model on Try it |
| IoU | The overlap between the pixels a model marks as a class and the true pixels of that class: 0 is none, 1 is exact |
| Building table | One row per outlined building: its class, area, position and distance to the nearest destroyed building. Counts and answers come from fixed queries on it, never from a language model |
| Pixels, not metres | The dataset gives no ground scale, so every area and distance on the site is in pixels |

## Contents

1. [Home](#home): 01
2. [How it works](#how-it-works): 02–08
3. [Explore, the building map](#explore-the-building-map): 09–30
4. [Try it](#try-it): 31
5. [Results, Reports and About](#results-reports-and-about): 32–34
6. [On a phone](#on-a-phone): 35–43
7. [How these were taken](#how-these-were-taken)

## Home

![The home page](01_home.jpg)

**01 · Home.** The opening screen, with links to the other pages under it.
- The picture is the Santa Rosa wildfire pair. Drag the round handle, or the slider under it, to swipe between the before-photo and the after-photo. The switch turns the damage map off.
- The outlines are the before-and-after model's damage map: green intact, yellow damaged, red destroyed. Destroyed buildings are also hatched, so the classes stay apart for colour-blind readers.

## How it works

One scrolling story. The same pair stays pinned on the right and changes at each of the seven steps. Each step says what does it ("Done by": a model, or plain code), and its number links to the file it was measured in. The text at the top of each picture is the end of the previous step, scrolling away.

![How it works, step 1](02_how-it-works_step1_two-photos.jpg)

**02 · Step 1, two photos of the same place.** The inputs, with no model yet. 605 of the 645 validation pairs are used for testing; the other 40 share images with training and are left out.

![How it works, step 2](03_how-it-works_step2_every-building-gets-a-class.jpg)

**03 · Step 2, every building gets a class.** The damage map appears. The text names both ways we make it, find-then-grade and the before-and-after model, says we haven't chosen between them yet, and gives each one's score on destroyed buildings.

![How it works, step 3](04_how-it-works_step3_each-building-becomes-a-row.jpg)

**04 · Step 3, each building becomes a row.** One building is picked out (the one nearest the middle), and its row of the table is shown under the picture: number, class, area, and distance to the nearest destroyed building.

![How it works, step 4](05_how-it-works_step4_counts-come-from-the-table.jpg)

**05 · Step 4, counts come from the table.** The counts under the picture are fixed queries on the table. The step also says that counting is still weak: about a third of the benchmark's counting questions come out right.

![How it works, step 5](06_how-it-works_step5_where-to-look-first.jpg)

**06 · Step 5, where to look first.** The danger heatmap (purple) shows where damage is densest. Circles 1–3 are hot spots; squares S1–S3 are safe areas, the open ground farthest from any damage. It guides where to search first. It doesn't detect survivors.

![How it works, step 6](07_how-it-works_step6_what-the-guidelines-say.jpg)

**07 · Step 6, what the guidelines say.** An offline search over the response guidelines we collected (Sphere, INSARAG and others). The picture fades, because this step isn't about the pair.

![How it works, step 7](08_how-it-works_step7_six-reports-written-offline.jpg)

**08 · Step 7, six reports, written offline.** Our fine-tuned language model writes six reports for different teams. The picture stays faded, and the caption says why: this step isn't connected to our damage maps yet.

## Explore, the building map

The main page:
- **the top row** picks one of the six pairs and one of the two methods;
- **the left panel** holds the layers and the list of buildings;
- **the middle** is the map;
- **the right panel** holds the facts and the fixed questions.

Each outline on the map is one row of the building table.

![Explore as it opens](09_explore.jpg)

**09 · Explore.** The page as it opens: the Santa Rosa pair, with the before-and-after model.
- The right panel already shows this image's IoU per class. The gallery pairs come from the validation set, so the truth is known.
- Under the map are the counts, and a button that saves the map as a picture carrying the model's name and the decision-support line.

<img src="10_explore_hover-a-building.jpg" alt="Hovering a building" width="480">

**10 · Hover a building.** A label gives its number, class, area and distance to the nearest destroyed building. The crosshair lines and corner marks show which outline it is.

![A building selected](11_explore_click-a-building.jpg)

**11 · Click a building.** It gets a white outline. The right panel shows its facts: class, area, the nearest destroyed building, its centre and its bounding box, with a button that hides its outline.

![The destroyed count pressed](12_explore_count-highlights-destroyed.jpg)

**12 · Press a count.** "39 destroyed" lights up those 39 buildings and dims the rest.

![A fixed question answered](13_explore_fixed-question-and-its-query.jpg)

**13 · Ask a fixed question.** There's no box to type in: each question was written and checked by hand.
- Here: how many intact buildings are within 100 px of a destroyed one? 14, highlighted on the map, with the query itself shown under the answer.
- The panel says why the questions are fixed: when a language model wrote its own query for this question, it answered 33,880 for one image, because its query never filtered by image.

<img src="14_explore_find-a-building-by-number.jpg" alt="Searching the building list" width="250"> <img src="15_explore_hide-one-outline.jpg" alt="One outline hidden" width="250">

**14 · Find a building by its number.** Typing "1" keeps the 56 buildings whose number starts with 1. Letters are ignored.

**15 · Hide one outline.** The eye button hides a building on the map. The counts don't change, and the panel says so: hidden buildings still count, and a saved picture still draws them.

![The layers panel folded](16_explore_layers-panel-folded.jpg)

**16 · Fold a panel.** The layers panel folds into a tab at the left edge; "Show" brings it back.

![The map zoomed in](17_explore_zoomed-in.jpg)

**17 · Zoom in.** The map zoomed in, with a building's label kept inside the frame. The map can also be dragged.

<img src="18_explore_3d-damage-city.jpg" alt="The 3D damage city" width="480">

**18 · 3D damage city.** The same buildings, raised into blocks; the slider turns the view. The page labels it "a 3D view of our 2D results, not a reconstruction". No heights are measured: a block's height only repeats its class, with intact tallest, damaged lower and destroyed almost flat.

![Hot spots and safe areas](19_explore_layer_hot-spots-and-safe-areas.jpg)

**19 · Layer: hot spots and safe areas.** As in How it works step 5, on the map: circles 1–3 for hot spots, squares S1–S3 for safe areas.

![The danger heatmap](20_explore_layer_danger-heatmap.jpg)

**20 · Layer: danger heatmap.** Purple where damage is densest.

![The ground truth](21_explore_layer_ground-truth.jpg)

**21 · Layer: ground truth.** The dataset's own labels, filled in, under the model's outlines. Where a filled shape has no outline, or the colours differ, the model is wrong.

![Find-then-grade on the same pair](22_explore_method_find-then-grade.jpg)

**22 · The other method: find-then-grade,** on the same pair.
- It finds 245 buildings where the before-and-after model finds 144. SAM 3 outlines houses one by one, while the U-Net's outlines often join touching houses into one (compare the long outlines in 11).
- On this image its destroyed-building IoU is 0.762, against 0.752.

### 23–28 · The six pairs

One pair per disaster type, each shown with the before-and-after model. The rule that picked them was fixed before anyone looked at the maps:
- from the 605 validation pairs that don't share images with training, those with at least 5,000 truly destroyed pixels;
- one event per disaster type;
- in each event, the pair with the event's median score on destroyed buildings. So each map is a typical result, not the best.

That's why some maps miss every destroyed building:

| | Event | Buildings found (before-and-after model) | Destroyed IoU, before-and-after model | Destroyed IoU, find-then-grade |
|---|---|---|---|---|
| 23 | Hurricane Harvey | 52 | 0.000 | 0.000 |
| 24 | Midwest flooding | 8 | 0.000 | 0.000 |
| 25 | Moore tornado | 21 | 0.659 | 0.531 |
| 26 | Palu tsunami | 107 | 0.277 | 0.314 |
| 27 | Santa Rosa wildfire | 144 | 0.752 | 0.762 |
| 28 | Turkey earthquake | 42 | 0.000 | 0.460 |

Source: [the gallery export's results](../Champion_Task/T3-gallery-export-results/README.md).

| | | |
|---|---|---|
| <img src="23_explore_event_hurricane-harvey.jpg" alt="Hurricane Harvey" width="260"><br>**23 · Hurricane Harvey** | <img src="24_explore_event_midwest-flooding.jpg" alt="Midwest flooding" width="260"><br>**24 · Midwest flooding** | <img src="25_explore_event_moore-tornado.jpg" alt="Moore tornado" width="260"><br>**25 · Moore tornado** |
| <img src="26_explore_event_palu-tsunami.jpg" alt="Palu tsunami" width="260"><br>**26 · Palu tsunami** | <img src="27_explore_event_santa-rosa-wildfire.jpg" alt="Santa Rosa wildfire" width="260"><br>**27 · Santa Rosa wildfire** | <img src="28_explore_event_turkey-earthquake.jpg" alt="Turkey earthquake" width="260"><br>**28 · Turkey earthquake** |

- **Harvey and the Midwest flooding:** the model marks some buildings damaged and none destroyed, while the truth has destroyed buildings in both pairs. In the Midwest pair, every true building is destroyed.
- **Turkey:** the only pair that isn't from xBD, the building-damage dataset most of DisasterM3's validation pairs come from. Its photos are taken at an angle, and part of the before-photo is empty (the black wedge).

![The six offline reports](29_explore_panel_six-offline-reports.jpg)

**29 · The six offline reports** (the button at the top right).
- The six reports, one tab per team, word for word.
- Known errors are marked in the text, with a wavy underline and a numbered note, but the text itself is never edited.
- Only the Expert team report cites guideline passages in square brackets.

![The benchmark panel](30_explore_panel_benchmark.jpg)

**30 · Benchmark** (the other button at the top right). The main numbers in one table:
- the damage map by three models on the same 605 validation pairs;
- our fine-tuned language model on the benchmark's six multiple-choice tasks.

## Try it

![Try it, with a result](31_try-it_result.jpg)

**31 · Try it.** The field model runs inside the browser on a photo the visitor picks, and the photo never leaves the device.
- The page first says what runs and how good it is, including that it isn't our best map.
- Here the photo is the Moore tornado pair's after-photo, loaded as a file, so the page treats it as "your own image". The model took 3.6 s on this PC.
- The result opens in the same workspace as Explore, without a score: a photo you bring has no ground truth.
- "Download the raw mask" gives one value per pixel, for other software.

## Results, Reports and About

![The Results page](32_results.jpg)

**32 · Results, "What we measured".** Every number, each linking to its source file. Each part of the system was tested on its own, with its own model and images, so the page warns that these aren't one system's score.

![The Reports page](33_reports.jpg)

**33 · Reports.** One report in full, from top to bottom:
- the report, with its known errors marked and explained in numbered notes;
- the guideline passages the system gave it;
- each citation beside the passage it cites;
- the checks that the run stayed offline. All passed: the only connections were to the model's own server on the same machine.

![The About page](34_about.jpg)

**34 · About, "What it can't do yet".**
- the known limits;
- ideas we haven't built, each described in words only, so none can be mistaken for a result;
- the team;
- what the site is built on.

## On a phone

| | | |
|---|---|---|
| <img src="35_phone_home.jpg" alt="Home on a phone" width="240"><br>**35 · Home** | <img src="36_phone_how-it-works_step5.jpg" alt="How it works on a phone" width="240"><br>**36 · How it works, step 5** | <img src="37_phone_explore.jpg" alt="Explore on a phone" width="240"><br>**37 · Explore** |
| <img src="38_phone_results.jpg" alt="Results on a phone" width="240"><br>**38 · Results** | <img src="39_phone_reports.jpg" alt="Reports on a phone" width="240"><br>**39 · Reports** | <img src="40_phone_about.jpg" alt="About on a phone" width="240"><br>**40 · About** |

- On a phone, the panels stack under the map.
- On How it works, the picture stays pinned at the top while the text scrolls under it.
- No page is wider than the screen; the site's browser check fails if one is.

Whole pages on a phone (long images):
- [41 · Home](41_phone_home_full-page.jpg)
- [42 · Explore](42_phone_explore_full-page.jpg): the layers panel and the facts panel under the map
- [43 · Try it, with a result](43_phone_try-it_result_full-page.jpg)

## How these were taken

- **Headless Chrome on the built site** (`npm run build`, then `npm run preview`), at 1,440 × 900 for desktop and 390 × 844 for phone.
- **Most come from the site's own browser check,** [scripts/browser-check.ts](../T3_Website/scripts/browser-check.ts). It also checks that nothing loads from outside the PC.
- **The rest were taken the same way for this folder,** with no request leaving the PC either: the How it works steps, the layers, the second method, the six pairs and the two panels.
- **The floating menu bar was hidden** in views of the workspace alone (10–13, 16, 18–28), because it would cover the top of the panels.
- **Saved as JPEG** (quality 88), to keep the folder small.
- **This folder used to hold the first wireframes** (4 Nov): a clickable sketch with sample numbers. The real site replaced them, so they were removed on 18 Nov. They're still in the history:

  ```
  git show ffc9c9968:Wireframes/index.html > wireframes_4nov.html
  ```
