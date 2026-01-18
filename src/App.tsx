/**
 * Arcane Gems - Main Application
 *
 * Multi-slot gem system with Home page containing summon modal.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { GemDetail } from './pages/GemDetail';
import { SharedGem } from './pages/SharedGem';
import './App.css';

/**
 * Check if there's a shared gem in query params
 * Toss deep links don't preserve path, so gem data comes as ?gem=xxx
 */
function getSharedGemData(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get('gem');
}

function App() {
  // Check for shared gem data in query params (from Toss deep link)
  const sharedGemData = getSharedGemData();

  return (
    // BrowserRouter 사용 - apps-in-toss 딥링크 호환성
    <BrowserRouter>
      <Routes>
        {/* Shared gem via query param takes priority */}
        {sharedGemData && (
          <Route path="/" element={<SharedGem gemData={sharedGemData} />} />
        )}

        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/gem/:id" element={<GemDetail />} />
        <Route path="/share/:data" element={<SharedGem />} />

        {/* Legacy Routes - Redirect to Home */}
        <Route path="/summon" element={<Navigate to="/" replace />} />
        <Route path="/gacha" element={<Navigate to="/" replace />} />
        <Route path="/collection" element={<Navigate to="/" replace />} />
        <Route path="/create" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
