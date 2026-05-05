import React, { useState, useEffect } from 'react';
import { Play, X, Gamepad2, Gamepad, Trophy, Clock, Star, Sun, Moon, Monitor, Lock, Info, Rocket, Flag } from 'lucide-react';
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
  scoreKey?: string;
}

const GAMES: Game[] = [
  {
    id: 'sky-metropolis',
    name: 'Sky Metropolis',
    description: 'Build your city, manage citizens, and expand your skyline.',
    path: '#/sky-metropolis',
    icon: <Monitor className="w-5 h-5 text-white" />,
    thumbnail: images.skymetropolis,
    scoreKey: 'sky_metropolis_highscore'
  },
  {
    id: 'runner',
    name: 'Runner',
    description: 'Endless runner, dodge obstacles',
    path: '#/runner',
    icon: <Trophy className="w-5 h-5 text-white" />,
    thumbnail: images.runner,
    scoreKey: 'runner_highscore'
  },
  {
    id: 'stretchy-cat',
    name: 'Stretchy Cat',
    description: 'Your cat has to fill all boxes and reach finish.',
    path: 'https://strechy-cat.vercel.app',
    icon: <Gamepad className="w-5 h-5 text-white" />,
    thumbnail: images.stretchycat,
    scoreKey: 'stretchycat_highscore'
  },
  {
    id: 'android-jetpack',
    name: 'Android Jetpack',
    description: 'Master the skies with your high-tech jetpack.',
    path: 'https://android-jetpack.vercel.app',
    icon: <Rocket className="w-5 h-5 text-white" />,
    thumbnail: images.androidjetpack,
    scoreKey: 'android_jetpack_highscore'
  },
  {
    id: 'hole-in-one',
    name: 'Hole in One',
    description: 'Precision golf. Aim, power, and shoot for the perfect score.',
    path: 'https://hole-in-one-two.vercel.app/',
    icon: <Flag className="w-5 h-5 text-white" />,
    thumbnail: images.holeinone,
    scoreKey: 'hole_in_one_highscore'
  }
];

const ScreenshotGenerator = ({ games, screenshots }: { games: Game[], screenshots: Record<string, string> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Only capture if we have NO screenshot AND NO baked-in thumbnail
  const gamesToCapture = games.filter(g => !screenshots[g.id] && !g.thumbnail);

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
      const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.add(isDark ? 'dark' : 'light');
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };

    applyTheme(theme);
    localStorage.setItem('game-hub-theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
    return screenshots[game.id] || game.thumbnail || null;
  };

  return (
    <div 
      className="fixed inset-0 bg-background text-foreground font-sans flex flex-col overflow-hidden transition-colors duration-300"
    >
      {/* Hidden Screenshot Generator */}
      <ScreenshotGenerator games={GAMES} screenshots={screenshots} />

      {/* Top Bar */}
      <header className="h-14 shrink-0 bg-header-bg backdrop-blur-md border-b border-header-border flex items-center justify-between px-6 z-40 transition-colors duration-300 text-header-text">
        <div className="flex items-center space-x-3">
          <img src="https://flowchats.org/static/favicon.svg" alt="FlowChat Logo" className="w-7 h-7" />
          <h1 className="text-base font-bold tracking-tight">FlowChat Games</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Switcher */}
          <div className="flex items-center bg-card/80 dark:bg-black/40 border border-header-border rounded-full p-1">
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-foreground text-background shadow-sm' : 'text-muted hover:text-foreground'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-foreground text-background shadow-sm' : 'text-muted hover:text-foreground'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-foreground text-background shadow-sm' : 'text-muted hover:text-foreground'}`}
              title="System Theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* <div className="text-[10px] font-mono text-[#666] uppercase tracking-wider hidden sm:block">
             v1.0.5-beta
          </div> */}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <main className="py-12 px-6 max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Game Library</h2>
            <p className="text-muted text-sm">Select a title to start playing instantly within FlowChat.</p>
          </div>

          {/* Game Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => {
              const thumb = getThumbnail(game);
              const highScore = game.scoreKey ? localStorage.getItem(game.scoreKey) || '0' : null;
              
              return (
                  <div 
                    key={game.id}
                    className="group relative bg-card/50 border border-border rounded-xl overflow-hidden hover:border-foreground/40 hover:scale-[1.02] transition-all duration-300 shadow-sm flex flex-col"
                  >
                  {/* Thumbnail Area - Real Screenshot Mockup */}
                  <div className={`aspect-[16/10] relative overflow-hidden border-b border-border bg-black ${game.isComingSoon ? 'grayscale' : ''}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 opacity-70 group-hover:opacity-50 transition-opacity"></div>
                    
                    {game.isComingSoon ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-black/40 backdrop-blur-sm z-20">
                        <Lock className="w-8 h-8 text-white/50" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">Coming Soon</span>
                      </div>
                    ) : thumb ? (
                      <img 
                        src={thumb}
                        alt={game.name} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-zinc-800 z-20">
                        <div className="opacity-20 transform scale-150">{game.icon}</div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30">Loading Preview...</span>
                      </div>
                    )}

                    <div className="absolute bottom-3 left-3 z-20 flex items-center space-x-2">
                       <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20 text-white">
                          {game.icon}
                       </div>
                    </div>

                    {highScore && highScore !== '0' && (
                      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 bg-black/60 dark:bg-black/60 light:bg-white/80 backdrop-blur-md border border-white/10 light:border-zinc-200 px-2.5 py-1 rounded-full text-foreground/90">
                        <Trophy className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] font-mono font-bold tracking-tighter">{highScore}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col relative text-foreground">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-lg tracking-tight">{game.name}</h3>
                      <div className="group/info relative">
                        <Info className="w-4 h-4 text-muted hover:text-foreground transition-colors cursor-pointer" />
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all z-50 text-[10px] leading-relaxed">
                          <div className="text-foreground/60 mb-2">{game.description}</div>
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="uppercase tracking-wider text-foreground/30 font-bold">High Score</span>
                            <span className="text-yellow-400 font-mono font-bold">{highScore || '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-muted text-xs leading-relaxed mb-6 h-8 line-clamp-2">
                      {game.description}
                    </p>
                    
                    {game.isComingSoon ? (
                        <div className="w-full mt-auto py-2.5 bg-border/40 text-muted text-xs font-bold rounded-lg flex items-center justify-center space-x-2 cursor-not-allowed">
                        <Lock className="w-3.5 h-3.5" />
                        <span>COMING SOON</span>
                      </div>
                    ) : (
                        <button 
                          onClick={() => setActiveGame(game)}
                          className="w-full mt-auto py-2.5 bg-foreground text-background text-xs font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
                        >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>PLAY NOW</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        
          {/* Footer */}
          <footer className="py-12 mt-12 border-t border-border text-center">
             <p className="text-[10px] text-muted uppercase tracking-[0.2em]">FlowChat Gaming Protocol © 2026</p>
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
