// Pieces the three direction pages share. The words are the same in each; only the look differs.
import type { PaletteId } from '../core/palette.ts';
import { METHOD_LABELS, prettyEvent, useGalleryIndex, useMethodData } from '../core/useGallery.ts';
import { DEFAULT_LAYERS, OfflineCanvas } from '../components/OfflineCanvas.tsx';
import { CLASS_IDS, CLASS_NAMES } from '../types/disaster.ts';

export const SENTENCE = 'From one satellite photo taken before a disaster and one taken after, this system maps which buildings are intact, damaged or destroyed, counts them, and marks where to search first, with no internet.';
export const DECISION_LINE = 'A model\'s estimate, to be checked by people on the ground.';
export const TEAM = ['Abdullah Al Noman', 'Tamanna Akter Mou', 'Aryan Sami', 'Ridita Afrin Riya', 'Abrar Mohammed Tanzim Alam'];
export const COURSE = 'North South University, CSE499B, Section 13, Group 5';

export function Legend() {
  return (
    <ul className="legend" aria-label="Damage classes">
      {CLASS_IDS.map((c) => <li key={c}><span className={`swatch swatch-${c}`} />{CLASS_NAMES[c]}</li>)}
    </ul>
  );
}

/** The before/after slider on the gallery's opening pair, with that pair's damage map on top. */
export function HeroPair({ palette, cover }: { palette: PaletteId; cover?: boolean }) {
  const index = useGalleryIndex();
  // Without photos on this device (a teammate's PC, for example) the first pair is shown anyway:
  // its outlines and numbers are real, and the map says the photo is missing.
  const pair = index?.pairs.find((p) => p.info.hero) ?? index?.pairs.find((p) => p.has_before && p.has_after) ?? index?.pairs[0] ?? null;
  const method = pair?.methods[0] ?? null;
  const state = useMethodData(pair?.id ?? null, method?.id ?? null);
  if (!index) return <div className={`hero-empty${cover ? ' hero-cover' : ''}`} />;
  if (!pair || !method) return <p className="hero-empty ws-missing">This build has no gallery pair yet, so there is no photo to show here.</p>;
  const data = state.status === 'ready' ? state.data : null;
  return (
    <figure className="hero-pair">
      <OfflineCanvas pair={pair} methodId={method.id} buildings={data?.buildings ?? null} hotspots={null} palette={palette} layers={DEFAULT_LAYERS} sweep switches cover={cover}
        label={`Before and after photos of the ${prettyEvent(pair.info.event)} pair, with the model's damage map on top`} />
      <figcaption>
        {prettyEvent(pair.info.event)}, a validation pair from DisasterM3 ({pair.info.source}). Damage map: output of the {(METHOD_LABELS[method.id] ?? method.id).toLowerCase()}
        {index.fixture && ' (development fixture)'}.
        {state.status === 'missing' && ' Its building table is missing, so no building is drawn.'}
      </figcaption>
    </figure>
  );
}

export function TeamFooter() {
  return (
    <footer className="team-footer">
      <p className="decision">{DECISION_LINE}</p>
      <p>{TEAM.join(', ')}</p>
      <p>{COURSE}</p>
      <p className="credits">Built on DisasterM3, xBD, Qwen2.5-VL, SAM 3, DisasTeller and ONNX Runtime Web. The building map's workspace began as Aryan Sami's prototype.</p>
    </footer>
  );
}
