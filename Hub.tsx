import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, X, Gamepad2, Gamepad, Trophy, Clock, Star, Sun, Moon, Monitor, 
  Lock, Info, Rocket, Flag, Swords, Grid, Search, Flame, Sparkles, 
  ThumbsUp, ThumbsDown, Expand, Shrink, ArrowRight, Activity, HelpCircle
} from 'lucide-react';
import { images } from './gameImages'; 

type Theme = 'light' | 'dark' | 'system';

interface Game {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  thumbnail: string;
  categories: string[];
  isComingSoon?: boolean;
  scoreKey?: string;
  controls: { action: string; key: string }[];
}

const GAMES: Game[] = [
  {
    id: 'sky-metropolis',
    name: 'Sky Metropolis',
    description: 'Build your neon-lit city, manage active citizens, and expand your skyline.',
    path: '#/sky-metropolis',
    icon: <Monitor className="w-5 h-5 text-sky-400" />,
    thumbnail: images.skymetropolis,
    categories: ['Simulation', 'Strategy', 'Casual'],
    scoreKey: 'sky_metropolis_highscore',
    controls: [
      { action: 'Build Roads & Zones', key: 'Left Click' },
      { action: 'Inspect Infrastructure', key: 'Hover Zone' },
      { action: 'Pan Metropolis View', key: 'Drag / Arrow Keys' },
      { action: 'Zoom In / Out', key: 'Scroll Wheel' }
    ]
  },
  {
    id: 'runner',
    name: 'Neon Runner',
    description: 'An endless futuristic dash across high-speed laser barriers and obstacle fields.',
    path: '#/runner',
    icon: <Activity className="w-5 h-5 text-amber-500" />,
    thumbnail: images.runner,
    categories: ['Arcade', 'Action', 'Speed'],
    scoreKey: 'runner_highscore',
    controls: [
      { action: 'Jump / Leap Up', key: 'Spacebar / Up Arrow' },
      { action: 'Slower Descent', key: 'Hold Space' },
      { action: 'Instant Restart', key: 'Enter Key' },
      { action: 'Pause Runner', key: 'ESC Key' }
    ]
  },
  {
    id: 'battlefields',
    name: 'Battlefields',
    description: 'Tactical combat simulation. Take command of your Spartan and survive waves of infantry.',
    path: '#/battlefields',
    icon: <Swords className="w-5 h-5 text-red-500" />,
    thumbnail: images.battlefields,
    categories: ['Action', 'Simulation', 'Combat'],
    scoreKey: 'battlefields_highscore',
    controls: [
      { action: 'Move / Shift Position', key: 'W / A / S / D' },
      { action: 'Sword Attack', key: 'J Key' },
      { action: 'Shield Block', key: 'K Key' },
      { action: 'Jump', key: 'Spacebar' },
      { action: 'Spartan Charge', key: 'K + J Key' },
      { action: 'Ground Pound Slam', key: 'Space + J' }
    ]
  },
  {
    id: 'game-2048',
    name: '2048',
    description: 'Slide custom numerical tiles and merge them to ultimately reach the mythical 2048 milestone.',
    path: '#/2048',
    icon: <Grid className="w-5 h-5 text-green-400" />,
    thumbnail: images.game2048,
    categories: ['Puzzle', 'Strategy'],
    scoreKey: '2048_highscore',
    controls: [
      { action: 'Slide Grid Tiles', key: 'Arrow Keys / WASD' },
      { action: 'Merge Duplicate Numbers', key: 'Auto Merge' },
      { action: 'Reset Grid Game', key: 'R Key' }
    ]
  },
  {
    id: 'stretchy-cat',
    name: 'Stretchy Cat',
    description: 'Extend and deform your super-stretchy cat to fill every puzzle box and reach the goal.',
    path: 'https://strechy-cat.vercel.app',
    icon: <Gamepad className="w-5 h-5 text-pink-400" />,
    thumbnail: images.stretchycat,
    categories: ['Puzzle', 'Arcade', 'Casual'],
    scoreKey: 'stretchycat_highscore',
    controls: [
      { action: 'Extend & Drag Cat', key: 'Click & Drag Mouse' },
      { action: 'Navigate obstacles', key: 'Planning Grid' },
      { action: 'Reset Level Map', key: 'Click Refresh Icon' }
    ]
  },
  {
    id: 'android-jetpack',
    name: 'Android Jetpack',
    description: 'Engage high-powered rocket thrusters to soar across dangerous lightning storm clouds.',
    path: 'https://android-jetpack.vercel.app',
    icon: <Rocket className="w-5 h-5 text-emerald-400" />,
    thumbnail: images.androidjetpack,
    categories: ['Arcade', 'Action'],
    scoreKey: 'android_jetpack_highscore',
    controls: [
      { action: 'Ignite Jetpack thrusters', key: 'Hold Left Click / Space' },
      { action: 'Drift & Glide Down', key: 'Release Input' },
      { action: 'Dodge Lightning Pillars', key: 'Careful Timing' }
    ]
  },
  {
    id: 'hole-in-one',
    name: 'Hole in One',
    description: 'Ultimate minimalist golf simulator with advanced speed physics and terrain modifiers.',
    path: 'https://hole-in-one-two.vercel.app/',
    icon: <Flag className="w-5 h-5 text-violet-400" />,
    thumbnail: images.holeinone,
    categories: ['Casual', 'Sports', 'Puzzle'],
    scoreKey: 'hole_in_one_highscore',
    controls: [
      { action: 'Pull Back & Aim Power', key: 'Mouse Click + Drag' },
      { action: 'Fine tune Angle trajectory', key: 'Cursor Coordinates' },
      { action: 'Release Ball Shot', key: 'Let Go of Click' }
    ]
  }
];

const ScreenshotGenerator = ({ games, screenshots }: { games: Game[], screenshots: Record<string, string> }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [gameLikes, setGameLikes] = useState<Record<string, { likes: number, userChoice: 'like' | 'dislike' | null }>>({});
  const [recentPlays, setRecentPlays] = useState<string[]>([]);
  const [fullIframeMode, setFullIframeMode] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidDialog, setShowAndroidDialog] = useState(false);
  const playRoomRef = useRef<HTMLDivElement>(null);

  const [screenshots, setScreenshots] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    GAMES.forEach(g => {
      const saved = localStorage.getItem(`screenshot_${g.id}`);
      if (saved) s[g.id] = saved;
    });
    return s;
  });

  // Dynamic GitHub Releases APK Direct Link Detector
  const getGitHubDownloadUrl = () => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    let owner = 'nlrayyanyo';
    let repo = 'flowchat-games'; // Default guess matching package name or generic fallback

    if (hostname.endsWith('.github.io')) {
      owner = hostname.replace('.github.io', '');
      const parts = pathname.split('/').filter(Boolean);
      repo = parts[0] || 'flowchat-games';
    }
    return `https://github.com/${owner}/${repo}/releases/latest/download/FlowChatGames.apk`;
  };

  // Listener for PWA custom native installer prompt
  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA installation outcome:', outcome);
      setDeferredPrompt(null);
    } else {
      setShowAndroidDialog(true);
    }
  };

  // Calculate distinct categories
  const categoriesList = ['All', 'Action', 'Puzzle', 'Arcade', 'Simulation', 'Strategy', 'Sports'];

  // Theme Management
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: Theme) => {
      root.classList.remove('light', 'dark');
      const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.add(isDark ? 'dark' : 'light');
      root.style.colorScheme = isDark ? 'dark' : 'light';
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Load Likes & Recents
  useEffect(() => {
    const loadedLikes: Record<string, any> = {};
    const loadedRecents = JSON.parse(localStorage.getItem('recent_plays') || '[]');
    setRecentPlays(loadedRecents);

    GAMES.forEach(g => {
      const saveState = localStorage.getItem(`ratings_${g.id}`);
      // Seed initial base values with high rating ratio for high energy lookup
      const baseLikes = Math.floor(1280 + (g.id.length * 423));
      if (saveState) {
        loadedLikes[g.id] = JSON.parse(saveState);
      } else {
        loadedLikes[g.id] = { likes: baseLikes, userChoice: null };
      }
    });
    setGameLikes(loadedLikes);
  }, []);

  // Set up Message Receivers
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

  // Handle high-energy game play trigger
  const handlePlayGame = (game: Game) => {
    setActiveGame(game);
    // Track play in recent history
    const updated = [game.id, ...recentPlays.filter(id => id !== game.id)].slice(0, 4);
    setRecentPlays(updated);
    localStorage.setItem('recent_plays', JSON.stringify(updated));
  };

  // Up/Down rating systems
  const handleRateGame = (gameId: string, type: 'like' | 'dislike') => {
    const record = gameLikes[gameId] || { likes: 500, userChoice: null };
    let newLikes = record.likes;
    let newChoice: 'like' | 'dislike' | null = type;

    if (record.userChoice === type) {
      // Toggle off
      newChoice = null;
      newLikes = type === 'like' ? newLikes - 1 : newLikes;
    } else {
      // If toggled opposite or raw toggling
      if (record.userChoice === 'like') newLikes -= 1;
      if (type === 'like') newLikes += 1;
    }

    const updated = { likes: newLikes, userChoice: newChoice };
    setGameLikes(prev => ({ ...prev, [gameId]: updated }));
    localStorage.setItem(`ratings_${gameId}`, JSON.stringify(updated));
  };

  const getThumbnail = (game: Game) => {
    return screenshots[game.id] || game.thumbnail || null;
  };

  // Filter games based on search & active filter sidebar
  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          game.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || game.categories.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Featured Game of the Day (Sky Metropolis or first item)
  const featuredGame = GAMES.find(g => g.id === 'sky-metropolis') || GAMES[0];

  // Request native fullscreen support inside PlayRoom iframe container
  const toggleFullscreen = () => {
    if (!playRoomRef.current) return;
    if (!document.fullscreenElement) {
      playRoomRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="fixed inset-0 bg-background text-foreground font-sans flex flex-col overflow-hidden scanlines">
      {/* Screenshot Utility */}
      <ScreenshotGenerator games={GAMES} screenshots={screenshots} />

      {/* CrazyGames Custom Top Navigation */}
      <header className="h-16 shrink-0 bg-[#0c101d] dark:bg-[#0c101d] light:bg-[#f3f4f6] border-b border-[#1f2937] dark:border-[#1f2937] light:border-neutral-300 flex items-center justify-between px-4 sm:px-6 z-40 transition-colors duration-300">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <img src="https://flowchats.org/static/favicon.svg" alt="FlowChat Logo" className="w-8 h-8 animate-pulse" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-black tracking-tight text-white dark:text-white light:text-zinc-900 uppercase">
                FlowChat
              </span>
              <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded uppercase font-sans animate-bounce">
                Games
              </span>
            </div>
            <span className="text-[9px] font-medium text-emerald-400 tracking-wider hidden sm:inline">
              ● 100% INSTANT FREE PLAY
            </span>
          </div>
        </div>

        {/* Functional Live Search Input (CrazyGames Header Search style) */}
        <div className="flex-1 max-w-sm mx-4 sm:mx-8 relative hidden md:block">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-purple-400" />
          </div>
          <input
            type="text"
            placeholder="Search thousands of instant plays... (2048, Runner, Battlefields)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1b233a] dark:bg-[#1b233a] light:bg-white text-sm text-foreground placeholder-zinc-400 pl-10 pr-4 py-2 rounded-full border border-purple-900/30 dark:border-purple-900/40 light:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 bg-neutral-700 hover:bg-neutral-600 rounded-full"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-4">
          {/* Quick Stats banner */}
          <div className="hidden lg:flex items-center space-x-1 px-3 py-1 bg-[#15803d]/20 border border-[#22c55e]/20 rounded-full">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest">
              No Signups Required
            </span>
          </div>

          {/* Android App Install Action Trigger */}
          <button 
            onClick={() => setShowAndroidDialog(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-[11px] rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            title="Download direct Android APK or install home screen game card"
          >
            <Rocket className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
            <span>Download APK (Android Only)</span>
          </button>

          {/* Theme Changer */}
          <div className="flex items-center bg-[#171f30] border border-[#243354] rounded-full p-1 shadow-inner">
            <button 
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="Light Mode"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="Dark Mode"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'}`}
              title="System Theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid: Left Sidebar + Centered Discovery Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* CrazyGames Style Interactive Left Sidebar Navigation */}
        <aside className="w-60 bg-[#090b11] dark:bg-[#090b11] light:bg-[#f9fafb] border-r border-[#1e293b] dark:border-[#1e293b] light:border-zinc-200 shrink-0 hidden lg:flex flex-col p-4 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Main Discover Categories */}
          <div>
            <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 px-2">
              Explore Genres
            </div>
            <nav className="space-y-1">
              {categoriesList.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery(''); // clear search when pivoting categories
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all duration-250 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/20 scale-[1.02]' 
                        : 'text-zinc-400 hover:text-white dark:hover:text-white light:hover:text-zinc-900 hover:bg-[#1a2035]/50 dark:hover:bg-[#1a2035]/50 light:hover:bg-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {cat === 'All' && <Sparkles className="w-4 h-4 text-pink-400" />}
                      {cat === 'Action' && <Swords className="w-4 h-4 text-red-400" />}
                      {cat === 'Puzzle' && <Grid className="w-4 h-4 text-yellow-400" />}
                      {cat === 'Arcade' && <Gamepad2 className="w-4 h-4 text-cyan-400" />}
                      {cat === 'Simulation' && <Monitor className="w-4 h-4 text-emerald-400" />}
                      {cat === 'Strategy' && <Info className="w-4 h-4 text-purple-400" />}
                      {cat === 'Sports' && <Flag className="w-4 h-4 text-blue-400" />}
                      <span>{cat} Games</span>
                    </div>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick banner card */}
          <div className="bg-gradient-to-br from-[#1b1031] to-[#121a3a] border border-purple-500/20 p-4 rounded-2xl relative overflow-hidden text-center shadow-inner">
            <div className="absolute -top-6 -right-6 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
            <Trophy className="w-7 h-7 text-yellow-400 mx-auto mb-2 animate-bounce" />
            <h4 className="text-white font-extrabold text-xs mb-1">Instant Playroom</h4>
            <p className="text-[10px] text-zinc-400 leading-normal">
              Progress, settings, and local highscores save automatically! Zero installations.
            </p>
          </div>

          {/* Recents played list locally */}
          {recentPlays.length > 0 && (
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-3 px-2">
                Recently Played
              </div>
              <div className="space-y-2">
                {recentPlays.map(id => {
                  const game = GAMES.find(g => g.id === id);
                  if (!game) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => handlePlayGame(game)}
                      className="w-full flex items-center space-x-2 p-2 rounded-xl text-left hover:bg-zinc-850/50 bg-[#161d30]/30 hover:scale-[1.01] transition-all group"
                    >
                      <img 
                        src={getThumbnail(game) || ''} 
                        alt={game.name} 
                        className="w-10 h-10 rounded-lg object-cover border border-[#1e293b]" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate text-white dark:text-white light:text-zinc-800">
                          {game.name}
                        </div>
                        <div className="text-[9px] text-zinc-500 uppercase font-mono">
                          Play now
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Content Panel Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#05070c] dark:bg-[#05070c] light:bg-[#f9fafb] flex flex-col">
          
          {/* Quick search panel input for smaller devices */}
          <div className="p-4 border-b border-zinc-800 dark:border-zinc-800 light:border-zinc-300 md:hidden bg-[#0c101d] dark:bg-[#0c101d] light:bg-zinc-100 flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search Games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1b233a] dark:bg-[#1b233a] light:bg-white text-xs text-foreground placeholder-zinc-500 pl-9 pr-3 py-2 rounded-xl border border-zinc-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-8">
            
            {/* CrazyGames Interactive Banner Hero Section (Only shown when not actively filtering heavily) */}
            {selectedCategory === 'All' && !searchQuery && (
              <div 
                className="relative bg-gradient-to-r from-[#170e30] via-[#090b14] to-[#040e2b] border border-blue-900/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between min-h-[300px] gap-6 group hover:border-indigo-500/20 transition-all duration-300"
              >
                {/* Background visual graphics */}
                <div className="absolute inset-0 bg-cover bg-center blend-overlay opacity-30 group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none" style={{ backgroundImage: `url(${featuredGame.thumbnail})` }} />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/95 via-black/80 to-transparent pointer-events-none" />

                {/* Left detail side */}
                <div className="relative z-10 flex-1 flex flex-col justify-between h-full text-center md:text-left">
                  <div className="space-y-4 max-w-lg">
                    {/* Glowing highlight tag */}
                    <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full animate-pulse shadow-md">
                      <Flame className="w-3 h-3 text-white" />
                      <span>Featured Epic Game</span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                      {featuredGame.name}
                    </h2>
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                      {featuredGame.description}
                    </p>
                  </div>

                  {/* Play Controls indicator and Quick facts */}
                  <div className="mt-8 flex flex-wrap gap-2 justify-center md:justify-start items-center">
                    <button
                      onClick={() => handlePlayGame(featuredGame)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs sm:text-sm font-black rounded-2xl shadow-xl hover:shadow-indigo-500/15 group-hover:scale-105 active:scale-95 transition-all flex items-center space-x-2"
                    >
                      <Play className="w-4 h-4 fill-current text-white animate-spin-slow" />
                      <span>PLAY NOW INSTANTLY</span>
                    </button>
                    
                    <div className="bg-white/5 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-white/10 text-left hidden sm:block">
                      <span className="block text-[8px] uppercase tracking-widest text-zinc-400 font-bold">High Score Record</span>
                      <span className="font-mono text-xs text-yellow-400 font-bold">
                        🏆 {localStorage.getItem(featuredGame.scoreKey || '') || 'Zero Record'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right hand layout showing mockup perspective */}
                <div className="relative z-10 w-full md:w-80 h-44 sm:h-52 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-inner group/preview flex items-center justify-center">
                  <img 
                    src={getThumbnail(featuredGame) || ''} 
                    alt="Featured preview" 
                    className="w-full h-full object-cover transform scale-100 group-hover/preview:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300">
                    <div className="p-3.5 bg-indigo-600 rounded-full text-white shadow-xl">
                      <Play className="w-6 h-6 fill-current text-white" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Title / Filter summary */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/40 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white dark:text-white light:text-zinc-900 tracking-tight flex items-center">
                  {selectedCategory === 'All' ? '🎮 Premium Instant Games' : `⚡ Best ${selectedCategory} Games`}
                  <span className="ml-2.5 bg-zinc-800 text-zinc-400 dark:bg-zinc-800 light:bg-zinc-200 light:text-zinc-700 text-[10px] font-mono px-2 py-0.5 rounded-full">
                    {filteredGames.length} Available
                  </span>
                </h3>
                <p className="text-zinc-500 text-xs">
                  {searchQuery ? `Search matches for "${searchQuery}"` : 'No signups or flash players required. Click instantly to boot.'}
                </p>
              </div>

              {/* Genre Pills on Tablet/Mobile Header area */}
              <div className="flex sm:hidden overflow-x-auto gap-1.5 w-full pb-1 scrollbar-none">
                {categoriesList.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold ${
                      selectedCategory === cat 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-[#1b233a] text-zinc-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* CrazyGames Dense grid list */}
            {filteredGames.length === 0 ? (
              <div className="text-center py-16 bg-[#161d30]/20 border border-dashed border-zinc-800 rounded-3xl">
                <Info className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
                <h4 className="text-white font-extrabold text-sm mb-1">No matches found</h4>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Try revising your filters, clearing your search query, or selecting another genre from the sidebar.
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="mt-4 text-xs font-bold bg-zinc-800 hover:bg-zinc-750 text-white px-4 py-2 rounded-xl"
                >
                  Reset Library Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredGames.map((game) => {
                  const thumb = getThumbnail(game);
                  const highScore = game.scoreKey ? localStorage.getItem(game.scoreKey) || '0' : null;
                  const likeData = gameLikes[game.id] || { likes: 1100, userChoice: null };

                  return (
                    <div 
                      key={game.id}
                      className="group relative bg-[#0d111c] dark:bg-[#0d111c] light:bg-white border border-[#1b253c]/80 dark:border-[#1b253c]/80 light:border-zinc-200 rounded-2xl overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 light:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 hover:scale-[1.03] transition-all duration-300 flex flex-col"
                    >
                      {/* Grid game thumbnail wrapper */}
                      <div className="aspect-[16/10] relative overflow-hidden bg-black select-none pointer-events-none">
                        
                        {/* Overlay linear gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#02050b]/95 via-transparent to-transparent z-10" />

                        {/* Large play button overlay on hover (CrazyGames trademark feel) */}
                        <div className="absolute inset-0 bg-indigo-900/40 backdrop-blur-[1px] z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="p-3 bg-gradient-to-tr from-[#6366f1] to-[#a855f7] rounded-full text-white shadow-xl scale-90 group-hover:scale-100 transition-transform duration-300">
                            <Play className="w-5 h-5 fill-current text-white text-center ml-0.5 animate-pulse" />
                          </div>
                        </div>

                        {thumb ? (
                          <img 
                            src={thumb}
                            alt={game.name} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 bg-zinc-850 z-20">
                            <div className="opacity-10 transform scale-150">{game.icon}</div>
                            <span className="text-[9px] uppercase tracking-[0.1em] font-medium text-zinc-500">Loading Frame...</span>
                          </div>
                        )}

                        {/* Multi-Category pills badge indicator */}
                        <div className="absolute top-2.5 left-2.5 z-25 flex flex-wrap gap-1">
                          {game.categories.slice(0, 2).map((cat, i) => (
                            <span 
                              key={cat} 
                              className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md text-white ${
                                i === 0 ? 'bg-[#3b82f6]' : 'bg-[#eab308]'
                              }`}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>

                        {/* HighScore Banner */}
                        {highScore && highScore !== '0' && (
                          <div className="absolute top-2.5 right-2.5 z-25 flex items-center space-x-1 bg-[#1e293b]/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 text-yellow-400">
                            <Trophy className="w-2.5 h-2.5" />
                            <span className="text-[9px] font-bold font-mono">{highScore}</span>
                          </div>
                        )}
                      </div>

                      {/* Summary container */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-extrabold text-sm text-white dark:text-white light:text-zinc-850 tracking-tight leading-normal">
                              {game.name}
                            </h4>
                            
                            <span className="text-[10px] text-zinc-500 font-bold flex items-center space-x-0.5">
                              <ThumbsUp className="w-2.5 h-2.5 text-emerald-400 fill-current" />
                              <span>{likeData.likes}</span>
                            </span>
                          </div>
                          
                          <p className="text-zinc-500 text-[10px] leading-relaxed line-clamp-2 mb-4 h-7">
                            {game.description}
                          </p>
                        </div>

                        {/* Interactive triggers */}
                        <button
                          onClick={() => handlePlayGame(game)}
                          className="w-full py-2 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white hover:from-indigo-600 hover:to-purple-600 text-xs font-extrabold rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>INSTANT PLAY</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Horizontal Genre Carousel lines for CrazyGames aesthetic layout (Only show when not searching) */}
            {!searchQuery && selectedCategory === 'All' && (
              <div className="space-y-8 mt-12">
                {['Action', 'Puzzle', 'Arcade'].map((carouselGenre) => {
                  const targetGames = GAMES.filter(g => g.categories.includes(carouselGenre));
                  if (targetGames.length === 0) return null;

                  return (
                    <div key={carouselGenre} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-extrabold text-white dark:text-white light:text-zinc-950 flex items-center space-x-2">
                          {carouselGenre === 'Action' && <Swords className="w-4 h-4 text-red-500" />}
                          {carouselGenre === 'Puzzle' && <Grid className="w-4 h-4 text-yellow-500" />}
                          {carouselGenre === 'Arcade' && <Gamepad2 className="w-4 h-4 text-cyan-500" />}
                          <span>Trending {carouselGenre} Releases</span>
                        </h4>
                        <button 
                          onClick={() => setSelectedCategory(carouselGenre)}
                          className="text-indigo-400 hover:text-indigo-300 text-xs font-bold flex items-center space-x-1 transition-all"
                        >
                          <span>Full View</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Infinite scrolling block flow */}
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none custom-scrollbar">
                        {targetGames.map(game => (
                          <div
                            key={`carousel-${game.id}`}
                            onClick={() => handlePlayGame(game)}
                            className="w-56 shrink-0 bg-[#0d111c] dark:bg-[#0d111c] light:bg-white border border-zinc-800/40 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:scale-[1.01] transition-all cursor-pointer group"
                          >
                            <div className="aspect-[16/10] relative overflow-hidden bg-black">
                              <img 
                                src={getThumbnail(game) || ''} 
                                alt={game.name} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-4 h-4 fill-current text-white" />
                              </div>
                            </div>
                            <div className="p-3">
                              <div className="text-[11px] font-black text-white dark:text-white light:text-zinc-900 truncate">
                                {game.name}
                              </div>
                              <div className="text-[9px] text-[#22c55e] font-extrabold uppercase mt-0.5">
                                Free instant play
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Footer block */}
            <footer className="pt-16 pb-8 border-t border-zinc-800/20 text-center">
              <div className="flex items-center justify-center space-x-2 text-zinc-400 font-extrabold text-sm uppercase max-auto mb-4">
                <img src="https://flowchats.org/static/favicon.svg" alt="Footer Logo" className="w-5 h-5 opacity-60" referrerPolicy="no-referrer" />
                <span>FlowChat Games Platform</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed max-w-sm mx-auto">
                All rights protected. Built inline using responsive HTML5 structures. Supports custom keyboard inputs, gamepads, and swipe controls. Play zero signup games natively.
              </p>
            </footer>
          </div>
        </div>
      </div>

      {/* CrazyGames Inspired Immersive Split-Screen / Playroom Screen Overlay */}
      {activeGame && (
        <div className="fixed inset-0 bg-[#080a10] z-[9999] flex flex-col overflow-hidden animate-in fade-in duration-300 text-white">
          
          {/* Active Playroom Navbar */}
          <header className="h-14 shrink-0 bg-[#0c101d] border-b border-[#1f2937] flex items-center justify-between px-4 z-50">
            <div className="flex items-center space-x-2.5">
              <button 
                onClick={() => {
                  setActiveGame(null);
                  setFullIframeMode(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center text-zinc-400 hover:text-white"
                title="Return to Game Hub"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="h-4 w-px bg-zinc-800" />
              
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-zinc-850 rounded-lg text-indigo-400">
                  {activeGame.icon}
                </div>
                <h3 className="font-extrabold text-sm tracking-tight text-white select-none">
                  Currently Playing: <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">{activeGame.name}</span>
                </h3>
              </div>
            </div>

            {/* Quick Action switches inside playroom header wrapper */}
            <div className="flex items-center space-x-3">
              {/* Full viewtoggle panel */}
              <button
                onClick={() => setFullIframeMode(!fullIframeMode)}
                className="p-2 bg-[#1b233a] hover:bg-neutral-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white text-[11px] font-bold flex items-center space-x-1.5 transition-all"
                title="Toggle sidebar guides panel"
              >
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">{fullIframeMode ? 'Show Control Guide' : 'Maximize Game screen'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 bg-[#1b233a] hover:bg-neutral-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white text-[11px] font-bold flex items-center space-x-1 px-3 transition-all"
                title="Browser Fullscreen Mode"
              >
                <Expand className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
          </header>

          {/* Core play arena split logic */}
          <div className="flex-1 flex overflow-hidden bg-[#05070a]" ref={playRoomRef}>
            
            {/* Live game iframe play viewport */}
            <div className="flex-1 relative h-full bg-[#030406] flex items-center justify-center">
              <iframe 
                src={activeGame.path} 
                className="w-full h-full border-none shadow-2xl transition-all"
                title={activeGame.name}
                allow="gamepad; fullscreen"
              />
            </div>

            {/* Quick Interactive Sidebar showing instructions, ratings, controls, highscore & quick links */}
            {!fullIframeMode && (
              <div className="w-80 border-l border-[#1e293b] bg-[#0c101d] shrink-0 hidden lg:flex flex-col p-4 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* Quick Rating component */}
                <div>
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-2.5">
                    How do you rate it?
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRateGame(activeGame.id, 'like')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                        gameLikes[activeGame.id]?.userChoice === 'like'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-md'
                          : 'bg-[#1b233a]/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Thump up</span>
                    </button>
                    
                    <button
                      onClick={() => handleRateGame(activeGame.id, 'dislike')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl border font-bold text-xs transition-all ${
                        gameLikes[activeGame.id]?.userChoice === 'dislike'
                          ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-md'
                          : 'bg-[#1b233a]/50 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Trash</span>
                    </button>
                  </div>
                  <div className="text-[9px] text-zinc-500 mt-2 text-center font-bold">
                    🔥 {(gameLikes[activeGame.id]?.likes) || 842} other users endorsed this title
                  </div>
                </div>

                {/* Score panel */}
                <div className="bg-[#142340]/40 border border-blue-900/40 p-4 rounded-xl text-center shadow-lg">
                  <span className="block text-[8px] uppercase tracking-wider text-blue-400 font-bold mb-1">Active High Score Log</span>
                  <div className="flex items-center justify-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-mono text-lg font-black text-yellow-300">
                      {activeGame.scoreKey ? localStorage.getItem(activeGame.scoreKey) || '0' : '0'}
                    </span>
                  </div>
                  <span className="block text-[8px] text-zinc-500 mt-1">High scores save locally automatically</span>
                </div>

                {/* Cheat Sheet Control mapping values info */}
                <div>
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-3">
                    🎮 Live Controls Guide
                  </div>
                  <div className="space-y-2 bg-[#141a29] border border-zinc-800 p-3 rounded-xl text-xs">
                    {activeGame.controls && activeGame.controls.length > 0 ? (
                      activeGame.controls.map((ctrl, index) => (
                        <div key={index} className="flex items-center justify-between py-1.5 border-b border-zinc-800/50 last:border-0 font-medium">
                          <span className="text-zinc-400 text-[11px]">{ctrl.action}</span>
                          <kbd className="px-2 py-0.5 bg-[#253253] border border-zinc-700/60 rounded-md text-[10px] font-bold font-mono text-zinc-200 shadow-md select-none">
                            {ctrl.key}
                          </kbd>
                        </div>
                      ))
                    ) : (
                      <div className="text-zinc-500 text-center text-xs py-2">
                        Use mouse / touch to interact.
                      </div>
                    )}
                  </div>
                </div>

                {/* Other recommendations inside playroom panel */}
                <div className="flex-1 flex flex-col justify-end">
                  <div className="text-[10px] font-black uppercase text-zinc-500 tracking-wider mb-3">
                    Fast Switch Games
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GAMES.filter(g => g.id !== activeGame.id).slice(0, 4).map(g => (
                      <div 
                        key={`playroom-recommend-${g.id}`}
                        onClick={() => handlePlayGame(g)}
                        className="group/side relative aspect-[14/10] rounded-xl overflow-hidden cursor-pointer border border-[#1b253c] select-none hover:border-indigo-400 transition-all duration-200"
                      >
                        <img 
                          src={getThumbnail(g) || ''} 
                          alt={g.name} 
                          className="w-full h-full object-cover transform scale-100 group-hover/side:scale-105 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-black/20 p-1.5">
                          <p className="text-[9px] font-black tracking-tight truncate text-white leading-tight">
                            {g.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Android/PWA Native Installer Dialog */}
      {showAndroidDialog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[10005] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0c101d] border border-[#243354] rounded-3xl max-w-lg w-full p-6 sm:p-8 text-white text-left font-sans shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAndroidDialog(false)}
              className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-[#1f2937] pb-4">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl">
                <Rocket className="w-6 h-6 text-indigo-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-white uppercase sm:text-xl">
                  Play Natively on Android
                </h3>
                <p className="text-xs text-zinc-400">
                  Enjoy immersive, zero-boundary full-screen desktop-quality gaming
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-gradient-to-br from-[#1b253c] to-[#121625] p-5 rounded-2xl border-2 border-emerald-500/35 text-center space-y-3.5 relative overflow-hidden shadow-2xl">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-[9px] font-black uppercase rounded-full tracking-wider animate-pulse">
                  🔥 RECOMMENDED ANDROID INSTALLER
                </span>
                <h4 className="font-extrabold text-white text-sm">Download Pre-Compiled APK (Android Only)</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Our GitHub Actions pipeline compiles and deploys this APK automatically. Press below to instantly download the installer directly from the GitHub build repository:
                </p>
                <a
                  href={getGitHubDownloadUrl()}
                  className="inline-flex w-full items-center justify-center space-x-2 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-emerald-500/20 active:scale-98 transition-all"
                >
                  <Rocket className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>DOWNLOAD DIRECT APK (.APK)</span>
                </a>
                <p className="text-zinc-500 text-[9px]">
                  Requires allowing installation from unknown sources in Android Settings. Always 100% instant and secure.
                </p>
              </div>

              <div className="bg-[#131a2c] p-4 rounded-2xl border border-indigo-950/40 space-y-2">
                <span className="inline-block px-2.5 py-0.5 bg-emerald-600/25 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full">
                  ⚡ INSTANT METHOD (No Downloads)
                </span>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">Add to Home Screen (PWA / APK feel)</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  Our application is a fully configured Progressive Web App. Installing this creates an instant launch icon on your Android launcher:
                </p>
                <ol className="list-decimal pl-4 text-zinc-400 space-y-1 mt-2 text-xs">
                  <li>Open this App page inside Google Chrome on your Android device.</li>
                  <li>Tap the browser menu icon <strong className="text-zinc-200">(three vertical dots)</strong> in the top-right corner.</li>
                  <li>Tap <strong className="text-white">"Add to Home screen"</strong> or <strong className="text-white">"Install app"</strong>.</li>
                  <li>Tap "Add" / "Install" to confirm. The game hub launches as a standard full-viewport immersive Android application!</li>
                </ol>
              </div>

              <div className="bg-[#111624] p-4 rounded-2xl border border-zinc-800/60 space-y-2">
                <span className="inline-block px-2.5 py-0.5 bg-indigo-600/25 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-full">
                  🏗️ DEVELOPER METHOD
                </span>
                <h4 className="font-extrabold text-white text-xs sm:text-sm">Compile Direct APK with Capacitor</h4>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  We have successfully initialized, configured, and bound the native <strong className="text-zinc-200">Android wrapper studio assets</strong> directly inside this codebase:
                </p>
                <ol className="list-decimal pl-4 text-zinc-400 space-y-1 mt-2 text-xs">
                  <li>Export this project repository.</li>
                  <li>Verify that you have JDK installed.</li>
                  <li>In the project root, synchronize assets and trigger compilation through Gradle:</li>
                </ol>
                <div className="bg-black/40 border border-zinc-800 p-2.5 rounded-xl font-mono text-[10px] text-purple-300 mt-2 space-y-1">
                  <div># Sync assets:</div>
                  <div className="text-indigo-400">npx cap sync android</div>
                  <div className="mt-1"># Assemble debug APK:</div>
                  <div className="text-indigo-400">cd android && ./gradlew assembleDebug</div>
                </div>
                <p className="text-zinc-500 text-[10px] mt-1.5 leading-normal">
                  The generated installer file will be located at: <code className="text-zinc-400">android/app/build/outputs/apk/debug/app-debug.apk</code>
                </p>
              </div>
            </div>

            <button 
              onClick={() => setShowAndroidDialog(false)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all"
            >
              GOT IT! LET'S PLAY NOW
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Hub;

