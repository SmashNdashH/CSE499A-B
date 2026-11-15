// Direction A: the prototype's dark workspace, made sober and given our damage colours.
// The photo pair fills the first screen and the text floats over it in panels, as his workspace did.
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import './a.css';
import { damageVars } from '../core/palette.ts';
import { Workspace } from '../components/Workspace.tsx';
import { ChainStory } from '../components/ChainStory.tsx';
import { HeroBackground } from './HeroBackground.tsx';
import { FutureIdeas, Limitations } from '../components/AboutSections.tsx';
import { DamageMapTable, OtherParts } from '../components/ResultsTables.tsx';
import { DECISION_LINE, HeroPair, Legend, SENTENCE, TeamFooter } from './shared.tsx';

export default function DirectionA() {
  return (
    <div className="dir dir-a" style={damageVars('dark')}>
      <header className="a-bar">
        <a className="a-name" href="#top">Aftermap</a>
        <nav aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#numbers">Numbers</a>
          <a href="#map">Building map</a>
          <a href="#limits">Limits</a>
        </nav>
      </header>

      <main id="top">
        <div className="a-heroband">
        <HeroBackground />
        <section className="a-hero" aria-labelledby="a-h1">
          <div className="a-card">
            <h1 id="a-h1">See what a disaster did, building by building.</h1>
            <p>{SENTENCE}</p>
            <p className="decision">{DECISION_LINE}</p>
            <div className="a-actions">
              <a className="a-btn" href="#map">Open the building map</a>
              <a className="a-btn a-btn-quiet" href="#numbers">See what we measured</a>
            </div>
            <div className="a-legend"><Legend /></div>
          </div>
          <HeroPair palette="dark" />
        </section>
        </div>

        <section id="how" className="a-section" aria-labelledby="a-h2-how">
          <h2 id="a-h2-how">How it works</h2>
          <p className="a-lede">Scroll down. The same pair of photos stays in view and changes at each step, so you see what every part of the system adds.</p>
          <ChainStory palette="dark" />
        </section>

        <section id="numbers" className="a-section" aria-labelledby="a-h2-numbers">
          <h2 id="a-h2-numbers">What we measured</h2>
          <p className="a-lede">Each part of the system was tested on its own, with its own model and images. The parts don't run as one chain yet.</p>
          <div className="a-panel"><DamageMapTable /></div>
          <div className="a-panel"><OtherParts /></div>
        </section>

        <section id="map" className="a-section" aria-labelledby="a-h2-map">
          <h2 id="a-h2-map">Click a building</h2>
          <p className="a-lede">Every outline is one row of the building table. Press a count to light up its buildings.</p>
          <Workspace palette="dark" />
        </section>

        <section id="limits" className="a-section" aria-labelledby="a-h2-limits">
          <h2 id="a-h2-limits">What it can't do yet</h2>
          <div className="a-panel"><Limitations /></div>
        </section>

        <section id="ideas" className="a-section" aria-labelledby="a-h2-ideas">
          <h2 id="a-h2-ideas">Future ideas, not built</h2>
          <div className="a-panel"><FutureIdeas /></div>
        </section>
      </main>
      <TeamFooter />
    </div>
  );
}
