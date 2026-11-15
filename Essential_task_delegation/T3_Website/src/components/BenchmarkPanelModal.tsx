// The benchmark panel: every number comes from the facts file, with its source and its set of images.
import { useEffect, useRef } from 'react';
import { DamageMapTable, OtherParts, SixTasksTable } from './ResultsTables.tsx';

interface BenchmarkPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BenchmarkPanelModal({ isOpen, onClose }: BenchmarkPanelModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
  }, [isOpen]);
  return (
    <dialog ref={ref} className="ws-dialog" onClose={onClose} aria-labelledby="bench-title" {...{ closedby: 'any' }}>
      <header>
        <h2 id="bench-title">Benchmark</h2>
        <button type="button" className="ws-chip" onClick={onClose}>Close</button>
      </header>
      {isOpen && (
        <div className="ws-dialog-body">
          <p className="ws-note">Each part was tested on its own, with its own model and its own images. They don't run as one chain yet, so these numbers must not be read as one system's score.</p>
          <DamageMapTable />
          <SixTasksTable />
          <OtherParts />
        </div>
      )}
    </dialog>
  );
}
