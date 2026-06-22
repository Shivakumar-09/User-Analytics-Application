import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import SessionsExplorer from './pages/SessionsExplorer';
import SessionJourney from './pages/SessionJourney';
import HeatmapView from './pages/HeatmapView';
import FunnelsView from './pages/FunnelsView';
import ArchitectureView from './pages/ArchitectureView';
import AboutLanding from './pages/AboutLanding';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="sessions" element={<SessionsExplorer />} />
          <Route path="sessions/:sessionId" element={<SessionJourney />} />
          <Route path="heatmap" element={<HeatmapView />} />
          <Route path="funnels" element={<FunnelsView />} />
          <Route path="architecture" element={<ArchitectureView />} />
          <Route path="about" element={<AboutLanding />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
