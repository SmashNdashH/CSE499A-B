// Phase 1: three directions for the site's look, each a working page on the same data and the
// same components. One will be chosen; the other two are then removed.
import { lazy, Suspense } from 'react';
import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router-dom';
import './review.css';

const DirectionA = lazy(() => import('./directions/DirectionA.tsx'));
const DirectionB = lazy(() => import('./directions/DirectionB.tsx'));
const DirectionC = lazy(() => import('./directions/DirectionC.tsx'));

const DIRECTIONS = [
  { path: '/a', name: 'Aftermap', what: 'Aryan\'s dark workspace, made sober and given our damage colours. The photo pair fills the first screen and the text floats over it.' },
  { path: '/b', name: 'Second Pass', what: 'The Signal style of the review deck: deep navy and bone, one muted gold accent, serif headlines, monospace details, hairline rules.' },
  { path: '/c', name: 'Footprint', what: 'The page as a survey sheet: the building map comes first, with the title block, legend and notes in its margin. Light, one ink, one type family.' },
];

function ReviewBar() {
  return (
    <nav className="review-bar" aria-label="Directions under review">
      <Link to="/">Three directions</Link>
      {DIRECTIONS.map((d, i) => <NavLink key={d.path} to={d.path}>{'ABC'[i]}: {d.name}</NavLink>)}
    </nav>
  );
}

function Chooser() {
  return (
    <main className="review-page">
      <h1>Three directions for the showcase site</h1>
      <p>Each is a working page with a hero, a results section and the clickable building map, on the same data. Pick one; its name is a proposal too.</p>
      <ol>
        {DIRECTIONS.map((d, i) => (
          <li key={d.path}><Link to={d.path}>{'ABC'[i]}. {d.name}</Link><span>{d.what}</span></li>
        ))}
      </ol>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ReviewBar />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Chooser />} />
          <Route path="/a" element={<DirectionA />} />
          <Route path="/b" element={<DirectionB />} />
          <Route path="/c" element={<DirectionC />} />
          <Route path="*" element={<Chooser />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
