import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Home from './pages/Home';
import AddLoan from './pages/AddLoan';
import LoanDetail from './pages/LoanDetail';
import Onboarding from './pages/Onboarding';
import { getAllLoans } from './lib/db';
import './App.css';

function App() {
  const [initialCheck, setInitialCheck] = useState<'loading' | 'onboarding' | 'home'>('loading');

  useEffect(() => {
    const checkInitialState = async () => {
      try {
        const loans = await getAllLoans();
        setInitialCheck(loans.length === 0 ? 'onboarding' : 'home');
      } catch {
        setInitialCheck('home');
      }
    };
    checkInitialState();
  }, []);

  if (initialCheck === 'loading') {
    return <div style={{ minHeight: '100vh', background: '#fff' }} />;
  }

  if (initialCheck === 'onboarding') {
    return <Onboarding onComplete={() => setInitialCheck('home')} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddLoan />} />
        <Route path="/loan/:id" element={<LoanDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
