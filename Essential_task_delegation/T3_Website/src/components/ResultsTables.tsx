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

const DAMAGE_MAP_NOTE = (
  <>
    IoU (intersection over union) is the overlap between the pixels a model marks and the true pixels, from 0 to 1. Mean IoU averages it over background, intact, damaged and destroyed.
    The validation set has 645 pairs; 40 share images with training and are left out. Both U-Nets average their predictions over 8 flipped and rotated views.
    Which of the first two methods the system keeps is still open: on these validation pairs, find-then-grade is ahead on destroyed buildings and the before-and-after model on the mean.
  </>
);

/** `bare` leaves out the note underneath, for when the table sits under its chart. */
export function DamageMapTable({ bare }: { bare?: boolean }) {
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
            <th scope="row">After-photo model, at full precision<small>a lighter U-Net that reads only the after image</small></th>
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
      {!bare && <figcaption>{DAMAGE_MAP_NOTE}</figcaption>}
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

type PaperColumns = Fact & { value: Record<string, [number, number]> };
const sixTasksNote = (paper: PaperColumns) => (
  <>
    Ours is Qwen2.5-VL-7B fine-tuned on DisasterM3, scored at full image size on {paper.image_set}. The other two columns are the DisasterM3 paper's own numbers for the same base model and for its fine-tune.
    Ours is behind the base model on building counting, which is why counts on this site come from the building table.
  </>
);

export function SixTasksTable({ bare }: { bare?: boolean }) {
  const paper = fact('vlm_paper_columns') as PaperColumns | undefined;
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
      {!bare && <figcaption>{sixTasksNote(paper)}</figcaption>}
    </figure>
  );
}

// ---- The same numbers as charts. Every bar ends in its linked number, so each one still leads to
// its results file; the table stays one click away under each chart. Colours: one blue where a
// chart has one series; blue, orange and aqua (a set checked for colour-blind separation on this
// surface) where it has three. The damage colours are never used here: they mean building classes.

function Bar({ value, max, series = 1, children }: { value: number; max: number; series?: 1 | 2 | 3; children: ReactNode }) {
  return (
    <div className="bar-track">
      <span className={`bar bar-s${series}`} style={{ inlineSize: `${Math.min(100, (value / max) * 100)}%` }} />
      <span className="bar-value">{children}</span>
    </div>
  );
}

/** A horizontal bar for one fact, on a scale from 0 to max. Nothing if the fact isn't in this build. */
function FactBar({ id, max }: { id: string; max: number }) {
  const f = fact(id);
  return f && typeof f.value === 'number' ? <Bar value={f.value} max={max}><Num id={id} /></Bar> : null;
}

const METHODS: [string, string, string, string][] = [
  ['Find-then-grade', 'SAM 3 outlines each building on the before image; our grader compares its before and after crops', 'ftg_destroyed_iou_clean', 'ftg_miou_clean'],
  ['Before-and-after model', 'a U-Net that reads both images together and labels every pixel', 'pair_unet_destroyed_iou_clean', 'pair_unet_miou_clean'],
  ['After-photo model, at full precision', 'a lighter U-Net that reads only the after image', 'field_unet_destroyed_iou_clean', 'field_unet_miou_clean'],
];

function IouPanel({ title, rows }: { title: string; rows: [string, string, string][] }) {
  return (
    <div className="bar-panel">
      <h3>{title}</h3>
      {rows.map(([name, how, id]) => (
        <div key={id} className="bar-row">
          <div className="bar-label">{name}{how && <small>{how}</small>}</div>
          <FactBar id={id} max={1} />
        </div>
      ))}
      <div className="bar-axis" aria-hidden="true"><span>0 (no overlap)</span><span>0.5</span><span>1 (exact)</span></div>
    </div>
  );
}

export function DamageMapChart() {
  const testRows = fact(LATER[0]) && fact(LATER[2]);
  return (
    <figure className="res-figure">
      <h2 className="res-title">The damage map, by three models, on the same 605 validation pairs</h2>
      <div className="bar-panels">
        <IouPanel title="Destroyed-building IoU" rows={METHODS.map(([name, how, destroyed]) => [name, how, destroyed])} />
        <IouPanel title="Mean IoU over all four classes" rows={METHODS.map(([name, how, , mean]) => [name, how, mean])} />
      </div>
      <p className="bar-aside">Find-then-grade is the mean of three graders: <Num id="ftg_seed_scores" />.</p>
      {testRows && (
        <>
          <p className="bar-sub"><Note id={LATER[0]} /></p>
          <div className="bar-panels">
            <IouPanel title="Destroyed-building IoU" rows={[['Find-then-grade', '', LATER[0]], ['Before-and-after model', '', LATER[2]]]} />
            <IouPanel title="Mean IoU over all four classes" rows={[['Find-then-grade', '', LATER[1]], ['Before-and-after model', '', LATER[3]]]} />
          </div>
        </>
      )}
      <figcaption>{DAMAGE_MAP_NOTE}</figcaption>
      <details className="res-details"><summary>Show these numbers as a table</summary><DamageMapTable bare /></details>
    </figure>
  );
}

export function SixTasksChart() {
  const paper = fact('vlm_paper_columns') as PaperColumns | undefined;
  if (!paper) return null;
  const link = (v: number) => <a className="fact" href={sourceUrl(paper.source)} title={`From the DisasterM3 paper. Measured on: ${paper.image_set}.`}>{v}%</a>;
  return (
    <figure className="res-figure">
      <h2 className="res-title">Our fine-tuned language model on the benchmark's six multiple-choice tasks (% answered right)</h2>
      <ul className="bar-legend">
        <li><span className="bar-key bar-s1" />Ours</li>
        <li><span className="bar-key bar-s2" />Base model (paper)</li>
        <li><span className="bar-key bar-s3" />Paper's fine-tune</li>
      </ul>
      <div className="bar-tasks">
        {TASKS.map(([code, id, name, asks]) => {
          const ours = fact(id);
          return (
            <div key={code} className="bar-panel">
              <h3>{name}<small>{asks}</small></h3>
              <div className="bar-row bar-row-tight"><div className="bar-label">Ours</div>{ours && typeof ours.value === 'number' && <Bar value={ours.value} max={100} series={1}><Num id={id} /></Bar>}</div>
              <div className="bar-row bar-row-tight"><div className="bar-label">Base model</div><Bar value={paper.value[code][0]} max={100} series={2}>{link(paper.value[code][0])}</Bar></div>
              <div className="bar-row bar-row-tight"><div className="bar-label">Paper's fine-tune</div><Bar value={paper.value[code][1]} max={100} series={3}>{link(paper.value[code][1])}</Bar></div>
            </div>
          );
        })}
      </div>
      <p className="bar-aside">Every bar runs from 0% to 100% of the questions.</p>
      <figcaption>{sixTasksNote(paper)}</figcaption>
      <details className="res-details"><summary>Show these numbers as a table</summary><SixTasksTable bare /></details>
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
          <h3>The danger heatmap</h3>
          <p><Num id="hotspot_point_on_damage" /> of its hot spots have their marked point within 20 px of a building that is damaged or destroyed in the ground truth. Our reports call it the survivability heatmap.</p>
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
          <h3>The after-photo model in 8 bits</h3>
          <p><Num id="field_model_size" />, <Num id="field_model_cpu_time" /> per image on a CPU: <Num id="field_model_speedup" /> as fast as the full-precision model, for a destroyed-building IoU drop of <Num id="field_model_iou_drop" />. It reads only the after image. Try it now runs the before-and-after model in 8 bits instead (<Num id="pair_model_int8_size" />).</p>
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
