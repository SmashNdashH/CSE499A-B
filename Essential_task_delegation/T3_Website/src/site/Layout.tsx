// The frame every page shares: the header with the seven pages, and the footer with the
// decision-support line, the team and the credits.
import { Suspense, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import './site.css';
import { damageVars } from '../core/palette.ts';
import { HeroBackground } from './HeroBackground.tsx';
import { COURSE, DECISION_LINE, SITE_NAME, TEAM } from './shared.tsx';

const PAGES = [
  ['/how', 'How it works'],
  ['/explore', 'Explore'],
  ['/try', 'Try it'],
  ['/results', 'Results'],
  ['/reports', 'Reports'],
  ['/about', 'About'],
] as const;

export function Layout() {
  const { pathname } = useLocation();
  // A new page starts at its top, and keyboard and screen-reader users land on its content.
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="dir dir-a" style={damageVars('dark')}>
      <HeroBackground quiet={pathname !== '/'} />
      <a className="skip" href="#main">Skip to the content</a>
      <header className="a-bar">
        <NavLink className="a-name" to="/" end>{SITE_NAME}</NavLink>
        <nav aria-label="Pages">
          {PAGES.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
      </header>
      <main id="main">
        <Suspense fallback={<p className="a-section ws-note ws-loading">Loading the page.</p>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="team-footer">
        <p className="decision">{DECISION_LINE}</p>
        <p>{TEAM.join(', ')}</p>
        <p>{COURSE}</p>
        <p className="credits">Built on DisasterM3, xBD, Qwen2.5-VL, SAM 3, DisasTeller and ONNX Runtime Web. The building map's workspace began as Aryan Sami's prototype.</p>
      </footer>
    </div>
  );
}
