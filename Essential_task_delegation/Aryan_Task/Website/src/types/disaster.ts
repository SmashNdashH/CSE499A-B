export type DamageLevel = 'intact' | 'damaged' | 'destroyed';

/**
 * Exact Per-Building Table Schema from H2 SQLite Agent (h2-sql-counting-agent.ipynb).
 *
 * Columns:
 * - image: after-image file name
 * - building_id: building number within that image
 * - class_id: 1 = intact, 2 = damaged, 3 = destroyed
 * - class_name: 'intact', 'damaged' or 'destroyed'
 * - area_px: building area in pixels
 * - centroid_x: building centre, pixels from left (0..1024)
 * - centroid_y: building centre, pixels from top (0..1024)
 * - bbox_x: bounding box top-left x, pixels
 * - bbox_y: bounding box top-left y, pixels
 * - bbox_w: bounding box width, pixels
 * - bbox_h: bounding box height, pixels
 * - dist_to_nearest_destroyed_px: straight-line distance to centroid of nearest destroyed building
 */
export interface BuildingFeature {
  // H2 Table Columns
  image: string;
  building_id: number;
  class_id: 1 | 2 | 3;
  class_name: DamageLevel;
  area_px: number;
  centroid_x: number;
  centroid_y: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  dist_to_nearest_destroyed_px: number | null;

  // UI mapping / convenience helpers for rendering
  id: string; // formatted ID string (e.g. "B-1", "B-2")
  name: string; // display label (e.g. "Building #1")
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width: number; // percentage width (0 - 100)
  height: number; // percentage height (0 - 100)
  quadrant: 'NW' | 'NE' | 'SW' | 'SE' | 'Central';
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface DisasTellerProofReport {
  id: string;
  filename: string;
  title: string;
  path: string;
  content: string;
}

export interface DisasterScenario {
  id: string;
  title: string;
  location: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  disasterType: string;
  date: string;
  resolution: string;
  totalBuildings: number;
  damageCounts: {
    intact: number;
    damaged: number;
    destroyed: number;
  };
  sampleGuidancePrompt: string;
  sampleVlmResponse: string;
  buildings: BuildingFeature[];
  beforeDate?: string;
  afterDate?: string;
  isIllustration: true;
}

export interface SprintTrack {
  id: string;
  name: string;
  owner: string;
  testedTechnique: string;
  rationale: string;
  resultSummary: string;
  badgeColor: string;
  baselineScore: number;
  finalScore: number;
  metricLabel: string;
  sourcePath: string;
  details: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  focus: string;
}

export interface ResearchDocument {
  id: string;
  title: string;
  category: string;
  date: string;
  path: string;
  summary: string;
}
