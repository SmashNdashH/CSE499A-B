import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Terminal, 
  Globe, 
  FileCode2, 
  Printer, 
  CheckCircle2, 
  Info,
  X
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

  // The live hosted preview link (or fallback to current window location)
  const sharedUrl = typeof window !== 'undefined' && window.location.href
    ? window.location.href
    : 'https://ais-pre-qfgrosvv52nkyxkiqpgbd7-441752817520.asia-northeast1.run.app';

  const terminalCommands = `# 1. Extract the downloaded project and navigate to the directory
cd disasterm3-applet

# 2. Install dependencies
npm install

# 3. Start local development server
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
    link.download = `DisasterM3_${scenario.id}_Triage_Export.json`;
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
                Show this application to your team member or run it locally
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
            <span>1. Instant Live Link (Easiest)</span>
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
            <span>2. Download &amp; Run Code</span>
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
                    No installation required for your team member!
                  </div>
                  <div className="text-[11px] text-emerald-300/90 leading-relaxed">
                    This web app is live in the cloud. You can copy the link below and send it via Slack, Teams, Email, or WhatsApp. They can immediately open it in any desktop or mobile browser.
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Live Application Link:
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
                    <a
                      href={sharedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-slate-300">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>What will your team member see?</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1 leading-relaxed">
                  <li>Full interactive high-resolution ESRI satellite imagery of disaster zones.</li>
                  <li>4-Bit quantized VLM neural damage triage and building damage classification.</li>
                  <li>Live thermal simulation layer, void radar cavities, and cleared ingress paths.</li>
                  <li>EMS-98 tactical incident action plans with copyable sitreps.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-sky-400" />
                  <span>How to download and run the code locally:</span>
                </div>
                <div className="text-[11px] text-sky-300/90 leading-relaxed">
                  You can download the full source code package from Google AI Studio and run it on any computer with Node.js installed.
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-slate-300 font-mono text-[11px] bg-white/5 p-3.5 rounded-xl border border-white/5">
                <li className="leading-relaxed">
                  <strong className="text-white">Download Code from AI Studio:</strong> Look at the top right header of the AI Studio window and click the <strong>Export / Download Code</strong> button (or push to GitHub).
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Unzip Archive:</strong> Extract the downloaded <code className="text-amber-300">.zip</code> archive into a folder on your computer.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Open Terminal:</strong> Navigate to the extracted folder in VS Code, Terminal, or PowerShell.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-white">Install &amp; Run:</strong> Execute the commands shown below.
                </li>
              </ol>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Terminal Commands:
                  </span>
                  <button
                    onClick={handleCopyCommands}
                    className="text-xs text-[#0084ff] hover:text-blue-400 font-mono flex items-center gap-1"
                  >
                    {copiedCommands ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCommands ? 'Copied' : 'Copy Commands'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/60 border border-white/10 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed">
                  {terminalCommands}
                </pre>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                * Requires Node.js v18 or newer. Vite starts instantly without complicated database setups.
              </div>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="font-semibold text-white">
                  Export Tactical Intelligence &amp; Damage Telemetry
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Need to send the raw building telemetry, triage classification, and VLM guidance data to team members or emergency coordinators? You can download the complete JSON dossier or print a tactical brief.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Download JSON Dossier</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Exports all {scenario.buildings.length} building polygons, damage tiers, void coordinates, and VLM triage directives.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadJson}
                    className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON ({scenario.id})</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Printer className="w-4 h-4 text-sky-400" />
                      <span>Print / PDF Brief</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Generate a clean, printable PDF incident action plan of the current satellite sector for tactical field teams.
                    </p>
                  </div>
                  <button
                    onClick={handlePrint}
                    className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-white/10"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Incident Plan</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="text-[10px] font-mono text-slate-500">
            Sector: <span className="text-slate-300">{scenario.title}</span> ({scenario.location})
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playRadioChirp();
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
