import React from 'react';
import { 
  ShieldAlert, 
  MousePointer2, 
  Box, 
  Flame,
  Columns,
  WifiOff, 
  Wifi,
  Award,
  FileText,
  Share2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineTopBarProps {
  scenarios: DisasterScenario[];
  selectedScenarioIndex: number;
  onSelectScenario: (index: number) => void;
  activeTool: 'select' | 'pan' | 'measure' | 'inspect';
  setActiveTool: (tool: 'select' | 'pan' | 'measure' | 'inspect') => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenSitrep?: () => void;
  onOpenShare: () => void;
  isOfflineOnly: boolean;
  onToggleOffline: () => void;
  onOpenDisasTeller: () => void;
  onOpenBenchmark: () => void;
  show3DCity: boolean;
  onToggle3DCity: () => void;
  showHeatmap: boolean;
  onToggleHeatmap: () => void;
  showBeforeAfter: boolean;
  onToggleBeforeAfter: () => void;
}

export const SplineTopBar: React.FC<SplineTopBarProps> = ({
  scenarios,
  selectedScenarioIndex,
  onSelectScenario,
  activeTool,
  setActiveTool,
  isMuted,
  onToggleSound,
  onOpenShare,
  isOfflineOnly,
  onToggleOffline,
  onOpenDisasTeller,
  onOpenBenchmark,
  show3DCity,
  onToggle3DCity,
  showHeatmap,
  onToggleHeatmap,
  showBeforeAfter,
  onToggleBeforeAfter
}) => {
  return (
    <header className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex items-center justify-between gap-2.5">
      
      {/* Left Pill: Brand, Scenario Selector & Offline Toggle */}
      <div className="pointer-events-auto flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
          <ShieldAlert className="w-3.5 h-3.5" />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-bold text-white tracking-wide">DisasterM3</span>
        </div>

        {/* Scenario Selector Dropdown */}
        <select
          value={selectedScenarioIndex}
          onChange={(e) => {
            sound.playRadioChirp();
            onSelectScenario(Number(e.target.value));
          }}
          className="p-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-[11px] focus:outline-none focus:border-[#0084ff]"
        >
          {scenarios.map((sc, idx) => (
            <option key={sc.id} value={idx} className="bg-slate-900 text-white">
              {sc.title}
            </option>
          ))}
        </select>

        {/* Offline Zero-API Indicator Toggle */}
        <button
          onClick={onToggleOffline}
          title={isOfflineOnly ? 'Running completely offline. Click to view online satellite option.' : 'Online satellite mode active. Click to lock into 100% offline mode.'}
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

      {/* Center Pill: Visualization Modes */}
      <div className="pointer-events-auto hidden md:flex items-center gap-1 p-1 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        <button
          onClick={onToggle3DCity}
          title="Toggle 3D City Extrusions"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
            show3DCity
              ? 'bg-[#0084ff] text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Blocks</span>
        </button>

        <button
          onClick={onToggleHeatmap}
          title="Toggle Damage Density Heatmap"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
            showHeatmap
              ? 'bg-rose-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Heatmap</span>
        </button>

        <button
          onClick={onToggleBeforeAfter}
          title="Toggle Before/After Comparison Slider"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-colors ${
            showBeforeAfter
              ? 'bg-emerald-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Before/After</span>
        </button>
      </div>

      {/* Right Pill: Verification Panels & Actions */}
      <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        <button
          onClick={onOpenBenchmark}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-bold border border-amber-500/30 transition-colors"
          title="Open O1–O4 Verified Benchmark Gates"
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Scorecard (O1–O4)</span>
        </button>

        <button
          onClick={onOpenDisasTeller}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-bold border border-purple-500/30 transition-colors"
          title="Open DisasTeller Real Proof Run Reports"
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Proof Reports</span>
        </button>

        <button
          onClick={onOpenShare}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          title="Share / Run Code Locally"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSound}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'Audio muted (default). Click to unmute.' : 'Audio unmuted. Click to mute.'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
};
