// Explore: the interactive proof. Every building of a pair, drawn from its outline, with its facts.
import { Workspace } from '../components/Workspace.tsx';

export default function Explore() {
  return (
    <section className="a-section a-page" aria-labelledby="explore-h1">
      <h1 id="explore-h1">Click a building</h1>
      <p className="a-lede">Every outline is one row of the building table. Click one for its facts, press a count to light up its buildings, or ask one of the fixed questions.</p>
      <h2 className="sr-only">The building map</h2>
      <Workspace palette="dark" />
    </section>
  );
}
