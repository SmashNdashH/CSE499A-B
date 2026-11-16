// The site's seven pages, inside one shared layout. The heavier pages load when first opened.
import { lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './site/Layout.tsx';
import Home from './pages/Home.tsx';

const HowItWorks = lazy(() => import('./pages/HowItWorks.tsx'));
const Explore = lazy(() => import('./pages/Explore.tsx'));
const TryIt = lazy(() => import('./pages/TryIt.tsx'));
const Results = lazy(() => import('./pages/Results.tsx'));
const Reports = lazy(() => import('./pages/Reports.tsx'));
const About = lazy(() => import('./pages/About.tsx'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/how" element={<HowItWorks />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/try" element={<TryIt />} />
          <Route path="/results" element={<Results />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
