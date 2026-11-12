import React from 'react';
import { 
  ShieldAlert, 
  MousePointer2, 
  Flame, 
  Route, 
  Radar, 
  WifiOff, 
  Wifi
} from 'lucide-react';
import { DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineTopBarProps {
  scenarios?: DisasterScenario[];
  selectedScenarioIndex?: number;
  onSelectScenario?: (index: number) => void;
  activeTool: 'select' | 'thermal' | 'ingress' | 'radar';
  setActiveTool: (tool: 'select' | 'thermal' | 'ingress' | 'radar') => void;
  isMuted?: boolean;
  onToggleSound?: () => void;
  onOpenSitrep?: () => void;
  onOpenShare?: () => void;
  isOfflineOnly: boolean;
  onToggleOffline: () => void;
  onOpenDisasTeller?: () => void;
  onOpenBenchmark?: () => void;
  show3DCity?: boolean;
  onToggle3DCity?: () => void;
  showHeatmap?: boolean;
  onToggleHeatmap?: () => void;
  showBeforeAfter?: boolean;
  onToggleBeforeAfter?: () => void;
}

export const SplineTopBar: React.FC<SplineTopBarProps> = ({
  activeTool,
  setActiveTool,
  isOfflineOnly,
  onToggleOffline
}) => {
  return (
    <header className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2.5">
      
      {/* Left Floating Pill: Project Identity */}
      <div className="pointer-events-auto flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide">DisasterM3</span>
        </div>

        {/* Offline Zero-API Indicator Toggle */}
        <button
          onClick={onToggleOffline}
          title={isOfflineOnly ? 'Running completely offline. Click to allow online tile fallback.' : 'Running with online tile fallback. Click to lock into 100% offline mode.'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border transition-colors ${
            isOfflineOnly
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
          }`}
        >
          {isOfflineOnly ? <WifiOff className="w-3 h-3 text-emerald-400" /> : <Wifi className="w-3 h-3 text-amber-400" />}
          <span className="hidden sm:inline font-bold">{isOfflineOnly ? 'OFFLINE (0 API)' : 'ONLINE TILES'}</span>
        </button>
      </div>

      {/* Center Floating Pill: Primary Inspection Tools */}
      <div className="pointer-events-auto hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs">
        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTool('select');
          }}
          title="Selection & Inspector Tool"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono transition-colors ${
            activeTool === 'select'
              ? 'bg-[#0084ff] text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <MousePointer2 className="w-3.5 h-3.5" />
          <span>Inspect</span>
        </button>

        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTool('thermal');
          }}
          title="Toggle FLIR Thermal Barrier Simulation"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono transition-colors ${
            activeTool === 'thermal'
              ? 'bg-rose-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Thermal Sim</span>
        </button>

        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTool('ingress');
          }}
          title="Toggle Cleared Ingress Routes"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono transition-colors ${
            activeTool === 'ingress'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>Ingress Path</span>
        </button>

        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTool('radar');
          }}
          title="Survivable Air Void Radar"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono transition-colors ${
            activeTool === 'radar'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Radar className="w-3.5 h-3.5" />
          <span>Void Radar</span>
        </button>
      </div>
    </header>
  );
};


