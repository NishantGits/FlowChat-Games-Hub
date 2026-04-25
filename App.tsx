import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import RunnerApp from './runner/RunnerApp';
import TetrisApp from './tetris/TetrisApp';
import BubbleShooterApp from './bubble/BubbleShooterApp';
import Hub from './Hub';

// Placeholder for other games to avoid 404 in iframes
const PlaceholderGame = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f0f] text-[#f5f5f5] font-sans">
    <h1 className="text-4xl font-bold mb-4">{name}</h1>
    <p className="text-[#a0a0a0]">Game coming soon...</p>
    <button 
      onClick={() => window.parent.postMessage('close-game', '*')}
      className="mt-8 px-6 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded hover:border-white/20 transition-colors"
    >
      Return to Hub
    </button>
  </div>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hub />} />
        <Route path="/runner" element={<RunnerApp />} />
        <Route path="/tetris" element={<TetrisApp />} />
        <Route path="/bubble" element={<BubbleShooterApp />} />
        <Route path="/snake" element={<PlaceholderGame name="Snake" />} />
        <Route path="/2048" element={<PlaceholderGame name="2048" />} />
      </Routes>
    </Router>
  );
};

export default App;
