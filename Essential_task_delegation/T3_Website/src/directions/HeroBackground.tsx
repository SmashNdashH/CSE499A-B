// Contour lines of a landscape, drifting slowly from the top of the page down behind the opening
// section: the language of maps, which is our subject. It is atmosphere, not information, so it is
// kept quiet: thin blue-grey lines, little glow, no reaction to the pointer or to clicks, and it
// fades out before the content below. No fog, so the far lines reach the top edge instead of
// leaving an empty band under the header. It is skipped on narrow screens (to spare phones), and
// it stops by itself for visitors who ask for reduced motion and whenever it scrolls out of view.
import { lazy, Suspense } from 'react';

const Topography = lazy(() => import('../vendor/react-bits/Topography.tsx'));

export function HeroBackground() {
  if (!window.matchMedia('(min-width: 760px)').matches) return null;
  return (
    <div className="hero-bg" aria-hidden="true">
      <Suspense fallback={null}>
        <Topography color="#7f93b8" lineCount={18} lineWidth={1} speed={0.12} glow={0.15} brightness={0.8} fog={0}
          mouseInteraction={false} clickEffect="none" parallax={0} dpr={1} />
      </Suspense>
    </div>
  );
}
