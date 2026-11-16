// The pair view: the before and after photos under a slider, with the damage map drawn on top
// from each building's outline. Everything comes from files on our own origin.
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Building, ClassId, HotSpots, PairEntry } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';
import { methodUrl, pairUrl, paintPng } from '../core/gallery.ts';
import { DAMAGE_COLOURS, HEAT_COLOUR, hexToRgb, type PaletteId } from '../core/palette.ts';
import Crosshair from '../vendor/react-bits/Crosshair.tsx';

// The crosshair follows a mouse; on touch screens there is no pointer to follow.
const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export interface Layers {
  classes: Record<ClassId, boolean>;
  spots: boolean;
  heat: boolean;
  truth: boolean;
}
export const DEFAULT_LAYERS: Layers = { classes: { 1: true, 2: true, 3: true }, spots: false, heat: false, truth: false };

interface OfflineCanvasProps {
  pair: PairEntry;
  methodId: string;
  /** null while loading or when the table is missing: then no building is drawn. */
  buildings: Building[] | null;
  hotspots: HotSpots | null;
  palette: PaletteId;
  layers: Layers;
  selectedId?: number | null;
  /** When set, only these buildings are drawn at full strength. */
  highlight?: Set<number> | null;
  onSelect?: (id: number | null) => void;
  /** Move the slider once from "before" to "after" when the view first appears. */
  sweep?: boolean;
  /** When set, the slider glides to this share of "before" (0 to 100) each time it changes. */
  position?: number;
  /** Show on/off switches under the map for the overlays, where no layers panel is beside it. */
  switches?: boolean;
  /** Fill a wide frame by cropping the top and bottom of the image. */
  cover?: boolean;
  /** Pixel coordinates along the frame: distances on this site are in pixels. */
  ticks?: boolean;
  /**
   * For a picture that isn't in the gallery (the visitor's own): where to read the after photo and
   * the heatmap (one channel, value x 255) instead of the gallery's files.
   */
  urls?: { after: string; heat: string };
  label: string;
}

const ringsToPath = (b: Building) => b.outline.map((r) => 'M' + r.map(([x, y]) => `${x} ${y}`).join('L') + 'Z').join('');
const px = (n: number) => `${n.toLocaleString('en')} px`;

interface BuildingLayerProps {
  buildings: Building[];
  layers: Layers;
  selectedId: number | null;
  highlight: Set<number> | null;
  hatchId: string;
  onPick?: (id: number) => void;
  onHover: (b: Building | null) => void;
}

const BuildingLayer = memo(function BuildingLayer({ buildings, layers, selectedId, highlight, hatchId, onPick, onHover }: BuildingLayerProps) {
  const paths = useMemo(() => buildings.map((b) => ({ b, d: ringsToPath(b) })), [buildings]);
  return (
    <g className="oc-buildings">
      {paths.filter(({ b }) => layers.classes[b.class_id]).map(({ b, d }) => {
        const dim = highlight ? !highlight.has(b.building_id) : false;
        const sel = selectedId === b.building_id;
        return (
          <g key={b.building_id} className={`oc-b oc-c${b.class_id}${dim ? ' is-dim' : highlight ? ' is-lit' : ''}${sel ? ' is-sel' : ''}${onPick ? ' is-pickable' : ''}`}
            onClick={onPick ? () => onPick(b.building_id) : undefined}
            onPointerEnter={() => onHover(b)} onPointerLeave={() => onHover(null)}>
            <path d={d} fillRule="evenodd" />
            {b.class_id === 3 && !dim && <path d={d} fillRule="evenodd" className="oc-hatch" style={{ fill: `url(#${hatchId})` }} />}
          </g>
        );
      })}
    </g>
  );
});

export function OfflineCanvas({ pair, methodId, buildings, hotspots, palette, layers: wanted, selectedId = null, highlight = null, onSelect, sweep, position, switches, cover, ticks, urls, label }: OfflineCanvasProps) {
  // The visitor's own switches. They only ever hide a layer the page asked for; they never add one.
  const [mapOff, setMapOff] = useState(false);
  const [heatOff, setHeatOff] = useState(false);
  const mapWanted = wanted.classes[1] || wanted.classes[2] || wanted.classes[3];
  const heatWanted = wanted.heat || wanted.spots;
  const layers = useMemo<Layers>(() => ({
    classes: mapOff ? { 1: false, 2: false, 3: false } : wanted.classes,
    heat: wanted.heat && !heatOff,
    spots: wanted.spots && !heatOff,
    truth: wanted.truth,
  }), [wanted, mapOff, heatOff]);
  const uid = useId().replace(/:/g, '');
  const { width: w, height: h } = pair.info;
  const hasPair = pair.has_before && pair.has_after;
  const stage = useRef<HTMLDivElement>(null);
  // Share of the width that shows the before photo. A sweep starts fully on "before".
  const [pos, setPos] = useState(() => (sweep && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 100 : 50));
  const [hover, setHover] = useState<Building | null>(null);
  const [truthUrl, setTruthUrl] = useState<string | null>(null);
  const [heatUrl, setHeatUrl] = useState<string | null>(null);

  // One sweep from before to after explains what the slider compares. Skipped for reduced motion.
  useEffect(() => {
    if (!sweep || !hasPair || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const start = performance.now() + 500;
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / 1600));
      setPos(100 - 60 * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [sweep, hasPair, pair.id]);

  useEffect(() => {
    if (!layers.truth) return;
    let current = true;
    const c = DAMAGE_COLOURS[palette];
    const rgba = [[0, 0, 0, 0], ...[1, 2, 3].map((k) => [...hexToRgb(c[k as ClassId]), 215])] as [number, number, number, number][];
    paintPng(pairUrl(pair.id, 'gt.png'), (v) => rgba[v] ?? rgba[0]).then((u) => { if (current) setTruthUrl(u); }).catch(() => { if (current) setTruthUrl(null); });
    return () => { current = false; };
  }, [layers.truth, pair.id, palette]);

  useEffect(() => {
    if (!layers.heat) return;
    let current = true;
    const [r, g, b] = hexToRgb(HEAT_COLOUR[palette]);
    // The heatmap files hold value x 255; the heatmap's own pictures saturate at 0.5.
    paintPng(urls?.heat ?? methodUrl(pair.id, methodId, 'heat_priority.png'), (v) => [r, g, b, Math.round(Math.min(1, v / 127.5) * 200)])
      .then((u) => { if (current) setHeatUrl(u); }).catch(() => { if (current) setHeatUrl(null); });
    return () => { current = false; };
  }, [layers.heat, pair.id, methodId, palette, urls?.heat]);

  // A controlled position glides there, so the visitor sees which photo is being uncovered.
  const posNow = useRef(pos);
  useEffect(() => { posNow.current = pos; }, [pos]);
  useEffect(() => {
    if (position === undefined) return;
    const from = posNow.current;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 700;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setPos(from + (position - from) * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [position]);

  const drag = (e: React.PointerEvent) => {
    if (!stage.current || !(e.buttons & 1)) return;
    const r = stage.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };
  const pick = useCallback((id: number) => onSelect?.(id === selectedId ? null : id), [onSelect, selectedId]);
  const shown = hover ?? buildings?.find((b) => b.building_id === selectedId) ?? null;
  const clipX = (pos / 100) * w;

  return (
    <div className={`oc${cover ? ' oc-cover' : ''}${ticks ? ' oc-ticked' : ''}`}>
      {ticks && <div className="oc-ticks oc-ticks-x" aria-hidden="true">{[0, 0.25, 0.5, 0.75, 1].map((t) => <span key={t}>{Math.round(t * w)}</span>)}</div>}
      {ticks && <div className="oc-ticks oc-ticks-y" aria-hidden="true">{[0, 0.25, 0.5, 0.75, 1].map((t) => <span key={t}>{Math.round(t * h)}</span>)}</div>}
      <div className="oc-stage" ref={stage} style={cover ? undefined : { aspectRatio: `${w} / ${h}` }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio={cover ? 'xMidYMid slice' : 'xMidYMid meet'} role="group" aria-label={label}>
          <defs>
            <clipPath id={`${uid}-after`}><rect x={clipX} y={0} width={w - clipX} height={h} /></clipPath>
            <pattern id={`${uid}-hatch`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" className="oc-hatch-line" />
            </pattern>
          </defs>
          <rect className="oc-ground" width={w} height={h} />
          <g className="oc-photos">
            {pair.has_before && <image href={pairUrl(pair.id, 'before.webp')} width={w} height={h} preserveAspectRatio="none" />}
            {pair.has_after && <image href={urls?.after ?? pairUrl(pair.id, 'after.webp')} width={w} height={h} preserveAspectRatio="none" clipPath={hasPair ? `url(#${uid}-after)` : undefined} />}
          </g>
          {layers.truth && truthUrl && <image href={truthUrl} width={w} height={h} preserveAspectRatio="none" className="oc-truth" />}
          {layers.heat && heatUrl && <image href={heatUrl} width={w} height={h} preserveAspectRatio="none" className="oc-heat" />}
          {buildings && <BuildingLayer buildings={buildings} layers={layers} selectedId={selectedId} highlight={highlight} hatchId={`${uid}-hatch`} onPick={onSelect ? pick : undefined} onHover={setHover} />}
          {layers.spots && hotspots && (
            <g className="oc-spots">
              {hotspots.hot_spots.map((s) => (
                <g key={`h${s.rank}`} className="oc-spot oc-spot-hot">
                  <circle cx={s.point_xy[0]} cy={s.point_xy[1]} r={Math.min(w, h) * 0.03} />
                  <text x={s.point_xy[0]} y={s.point_xy[1]} fontSize={Math.min(w, h) * 0.034}>{s.rank}</text>
                </g>
              ))}
              {hotspots.safe_areas.map((s) => {
                const r = Math.min(w, h) * 0.027;
                return (
                  <g key={`s${s.rank}`} className="oc-spot oc-spot-safe">
                    <rect x={s.xy[0] - r} y={s.xy[1] - r} width={r * 2} height={r * 2} />
                    <text x={s.xy[0]} y={s.xy[1]} fontSize={Math.min(w, h) * 0.026}>S{s.rank}</text>
                  </g>
                );
              })}
            </g>
          )}
          {hasPair && <line className="oc-divider" x1={clipX} x2={clipX} y1={0} y2={h} />}
        </svg>
        {hasPair && (
          <div className="oc-handle" style={{ left: `${pos}%` }} onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag(e); }} onPointerMove={drag} aria-hidden="true">
            <span />
          </div>
        )}
        {/* Live position in image pixels, and brackets around the building under the pointer.
            It shows that every position and distance on this site is in the image's own pixels. */}
        {onSelect && FINE_POINTER && (
          <Crosshair containerRef={stage} color={palette === 'dark' ? '#ffffff' : '#12211c'} coordinateSpan={{ width: w, height: h }}
            showTargetSize={false} targetSelector=".oc-b" clickPulse={false} smoothing={0.12} opacity={0.9} style={{ zIndex: 1 }} />
        )}
        {!pair.has_after && <p className="oc-nophoto">No photo of this pair is on this device. The outlines, masks and numbers are real.</p>}
      </div>
      {hasPair && (
        <label className="oc-slider">
          <span>Before</span>
          <input type="range" min={0} max={100} step={1} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))} aria-label="Slide between the before photo and the after photo" />
          <span>After</span>
        </label>
      )}
      {switches && (mapWanted || heatWanted) && (
        <div className="oc-switches">
          {mapWanted && (
            <label><input type="checkbox" role="switch" checked={!mapOff} onChange={() => setMapOff(!mapOff)} /><span>Damage map</span></label>
          )}
          {heatWanted && (
            <label><input type="checkbox" role="switch" checked={!heatOff} onChange={() => setHeatOff(!heatOff)} /><span>Heatmap and hot spots</span></label>
          )}
        </div>
      )}
      {onSelect && (
        <p className="oc-readout">
          {shown ? (
            <>
              <b>Building {shown.building_id}</b>
              <span className={`swatch swatch-${shown.class_id}`} />
              <span>{CLASS_NAMES[shown.class_id]}</span>
              <span>area {px(shown.area_px)}</span>
              <span>{shown.dist_to_nearest_destroyed_px === null ? 'no other destroyed building in this image' : `${shown.dist_to_nearest_destroyed_px} px to the nearest destroyed building`}</span>
            </>
          ) : buildings ? 'Click or tap a building to open its facts.' : ''}
        </p>
      )}
    </div>
  );
}
