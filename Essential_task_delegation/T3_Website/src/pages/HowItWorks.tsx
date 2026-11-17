// How it works: the chain, told by scrolling. Each step names what does it and shows its own number.
import { ChainStory } from '../components/ChainStory.tsx';

export default function HowItWorks() {
  return (
    <section className="a-section a-page" aria-labelledby="how-h1">
      <h1 id="how-h1">How it works</h1>
      <p className="a-lede">Scroll down. The same pair of photos stays in view and changes at each step, so you see what every part of the system adds. Each part was tested on its own; they don't run as one chain yet.</p>
      <h2 className="sr-only">The seven steps</h2>
      <ChainStory palette="dark" />
    </section>
  );
}
