import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Send, 
  Crosshair, 
  FileText,
  AlertTriangle,
  Flame,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { BuildingFeature, DisasterScenario } from '../types/disaster';
import { sound } from '../utils/audio';

interface ResponderResponsePanelProps {
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
  onClearSelection: () => void;
}

export const ResponderResponsePanel: React.FC<ResponderResponsePanelProps> = ({
  scenario,
  selectedBuilding,
  onClearSelection
}) => {
  const [activeTab, setActiveTab] = useState<'priorities' | 'voids' | 'ingress'>('priorities');
  const [customQuery, setCustomQuery] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState<string[]>([]);

  // Response text logic
  const getResponseContent = () => {
    // If a specific structure on the map is clicked:
    if (selectedBuilding) {
      const isDestroyed = selectedBuilding.damage === 'destroyed';
      const isMajor = selectedBuilding.damage === 'major-damage';

      return {
        title: `STRUCTURE #${selectedBuilding.id} — ${selectedBuilding.name.toUpperCase()}`,
        badge: `${selectedBuilding.collapseType.toUpperCase()} · GRADE ${isDestroyed ? '4 (DESTROYED)' : isMajor ? '3 (MAJOR)' : '1 (INTACT)'}`,
        badgeColor: isDestroyed ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : isMajor ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        sections: [
          {
            heading: '1. SURVIVABLE VOID POCKETS',
            content: selectedBuilding.collapseType === 'Pancake'
              ? 'Multi-slab compaction over columns. Void pockets concentrated along east/south interior shear walls. Inter-slab clearance estimated at 0.6m–0.9m.'
              : selectedBuilding.collapseType === 'Lean-Over'
              ? 'Lateral shear tilt. Triangular void crawlspace formed along southern ground-level exterior retaining wall.'
              : selectedBuilding.collapseType === 'Soft-Story'
              ? 'Ground floor retail collapsed; upper storeys intact. Entry possible through northern window openings.'
              : 'Structure structurally continuous. No collapse voids detected.'
          },
          {
            heading: '2. TACTICAL SENSOR DIRECTIVE',
            content: isDestroyed
              ? 'WARNING: Concrete slabs attenuate thermal infrared (FLIR). Do not rely on drone thermal cameras. Dispatch Ground Penetrating Radar (GPR) and seismic acoustic listening probes along eastern column intersections.'
              : 'Deploy telescopic search camera probe through southern void before team entry.'
          },
          {
            heading: '3. EXTRACTION INGRESS VECTOR',
            content: `${selectedBuilding.notes} Safety requirement: ${isDestroyed ? 'Install hydraulic shoring on western flank before void penetration.' : 'Clear direct access route from northern street.'}`
          }
        ]
      };
    }

    // Default sector responses based on tabs:
    if (activeTab === 'voids') {
      return {
        title: 'HIGH-PROBABILITY SURVIVABLE VOID TARGETS',
        badge: '72-HOUR GOLDEN RESCUE WINDOW',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        sections: [
          {
            heading: 'PRIORITY 1 VOID: STRUCTURE #B-104 (ZONE NE)',
            content: 'Multi-slab pancake collapse. Surviving void air pockets concentrated at interior shear wall seams. Acoustic geophone tapping detected on eastern perimeter.'
          },
          {
            heading: 'PRIORITY 2 VOID: STRUCTURE #B-108 (ZONE CENTRAL)',
            content: 'Lean-over shear displacement. Triangular crawlspace cavity along south foundation. Clear access via ground south window (+0.8m elevation).'
          },
          {
            heading: 'EXCLUSION ZONE: STRUCTURE #B-112 (ZONE SE)',
            content: 'Complete brick pulverization (<0.2m clearance). Zero void likelihood. Defer heavy machinery until Zones A and B are cleared.'
          }
        ]
      };
    }

    if (activeTab === 'ingress') {
      return {
        title: 'SECTOR INGRESS ROUTE & STAGING ADVISORY',
        badge: 'LOGISTICS CLEARED',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        sections: [
          {
            heading: 'INGRESS ROUTE ALPHA (AVENUE CENTRAL)',
            content: 'Passable for light 4x4 rescue vehicles and shoring trucks up to Grid 46/32. Northern causeway fully open with zero overhead hazards.'
          },
          {
            heading: 'CASUALTY COLLECTION POINT (STAGING)',
            content: 'Structure #B-101 (Municipal Annex A) in NW quadrant is structurally intact (Grade 1). Designate as Field Command Post and medical evacuation pad.'
          },
          {
            heading: 'ROAD CHOKE POINT WARNING',
            content: 'Southern boulevard blocked by ~1.2m concrete rubble. Heavy cranes must divert to Northern Bypass.'
          }
        ]
      };
    }

    // Default: Priorities
    return {
      title: 'SECTOR PRIORITY SEARCH & RESCUE TRIAGE',
      badge: 'DISASTERM3 VLM INFERENCE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      sections: [
        {
          heading: 'ZONE A (NE QUADRANT) — PRIORITY 1',
          content: 'Structure #B-104 & #B-106 show severe pancake collapses. 4-5 storeys compacted into ~2.5m rubble. Slabs block thermal infrared; dispatch Ground Penetrating Radar and seismic acoustic arrays immediately.'
        },
        {
          heading: 'ZONE B (CENTRAL GRID) — PRIORITY 2',
          content: 'Structure #B-108 exhibits severe lean-over shear posture. A survivable triangular void pocket is identified along the southern foundation perimeter.'
        },
        {
          heading: 'ZONE C (SW QUADRANT) — SECONDARY COLLAPSE HAZARD',
          content: 'Structure #B-112 suffered catastrophic pulverization with active secondary collapse risk from leaning brick firewall. Prohibit entry until shoring is set.'
        }
      ]
    };
  };

  const response = getResponseContent();

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const fullSpeech = `${response.title}. ${response.sections.map((s) => `${s.heading}: ${s.content}`).join(' ')}`;
        const utter = new SpeechSynthesisUtterance(fullSpeech.slice(0, 320));
        utter.rate = 1.05;
        utter.onend = () => setIsSpeaking(false);
        utter.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
        setIsSpeaking(true);
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = `${response.title}\n\n` + response.sections.map((s) => `${s.heading}\n${s.content}\n`).join('\n');
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = (tool: string) => {
    sound.playAlert();
    if (!dispatchedUnits.includes(tool)) {
      setDispatchedUnits([...dispatchedUnits, tool]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-3xl overflow-hidden border border-slate-800 bg-slate-950/90 backdrop-blur-xl shadow-2xl min-h-[540px]">
      
      {/* Response Panel Header: Simple, Bold & High Contrast */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Tactical Response Guidance
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">
              Offline VLM · Qwen2.5-VL Edge
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Mute' : 'Voice'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Copy guidance"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Simplified 3-Tab Selector Bar */}
      <div className="p-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 font-mono text-xs">
        <button
          onClick={() => {
            sound.playRadioChirp();
            onClearSelection();
            setActiveTab('priorities');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all ${
            activeTab === 'priorities' && !selectedBuilding
              ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Priority Zones
        </button>

        <button
          onClick={() => {
            sound.playRadioChirp();
            onClearSelection();
            setActiveTab('voids');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all ${
            activeTab === 'voids' && !selectedBuilding
              ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Air Voids
        </button>

        <button
          onClick={() => {
            sound.playRadioChirp();
            onClearSelection();
            setActiveTab('ingress');
          }}
          className={`flex-1 py-1.5 px-2 rounded-xl text-center transition-all ${
            activeTab === 'ingress' && !selectedBuilding
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          Ingress Route
        </button>
      </div>

      {/* Target Notice when building on map is clicked */}
      {selectedBuilding && (
        <div className="px-4 py-2 bg-sky-950/70 border-b border-sky-800/80 flex items-center justify-between text-xs font-mono text-sky-200">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Pinned Target: #{selectedBuilding.id}</span>
          </span>
          <button
            onClick={onClearSelection}
            className="text-[11px] text-sky-400 hover:text-white underline"
          >
            Back to Sector View
          </button>
        </div>
      )}

      {/* Main Guidance Text Display (Clear, Bold, Scannable) */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono select-text bg-slate-950/95">
        
        {/* Title and Badge */}
        <div>
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border mb-2 ${response.badgeColor}`}>
            {response.badge}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide leading-snug">
            {response.title}
          </h2>
        </div>

        {/* Structured Sections */}
        <div className="space-y-4 pt-1">
          {response.sections.map((sec, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {sec.heading}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans sm:font-mono">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Action Dispatch Buttons */}
        <div className="pt-3 border-t border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">
            Quick Sensor Deployment:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => handleDispatch('Ground Penetrating Radar')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                dispatchedUnits.includes('Ground Penetrating Radar')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {dispatchedUnits.includes('Ground Penetrating Radar') ? '✓ GPR Radar Deployed' : '+ Dispatch GPR Radar'}
            </button>

            <button
              onClick={() => handleDispatch('Acoustic Seismic Array')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                dispatchedUnits.includes('Acoustic Seismic Array')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {dispatchedUnits.includes('Acoustic Seismic Array') ? '✓ Acoustic Array Deployed' : '+ Dispatch Acoustic Array'}
            </button>

            <button
              onClick={() => handleDispatch('K9 SAR Team')}
              className={`px-3 py-1.5 rounded-xl border transition-colors ${
                dispatchedUnits.includes('K9 SAR Team')
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {dispatchedUnits.includes('K9 SAR Team') ? '✓ K9 Unit Deployed' : '+ Dispatch K9 Unit'}
            </button>
          </div>
        </div>
      </div>

      {/* Simple Command Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!customQuery.trim()) return;
          sound.playRadioChirp();
          setCustomQuery('');
        }}
        className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          placeholder="Type tactical query (e.g. 'Check Zone C stability', 'Void depth')..."
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs font-mono transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
};
