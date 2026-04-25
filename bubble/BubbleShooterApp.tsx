import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';

// Constants
const BUBBLE_RADIUS = 18;
const ROWS = 12;
const COLS = 11;
const COLORS = [
  { name: 'red', hex: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)' },
  { name: 'blue', hex: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)' },
  { name: 'green', hex: '#10b981', glow: 'rgba(16, 185, 129, 0.5)' },
  { name: 'yellow', hex: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)' },
  { name: 'purple', hex: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)' },
  { name: 'pink', hex: '#ec4899', glow: 'rgba(236, 72, 153, 0.5)' }
];

const WALL_WIDTH = 440;
const WALL_HEIGHT = 600;

interface Bubble {
  x: number;
  y: number;
  colorIndex: number;
  id: string;
  isPopping?: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  colorIndex: number;
}

const BubbleShooterApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(true); // Direct start as requested
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [nextColorIndex, setNextColorIndex] = useState(Math.floor(Math.random() * COLORS.length));
  const [projectile, setProjectile] = useState<Projectile | null>(null);
  const [shooterAngle, setShooterAngle] = useState(Math.PI / 2);
  const [popEffects, setPopEffects] = useState<{ x: number, y: number, color: string, id: string }[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const screenshotTaken = useRef(false);

  // Initialize Game
  const initGame = useCallback(() => {
    const newBubbles: Bubble[] = [];
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < COLS; c++) {
        const offset = r % 2 === 0 ? 0 : BUBBLE_RADIUS;
        if (r % 2 !== 0 && c === COLS - 1) continue;
        
        newBubbles.push({
          x: c * BUBBLE_RADIUS * 2 + BUBBLE_RADIUS + offset,
          y: r * BUBBLE_RADIUS * 2 * 0.86 + BUBBLE_RADIUS,
          colorIndex: Math.floor(Math.random() * COLORS.length),
          id: Math.random().toString(36).substring(2, 9)
        });
      }
    }
    setBubbles(newBubbles);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setProjectile(null);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Screenshot Taker
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (containerRef.current && !screenshotTaken.current) {
        try {
          const canvas = await html2canvas(containerRef.current, { 
            scale: 0.5,
            backgroundColor: '#09090b'
          });
          const dataUrl = canvas.toDataURL('image/webp', 0.8);
          window.parent.postMessage({ type: 'save-screenshot', gameId: 'bubble', dataUrl }, '*');
          screenshotTaken.current = true;
        } catch (e) {
          console.error('Screenshot failed', e);
        }
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Handle Input
  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current || gameOver) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const angle = Math.atan2(WALL_HEIGHT - y, x - WALL_WIDTH / 2);
    // Limit angle so it doesn't shoot backwards down
    const safeAngle = Math.max(0.2, Math.min(Math.PI - 0.2, angle));
    setShooterAngle(safeAngle);
  };

  const shoot = () => {
    if (projectile || gameOver || !gameStarted) return;
    
    const speed = 12;
    setProjectile({
      x: WALL_WIDTH / 2,
      y: WALL_HEIGHT - BUBBLE_RADIUS,
      vx: Math.cos(shooterAngle) * speed,
      vy: -Math.abs(Math.sin(shooterAngle) * speed),
      colorIndex: nextColorIndex
    });
    setNextColorIndex(Math.floor(Math.random() * COLORS.length));
  };

  const checkCollision = (p: Projectile, b: Bubble) => {
    const dx = p.x - b.x;
    const dy = p.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) < BUBBLE_RADIUS * 1.8;
  };

  const getNeighbors = (bubble: Bubble, allBubbles: Bubble[]) => {
    return allBubbles.filter(b => {
      if (b.id === bubble.id) return false;
      const dx = b.x - bubble.x;
      const dy = b.y - bubble.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < BUBBLE_RADIUS * 2.2; 
    });
  };

  const findCluster = (start: Bubble, allBubbles: Bubble[]) => {
    const cluster: Bubble[] = [start];
    const queue: Bubble[] = [start];
    const visited = new Set([start.id]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current, allBubbles);
      for (const n of neighbors) {
        if (!visited.has(n.id) && n.colorIndex === start.colorIndex) {
          visited.add(n.id);
          cluster.push(n);
          queue.push(n);
        }
      }
    }
    return cluster;
  };

  const findFloating = (allBubbles: Bubble[]) => {
    const connectedToRoot = new Set<string>();
    // Bubbles at the very top
    const rootBubbles = allBubbles.filter(b => b.y < BUBBLE_RADIUS * 2.5);
    const queue: Bubble[] = [...rootBubbles];
    rootBubbles.forEach(b => connectedToRoot.add(b.id));

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = getNeighbors(current, allBubbles);
      for (const n of neighbors) {
        if (!connectedToRoot.has(n.id)) {
          connectedToRoot.add(n.id);
          queue.push(n);
        }
      }
    }

    return allBubbles.filter(b => !connectedToRoot.has(b.id));
  };

  // Game Logic Update
  useEffect(() => {
    if (!gameStarted || gameOver || !projectile) return;

    const interval = setInterval(() => {
      setProjectile(prev => {
        if (!prev) return null;
        let nx = prev.x + prev.vx;
        let ny = prev.y + prev.vy;
        let nvx = prev.vx;
        let nvy = prev.vy;

        // Side Walls
        if (nx < BUBBLE_RADIUS || nx > WALL_WIDTH - BUBBLE_RADIUS) {
          nvx = -nvx;
          nx = prev.x + nvx;
        }

        // Top Wall or Collision
        let hitPos = null;
        if (ny <= BUBBLE_RADIUS) {
            hitPos = { x: nx, y: BUBBLE_RADIUS };
        } else {
            for (const b of bubbles) {
                if (checkCollision({ ...prev, x: nx, y: ny }, b)) {
                   // Calculate landing spot
                   hitPos = { x: nx, y: ny };
                   break;
                }
            }
        }

        if (hitPos) {
            clearInterval(interval);
            const newBubble: Bubble = {
                x: hitPos.x,
                y: hitPos.y,
                colorIndex: prev.colorIndex,
                id: Math.random().toString(36).substring(2, 9)
            };
            
            const combined = [...bubbles, newBubble];
            const cluster = findCluster(newBubble, combined);

            if (cluster.length >= 3) {
                const clusterIds = new Set(cluster.map(b => b.id));
                let remaining = combined.filter(b => !clusterIds.has(b.id));
                const floating = findFloating(remaining);
                const floatingIds = new Set(floating.map(b => b.id));
                remaining = remaining.filter(b => !floatingIds.has(b.id));
                
                // Add pop effects
                const newPops = [...cluster, ...floating].map(b => ({
                    x: b.x,
                    y: b.y,
                    color: COLORS[b.colorIndex].hex,
                    id: Math.random().toString(36).substring(2, 9)
                }));
                setPopEffects(p => [...p, ...newPops]);
                setTimeout(() => {
                  setPopEffects(prevPops => prevPops.filter(p => !newPops.find(np => np.id === p.id)));
                }, 600);

                setScore(s => s + cluster.length * 10 + floating.length * 20);
                setBubbles(remaining);
            } else {
                setBubbles(combined);
                if (newBubble.y > WALL_HEIGHT - BUBBLE_RADIUS * 4.5) {
                  setGameOver(true);
                }
            }
            return null;
        }

        return { x: nx, y: ny, vx: nvx, vy: nvy, colorIndex: prev.colorIndex };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [projectile, bubbles, gameStarted, gameOver]);

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, WALL_WIDTH, WALL_HEIGHT);

      // Grid Background
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for(let i=0; i<WALL_WIDTH; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, WALL_HEIGHT); ctx.stroke();
      }
      for(let i=0; i<WALL_HEIGHT; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WALL_WIDTH, i); ctx.stroke();
      }

      // Draw Bubbles
      bubbles.forEach(b => {
        const color = COLORS[b.colorIndex];
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        
        // Gradient for depth
        const grad = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, BUBBLE_RADIUS);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, color.hex);
        grad.addColorStop(1, '#000');
        
        ctx.fillStyle = grad;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color.glow;
        ctx.fill();
        ctx.restore();
      });

      // Draw Projectile
      if (projectile) {
        const color = COLORS[projectile.colorIndex];
        ctx.save();
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, BUBBLE_RADIUS - 1, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(projectile.x - 5, projectile.y - 5, 2, projectile.x, projectile.y, BUBBLE_RADIUS);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, color.hex);
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color.glow;
        ctx.fill();
        ctx.restore();
      }

      // Draw Shooter & Guide
      ctx.save();
      const shooterX = WALL_WIDTH / 2;
      const shooterY = WALL_HEIGHT - BUBBLE_RADIUS * 1.5;
      
      // Guide Line
      ctx.beginPath();
      ctx.setLineDash([5, 8]);
      ctx.moveTo(shooterX, shooterY);
      ctx.lineTo(shooterX + Math.cos(shooterAngle) * 120, shooterY - Math.sin(shooterAngle) * 120);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();

      // Shooter Body
      ctx.translate(shooterX, shooterY);
      ctx.rotate(-shooterAngle + Math.PI/2);
      
      // Launcher base
      ctx.beginPath();
      ctx.arc(0, 0, BUBBLE_RADIUS + 8, Math.PI, 0);
      ctx.fillStyle = '#18181b';
      ctx.fill();
      ctx.strokeStyle = '#27272a';
      ctx.stroke();

      // Current Bubble in Launcher
      if (!projectile) {
        const color = COLORS[nextColorIndex];
        const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, BUBBLE_RADIUS);
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.2, color.hex);
        grad.addColorStop(1, '#000');
        ctx.beginPath();
        ctx.arc(0, 0, BUBBLE_RADIUS - 2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
      ctx.restore();
    };

    const animReq = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animReq);
  }, [bubbles, projectile, shooterAngle, nextColorIndex]);

  return (
    <div ref={containerRef} className="flex flex-col items-center min-h-screen bg-zinc-950 text-white font-sans overflow-hidden select-none">
       {/* HUD */}
       <div className="w-full max-w-[440px] flex items-center justify-between px-6 py-4 bg-zinc-900/80 backdrop-blur-md border-b border-white/5 z-10">
          <div className="flex items-center space-x-6">
             <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-0.5">SCORE</span>
                <motion.span 
                  key={score}
                  initial={{ scale: 1.2, color: '#10b981' }}
                  animate={{ scale: 1, color: '#10b981' }}
                  className="text-xl font-mono font-black tracking-tighter"
                >
                  {score.toLocaleString()}
                </motion.span>
             </div>
          </div>
          <div className="flex items-center space-x-3">
             <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 flex items-center space-x-2">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest text-[8px]">NEXT</div>
                <div 
                  className="w-4 h-4 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                  style={{ backgroundColor: COLORS[nextColorIndex].hex }}
                />
             </div>
             <button 
                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                onClick={() => window.parent.postMessage('close-game', '*')}
              >
                 <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
          </div>
       </div>

       {/* Game Canvas Container */}
       <div 
         className="mt-8 relative bg-zinc-900/20 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden group"
         style={{ width: WALL_WIDTH, height: WALL_HEIGHT }}
         onMouseMove={handleMouseMove}
         onTouchMove={handleMouseMove}
         onClick={shoot}
       >
          <canvas 
            ref={canvasRef} 
            width={WALL_WIDTH} 
            height={WALL_HEIGHT}
            className="block"
          />

          {/* Particles & Pop Effects */}
          <AnimatePresence>
            {popEffects.map(pop => (
              <motion.div
                key={pop.id}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none rounded-full"
                style={{ 
                  left: pop.x - BUBBLE_RADIUS, 
                  top: pop.y - BUBBLE_RADIUS, 
                  width: BUBBLE_RADIUS * 2, 
                  height: BUBBLE_RADIUS * 2,
                  backgroundColor: pop.color,
                  boxShadow: `0 0 20px ${pop.color}`
                }}
              />
            ))}
          </AnimatePresence>

          {gameOver && (
             <motion.div 
               initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
               animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
               className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center z-30"
             >
                <Trophy className="w-20 h-20 text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
                <h2 className="text-5xl font-black mb-2 tracking-tighter text-white uppercase italic">GAME OVER</h2>
                <div className="text-4xl font-mono font-black mb-10 text-emerald-400">{score.toLocaleString()}</div>
                <button 
                  onClick={initGame}
                  className="group flex items-center space-x-3 px-10 py-5 bg-white text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] shadow-white/10"
                >
                  <RotateCcw className="w-6 h-6 group-hover:rotate-[-45deg] transition-transform" />
                  <span className="text-lg">REPLAY</span>
                </button>
             </motion.div>
          )}

          {/* Floating Instructions */}
          {!gameOver && score === 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute bottom-24 left-0 right-0 flex flex-col items-center pointer-events-none"
             >
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center space-x-3">
                   <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Match 3 to burst</span>
                </div>
             </motion.div>
          )}
       </div>

       {/* Footer */}
       <div className="mt-8 text-zinc-500 text-[9px] font-bold uppercase tracking-[0.4em] flex items-center space-x-3 opacity-50">
          <span>Targeting</span>
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <span>Tap to Fire</span>
       </div>
    </div>
  );
};

export default BubbleShooterApp;

