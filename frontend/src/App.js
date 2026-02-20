import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '@/App.css';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { SimulationPage } from './pages/SimulationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/app" element={<SimulationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
