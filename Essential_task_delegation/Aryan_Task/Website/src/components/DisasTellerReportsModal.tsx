import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  Check, 
  Copy, 
  Download, 
  Printer, 
  AlertTriangle, 
  ExternalLink, 
  X, 
  Building2, 
  Activity, 
  HeartHandshake, 
  Users, 
  Megaphone, 
  Hammer, 
  BookOpen, 
  Lock,
  Layers
} from 'lucide-react';
import { DisasterScenario, DisasTellerReport, DisasTellerCitation } from '../types/disaster';
import { sound } from '../utils/audio';

interface DisasTellerReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: DisasterScenario;
}

export const DisasTellerReportsModal: React.FC<DisasTellerReportsModalProps> = ({
  isOpen,
  onClose,
  scenario
}) => {
  const [activeTab, setActiveTab] = useState<'expert' | 'alerts' | 'emergency' | 'assignment' | 'public' | 'reconstruction' | 'citations'>('expert');
  const [copied, setCopied] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<DisasTellerCitation | null>(null);

  if (!isOpen) return null;

  const report = scenario.disasTellerReport;

  const handleCopy = () => {
    sound.playRadioChirp();
    if (!report) return;

    const fullText = `DISASTELLER OFFLINE TACTICAL DOSSIER
Sector: ${scenario.title} (${scenario.location})
Mode: ${report.mode} | Flow: ${report.flowType}
Timestamp: ${report.generatedAt}

============================================================
1. EXPERT TEAM REPORT (DAMAGE & EMS-98 GRADES)
============================================================
${report.expertTeam.overview}

Building Damage Classification:
${report.expertTeam.buildingGrades.map((g) => `• ${g.buildingId} (${g.buildingName}): Grade ${g.grade} - ${g.rationale} ${g.citation}`).join('\n')}

Conclusions:
${report.expertTeam.conclusions}

============================================================
2. ALERTS TEAM REPORT (SECONDARY HAZARDS)
============================================================
Danger Warning: ${report.alertsTeam.dangerAreaAlert}
Secondary Hazards: ${report.alertsTeam.secondaryHazards}
Broadcast: ${report.alertsTeam.socialMediaBroadcast}

============================================================
3. EMERGENCY SERVICE TEAM (SHELTER & HOSPITALS)
============================================================
Shelters: ${report.emergencyServiceTeam.emergencyShelters}
Hospitals & Triage: ${report.emergencyServiceTeam.hospitalsTriage}
Ingress Corridors: ${report.emergencyServiceTeam.immediateTransportationRecovery}
Humanitarian Standard: ${report.emergencyServiceTeam.sphereStandard}

============================================================
4. RESOURCE ALLOCATION TEAM (INSARAG USAR)
============================================================
USAR Teams: ${report.resourceAllocationTeam.usarTeamTypes}
ASR Levels: ${report.resourceAllocationTeam.asrLevels}
Worksite Triage: ${report.resourceAllocationTeam.worksiteTriagePriorities}
Shifts: ${report.resourceAllocationTeam.shiftRotations}

============================================================
5. PUBLIC COMMUNITY DIRECTIVE
============================================================
${report.publicCommunityReport.headline}
Evacuation: ${report.publicCommunityReport.evacuationShelterDirectives}
Supplies: ${report.publicCommunityReport.essentialSuppliesAdvice}

============================================================
6. RECONSTRUCTION PLAN
============================================================
Retrofit / Rebuild: ${report.reconstructionPlan.repairRetrofitRebuild}
Debris Management: ${report.reconstructionPlan.debrisManagement}
Building Codes: ${report.reconstructionPlan.buildingCodesCompliance}
Budget: ${report.reconstructionPlan.financialBudgetNotice}
`;

    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = () => {
    sound.playRadioChirp();
    if (!report) return;

    const exportBlob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(exportBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DisasTeller_O3_${scenario.id}_OfflineReport.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    sound.playRadioChirp();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-6 text-slate-200 font-sans space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  DisasTeller Offline Report System (O3)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 font-bold">
                  MODE: OFFLINE, FIXED FLOW
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono text-[10px] border border-white/5">
                  TELEMETRY: OFF
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Deterministic 4-Agent Rescue Guidance · 405 Guideline Sections Indexed · Zero External API Calls
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playRadioChirp();
              onClose();
            }}
            className="w-7 h-7 rounded-lg bg-white/5 text-slate-400 flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6-Report Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/5 text-xs font-mono overflow-x-auto scrollbar-thin">
          <button
            onClick={() => setActiveTab('expert')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'expert'
                ? 'bg-[#0084ff] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>1. Expert Team</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'alerts'
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>2. Alerts Team</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'emergency'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Emergency Services</span>
          </button>

          <button
            onClick={() => setActiveTab('assignment')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'assignment'
                ? 'bg-purple-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>4. USAR Assignment</span>
          </button>

          <button
            onClick={() => setActiveTab('public')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'public'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>5. Public Directives</span>
          </button>

          <button
            onClick={() => setActiveTab('reconstruction')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'reconstruction'
                ? 'bg-sky-600 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>6. Reconstruction</span>
          </button>

          <button
            onClick={() => setActiveTab('citations')}
            className={`py-1.5 px-3 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeTab === 'citations'
                ? 'bg-white/20 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Citations ({report?.citations.length || 0})</span>
          </button>
        </div>

        {/* Main Report Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono scrollbar-thin select-text">
          {report && (
            <>
              {/* TAB 1: EXPERT TEAM */}
              {activeTab === 'expert' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0084ff]" />
                      <span>Task 1: Damage Assessment &amp; Building Classification</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {report.expertTeam.overview}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Building Damage Grades &amp; EMS-98 Citations:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {report.expertTeam.buildingGrades.map((bg) => (
                        <div key={bg.buildingId} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{bg.buildingId}: {bg.buildingName}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              bg.grade === 'G5' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              bg.grade === 'G4' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              Grade {bg.grade}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{bg.rationale}</p>
                          <div className="pt-1">
                            <button
                              onClick={() => {
                                const found = report.citations.find((c) => c.id === bg.citation);
                                if (found) setSelectedCitation(found);
                              }}
                              className="text-[10px] text-[#0084ff] hover:underline flex items-center gap-1 font-bold"
                            >
                              <span>{bg.citation}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0084ff]/10 border border-[#0084ff]/20 text-blue-200 space-y-1 text-[11px]">
                    <strong className="text-white block">Expert Team Conclusions:</strong>
                    <div>{report.expertTeam.conclusions}</div>
                  </div>
                </div>
              )}

              {/* TAB 2: ALERTS TEAM */}
              {activeTab === 'alerts' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                    <div className="font-bold text-rose-300 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Critical Danger Area Alert</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {report.alertsTeam.dangerAreaAlert}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[11px] text-amber-200">
                    <strong className="text-white block uppercase">Secondary Hazards &amp; Perimeter Warnings:</strong>
                    <div>{report.alertsTeam.secondaryHazards}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-[11px] text-slate-300">
                    <strong className="text-white block uppercase">Tactical Radio &amp; Social Broadcast:</strong>
                    <div>{report.alertsTeam.socialMediaBroadcast}</div>
                  </div>
                </div>
              )}

              {/* TAB 3: EMERGENCY SERVICES */}
              {activeTab === 'emergency' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>Task 3: Emergency Shelters &amp; Hospital Recovery</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {report.emergencyServiceTeam.emergencyShelters}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-emerald-400 block uppercase">Hospitals &amp; CCP Intake:</strong>
                      <div className="text-slate-300">{report.emergencyServiceTeam.hospitalsTriage}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-sky-400 block uppercase">Ingress Corridors Cleared:</strong>
                      <div className="text-slate-300">{report.emergencyServiceTeam.immediateTransportationRecovery}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] space-y-1">
                    <strong className="text-white block">Sphere Humanitarian Standard Mandate:</strong>
                    <div>{report.emergencyServiceTeam.sphereStandard}</div>
                  </div>
                </div>
              )}

              {/* TAB 4: USAR ASSIGNMENT */}
              {activeTab === 'assignment' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="font-bold text-purple-300 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span>Task 4: INSARAG Tactical Staff Allocation</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {report.resourceAllocationTeam.usarTeamTypes}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-amber-400 block uppercase">ASR Levels Assigned:</strong>
                      <div className="text-slate-300">{report.resourceAllocationTeam.asrLevels}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-rose-400 block uppercase">Worksite Triage Rule:</strong>
                      <div className="text-slate-300">{report.resourceAllocationTeam.worksiteTriagePriorities}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-[11px] text-slate-300">
                    <strong className="text-white block uppercase">Operational Shift Cycles:</strong>
                    <div>{report.resourceAllocationTeam.shiftRotations}</div>
                  </div>
                </div>
              )}

              {/* TAB 5: PUBLIC COMMUNITY */}
              {activeTab === 'public' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                    <div className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-emerald-400" />
                      <span>{report.publicCommunityReport.headline}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {report.publicCommunityReport.evacuationShelterDirectives}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-[11px]">
                    <strong className="text-amber-400 block uppercase">Essential Supplies &amp; Public Safety:</strong>
                    <div className="text-slate-300">{report.publicCommunityReport.essentialSuppliesAdvice}</div>
                  </div>
                </div>
              )}

              {/* TAB 6: RECONSTRUCTION PLAN */}
              {activeTab === 'reconstruction' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 space-y-2">
                    <div className="font-bold text-sky-300 text-sm flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-sky-400" />
                      <span>Task 6: Reconstruction &amp; Engineering Retrofit Plan</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {report.reconstructionPlan.repairRetrofitRebuild}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-amber-400 block uppercase">Debris Clearing Strategy:</strong>
                      <div className="text-slate-300">{report.reconstructionPlan.debrisManagement}</div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <strong className="text-emerald-400 block uppercase">Building Codes Compliance:</strong>
                      <div className="text-slate-300">{report.reconstructionPlan.buildingCodesCompliance}</div>
                    </div>
                  </div>

                  {/* Strictly compliant with System Design Notes Section 2.2 */}
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1.5 text-[11px]">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>System Design Rule 2.2 Compliance: Financial Budget</span>
                    </div>
                    <div>{report.reconstructionPlan.financialBudgetNotice}</div>
                    <div className="text-[10px] text-slate-400 italic">
                      "Why the wording matters: an agent told to search, with no search tool, makes up numbers. Made-up numbers are avoided by explicitly declaring data unavailable offline."
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: CITATIONS */}
              {activeTab === 'citations' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300">
                    405 cited sections from 6 verified sources (EMS-98, INSARAG Vol II &amp; III, Sphere, xBD, IWG-SEM). Every claim in this dossier is verified against these official field references.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {report.citations.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCitation(c)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedCitation?.id === c.id
                            ? 'bg-[#0084ff]/20 border-[#0084ff] text-white shadow-md'
                            : 'bg-black/40 border-white/5 hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <div className="font-bold text-[#0084ff] text-xs flex items-center justify-between">
                          <span>{c.id}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{c.source}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                          "{c.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected Citation Drawer (If clicked) */}
        {selectedCitation && (
          <div className="p-3 rounded-xl bg-[#0084ff]/10 border border-[#0084ff]/30 text-xs font-mono space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between text-[#0084ff] font-bold">
              <span>{selectedCitation.id} · {selectedCitation.source}</span>
              <button
                onClick={() => setSelectedCitation(null)}
                className="text-slate-400 hover:text-white text-[10px]"
              >
                ✕ Close Citation
              </button>
            </div>
            <p className="text-slate-200 text-[11px] italic leading-relaxed">
              "{selectedCitation.text}"
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
          <div className="text-[11px] text-slate-400 hidden sm:block">
            Sector: <strong className="text-white">{scenario.title}</strong> · Mode: <strong className="text-emerald-400">Offline Fixed Flow</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-xl bg-[#0084ff] hover:bg-[#0070d8] text-white font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy All 6 Reports'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-white/10"
              title="Download JSON dossier"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-medium flex items-center gap-1.5 transition-colors border border-white/10"
              title="Print Action Plan"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => {
                sound.playRadioChirp();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
