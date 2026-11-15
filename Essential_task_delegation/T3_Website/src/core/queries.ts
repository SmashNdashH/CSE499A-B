// The fixed question templates. Each one is a hand-written query over the building table's columns.
// Nothing here fills in a missing value: a null distance never matches a distance question.
import type { Building, ClassId } from '../types/disaster.ts';

export const DISTANCES_PX = [50, 100, 200];

export function countsByClass(buildings: Building[]): Record<ClassId, number> {
  const n: Record<ClassId, number> = { 1: 0, 2: 0, 3: 0 };
  for (const b of buildings) n[b.class_id]++;
  return n;
}

/** Buildings of one class within `px` of a destroyed building (centre to centre). */
export function withinOfDestroyed(buildings: Building[], cls: ClassId, px: number): Building[] {
  return buildings.filter((b) => b.class_id === cls && b.dist_to_nearest_destroyed_px !== null && b.dist_to_nearest_destroyed_px <= px);
}

/** The largest building of a class by area, or null when the image has none of that class. */
export function largestOfClass(buildings: Building[], cls: ClassId): Building | null {
  let best: Building | null = null;
  for (const b of buildings) if (b.class_id === cls && (!best || b.area_px > best.area_px)) best = b;
  return best;
}
