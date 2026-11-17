// How it works, told by scrolling. One real pair stays pinned while the steps pass beside it,
// and the pinned picture changes at each step: photos, damage map, one table row, counts, heatmap.
// The motion is the explanation: each step adds exactly what that part of the system adds.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Building } from '../types/disaster.ts';
import { CLASS_IDS, CLASS_NAMES } from '../types/disaster.ts';
import type { PaletteId } from '../core/palette.ts';
import { countsByClass } from '../core/queries.ts';
import { fact, type Fact } from '../core/facts.ts';
import { METHOD_LABELS, prettyEvent, useGalleryIndex, useMethodData } from '../core/useGallery.ts';
import { DEFAULT_LAYERS, OfflineCanvas, type Layers } from './OfflineCanvas.tsx';
import { Num, Provenance } from './ResultsTables.tsx';

const NO_LAYERS: Layers = { classes: { 1: false, 2: false, 3: false }, spots: false, heat: false, truth: false };
const HEAT_LAYERS: Layers = { ...DEFAULT_LAYERS, spots: true, heat: true };

interface Step {
  title: string;
  body: ReactNode;
  /** Who or what does this step, in plain words. */
  model: ReactNode;
  number: ReactNode;
}

export function ChainStory({ palette }: { palette: PaletteId }) {
  const index = useGalleryIndex();
  const pair = index?.pairs.find((p) => p.info.hero) ?? index?.pairs.find((p) => p.has_before && p.has_after) ?? index?.pairs[0] ?? null;
  const method = pair?.methods[0] ?? null;
  const state = useMethodData(pair?.id ?? null, method?.id ?? null);
  const data = state.status === 'ready' ? state.data : null;
  const [step, setStep] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  // The step whose block crosses the middle of the screen is the one the pinned picture shows.
  useEffect(() => {
    // On a narrow screen the picture is pinned over the top half, so the line sits lower.
    const line = window.matchMedia('(min-width: 900px)').matches ? 50 : 78;
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setStep(Number((e.target as HTMLElement).dataset.step));
    }, { rootMargin: `-${line}% 0px -${100 - line}% 0px` });
    items.current.forEach((el) => el && seen.observe(el));
    return () => seen.disconnect();
  }, [pair?.id]);

  // The example row: the building nearest the middle of the image.
  const cx = (pair?.info.width ?? 0) / 2;
  const cy = (pair?.info.height ?? 0) / 2;
  const example = useMemo<Building | null>(() => {
    if (!data) return null;
    return data.buildings.reduce<Building | null>((best, b) => (!best || Math.hypot(b.centroid_x - cx, b.centroid_y - cy) < Math.hypot(best.centroid_x - cx, best.centroid_y - cy) ? b : best), null);
  }, [data, cx, cy]);
  const exampleSet = useMemo(() => (example ? new Set([example.building_id]) : null), [example]);

  if (!index) return <p className="ws-note ws-loading">Loading the gallery.</p>;
  if (!pair || !method) return <p className="ws-missing">This build has no gallery pair yet, so the steps can't be shown on one.</p>;

  const methodLabel = (METHOD_LABELS[method.id] ?? method.id).toLowerCase();
  const counts = data ? countsByClass(data.buildings) : null;
  const proof = fact('proof_run') as (Fact & { value: Record<string, number> }) | undefined;
  const onThisPair = <>On this pair the map is the output of the {methodLabel}{index.fixture && ' (a development fixture)'}.</>;

  const steps: Step[] = [
    {
      title: 'Two photos of the same place',
      body: <>One satellite photo from before the disaster and one from after. This pair is from the {prettyEvent(pair.info.event)}, in the DisasterM3 dataset's validation set.</>,
      model: 'No model yet: these are the inputs.',
      number: <><Num id="validation_pairs" /> validation pairs are used for testing. The rest share images with training and are left out. <Provenance id="validation_pairs" /></>,
    },
    {
      title: 'Every building gets a class',
      body: <>The damage map marks each building intact, damaged or destroyed. We have two ways to make it, and haven't chosen between them yet. {onThisPair}</>,
      model: 'Either find-then-grade (SAM 3, a model that outlines objects, finds each building on the before photo, and our grader compares its before and after crops), or a U-Net (a network that labels every pixel) that reads both photos together.',
      number: <>Overlap with the true destroyed buildings (IoU, from 0 to 1): <Num id="ftg_destroyed_iou_clean" /> for find-then-grade and <Num id="pair_unet_destroyed_iou_clean" /> for the U-Net.{data?.accuracy.iou.destroyed != null && <> The map shown on this image scores {data.accuracy.iou.destroyed.toFixed(3)}.</>} <Provenance id="ftg_destroyed_iou_clean" /></>,
    },
    {
      title: 'Each building becomes a row',
      body: <>Every outlined region of at least 20 pixels becomes one row of a table: its class, its area, where it is, and how far it is from the nearest destroyed building. Distances are in pixels, because the dataset gives no ground scale.</>,
      model: 'No model: plain code reads the damage map.',
      number: <>The table built for the benchmark has <Num id="table_size" />. <Provenance id="table_size" /></>,
    },
    {
      title: 'Counts come from the table',
      body: <>How many buildings are destroyed? The answer is a fixed query on the table, never a language model's guess. Counting is still weak: about a third of the benchmark's counting questions come out right.</>,
      model: 'No model: fixed, hand-checked queries.',
      number: <><Num id="table_counting_accuracy" /> of the benchmark's counting questions right, against <Num id="base_counting_accuracy" /> for the base language model. <Provenance id="table_counting_accuracy" /></>,
    },
    {
      title: 'Where to look first',
      body: <>The danger heatmap shows where damage is densest, with up to three hot spots (circles) and the open ground farthest from any damage (squares, called safe areas). It is a guide to where to search first. It doesn't detect survivors.</>,
      model: 'No model: a density map computed from the damage map.',
      number: <><Num id="hotspot_point_on_damage" /> of hot spots have their marked point within 20 px of a building that is truly damaged or destroyed. <Provenance id="hotspot_point_on_damage" /></>,
    },
    {
      title: 'What the guidelines say',
      body: <>An offline search finds the passages of the response guidelines we collected (Sphere, INSARAG and others) that fit the situation, with no internet.</>,
      model: 'An offline search over the guideline texts, by meaning and by keywords.',
      number: <><Num id="guideline_retrieval" /> test questions answered from the right passage; 24 were needed to pass. <Provenance id="guideline_retrieval" /></>,
    },
    {
      title: 'Six reports, written offline',
      body: <>Our fine-tuned language model writes six reports for different teams, using the guideline passages. <b>This step isn't connected to our damage maps yet.</b> The reports written so far are about a published system's own sample photos from Wajima, Japan, and their quality hasn't been judged.</>,
      model: 'Our fine-tuned Qwen2.5-VL-7B, inside DisasTeller.',
      number: proof ? <>{proof.value.reports} reports and {proof.value.sections} sections written with the internet off, after {proof.value.searches} guideline searches. <Provenance id="proof_run" /></> : null,
    },
  ];

  const layers = step === 0 ? NO_LAYERS : step === 4 ? HEAT_LAYERS : DEFAULT_LAYERS;
  const detached = step >= 5; // the last two steps aren't about this pair

  return (
    <div className="story">
      <div className={`story-stage${detached ? ' is-detached' : ''}`}>
        <OfflineCanvas pair={pair} methodId={method.id} buildings={data?.buildings ?? null} hotspots={data?.hotspots ?? null} palette={palette}
          layers={layers} switches position={step === 0 ? 50 : 0} highlight={step === 2 ? exampleSet : null} selectedId={step === 2 ? example?.building_id ?? null : null}
          label={`The ${prettyEvent(pair.info.event)} pair, shown at step ${step + 1} of ${steps.length}: ${steps[step].title}`} />
        <div className="story-readout" aria-hidden="true">
          {step === 0 && <p>Drag the slider to compare the two photos.</p>}
          {step === 1 && <p>{onThisPair}</p>}
          {step === 2 && (example ? (
            <dl>
              <div><dt>Building</dt><dd className="num">{example.building_id}</dd></div>
              <div><dt>Class</dt><dd><span className={`swatch swatch-${example.class_id}`} />{CLASS_NAMES[example.class_id]}</dd></div>
              <div><dt>Area</dt><dd className="num">{example.area_px.toLocaleString('en')} px</dd></div>
              <div><dt>Nearest destroyed</dt><dd className="num">{example.dist_to_nearest_destroyed_px === null ? 'none other' : `${example.dist_to_nearest_destroyed_px} px`}</dd></div>
            </dl>
          ) : <p>No building table for this pair.</p>)}
          {step === 3 && (counts ? (
            <dl>
              {CLASS_IDS.map((c) => <div key={c}><dt><span className={`swatch swatch-${c}`} />{CLASS_NAMES[c]}</dt><dd className="num">{counts[c]}</dd></div>)}
            </dl>
          ) : <p>No counts: this pair has no building table. Missing is not zero.</p>)}
          {step === 4 && (data ? <p>{data.hotspots.hot_spots.length} hot spot{data.hotspots.hot_spots.length === 1 ? '' : 's'} and {data.hotspots.safe_areas.length} safe area{data.hotspots.safe_areas.length === 1 ? '' : 's'} marked on this image.</p> : <p>No heatmap for this pair.</p>)}
          {detached && <p>This step isn't about this pair. It is shown faded because the link from our maps to the reports isn't built yet.</p>}
        </div>
      </div>
      <ol className="story-steps">
        {steps.map((s, i) => (
          <li key={s.title} data-step={i} ref={(el) => { items.current[i] = el; }} className={i === step ? 'is-current' : undefined}>
            <span className="story-n num">{i + 1} of {steps.length}</span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <p className="story-model"><b>Done by:</b> {s.model}</p>
            {s.number && <p className="story-number">{s.number}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}
