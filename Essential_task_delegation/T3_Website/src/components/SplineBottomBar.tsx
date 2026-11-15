// The class filter under the map. Each count is a button that highlights its buildings.
import type { Building, ClassId } from '../types/disaster.ts';
import { CLASS_IDS, CLASS_NAMES } from '../types/disaster.ts';
import { countsByClass } from '../core/queries.ts';
import Counter from '../vendor/react-bits/Counter.tsx';

interface SplineBottomBarProps {
  buildings: Building[] | null;
  /** The class whose buildings are highlighted now, if the highlight is a whole class. */
  activeClass: ClassId | null;
  onPickClass: (c: ClassId | null) => void;
}

/** A count whose digits roll to the new value when the pair changes: each image has its own counts. */
function Count({ value }: { value: number }) {
  return <Counter value={value} fontSize="1em" fontWeight={700} duration={0.5} bounce={0} motionBlur={false} intro={false} fade={0.15} className="num" />;
}

export function SplineBottomBar({ buildings, activeClass, onPickClass }: SplineBottomBarProps) {
  if (!buildings) return <footer className="ws-bottom"><p className="ws-missing">No counts: this pair has no building table. Missing is not zero.</p></footer>;
  const n = countsByClass(buildings);
  return (
    <footer className="ws-bottom" role="group" aria-label="Counts by class. Each count highlights its buildings.">
      <button type="button" className="ws-countbtn" data-count={buildings.length} aria-pressed={activeClass === null} onClick={() => onPickClass(null)}>
        <Count value={buildings.length} /> buildings found
      </button>
      {CLASS_IDS.map((c) => (
        <button key={c} type="button" className="ws-countbtn" data-count={n[c]} aria-pressed={activeClass === c} onClick={() => onPickClass(activeClass === c ? null : c)}>
          <span className={`swatch swatch-${c}`} /><Count value={n[c]} /> {CLASS_NAMES[c]}
        </button>
      ))}
      <span className="ws-note">Counts come from fixed queries on the building table, never from a language model.</span>
    </footer>
  );
}
