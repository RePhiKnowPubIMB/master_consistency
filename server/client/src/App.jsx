import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router basename="/master_consistency">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;