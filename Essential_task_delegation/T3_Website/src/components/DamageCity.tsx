// The 3D damage city: the same building table as the flat map, each outline raised into a block.
// It is a 3D view of our 2D results, not a reconstruction: the model gives no heights, so a
// block's height only repeats its class (intact tallest, destroyed lowest).
// Drawn as plain SVG: the ground is turned and tilted, every block rises straight up the screen,
// and blocks are painted from the far side of the ground to the near side.
import { useId, useMemo, useState } from 'react';
import type { Building, ClassId, PairEntry } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';
import { pairUrl } from '../core/gallery.ts';
import type { Layers } from './OfflineCanvas.tsx';

/** Block heights as a share of the image's width. They show the class, nothing else. */
const HEIGHT: Record<ClassId, number> = { 1: 0.034, 2: 0.02, 3: 0.006 };
/** How much the ground is flattened by the tilt of the view (1 would be looking straight down). */
const TILT = 0.56;

interface DamageCityProps {
  pair: PairEntry;
  buildings: Building[] | null;
  layers: Layers;
  selectedId: number | null;
  highlight: Set<number> | null;
  onSelect: (id: number | null) => void;
  /** The visitor's own photo, when the pair isn't in the gallery. */
  photoUrl?: string;
}

interface Block { b: Building; depth: number; top: string; wallsLeft: string; wallsRight: string }

export function DamageCity({ pair, buildings, layers, selectedId, highlight, onSelect, photoUrl }: DamageCityProps) {
  const uid = useId().replace(/:/g, '');
  const [turn, setTurn] = useState(30);
  const { width: w, height: h } = pair.info;
  const cos = Math.cos((turn * Math.PI) / 180), sin = Math.sin((turn * Math.PI) / 180);
  // Ground point (image pixels) to the screen: turn about the image's centre, then flatten.
  const matrix = [cos, sin * TILT, -sin, cos * TILT, -(cos * w) / 2 + (sin * h) / 2, (-(sin * w) / 2 - (cos * h) / 2) * TILT];
  const reach = Math.hypot(w, h) / 2;
  const tallest = HEIGHT[1] * w;

  const blocks = useMemo<Block[]>(() => {
    if (!buildings) return [];
    const project = (x: number, y: number): [number, number] => [matrix[0] * x + matrix[2] * y + matrix[4], matrix[1] * x + matrix[3] * y + matrix[5]];
    const at = ([x, y]: [number, number], lift: number) => `${x.toFixed(1)} ${(y - lift).toFixed(1)}`;
    return buildings.map((b) => {
      const lift = HEIGHT[b.class_id] * w;
      const rings = b.outline.map((ring) => ring.map(([x, y]) => project(x, y)));
      const top = rings.map((r) => 'M' + r.map((p) => at(p, lift)).join('L') + 'Z').join('');
      let wallsLeft = '', wallsRight = '';
      rings.forEach((r, ringIndex) => {
        let area = 0;
        for (let i = 0; i < r.length; i++) { const p = r[i], q = r[(i + 1) % r.length]; area += p[0] * q[1] - q[0] * p[1]; }
        // Which way along the ring the building's solid part lies above an edge on the screen.
        // Only those walls face the viewer; the first ring is the outside, later rings are holes.
        const facing = (area > 0) === (ringIndex === 0) ? -1 : 1;
        for (let i = 0; i < r.length; i++) {
          const p = r[i], q = r[(i + 1) % r.length];
          const dx = q[0] - p[0], dy = q[1] - p[1];
          if (dx * facing <= 0) continue;
          // A wall is one edge pulled up. Two shades tell walls that face left from walls that
          // face right, which is what gives the blocks their shape.
          const wall = `M${at(p, 0)}L${at(q, 0)}L${at(q, lift)}L${at(p, lift)}Z`;
          if (dy * facing > 0) wallsLeft += wall; else wallsRight += wall;
        }
      });
      return { b, top, wallsLeft, wallsRight, depth: project(b.centroid_x, b.centroid_y)[1] };
    }).sort((a, c) => a.depth - c.depth);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the matrix is a function of turn, w and h
  }, [buildings, turn, w, h]);

  const shown = buildings?.find((b) => b.building_id === selectedId) ?? null;
  return (
    <div className="oc city">
      <div className="oc-stage" style={{ aspectRatio: `${2 * reach} / ${2 * reach * TILT + tallest + 8}` }}>
        <svg viewBox={`${-reach} ${-reach * TILT - tallest - 4} ${2 * reach} ${2 * reach * TILT + tallest + 8}`} role="group"
          aria-label={`3D view of the damage map of ${pair.info.image}: each building is a block coloured by its class. Buildings are listed in the layers panel.`}>
          <defs>
            <pattern id={`${uid}-hatch`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="14" className="oc-hatch-line" />
            </pattern>
          </defs>
          <g transform={`matrix(${matrix.join(' ')})`}>
            <rect className="oc-ground" width={w} height={h} />
            {pair.has_after && <image href={photoUrl ?? pairUrl(pair.id, 'after.webp')} width={w} height={h} preserveAspectRatio="none" className="city-photo" />}
          </g>
          {blocks.filter(({ b }) => layers.classes[b.class_id]).map(({ b, top, wallsLeft, wallsRight }) => {
            const dim = highlight ? !highlight.has(b.building_id) : false;
            return (
              <g key={b.building_id} className={`city-b oc-c${b.class_id}${dim ? ' is-dim' : ''}${selectedId === b.building_id ? ' is-sel' : ''}`}
                onClick={() => onSelect(b.building_id === selectedId ? null : b.building_id)}>
                <path d={wallsLeft} className="city-wall-left" />
                <path d={wallsRight} className="city-wall-right" />
                <path d={top} fillRule="evenodd" className="city-top" />
                {b.class_id === 3 && !dim && <path d={top} fillRule="evenodd" className="city-hatch" style={{ fill: `url(#${uid}-hatch)` }} />}
              </g>
            );
          })}
        </svg>
        {!pair.has_after && <p className="oc-nophoto">No photo of this pair is on this device. The blocks and numbers are real.</p>}
      </div>
      <label className="oc-slider">
        <span>Turn the view</span>
        <input type="range" min={-180} max={180} step={5} value={turn} onChange={(e) => setTurn(Number(e.target.value))} aria-label="Turn the 3D view, in degrees" />
        <span className="num">{turn}°</span>
      </label>
      <p className="city-note">
        <b>A 3D view of our 2D results, not a reconstruction.</b> The model outlines buildings and grades them; it measures no heights.
        A block's height only repeats its class: intact tallest, damaged lower, destroyed almost flat.
      </p>
      <p className="oc-readout">
        {shown ? (
          <>
            <b>Building {shown.building_id}</b>
            <span className={`swatch swatch-${shown.class_id}`} />
            <span>{CLASS_NAMES[shown.class_id]}</span>
            <span>area {shown.area_px.toLocaleString('en')} px</span>
            <span>{shown.dist_to_nearest_destroyed_px === null ? 'no other destroyed building in this image' : `${shown.dist_to_nearest_destroyed_px} px to the nearest destroyed building`}</span>
          </>
        ) : buildings ? 'Click or tap a block to open its facts.' : ''}
      </p>
    </div>
  );
}
