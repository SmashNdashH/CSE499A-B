// The building map: layers on the left, the pair in the centre, the building inspector on the
// right, the class filter underneath. The layout began as Aryan Sami's prototype workspace.
import { useCallback, useMemo, useState } from 'react';
import type { Building, ClassId, HotSpots, PairEntry } from '../types/disaster.ts';
import type { PaletteId } from '../core/palette.ts';
import { METHOD_LABELS, prettyEvent, useGalleryIndex, useMethodData } from '../core/useGallery.ts';
import { DEFAULT_LAYERS, OfflineCanvas, type Layers } from './OfflineCanvas.tsx';
import { DamageCity } from './DamageCity.tsx';
import { SplineTopBar } from './SplineTopBar.tsx';
import { SplineLayersPanel } from './SplineLayersPanel.tsx';
import { SplineInspectorPanel } from './SplineInspectorPanel.tsx';
import { SplineBottomBar } from './SplineBottomBar.tsx';
import { DisasTellerReportsModal } from './DisasTellerReportsModal.tsx';
import { BenchmarkPanelModal } from './BenchmarkPanelModal.tsx';
import { exportMapPng } from '../core/exportMap.ts';

interface WorkspaceProps {
  palette: PaletteId;
  /** Pixel-coordinate ticks around the map frame. */
  ticks?: boolean;
  /** Sweep the slider once from before to after when the first pair appears. */
  sweep?: boolean;
  /** Show this result instead of the gallery: the visitor's own image, run on their device. */
  own?: OwnImage;
}

/** A result that isn't in the gallery. Its one method entry says which model drew the map. */
export interface OwnImage {
  pair: PairEntry;
  buildings: Building[];
  hotspots: HotSpots;
  /** `before` is set when the model read a before-photo too: the map then has the before/after slider. */
  urls: { after: string; before?: string; heat: string };
}

export function Workspace({ palette, ticks, sweep, own }: WorkspaceProps) {
  const index = useGalleryIndex();
  const [pickedPair, setPickedPair] = useState<string | null>(null);
  const [pickedMethod, setPickedMethod] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightIds, setHighlightIds] = useState<number[] | null>(null);
  const [activeClass, setActiveClass] = useState<ClassId | null>(null);
  const [layers, setLayers] = useState<Layers>(DEFAULT_LAYERS);
  const [tab, setTab] = useState<'building' | 'questions'>('building');
  const [modal, setModal] = useState<'reports' | 'benchmark' | null>(null);
  const [view, setView] = useState<'flat' | '3d'>('flat');
  // Outlines the visitor has hidden, and the number typed into the list's search. Both only change
  // what is shown: counts, answers and the saved picture always use the whole table.
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [query, setQuery] = useState('');

  const pair = own?.pair ?? index?.pairs.find((p) => p.id === pickedPair) ?? index?.pairs.find((p) => p.info.hero) ?? index?.pairs[0] ?? null;
  const method = pair?.methods.find((m) => m.id === pickedMethod) ?? pair?.methods[0] ?? null;
  const state = useMethodData(own ? null : pair?.id ?? null, own ? null : method?.id ?? null);
  const data = own ? { buildings: own.buildings, hotspots: own.hotspots, accuracy: null } : state.status === 'ready' ? state.data : null;
  // The fixture mark belongs to gallery data only; a visitor's own result is never a fixture.
  const fixture = !own && !!index?.fixture;

  // Building numbers start again in every table, so nothing chosen in one pair carries to the next.
  const clear = () => { setSelectedId(null); setHighlightIds(null); setActiveClass(null); setHiddenIds([]); setQuery(''); };
  const highlight = useMemo(() => (highlightIds ? new Set(highlightIds) : null), [highlightIds]);
  const hidden = useMemo(() => new Set(hiddenIds), [hiddenIds]);
  const all = data?.buildings ?? null;
  const drawn = useMemo(() => (all && hidden.size ? all.filter((b) => !hidden.has(b.building_id)) : all), [all, hidden]);
  // Choosing a building shows it, even if its outline was hidden.
  const select = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id !== null) setHiddenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids));
  }, []);
  const toggleHidden = useCallback((id: number) => setHiddenIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id])), []);
  const onHighlight = useCallback((ids: number[] | null) => { setHighlightIds(ids); setActiveClass(null); }, []);
  const onShowSpots = useCallback(() => setLayers((l) => (l.spots ? l : { ...l, spots: true })), []);
  const pickClass = (c: ClassId | null) => {
    setActiveClass(c);
    setHighlightIds(c && data ? data.buildings.filter((b) => b.class_id === c).map((b) => b.building_id) : null);
  };

  if (!own && !index) return <p className="ws-note ws-loading">Loading the gallery.</p>;
  if (!pair || !method) {
    return <p className="ws-missing">This build has no gallery pairs yet. The building map appears here once the gallery export is in place.</p>;
  }
  const methodLabel = METHOD_LABELS[method.id] ?? method.id;

  return (
    <div className="ws">
      {fixture && (
        <p className="ws-fixture">
          <b>Development fixtures.</b> These are real validation pairs with the output of the lighter after-image-only model, standing in until the gallery export arrives. They can't be published: the release build refuses them.
        </p>
      )}
      <SplineTopBar pairs={own ? [pair] : index!.pairs} pairId={pair.id} onSelectPair={(id) => { setPickedPair(id); setPickedMethod(null); clear(); }}
        methodId={method.id} onSelectMethod={(id) => { setPickedMethod(id); clear(); }}
        onOpenReports={() => setModal('reports')} onOpenBenchmark={() => setModal('benchmark')} />
      <SplineLayersPanel buildings={all} layers={layers} onLayers={setLayers} selectedId={selectedId} onSelect={select} methodLabel={methodLabel} own={!!own}
        hidden={hidden} onToggleHidden={toggleHidden} onShowAll={() => setHiddenIds([])} query={query} onQuery={setQuery} />
      <div className="ws-map">
        {!own && state.status === 'missing' &&<p className="ws-missing">The building table for this pair could not be read, so no building is drawn. Missing data is not zero buildings.</p>}
        <div className="ws-view" role="group" aria-label="View of the map">
          <button type="button" className="ws-chip" aria-pressed={view === 'flat'} onClick={() => setView('flat')}>Flat map</button>
          <button type="button" className="ws-chip" aria-pressed={view === '3d'} onClick={() => setView('3d')}>3D damage city</button>
        </div>
        {view === '3d'
          ? <DamageCity pair={pair} buildings={drawn} layers={layers} selectedId={selectedId} highlight={highlight} onSelect={select} photoUrl={own?.urls.after} />
          : <OfflineCanvas key={pair.id} pair={pair} methodId={method.id} buildings={drawn} hotspots={data?.hotspots ?? null} palette={palette}
              layers={layers} selectedId={selectedId} highlight={highlight} onSelect={select} ticks={ticks} sweep={sweep} urls={own?.urls}
              label={`Damage map of ${own ? 'the picture you chose' : `the ${prettyEvent(pair.info.event)} pair`}. Model output: ${methodLabel}. Buildings are listed in the layers panel.`} />}
        <SplineBottomBar buildings={data?.buildings ?? null} activeClass={activeClass} onPickClass={pickClass} />
        {data && (
          <div className="ws-actions">
            <button type="button" className="ws-chip"
              onClick={() => exportMapPng({ pair, buildings: data.buildings, classes: layers.classes, methodLabel, fixture, ownPhotoUrl: own?.urls.after })}>
              Save this map as a picture (PNG)
            </button>
            <span className="ws-note">Made in your browser; nothing is uploaded. The picture carries the model's name and the decision-support line.</span>
          </div>
        )}
      </div>
      <SplineInspectorPanel pair={pair} method={method} buildings={data?.buildings ?? null} hotspots={data?.hotspots ?? null} accuracy={data?.accuracy ?? null}
        selected={data?.buildings.find((b) => b.building_id === selectedId) ?? null} tab={tab} onTab={setTab}
        onHighlight={onHighlight} onSelect={select} onShowSpots={onShowSpots} own={!!own}
        selectedHidden={selectedId !== null && hidden.has(selectedId)} onToggleHidden={toggleHidden} />
      <DisasTellerReportsModal isOpen={modal === 'reports'} onClose={() => setModal(null)} />
      <BenchmarkPanelModal isOpen={modal === 'benchmark'} onClose={() => setModal(null)} />
    </div>
  );
}
