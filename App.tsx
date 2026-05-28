import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import RunnerApp from './runner/RunnerApp';
import SkyMetropolisApp from './SkyMetropolisApp';
import Hub from './Hub';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#0c0c0c', color: '#ff4444', padding: '20px', fontFamily: 'monospace', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Application Error</h2>
          <pre style={{ background: '#111', padding: '15px', borderRadius: '4px', maxWidth: '80%', overflow: 'auto' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ marginTop: '20px', padding: '8px 16px', background: '#333', color: 'white', border: '1px solid #444', borderRadius: '4px', cursor: 'pointer' }}>
            Clear Storage & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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

// High-performance iframe wrapper for local folder games
const LocalGame = ({ src, name }: { src: string; name: string }) => (
  <div className="w-screen h-screen bg-[#070707] relative overflow-hidden">
    <button 
      onClick={() => window.parent.postMessage('close-game', '*')}
      className="fixed top-4 right-4 p-2 bg-black/60 hover:bg-neutral-800 rounded-full border border-white/10 text-white transition-all duration-200 z-[9999] flex items-center justify-center"
      title="Close Game"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    <iframe 
      src={src} 
      className="w-full h-full border-none"
      title={name}
      allow="gamepad; fullscreen"
    />
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/runner" element={<RunnerApp />} />
          <Route path="/sky-metropolis" element={<SkyMetropolisApp />} />
          <Route path="/android-jetpack" element={<PlaceholderGame name="Android Jetpack" />} />
          <Route path="/hole-in-one" element={<PlaceholderGame name="Hole in One" />} />
          <Route path="/snake" element={<PlaceholderGame name="Snake" />} />
          <Route path="/2048" element={<LocalGame src="/2048/index.html" name="2048" />} />
          <Route path="/battlefields" element={<LocalGame src="/battlefields/index.html" name="Battlefields" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
