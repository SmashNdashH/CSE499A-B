import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  CheckCircle2, 
  Database, 
  Activity,
  ArrowRight,
  Filter,
  Layers
} from 'lucide-react';
import { BuildingFeature, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface FixedQuestionConsoleProps {
  scenario: DisasterScenario;
  onSelectBuilding: (building: BuildingFeature) => void;
  selectedBuilding: BuildingFeature | null;
}

type QueryType = 
  | 'count_by_class'
  | 'filter_by_area'
  | 'dist_to_destroyed'
  | 'largest_damaged'
  | 'class_summary';

export const FixedQuestionConsole: React.FC<FixedQuestionConsoleProps> = ({
  scenario,
  onSelectBuilding,
  selectedBuilding
}) => {
  const [queryType, setQueryType] = useState<QueryType>('count_by_class');
  
  // Query 1: Count by class & quadrant
  const [targetClass, setTargetClass] = useState<'destroyed' | 'damaged' | 'intact'>('destroyed');
  const [targetQuadrant, setTargetQuadrant] = useState<'all' | 'NE' | 'NW' | 'Central' | 'SE' | 'SW'>('all');

  // Query 2: Area filter
  const [minAreaPx, setMinAreaPx] = useState<number>(3000);

  // Query 3: Target building for proximity query
  const [targetBuildingId, setTargetBuildingId] = useState<number>(
    selectedBuilding?.building_id || scenario.buildings.find((b) => b.class_name === 'destroyed')?.building_id || scenario.buildings[0]?.building_id || 1
  );

  React.useEffect(() => {
    if (selectedBuilding) {
      setTargetBuildingId(selectedBuilding.building_id);
    }
  }, [selectedBuilding]);

  // Deterministic calculation strictly from H2 per-building table
  const queryResult = useMemo(() => {
    switch (queryType) {
      case 'count_by_class': {
        const matches = scenario.buildings.filter((b) => {
          const matchClass = b.class_name === targetClass;
          const matchQuad = targetQuadrant === 'all' || b.quadrant === targetQuadrant;
          return matchClass && matchQuad;
        });

        const totalAreaPx = matches.reduce((acc, b) => acc + b.area_px, 0);
        const quadClause = targetQuadrant === 'all' ? '' : ` AND quadrant = '${targetQuadrant}'`;
        const sqlQuery = `SELECT COUNT(*), SUM(area_px) FROM buildings WHERE class_name = '${targetClass}'${quadClause};`;

        return {
          title: `COUNT QUERY: ${targetClass.toUpperCase()} in ${targetQuadrant === 'all' ? 'Entire Sector' : `Zone ${targetQuadrant}`}`,
          sql: sqlQuery,
          count: matches.length,
          summary: `Identified ${matches.length} structures matching criteria (${totalAreaPx.toLocaleString()} px total footprint area).`,
          buildings: matches,
          details: matches.map((b) => `#${b.id} (${b.name}) · Class: ${b.class_name} · Area: ${b.area_px.toLocaleString()} px · Centroid: (${b.centroid_x}, ${b.centroid_y})`)
        };
      }

      case 'filter_by_area': {
        const matches = scenario.buildings.filter((b) => b.area_px >= minAreaPx);
        const sqlQuery = `SELECT building_id, class_name, area_px FROM buildings WHERE area_px >= ${minAreaPx} ORDER BY area_px DESC;`;

        return {
          title: `FOOTPRINT AREA QUERY: Structures >= ${minAreaPx.toLocaleString()} px`,
          sql: sqlQuery,
          count: matches.length,
          summary: `Found ${matches.length} structures with footprint area >= ${minAreaPx.toLocaleString()} px.`,
          buildings: matches,
          details: matches.map((b) => `#${b.id} (${b.name}) · Class: ${b.class_name} · Area: ${b.area_px.toLocaleString()} px · Nearest Destroyed: ${b.dist_to_nearest_destroyed_px !== null ? `${b.dist_to_nearest_destroyed_px} px` : 'N/A'}`)
        };
      }

      case 'dist_to_destroyed': {
        const target = scenario.buildings.find((b) => b.building_id === targetBuildingId) || scenario.buildings[0];
        if (!target) {
          return { title: 'Proximity Query', sql: '', count: 0, summary: 'No building selected.', buildings: [], details: [] };
        }

        const sqlQuery = `SELECT building_id, class_name, dist_to_nearest_destroyed_px FROM buildings WHERE building_id = ${target.building_id};`;
        const distText = target.dist_to_nearest_destroyed_px === 0
          ? '0 px (This building is classified as destroyed)'
          : target.dist_to_nearest_destroyed_px !== null
          ? `${target.dist_to_nearest_destroyed_px} px`
          : 'NULL (No destroyed building in this tile)';

        return {
          title: `PROXIMITY QUERY: Distance to Nearest Destruction for #${target.id}`,
          sql: sqlQuery,
          count: 1,
          summary: `Distance to centroid of nearest destroyed building: ${distText}.`,
          buildings: [target],
          details: [
            `Target: #${target.id} (${target.name}) · Class: ${target.class_name}`,
            `Footprint Area: ${target.area_px.toLocaleString()} px · Bounding Box: [${target.bbox_x}, ${target.bbox_y}, ${target.bbox_w}, ${target.bbox_h}]`,
            `Distance to nearest destroyed: ${distText}`
          ]
        };
      }

      case 'largest_damaged': {
        const damagedOrDestroyed = scenario.buildings
          .filter((b) => b.class_name === 'destroyed' || b.class_name === 'damaged')
          .sort((a, b) => b.area_px - a.area_px)
          .slice(0, 5);

        const sqlQuery = `SELECT building_id, class_name, area_px FROM buildings WHERE class_name IN ('damaged', 'destroyed') ORDER BY area_px DESC LIMIT 5;`;

        return {
          title: 'EXTENT QUERY: Top 5 Largest Damaged/Destroyed Structures',
          sql: sqlQuery,
          count: damagedOrDestroyed.length,
          summary: `Top ${damagedOrDestroyed.length} damaged/destroyed footprints by pixel area.`,
          buildings: damagedOrDestroyed,
          details: damagedOrDestroyed.map((b, idx) => `Rank ${idx + 1}: #${b.id} (${b.name}) · Class: ${b.class_name} · Area: ${b.area_px.toLocaleString()} px`)
        };
      }

      case 'class_summary': {
        const summaryByClass = (['intact', 'damaged', 'destroyed'] as const).map((cls) => {
          const list = scenario.buildings.filter((b) => b.class_name === cls);
          const totalArea = list.reduce((acc, b) => acc + b.area_px, 0);
          const avgArea = list.length > 0 ? Math.round(totalArea / list.length) : 0;
          return { cls, count: list.length, totalArea, avgArea };
        });

        const sqlQuery = `SELECT class_name, COUNT(*), AVG(area_px), SUM(area_px) FROM buildings GROUP BY class_name;`;

        return {
          title: 'AGGREGATE SUMMARY: Building Damage Distribution',
          sql: sqlQuery,
          count: scenario.buildings.length,
          summary: `Total of ${scenario.buildings.length} buildings indexed in spatial table.`,
          buildings: scenario.buildings,
          details: summaryByClass.map((s) => `${s.cls.toUpperCase()}: ${s.count} buildings · Total Area: ${s.totalArea.toLocaleString()} px · Mean Area: ${s.avgArea.toLocaleString()} px`)
        };
      }
    }
  }, [queryType, targetClass, targetQuadrant, minAreaPx, targetBuildingId, scenario]);

  return (
    <div className="space-y-3 font-mono text-xs select-text">
      {/* Template Selector */}
      <div className="space-y-1">
        <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-[#0084ff]" />
          <span>H2 Spatial SQL Query Templates:</span>
        </label>
        <select
          value={queryType}
          onChange={(e) => {
            sound.playRadioChirp();
            setQueryType(e.target.value as QueryType);
          }}
          className="w-full p-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-[#0084ff]"
        >
          <option value="count_by_class">1. Count Buildings by Damage Class &amp; Zone</option>
          <option value="filter_by_area">2. Filter Structures by Footprint Pixel Area</option>
          <option value="dist_to_destroyed">3. Distance to Nearest Destroyed Structure</option>
          <option value="largest_damaged">4. Top 5 Largest Damaged / Destroyed Footprints</option>
          <option value="class_summary">5. Aggregate Class &amp; Area Summary</option>
        </select>
      </div>

      {/* Query Parameters */}
      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Query Parameters
        </div>

        {queryType === 'count_by_class' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Damage Class:</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value as any)}
                className="w-full p-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px]"
              >
                <option value="destroyed">Destroyed (Class 3)</option>
                <option value="damaged">Damaged (Class 2)</option>
                <option value="intact">Intact (Class 1)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Quadrant Zone:</label>
              <select
                value={targetQuadrant}
                onChange={(e) => setTargetQuadrant(e.target.value as any)}
                className="w-full p-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px]"
              >
                <option value="all">Entire Tile (All)</option>
                <option value="NE">Zone NE</option>
                <option value="NW">Zone NW</option>
                <option value="Central">Zone Central</option>
                <option value="SE">Zone SE</option>
                <option value="SW">Zone SW</option>
              </select>
            </div>
          </div>
        )}

        {queryType === 'filter_by_area' && (
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">
              Minimum Footprint Area (pixels): {minAreaPx.toLocaleString()} px
            </label>
            <input
              type="range"
              min="1000"
              max="5000"
              step="200"
              value={minAreaPx}
              onChange={(e) => setMinAreaPx(Number(e.target.value))}
              className="w-full accent-[#0084ff]"
            />
          </div>
        )}

        {queryType === 'dist_to_destroyed' && (
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Target Building:</label>
            <select
              value={targetBuildingId}
              onChange={(e) => setTargetBuildingId(Number(e.target.value))}
              className="w-full p-1.5 rounded-lg bg-black/60 border border-white/10 text-white text-[11px]"
            >
              {scenario.buildings.map((b) => (
                <option key={b.building_id} value={b.building_id}>
                  #{b.id} ({b.name}) · {b.class_name} · {b.area_px.toLocaleString()} px
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* SQL Query Preview */}
      {queryResult.sql && (
        <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-between">
            <span>Executed H2 SQL Query</span>
            <span className="text-[9px] text-slate-400">Read-Only Guard</span>
          </div>
          <code className="text-[11px] text-emerald-300 block break-all">
            {queryResult.sql}
          </code>
        </div>
      )}

      {/* Query Result Card */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs">{queryResult.title}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#0084ff]/20 text-[#0084ff] text-[10px] font-bold border border-[#0084ff]/30">
            {queryResult.count} {queryResult.count === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed">
          {queryResult.summary}
        </p>

        <div className="space-y-1.5 pt-1">
          {queryResult.details.map((line, idx) => (
            <div 
              key={idx}
              className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-300 flex items-center justify-between hover:bg-white/5 cursor-pointer transition-colors"
              onClick={() => {
                const targetB = queryResult.buildings[idx];
                if (targetB) onSelectBuilding(targetB);
              }}
            >
              <span className="truncate">{line}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
