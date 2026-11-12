import React, { useState } from 'react';
import { FileText, ShieldAlert, Check } from 'lucide-react';
import { OfflineCanvas } from './components/OfflineCanvas';
import { SplineCanvas } from './components/SplineCanvas';
import { SplineTopBar } from './components/SplineTopBar';
import { SplineLayersPanel } from './components/SplineLayersPanel';
import { SplineInspectorPanel } from './components/SplineInspectorPanel';
import { SplineBottomBar } from './components/SplineBottomBar';
import { ShareExportModal } from './components/ShareExportModal';
import { DisasTellerReportsModal } from './components/DisasTellerReportsModal';
import { BenchmarkPanelModal } from './components/BenchmarkPanelModal';
import { SCENARIOS } from './data/mockScenarios';
import { BuildingFeature } from './types/disaster';
import { sound } from './utils/audio';

export default function App() {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingFeature | null>(
    SCENARIOS[0].buildings[3] // Default to #B-104 (Pancake collapse in Zone A)
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'destroyed' | 'major' | 'voids' | 'ingress'>('all');
  const [activeTool, setActiveTool] = useState<'select' | 'thermal' | 'ingress' | 'radar'>('select');
  const [hiddenBuildingIds, setHiddenBuildingIds] = useState<string[]>([]);
  const [isLayersCollapsed, setIsLayersCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Modals state
  const [showSitrepModal, setShowSitrepModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDisasTellerModal, setShowDisasTellerModal] = useState(false);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [copiedSitrep, setCopiedSitrep] = useState(false);

  // New system design features (Offline, 3D City, Heatmap, Before/After)
  const [isOfflineOnly, setIsOfflineOnly] = useState(true); // 100% Offline Safe by default (0 API calls)
  const [show3DCity, setShow3DCity] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  const scenario = SCENARIOS[selectedScenarioIndex];

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) {
      sound.playRadioChirp();
    }
  };

  const handleScenarioChange = (idx: number) => {
    sound.playRadioChirp();
    setSelectedScenarioIndex(idx);
    setSelectedBuilding(SCENARIOS[idx].buildings[0] || null);
    setActiveFilter('all');
    setHiddenBuildingIds([]);
  };

  const handleToggleHideBuilding = (id: string) => {
    setHiddenBuildingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090a0f] text-slate-100 font-sans select-none">
      
      {/* 1. CENTRAL MAP ENGINE: OFFLINE AUTONOMOUS CANVAS OR ONLINE ESRI TILES */}
      {isOfflineOnly ? (
        <OfflineCanvas
          scenario={scenario}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(b) => setSelectedBuilding(b)}
          activeTool={activeTool}
          hiddenBuildingIds={hiddenBuildingIds}
          activeFilter={activeFilter}
          isOfflineOnly={isOfflineOnly}
          onToggleOffline={() => setIsOfflineOnly(false)}
          show3DCity={show3DCity}
          onToggle3DCity={() => setShow3DCity(!show3DCity)}
          showHeatmap={showHeatmap}
          onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
          showBeforeAfter={showBeforeAfter}
          onToggleBeforeAfter={() => setShowBeforeAfter(!showBeforeAfter)}
        />
      ) : (
        <SplineCanvas
          scenario={scenario}
          selectedBuilding={selectedBuilding}
          onSelectBuilding={(b) => setSelectedBuilding(b)}
          activeTool={activeTool}
          hiddenBuildingIds={hiddenBuildingIds}
          activeFilter={activeFilter}
        />
      )}

      {/* 2. FLOATING TOP TOOLBAR WITH OFFLINE TOGGLE & SYSTEM MODULES */}
      <SplineTopBar
        scenarios={SCENARIOS}
        selectedScenarioIndex={selectedScenarioIndex}
        onSelectScenario={handleScenarioChange}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isMuted={isMuted}
        onToggleSound={toggleSound}
        onOpenSitrep={() => {
          sound.playRadioChirp();
          setShowSitrepModal(true);
        }}
        onOpenShare={() => {
          sound.playRadioChirp();
          setShowShareModal(true);
        }}
        isOfflineOnly={isOfflineOnly}
        onToggleOffline={() => setIsOfflineOnly(!isOfflineOnly)}
        onOpenDisasTeller={() => {
          sound.playRadioChirp();
          setShowDisasTellerModal(true);
        }}
        onOpenBenchmark={() => {
          sound.playRadioChirp();
          setShowBenchmarkModal(true);
        }}
        show3DCity={show3DCity}
        onToggle3DCity={() => setShow3DCity(!show3DCity)}
        showHeatmap={showHeatmap}
        onToggleHeatmap={() => setShowHeatmap(!showHeatmap)}
        showBeforeAfter={showBeforeAfter}
        onToggleBeforeAfter={() => setShowBeforeAfter(!showBeforeAfter)}
      />

      {/* 3. FLOATING LEFT LAYERS OUTLINER PANEL */}
      <SplineLayersPanel
        scenario={scenario}
        selectedBuilding={selectedBuilding}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        hiddenBuildingIds={hiddenBuildingIds}
        onToggleHideBuilding={handleToggleHideBuilding}
        isCollapsed={isLayersCollapsed}
        onToggleCollapse={() => setIsLayersCollapsed(!isLayersCollapsed)}
      />

      {/* 4. FLOATING RIGHT INSPECTOR & FIXED QUESTION TEMPLATES CONSOLE */}
      <SplineInspectorPanel
        scenario={scenario}
        selectedBuilding={selectedBuilding}
        onClearSelection={() => setSelectedBuilding(null)}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        onOpenDisasTeller={() => {
          sound.playRadioChirp();
          setShowDisasTellerModal(true);
        }}
        isCollapsed={isInspectorCollapsed}
        onToggleCollapse={() => setIsInspectorCollapsed(!isInspectorCollapsed)}
      />

      {/* 5. FLOATING BOTTOM QUICK FILTER & TELEMETRY BAR */}
      <SplineBottomBar
        scenario={scenario}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {/* 6. DISASTELLER OFFLINE REPORT SYSTEM (O3 - 6 TEAMS MODAL) */}
      <DisasTellerReportsModal
        isOpen={showDisasTellerModal}
        onClose={() => setShowDisasTellerModal(false)}
        scenario={scenario}
      />

      {/* 7. VERIFIED BENCHMARK & ARCHITECTURE PANEL (O1-O4 & E5 AUDIT) */}
      <BenchmarkPanelModal
        isOpen={showBenchmarkModal}
        onClose={() => setShowBenchmarkModal(false)}
      />

      {/* 8. EMS-98 INCIDENT ACTION PLAN MODAL */}
      {showSitrepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-5 text-slate-200 font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>EMS-98 Tactical Incident Action Plan</span>
              </span>
              <button
                onClick={() => setShowSitrepModal(false)}
                className="w-6 h-6 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-slate-300 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div><strong>OPERATIONAL SECTOR:</strong> {scenario.location} ({scenario.title})</div>
                <div><strong>MISSION WINDOW:</strong> 08h 42m elapsed / 72h Critical Survival Phase</div>
                <div><strong>PLATFORM ARCHITECTURE:</strong> 4-Bit Edge VLM (Qwen2.5-VL) with SAM 3 Foundation Model</div>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-1.5 text-amber-200">
                <div className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Tactical Action Directives:
                </div>
                <div>• <strong>Zone A (#B-104, #B-106):</strong> Pancake collapse. Concrete slabs attenuate thermal IR. Deploy Ground Penetrating Radar (GPR) and acoustic geophones.</div>
                <div>• <strong>Zone B (#B-108):</strong> Lean-over void cavity on south perimeter. Ingress via ground south window.</div>
                <div>• <strong>Zone SE (#B-112):</strong> Red-tagged. Secondary collapse risk from compromised brick firewall.</div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-300">
                • <strong>Ingress Route Alpha:</strong> Cleared from north entrance along Avenue Central up to Grid 46. Municipal Annex (#B-101) active as primary casualty triage point.
              </div>

              <div className="p-2 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-400">
                Research Project: Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment &amp; Rescue Guidance (CSE499B/EEE499B/ETE499B, Group 5).
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  const text = `${scenario.title} Incident Action Plan\n${scenario.sampleVlmResponse}`;
                  navigator.clipboard?.writeText(text);
                  setCopiedSitrep(true);
                  setTimeout(() => setCopiedSitrep(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#0084ff] hover:bg-[#0070d8] text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedSitrep ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{copiedSitrep ? 'Copied' : 'Copy SitRep'}</span>
              </button>
              <button
                onClick={() => setShowSitrepModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. SHARE & EXPORT MODAL */}
      <ShareExportModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        scenario={scenario}
        selectedBuilding={selectedBuilding}
      />
    </div>
  );
}
