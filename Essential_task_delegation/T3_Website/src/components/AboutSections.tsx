// What the system can't do yet, and the ideas that are planned but not built. Every number comes
// from the facts file; a fact that isn't public yet is absent, and its line is left out with it.
import { fact } from '../core/facts.ts';
import { Note, Num, Provenance } from './ResultsTables.tsx';
// Rule: any sentence about a fact that isn't public yet goes in that fact's `note`, never in this file.

export function Limitations() {
  return (
    <ul className="limits">
      <li>
        <b>The parts don't run as one chain yet.</b> Each was tested on its own, with its own model and images: the best destroyed-building score is find-then-grade's, the counts come from the before-and-after model's table, and Try it runs that model in 8 bits, without the 8 flipped and rotated views. On the gallery pairs alone, the map, table, counts and heatmap come from one model.
      </li>
      <li><b>Distances and areas are in pixels.</b> The dataset's masks carry no ground scale, so no number on this site is in metres.</li>
      {fact('table_counting_accuracy') && (
        <li>
          <b>Building counts are weak.</b> About a third of the benchmark's counting questions come out right (<Num id="table_counting_accuracy" />), level with the base language model (<Num id="base_counting_accuracy" />).
          <Note id="no_image_rule" /> <Provenance id="table_counting_accuracy" />
        </li>
      )}
      {fact('after_only_finder_recall') && (
        <li>
          <b>Without a before photo, rubble is hard to find.</b> On the after photo alone, SAM 3's building outlines cover only <Num id="after_only_finder_recall" /> of the destroyed-building area, because rubble doesn't look like a building. <Provenance id="after_only_finder_recall" />
        </li>
      )}
      {fact('misaligned_pairs') && (
        <li>
          <b>Many pairs don't line up.</b> In <Num id="misaligned_pairs" /> of the pairs measured, the before and after photos are shifted by more than 2 pixels, so a building's two crops can be off. <Provenance id="misaligned_pairs" />
        </li>
      )}
      {/* An 18 Nov result: its wording lives in the facts file, so it stays out of the build until then. */}
      {fact('test_turkey_destroyed_iou') && (
        <li><Note id="test_turkey_destroyed_iou" /> <Provenance id="test_turkey_destroyed_iou" /></li>
      )}
      <li><b>The reports' quality hasn't been judged,</b> and they contain known errors, such as a made-up hotline number. They are shown word for word, with the errors marked.</li>
      <li><b>No language model has been measured on a laptop processor or a phone yet.</b> The reports were written on two cloud GPUs with the internet off.</li>
      <li><b>A building the model misses is never counted.</b> And every class, count and hot spot here is a model's estimate.</li>
    </ul>
  );
}

const IDEAS: [string, string][] = [
  ['Guessing the before photo', 'When no before photo exists, a model trained on our pairs could generate a likely one, so the before-and-after map still works. Planned as a test: the real before photo against a generated one against none.'],
  ['Real 3D reconstruction', 'A 3D model of one disaster site from drone video taken from several angles. Our satellite pairs show each place from one angle only, so it would stand apart from this pipeline. The 3D view on this site is our 2D results raised into blocks, not a reconstruction.'],
  ['Where shaking was strongest', 'For one earthquake, fitting how damage falls off with distance to estimate the shaking, then checking it against the official shake map. It needs each image placed on a map.'],
  ['Advice on ground sensors', "Our first plan (CSE499A) was to suggest where rescuers should place listening devices or radar. Our data has no information about a building's structure or the spaces inside the rubble, so nothing on this site gives such advice."],
  ['Thermal imagery', 'Our images are ordinary colour photos, with no thermal channel, so the system cannot see heat.'],
  ['Cleared access routes', 'Routing rescue teams along roads that are still open would need the road network and the images placed on a map. Not built.'],
];

export function FutureIdeas() {
  return (
    <>
      <p className="limits-note">Nothing below is built. Each is described only in words, so it can't be mistaken for a result.</p>
      <dl className="ideas">
        {/* Wording about the 3B lives in the facts file, so it stays out of the build until it's public. */}
        {fact('vl3b_peak_memory') && <div><dt>A smaller report writer</dt><dd><Note id="vl3b_peak_memory" /> <Provenance id="vl3b_peak_memory" /></dd></div>}
        {IDEAS.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
      </dl>
    </>
  );
}
