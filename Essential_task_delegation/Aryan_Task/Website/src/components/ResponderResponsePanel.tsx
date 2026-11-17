import React from 'react';
import { 
  BuildingFeature, 
  DisasterScenario 
} from '../types/disaster';
import { sound } from '../utils/audio';

interface ResponderResponsePanelProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onClearSelection: () => void;
  onSelectBuilding: (building: BuildingFeature) => void;
  onOpenSitrep: () => void;
}

export const ResponderResponsePanel: React.FC<ResponderResponsePanelProps> = ({
  scenario,
  selectedBuilding,
  onClearSelection,
  onSelectBuilding,
  onOpenSitrep
}) => {
  return (
    <div className="flex flex-col h-full bg-[#121214] text-slate-200 font-mono text-xs p-4 space-y-3 select-text">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <span className="font-bold text-white uppercase">Building Inspector (H2 Table)</span>
        {selectedBuilding && (
          <button 
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white text-[10px]"
          >
            Clear
          </button>
        )}
      </div>

      {selectedBuilding ? (
        <div className="space-y-2">
          <div className="text-white font-bold text-sm">
            #{selectedBuilding.id} ({selectedBuilding.name})
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 space-y-1">
            <div>Class: <strong className="text-amber-300">{selectedBuilding.class_name}</strong> (ID: {selectedBuilding.class_id})</div>
            <div>Area: <strong>{selectedBuilding.area_px.toLocaleString()} px</strong></div>
            <div>Centroid: ({selectedBuilding.centroid_x}, {selectedBuilding.centroid_y})</div>
            <div>Bounding Box: [{selectedBuilding.bbox_x}, {selectedBuilding.bbox_y}, {selectedBuilding.bbox_w}, {selectedBuilding.bbox_h}]</div>
            <div>Nearest Destroyed: {selectedBuilding.dist_to_nearest_destroyed_px !== null ? `${selectedBuilding.dist_to_nearest_destroyed_px} px` : 'N/A'}</div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">
          Select a building on the canvas to inspect its H2 table attributes.
        </div>
      )}

      <div className="text-[10px] text-amber-400/80 pt-2 border-t border-white/5">
        Illustration: not real data · H2 SQLite Per-Building Schema
      </div>
    </div>
  );
};
