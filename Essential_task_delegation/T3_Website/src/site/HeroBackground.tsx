// Contour lines of a landscape, drifting slowly behind the top of every page: the language of
// maps, which is our subject. It is atmosphere, not information, so it is kept quiet: thin
// blue-grey lines, little glow, and it fades out before the content further down. It answers the
// pointer gently: the ground swells a little under it and the view leans a few degrees towards it.
// Clicks do nothing. No fog, so the far lines reach the top edge instead of leaving an empty band
// under the header. It is skipped on narrow screens (to spare phones), and it stops by itself for
// visitors who ask for reduced motion and whenever it scrolls out of view.
import { lazy, Suspense } from 'react';

const Topography = lazy(() => import('../vendor/react-bits/Topography.tsx'));

/** `quiet` dims it on pages whose title sits straight on the background instead of on a card. */
export function HeroBackground({ quiet }: { quiet?: boolean }) {
  if (!window.matchMedia('(min-width: 760px)').matches) return null;
  return (
    <div className={`hero-bg${quiet ? ' is-quiet' : ''}`} aria-hidden="true">
      <Suspense fallback={null}>
        <Topography color="#7f93b8" lineCount={18} lineWidth={1} speed={0.12} glow={0.15} brightness={0.8} fog={0}
          mouseInteraction hoverEffect="lift" mouseStrength={0.3} mouseRadius={1.2} trail={0.15} parallax={0.2} clickEffect="none" dpr={1} />
      </Suspense>
    </div>
  );
}
