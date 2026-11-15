// The data shapes of DATA_CONTRACT.md. One building is one row of the building table plus its outline.

export type ClassId = 1 | 2 | 3;
export type ClassName = 'intact' | 'damaged' | 'destroyed';
export const CLASS_NAMES: Record<ClassId, ClassName> = { 1: 'intact', 2: 'damaged', 3: 'destroyed' };
export const CLASS_IDS: ClassId[] = [1, 2, 3];

/** A closed ring of [x, y] vertices in image pixels (x from the left edge, y from the top). */
export type Ring = [number, number][];

export interface Building {
  image: string;
  building_id: number;
  class_id: ClassId;
  class_name: ClassName;
  area_px: number;
  centroid_x: number;
  centroid_y: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  /** Centre to centre, to the nearest OTHER destroyed building; null when the image has none. */
  dist_to_nearest_destroyed_px: number | null;
  /** First ring is the outer boundary, any further rings are holes. */
  outline: Ring[];
}

export interface HotSpot {
  rank: number;
  point_xy: [number, number];
  area_px: number;
  peak: number;
  edge_px: number;
  where: string;
  on_gt_destroyed?: boolean;
  on_gt_damage?: boolean;
  point_on_gt_destroyed?: boolean;
  point_on_gt_damage?: boolean;
}

export interface SafeArea {
  rank: number;
  xy: [number, number];
  distance_px: number;
  edge_px: number;
  where: string;
  on_gt_building?: boolean;
}

export interface HotSpots {
  hot_spots: HotSpot[];
  safe_areas: SafeArea[];
}

/** IoU per class against the ground truth for one image; null when the class is in neither mask. */
export interface Accuracy {
  iou: { background: number | null; intact: number | null; damaged: number | null; destroyed: number | null };
}

export interface MethodSource {
  model: string;
  tta: boolean;
  checkpoint: string | null;
  notebook: string;
  date: string;
  fixture?: boolean;
}

export interface PairInfo {
  event: string;
  source: 'xBD' | 'other';
  split: string;
  image: string;
  width: number;
  height: number;
  /** Optional: the pair the Home page opens on. Without it, the first pair is used. */
  hero?: boolean;
  fixture?: boolean;
}

/** One method's entry in the index the validator writes. */
export interface MethodEntry {
  id: string;
  source: MethodSource;
  has_report_inputs: boolean;
}

/** One pair's entry in public/data/index.json, written by scripts/validate-data.ts. */
export interface PairEntry {
  id: string;
  info: PairInfo;
  has_before: boolean;
  has_after: boolean;
  methods: MethodEntry[];
}

export interface GalleryIndex {
  fixture: boolean;
  pairs: PairEntry[];
}
