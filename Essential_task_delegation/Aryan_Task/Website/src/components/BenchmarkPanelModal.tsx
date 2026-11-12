import React, { useState } from 'react';
import { 
  BarChart3, 
  ShieldCheck, 
  Award, 
  Cpu, 
  FileCheck2, 
  AlertTriangle, 
  Users, 
  ExternalLink, 
  X,
  Database,
  CheckCircle2,
  TrendingUp,
  Scale
} from 'lucide-react';
import { SPRINT_TRACKS, TEAM_MEMBERS, RESEARCH_DOCUMENTS } from '../data/mockScenarios';
import { sound } from '../utils/audio';

interface BenchmarkPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkPanelModal: React.FC<BenchmarkPanelModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'audit' | 'team'>('benchmarks');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-6 text-slate-200 font-sans space-y-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Research Scorecard &amp; Architecture Audit
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30 font-bold">
                  CSE499B / EEE499B / ETE499B
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Verified Benchmark Gates O1–O4 · Clean Data Validation · Group 5 Senior Design Project
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-[#0084ff] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>1. Verified Gates (O1–O4)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'audit'
                ? 'bg-[#0084ff] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. E5 Clean Data Audit &amp; Caveats</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'team'
                ? 'bg-[#0084ff] text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Group 5 Team &amp; Ledger</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs font-mono scrollbar-thin select-text">
          {activeTab === 'benchmarks' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All Four Core Project Milestones (O1–O4) Verified</span>
                </div>
                <div className="text-[11px] leading-relaxed">
                  Every metric reflects strict evaluations on Kaggle T4 GPUs and offline CPU benchmarks under pre-registered keep rules.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SPRINT_TRACKS.map((track) => (
                  <div key={track.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{track.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${track.badgeColor}`}>
                          PASSED
                        </span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold">
                        Lead: {track.owner}
                      </div>
                      <div className="text-slate-300 text-[11px]">
                        <strong>Technique:</strong> {track.testedTechnique}
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {track.resultSummary}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{track.metricLabel}:</span>
                        <span className="text-emerald-400 font-bold text-xs">
                          {track.finalScore} <span className="text-slate-500 text-[10px]">(Baseline: {track.baselineScore})</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, (track.finalScore / (track.baselineScore * 1.5)) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-400">
                      {track.details.map((d, i) => (
                        <div key={i} className="flex items-start gap-1">
                          <span className="text-[#0084ff]">•</span>
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>E5 Train/Validation Leak Audit &amp; Clean Data Verification</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  During Task E5 (26 October 2026), our team audited the original 645 validation pairs and discovered that 40 pairs in xBD's Southern California and Woolsey Fire sets shared before-images with training data.
                </p>
                <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-xs">
                  <strong>The Team Decision:</strong> Every score was re-evaluated on the 605 clean pairs without the 40 leaked pairs. On clean data, SAM 3 + R16c step 5b achieves <strong>0.3161 Destroyed IoU</strong> (three-seed mean: 0.3065), officially meeting O1 on verified clean data.
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-bold text-white text-xs block uppercase">
                  Honest Research Limitations &amp; Caveats (System Design Notes Section 4.4):
                </span>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                  <li><strong>VLM Counting Weakness:</strong> When asked to count buildings directly, 7B VLMs answer correctly only 30.3% of the time. Counting in DisasterM3 is routed strictly through H2's per-building spatial table (39.2% accuracy).</li>
                  <li><strong>Turkey Earthquake Attenuation:</strong> Concrete slab compaction attenuates thermal IR drone cameras. Structural pancaking requires seismic geophones and Ground Penetrating Radar rather than optical thermal imaging alone.</li>
                  <li><strong>Strict Offline Cost Rule:</strong> Historical reconstruction budgets and casualties from past disasters are explicitly declared "not available offline" to avoid small-LLM hallucinations.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
                <span className="font-bold text-white text-xs block uppercase">
                  Research Project Group 5 · Senior Design
                </span>
                <p className="text-slate-300 text-[11px]">
                  Resource-Efficient Neural Architectures for Post-Disaster Damage Assessment &amp; Rescue Guidance.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TEAM_MEMBERS.map((tm, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                    <div className="font-bold text-white text-xs flex items-center justify-between">
                      <span>{tm.name}</span>
                      <span className="text-[10px] text-[#0084ff]">Group 5</span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold">{tm.role}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">{tm.focus}</div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-[11px]">
                <strong className="text-white block uppercase">Tracked Engineering Deliverables:</strong>
                <div className="text-slate-400">
                  • Champion Model: <code className="text-amber-300">AbrarAlam/disasterm3-qwen2.5vl7b-l0s2-mergedFP</code> (Hugging Face)<br/>
                  • Edge Segmenter: <code className="text-emerald-300">L1b INT8 keep1+3 static ONNX (33 MB)</code><br/>
                  • Offline RAG: <code className="text-blue-300">DisasTeller fixed_flow.py + hybrid MiniLM/BM25 (405 sections)</code><br/>
                  • Spatial Database: <code className="text-purple-300">H2 SQLite Table (117,687 buildings, 2,652 benchmark images)</code>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
          <div className="text-[11px] text-slate-400">
            DisasterM3 Engine · CSE499B Senior Design Project
          </div>
          <button
            onClick={() => {
              sound.playRadioChirp();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
