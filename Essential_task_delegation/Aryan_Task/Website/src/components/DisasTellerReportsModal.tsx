import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Printer, 
  X, 
  Layers,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { DisasterScenario } from '../types/disaster';
import { OFFLINE_PROOF_REPORTS } from '../data/proofReports';
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
  const [selectedReportId, setSelectedReportId] = useState<string>(OFFLINE_PROOF_REPORTS[0].id);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentReport = OFFLINE_PROOF_REPORTS.find((r) => r.id === selectedReportId) || OFFLINE_PROOF_REPORTS[0];

  const handleCopy = () => {
    sound.playRadioChirp();
    navigator.clipboard?.writeText(currentReport.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    sound.playRadioChirp();
    const blob = new Blob([currentReport.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentReport.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                  DisasTeller Offline Report System (O3 Proof Run)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 font-bold">
                  INTERNET OFF PROOF RUN
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Real outputs from fine-tuned Qwen2.5-VL-7B · Wajima, Japan run (Ridita, 11 Nov 2026)
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

        {/* Source Path & Provenance Banner */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-purple-300 font-bold">Source Repository Path:</span>
            <span className="text-[10px] text-slate-400">Zero External API Calls</span>
          </div>
          <code className="text-[11px] text-amber-300 block break-all">
            {currentReport.path}
          </code>
          <p className="text-[10px] text-slate-400 pt-0.5 leading-relaxed">
            Evaluation Note: These are the exact, unedited offline reports from our team proof run on Wajima earthquake data. As documented in the team review, known model quirks include a wrong map reading in section 2, a placeholder hotline number, and limited formal citations.
          </p>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5 overflow-x-auto text-xs font-mono">
          {OFFLINE_PROOF_REPORTS.map((rep) => (
            <button
              key={rep.id}
              onClick={() => {
                sound.playRadioChirp();
                setSelectedReportId(rep.id);
              }}
              className={`py-1.5 px-3 rounded-lg whitespace-nowrap transition-all ${
                selectedReportId === rep.id
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {rep.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-black/50 border border-white/5 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text scrollbar-thin">
          {currentReport.content}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
          <div className="text-[11px] text-slate-400">
            File: <span className="text-white">{currentReport.filename}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
