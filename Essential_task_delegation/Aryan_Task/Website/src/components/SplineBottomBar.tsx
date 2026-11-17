import React from 'react';
import { DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface SplineBottomBarProps {
  scenario: DisasterScenario;
  activeFilter: 'all' | 'destroyed' | 'damaged' | 'intact';
  setActiveFilter: (filter: 'all' | 'destroyed' | 'damaged' | 'intact') => void;
}

export const SplineBottomBar: React.FC<SplineBottomBarProps> = ({
  scenario,
  activeFilter,
  setActiveFilter
}) => {
  const handleFilterClick = (filter: 'all' | 'destroyed' | 'damaged' | 'intact') => {
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
          onClick={() => handleFilterClick('damaged')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'damaged'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
              : 'text-amber-400/90 hover:text-amber-300 hover:bg-white/5'
          }`}
        >
          Damaged ({scenario.damageCounts.damaged})
        </button>

        <button
          onClick={() => handleFilterClick('intact')}
          className={`px-3 py-1.5 rounded-xl transition-all ${
            activeFilter === 'intact'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-white/5'
          }`}
        >
          Intact ({scenario.damageCounts.intact})
        </button>
      </div>

      <div className="h-4 w-px bg-white/10 mx-1" />

      {/* Persistent Illustration Watermark */}
      <span className="text-[11px] text-amber-400/90 font-bold whitespace-nowrap">
        Illustration: not real data
      </span>
    </footer>
  );
};
