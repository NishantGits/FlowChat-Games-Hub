/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { useStore } from './store';
import { GameStatus } from './types';

// Dynamic Camera Controller
const CameraController = () => {
  const { camera, size } = useThree();
  const { laneCount } = useStore();
  
  useFrame((state, delta) => {
    if (useStore.getState().status === GameStatus.PAUSED) return;
    
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2; // Threshold for "mobile-like" narrowness or square-ish displays

    // Calculate expansion factors
    // Mobile requires backing up significantly more because vertical FOV is fixed in Three.js,
    // meaning horizontal view shrinks as aspect ratio drops.
    // We use more aggressive multipliers for mobile to keep outer lanes in frame.
    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    // Base (3 lanes): y=5.5, z=8
    // Calculate target based on how many extra lanes we have relative to the start
    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Look further down the track to see the end of lanes
    // Adjust look target slightly based on height to maintain angle
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

// Screenshot Taker for 3D Canvas
const ScreenshotTaker = () => {
    const { gl } = useThree();
    const status = useStore((state) => state.status);
    const screenshotTaken = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!screenshotTaken.current) {
                try {
                    const dataUrl = gl.domElement.toDataURL('image/webp', 0.8);
                    window.parent.postMessage({ type: 'save-screenshot', gameId: 'runner', dataUrl }, '*');
                    screenshotTaken.current = true;
                } catch (e) {
                    console.error('3D Screenshot failed', e);
                }
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [gl]);

    return null;
};

function Scene() {
  return (
    <>
        <ScreenshotTaker />
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <Canvas
        shadows
        dpr={[1, 1.5]} 
        gl={{ 
          antialias: false, 
          stencil: false, 
          depth: true, 
          powerPreference: "high-performance",
          preserveDrawingBuffer: true 
        }}
        // Initial camera, matches the controller base
        camera={{ position: [0, 5.5, 8], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
