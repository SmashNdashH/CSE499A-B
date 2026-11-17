// Left panel: the map's layers, and every building of the pair as a list. The list is also the
// keyboard's way to a building, since the outlines on the map are pointer targets.
import type { Building, ClassId } from '../types/disaster.ts';
import { CLASS_IDS, CLASS_NAMES } from '../types/disaster.ts';
import type { Layers } from './OfflineCanvas.tsx';

interface SplineLayersPanelProps {
  buildings: Building[] | null;
  layers: Layers;
  onLayers: (next: Layers) => void;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  methodLabel: string;
  /** The visitor's own image: it has no ground truth to show. */
  own?: boolean;
  /** Buildings whose outline the visitor has hidden on the map. They stay in the table and in every count. */
  hidden: Set<number>;
  onToggleHidden: (id: number) => void;
  onShowAll: () => void;
  /** Digits typed into the search: the list keeps the buildings whose number starts with them. */
  query: string;
  onQuery: (digits: string) => void;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en')} ${n === 1 ? one : many}`;

export function SplineLayersPanel({ buildings, layers, onLayers, selectedId, onSelect, methodLabel, own, hidden, onToggleHidden, onShowAll, query, onQuery }: SplineLayersPanelProps) {
  const toggleClass = (c: ClassId) => onLayers({ ...layers, classes: { ...layers.classes, [c]: !layers.classes[c] } });
  const matches = (b: Building) => String(b.building_id).startsWith(query);
  const found = buildings && query ? buildings.filter(matches).length : null;
  return (
    <aside className="ws-panel ws-left" aria-label="Layers and buildings">
      <details open>
        <summary className="ws-fold">Layers and buildings</summary>
        <h3>Layers</h3>
        <p className="ws-note">Model output: {methodLabel.toLowerCase()}.</p>
        <ul className="ws-layers">
          {CLASS_IDS.map((c) => (
            <li key={c}>
              <label><input type="checkbox" checked={layers.classes[c]} onChange={() => toggleClass(c)} /><span className={`swatch swatch-${c}`} />{cap(CLASS_NAMES[c])} buildings</label>
            </li>
          ))}
          <li><label><input type="checkbox" checked={layers.spots} onChange={() => onLayers({ ...layers, spots: !layers.spots })} /><span className="swatch swatch-spot" />Hot spots and safe areas</label></li>
          <li><label><input type="checkbox" checked={layers.heat} onChange={() => onLayers({ ...layers, heat: !layers.heat })} /><span className="swatch swatch-heat" />Danger heatmap</label></li>
          {!own && <li><label><input type="checkbox" checked={layers.truth} onChange={() => onLayers({ ...layers, truth: !layers.truth })} /><span className="swatch swatch-truth" />Ground truth (the dataset's own labels)</label></li>}
        </ul>

        <h3>Buildings</h3>
        {!buildings && <p className="ws-missing">No building table for this image. That is missing data, not zero buildings.</p>}
        {buildings && (
          <>
            <label className="ws-search">
              <span className="sr-only">Find a building by its number</span>
              <input type="search" inputMode="numeric" autoComplete="off" placeholder="Find a building by its number" value={query}
                onChange={(e) => onQuery(e.target.value.replace(/\D/g, ''))} />
            </label>
            <p className="ws-note" role="status">
              {found !== null && (found === 0 ? `No building's number starts with ${query}.` : `${plural(found, 'building has', 'buildings have')} a number that starts with ${query}.`)}
            </p>
            {hidden.size > 0 && (
              <p className="ws-note ws-hidden-note">
                {plural(hidden.size, 'outline is', 'outlines are')} hidden on the map. Hidden buildings still count, and a saved picture still draws them.{' '}
                <button type="button" className="ws-link" onClick={onShowAll}>Show all</button>
              </p>
            )}
          </>
        )}
        {buildings && CLASS_IDS.slice().reverse().map((c) => {
          const ofClass = buildings.filter((b) => b.class_id === c).sort((a, b) => b.area_px - a.area_px);
          const list = query ? ofClass.filter(matches) : ofClass;
          return (
            <details key={c} className="ws-blist" open={query ? list.length > 0 : c === 3}>
              <summary><span className={`swatch swatch-${c}`} />{cap(CLASS_NAMES[c])}<span className="ws-count">{query ? `${list.length} of ${ofClass.length}` : ofClass.length}</span></summary>
              {list.length === 0 ? <p className="ws-note">{ofClass.length ? 'None with that number.' : 'None in this image.'}</p> : (
                <ul>
                  {list.map((b) => (
                    <li key={b.building_id} className={hidden.has(b.building_id) ? 'is-hidden' : undefined}>
                      <button type="button" aria-pressed={b.building_id === selectedId} onClick={() => onSelect(b.building_id === selectedId ? null : b.building_id)}>
                        <span>Building {b.building_id}</span><span className="num">{b.area_px.toLocaleString('en')} px</span>
                      </button>
                      {/* Out of the Tab order, so the list stays one stop a building; from the keyboard, the same switch is in the inspector. */}
                      <button type="button" className="ws-eye" tabIndex={-1} aria-pressed={hidden.has(b.building_id)} aria-label={`Hide building ${b.building_id} on the map`}
                        title={hidden.has(b.building_id) ? 'Show it on the map again' : 'Hide its outline on the map'} onClick={() => onToggleHidden(b.building_id)} />
                    </li>
                  ))}
                </ul>
              )}
            </details>
          );
        })}
      </details>
    </aside>
  );
}
