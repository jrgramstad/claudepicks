/**
 * NBA Pick'em System - Main App
 * Mode 1: Edge Calculator
 * Mode 2: Results Tracker
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import EdgeCalculator from './components/mode1/EdgeCalculator';
import ResultsTracker from './components/mode2/ResultsTracker';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏀</div>
            <div className="text-xl font-bold text-gray-800">NBA Pick'em System</div>
          </div>
          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚡ Calculate Edges
            </Link>
            <Link
              to="/results"
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                location.pathname === '/results'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Track Results
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<EdgeCalculator />} />
          <Route path="/results" element={<ResultsTracker />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
