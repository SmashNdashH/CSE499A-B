// One building's row of the table as a short line, and the same line in a small card that follows
// a mouse pointer over the map. Touch screens have no pointer to follow: there a tap selects the
// building, and its line shows under the map.
import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { Building } from '../types/disaster.ts';
import { CLASS_NAMES } from '../types/disaster.ts';

export function BuildingFacts({ b }: { b: Building }) {
  return (
    <>
      <b>Building {b.building_id}</b>
      <span className={`swatch swatch-${b.class_id}`} />
      <span>{CLASS_NAMES[b.class_id]}</span>
      <span>area {b.area_px.toLocaleString('en')} px</span>
      <span>{b.dist_to_nearest_destroyed_px === null ? 'no other destroyed building in this image' : `${b.dist_to_nearest_destroyed_px} px to the nearest destroyed building`}</span>
    </>
  );
}

/**
 * The card beside the pointer. `stage` is the frame it must stay inside; put `card` in that frame,
 * call `track` on the frame's pointer moves and `setHover` when a mouse enters or leaves a building.
 */
export function useBuildingTip(stage: RefObject<HTMLElement | null>) {
  const [hover, setHover] = useState<Building | null>(null);
  const tip = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0 });

  // Beside the pointer, and flipped to its other side near the frame's right and bottom edges.
  const place = useCallback(() => {
    const el = tip.current;
    if (!el || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = mouse.current.x - r.left, y = mouse.current.y - r.top;
    const left = x + 18 + el.offsetWidth > r.width ? x - 14 - el.offsetWidth : x + 18;
    const top = y + 18 + el.offsetHeight > r.height ? y - 14 - el.offsetHeight : y + 18;
    el.style.transform = `translate(${Math.round(Math.max(4, left))}px, ${Math.round(Math.max(4, top))}px)`;
  }, [stage]);
  useLayoutEffect(place, [hover, place]);

  const track = useCallback((e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    mouse.current = { x: e.clientX, y: e.clientY };
    place();
  }, [place]);

  const card = <div ref={tip} className="oc-tip" aria-hidden="true" hidden={!hover}>{hover && <BuildingFacts b={hover} />}</div>;
  return { setHover, track, card };
}
