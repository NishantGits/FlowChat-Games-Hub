/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE } from './types';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;
  currentSkin: number; // Index in PLAYER_SKINS
  highScore: number;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  togglePause: () => void;
  resumeGame: () => void;
  quitToMenu: () => void;
  setSkin: (index: number) => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  // Shop / Abilities
  buyItem: (type: 'DOUBLE_JUMP' | 'MAX_LIFE' | 'HEAL' | 'IMMORTAL', cost: number) => boolean;
  advanceLevel: () => void;
  openShop: () => void;
  closeShop: () => void;
  activateImmortality: () => void;
}

const FLOWCHAT_TARGET = ['F', 'L', 'O', 'W', 'C', 'H', 'A', 'T'];
const MAX_LEVEL = 3;

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  
  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,
  currentSkin: 0,
  highScore: parseInt(localStorage.getItem('runner_highscore') || '0', 10),

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false
  }),

  togglePause: () => set((state) => {
    if (state.status === GameStatus.PLAYING) return { status: GameStatus.PAUSED };
    if (state.status === GameStatus.PAUSED) return { status: GameStatus.PLAYING };
    return state;
  }),

  resumeGame: () => set({ status: GameStatus.PLAYING }),

  quitToMenu: () => {
    set({ status: GameStatus.MENU });
    window.parent.postMessage('close-game', '*');
  },

  setSkin: (index) => set({ currentSkin: index }),

  takeDamage: () => {
    const { lives, isImmortalityActive } = get();
    if (isImmortalityActive) return; // No damage if skill is active

    if (lives > 1) {
      set({ lives: lives - 1 });
    } else {
      set({ lives: 0, status: GameStatus.GAME_OVER, speed: 0 });
    }
  },

  addScore: (amount) => set((state) => {
    const newScore = state.score + amount;
    if (newScore > state.highScore) {
      localStorage.setItem('runner_highscore', newScore.toString());
      return { score: newScore, highScore: newScore };
    }
    return { score: newScore };
  }),
  
  collectGem: (value) => set((state) => {
    const newScore = state.score + value;
    const gemsCount = state.gemsCollected + 1;
    if (newScore > state.highScore) {
      localStorage.setItem('runner_highscore', newScore.toString());
      return { score: newScore, gemsCollected: gemsCount, highScore: newScore };
    }
    return { score: newScore, gemsCollected: gemsCount };
  }),

  setDistance: (dist) => set({ distance: dist }),

  collectLetter: (index) => {
    const { collectedLetters, level, speed } = get();
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      
      // LINEAR SPEED INCREASE: Add 10% of BASE speed per letter
      // This ensures 110% -> 120% -> 130% consistent steps
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      // Check if full word collected
      if (newLetters.length === FLOWCHAT_TARGET.length) {
        if (level < MAX_LEVEL) {
            // Immediately advance level
            // The Shop Portal will be spawned by LevelManager at the start of the new level
            get().advanceLevel();
        } else {
            // Victory Condition
            const finalScore = get().score + 5000;
            if (finalScore > get().highScore) {
              localStorage.setItem('runner_highscore', finalScore.toString());
              set({ highScore: finalScore });
            }
            set({
                status: GameStatus.VICTORY,
                score: finalScore
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed } = get();
      const nextLevel = level + 1;
      
      // LINEAR LEVEL INCREASE: Add 40% of BASE speed per level
      // Combined with the 6 letters (60%), this totals +100% speed per full level cycle
      const speedIncrease = RUN_SPEED_BASE * 0.40;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9), // Expand lanes
          status: GameStatus.PLAYING, // Keep playing, user runs into shop
          speed: newSpeed,
          collectedLetters: [] // Reset letters
      });
  },

  openShop: () => set({ status: GameStatus.SHOP }),
  
  closeShop: () => set({ status: GameStatus.PLAYING }),

  buyItem: (type, cost) => {
      const { score, maxLives, lives } = get();
      
      if (score >= cost) {
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          
          // Lasts 5 seconds
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  setStatus: (status) => set({ status }),
  increaseLevel: () => set((state) => ({ level: state.level + 1 })),
}));
