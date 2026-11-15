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
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function SplineLayersPanel({ buildings, layers, onLayers, selectedId, onSelect, methodLabel }: SplineLayersPanelProps) {
  const toggleClass = (c: ClassId) => onLayers({ ...layers, classes: { ...layers.classes, [c]: !layers.classes[c] } });
  return (
    <aside className="ws-panel ws-left" aria-label="Layers and buildings">
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
        <li><label><input type="checkbox" checked={layers.truth} onChange={() => onLayers({ ...layers, truth: !layers.truth })} /><span className="swatch swatch-truth" />Ground truth (the dataset's own labels)</label></li>
      </ul>

      <h3>Buildings</h3>
      {!buildings && <p className="ws-missing">No building table for this pair. That is missing data, not zero buildings.</p>}
      {buildings && CLASS_IDS.slice().reverse().map((c) => {
        const list = buildings.filter((b) => b.class_id === c).sort((a, b) => b.area_px - a.area_px);
        return (
          <details key={c} className="ws-blist" open={c === 3}>
            <summary><span className={`swatch swatch-${c}`} />{cap(CLASS_NAMES[c])}<span className="ws-count">{list.length}</span></summary>
            {list.length === 0 ? <p className="ws-note">None in this image.</p> : (
              <ul>
                {list.map((b) => (
                  <li key={b.building_id}>
                    <button type="button" aria-pressed={b.building_id === selectedId} onClick={() => onSelect(b.building_id === selectedId ? null : b.building_id)}>
                      <span>Building {b.building_id}</span><span className="num">{b.area_px.toLocaleString('en')} px</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </aside>
  );
}
