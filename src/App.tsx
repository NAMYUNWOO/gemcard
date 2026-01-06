/**
 * Arcane Gems - Main Application
 *
 * Single-gem system: User can only own one gem at a time.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Gacha } from './pages/Gacha';
import { GemDetail } from './pages/GemDetail';
import { SharedGem } from './pages/SharedGem';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/summon" element={<Gacha />} />
        <Route path="/gem/:id" element={<GemDetail />} />
        <Route path="/share/:data" element={<SharedGem />} />

        {/* Legacy Routes - Redirect to new structure */}
        <Route path="/gacha" element={<Navigate to="/summon" replace />} />
        <Route path="/collection" element={<Navigate to="/" replace />} />
        <Route path="/create" element={<Navigate to="/summon" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
