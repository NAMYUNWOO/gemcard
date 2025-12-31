import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Create } from './pages/Create';
import { Card } from './pages/Card';
import { Receive } from './pages/Receive';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
        <Route path="/card/:id" element={<Card />} />
        <Route path="/receive/:data" element={<Receive />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
