// Direction C: the page as a survey sheet. The map comes first and takes the room, with the
// title block, the legend and the notes in its margin, the way a printed map sheet carries them.
// The building map is the hero: the first thing a visitor can do is click a building.
import '@fontsource-variable/archivo/wdth.css';
import './c.css';
import { damageVars } from '../core/palette.ts';
import { Workspace } from '../components/Workspace.tsx';
import { DamageMapTable, OtherParts } from '../components/ResultsTables.tsx';
import { COURSE, DECISION_LINE, SENTENCE, TEAM } from './shared.tsx';

export default function DirectionC() {
  return (
    <div className="dir dir-c" style={damageVars('light')}>
      <div className="c-sheet">
        <header className="c-title">
          <div className="c-title-main">
            <h1>Footprint</h1>
            <p>{SENTENCE}</p>
          </div>
          <dl className="c-block">
            <div><dt>Sheet</dt><dd>Building damage, from a before and an after satellite photo</dd></div>
            <div><dt>Units</dt><dd>Pixels. The dataset gives no ground resolution, so there are no metres.</dd></div>
            <div><dt>Standing note</dt><dd className="decision">{DECISION_LINE}</dd></div>
          </dl>
          <nav aria-label="Sections">
            <a href="#map">The map</a>
            <a href="#numbers">How far to trust it</a>
          </nav>
        </header>

        <main>
          <section id="map" className="c-map" aria-labelledby="c-h2-map">
            <h2 id="c-h2-map" className="sr-only">The building map</h2>
            <Workspace palette="light" ticks sweep />
          </section>

          <section id="numbers" className="c-numbers" aria-labelledby="c-h2">
            <h2 id="c-h2">How far to trust this sheet</h2>
            <p className="c-lede">Each part of the system was tested on its own, with its own model and images. The parts don't run as one chain yet.</p>
            <DamageMapTable />
            <OtherParts />
          </section>
        </main>

        <footer className="c-foot">
          <dl className="c-block">
            <div><dt>Compiled by</dt><dd>{TEAM.join(', ')}</dd></div>
            <div><dt>For</dt><dd>{COURSE}</dd></div>
            <div><dt>Built on</dt><dd>DisasterM3, xBD, Qwen2.5-VL, SAM 3, DisasTeller and ONNX Runtime Web. The map workspace began as Aryan Sami's prototype.</dd></div>
            <div><dt>Standing note</dt><dd className="decision">{DECISION_LINE}</dd></div>
          </dl>
        </footer>
      </div>
    </div>
  );
}
