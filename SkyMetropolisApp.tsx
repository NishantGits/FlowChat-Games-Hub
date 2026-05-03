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
    </div>
  );
};

export default SkyMetropolisApp;
