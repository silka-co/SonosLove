import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { NowPlayingPage } from './pages/NowPlayingPage';
import { SpeakersPage } from './pages/SpeakersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<NowPlayingPage />} />
          <Route path="/speakers" element={<SpeakersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
