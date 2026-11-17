import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Copy, 
  Check, 
  Database, 
  HelpCircle,
  Building,
  FileText,
  Lightbulb
} from 'lucide-react';
import { BuildingFeature, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';
import { FixedQuestionConsole } from './FixedQuestionConsole';

interface SplineInspectorPanelProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onClearSelection: () => void;
  onSelectBuilding: (building: BuildingFeature) => void;
  onOpenDisasTeller: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const SplineInspectorPanel: React.FC<SplineInspectorPanelProps> = ({
  scenario,
  selectedBuilding,
  onClearSelection,
  onSelectBuilding,
  onOpenDisasTeller,
  isCollapsed,
  onToggleCollapse
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'templates' | 'future_ideas'>('inspector');
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    sound.playRadioChirp();
    if (!selectedBuilding) return;
    navigator.clipboard?.writeText(JSON.stringify(selectedBuilding, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside 
      className={`absolute top-18 right-3 z-30 pointer-events-auto transition-all duration-300 flex flex-col rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono select-none overflow-hidden ${
        isCollapsed ? 'w-10 h-10 p-0' : 'w-84 max-h-[calc(100vh-160px)] p-3 space-y-3'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#0084ff]" />
            <span className="font-bold text-white tracking-wide">Inspector &amp; Queries</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Inspector Panel' : 'Collapse Inspector Panel'}
          className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5 text-[11px]">
            <button
              onClick={() => {
                sound.playRadioChirp();
                setActiveTab('inspector');
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                activeTab === 'inspector'
                  ? 'bg-[#0084ff] text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              H2 Table
            </button>
            <button
              onClick={() => {
                sound.playRadioChirp();
                setActiveTab('templates');
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                activeTab === 'templates'
                  ? 'bg-[#0084ff] text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              SQL Queries
            </button>
            <button
              onClick={() => {
                sound.playRadioChirp();
                setActiveTab('future_ideas');
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all ${
                activeTab === 'future_ideas'
                  ? 'bg-purple-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Future Ideas
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin select-text">
            {activeTab === 'inspector' && (
              <div className="space-y-3">
                {selectedBuilding ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-sm">
                        #{selectedBuilding.id} ({selectedBuilding.name})
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        selectedBuilding.class_name === 'destroyed' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                        selectedBuilding.class_name === 'damaged' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                        'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        {selectedBuilding.class_name}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-[11px]">
                      <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] text-amber-400">
                        Exact H2 SQLite Table Columns:
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                        <div>image:</div>
                        <div className="text-white font-mono text-[10px] truncate">{selectedBuilding.image}</div>

                        <div>building_id:</div>
                        <div className="text-white font-mono">{selectedBuilding.building_id}</div>

                        <div>class_name:</div>
                        <div className="text-white font-mono">{selectedBuilding.class_name}</div>

                        <div>class_id:</div>
                        <div className="text-white font-mono">{selectedBuilding.class_id}</div>

                        <div>area_px:</div>
                        <div className="text-emerald-300 font-mono font-bold">{selectedBuilding.area_px.toLocaleString()} px</div>

                        <div>centroid_x, y:</div>
                        <div className="text-white font-mono">({selectedBuilding.centroid_x}, {selectedBuilding.centroid_y})</div>

                        <div>bbox [x, y, w, h]:</div>
                        <div className="text-white font-mono">[{selectedBuilding.bbox_x}, {selectedBuilding.bbox_y}, {selectedBuilding.bbox_w}, {selectedBuilding.bbox_h}]</div>

                        <div>dist_to_destroyed:</div>
                        <div className="text-amber-300 font-mono font-bold">
                          {selectedBuilding.dist_to_nearest_destroyed_px !== null
                            ? `${selectedBuilding.dist_to_nearest_destroyed_px} px`
                            : 'NULL'}
                        </div>
                      </div>
                    </div>

                    {selectedBuilding.notes && (
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                        <span className="text-slate-400 block text-[10px] uppercase">Notes:</span>
                        {selectedBuilding.notes}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleCopyJson}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
                      </button>
                      <button
                        onClick={onClearSelection}
                        className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-[11px] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-slate-400 space-y-2">
                    <Building className="w-6 h-6 mx-auto text-slate-500" />
                    <div>Click any structure on the map or select from Layers to view its H2 SQLite table attributes.</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'templates' && (
              <FixedQuestionConsole
                scenario={scenario}
                onSelectBuilding={onSelectBuilding}
                selectedBuilding={selectedBuilding}
              />
            )}

            {activeTab === 'future_ideas' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 space-y-1.5">
                  <div className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span>Future Ideas (Not Implemented)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-purple-300/90">
                    These conceptual ideas were part of the initial CSE499A proposal and are not implemented in the current DisasterM3 pipeline.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[11px] text-slate-300">
                  <div className="font-bold text-white">1. Sub-surface Sensor Integration (Concept)</div>
                  <p className="text-slate-400">Integration with ground-penetrating radar (GPR) or seismic acoustic listening geophones for sub-surface survivor location.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[11px] text-slate-300">
                  <div className="font-bold text-white">2. Multi-spectral Thermal Imaging (Concept)</div>
                  <p className="text-slate-400">Analysis of thermal infrared sensor feeds from low-altitude UAVs to detect body heat signatures beneath debris.</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5 text-[11px] text-slate-300">
                  <div className="font-bold text-white">3. Canine Search Dispatch (Concept)</div>
                  <p className="text-slate-400">Automated canine search unit assignment based on rubble porosity models.</p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-white/10 text-[10px] text-amber-400/80 text-center">
            Illustration: not real data
          </div>
        </>
      )}
    </aside>
  );
};
