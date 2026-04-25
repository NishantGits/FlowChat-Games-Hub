/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export const PLAYER_SKINS = [
    { name: 'Neon Blue', primary: '#00aaff', secondary: '#00ffff' },
    { name: 'Cyber Pink', primary: '#ff00ff', secondary: '#ff80ff' },
    { name: 'Acid Green', primary: '#39ff14', secondary: '#00ff88' },
    { name: 'Solar Orange', primary: '#ff4e00', secondary: '#ffff00' },
    { name: 'Electric Purple', primary: '#8000ff', secondary: '#ff00ff' },
    { name: 'Gold Prime', primary: '#ffcc00', secondary: '#f0f0f0' }
];

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters (F, L, O...)
  color?: string;
  targetIndex?: number; // Index in the FLOWCHAT target word
  points?: number; // Score value for gems
  hasFired?: boolean; // For Aliens
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

// Synthwave Neon Colors for FLOWCHAT (8 letters)
export const FLOWCHAT_COLORS = [
    '#ff00ff', // F - Magenta
    '#00ffff', // L - Cyan
    '#ffff00', // O - Yellow
    '#ff4e00', // W - Orange
    '#8000ff', // C - Purple
    '#00ff00', // H - Green
    '#0000ff', // A - Blue
    '#ff0000', // T - Red
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}
