export type DamageLevel = 'no-damage' | 'minor-damage' | 'major-damage' | 'destroyed';

export interface BuildingFeature {
  id: string;
  name: string;
  lat: number;
  lng: number;
  polygon?: [number, number][]; // [lat, lng] array for polygon
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  width: number; // percentage
  height: number;
  damage: DamageLevel;
  confidence: number;
  floors: number;
  collapseType: 'Pancake' | 'Lean-Over' | 'Soft-Story' | 'Rubble Heap' | 'Intact' | 'Roof Loss';
  voidLikelihood: 'High' | 'Medium' | 'Low' | 'None';
  sensorRecommendation: 'Acoustic Listening Device' | 'Ground Penetrating Radar' | 'Search Cam Probe' | 'K9 SAR Unit' | 'Visual Clearance Only';
  notes: string;
  quadrant: 'NW' | 'NE' | 'SW' | 'SE' | 'Central';
  areaM2?: number; // per H2 table
  distanceToNearestDestroyedM?: number; // per H2 table
  ems98Grade?: 'G1' | 'G2' | 'G3' | 'G4' | 'G5';
}

export interface DisasTellerCitation {
  id: string;
  source: string;
  text: string;
}

export interface DisasTellerReport {
  mode: 'offline, fixed flow' | 'online';
  flowType: 'fixed_flow.py (deterministic tool execution)';
  generatedAt: string;
  expertTeam: {
    overview: string;
    buildingGrades: { buildingId: string; buildingName: string; grade: 'G1' | 'G2' | 'G3' | 'G4' | 'G5'; rationale: string; citation: string }[];
    conclusions: string;
  };
  alertsTeam: {
    dangerAreaAlert: string;
    secondaryHazards: string;
    socialMediaBroadcast: string;
  };
  emergencyServiceTeam: {
    emergencyShelters: string;
    hospitalsTriage: string;
    immediateTransportationRecovery: string;
    sphereStandard: string;
  };
  resourceAllocationTeam: {
    usarTeamTypes: string;
    asrLevels: string;
    worksiteTriagePriorities: string;
    shiftRotations: string;
  };
  publicCommunityReport: {
    headline: string;
    evacuationShelterDirectives: string;
    essentialSuppliesAdvice: string;
  };
  reconstructionPlan: {
    repairRetrofitRebuild: string;
    debrisManagement: string;
    buildingCodesCompliance: string;
    financialBudgetNotice: string; // Strictly "Money needed: not available offline" per Section 2.2
  };
  citations: DisasTellerCitation[];
}

export interface DisasterScenario {
  id: string;
  title: string;
  location: string;
  centerLat: number;
  centerLng: number;
  defaultZoom: number;
  disasterType: 'Earthquake (M7.8)' | 'Category 4 Hurricane' | 'Urban Flash Flood';
  date: string;
  resolution: string;
  totalBuildings: number;
  damageCounts: {
    noDamage: number;
    minor: number;
    major: number;
    destroyed: number;
  };
  sampleGuidancePrompt: string;
  sampleVlmResponse: string;
  buildings: BuildingFeature[];
  disasTellerReport?: DisasTellerReport;
  beforeDate?: string;
  afterDate?: string;
}

export interface SprintTrack {
  id: string;
  name: string;
  owner: string;
  testedTechnique: string;
  rationale: string;
  resultSummary: string;
  badgeColor: string;
  baselineScore: number; // mIoU or Destroyed IoU
  finalScore: number;
  metricLabel: string;
  details: string[];
}
