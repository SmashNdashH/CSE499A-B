// About: what the system can't do yet, what is only an idea, who built it, and what it is built on.
import { FutureIdeas, Limitations } from '../components/AboutSections.tsx';
import { COURSE, TEAM } from '../site/shared.tsx';

const CREDITS: [string, string][] = [
  ['DisasterM3', 'the dataset and benchmark of before-and-after satellite pairs that every result here is measured on'],
  ['xBD', 'the building-damage dataset that most of DisasterM3\'s validation pairs come from'],
  ['Qwen2.5-VL', 'the language model we fine-tuned to read disaster images and write the reports'],
  ['SAM 3', 'the model that outlines each building on the before photo in the find-then-grade method'],
  ['DisasTeller', 'the published report system we rewired to run on our own model, offline'],
  ['ONNX Runtime Web', 'the engine that runs the 8-bit before-and-after model inside the visitor\'s browser'],
];

export default function About() {
  return (
    <>
      <section className="a-section a-page" aria-labelledby="about-h1">
        <h1 id="about-h1">What it can't do yet</h1>
        <p className="a-lede">A map like this can send people to the wrong place if it is trusted too far. These are its known limits.</p>
        <div className="a-panel"><Limitations /></div>
      </section>

      <section className="a-section" aria-labelledby="about-ideas">
        <h2 id="about-ideas">Future ideas, not built</h2>
        <div className="a-panel"><FutureIdeas /></div>
      </section>

      <section className="a-section" aria-labelledby="about-team">
        <h2 id="about-team">The team</h2>
        <div className="a-panel">
          <ul className="a-team">{TEAM.map((n) => <li key={n}>{n}</li>)}</ul>
          <p className="ws-note">{COURSE}.</p>
          <p className="ws-note">The building map's workspace began as Aryan Sami's prototype.</p>
        </div>
      </section>

      <section className="a-section" aria-labelledby="about-credits">
        <h2 id="about-credits">Built on</h2>
        <div className="a-panel">
          <dl className="ideas">
            {CREDITS.map(([name, what]) => <div key={name}><dt>{name}</dt><dd>{what}</dd></div>)}
          </dl>
        </div>
      </section>
    </>
  );
}
