// Results: the benchmark panel as charts, each with its table one click away. Each number links
// to its source and names the images it was measured on.
import { DamageMapChart, OtherParts, SixTasksChart } from '../components/ResultsTables.tsx';

export default function Results() {
  return (
    <section className="a-section a-page" aria-labelledby="results-h1">
      <h1 id="results-h1">What we measured</h1>
      <p className="a-lede">Each part of the system was tested on its own, with its own model and images. The parts don't run as one chain yet, so these numbers must not be read as one system's score.</p>
      <div className="a-panel"><DamageMapChart /></div>
      <div className="a-panel"><SixTasksChart /></div>
      <div className="a-panel"><OtherParts /></div>
    </section>
  );
}
