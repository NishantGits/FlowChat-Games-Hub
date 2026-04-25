/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, Pause, LogOut, Settings2, Check, Crown } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, FLOWCHAT_COLORS, ShopItem, RUN_SPEED_BASE, PLAYER_SKINS } from '../../types';
import { audio } from '../System/Audio';

// Skin Selection Component
const SkinSelector: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { currentSkin, setSkin } = useStore();

    return (
        <div className="absolute inset-0 bg-black/95 z-[110] flex flex-col items-center justify-center p-6 text-white text-center pointer-events-auto backdrop-blur-xl">
            <h2 className="text-4xl md:text-5xl font-black text-cyan-400 mb-8 font-cyber tracking-widest">SELECT SKIN</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-2xl w-full mb-10">
                {PLAYER_SKINS.map((skin, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSkin(idx)}
                        className={`group relative p-1 rounded-2xl transition-all duration-300 ${currentSkin === idx ? 'scale-110' : 'hover:scale-105'}`}
                    >
                        {/* Selected Indicator */}
                        {currentSkin === idx && (
                            <div className="absolute -top-2 -right-2 bg-cyan-500 text-black p-1 rounded-full z-10 shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                                <Check className="w-4 h-4 font-bold" />
                            </div>
                        )}

                        <div 
                            className={`h-32 rounded-xl border-4 transition-all duration-300 flex flex-col items-center justify-center space-y-2 ${currentSkin === idx ? 'border-cyan-400 bg-cyan-900/40 shadow-[0_0_30px_rgba(0,255,255,0.3)]' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                        >
                            <div className="flex space-x-1">
                                <div className="w-4 h-8 rounded-full" style={{ backgroundColor: skin.primary }}></div>
                                <div className="w-4 h-8 rounded-full" style={{ backgroundColor: skin.secondary }}></div>
                            </div>
                            <span className="text-[10px] md:text-sm font-bold uppercase tracking-tighter opacity-80">{skin.name}</span>
                        </div>
                    </button>
                ))}
            </div>

            <button 
                onClick={onBack}
                className="px-12 py-4 bg-white text-black font-black text-xl rounded-xl hover:scale-105 transition-all shadow-xl"
            >
                CONFIRM
            </button>
        </div>
    );
};

// Pause Screen Component
const PauseScreen: React.FC<{ onShowSkins: () => void }> = ({ onShowSkins }) => {
    const { resumeGame, quitToMenu, highScore } = useStore();

    return (
        <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm">
            <div className="flex items-center space-x-4 mb-2">
                <Pause className="w-12 h-12 text-cyan-400 animate-pulse" fill="currentColor" />
                <h1 className="text-6xl md:text-8xl font-black text-white font-cyber tracking-tighter">PAUSED</h1>
            </div>

            <div className="flex items-center bg-yellow-400/10 border border-yellow-400/20 px-4 py-2 rounded-full mb-10">
                <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-bold font-mono tracking-widest text-sm md:text-base uppercase">BEST: {highScore.toLocaleString()}</span>
            </div>

            <div className="flex flex-col space-y-4 w-64">
                <button 
                    onClick={resumeGame}
                    className="group relative flex items-center justify-center px-8 py-4 bg-cyan-500 text-black font-black text-xl rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                    <Play className="mr-2 w-6 h-6 fill-black" /> RESUME
                </button>

                <button 
                    onClick={onShowSkins}
                    className="flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white font-black text-xl rounded-xl hover:bg-white/20 hover:border-white/40 transition-all"
                >
                    <Settings2 className="mr-2 w-6 h-6 text-purple-400" /> CHANGE SKINS
                </button>

                <button 
                    onClick={quitToMenu}
                    className="flex items-center justify-center px-8 py-4 text-red-500 font-bold text-lg rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                >
                    <LogOut className="mr-2 w-5 h-5" /> RETURN TO HUB
                </button>
            </div>
            
            <p className="mt-12 text-white/30 font-mono text-[10px] tracking-[0.3em] uppercase">System Suspended</p>
        </div>
    );
};

// Available Shop Items
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. Essential for high obstacles.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Press Space/Tap to be invincible for 5s.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        // Select 3 random items, filtering out one-time items already bought
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, []);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">CYBER SHOP</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">AVAILABLE CREDITS:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors">
                                 <div className="bg-gray-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{item.name}</h3>
                                 <p className="text-gray-400 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{item.description}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} GEMS
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     RESUME MISSION <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, gemsCollected, distance, isImmortalityActive, speed, highScore } = useStore();
  const [showSkinSelector, setShowSkinSelector] = useState(false);
  const target = ['F', 'L', 'O', 'W', 'C', 'H', 'A', 'T'];

  // Common container style
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (showSkinSelector) {
      return <SkinSelector onBack={() => setShowSkinSelector(false)} />;
  }

  if (status === GameStatus.PAUSED) {
      return <PauseScreen onShowSkins={() => setShowSkinSelector(true)} />;
  }

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-[#050011] p-4 pointer-events-auto">
              {/* Retro Grid Background Effect */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ 
                  backgroundImage: `linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  perspective: '500px',
                  transform: 'rotateX(60deg) translateY(0%)'
              }}></div>

              <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-2xl text-center">
                  <div className="mb-8 relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <h1 className="relative text-7xl md:text-9xl font-black text-white tracking-tighter font-cyber">
                          RUN<span className="text-cyan-400">NER</span>
                      </h1>
                      <div className="h-1 w-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mt-2"></div>
                      <p className="text-cyan-400 font-mono tracking-[0.3em] mt-2 text-sm md:text-base uppercase">Synthwave Cosmos Protocol</p>
                  </div>

                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl mb-10 w-full max-w-md">
                      {highScore > 0 && (
                        <div className="flex flex-col items-center justify-center mb-6 border-b border-white/5 pb-4">
                            <div className="flex items-center space-x-2 text-yellow-500 mb-1">
                                <Crown className="w-4 h-4 fill-yellow-500" />
                                <span className="text-[10px] uppercase font-mono tracking-[0.2em] font-bold">BEST RECORD</span>
                            </div>
                            <div className="text-2xl font-black text-white font-cyber tracking-widest">
                                {highScore.toLocaleString()}
                            </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center space-x-2 mb-6">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                          <p className="text-white/60 font-mono text-xs uppercase tracking-widest">Collecting: FLOWCHAT</p>
                      </div>
                      
                      <button 
                        onClick={() => { audio.init(); startGame(); }}
                        className="w-full group relative overflow-hidden px-8 py-6 bg-cyan-500 text-black font-black text-2xl rounded-2xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(34,211,238,0.4)] mb-4"
                      >
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                          <span className="flex items-center justify-center">
                             START RUN <Play className="ml-3 w-6 h-6 fill-black" />
                          </span>
                      </button>

                      <button 
                        onClick={() => window.parent.postMessage('close-game', '*')}
                        className="w-full py-3 bg-white/5 border border-white/10 text-white/60 font-bold text-sm rounded-xl hover:bg-white/10 transition-all"
                      >
                        RETURN TO HUB
                      </button>

                      <div className="grid grid-cols-2 gap-4 mt-8">
                          <div className="text-left">
                              <p className="text-cyan-400 font-mono text-[10px] uppercase mb-1">Movement</p>
                              <p className="text-white font-bold text-xs">ARROW KEYS</p>
                          </div>
                          <div className="text-right">
                              <p className="text-purple-400 font-mono text-[10px] uppercase mb-1">Objective</p>
                              <p className="text-white font-bold text-xs">SURVIVE & COLLECT</p>
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center text-white/30 font-mono text-[10px] space-x-6">
                      <p>V1.2.0-STABLE</p>
                      <p>USER: {audio ? 'AUTHORIZED' : 'ANONYMOUS'}</p>
                      <p>© 2026 FLOWCHAT</p>
                  </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">GAME OVER</h1>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> LEVEL</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level} / 3</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="mr-2 w-4 h-4 md:w-5 md:h-5"/> GEMS COLLECTED</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> DISTANCE</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} LY</div>
                    </div>
                    <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2 overflow-hidden relative">
                        <div className="flex items-center text-white text-sm md:text-base">TOTAL SCORE</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 bg-yellow-400/5 border border-yellow-400/10 p-2 rounded-lg mt-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs uppercase font-mono tracking-[0.2em] text-yellow-500/80">BEST: {highScore.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                    <button 
                    onClick={() => { audio.init(); restartGame(); }}
                    className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                    >
                        RUN AGAIN
                    </button>

                    <button 
                    onClick={() => setShowSkinSelector(true)}
                    className="px-8 md:px-10 py-3 md:py-4 bg-white/10 border border-white/20 text-white font-bold text-lg md:text-xl rounded hover:bg-white/20 transition-all"
                    >
                        CHANGE SKINS
                    </button>

                    <button 
                    onClick={() => window.parent.postMessage('close-game', '*')}
                    className="px-8 md:px-10 py-3 md:py-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-lg md:text-xl rounded hover:bg-red-500/20 transition-all md:col-span-2"
                    >
                        RETURN TO HUB
                    </button>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    MISSION COMPLETE
                </h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    THE ANSWER TO THE UNIVERSE HAS BEEN FOUND
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-black/60 p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider">FINAL SCORE</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">GEMS</div>
                            <div className="text-xl md:text-2xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                             <div className="text-xs text-gray-400">DISTANCE</div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest"
                >
                    RESTART MISSION
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                    {score.toLocaleString()}
                </div>
                {highScore > 0 && (
                    <div className="flex items-center text-yellow-400/60 mt-1">
                        <Crown className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        <span className="text-[10px] md:text-xs font-mono font-bold tracking-widest">{highScore.toLocaleString()}</span>
                    </div>
                )}
            </div>
            
            <div className="flex space-x-1 md:space-x-2">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                    />
                ))}
            </div>
        </div>
        
        {/* Level Indicator - Moved to Top Center aligned with Score/Hearts */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-purple-300 font-bold tracking-wider font-mono bg-black/50 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm z-50">
            LEVEL {level} <span className="text-gray-500 text-xs md:text-sm">/ 3</span>
        </div>

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-xl md:text-2xl animate-pulse flex items-center drop-shadow-[0_0_10px_gold]">
                 <Shield className="mr-2 fill-yellow-400" /> IMMORTAL
             </div>
        )}

        {/* FLOWCHAT Collection Status - Just below Top Bar */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-1.5 md:space-x-2">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = FLOWCHAT_COLORS[idx];

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                            // Use dark text (almost black) when collected to contrast with neon background
                            color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                            boxShadow: isCollected ? `0 0 20px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                        }}
                        className={`w-7 h-9 md:w-9 md:h-11 flex items-center justify-center border-2 font-black text-base md:text-lg font-cyber rounded-lg transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
        </div>

        {/* Bottom Overlay */}
        <div className="w-full flex justify-end items-end">
             <div className="flex items-center space-x-2 text-cyan-500 opacity-70">
                 <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                 <span className="font-mono text-base md:text-xl">SPEED {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
             </div>
        </div>
    </div>
  );
};
