import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  Send, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Radio, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  Radar, 
  CheckCircle2,
  X,
  Compass,
  Layers,
  ChevronDown,
  Building
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
  const [activeTab, setActiveTab] = useState<'priorities' | 'voids' | 'ingress' | 'templates'>('priorities');
  const [customText, setCustomText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState<string[]>([]);

  const getResponseContent = () => {
    if (selectedBuilding) {
      const isDestroyed = selectedBuilding.damage === 'destroyed';
      const isMajor = selectedBuilding.damage === 'major-damage';

      return {
        badge: `${selectedBuilding.collapseType.toUpperCase()} · GRADE ${isDestroyed ? '4 (DESTROYED)' : isMajor ? '3 (MAJOR)' : '1 (INTACT)'}`,
        badgeColor: isDestroyed 
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
          : isMajor 
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: `#${selectedBuilding.id} ${selectedBuilding.name.toUpperCase()}`,
        voidDetails: selectedBuilding.collapseType === 'Pancake'
          ? '4-5 storeys compacted into ~2.5m rubble. High void probability at interior column & shear wall joints. Inter-slab clearance estimated at 0.6m–0.9m.'
          : selectedBuilding.collapseType === 'Lean-Over'
          ? 'Lateral shear tilt. Intact triangular crawlspace void formed along south ground-level foundation.'
          : selectedBuilding.collapseType === 'Soft-Story'
          ? 'Ground level commercial floor crushed; upper levels accessible via north window openings.'
          : 'Structure intact. Minimal debris. Safe for casualty staging.',
        sensorDirective: isDestroyed
          ? 'CRITICAL: Concrete slabs attenuate thermal infrared. FLIR drone cameras will be blind. Deploy Ground Penetrating Radar (GPR) and seismic acoustic listening geophones to listen for survivor tapping.'
          : 'Perform visual inspection followed by search camera probe before entering.',
        ingressDirective: `${selectedBuilding.notes} Safety directive: ${isDestroyed ? 'Deploy hydraulic shoring on western flank prior to tunnel entry.' : 'Clear direct ingress path from north-facing avenue.'}`
      };
    }

    if (activeTab === 'voids') {
      return {
        badge: 'SURVIVABLE VOID ADVISORY',
        badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
        title: 'HIGH-PROBABILITY SURVIVAL VOIDS',
        voidDetails: 'Structure #B-104 (Zone NE): Multi-tier pancake collapse with intact triangular air pockets at interior stair cores. Structure #B-108 (Central): Lean-over cavity on south perimeter.',
        sensorDirective: 'Dispatch Ground Penetrating Radar (GPR) arrays to Zone NE. Slabs act as thermal insulator.',
        ingressDirective: 'Zone SE (Structure #B-112) is fully pulverized (<0.2m clearance). Zero void likelihood; exclude from immediate search.'
      };
    }

    if (activeTab === 'ingress') {
      return {
        badge: 'LOGISTICS CLEARED',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        title: 'INGRESS CORRIDOR & EVACUATION STAGING',
        voidDetails: 'Ingress Route Alpha (Avenue Central) is 100% passable for 4x4 SAR rigs up to Grid 46/32.',
        sensorDirective: 'Structure #B-101 (Municipal Annex A) in NW quadrant is structurally intact (Grade 1). Designate as Field Command & Triage Base.',
        ingressDirective: 'Southern Boulevard is obstructed by ~1.2m concrete rubble. Heavy machinery must divert to Northern Bypass.'
      };
    }

    // Default: Priority Zones
    return {
      badge: 'SECTOR 4 MACRO TRIAGE',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      title: 'PRIORITY SEARCH & RESCUE DIRECTIVES',
      voidDetails: 'Zone A (NE Quadrant): Priority 1. Structure #B-104 & #B-106 show pancake collapses across 4-5 storeys.',
      sensorDirective: 'Dispatch Ground Penetrating Radar and acoustic listening arrays immediately to east façades.',
      ingressDirective: 'Zone C (SW Quadrant): Structure #B-112 red-tagged. Active secondary collapse risk from leaning brick firewall.'
    };
  };

  const response = getResponseContent();

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const textToSpeak = `${response.title}. ${response.voidDetails}. ${response.sensorDirective}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 320));
        utterance.rate = 1.05;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleCopy = () => {
    const textToCopy = `${response.title}\n${response.badge}\n\n1. VOID TARGETS:\n${response.voidDetails}\n\n2. SENSOR DIRECTIVE:\n${response.sensorDirective}\n\n3. INGRESS:\n${response.ingressDirective}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDispatch = (unit: string) => {
    sound.playAlert();
    if (!dispatchedUnits.includes(unit)) {
      setDispatchedUnits([...dispatchedUnits, unit]);
    }
  };

  if (isCollapsed) {
    return (
      <div className="absolute top-18 right-3 z-20 pointer-events-auto">
        <button
          onClick={onToggleCollapse}
          className="p-2.5 rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white shadow-2xl transition-colors"
          title="Open Inspector Panel"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0084ff]" />
        </button>
      </div>
    );
  }

  return (
    <aside className="absolute top-18 right-3 z-20 pointer-events-auto w-84 sm:w-96 max-h-[calc(100vh-130px)] flex flex-col rounded-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono select-none overflow-hidden transition-all">
      
      {/* Inspector Header: Spline Style */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#0084ff]" />
          <span className="font-bold text-white tracking-wide uppercase text-[11px]">
            {selectedBuilding ? `Inspector: ${selectedBuilding.id}` : 'Sector Triage Console'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSpeech}
            className={`p-1.5 rounded-lg border text-[10px] transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                : 'text-slate-400 hover:text-white border-white/10'
            }`}
            title="Read guidance aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white border border-white/10 transition-colors"
            title="Copy SitRep"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleCollapse}
            className="text-slate-500 hover:text-slate-300 text-[11px] ml-1"
            title="Collapse"
          >
            Hide
          </button>
        </div>
      </div>

      {/* Target Properties Bar (if building selected) */}
      {selectedBuilding && (
        <div className="p-3 bg-white/5 border-b border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase">H2 Target Coordinates</span>
            <span className="text-white font-bold">{selectedBuilding.lat.toFixed(4)}°N, {selectedBuilding.lng.toFixed(4)}°E</span>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[10px] pt-1">
            <div className="p-1 rounded-lg bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500 block text-[9px]">Floors</span>
              <span className="text-white font-bold">{selectedBuilding.floors}F</span>
            </div>
            <div className="p-1 rounded-lg bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500 block text-[9px]">Area</span>
              <span className="text-white font-bold">{selectedBuilding.areaM2 || 320}m²</span>
            </div>
            <div className="p-1 rounded-lg bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500 block text-[9px]">Near Collapse</span>
              <span className="text-amber-300 font-bold">{selectedBuilding.distanceToNearestDestroyedM ?? 0}m</span>
            </div>
            <div className="p-1 rounded-lg bg-black/40 border border-white/5 text-center">
              <span className="text-slate-500 block text-[9px]">EMS-98</span>
              <span className="text-emerald-400 font-bold">{selectedBuilding.ems98Grade || 'G?'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick 4-Tab Selector */}
      <div className="p-2 border-b border-white/5 flex items-center gap-1 text-[11px]">
        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTab('priorities');
          }}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            activeTab === 'priorities'
              ? 'bg-[#0084ff] text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Directives
        </button>
        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTab('voids');
          }}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            activeTab === 'voids'
              ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Voids
        </button>
        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTab('ingress');
          }}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            activeTab === 'ingress'
              ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Ingress
        </button>
        <button
          onClick={() => {
            sound.playRadioChirp();
            setActiveTab('templates');
          }}
          className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
            activeTab === 'templates'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Section 3.4 Fixed Question Templates"
        >
          Templates
        </button>
      </div>

      {/* Main Guidance Response Body or Fixed Templates */}
      {activeTab === 'templates' ? (
        <div className="flex-1 overflow-y-auto">
          <FixedQuestionConsole
            scenario={scenario}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={onSelectBuilding}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin select-text">
          {/* Title and Badge */}
          <div>
            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-1.5 ${response.badgeColor}`}>
              {response.badge}
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              {response.title}
            </h3>
          </div>

          {/* Section 1: Void Analysis */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radar className="w-3 h-3" />
              <span>Survivable Void Geometry</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans sm:font-mono">
              {response.voidDetails}
            </p>
          </div>

          {/* Section 2: Sensor Directive */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3" />
              <span>Subsurface Sensor Directive</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans sm:font-mono">
              {response.sensorDirective}
            </p>
          </div>

          {/* Section 3: Extraction Ingress */}
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Ingress &amp; Hazard Clearance</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans sm:font-mono">
              {response.ingressDirective}
            </p>
          </div>

          {/* Dispatch Action Buttons */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block">
              Deploy Tactical Units:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <button
                onClick={() => handleDispatch('GPR Radar Array')}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  dispatchedUnits.includes('GPR Radar Array')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {dispatchedUnits.includes('GPR Radar Array') ? '✓ GPR Deployed' : '+ Dispatch GPR'}
              </button>

              <button
                onClick={() => handleDispatch('Acoustic Geophones')}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  dispatchedUnits.includes('Acoustic Geophones')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {dispatchedUnits.includes('Acoustic Geophones') ? '✓ Geophones Set' : '+ Dispatch Geophones'}
              </button>

              <button
                onClick={() => handleDispatch('K9 SAR Team')}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  dispatchedUnits.includes('K9 SAR Team')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {dispatchedUnits.includes('K9 SAR Team') ? '✓ K9 Dispatched' : '+ Dispatch K9'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Launcher Bar */}
      <div className="p-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            sound.playRadioChirp();
            onOpenDisasTeller();
          }}
          className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
        >
          <Building className="w-3.5 h-3.5" />
          <span>DisasTeller 6-Team Reports (O3)</span>
        </button>
      </div>
    </aside>
  );
};
