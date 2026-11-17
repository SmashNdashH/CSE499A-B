// The pair view: the before and after photos under a slider, with the damage map drawn on top
// from each building's outline. Everything comes from files on our own origin.
// Where a building can be clicked, the view can also be zoomed and moved; it stays in image pixels.
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import type { Building, ClassId, HotSpots, PairEntry } from '../types/disaster.ts';
import { methodUrl, pairUrl, paintPng } from '../core/gallery.ts';
import { DAMAGE_COLOURS, HEAT_COLOUR, hexToRgb, type PaletteId } from '../core/palette.ts';
import { FULL_VIEW, MAX_ZOOM, centreOn, panBy, shows, zoomAt, type View } from '../core/view.ts';
import Crosshair from '../vendor/react-bits/Crosshair.tsx';
import { BuildingFacts, useBuildingTip } from './BuildingTip.tsx';

// The crosshair follows a mouse; on touch screens there is no pointer to follow.
const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
// A plain wheel scrolls the page, as everywhere else; with this key held it zooms the map.
const ZOOM_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
const ZOOM_STEP = 1.6;
const ARROWS: Record<string, [number, number] | undefined> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] };
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  /** With this, buildings can be clicked, and the map can be zoomed and moved. */
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
          <g key={b.building_id} data-building={b.building_id}
            className={`oc-b oc-c${b.class_id}${dim ? ' is-dim' : highlight ? ' is-lit' : ''}${sel ? ' is-sel' : ''}${onPick ? ' is-pickable' : ''}`}
            onClick={onPick ? () => onPick(b.building_id) : undefined}
            onPointerEnter={(e) => { if (e.pointerType === 'mouse') onHover(b); }} onPointerLeave={() => onHover(null)}>
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
  const zoomable = !!onSelect && !cover;
  const stage = useRef<HTMLDivElement>(null);
  // Share of the width that shows the before photo. A sweep starts fully on "before".
  const [pos, setPos] = useState(() => (sweep && !reducedMotion() ? 100 : 50));
  const [truthUrl, setTruthUrl] = useState<string | null>(null);
  const [heatUrl, setHeatUrl] = useState<string | null>(null);
  const tip = useBuildingTip(stage);

  // One sweep from before to after explains what the slider compares. Skipped for reduced motion.
  useEffect(() => {
    if (!sweep || !hasPair || reducedMotion()) return;
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
    const duration = reducedMotion() ? 1 : 700;
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

  // ---- Zoom and pan. The view is a window on the image; `goal` is where it is heading. ----
  const [view, setView] = useState<View>(FULL_VIEW);
  const viewNow = useRef(view);
  useEffect(() => { viewNow.current = view; }, [view]);
  const goal = useRef<View>(FULL_VIEW);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  const [zoomSaid, setZoomSaid] = useState('');
  const [wheelHint, setWheelHint] = useState(false);

  const jump = useCallback((to: View) => { cancelAnimationFrame(frame.current); goal.current = to; setView(to); }, []);
  // A button or a key moves the view in a short glide, so the eye can follow where it went.
  const glideTo = useCallback((to: View) => {
    cancelAnimationFrame(frame.current);
    goal.current = to;
    const from = viewNow.current;
    const duration = reducedMotion() ? 1 : 220;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration), e = 1 - (1 - t) ** 3;
      setView(t < 1 ? { k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e } : to);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  }, []);
  const zoomTo = (to: View) => {
    glideTo(to);
    setZoomSaid(to.k > 1 ? `Zoomed in ${to.k.toFixed(1)} times.` : 'The whole image is shown.');
  };
  const zoomStep = (factor: number) => zoomTo(zoomAt(goal.current, factor, 0.5, 0.5, w, h));
  const zoomKeys = (e: React.KeyboardEvent) => {
    const step = ARROWS[e.key];
    if (step) { e.preventDefault(); glideTo(panBy(goal.current, step[0], step[1], w, h)); }
    else if (e.key === '+' || e.key === '=') zoomStep(ZOOM_STEP);
    else if (e.key === '-') zoomStep(1 / ZOOM_STEP);
  };

  // The wheel, with the zoom key held (a trackpad pinch arrives the same way), zooms about the pointer.
  useEffect(() => {
    const el = stage.current;
    if (!el || !zoomable) return;
    let timer = 0;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setWheelHint(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setWheelHint(false), 1600);
        return;
      }
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-Math.max(-50, Math.min(50, e.deltaY)) * 0.005);
      jump(zoomAt(goal.current, factor, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height, w, h));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => { el.removeEventListener('wheel', onWheel); window.clearTimeout(timer); };
  }, [zoomable, jump, w, h]);

  // A building chosen from the list may be outside a zoomed view: bring it to the middle.
  useEffect(() => {
    const b = selectedId === null ? null : buildings?.find((x) => x.building_id === selectedId);
    const v = goal.current;
    if (b && v.k > 1 && !shows(v, b.centroid_x, b.centroid_y, w, h)) glideTo(centreOn(v, b.centroid_x, b.centroid_y, w, h));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a new selection moves the view
  }, [selectedId]);

  // One pointer drags a zoomed view; two pointers pinch. `dragged` keeps the end of a drag from selecting a building.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ view: View; x: number; y: number; dist: number } | null>(null);
  const dragged = useRef(false);
  const beginGesture = () => {
    const pts = [...pointers.current.values()];
    if (!pts.length) { gesture.current = null; return; }
    const two = pts.length > 1;
    gesture.current = {
      view: goal.current,
      x: two ? (pts[0].x + pts[1].x) / 2 : pts[0].x,
      y: two ? (pts[0].y + pts[1].y) / 2 : pts[0].y,
      dist: two ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
    };
  };
  const onDown = (e: React.PointerEvent) => {
    if (!zoomable || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (pointers.current.size === 0) dragged.current = false;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    beginGesture();
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    tip.track(e);
    const p = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (!p || !g || !stage.current) return;
    p.x = e.clientX;
    p.y = e.clientY;
    const r = stage.current.getBoundingClientRect();
    const pts = [...pointers.current.values()];
    if (pts.length > 1 && g.dist > 0) {
      const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      const zoomedView = zoomAt(g.view, Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) / g.dist, (g.x - r.left) / r.width, (g.y - r.top) / r.height, w, h);
      dragged.current = true;
      jump(panBy(zoomedView, (g.x - mx) / r.width, (g.y - my) / r.height, w, h));
    } else if (g.view.k > 1) {
      const dx = e.clientX - g.x, dy = e.clientY - g.y;
      if (!dragged.current && Math.hypot(dx, dy) < 5) return;
      if (!dragged.current) e.currentTarget.setPointerCapture(e.pointerId);
      dragged.current = true;
      jump(panBy(g.view, -dx / r.width, -dy / r.height, w, h));
    }
  };
  const onUp = (e: React.PointerEvent) => { pointers.current.delete(e.pointerId); beginGesture(); };

  const drag = (e: React.PointerEvent) => {
    if (!stage.current || !(e.buttons & 1)) return;
    const r = stage.current.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };
  const pick = useCallback((id: number) => { if (!dragged.current) onSelect?.(id === selectedId ? null : id); }, [onSelect, selectedId]);
  const selected = buildings?.find((b) => b.building_id === selectedId) ?? null;
  // What the frame shows, in image pixels. The slider's line stays at its place on the screen.
  const vw = w / view.k, vh = h / view.k;
  const clipX = view.x + (pos / 100) * vw;
  // Markers keep their size on the screen at any zoom.
  const unit = Math.min(w, h) / view.k;

  return (
    <div className={`oc${cover ? ' oc-cover' : ''}${ticks ? ' oc-ticked' : ''}`}>
      {ticks && <div className="oc-ticks oc-ticks-x" aria-hidden="true">{[0, 0.25, 0.5, 0.75, 1].map((t) => <span key={t}>{Math.round(view.x + t * vw)}</span>)}</div>}
      {ticks && <div className="oc-ticks oc-ticks-y" aria-hidden="true">{[0, 0.25, 0.5, 0.75, 1].map((t) => <span key={t}>{Math.round(view.y + t * vh)}</span>)}</div>}
      <div className={`oc-stage${view.k > 1 ? ' is-zoomed' : ''}`} ref={stage} style={cover ? undefined : { aspectRatio: `${w} / ${h}` }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <svg viewBox={`${view.x} ${view.y} ${vw} ${vh}`} preserveAspectRatio={cover ? 'xMidYMid slice' : 'xMidYMid meet'} role="group" aria-label={label}>
          <defs>
            <clipPath id={`${uid}-after`}><rect x={clipX} y={0} width={Math.max(0, w - clipX)} height={h} /></clipPath>
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
          {buildings && <BuildingLayer buildings={buildings} layers={layers} selectedId={selectedId} highlight={highlight} hatchId={`${uid}-hatch`} onPick={onSelect ? pick : undefined} onHover={tip.setHover} />}
          {layers.spots && hotspots && (
            <g className="oc-spots">
              {hotspots.hot_spots.map((s) => (
                <g key={`h${s.rank}`} className="oc-spot oc-spot-hot">
                  <circle cx={s.point_xy[0]} cy={s.point_xy[1]} r={unit * 0.03} />
                  <text x={s.point_xy[0]} y={s.point_xy[1]} fontSize={unit * 0.034}>{s.rank}</text>
                </g>
              ))}
              {hotspots.safe_areas.map((s) => {
                const r = unit * 0.027;
                return (
                  <g key={`s${s.rank}`} className="oc-spot oc-spot-safe">
                    <rect x={s.xy[0] - r} y={s.xy[1] - r} width={r * 2} height={r * 2} />
                    <text x={s.xy[0]} y={s.xy[1]} fontSize={unit * 0.026}>S{s.rank}</text>
                  </g>
                );
              })}
            </g>
          )}
          {hasPair && <line className="oc-divider" x1={clipX} x2={clipX} y1={0} y2={h} />}
        </svg>
        {hasPair && (
          <div className="oc-handle" style={{ left: `${pos}%` }} aria-hidden="true"
            onPointerDown={(e) => { e.stopPropagation(); e.currentTarget.setPointerCapture(e.pointerId); drag(e); }} onPointerMove={drag}>
            <span />
          </div>
        )}
        {/* Live position in image pixels, and brackets around the building under the pointer.
            It shows that every position and distance on this site is in the image's own pixels. */}
        {onSelect && FINE_POINTER && (
          <Crosshair containerRef={stage} color={palette === 'dark' ? '#ffffff' : '#12211c'} coordinateSpan={{ x: view.x, y: view.y, width: vw, height: vh }}
            showTargetSize={false} targetSelector=".oc-b" clickPulse={false} smoothing={0.12} opacity={0.9} style={{ zIndex: 1 }} />
        )}
        {onSelect && tip.card}
        {zoomable && (
          <div className="oc-zoom" role="group" aria-label="Zoom the map" onPointerDown={(e) => e.stopPropagation()} onKeyDown={zoomKeys}>
            <button type="button" aria-label="Zoom in" title="Zoom in" aria-disabled={view.k >= MAX_ZOOM} onClick={() => zoomStep(ZOOM_STEP)}><ZoomIn size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Zoom out" title="Zoom out" aria-disabled={view.k <= 1} onClick={() => zoomStep(1 / ZOOM_STEP)}><ZoomOut size={18} aria-hidden="true" /></button>
            <button type="button" aria-label="Show the whole image" title="Show the whole image" aria-disabled={view.k <= 1} onClick={() => zoomTo(FULL_VIEW)}><Maximize size={18} aria-hidden="true" /></button>
            <span className="oc-zoom-keys">Arrow keys move the zoomed map.</span>
            <span className="sr-only" role="status">{zoomSaid}</span>
          </div>
        )}
        {wheelHint && <p className="oc-hint" aria-hidden="true">Hold {ZOOM_KEY} and scroll to zoom the map</p>}
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
          {selected ? <BuildingFacts b={selected} /> : buildings ? 'Click or tap a building to open its facts.' : ''}
        </p>
      )}
    </div>
  );
}
