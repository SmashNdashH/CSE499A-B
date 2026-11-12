import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Compass, 
  Layers, 
  ShieldCheck, 
  Droplet, 
  Users, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { BuildingFeature, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface FixedQuestionConsoleProps {
  scenario: DisasterScenario;
  onSelectBuilding: (building: BuildingFeature) => void;
  selectedBuilding: BuildingFeature | null;
}

type TemplateType = 
  | 'count_by_grade'
  | 'nearest_intact'
  | 'void_sensors'
  | 'collapse_perimeter'
  | 'sphere_shelter'
  | 'insarag_triage';

export const FixedQuestionConsole: React.FC<FixedQuestionConsoleProps> = ({
  scenario,
  onSelectBuilding,
  selectedBuilding
}) => {
  const [template, setTemplate] = useState<TemplateType>('count_by_grade');
  
  // Template 1 state
  const [selectedDamage, setSelectedDamage] = useState<'destroyed' | 'major-damage' | 'minor-damage' | 'no-damage'>('destroyed');
  const [selectedQuadrant, setSelectedQuadrant] = useState<'all' | 'NE' | 'NW' | 'Central' | 'SE' | 'SW'>('all');
  
  // Template 2 & 4 state
  const [targetBuildingId, setTargetBuildingId] = useState<string>(
    selectedBuilding?.id || scenario.buildings.find((b) => b.damage === 'destroyed')?.id || scenario.buildings[0]?.id || ''
  );

  // Template 3 state
  const [targetVoidLikelihood, setTargetVoidLikelihood] = useState<'High' | 'Medium' | 'Low'>('High');

  // Template 5 state
  const [displacedCount, setDisplacedCount] = useState<number>(150);

  // Update target building if selected building changes
  React.useEffect(() => {
    if (selectedBuilding) {
      setTargetBuildingId(selectedBuilding.id);
    }
  }, [selectedBuilding]);

  // Deterministic calculation from H2 per-building table
  const queryResult = useMemo(() => {
    switch (template) {
      case 'count_by_grade': {
        const matches = scenario.buildings.filter((b) => {
          const matchDamage = b.damage === selectedDamage;
          const matchQuad = selectedQuadrant === 'all' || b.quadrant === selectedQuadrant;
          return matchDamage && matchQuad;
        });

        const totalArea = matches.reduce((acc, b) => acc + (b.areaM2 || 300), 0);

        return {
          title: `COUNT QUERY: ${selectedDamage.toUpperCase()} in ${selectedQuadrant === 'all' ? 'Entire Sector' : `Zone ${selectedQuadrant}`}`,
          count: matches.length,
          summary: `Identified ${matches.length} structures matching criteria (${totalArea} m² total footprint).`,
          buildings: matches,
          details: matches.map((b) => `${b.id} (${b.name}) · ${b.collapseType} · ${b.floors} storeys · Void: ${b.voidLikelihood}`)
        };
      }

      case 'nearest_intact': {
        const target = scenario.buildings.find((b) => b.id === targetBuildingId) || scenario.buildings[0];
        const intactBuildings = scenario.buildings.filter((b) => b.damage === 'no-damage');
        
        if (!target || intactBuildings.length === 0) {
          return { title: 'Nearest Intact Query', count: 0, summary: 'No intact buildings available in sector.', buildings: [], details: [] };
        }

        // Calculate Euclidean distance in meters (approx 111,000m per degree lat)
        const sorted = [...intactBuildings].map((b) => {
          const dLat = (b.lat - target.lat) * 111000;
          const dLng = (b.lng - target.lng) * 88000;
          const distM = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
          return { building: b, distM };
        }).sort((a, b) => a.distM - b.distM);

        const nearest = sorted[0];

        return {
          title: `PROXIMITY QUERY: Nearest Intact Facility to #${target.id} (${target.name})`,
          count: sorted.length,
          summary: `Nearest intact structure is #${nearest.building.id} (${nearest.building.name}) located ${nearest.distM} meters away.`,
          buildings: [nearest.building],
          details: [
            `Primary Facility: #${nearest.building.id} (${nearest.building.name}) · Distance: ${nearest.distM}m`,
            `Status: Intact Grade 1 · Usable for field command & triage staging`,
            `Facility Notes: ${nearest.building.notes}`,
            ...sorted.slice(1).map((s) => `Secondary Facility: #${s.building.id} (${s.building.name}) · Distance: ${s.distM}m`)
          ]
        };
      }

      case 'void_sensors': {
        const matches = scenario.buildings.filter((b) => b.voidLikelihood === targetVoidLikelihood);
        return {
          title: `TACTICAL SENSOR QUERY: Structures with ${targetVoidLikelihood} Void Likelihood`,
          count: matches.length,
          summary: `Found ${matches.length} structures with ${targetVoidLikelihood} probability survivable air voids.`,
          buildings: matches,
          details: matches.map((b) => 
            `#${b.id} (${b.name}) · Collapse: ${b.collapseType} · Recommendation: ${b.sensorRecommendation} · ${b.notes}`
          )
        };
      }

      case 'collapse_perimeter': {
        const target = scenario.buildings.find((b) => b.id === targetBuildingId) || scenario.buildings[0];
        const heightMeters = target.floors * 3.2;
        const standoffRadius = Math.round(heightMeters * 1.5);

        return {
          title: `SAFETY STANDOFF QUERY: Secondary Fall Zone for #${target.id}`,
          count: 1,
          summary: `Estimated structural height is ${heightMeters.toFixed(1)}m. Mandatory standoff perimeter radius is ${standoffRadius}m.`,
          buildings: [target],
          details: [
            `Structure: #${target.id} (${target.name}) · ${target.floors} Storeys (${heightMeters.toFixed(1)}m elevation)`,
            `Collapse Risk Type: ${target.collapseType}`,
            `Mandatory Red-Tag Perimeter: ${standoffRadius} meters around exterior foundation footprint`,
            `Tactical Directive: Halt heavy machinery along adjacent avenue until hydraulic shoring is installed.`
          ]
        };
      }

      case 'sphere_shelter': {
        const requiredLivingSpaceM2 = displacedCount * 3.5; // Sphere Standard
        const requiredWaterLitresDay = displacedCount * 15; // 15L / person / day
        const intactShelters = scenario.buildings.filter((b) => b.damage === 'no-damage');
        const availableShelterAreaM2 = intactShelters.reduce((acc, b) => acc + (b.areaM2 || 250), 0);
        const shelterSurplusM2 = availableShelterAreaM2 - requiredLivingSpaceM2;
        const maxCapacity = Math.floor(availableShelterAreaM2 / 3.5);

        return {
          title: `SPHERE HUMANITARIAN QUERY: Shelter & Water for ${displacedCount} Displaced Survivors`,
          count: intactShelters.length,
          summary: `Requires ${requiredLivingSpaceM2} m² covered shelter space & ${requiredWaterLitresDay} L/day potable water.`,
          buildings: intactShelters,
          details: [
            `Sphere Standard [SPHERE-3-p1]: 3.5 m² living space/person -> ${requiredLivingSpaceM2} m² required`,
            `Sector Intact Shelter Capacity: ${availableShelterAreaM2} m² available (Max capacity: ${maxCapacity} persons)`,
            `Shelter Buffer: ${shelterSurplusM2 >= 0 ? `+${shelterSurplusM2} m² surplus` : `${Math.abs(shelterSurplusM2)} m² deficit`}`,
            `Sphere Water Standard [SPHERE-1-p4]: 15 L/person/day -> ${requiredWaterLitresDay} litres/day required`,
            `Approved Shelter Facilities: ${intactShelters.map((s) => `#${s.id} (${s.name}, ${s.areaM2 || 250}m²)`).join(', ')}`
          ]
        };
      }

      case 'insarag_triage': {
        // INSARAG Worksite Triage Order: Pancake/Confirmed Live -> Soft-Story -> Lean-Over -> Rubble Heap
        const triageOrder = [...scenario.buildings].filter((b) => b.damage === 'destroyed' || b.damage === 'major-damage').sort((a, b) => {
          const score = (b: BuildingFeature) => {
            if (b.collapseType === 'Pancake') return 4;
            if (b.collapseType === 'Lean-Over') return 3;
            if (b.collapseType === 'Soft-Story') return 2;
            return 1;
          };
          return score(b) - score(a);
        });

        return {
          title: 'INSARAG WORKSITE TRIAGE QUERY: Ranked Victim Extraction Priority',
          count: triageOrder.length,
          summary: `Ranked ${triageOrder.length} damaged worksites under INSARAG Guidelines Vol II Manual B.`,
          buildings: triageOrder,
          details: triageOrder.map((b, idx) => 
            `Priority ${idx + 1}: #${b.id} (${b.name}) · ${b.collapseType} · ASR Level ${b.collapseType === 'Pancake' ? '4 (Heavy Search)' : '3 (Rapid Search)'} · Sensor: ${b.sensorRecommendation}`
          )
        };
      }
    }
  }, [template, selectedDamage, selectedQuadrant, targetBuildingId, targetVoidLikelihood, displacedCount, scenario]);

  return (
    <div className="p-3 bg-black/40 border-t border-white/10 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-[#0084ff]" />
          <span>Fixed Question Templates (Section 3.4)</span>
        </span>
        <span className="text-[10px] text-emerald-400">100% Reliable · No GPU</span>
      </div>

      {/* Template Category Selector */}
      <select
        value={template}
        onChange={(e) => {
          sound.playRadioChirp();
          setTemplate(e.target.value as TemplateType);
        }}
        className="w-full px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-[11px] focus:outline-none focus:border-[#0084ff]"
      >
        <option value="count_by_grade" className="bg-slate-900 text-white">1. Count Buildings by Damage &amp; Zone</option>
        <option value="nearest_intact" className="bg-slate-900 text-white">2. Find Nearest Intact Shelter / Hospital</option>
        <option value="void_sensors" className="bg-slate-900 text-white">3. Search Survivable Air Voids &amp; Sensors</option>
        <option value="collapse_perimeter" className="bg-slate-900 text-white">4. Calculate Standoff Collapse Perimeter</option>
        <option value="sphere_shelter" className="bg-slate-900 text-white">5. Sphere Standard Shelter &amp; Water Needs</option>
        <option value="insarag_triage" className="bg-slate-900 text-white">6. INSARAG Worksite Triage Priority</option>
      </select>

      {/* Dynamic Template Parameters */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
        {template === 'count_by_grade' && (
          <>
            <select
              value={selectedDamage}
              onChange={(e) => setSelectedDamage(e.target.value as any)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200"
            >
              <option value="destroyed" className="bg-slate-900">Destroyed</option>
              <option value="major-damage" className="bg-slate-900">Major Damage</option>
              <option value="minor-damage" className="bg-slate-900">Minor Damage</option>
              <option value="no-damage" className="bg-slate-900">Intact / No Damage</option>
            </select>

            <select
              value={selectedQuadrant}
              onChange={(e) => setSelectedQuadrant(e.target.value as any)}
              className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200"
            >
              <option value="all" className="bg-slate-900">Whole Sector</option>
              <option value="NE" className="bg-slate-900">Zone NE (Pancake)</option>
              <option value="Central" className="bg-slate-900">Zone Central (Lean-Over)</option>
              <option value="NW" className="bg-slate-900">Zone NW (Staging)</option>
              <option value="SE" className="bg-slate-900">Zone SE (Rubble Heap)</option>
              <option value="SW" className="bg-slate-900">Zone SW</option>
            </select>
          </>
        )}

        {(template === 'nearest_intact' || template === 'collapse_perimeter') && (
          <select
            value={targetBuildingId}
            onChange={(e) => setTargetBuildingId(e.target.value)}
            className="w-full px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            {scenario.buildings.map((b) => (
              <option key={b.id} value={b.id} className="bg-slate-900">
                #{b.id}: {b.name} ({b.damage.toUpperCase()})
              </option>
            ))}
          </select>
        )}

        {template === 'void_sensors' && (
          <select
            value={targetVoidLikelihood}
            onChange={(e) => setTargetVoidLikelihood(e.target.value as any)}
            className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200"
          >
            <option value="High" className="bg-slate-900">High Void Likelihood</option>
            <option value="Medium" className="bg-slate-900">Medium Void Likelihood</option>
            <option value="Low" className="bg-slate-900">Low Void Likelihood</option>
          </select>
        )}

        {template === 'sphere_shelter' && (
          <div className="flex items-center gap-2 w-full">
            <span className="text-[10px] text-slate-400">Displaced survivors:</span>
            <input
              type="number"
              min={10}
              max={1000}
              step={10}
              value={displacedCount}
              onChange={(e) => setDisplacedCount(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white font-bold"
            />
            <span className="text-[10px] text-slate-500">persons</span>
          </div>
        )}
      </div>

      {/* Query Output Card */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-[11px]">
        <div className="font-bold text-white flex items-center justify-between text-xs">
          <span>{queryResult.summary}</span>
          <span className="px-1.5 py-0.5 rounded bg-[#0084ff]/20 text-[#0084ff] font-bold">
            {queryResult.count} matches
          </span>
        </div>

        <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin text-slate-300 pr-1">
          {queryResult.details.map((line, idx) => (
            <div key={idx} className="p-1 rounded hover:bg-white/5 flex items-start gap-1.5">
              <span className="text-[#0084ff] mt-0.5">•</span>
              <span className="leading-tight">{line}</span>
            </div>
          ))}
        </div>

        {/* Action button to select first matching building */}
        {queryResult.buildings.length > 0 && (
          <button
            onClick={() => {
              sound.playSonarPing();
              onSelectBuilding(queryResult.buildings[0]);
            }}
            className="w-full mt-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors border border-white/10"
          >
            <span>Focus on #{queryResult.buildings[0].id}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
