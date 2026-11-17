// Fixed question templates. There is no free-text box: each answer is a hand-written query on the
// building table's columns (core/queries.ts), and each answer highlights its buildings.
import { useEffect, useState } from 'react';
import type { Building, ClassId, HotSpots } from '../types/disaster.ts';
import { CLASS_IDS, CLASS_NAMES } from '../types/disaster.ts';
import { countsByClass, DISTANCES_PX, largestOfClass, withinOfDestroyed } from '../core/queries.ts';
import { fact, sourceUrl } from '../core/facts.ts';
import { GuidelineSearch } from './GuidelineSearch.tsx';

interface FixedQuestionConsoleProps {
  buildings: Building[];
  hotspots: HotSpots;
  /** Highlight these buildings on the map; null clears the highlight. */
  onHighlight: (ids: number[] | null) => void;
  onSelect: (id: number | null) => void;
  onShowSpots: () => void;
}

const TEMPLATES = ['How many buildings of each class?', 'How many are near a destroyed building?', 'Which is the largest damaged or destroyed building?', 'Where are the hot spots and the safe areas?', 'What do the response guidelines say?'];

export function FixedQuestionConsole({ buildings, hotspots, onHighlight, onSelect, onShowSpots }: FixedQuestionConsoleProps) {
  const [template, setTemplate] = useState(0);
  const [cls, setCls] = useState<ClassId>(1);
  const [dist, setDist] = useState(100);
  const [bigCls, setBigCls] = useState<ClassId>(3);
  const [showSql, setShowSql] = useState(false);
  const counts = countsByClass(buildings);
  const near = withinOfDestroyed(buildings, cls, dist);
  const largest = largestOfClass(buildings, bigCls);
  const anyDestroyed = counts[3] > 0;

  // Each answer lights up its buildings.
  useEffect(() => {
    // An empty answer clears the highlight: dimming every building would read as "nothing here".
    if (template === 1) onHighlight(near.length ? near.map((b) => b.building_id) : null);
    else if (template === 2) { onHighlight(largest ? [largest.building_id] : null); onSelect(largest ? largest.building_id : null); }
    else if (template === 3) { onHighlight(null); onShowSpots(); }
    // template 4 quotes guideline passages; it isn't about this pair's buildings
    else onHighlight(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the answers are derived from these inputs
  }, [template, cls, dist, bigCls, buildings]);

  const sql = [
    'SELECT class_name, COUNT(*) FROM buildings\nWHERE image = ? GROUP BY class_name',
    `SELECT COUNT(*) FROM buildings\nWHERE image = ? AND class_name = '${CLASS_NAMES[cls]}'\n  AND dist_to_nearest_destroyed_px <= ${dist}`,
    `SELECT building_id, area_px FROM buildings\nWHERE image = ? AND class_name = '${CLASS_NAMES[bigCls]}'\nORDER BY area_px DESC LIMIT 1`,
    null,
  ][template];
  const wrong = fact('free_sql_wrong_answer');

  return (
    <div className="fq">
      <p className="ws-note">
        There is no box to type in. Each question below was written and checked by hand.
        {wrong && <> When a language model wrote its own query for the second question, it answered <a href={sourceUrl(wrong.source)} title={wrong.measures}>{wrong.display}</a> for one image, because its query never filtered by image.</>}
      </p>
      <div className="fq-templates" role="group" aria-label="Question">
        {TEMPLATES.map((t, i) => <button key={t} type="button" aria-pressed={template === i} onClick={() => { setTemplate(i); setShowSql(false); }}>{t}</button>)}
      </div>

      <div className="fq-answer" aria-live="polite">
        {template === 0 && (
          <>
            <p>In this image the model found:</p>
            <div className="fq-counts">
              {CLASS_IDS.map((c) => (
                <button key={c} type="button" onClick={() => onHighlight(buildings.filter((b) => b.class_id === c).map((b) => b.building_id))}>
                  <span className={`swatch swatch-${c}`} /><b className="num">{counts[c]}</b> {CLASS_NAMES[c]}
                </button>
              ))}
            </div>
            <p className="ws-note">Press a count to highlight its buildings.</p>
          </>
        )}
        {template === 1 && (
          <>
            <p>
              How many{' '}
              <select value={cls} onChange={(e) => setCls(Number(e.target.value) as ClassId)} aria-label="Damage class">
                {CLASS_IDS.map((c) => <option key={c} value={c}>{CLASS_NAMES[c]}</option>)}
              </select>{' '}
              buildings are within{' '}
              <select value={dist} onChange={(e) => setDist(Number(e.target.value))} aria-label="Distance in pixels">
                {DISTANCES_PX.map((d) => <option key={d} value={d}>{d} px</option>)}
              </select>{' '}
              of a destroyed building?
            </p>
            {anyDestroyed
              ? <p className="fq-result"><b className="num">{near.length}</b> {near.length === 1 ? 'building' : 'buildings'}{near.length > 0 && ', highlighted on the map'}.</p>
              : <p className="fq-result">This image has no destroyed building in the model's map, so no distance exists. That is not the same as zero buildings nearby.</p>}
            <p className="ws-note">Centre to centre, in pixels. The dataset gives no ground resolution, so this site never shows metres.</p>
          </>
        )}
        {template === 2 && (
          <>
            <p>
              Which is the largest{' '}
              <select value={bigCls} onChange={(e) => setBigCls(Number(e.target.value) as ClassId)} aria-label="Damage class">
                <option value={2}>damaged</option>
                <option value={3}>destroyed</option>
              </select>{' '}
              building?
            </p>
            <p className="fq-result">
              {largest
                ? <>Building <b className="num">{largest.building_id}</b>, with an area of <b className="num">{largest.area_px.toLocaleString('en')} px</b>. It is selected on the map.</>
                : <>The model found no {CLASS_NAMES[bigCls]} building in this image.</>}
            </p>
          </>
        )}
        {template === 3 && (
          <>
            <p className="ws-note">From the danger heatmap, not the building table. The markers are now on the map.</p>
            {hotspots.hot_spots.length === 0 && <p className="fq-result">The heatmap marked no hot spot in this image.</p>}
            <ul className="fq-spots">
              {hotspots.hot_spots.map((s) => <li key={`h${s.rank}`}><b>Hot spot {s.rank}</b>: {s.where} of the image, marked point at ({s.point_xy[0]}, {s.point_xy[1]}) px.</li>)}
              {hotspots.safe_areas.map((s) => <li key={`s${s.rank}`}><b>Safe area S{s.rank}</b>: {s.where} of the image, {s.distance_px} px from the nearest damage.</li>)}
            </ul>
            <p className="ws-note">A guide to where to look first. It doesn't detect survivors.</p>
          </>
        )}
        {template === 4 && <GuidelineSearch />}
        {sql && (
          <>
            <button type="button" className="ws-link" aria-expanded={showSql} onClick={() => setShowSql(!showSql)}>{showSql ? 'Hide' : 'Show'} the fixed query</button>
            {showSql && <pre className="fq-sql">{sql}</pre>}
          </>
        )}
      </div>
    </div>
  );
}
