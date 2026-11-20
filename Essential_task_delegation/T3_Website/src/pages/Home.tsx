// Home: what the system does, in one screen. A real pair under a slider with the model's damage
// map on top, one sentence, the decision-support line, and the way on to the rest.
import { Link } from 'react-router-dom';
import { DECISION_LINE, HeroPair, Legend, SENTENCE } from '../site/shared.tsx';

const NEXT = [
  ['/how', 'See how it works', 'Scroll through the seven steps on one real pair of photos.'],
  ['/explore', 'Click a building', 'Every outline on the map is one row of a table, with its class, size and distances.'],
  ['/try', 'Run it on your own photos', 'The before-and-after model, in 8 bits, runs inside your browser. Your photos never leave your device.'],
  ['/results', 'Check the numbers', 'Each number links to the results file it comes from.'],
] as const;

export default function Home() {
  return (
    <>
      <div className="a-heroband">
        <section className="a-hero" aria-labelledby="home-h1">
          <div className="a-card">
            <h1 id="home-h1">See what a disaster did, building by building.</h1>
            <p>{SENTENCE}</p>
            <p className="decision">{DECISION_LINE}</p>
            <div className="a-actions">
              <Link className="a-btn" to="/explore">Open the building map</Link>
              <Link className="a-btn a-btn-quiet" to="/how">See how it works</Link>
            </div>
            <div className="a-legend"><Legend /></div>
          </div>
          <HeroPair palette="dark" />
        </section>
      </div>

      <section className="a-section" aria-labelledby="home-next">
        <h2 id="home-next">Where to go from here</h2>
        <ul className="a-next">
          {NEXT.map(([to, title, text]) => (
            <li key={to}><Link to={to}>{title}</Link><span>{text}</span></li>
          ))}
        </ul>
      </section>
    </>
  );
}
