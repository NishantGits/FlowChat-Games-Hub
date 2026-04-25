import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, X, Play, Pause, Trophy, Crown, RefreshCcw } from 'lucide-react';
import html2canvas from 'html2canvas';

// Tetris Constants
const COLS = 10;
const ROWS = 20;
const INITIAL_DROP_TIME = 800;
const MIN_DROP_TIME = 100;

const TETROMINOS = {
  I: { shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: 'bg-cyan-400' },
  J: { shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  S: { shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: 'bg-red-500' },
};

type TetrominoKey = keyof typeof TETROMINOS;
const RANDOM_PIECES = 'IJLOSZ' as any;

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const TetrisApp = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{ pos: { x: number, y: number }, type: TetrominoKey, shape: number[][] } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoKey>('I');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('tetris_highscore') || '0', 10));
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Check for touch device
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  const getRandomPiece = useCallback(() => {
    const pieces = 'IJLOSTZ';
    return pieces[Math.floor(Math.random() * pieces.length)] as TetrominoKey;
  }, []);

  const spawnPiece = useCallback(() => {
    const type = nextPiece;
    const shape = TETROMINOS[type].shape;
    const pos = { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 };
    
    // Check collision on spawn
    if (checkCollision({ pos, shape })) {
      setGameOver(true);
      setDropTime(null);
      return;
    }

    setActivePiece({ pos, type, shape });
    setNextPiece(getRandomPiece());
  }, [nextPiece, getRandomPiece]);

  const startGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameOver(false);
    setPaused(false);
    setDropTime(INITIAL_DROP_TIME);
    setNextPiece(getRandomPiece());
    // Trigger first spawn
  };

  useEffect(() => {
    if (!gameOver && !activePiece && dropTime !== null) {
      spawnPiece();
    }
  }, [gameOver, activePiece, dropTime, spawnPiece]);

  const checkCollision = ({ pos, shape }: { pos: { x: number, y: number }, shape: number[][] }) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && grid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const rotate = (matrix: number[][]) => {
    const rotated = matrix[0].map((_, index) => matrix.map(col => col[index]).reverse());
    return rotated;
  };

  const handleRotate = () => {
    if (!activePiece || paused || gameOver) return;
    const rotatedShape = rotate(activePiece.shape);
    if (!checkCollision({ pos: activePiece.pos, shape: rotatedShape })) {
      setActivePiece({ ...activePiece, shape: rotatedShape });
    }
  };

  const moveSide = (dir: number) => {
    if (!activePiece || paused || gameOver) return;
    const newPos = { ...activePiece.pos, x: activePiece.pos.x + dir };
    if (!checkCollision({ pos: newPos, shape: activePiece.shape })) {
      setActivePiece({ ...activePiece, pos: newPos });
    }
  };

  const drop = () => {
    if (!activePiece || paused || gameOver) return;
    const newPos = { ...activePiece.pos, y: activePiece.pos.y + 1 };
    
    if (!checkCollision({ pos: newPos, shape: activePiece.shape })) {
      setActivePiece({ ...activePiece, pos: newPos });
    } else {
      // Lock piece
      const newGrid = [...grid.map(row => [...row])];
      activePiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0) newGrid[gridY][gridX] = activePiece.type;
          }
        });
      });

      // Clear lines
      let linesCleared = 0;
      const filteredGrid = newGrid.filter(row => {
        const isFull = row.every(cell => cell !== 0);
        if (isFull) linesCleared++;
        return !isFull;
      });

      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLS).fill(0));
      }

      if (linesCleared > 0) {
        const linePoints = [0, 100, 300, 500, 800];
        const gainedScore = linePoints[linesCleared] * level;
        setScore(prev => {
          const next = prev + gainedScore;
          if (next > highScore) {
            setHighScore(next);
            localStorage.setItem('tetris_highscore', next.toString());
          }
          return next;
        });
        const totalLines = lines + linesCleared;
        setLines(totalLines);
        if (totalLines >= level * 10) {
          setLevel(prev => prev + 1);
          setDropTime(Math.max(INITIAL_DROP_TIME - (level * 100), MIN_DROP_TIME));
        }
      }

      setGrid(filteredGrid);
      setActivePiece(null);
    }
  };

  const hardDrop = () => {
    if (!activePiece || paused || gameOver) return;
    let newY = activePiece.pos.y;
    while (!checkCollision({ pos: { x: activePiece.pos.x, y: newY + 1 }, shape: activePiece.shape })) {
      newY++;
    }
    const finalPos = { ...activePiece.pos, y: newY };
    // We basically call drop at final pos next frame, but to make it instant:
    setActivePiece({ ...activePiece, pos: finalPos });
    // Trigger drop logic immediately
    // For simplicity, we just let the next interval catch it or trigger it manually
    // but better to actually merge it now.
    // Let's just do it simple for now:
    setTimeout(drop, 0);
  };

  useEffect(() => {
    if (dropTime !== null && !paused && !gameOver) {
      const id = setInterval(drop, dropTime);
      return () => clearInterval(id);
    }
  }, [dropTime, paused, gameOver, activePiece]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') moveSide(-1);
      if (e.key === 'ArrowRight') moveSide(1);
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp' || e.key === ' ') handleRotate();
      if (e.key === 'p' || e.key === 'P') setPaused(p => !p);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePiece, paused, gameOver]);

  const gameContainerRef = useRef<HTMLDivElement>(null);
  const screenshotTaken = useRef(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (gameContainerRef.current && !screenshotTaken.current) {
        try {
          const canvas = await html2canvas(gameContainerRef.current, {
            scale: 0.5,
            backgroundColor: '#000'
          });
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          window.parent.postMessage({ type: 'save-screenshot', gameId: 'tetris', dataUrl }, '*');
          screenshotTaken.current = true;
        } catch (e) {
          console.error('Screenshot failed', e);
        }
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={gameContainerRef} className="flex flex-col items-center min-h-screen bg-zinc-950 text-white font-sans overflow-hidden select-none">
      {/* HUD Bar */}
      <div className="w-full max-w-[600px] flex items-center justify-between px-6 py-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 z-10">
        <div className="flex items-center space-x-6">
           <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-0.5">SCORE</span>
              <span className="text-lg font-mono font-bold text-cyan-400 tracking-tighter">{score.toLocaleString()}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-0.5">BEST</span>
              <span className="text-lg font-mono font-bold text-yellow-400 tracking-tighter">{highScore.toLocaleString()}</span>
           </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setPaused(p => !p)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 group">
            {paused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[800px] flex flex-col md:flex-row items-center md:items-start justify-center gap-8 p-6 md:mt-12 overflow-hidden">
        {/* Game Board Container */}
        <div className="relative p-2 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] border border-white/10 shrink-0">
          <div className="relative border-2 border-black bg-black rounded-sm overflow-hidden">
            <div className="grid grid-cols-10 gap-[1px] bg-white/5">
            {grid.map((row, y) => 
               row.map((cell, x) => {
                  let color = cell === 0 ? 'bg-zinc-950' : TETROMINOS[cell as TetrominoKey].color;
                  
                  // Render active piece
                  if (activePiece) {
                    const py = y - activePiece.pos.y;
                    const px = x - activePiece.pos.x;
                    if (py >= 0 && py < activePiece.shape.length && px >= 0 && px < activePiece.shape[0].length) {
                      if (activePiece.shape[py][px]) {
                        color = TETROMINOS[activePiece.type].color;
                      }
                    }
                  }

                  return (
                    <div 
                      key={`${x}-${y}`} 
                      className={`w-[7.5vw] h-[7.5vw] min-w-[22px] min-h-[22px] max-w-[34px] max-h-[34px] ${color} transition-all duration-300 border border-white/5 rounded-[2px] ${cell !== 0 ? 'shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_15px_rgba(34,211,238,0.2)]' : ''}`} 
                    />
                  );
               })
            )}
          </div>

          {/* Overlays */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300 z-20">
              <h2 className="text-4xl font-black text-red-500 mb-2 font-cyber tracking-tighter">GAME OVER</h2>
              <div className="text-2xl font-bold mb-4 font-mono">{score.toLocaleString()}</div>
              
              <div className="flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/20 px-4 py-1.5 rounded-full mb-8">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-xs font-bold font-mono tracking-widest uppercase">BEST: {highScore.toLocaleString()}</span>
              </div>

              <button 
                onClick={startGame}
                className="w-full py-4 bg-white text-black font-black text-xl rounded-xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCcw className="w-6 h-6" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}

          {!gameOver && !dropTime && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6 text-center z-20">
                {highScore > 0 && (
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex items-center space-x-2 text-yellow-400 mb-1">
                      <Crown className="w-4 h-4 fill-yellow-400" />
                      <span className="text-[10px] uppercase font-mono tracking-widest font-bold">BEST SCORE</span>
                    </div>
                    <div className="text-3xl font-black text-white font-cyber tracking-widest">
                      {highScore.toLocaleString()}
                    </div>
                  </div>
                )}
                <button 
                   onClick={startGame}
                   className="px-10 py-4 bg-cyan-500 text-black font-black rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                >
                   START MISSION
                </button>
             </div>
          )}

          {paused && !gameOver && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
               <Pause className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
               <button 
                onClick={() => setPaused(false)}
                className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:scale-105 transition-all"
               >
                 RESUME
               </button>
            </div>
          )}
        </div>
      </div>

        {/* Side Info / Layout for Mobile is Bottom */}
        <div className="flex flex-row md:flex-col gap-4 w-full max-w-[400px] md:w-36 items-stretch justify-center">
           <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl text-center shadow-xl">
              <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-3">NEXT</div>
              <div className="flex items-center justify-center min-h-[60px]">
                 {dropTime && !gameOver && (
                   <div 
                     className="grid gap-1.5"
                     style={{ 
                       gridTemplateColumns: `repeat(${TETROMINOS[nextPiece].shape[0].length}, minmax(0, 1fr))` 
                     }}
                   >
                      {TETROMINOS[nextPiece].shape.map((row, y) => 
                        row.map((cell, x) => (
                           <div key={`${x}-${y}`} className={`w-3 h-3 md:w-4 md:h-4 rounded-[3px] ${cell ? TETROMINOS[nextPiece].color : 'bg-transparent'} ${cell ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}`} />
                        ))
                      )}
                   </div>
                 )}
              </div>
           </div>

           <div className="flex-1 flex flex-row md:flex-col gap-4">
              <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl text-center shadow-xl">
                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">LVL</div>
                 <div className="text-2xl font-mono font-black text-cyan-400">{level}</div>
              </div>
              <div className="flex-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-4 rounded-2xl text-center shadow-xl">
                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.2em] mb-1">LINES</div>
                 <div className="text-2xl font-mono font-black text-purple-400">{lines}</div>
              </div>
           </div>
        </div>
      </div>


      {/* Responsive Touch Controls */}
      {isTouchDevice && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-end pointer-events-none z-50">
          <div className="flex space-x-2 pointer-events-auto">
            <button 
              onPointerDown={() => moveSide(-1)}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 active:bg-white/30 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-8 h-8" />
            </button>
            <button 
              onPointerDown={() => drop()}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 active:bg-white/30 active:scale-95 transition-all"
            >
              <ArrowDown className="w-8 h-8" />
            </button>
            <button 
              onPointerDown={() => moveSide(1)}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 active:bg-white/30 active:scale-95 transition-all"
            >
              <ArrowRight className="w-8 h-8" />
            </button>
          </div>
          
          <div className="pointer-events-auto">
            <button 
              onPointerDown={() => handleRotate()}
              className="w-20 h-20 bg-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] active:scale-90 transition-all"
            >
              <RotateCw className="w-10 h-10 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Helper */}
      {!isTouchDevice && !gameOver && dropTime && (
        <div className="fixed bottom-6 text-[10px] text-zinc-600 font-mono flex space-x-4">
           <span>←/→ MOVE</span>
           <span>SPACE/↑ ROTATE</span>
           <span>↓ DROP</span>
           <span>P PAUSE</span>
        </div>
      )}
    </div>
  );
};

export default TetrisApp;
