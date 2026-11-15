// Direction B: the "Signal" style of the review deck. Deep navy and bone surfaces, one muted gold
// accent, serif headlines, monospace details, hairline rules.
import '@fontsource-variable/source-serif-4';
import '@fontsource-variable/dm-sans';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './b.css';
import { damageVars } from '../core/palette.ts';
import { Workspace } from '../components/Workspace.tsx';
import { DamageMapTable, OtherParts } from '../components/ResultsTables.tsx';
import { COURSE, DECISION_LINE, HeroPair, Legend, SENTENCE, TeamFooter } from './shared.tsx';

export default function DirectionB() {
  return (
    <div className="dir dir-b">
      <div className="b-navy" style={damageVars('dark')}>
        <header className="b-chrome">
          <a className="b-name" href="#top">Second Pass</a>
          <nav aria-label="Sections">
            <a href="#numbers">Numbers</a>
            <a href="#map">Building map</a>
          </nav>
          <span className="b-course">{COURSE}</span>
        </header>
        <main id="top" className="b-hero">
          <div className="b-hero-text">
            <h1><span>Two satellite photos in.</span> <span>A damage map of every building out.</span></h1>
            <p>{SENTENCE}</p>
            <p className="decision">{DECISION_LINE}</p>
            <Legend />
          </div>
          <HeroPair palette="dark" />
        </main>
      </div>

      <section id="numbers" className="b-bone" style={damageVars('light')} aria-labelledby="b-h2-numbers">
        <div className="b-wrap">
          <h2 id="b-h2-numbers">What we measured</h2>
          <p className="b-lede">Each part of the system was tested on its own, with its own model and images. The parts don't run as one chain yet.</p>
          <DamageMapTable />
          <OtherParts />
        </div>
      </section>

      <section id="map" className="b-navy" style={damageVars('dark')} aria-labelledby="b-h2-map">
        <div className="b-wrap">
          <h2 id="b-h2-map">Every building, one click away</h2>
          <p className="b-lede">Every outline is one row of the building table. Press a count to light up its buildings.</p>
          <Workspace palette="dark" />
        </div>
        <TeamFooter />
      </section>
    </div>
  );
}
