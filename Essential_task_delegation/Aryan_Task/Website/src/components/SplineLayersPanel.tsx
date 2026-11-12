import React, { useState } from 'react';
import { 
  Layers, 
  Folder, 
  Building, 
  Eye, 
  EyeOff, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Route,
  Radio,
  SlidersHorizontal
} from 'lucide-react';
import { BuildingFeature, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineLayersPanelProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onSelectBuilding: (building: BuildingFeature) => void;
  hiddenBuildingIds: string[];
  onToggleHideBuilding: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SplineLayersPanel: React.FC<SplineLayersPanelProps> = ({
  scenario,
  selectedBuilding,
  onSelectBuilding,
  hiddenBuildingIds,
  onToggleHideBuilding,
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    NE: true,
    Central: true,
    SW: false,
    SE: false
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  // Group buildings by quadrant
  const groups: Record<string, { label: string; items: BuildingFeature[] }> = {
    NE: {
      label: 'Zone A (NE) · Pancake Collapses',
      items: scenario.buildings.filter((b) => b.quadrant === 'NE')
    },
    Central: {
      label: 'Zone B (Central) · Lean-Over',
      items: scenario.buildings.filter((b) => b.quadrant === 'Central')
    },
    NW: {
      label: 'Zone NW · Staging Base',
      items: scenario.buildings.filter((b) => b.quadrant === 'NW')
    },
    SE: {
      label: 'Zone SE · Rubble Heaps',
      items: scenario.buildings.filter((b) => b.quadrant === 'SE')
    },
    SW: {
      label: 'Zone SW · Retail Blocks',
      items: scenario.buildings.filter((b) => b.quadrant === 'SW')
    }
  };

  const getStatusDot = (damage: string) => {
    switch (damage) {
      case 'destroyed':
        return 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]';
      case 'major-damage':
        return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)]';
      case 'minor-damage':
        return 'bg-yellow-400';
      case 'no-damage':
      default:
        return 'bg-emerald-500';
    }
  };

  if (isCollapsed) {
    return (
      <div className="absolute top-18 left-3 z-20 pointer-events-auto">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white shadow-2xl transition-colors"
          title="Open Layers Outliner"
        >
          <Layers className="w-4 h-4 text-[#0084ff]" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-18 left-3 z-20 pointer-events-auto w-72 max-h-[calc(100vh-130px)] flex flex-col rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono select-none overflow-hidden transition-all">
      
      {/* Panel Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#0084ff]" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">Outliner Layers</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-slate-500 hover:text-slate-300 text-[11px]"
          title="Collapse Panel"
        >
          Hide
        </button>
      </div>

      {/* Quick Search Field */}
      <div className="p-2 border-b border-white/5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search footprints..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-slate-200 placeholder-slate-500 text-[11px] focus:outline-none focus:border-[#0084ff]/50"
          />
        </div>
      </div>

      {/* Layers Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {/* Ingress Route Layer Item */}
        <div className="px-2.5 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/5 text-slate-300 text-[11px]">
          <div className="flex items-center gap-2">
            <Route className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Ingress Route Alpha</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Quadrant Groups */}
        {Object.entries(groups).map(([quadrantKey, group]) => {
          if (group.items.length === 0) return null;
          const isExpanded = expandedFolders[quadrantKey] ?? true;

          // Search filter
          const matchingItems = group.items.filter(
            (b) =>
              b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              b.name.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && matchingItems.length === 0) return null;

          return (
            <div key={quadrantKey} className="space-y-0.5">
              {/* Folder Header */}
              <button
                onClick={() => toggleFolder(quadrantKey)}
                className="w-full px-2 py-1.5 rounded-xl flex items-center justify-between hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
              >
                <div className="flex items-center gap-1.5 truncate">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <Folder className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span className="font-semibold truncate">{group.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {group.items.length}
                </span>
              </button>

              {/* Children (Buildings) */}
              {isExpanded && (
                <div className="pl-4 space-y-0.5 border-l border-white/5 ml-3">
                  {(searchQuery ? matchingItems : group.items).map((b) => {
                    const isSelected = selectedBuilding?.id === b.id;
                    const isHidden = hiddenBuildingIds.includes(b.id);

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          sound.playSonarPing();
                          onSelectBuilding(b);
                        }}
                        className={`px-2 py-1.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#0084ff] text-white font-bold shadow-md'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${getStatusDot(b.damage)}`} />
                          <span className="font-mono">{b.id}</span>
                          <span className="text-[10px] text-slate-400 truncate opacity-80">
                            {b.name}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleHideBuilding(b.id);
                          }}
                          className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                          title={isHidden ? 'Show Footprint' : 'Hide Footprint'}
                        >
                          {isHidden ? <EyeOff className="w-3 h-3 text-rose-400" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Strip */}
      <div className="p-2.5 border-t border-white/10 bg-black/30 flex items-center justify-between text-[10px] text-slate-400">
        <span>{scenario.buildings.length} Footprints Monitored</span>
        <span className="text-[#0084ff]">SAM 3 Active</span>
      </div>
    </aside>
  );
};
