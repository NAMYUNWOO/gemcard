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

function App() {
  return (
    // BrowserRouter 사용 - apps-in-toss 딥링크 호환성
    <BrowserRouter>
      <Routes>
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
