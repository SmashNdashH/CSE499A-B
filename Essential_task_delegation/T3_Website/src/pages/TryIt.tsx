// Try it: the 8-bit before-and-after model, run on the visitor's own photos inside their browser.
import { TryItRunner } from '../components/TryItRunner.tsx';

export default function TryIt() {
  return (
    <section className="a-section a-page" aria-labelledby="try-h1">
      <h1 id="try-h1">Run the model on your own photos</h1>
      <p className="a-lede">Choose two satellite photos of the same place, one taken before a disaster and one after. The model runs inside your browser, so the photos never leave your device.</p>
      <TryItRunner />
    </section>
  );
}
