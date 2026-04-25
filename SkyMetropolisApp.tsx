import React from 'react';

const SkyMetropolisApp: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center">
      <iframe 
        src="https://sky-metropolis-delta.vercel.app" 
        className="w-full h-full border-none shadow-2xl"
        title="Sky Metropolis"
        allow="autoplay; fullscreen; pointer-lock"
      />
      {/* Back button for internal navigation fallback if the hub overlay fails */}
      <button 
        onClick={() => window.parent.postMessage('close-game', '*')}
        className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all z-50 group"
        title="Return to Hub"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left group-hover:-translate-x-1 transition-transform"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
    </div>
  );
};

export default SkyMetropolisApp;
