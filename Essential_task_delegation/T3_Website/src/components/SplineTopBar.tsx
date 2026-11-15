// The workspace's top bar: which pair, which method (only when a pair has two), and the two panels.
import { BarChart3, FileText } from 'lucide-react';
import type { PairEntry } from '../types/disaster.ts';
import { METHOD_LABELS, prettyEvent } from '../core/useGallery.ts';

interface SplineTopBarProps {
  pairs: PairEntry[];
  pairId: string;
  onSelectPair: (id: string) => void;
  methodId: string;
  onSelectMethod: (id: string) => void;
  onOpenReports: () => void;
  onOpenBenchmark: () => void;
}

export function SplineTopBar({ pairs, pairId, onSelectPair, methodId, onSelectMethod, onOpenReports, onOpenBenchmark }: SplineTopBarProps) {
  const pair = pairs.find((p) => p.id === pairId);
  return (
    <header className="ws-top">
      <div className="ws-group" role="group" aria-label="Image pair">
        {pairs.map((p) => (
          <button key={p.id} type="button" className="ws-chip" aria-pressed={p.id === pairId} onClick={() => onSelectPair(p.id)}>
            {prettyEvent(p.info.event)}
          </button>
        ))}
      </div>
      {pair && pair.methods.length > 1 && (
        <div className="ws-group" role="group" aria-label="Damage-map method">
          {pair.methods.map((m) => (
            <button key={m.id} type="button" className="ws-chip" aria-pressed={m.id === methodId} onClick={() => onSelectMethod(m.id)}>
              {METHOD_LABELS[m.id] ?? m.id}
            </button>
          ))}
        </div>
      )}
      <div className="ws-group ws-group-end">
        <button type="button" className="ws-chip" onClick={onOpenReports}><FileText aria-hidden="true" size={15} /> The six offline reports</button>
        <button type="button" className="ws-chip" onClick={onOpenBenchmark}><BarChart3 aria-hidden="true" size={15} /> Benchmark</button>
      </div>
    </header>
  );
}
