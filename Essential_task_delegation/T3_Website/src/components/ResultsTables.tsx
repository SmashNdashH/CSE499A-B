// The benchmark numbers, each read from the facts file and linked to its results file.
// A fact that isn't public yet is absent from the build, so every block copes with a missing fact.
import type { ReactNode } from 'react';
import { fact, sourceUrl, type Fact } from '../core/facts.ts';

/** A number from the facts file, linked to its source. Renders nothing if the fact isn't in this build. */
export function Num({ id }: { id: string }) {
  const f = fact(id);
  return f ? <a className="fact" href={sourceUrl(f.source)} title={`${f.measures}. Measured on: ${f.image_set}. Model: ${f.model}.`}>{f.display}</a> : null;
}

/** "Measured on ... Source: file" under a number. */
export function Provenance({ id, children }: { id: string; children?: ReactNode }) {
  const f = fact(id);
  if (!f) return null;
  return (
    <span className="prov">
      Measured on: {f.image_set}. {children}Source: <a href={sourceUrl(f.source)}>{f.source.split('/').slice(-3).join('/')}</a>
    </span>
  );
}

/** A fact's own sentence, with its linked number in place of {value}. Nothing if the fact isn't in this build. */
export function Note({ id }: { id: string }) {
  const f = fact(id);
  if (!f?.note) return null;
  const [before, after] = f.note.split('{value}');
  return <> {before}{after !== undefined && <Num id={id} />}{after}</>;
}

// Facts that become public later. Until then the build holds neither their values nor their
// wording (both live in the facts file); only these ids are in the code.
const LATER =['test_ftg_destroyed_iou', 'test_ftg_miou', 'test_pair_unet_destroyed_iou', 'test_pair_unet_miou', 'no_image_rule'];

export function DamageMapTable() {
  const testRows = fact(LATER[0]) && fact(LATER[2]);
  return (
    <figure className="res-figure">
      <table className="res-table">
        <caption>The damage map, by three models, on the same 605 validation pairs</caption>
        <thead>
          <tr><th scope="col">Method</th><th scope="col">Destroyed-building IoU</th><th scope="col">Mean IoU</th></tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Find-then-grade<small>SAM 3 outlines each building on the before image; our grader compares its before and after crops</small></th>
            <td><Num id="ftg_destroyed_iou_clean" /><small>mean of three graders: <Num id="ftg_seed_scores" /></small></td>
            <td><Num id="ftg_miou_clean" /></td>
          </tr>
          <tr>
            <th scope="row">Before-and-after model<small>a U-Net that reads both images together and labels every pixel</small></th>
            <td><Num id="pair_unet_destroyed_iou_clean" /></td>
            <td><Num id="pair_unet_miou_clean" /></td>
          </tr>
          <tr>
            <th scope="row">Field model, at full precision<small>a lighter U-Net that reads only the after image</small></th>
            <td><Num id="field_unet_destroyed_iou_clean" /></td>
            <td><Num id="field_unet_miou_clean" /></td>
          </tr>
        </tbody>
        {testRows && (
          <tbody>
            <tr className="res-sub"><th scope="rowgroup" colSpan={3}><Note id={LATER[0]} /></th></tr>
            <tr><th scope="row">Find-then-grade</th><td><Num id={LATER[0]} /></td><td><Num id={LATER[1]} /></td></tr>
            <tr><th scope="row">Before-and-after model</th><td><Num id={LATER[2]} /></td><td><Num id={LATER[3]} /></td></tr>
          </tbody>
        )}
      </table>
      <figcaption>
        IoU (intersection over union) is the overlap between the pixels a model marks and the true pixels, from 0 to 1. Mean IoU averages it over background, intact, damaged and destroyed.
        The validation set has 645 pairs; 40 share images with training and are left out. Both U-Nets average their predictions over 8 flipped and rotated views.
        Which of the first two methods the system keeps is still open: on these validation pairs, find-then-grade is ahead on destroyed buildings and the before-and-after model on the mean.
      </figcaption>
    </figure>
  );
}

const TASKS: [string, string, string, string][] = [
  ['DTR', 'vlm_dtr_ours', 'Disaster Type Recognition', 'which kind of disaster happened'],
  ['BBR', 'vlm_bbr_ours', 'Disaster Bearing Bodies Recognition', 'which kinds of objects were damaged'],
  ['BDC', 'vlm_bdc_ours', 'Building Damage Counting', 'how many intact, damaged or destroyed buildings'],
  ['DRE', 'vlm_dre_ours', 'Road Damage Counting', 'what share of the image is intact or damaged road'],
  ['DSR', 'vlm_dsr_ours', 'Disaster Scene Recognition', 'which land-use types the scene has'],
  ['ORR', 'vlm_orr_ours', 'Relational Reasoning', 'how two boxed objects relate in space'],
];

export function SixTasksTable() {
  const paper = fact('vlm_paper_columns') as (Fact & { value: Record<string, [number, number]> }) | undefined;
  if (!paper) return null;
  return (
    <figure className="res-figure">
      <table className="res-table">
        <caption>Our fine-tuned language model on the benchmark's six multiple-choice tasks (% answered right)</caption>
        <thead>
          <tr><th scope="col">Task</th><th scope="col">Ours</th><th scope="col">Base model (paper)</th><th scope="col">Paper's fine-tune</th></tr>
        </thead>
        <tbody>
          {TASKS.map(([code, id, name, asks]) => (
            <tr key={code}>
              <th scope="row">{name}<small>{asks}</small></th>
              <td><Num id={id} /></td>
              <td><a className="fact" href={sourceUrl(paper.source)}>{paper.value[code][0]}%</a></td>
              <td><a className="fact" href={sourceUrl(paper.source)}>{paper.value[code][1]}%</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption>
        Ours is Qwen2.5-VL-7B fine-tuned on DisasterM3, scored at full image size on {paper.image_set}. The other two columns are the DisasterM3 paper's own numbers for the same base model and for its fine-tune.
        Ours is behind the base model on building counting, which is why counts on this site come from the building table.
      </figcaption>
    </figure>
  );
}

export function OtherParts() {
  const proof = fact('proof_run') as (Fact & { value: Record<string, number> }) | undefined;
  return (
    <ul className="res-parts">
      {fact('table_counting_accuracy') && (
        <li>
          <h3>Counts from the building table</h3>
          <p><Num id="table_counting_accuracy" /> of the benchmark's counting questions answered right, against <Num id="base_counting_accuracy" /> for the base language model. About a third: building counts are still weak.
            <Note id={LATER[4]} /></p>
          <Provenance id="table_counting_accuracy" />
        </li>
      )}
      {fact('hotspot_point_on_damage') && (
        <li>
          <h3>The survivability heatmap</h3>
          <p><Num id="hotspot_point_on_damage" /> of its hot spots have their marked point within 20 px of a building that is damaged or destroyed in the ground truth.</p>
          <Provenance id="hotspot_point_on_damage" />
        </li>
      )}
      {fact('guideline_retrieval') && (
        <li>
          <h3>The offline guideline search</h3>
          <p><Num id="guideline_retrieval" /> test questions answered from the response guidelines with no internet. 24 were needed to pass, a bar fixed before the test.</p>
          <Provenance id="guideline_retrieval" />
        </li>
      )}
      {fact('field_model_size') && (
        <li>
          <h3>The field model</h3>
          <p><Num id="field_model_size" />, <Num id="field_model_cpu_time" /> per image on a CPU: <Num id="field_model_speedup" /> as fast as the full-precision model, for a destroyed-building IoU drop of <Num id="field_model_iou_drop" />. It reads only the after image, so it is the lighter path, not our best map.</p>
          <Provenance id="field_model_cpu_time" />
        </li>
      )}
      {proof && (
        <li>
          <h3>The reports</h3>
          <p>On 11 Nov our fine-tuned language model wrote all {proof.value.reports} reports with the internet off, after {proof.value.searches} guideline searches. They are about DisasTeller's sample photos from Wajima, Japan, not our satellite pairs, and their quality hasn't been judged yet.</p>
          <Provenance id="proof_run" />
        </li>
      )}
    </ul>
  );
}
