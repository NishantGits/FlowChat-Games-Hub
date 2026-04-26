import React, { useState, useEffect } from 'react';
import { Play, X, Gamepad2, Trophy, Clock, Star, Sun, Moon, Monitor, Lock } from 'lucide-react';
import { images } from './gameImages';

type Theme = 'light' | 'dark' | 'system';

interface Game {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  thumbnail: string;
  isComingSoon?: boolean;
}

const GAMES: Game[] = [
  {
    id: 'sky-metropolis',
    name: 'Sky Metropolis',
    description: 'Build your city, manage citizens, and expand your skyline.',
    path: '#/sky-metropolis',
    icon: <Monitor className="w-5 h-5 text-white" />,
    thumbnail: images.skymetropolis
  },
  {
    id: 'runner',
    name: 'Runner',
    description: 'Endless runner, dodge obstacles',
    path: '#/runner',
    icon: <Trophy className="w-5 h-5 text-white" />,
    thumbnail: images.runner
  },
  {
    id: 'tetris',
    name: 'Tetris',
    description: 'Classic block stacking',
    path: '#/tetris',
    icon: <Gamepad2 className="w-5 h-5 text-white" />,
    thumbnail: images.tetris
  },
  {
    id: 'bubble',
    name: 'Bubble Shooter',
    description: 'Pop matching bubbles',
    path: '#/bubble',
    icon: <Star className="w-5 h-5 text-white" />,
    thumbnail: images.bubble
  },
  {
    id: 'snake',
    name: 'Snake',
    description: 'Classic snake game',
    path: '#/snake',
    icon: <Clock className="w-5 h-5 text-white" />,
    thumbnail: '',
    isComingSoon: true
  },
  {
    id: '2048',
    name: '2048',
    description: 'Merge tiles to reach 2048',
    path: '#/2048',
    icon: <Gamepad2 className="w-5 h-5 text-white" />,
    thumbnail: '',
    isComingSoon: true
  }
];

const ScreenshotGenerator = ({ games, screenshots }: { games: Game[], screenshots: Record<string, string> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const gamesToCapture = games.filter(g => !screenshots[g.id]);

  useEffect(() => {
    if (currentIndex < gamesToCapture.length) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gamesToCapture.length]);

  if (currentIndex >= gamesToCapture.length) return null;

  return (
    <div className="fixed -left-[4000px] -top-[4000px] w-[1024px] h-[768px] opacity-0 pointer-events-none overflow-hidden invisible">
      <iframe 
        key={gamesToCapture[currentIndex].id} 
        src={gamesToCapture[currentIndex].path} 
        className="w-full h-full border-none"
      />
    </div>
  );
};

const Hub = () => {
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [screenshots, setScreenshots] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    GAMES.forEach(g => {
      const saved = localStorage.getItem(`screenshot_${g.id}`);
      if (saved) s[g.id] = saved;
    });
    return s;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (systemTheme === 'light') root.classList.add('light');
      } else if (t === 'light') {
        root.classList.add('light');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'close-game') {
        setActiveGame(null);
      }
      if (event.data?.type === 'save-screenshot') {
        localStorage.setItem(`screenshot_${event.data.gameId}`, event.data.dataUrl);
        setScreenshots(prev => ({ ...prev, [event.data.gameId]: event.data.dataUrl }));
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveGame(null);
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const getThumbnail = (game: Game) => {
    return screenshots[game.id] || game.thumbnail;
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg)] text-[var(--text)] font-sans selection:bg-white/10 flex flex-col transition-colors duration-300 overflow-hidden">
      {/* Hidden Screenshot Generator */}
      <ScreenshotGenerator games={GAMES} screenshots={screenshots} />

      {/* Top Bar */}
      <header className="h-14 shrink-0 bg-[var(--header)] backdrop-blur-md border-b border-[var(--border)] flex items-center justify-between px-6 z-40 transition-colors duration-300">
        <div className="flex items-center space-x-3">
          <img src="https://flowchats.org/static/favicon.svg" alt="FlowChat Logo" className="w-7 h-7" />
          <h1 className="text-base font-bold tracking-tight">FlowChat Games</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Switcher */}
          <div className="flex items-center bg-[var(--bg)] border border-[var(--border)] rounded-full p-1">
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-[var(--text)] text-[var(--bg)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
              title="System Theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider hidden sm:block">
             v1.0.5-beta
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <main className="py-12 px-6 max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Game Library</h2>
            <p className="text-[var(--muted)] text-sm">Select a title to start playing instantly within FlowChat.</p>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => (
              <div 
                key={game.id}
                className="group relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--muted)] hover:scale-[1.02] transition-all duration-300 shadow-sm flex flex-col"
              >
                {/* Thumbnail Area - Real Screenshot Mockup */}
                <div className={`aspect-[16/10] relative overflow-hidden border-b border-[var(--border)] bg-zinc-900 ${game.isComingSoon ? 'grayscale' : ''}`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>
                  
                  {game.isComingSoon ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-black/40 backdrop-blur-sm z-20">
                      <Lock className="w-8 h-8 text-white/50" />
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">Coming Soon</span>
                    </div>
                  ) : (
                    <img 
                      src={getThumbnail(game)}
                      alt={game.name} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2">
                     <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg border border-white/20 text-white">
                        {game.icon}
                     </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{game.name}</h3>
                  </div>
                  <p className="text-[var(--muted)] text-xs leading-relaxed mb-6 h-8 line-clamp-2">
                    {game.description}
                  </p>
                  
                  {game.isComingSoon ? (
                    <div className="w-full mt-auto py-2.5 bg-[var(--border)] text-[var(--muted)] text-xs font-bold rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5" />
                      <span>COMING SOON</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveGame(game)}
                      className="w-full mt-auto py-2.5 bg-[var(--text)] text-[var(--bg)] text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY NOW</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        
          {/* Footer */}
          <footer className="py-12 mt-12 border-t border-[var(--border)] text-center">
             <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.2em]">FlowChat Gaming Protocol © 2026</p>
          </footer>
        </main>
      </div>

      {/* Game Overlay */}
      {activeGame && (
        <div className="fixed inset-0 bg-black z-[9999] animate-in fade-in duration-300">
          <button 
            onClick={() => setActiveGame(null)}
            className="fixed top-4 right-4 z-[10000] p-2 bg-black/50 hover:bg-white/10 rounded-full border border-white/10 text-white transition-all group"
          >
            <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <iframe 
            src={activeGame.path} 
            className="w-full h-full border-none"
            title={activeGame.name}
          />
        </div>
      )}
    </div>
  );
};

export default Hub;
