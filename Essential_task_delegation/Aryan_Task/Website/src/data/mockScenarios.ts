import { DisasterScenario, SprintTrack } from '../types/disaster';

// Helper to make polygon coordinates from center lat/lng
function makePolygon(lat: number, lng: number, dLat: number, dLng: number): [number, number][] {
  return [
    [lat - dLat, lng - dLng],
    [lat - dLat, lng + dLng],
    [lat + dLat, lng + dLng],
    [lat + dLat, lng - dLng]
  ];
}

export const SCENARIOS: DisasterScenario[] = [
  {
    id: 'turkey-sector-7',
    title: 'Kahramanmaraş Urban Sector 4',
    location: 'Pazarcık, Türkiye',
    centerLat: 37.5752,
    centerLng: 36.9231,
    defaultZoom: 17,
    disasterType: 'Earthquake (M7.8)',
    date: 'February 2023 / xBD Post-Event',
    beforeDate: 'January 2023 (Pre-Event Baseline)',
    afterDate: 'February 2023 (Post-Event GSD 0.3m)',
    resolution: '0.3m / pixel GSD (WorldView-3)',
    totalBuildings: 12,
    damageCounts: {
      noDamage: 3,
      minor: 2,
      major: 3,
      destroyed: 4
    },
    sampleGuidancePrompt: 'Analyze this post-earthquake aerial image and identify priority zones for search and rescue operations.',
    sampleVlmResponse: `PRIORITY 1 - ZONE A (NE Quadrant):
Structure #B-104 & #B-106 show multi-tier pancake collapse (4-5 residential storeys compressed into ~2.5m rubble profile). 
Tactical Directive: Prioritize extraction at perimeter column intersections on the eastern façade. Rubble acts as thermal insulator; dispatch Ground Penetrating Radar (GPR) and acoustic listening arrays immediately.

PRIORITY 2 - ZONE B (Central Grid):
Structure #B-108 exhibits severe lean-over shear failure with load-bearing masonry failure. A survivable triangular void pocket is identified along the southern foundation perimeter.
Tactical Directive: Deploy telescopic search camera through southern void opening. Do not enter from western debris slope.

SAFETY WARNING - ZONE C (SW Quadrant):
Structure #B-112 suffered complete catastrophic disintegration (rubble heap) with active high secondary collapse risk from adjacent compromised firewall. Clear perimeter; defer heavy equipment until shoring arrives.`,
    buildings: [
      {
        id: 'B-101',
        name: 'Municipal Annex A',
        lat: 37.5768,
        lng: 36.9208,
        polygon: makePolygon(37.5768, 36.9208, 0.0003, 0.0004),
        x: 14,
        y: 16,
        width: 14,
        height: 12,
        damage: 'no-damage',
        confidence: 0.96,
        floors: 3,
        collapseType: 'Intact',
        voidLikelihood: 'None',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Reinforced concrete frame intact. Usable as Field Command Post and casualty staging.',
        quadrant: 'NW',
        areaM2: 240,
        distanceToNearestDestroyedM: 450,
        ems98Grade: 'G1'
      },
      {
        id: 'B-102',
        name: 'Commercial Bank Block',
        lat: 37.5766,
        lng: 36.9224,
        polygon: makePolygon(37.5766, 36.9224, 0.00035, 0.00045),
        x: 32,
        y: 15,
        width: 15,
        height: 13,
        damage: 'minor-damage',
        confidence: 0.91,
        floors: 4,
        collapseType: 'Roof Loss',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Parapet dislodgement and roof tiling damage. Internal structure sound.',
        quadrant: 'NW',
        areaM2: 310,
        distanceToNearestDestroyedM: 320,
        ems98Grade: 'G2'
      },
      {
        id: 'B-103',
        name: 'Avenue Pharmacy Block',
        lat: 37.5767,
        lng: 36.9242,
        polygon: makePolygon(37.5767, 36.9242, 0.00035, 0.00045),
        x: 54,
        y: 14,
        width: 16,
        height: 14,
        damage: 'major-damage',
        confidence: 0.88,
        floors: 5,
        collapseType: 'Soft-Story',
        voidLikelihood: 'Medium',
        sensorRecommendation: 'Search Cam Probe',
        notes: 'Ground floor retail soft-story crushed; upper 4 floors tilted 12 degrees. Void along north alley.',
        quadrant: 'NE',
        areaM2: 380,
        distanceToNearestDestroyedM: 140,
        ems98Grade: 'G4'
      },
      {
        id: 'B-104',
        name: 'Yildiz Residential Tower A',
        lat: 37.5765,
        lng: 36.9260,
        polygon: makePolygon(37.5765, 36.9260, 0.0004, 0.0005),
        x: 76,
        y: 15,
        width: 18,
        height: 16,
        damage: 'destroyed',
        confidence: 0.94,
        floors: 5,
        collapseType: 'Pancake',
        voidLikelihood: 'High',
        sensorRecommendation: 'Acoustic Listening Device',
        notes: 'Severe pancake collapse of floors 1-3. Void pockets highly probable at interior shear wall seams.',
        quadrant: 'NE',
        areaM2: 420,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      },
      {
        id: 'B-105',
        name: 'Bakery & Residence',
        lat: 37.5752,
        lng: 36.9210,
        polygon: makePolygon(37.5752, 36.9210, 0.00028, 0.00035),
        x: 16,
        y: 42,
        width: 13,
        height: 11,
        damage: 'no-damage',
        confidence: 0.95,
        floors: 2,
        collapseType: 'Intact',
        voidLikelihood: 'None',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Single-story masonry undisturbed. Clear access road.',
        quadrant: 'Central',
        areaM2: 180,
        distanceToNearestDestroyedM: 290,
        ems98Grade: 'G1'
      },
      {
        id: 'B-106',
        name: 'Yildiz Residential Tower B',
        lat: 37.5753,
        lng: 36.9258,
        polygon: makePolygon(37.5753, 36.9258, 0.0004, 0.0005),
        x: 77,
        y: 38,
        width: 17,
        height: 15,
        damage: 'destroyed',
        confidence: 0.92,
        floors: 4,
        collapseType: 'Pancake',
        voidLikelihood: 'High',
        sensorRecommendation: 'Ground Penetrating Radar',
        notes: 'Complete slab compaction. Structural concrete blocks thermal IR. Deploy GPR on east perimeter.',
        quadrant: 'NE',
        areaM2: 390,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      },
      {
        id: 'B-107',
        name: 'School Gymnasium',
        lat: 37.5751,
        lng: 36.9226,
        polygon: makePolygon(37.5751, 36.9226, 0.00035, 0.00045),
        x: 34,
        y: 42,
        width: 18,
        height: 14,
        damage: 'minor-damage',
        confidence: 0.89,
        floors: 1,
        collapseType: 'Roof Loss',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Truss roof damaged; walls standing. Low occupancy during event.',
        quadrant: 'Central',
        areaM2: 520,
        distanceToNearestDestroyedM: 260,
        ems98Grade: 'G2'
      },
      {
        id: 'B-108',
        name: 'Central Plaza Apartments',
        lat: 37.5750,
        lng: 36.9244,
        polygon: makePolygon(37.5750, 36.9244, 0.00038, 0.00048),
        x: 54,
        y: 44,
        width: 16,
        height: 16,
        damage: 'major-damage',
        confidence: 0.93,
        floors: 4,
        collapseType: 'Lean-Over',
        voidLikelihood: 'High',
        sensorRecommendation: 'Search Cam Probe',
        notes: 'Severe lean-over towards south. Triangular void cavity along ground south-facing wall.',
        quadrant: 'Central',
        areaM2: 410,
        distanceToNearestDestroyedM: 110,
        ems98Grade: 'G4'
      },
      {
        id: 'B-109',
        name: 'Medical Clinic',
        lat: 37.5738,
        lng: 36.9212,
        polygon: makePolygon(37.5738, 36.9212, 0.00035, 0.00045),
        x: 16,
        y: 70,
        width: 16,
        height: 14,
        damage: 'no-damage',
        confidence: 0.97,
        floors: 2,
        collapseType: 'Intact',
        voidLikelihood: 'None',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'No structural cracks. Generator online.',
        quadrant: 'SW',
        areaM2: 220,
        distanceToNearestDestroyedM: 280,
        ems98Grade: 'G1'
      },
      {
        id: 'B-110',
        name: 'Gaziantep Grocery Store',
        lat: 37.5736,
        lng: 36.9228,
        polygon: makePolygon(37.5736, 36.9228, 0.00032, 0.0004),
        x: 36,
        y: 68,
        width: 14,
        height: 13,
        damage: 'major-damage',
        confidence: 0.86,
        floors: 2,
        collapseType: 'Soft-Story',
        voidLikelihood: 'Medium',
        sensorRecommendation: 'K9 SAR Unit',
        notes: 'Partial façade collapse. K9 team alert recommended before clearance.',
        quadrant: 'SW',
        areaM2: 270,
        distanceToNearestDestroyedM: 160,
        ems98Grade: 'G3'
      },
      {
        id: 'B-111',
        name: 'Sunset Apartments Block C',
        lat: 37.5737,
        lng: 36.9245,
        polygon: makePolygon(37.5737, 36.9245, 0.0004, 0.0005),
        x: 54,
        y: 70,
        width: 17,
        height: 16,
        damage: 'destroyed',
        confidence: 0.95,
        floors: 5,
        collapseType: 'Rubble Heap',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Acoustic Listening Device',
        notes: 'Total pulverization. High compaction ratio. Use seismic audio sensors to listen for tapping.',
        quadrant: 'SE',
        areaM2: 440,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      },
      {
        id: 'B-112',
        name: 'Old Town Heritage Block',
        lat: 37.5735,
        lng: 36.9262,
        polygon: makePolygon(37.5735, 36.9262, 0.00045, 0.00055),
        x: 76,
        y: 68,
        width: 18,
        height: 18,
        damage: 'destroyed',
        confidence: 0.97,
        floors: 3,
        collapseType: 'Rubble Heap',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Ground Penetrating Radar',
        notes: 'Unreinforced brick rubble. Hazardous power line dangling over western boundary.',
        quadrant: 'SE',
        areaM2: 460,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      }
    ],
    disasTellerReport: {
      mode: 'offline, fixed flow',
      flowType: 'fixed_flow.py (deterministic tool execution)',
      generatedAt: '10 Nov 2026, 08:14 UTC (Kaggle Offline Session, Telemetry: OFF)',
      expertTeam: {
        overview: 'Post-earthquake aerial imagery across Kahramanmaraş Sector 4 reveals catastrophic structural degradation concentrated along the eastern faultward perimeter. Of 12 primary monitored footprints, 4 structures exhibit Grade 5 total collapse (33.3%), 3 exhibit Grade 3-4 heavy structural failure (25.0%), and 5 remain structurally sound or slightly impaired (41.7%).',
        buildingGrades: [
          { buildingId: 'B-101', buildingName: 'Municipal Annex A', grade: 'G1', rationale: 'Intact reinforced concrete column-slab joints. No macro shearing.', citation: '[EMS98-rc-frame-grade-1]' },
          { buildingId: 'B-102', buildingName: 'Commercial Bank Block', grade: 'G2', rationale: 'Parapet cracking and non-structural masonry spalling; core sound.', citation: '[EMS98-masonry-grade-2]' },
          { buildingId: 'B-103', buildingName: 'Avenue Pharmacy Block', grade: 'G4', rationale: 'Soft-story collapse of ground-floor retail piers; upper levels tilted 12°.', citation: '[EMS98-rc-frame-grade-4]' },
          { buildingId: 'B-104', buildingName: 'Yildiz Residential Tower A', grade: 'G5', rationale: 'Total pancake collapse across 5 storeys; floor slabs compacted to 2.5m profile.', citation: '[EMS98-masonry-grade-5]' },
          { buildingId: 'B-106', buildingName: 'Yildiz Residential Tower B', grade: 'G5', rationale: 'Full compaction of structural bays; severe shear failure.', citation: '[EMS98-masonry-grade-5]' },
          { buildingId: 'B-108', buildingName: 'Central Plaza Apartments', grade: 'G4', rationale: 'Lateral shear lean-over; load-bearing masonry detached on south wall.', citation: '[EMS98-masonry-grade-4]' },
          { buildingId: 'B-111', buildingName: 'Sunset Apartments Block C', grade: 'G5', rationale: 'Complete pulverization into heterogeneous rubble heap.', citation: '[EMS98-rc-frame-grade-5]' },
          { buildingId: 'B-112', buildingName: 'Old Town Heritage Block', grade: 'G5', rationale: 'Catastrophic disintegration with unstable leaning unreinforced brick firewall.', citation: '[EMS98-masonry-grade-5]' }
        ],
        conclusions: 'Primary survivor entrapment is concentrated in Zone A (#B-104, #B-106). Dense concrete slabs attenuate drone thermal IR; immediate deployment of Ground Penetrating Radar (GPR) and seismic geophones is strictly required.'
      },
      alertsTeam: {
        dangerAreaAlert: 'CRITICAL HAZARD WARNING: Zone SE (#B-112) is declared RED-TAG EXCLUSION ZONE. Unreinforced brick firewall leans 18° westward over Avenue Central with active aftershock collapse hazard.',
        secondaryHazards: 'Live 11kV electrical cables dangling over western perimeter of Grid 76/68. Gas line shutoff valve verified active at Grid 14/16.',
        socialMediaBroadcast: 'OFFICIAL EMS BROADCAST: Avoid Avenue Central South. Municipal Annex (#B-101) open for emergency registration and triage. Report trapped survivor acoustic signals to Sector Command on VHF Ch. 7.'
      },
      emergencyServiceTeam: {
        emergencyShelters: 'Municipal Annex A (#B-101, 240 m²) and School Gymnasium (#B-107, 520 m²) designated primary temporary shelters. Combined covered capacity: 217 persons calculated strictly under Sphere Minimum Standards.',
        hospitalsTriage: 'Medical Clinic (#B-109, Grade 1) designated Casualty Collection Point (CCP). Backup generator verified operational; 4 critical trauma stabilization bays active.',
        immediateTransportationRecovery: 'Ingress Route Alpha along Avenue Central cleared for 4x4 USAR vehicles up to Grid 54. Heavy earthmoving machinery prohibited beyond Grid 54 until shoring arrives.',
        sphereStandard: 'Sphere Standard [SPHERE-3-p1]: Minimum 3.5 m² of covered living space per person. Sphere Standard [SPHERE-1-p4]: Minimum 15 litres of potable water per person per day required.'
      },
      resourceAllocationTeam: {
        usarTeamTypes: 'INSARAG Guidelines [INSARAG3-3.2-p3]: Request dispatch of 1 Heavy USAR Team (reinforced concrete cutting, crane rigging) and 2 Medium USAR Teams for multi-void search.',
        asrLevels: 'ASR Level 3 (Rapid Search & Rescue) active for #B-108 and #B-103. ASR Level 4 (Heavy Search & Rescue / Concrete Piercing) assigned to pancake collapse #B-104 [INSARAG2B-5.7.1-p6].',
        worksiteTriagePriorities: 'INSARAG Worksite Triage [INSARAG2B-5.8.1-p1]: Confirmed live survivor tapping at #B-104 takes top extraction priority over unconfirmed void searches.',
        shiftRotations: 'Standard 12-hour operational periods. Teams rotated every 4 hours of heavy breaching work to mitigate responder fatigue and atmospheric dust inhalation.'
      },
      publicCommunityReport: {
        headline: 'Emergency Public Notice - Sector 4 Urban Survival Directives',
        evacuationShelterDirectives: 'All uninjured residents must assemble at School Gymnasium (#B-107) on Avenue Central North. Do not attempt self-rescue in collapsed buildings #B-104, #B-106, or #B-111 due to void instability.',
        essentialSuppliesAdvice: 'Boil all tap water for minimum 3 minutes. Emergency water distribution active at Municipal Annex (#B-101) entrance daily at 08:00 and 16:00.'
      },
      reconstructionPlan: {
        repairRetrofitRebuild: 'Structures #B-101, #B-102, #B-105, #B-107, #B-109 classified for Phase 1 Rapid Retrofit & Minor Re-occupancy [SPHERE-2-p6]. Structures #B-104, #B-106, #B-111, #B-112 slated for demolition and debris clearing.',
        debrisManagement: 'Estimated 4,800 tonnes of concrete and masonry rubble. Debris staging buffer designated on vacant lot Grid 30/80 away from active ingress corridors.',
        buildingCodesCompliance: 'Future reconstruction must mandate seismic ductile detailing in compliance with Turkish Seismic Code (TBDY 2018) for soft-story mitigation.',
        financialBudgetNotice: 'Money needed: not available offline (Historical financial cost tables require field census; estimates disabled offline per Section 2.2).'
      },
      citations: [
        { id: '[EMS98-masonry-grade-5]', source: 'EMS-98 Guidelines', text: 'Grade 5: Total or near-total collapse of masonry building; destruction of structural elements.' },
        { id: '[EMS98-rc-frame-grade-4]', source: 'EMS-98 Guidelines', text: 'Grade 4: Very heavy structural damage to reinforced concrete frames; partial collapse of storeys or soft-story.' },
        { id: '[INSARAG2B-5.8.1-p1]', source: 'INSARAG Guidelines Vol II Manual B', text: 'Worksite Triage: Confirmed live victims have priority over possible live victims, who in turn have priority over recovery of deceased victims.' },
        { id: '[INSARAG2B-5.7.1-p6]', source: 'INSARAG Guidelines Vol II Manual B', text: 'ASR Level 4 (Full Search and Rescue): Complete physical search and technical search of an assigned worksite to locate and rescue trapped persons.' },
        { id: '[INSARAG3-3.2-p3]', source: 'INSARAG Guidelines Vol III', text: 'Heavy USAR teams are required to have operational capability for continuous 24-hour operations at two separate worksites simultaneously.' },
        { id: '[SPHERE-3-p1]', source: 'Sphere Handbook 2018 Shelter Chapter', text: 'Covered living space: Ensure a minimum of 3.5m² of covered living space per person, excluding cooking and sanitation facilities.' },
        { id: '[SPHERE-2-p6]', source: 'Sphere Handbook 2018 Shelter Chapter', text: 'Repairs and retrofitting: Prioritise return to habitable homes through supply of materials, structural assessment and technical support.' }
      ]
    }
  },
  {
    id: 'hurricane-ian-zone',
    title: 'Fort Myers Coastal Strip',
    location: 'Florida, USA',
    centerLat: 26.4520,
    centerLng: -81.9489,
    defaultZoom: 17,
    disasterType: 'Category 4 Hurricane',
    date: 'September 2022 / NOAA Post-Storm UAV',
    beforeDate: 'August 2022 (Pre-Storm Baseline)',
    afterDate: 'September 2022 (Post-Storm Drone RGB)',
    resolution: '0.1m / pixel GSD (Drone RGB)',
    totalBuildings: 6,
    damageCounts: {
      noDamage: 0,
      minor: 2,
      major: 2,
      destroyed: 2
    },
    sampleGuidancePrompt: 'Identify storm surge washouts and structural envelope failures.',
    sampleVlmResponse: `COASTAL SECTOR REPORT - HURRICANE IAN:
Zone 1 (Waterfront Barrier): 2 residential properties completely washed off pilings; foundation slabs exposed.
Zone 2 (Second Tier): 2 homes have severe roof envelope striping (>50% decking lost). Interior water accumulation.
Access Route: Boulevard south is blocked by 1.2m storm debris. Ingress must occur from Northern Causeway.`,
    buildings: [
      {
        id: 'H-01',
        name: 'Beachfront Villa 1',
        lat: 26.4532,
        lng: -81.9510,
        polygon: makePolygon(26.4532, -81.9510, 0.0003, 0.0004),
        x: 18,
        y: 20,
        width: 16,
        height: 16,
        damage: 'destroyed',
        confidence: 0.96,
        floors: 2,
        collapseType: 'Rubble Heap',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Structure pushed into canal. Pile foundation sheared by storm surge.',
        quadrant: 'NW',
        areaM2: 280,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      },
      {
        id: 'H-02',
        name: 'Beachfront Villa 2',
        lat: 26.4530,
        lng: -81.9485,
        polygon: makePolygon(26.4530, -81.9485, 0.0003, 0.0004),
        x: 40,
        y: 22,
        width: 15,
        height: 15,
        damage: 'destroyed',
        confidence: 0.94,
        floors: 2,
        collapseType: 'Rubble Heap',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Total envelope detachment. Only concrete stilts remain.',
        quadrant: 'NW',
        areaM2: 260,
        distanceToNearestDestroyedM: 0,
        ems98Grade: 'G5'
      },
      {
        id: 'H-03',
        name: 'Canal Residence East',
        lat: 26.4528,
        lng: -81.9460,
        polygon: makePolygon(26.4528, -81.9460, 0.00035, 0.00045),
        x: 65,
        y: 25,
        width: 18,
        height: 17,
        damage: 'major-damage',
        confidence: 0.91,
        floors: 2,
        collapseType: 'Roof Loss',
        voidLikelihood: 'Medium',
        sensorRecommendation: 'Search Cam Probe',
        notes: 'Roof framing collapsed into upper floor. Ground level flooded with 0.8m standing water.',
        quadrant: 'NE',
        areaM2: 320,
        distanceToNearestDestroyedM: 190,
        ems98Grade: 'G4'
      },
      {
        id: 'H-04',
        name: 'Inland Residence 1',
        lat: 26.4510,
        lng: -81.9505,
        polygon: makePolygon(26.4510, -81.9505, 0.00032, 0.0004),
        x: 20,
        y: 55,
        width: 16,
        height: 15,
        damage: 'minor-damage',
        confidence: 0.89,
        floors: 1,
        collapseType: 'Roof Loss',
        voidLikelihood: 'None',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Wind-driven shingle damage. Inhabitable; occupants sheltered on second level.',
        quadrant: 'SW',
        areaM2: 210,
        distanceToNearestDestroyedM: 220,
        ems98Grade: 'G2'
      },
      {
        id: 'H-05',
        name: 'Inland Residence 2',
        lat: 26.4508,
        lng: -81.9480,
        polygon: makePolygon(26.4508, -81.9480, 0.00032, 0.0004),
        x: 45,
        y: 58,
        width: 17,
        height: 16,
        damage: 'minor-damage',
        confidence: 0.92,
        floors: 1,
        collapseType: 'Intact',
        voidLikelihood: 'None',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Minor perimeter tree impact on garage. Main house envelope intact.',
        quadrant: 'Central',
        areaM2: 240,
        distanceToNearestDestroyedM: 240,
        ems98Grade: 'G2'
      },
      {
        id: 'H-06',
        name: 'Marina Supply Shed',
        lat: 26.4506,
        lng: -81.9455,
        polygon: makePolygon(26.4506, -81.9455, 0.00038, 0.00048),
        x: 70,
        y: 60,
        width: 19,
        height: 18,
        damage: 'major-damage',
        confidence: 0.95,
        floors: 1,
        collapseType: 'Lean-Over',
        voidLikelihood: 'Low',
        sensorRecommendation: 'Visual Clearance Only',
        notes: 'Pre-engineered steel frame bent 25 degrees. Hazardous fuel tanks stored adjacent.',
        quadrant: 'SE',
        areaM2: 350,
        distanceToNearestDestroyedM: 250,
        ems98Grade: 'G4'
      }
    ],
    disasTellerReport: {
      mode: 'offline, fixed flow',
      flowType: 'fixed_flow.py (deterministic tool execution)',
      generatedAt: '10 Nov 2026, 08:22 UTC (Kaggle Offline Session, Telemetry: OFF)',
      expertTeam: {
        overview: 'Post-hurricane coastal sector damage assessment at Fort Myers indicates severe storm surge scouring along beachfront lots and wind-induced roof framing detachment on inland dwellings.',
        buildingGrades: [
          { buildingId: 'H-01', buildingName: 'Beachfront Villa 1', grade: 'G5', rationale: 'Complete superstructure washed into canal; foundation piles sheared.', citation: '[XBD-joint-damage-scale]' },
          { buildingId: 'H-02', buildingName: 'Beachfront Villa 2', grade: 'G5', rationale: 'Total structural envelope detachment; bare pilings.', citation: '[XBD-joint-damage-scale]' },
          { buildingId: 'H-03', buildingName: 'Canal Residence East', grade: 'G4', rationale: 'Roof framing collapsed into upper floor with 0.8m standing storm surge.', citation: '[IWGSEM-damage-guide]' },
          { buildingId: 'H-04', buildingName: 'Inland Residence 1', grade: 'G2', rationale: 'Shingle striping and broken window glazing; structural studs intact.', citation: '[EMS98-masonry-grade-2]' }
        ],
        conclusions: 'Immediate search required along inland canal banks for displaced residents. Fuel storage at #H-06 requires environmental containment.'
      },
      alertsTeam: {
        dangerAreaAlert: 'HAZMAT ALERT: Marina Shed #H-06 stores unsealed 200L marine diesel drums at risk of leak into canal waters.',
        secondaryHazards: 'Submerged debris in canal and downed high-voltage power lines across southern access route.',
        socialMediaBroadcast: 'USAR ADVISORY: Northern Causeway is sole approved egress. Do not traverse flooded beachfront roads due to hidden sinkholes.'
      },
      emergencyServiceTeam: {
        emergencyShelters: 'Inland Community Center (North) designated staging point. Estimated capacity: 140 persons.',
        hospitalsTriage: 'Field Triage Post established at Causeway Checkpoint 1. Water ambulance assigned to canal extraction.',
        immediateTransportationRecovery: 'Northern Causeway open. South Boulevard impassable due to 1.2m sand & debris barrier.',
        sphereStandard: 'Sphere Standard [SPHERE-3-p1]: Minimum 3.5 m² living space required per evacuee.'
      },
      resourceAllocationTeam: {
        usarTeamTypes: 'Dispatch 1 Light USAR Team with inflatable rescue boats (IRB) and swiftwater extraction equipment.',
        asrLevels: 'ASR Level 2 (Sector Assessment) completed. ASR Level 3 active on canal residences #H-03.',
        worksiteTriagePriorities: 'Search Canal Residence East (#H-03) first due to high water level entrapment hazard.',
        shiftRotations: '8-hour waterborne rescue shifts with mandatory decontamination protocols.'
      },
      publicCommunityReport: {
        headline: 'Emergency Storm Surge Directive - Fort Myers Coastal Zone',
        evacuationShelterDirectives: 'Evacuate all waterfront properties immediately via North Causeway. Do not enter canal waters.',
        essentialSuppliesAdvice: 'Severe water main contamination. Drink bottled supplies only.'
      },
      reconstructionPlan: {
        repairRetrofitRebuild: 'Inland structures #H-04, #H-05 feasible for fast envelope repair. Waterfront villas #H-01, #H-02 require pile re-engineering.',
        debrisManagement: 'Sand & timber debris clearing prioritized along Causeway corridor.',
        buildingCodesCompliance: 'All replacements must adhere to Florida Building Code High Velocity Hurricane Zone (HVHZ) standards.',
        financialBudgetNotice: 'Money needed: not available offline (Historical financial cost tables require field census; estimates disabled offline per Section 2.2).'
      },
      citations: [
        { id: '[XBD-joint-damage-scale]', source: 'xBD Dataset Damage Scale', text: 'Destroyed: Structure has completely collapsed or detached from foundation with loss of all structural integrity.' },
        { id: '[IWGSEM-damage-guide]', source: 'IWG-SEM Rapid Mapping Guide', text: 'Very Heavy Damage: Substantial to heavy damage to walls, partial structural collapse of roofs and floors.' },
        { id: '[SPHERE-3-p1]', source: 'Sphere Handbook 2018 Shelter Chapter', text: 'Covered living space: Ensure a minimum of 3.5m² of covered living space per person.' }
      ]
    }
  }
];

export const SPRINT_TRACKS: SprintTrack[] = [
  {
    id: 'O1',
    name: 'O1: Damage Segmentation Gate',
    owner: 'Abrar / Champion Pipeline',
    testedTechnique: 'R11 6-Channel Before+After U-Net + SAM 3 Find-then-Grade (R16c step 5b)',
    rationale: 'Rubble called background in after-only models (59.5% in E1). Stacking before+after imagery and SAM 3 building outlines solves collapse footprint recall.',
    resultSummary: 'Passed O1 gate: Destroyed IoU 0.3161 on clean validation data (0.3065 3-seed mean), mIoU 0.588.',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    baselineScore: 0.2686,
    finalScore: 0.3161,
    metricLabel: 'Destroyed IoU',
    details: [
      'Clean evaluation on 605 non-leaked validation pairs (E5 audit removed 40 pairs).',
      'SAM 3 zero-shot building finding reaches 0.630 IoU before grading.',
      'Siamese ResNet-18 grader compares 128px pre- and post-disaster crops.'
    ]
  },
  {
    id: 'O2',
    name: 'O2: Building Counting via Table',
    owner: 'Aryan / Noman / SQLite Agent',
    testedTechnique: 'R11 8-View TTA Connected Components + H2 Per-Building SQLite Table',
    rationale: 'VLMs fail counting when asked directly (our 7B counts at 30.3%). Feeding counts from a verified spatial table beats every VLM condition (Aryan v4: 37.0% vs 27.0%).',
    resultSummary: 'H2 Table holds 117,687 buildings across 2,652 benchmark images. Optical counting achieves 39.2% validation / 32.5% benchmark.',
    badgeColor: 'bg-[#0084ff]/20 text-blue-300 border-[#0084ff]/40',
    baselineScore: 0.2230,
    finalScore: 0.3924,
    metricLabel: 'Counting Accuracy',
    details: [
      'Counts never pass through VLM generation; routed deterministically to table queries.',
      'Blob threshold calibrated at minimum 20px connected components.',
      'Exact trace from counts to building polygons.'
    ]
  },
  {
    id: 'O3',
    name: 'O3: DisasTeller Offline System',
    owner: 'Ridita / Offline RAG Lead',
    testedTechnique: 'Fixed-Flow 4-Agent Pipeline + Hybrid MiniLM/BM25 Search (405 sections)',
    rationale: 'Small 7B models loop or hallucinate free-form tool formats (Kaggle practice runs 2-4). Switched to deterministic fixed_flow.py with offline guidelines.',
    resultSummary: '27 of 30 retrieval questions passed (bar 24). 100% offline Kaggle run with Internet OFF, 0 external API calls.',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    baselineScore: 0.667,
    finalScore: 0.900,
    metricLabel: 'Retrieval Accuracy (27/30)',
    details: [
      '405 sections indexed across EMS-98, INSARAG Vol II & III, Sphere, xBD, IWG-SEM.',
      'Zero external API calls; Telemetry disabled.',
      'Strict Rule 2.2: Reconstruction budgets stated as "not available offline", never hallucinated.'
    ]
  },
  {
    id: 'O4',
    name: 'O4: Edge Quantization & Model',
    owner: 'Tamanna / Edge Optimization',
    testedTechnique: 'L1b INT8 Static Quantization (Keep 1+3 FP32 Conv) on CPU',
    rationale: 'Field responders operate on low-power laptops without NVIDIA GPUs. Requires sub-2-second inference on standard CPU.',
    resultSummary: 'Model size reduced from 130MB to 33MB (74.6% reduction). Runs at 1.6s per 1024x1024 tile (1.43x speedup, 0.0003 accuracy drop).',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    baselineScore: 2.30,
    finalScore: 1.60,
    metricLabel: 'Inference Latency (sec/tile)',
    details: [
      'ONNX Runtime Web feasibility passed in Chrome and Edge with WebAssembly.',
      'Keep 1+3 preserves input/output convolutions in FP32 for sub-pixel boundary fidelity.',
      'Teacher model AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP serves as teacher for 3B edge model.'
    ]
  }
];

export const RESEARCH_DOCUMENTS = [
  {
    id: 'DOC-01',
    title: 'System Design Notes: The Offline Report System (O3)',
    category: 'System Architecture',
    date: '24-28 October 2026',
    summary: 'Architectural specification of DisasTeller offline mode, fixed flow fallback, SQL agent ablation (H2b), and 3D Damage City implementation.'
  },
  {
    id: 'DOC-02',
    title: 'Task Ledger: Research Decisions & Champion Models',
    category: 'Experiment Log',
    date: 'Phase A to Phase C',
    summary: 'Full audit of R1-R16c training runs, E5 train/val leak diagnosis (40 pairs removed), and full-size Qwen2.5-VL-7B fine-tuning.'
  },
  {
    id: 'DOC-03',
    title: 'Offline RAG + KR2 Counting (DisasTeller)',
    category: 'Field Deployment',
    date: '10 November 2026',
    summary: 'Kaggle internet-off proof, hybrid MiniLM+BM25 retrieval test (27/30), fixed_flow.py tool orchestration, and EMS-98/Sphere/INSARAG citations.'
  }
];

export const TEAM_MEMBERS = [
  { name: 'Abrar Alam', role: 'Champion Model Architecture & Web Showcase Lead', focus: 'R11 6-channel U-Net, Qwen2.5-VL fine-tuning, T3 Frontend' },
  { name: 'Ridita Afrin', role: 'Offline RAG, DisasTeller & Data Audit Lead', focus: 'Hybrid MiniLM+BM25 retrieval, fixed_flow.py, E5 leak audit' },
  { name: 'Aryan Bin Karim', role: 'VLM Prompt Counting & BDC Pipeline Lead', focus: 'Prompt ablation, oracle ceiling verification, H2 SQLite checks' },
  { name: 'Tamanna Chowdhury', role: 'Edge Quantization & Building Crop Inspector Lead', focus: 'L1b INT8 ONNX static quantization, Plan 2 crop inspections' },
  { name: 'Noman', role: 'Per-Building SQLite Table & SQL Agent Lead', focus: 'H2 SQLite table (117,687 buildings), H2b graded test framework' }
];
