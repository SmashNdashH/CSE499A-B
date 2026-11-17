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
    NW: true,
    SW: false,
    SE: false
  });

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  const groups: Record<string, { label: string; items: BuildingFeature[] }> = {
    NE: {
      label: 'Zone NE · Quadrant North-East',
      items: scenario.buildings.filter((b) => b.quadrant === 'NE')
    },
    Central: {
      label: 'Zone Central · Quadrant Central',
      items: scenario.buildings.filter((b) => b.quadrant === 'Central')
    },
    NW: {
      label: 'Zone NW · Quadrant North-West',
      items: scenario.buildings.filter((b) => b.quadrant === 'NW')
    },
    SE: {
      label: 'Zone SE · Quadrant South-East',
      items: scenario.buildings.filter((b) => b.quadrant === 'SE')
    },
    SW: {
      label: 'Zone SW · Quadrant South-West',
      items: scenario.buildings.filter((b) => b.quadrant === 'SW')
    }
  };

  return (
    <aside 
      className={`absolute top-18 left-3 z-30 pointer-events-auto transition-all duration-300 flex flex-col rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono select-none overflow-hidden ${
        isCollapsed ? 'w-10 h-10 p-0' : 'w-72 max-h-[calc(100vh-160px)] p-3 space-y-3'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0084ff]" />
            <span className="font-bold text-white tracking-wide">Building Layers</span>
            <span className="text-[10px] text-slate-400">({scenario.buildings.length})</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Layers Outliner' : 'Collapse Layers Outliner'}
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter by ID or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-[#0084ff]"
            />
          </div>

          {/* Quadrant Outliner Tree */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {Object.entries(groups).map(([key, group]) => {
              if (group.items.length === 0) return null;
              const isExpanded = expandedFolders[key];

              const filteredItems = group.items.filter((b) =>
                b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.class_name.toLowerCase().includes(searchQuery.toLowerCase())
              );

              if (searchQuery && filteredItems.length === 0) return null;

              return (
                <div key={key} className="space-y-1">
                  <div 
                    onClick={() => toggleFolder(key)}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer text-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                      <Folder className="w-3.5 h-3.5 text-amber-400/80" />
                      <span className="font-semibold text-[11px] truncate">{group.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{group.items.length}</span>
                  </div>

                  {isExpanded && (
                    <div className="pl-4 space-y-0.5 border-l border-white/5 ml-2.5">
                      {filteredItems.map((b) => {
                        const isSelected = selectedBuilding?.id === b.id;
                        const isHidden = hiddenBuildingIds.includes(b.id);

                        return (
                          <div
                            key={b.id}
                            className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-[#0084ff]/25 text-white font-bold border border-[#0084ff]/40'
                                : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div 
                              className="flex items-center gap-1.5 flex-1 truncate"
                              onClick={() => {
                                sound.playRadioChirp();
                                onSelectBuilding(b);
                              }}
                            >
                              <Building className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate text-[11px]">#{b.id} ({b.name})</span>
                              <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                                b.class_name === 'destroyed' ? 'bg-rose-500/20 text-rose-300' :
                                b.class_name === 'damaged' ? 'bg-amber-500/20 text-amber-300' :
                                'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {b.class_name}
                              </span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playRadioChirp();
                                onToggleHideBuilding(b.id);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
                              title={isHidden ? 'Show Building Footprint' : 'Hide Building Footprint'}
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

          <div className="pt-2 border-t border-white/10 text-[10px] text-amber-400/80 text-center">
            Illustration: not real data
          </div>
        </>
      )}
    </aside>
  );
};
