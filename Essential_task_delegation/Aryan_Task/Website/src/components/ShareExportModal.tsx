import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Terminal, 
  Download, 
  Globe, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  Info, 
  FileCode2,
  Printer
} from 'lucide-react';
import { DisasterScenario, BuildingFeature } from '../types/disaster';
import { sound } from '../utils/audio';

interface ShareExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: DisasterScenario;
  selectedBuilding: BuildingFeature | null;
}

export const ShareExportModal: React.FC<ShareExportModalProps> = ({
  isOpen,
  onClose,
  scenario,
  selectedBuilding
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'download' | 'export'>('link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCommands, setCopiedCommands] = useState(false);

  if (!isOpen) return null;

  const sharedUrl = typeof window !== 'undefined' && window.location.href
    ? window.location.href
    : 'http://localhost:3000';

  const terminalCommands = `# 1. Clone repository and navigate to the Website folder
cd Essential_task_delegation/Aryan_Task/Website

# 2. Install dependencies
npm install

# 3. Start local development server (100% offline, 0 external API calls)
npm run dev

# 4. Open in browser at http://localhost:3000`;

  const handleCopyLink = () => {
    sound.playRadioChirp();
    navigator.clipboard?.writeText(sharedUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCommands = () => {
    sound.playRadioChirp();
    navigator.clipboard?.writeText(terminalCommands);
    setCopiedCommands(true);
    setTimeout(() => setCopiedCommands(false), 2200);
  };

  const handleDownloadJson = () => {
    sound.playRadioChirp();
    const exportData = {
      project: 'DisasterM3 - Post-Disaster Damage Assessment & Rescue Guidance',
      exportTimestamp: new Date().toISOString(),
      provenance: 'Illustration: not real data',
      scenario: {
        id: scenario.id,
        title: scenario.title,
        location: scenario.location,
        coordinates: [scenario.centerLat, scenario.centerLng],
        zoom: scenario.defaultZoom,
        disasterType: scenario.disasterType,
        date: scenario.date,
        resolution: scenario.resolution,
        totalBuildings: scenario.totalBuildings,
        damageCounts: scenario.damageCounts,
        sampleGuidancePrompt: scenario.sampleGuidancePrompt,
        sampleVlmResponse: scenario.sampleVlmResponse,
        buildings: scenario.buildings
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DisasterM3_${scenario.id}_Export.json`;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#121214] rounded-2xl border border-white/10 shadow-2xl p-5 sm:p-6 text-slate-200 font-sans space-y-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0084ff]/20 text-[#0084ff] flex items-center justify-center border border-[#0084ff]/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Share &amp; Export DisasterM3
              </h2>
              <p className="text-xs text-slate-400">
                Run locally or export spatial building data
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
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'link'
                ? 'bg-[#0084ff] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>1. Local Web Server</span>
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'download'
                ? 'bg-[#0084ff] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>2. Run Code Locally</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'export'
                ? 'bg-[#0084ff] text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>3. Export Scenario Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {activeTab === 'link' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <div className="space-y-1">
                  <div className="font-semibold text-emerald-200">
                    Offline First Decision Support System
                  </div>
                  <div className="text-[11px] text-emerald-300/90 leading-relaxed">
                    This web app requires zero external API keys and runs completely within the local browser environment.
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Local Server URL:
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-blue-400 break-all select-all">
                  <span className="flex-1 truncate">{sharedUrl}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-[#0084ff] hover:bg-[#0070d8] text-white font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key System Capabilities</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1 leading-relaxed">
                  <li>Autonomous offline canvas engine with 2D and 3D isometric city rendering.</li>
                  <li>H2 spatial SQLite table schema inspector and query template execution.</li>
                  <li>Real DisasTeller offline proof reports from fine-tuned Qwen2.5-VL-7B.</li>
                  <li>Verified research gates O1–O4 with exact source provenance links.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-sky-400" />
                  <span>How to run the code locally:</span>
                </div>
                <div className="text-[11px] text-sky-300/90 leading-relaxed">
                  You can run the web interface directly on any machine with Node.js installed.
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300 font-mono text-[11px] bg-white/5 p-3.5 rounded-xl border border-white/5">
                <li className="leading-relaxed">
                  <strong className="text-white">Terminal Navigation:</strong> Open a terminal in the project directory.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Run Dev Server:</strong> Execute <code className="text-amber-300">npm install &amp;&amp; npm run dev</code>.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">View in Browser:</strong> Open <code className="text-emerald-300">http://localhost:3000</code>.
                </li>
              </ol>

              <div className="relative">
                <pre className="p-3.5 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-[11px] overflow-x-auto select-all">
                  {terminalCommands}
                </pre>
                <button
                  onClick={handleCopyCommands}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] flex items-center gap-1 transition-colors"
                >
                  {copiedCommands ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCommands ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="font-bold text-white text-xs">
                  Export Current Sector Data (JSON)
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Exports the complete scenario data, building footprints, and damage classifications formatted according to the H2 SQLite per-building schema.
                </p>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleDownloadJson}
                    className="px-4 py-2 rounded-xl bg-[#0084ff] hover:bg-[#0070d8] text-white font-bold flex items-center gap-2 transition-colors text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Scenario JSON</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold flex items-center gap-2 transition-colors text-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Page</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10 font-mono text-xs">
          <div className="text-[11px] text-amber-400/90 font-bold">
            Illustration: not real data
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
