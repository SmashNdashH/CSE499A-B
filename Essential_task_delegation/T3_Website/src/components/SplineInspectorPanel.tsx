// Right panel: one building's row of the table, this image's accuracy against the ground truth,
// where the map came from, and the fixed questions.
import { useEffect, useState } from 'react';
import type { Accuracy, Building, HotSpots, MethodEntry, PairEntry } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';
import { methodUrl } from '../core/gallery.ts';
import { sourceUrl } from '../core/facts.ts';
import { FixedQuestionConsole } from './FixedQuestionConsole.tsx';

interface SplineInspectorPanelProps {
  pair: PairEntry;
  method: MethodEntry;
  buildings: Building[] | null;
  hotspots: HotSpots | null;
  accuracy: Accuracy | null;
  selected: Building | null;
  tab: 'building' | 'questions';
  onTab: (t: 'building' | 'questions') => void;
  onHighlight: (ids: number[] | null) => void;
  onSelect: (id: number | null) => void;
  onShowSpots: () => void;
  /** A result made in the browser (Try it): it isn't scored here, and it has no report facts. */
  own?: boolean;
  /** Whether the selected building's outline is hidden on the map, and the switch for it. */
  selectedHidden: boolean;
  onToggleHidden: (id: number) => void;
}

const IOU_ROWS = [['destroyed', 'Destroyed'], ['damaged', 'Damaged'], ['intact', 'Intact'], ['background', 'Background']] as const;

function ReportInputs({ pair, method }: { pair: PairEntry; method: MethodEntry }) {
  const [text, setText] = useState<string | null>(null);
  const url = method.has_report_inputs ? methodUrl(pair.id, method.id, 'report_inputs.txt') : null;
  useEffect(() => {
    if (!url) return;
    let current = true;
    fetch(url).then((r) => (r.ok ? r.text() : null)).then((t) => { if (current) setText(t); }).catch(() => undefined);
    return () => { current = false; };
  }, [url]);
  if (!url) return <p className="ws-missing">Missing for this pair. The step that turns the building table and hot spots into the report writer's facts isn't connected yet.</p>;
  return text === null ? <p className="ws-note">Loading.</p> : <pre className="fq-sql">{text}</pre>;
}

export function SplineInspectorPanel({ pair, method, buildings, hotspots, accuracy, selected, tab, onTab, onHighlight, onSelect, onShowSpots, own, selectedHidden, onToggleHidden }: SplineInspectorPanelProps) {
  const src = method.source;
  return (
    <aside className="ws-panel ws-right" aria-label="Building inspector">
      <details open>
      <summary className="ws-fold">Facts and questions</summary>
      <div className="ws-tabs" role="tablist" aria-label="Inspector">
        <button type="button" role="tab" aria-selected={tab === 'building'} onClick={() => onTab('building')}>Building</button>
        <button type="button" role="tab" aria-selected={tab === 'questions'} onClick={() => onTab('questions')}>Questions</button>
      </div>

      {tab === 'questions' && (buildings && hotspots
        ? <FixedQuestionConsole buildings={buildings} hotspots={hotspots} onHighlight={onHighlight} onSelect={onSelect} onShowSpots={onShowSpots} />
        : <p className="ws-missing">No building table for this pair, so no question can be answered. That is missing data, not zero buildings.</p>)}

      {tab === 'building' && (
        <>
          <h3>Selected building</h3>
          {!selected && <p className="ws-note">{buildings ? 'Click a building on the map, or pick one from the list.' : 'No building table for this pair.'}</p>}
          {selected && (
            <dl className="ws-facts">
              <dt>Building</dt><dd className="num">{selected.building_id}</dd>
              <dt>Class (the model's estimate)</dt><dd><span className={`swatch swatch-${selected.class_id}`} />{CLASS_NAMES[selected.class_id]}</dd>
              <dt>Area</dt><dd className="num">{selected.area_px.toLocaleString('en')} px</dd>
              <dt>Nearest destroyed building</dt>
              <dd className="num">{selected.dist_to_nearest_destroyed_px === null ? 'none other in this image' : `${selected.dist_to_nearest_destroyed_px} px, centre to centre`}</dd>
              <dt>Centre</dt><dd className="num">({selected.centroid_x}, {selected.centroid_y}) px</dd>
              <dt>Bounding box</dt><dd className="num">{selected.bbox_w} x {selected.bbox_h} px at ({selected.bbox_x}, {selected.bbox_y})</dd>
            </dl>
          )}
          {selected && (
            <button type="button" className="ws-chip ws-hide-one" onClick={() => onToggleHidden(selected.building_id)}>
              {selectedHidden ? 'Show its outline on the map again' : 'Hide its outline on the map'}
            </button>
          )}

          <h3>This image against the ground truth</h3>
          {own && <p className="ws-note">A map made on this device just now isn't scored: a picture you bring has no ground truth, and a gallery photo's stored map is scored on the Explore page. How well this model does on labelled images is stated above the map.</p>}
          {!own && !accuracy && <p className="ws-missing">No accuracy file for this pair.</p>}
          {accuracy && (
            <>
              <table className="ws-table">
                <thead><tr><th scope="col">Class</th><th scope="col">IoU</th></tr></thead>
                <tbody>
                  {IOU_ROWS.map(([key, name]) => (
                    <tr key={key}><th scope="row">{name}</th><td className="num">{accuracy.iou[key] === null ? 'not in this image' : accuracy.iou[key]!.toFixed(3)}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="ws-note">IoU is the overlap between the model's pixels and the true pixels of a class, from 0 (none) to 1 (exact). The gallery comes from validation images, so the truth is known.</p>
            </>
          )}

          <h3>Where this map comes from</h3>
          <dl className="ws-facts">
            <dt>Model</dt><dd>{src.model}</dd>
            <dt>Averaged over 8 flipped and rotated views</dt><dd>{src.tta ? 'yes' : 'no'}</dd>
            <dt>Checkpoint</dt><dd className="num">{src.checkpoint ?? 'not recorded'}</dd>
            <dt>Notebook</dt><dd><a href={sourceUrl(src.notebook)}>{src.notebook.split('/').pop()}</a></dd>
            <dt>Run on</dt><dd className="num">{src.date}</dd>
            <dt>Image</dt><dd className="num">{pair.info.image} ({own ? pair.info.split : `${pair.info.source}, ${pair.info.split}`})</dd>
          </dl>

          {!own && <h3>What the report writer is given for this pair</h3>}
          {!own && <ReportInputs pair={pair} method={method} />}
        </>
      )}
      </details>
    </aside>
  );
}
