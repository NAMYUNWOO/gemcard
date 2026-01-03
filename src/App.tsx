/**
 * Arcane Gems - Main Application
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Collection } from './pages/Collection';
import { Gacha } from './pages/Gacha';
import { GemDetail } from './pages/GemDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Collection />} />
        <Route path="/gacha" element={<Gacha />} />
        <Route path="/gem/:id" element={<GemDetail />} />
        {/* Legacy routes - redirect to new structure */}
        <Route path="/create" element={<Gacha />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
