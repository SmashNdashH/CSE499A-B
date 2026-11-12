import React from 'react';
import { DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineBottomBarProps {
  scenario: DisasterScenario;
  activeFilter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress';
  setActiveFilter: (filter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress') => void;
}

export const SplineBottomBar: React.FC<SplineBottomBarProps> = ({
  scenario,
  activeFilter,
  setActiveFilter
}) => {
  const handleFilterClick = (filter: 'all' | 'destroyed' | 'major' | 'voids' | 'ingress') => {
    sound.playRadioChirp();
    setActiveFilter(filter);
  };

  return (
    <footer className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono select-none max-w-[95vw] overflow-x-auto">
      {/* Quick Filter Buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleFilterClick('all')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'all'
              ? 'bg-[#0084ff] text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          All ({scenario.totalBuildings})
        </button>

        <button
          onClick={() => handleFilterClick('destroyed')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'destroyed'
              ? 'bg-rose-500 text-white font-bold shadow-sm'
              : 'text-rose-400/90 hover:text-rose-300 hover:bg-white/5'
          }`}
        >
          Destroyed ({scenario.damageCounts.destroyed})
        </button>

        <button
          onClick={() => handleFilterClick('major')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'major'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-white/5'
          }`}
        >
          Major ({scenario.damageCounts.major})
        </button>

        <button
          onClick={() => handleFilterClick('voids')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'voids'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-sky-400/90 hover:text-sky-300 hover:bg-white/5'
          }`}
        >
          Air Voids (3)
        </button>

        <button
          onClick={() => handleFilterClick('ingress')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'ingress'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-white/5'
          }`}
        >
          Ingress Path
        </button>
      </div>

      <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-white/10 text-[11px] text-slate-400">
        <span>
          Sector: <strong className="text-white">{scenario.title}</strong>
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-emerald-400">
          Route Alpha Cleared
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500 text-[10px]">
          QWEN2.5-VL 4-BIT EDGE
        </span>
      </div>
    </footer>
  );
};
