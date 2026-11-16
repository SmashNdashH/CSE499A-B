// Try it: the lighter field model, run on the visitor's own image inside their browser.
import { TryItRunner } from '../components/TryItRunner.tsx';

export default function TryIt() {
  return (
    <section className="a-section a-page" aria-labelledby="try-h1">
      <h1 id="try-h1">Run the field model on your own image</h1>
      <p className="a-lede">Choose a satellite photo taken after a disaster. The model runs inside your browser, so the image never leaves your device.</p>
      <TryItRunner />
    </section>
  );
}
