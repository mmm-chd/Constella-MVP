import React, { useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetStage } from '@/src/types';
import { Sparkles, Wind, Droplets, Flame } from 'lucide-react';

interface PlanetProps {
  stage: PlanetStage;
  emotion?: string;
  intensity?: number;
}

const PlanetBody: React.FC<{ stage: PlanetStage; emotion?: string; intensity?: number; colors: any }> = ({ stage, emotion, intensity, colors }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const glowMesh = useRef<THREE.Mesh>(null!);
  const cloudsMesh = useRef<THREE.Mesh>(null!);
  const terrainMesh = useRef<THREE.Mesh>(null!);
  const bandsMesh = useRef<THREE.Mesh>(null!);
  const meshMaterial = useRef<any>(null!);
  const cloudsMaterial = useRef<any>(null!);
  const lavaMesh = useRef<THREE.Mesh>(null!);
  
  const lastStage = useRef(stage);
  const evolutionTime = useRef(0);
  
  useEffect(() => {
    if (stage !== lastStage.current) {
      evolutionTime.current = 1.0;
      lastStage.current = stage;
    }
  }, [stage]);

  const features = useMemo(() => {
    // Generate static topographical features based on stage
    const count = 15;
    return [...Array(count)].map((_, i) => ({
      position: [
        Math.sin(i * 2.5) * 2.1,
        Math.cos(i * 1.8) * 2.1,
        Math.sin(i * 4.2) * 2.1
      ] as [number, number, number],
      scale: 0.15 + Math.random() * 0.35,
      type: i % 3 === 0 ? 'mountain' : 'crater',
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number]
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const emotionFactor = emotion ? 1.5 : 1;
    const normalizedIntensity = (intensity || 5) / 10;
    
    // Evolution pulse logic
    if (evolutionTime.current > 0) {
      evolutionTime.current -= 0.012; // Complete in ~1.4s
    }
    const pulse = evolutionTime.current > 0 ? evolutionTime.current : 0;
    const pulseEase = Math.sin(pulse * Math.PI);
    
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.1;
      mesh.current.rotation.z = Math.sin(t * 0.2) * 0.05;
      mesh.current.scale.setScalar(1 + pulseEase * 0.15);
    }
    
    if (lavaMesh.current) {
      lavaMesh.current.rotation.y = t * 0.15;
      lavaMesh.current.scale.setScalar(1.005 + Math.sin(t * 2) * 0.005);
    }
    
    if (glowMesh.current) {
      glowMesh.current.scale.setScalar((1.05 + Math.sin(t * 1.5) * 0.02) * (1 + pulseEase * 0.3));
    }

    if (cloudsMesh.current) {
      cloudsMesh.current.rotation.y = t * 0.12 * emotionFactor;
      cloudsMesh.current.rotation.x = Math.sin(t * 0.08) * 0.1;
      cloudsMesh.current.scale.setScalar(1.08 + pulseEase * 0.2 + Math.sin(t * 0.5) * 0.01);
    }

    if (terrainMesh.current) {
      terrainMesh.current.rotation.y = -t * 0.05;
      terrainMesh.current.scale.setScalar(1.03 + pulseEase * 0.1);
    }

    if (bandsMesh.current) {
      bandsMesh.current.rotation.y = t * 0.08;
    }

    if (meshMaterial.current) {
      if (meshMaterial.current.distort !== undefined) {
        meshMaterial.current.distort = (stage === PlanetStage.MAGMA ? 0.4 : 0.1) + pulseEase * 0.4 + normalizedIntensity * 0.1;
      }
      if (meshMaterial.current.emissiveIntensity !== undefined) {
        // Lava flow simulation via emissive intensity pulsing
        const lavaPulse = stage === PlanetStage.MAGMA ? 0.8 + Math.sin(t * 3) * 0.4 : 0;
        meshMaterial.current.emissiveIntensity = lavaPulse + pulseEase * 2 + normalizedIntensity * 0.5;
      }
    }

    if (cloudsMaterial.current && cloudsMaterial.current.distort !== undefined) {
      cloudsMaterial.current.distort = 0.3 + pulseEase * 0.5 + Math.sin(t * 0.2) * 0.1;
    }
  });

  const isBandedEmotion = ['sad', 'sedih', 'love', 'cinta', 'surprised', 'terkejut', 'happy', 'bahagia'].includes(emotion?.toLowerCase() || '');

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group>
        {/* Atmosphere/Glow Layer */}
        <mesh ref={glowMesh} scale={1.2}>
          <sphereGeometry args={[2.2, 32, 32]} />
          <meshBasicMaterial 
            color={colors.glow} 
            transparent 
            opacity={0.08} 
            side={THREE.BackSide} 
          />
        </mesh>

        {/* Main Body */}
        <mesh ref={mesh}>
          <sphereGeometry args={[2.2, 64, 64]} />
          {stage === PlanetStage.ASTEROID ? (
             <meshStandardMaterial 
              ref={meshMaterial}
              color={colors.main}
              roughness={1}
              metalness={0.2}
              flatShading
            />
          ) : (
            <MeshDistortMaterial
              ref={meshMaterial}
              color={colors.main}
              speed={stage === PlanetStage.MAGMA ? 3 : 1.2}
              distort={stage === PlanetStage.MAGMA ? 0.4 : 0.1}
              radius={1}
              roughness={0.6}
              metalness={0.1}
              emissive={stage === PlanetStage.MAGMA ? colors.accent : "#000000"}
              emissiveIntensity={stage === PlanetStage.MAGMA ? 0.8 : 0}
            />
          )}
        </mesh>

        {/* Bands/Stripes Layer - For "Love", "Surprised", "Sad", "Happy" */}
        {isBandedEmotion && (
          <mesh ref={bandsMesh} scale={1.01}>
            <sphereGeometry args={[2.22, 64, 32]} />
            <meshStandardMaterial 
              color={colors.bands} 
              transparent 
              opacity={0.4} 
              wireframe 
              wireframeLinewidth={2}
            />
          </mesh>
        )}

        {/* Terrain Layer - Craters/Details */}
        {(stage === PlanetStage.ASTEROID || stage === PlanetStage.LIVING || stage === PlanetStage.ASCENDED) && (
          <mesh ref={terrainMesh} scale={1.03}>
            <sphereGeometry args={[2.2, 48, 48]} />
            <meshStandardMaterial 
              color={colors.accent} 
              transparent 
              opacity={stage === PlanetStage.ASTEROID ? 0.8 : 0.4} 
              wireframe={stage === PlanetStage.ASTEROID}
              roughness={1}
              metalness={0}
            />
          </mesh>
        )}

        {/* Lava Flow Layer (Magma Stage Only) */}
        {stage === PlanetStage.MAGMA && (
          <mesh ref={lavaMesh} scale={1.01}>
            <sphereGeometry args={[2.21, 64, 64]} />
            <meshStandardMaterial 
              color={colors.accent} 
              emissive={colors.accent}
              emissiveIntensity={1.5}
              transparent
              opacity={0.6}
              wireframe
            />
          </mesh>
        )}

        {/* Topographical Features (Mountains & Craters) */}
        {(stage === PlanetStage.LIVING || stage === PlanetStage.ASCENDED || stage === PlanetStage.ASTEROID) && (
          <group>
            {features.map((feature, i) => (
              <mesh 
                key={i} 
                position={feature.position} 
                scale={feature.scale}
                rotation={feature.rotation}
              >
                {feature.type === 'mountain' ? (
                  <coneGeometry args={[1, 1.5, 8]} />
                ) : (
                  <sphereGeometry args={[1, 16, 16]} />
                )}
                <meshStandardMaterial 
                  color={colors.accent} 
                  transparent 
                  opacity={stage === PlanetStage.ASTEROID ? 0.9 : 0.5} 
                  roughness={1}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* Atmospheric/Cloud Layer - Selective based on emotion/stage */}
        {(stage === PlanetStage.LIVING || stage === PlanetStage.ASCENDED || stage === PlanetStage.MAGMA) && (
          <mesh ref={cloudsMesh} scale={1.08}>
            <sphereGeometry args={[2.2, 64, 64]} />
            <MeshDistortMaterial
              ref={cloudsMaterial}
              color={colors.atmospheric}
              transparent
              opacity={stage === PlanetStage.MAGMA ? 0.15 : 0.3}
              speed={stage === PlanetStage.MAGMA ? 5 : 1.5}
              distort={0.3}
              radius={1}
              roughness={0.1}
              metalness={0}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

const Sparkle: React.FC<{ delay: number; x: string; y: string }> = ({ delay, x, y }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: delay,
      ease: "easeInOut"
    }}
    className="absolute w-1.5 h-1.5 bg-white rounded-full blur-[1px]"
    style={{ left: x, top: y }}
  />
);

const Cloud: React.FC<{ delay: number; x: string; y: string; color?: string }> = ({ delay, x, y, color = "bg-white/30" }) => (
  <motion.div
    animate={{ x: [0, 20, 0] }}
    transition={{ duration: 15, repeat: Infinity, delay }}
    className={`absolute ${color} rounded-full blur-md h-4 w-12`}
    style={{ left: x, top: y }}
  />
);

const EmotionWeather: React.FC<{ emotion: string }> = ({ emotion }) => {
  const e = emotion.toLowerCase();
  
  if (e.includes('happy') || e.includes('bahagia') || e.includes('senang') || e.includes('excited') || e.includes('semangat')) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <Sparkle delay={0} x="20%" y="30%" />
        <Sparkle delay={0.5} x="70%" y="20%" />
        <Sparkle delay={1.2} x="40%" y="60%" />
        <Sparkle delay={1.8} x="80%" y="70%" />
        <Sparkle delay={2.5} x="10%" y="80%" />
        {e.includes('excited') && (
          <motion.div 
            animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-yellow-400/10 blur-3xl"
          />
        )}
      </div>
    );
  }

  if (e.includes('sad') || e.includes('sedih') || e.includes('kesepian')) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px]" />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
            className="absolute w-[1px] h-8 bg-blue-300/40"
            style={{ left: `${10 + i * 12}%`, top: '-30px' }}
          />
        ))}
      </div>
    );
  }

  if (e.includes('angry') || e.includes('marah') || e.includes('kesal')) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.1, 0.5, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/30"
        />
        <div className="absolute inset-0 mix-blend-overlay opacity-50">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d="M10,20 Q30,50 10,80 M60,10 Q80,40 50,70" fill="none" stroke="#FF4D4D" strokeWidth="3" strokeDasharray="5 5" />
          </svg>
        </div>
      </div>
    );
  }

  if (e.includes('love') || e.includes('cinta') || e.includes('sayang') || e.includes('affection')) {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="w-full h-full bg-pink-400/20 rounded-full blur-2xl"
        />
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: -60, opacity: [0, 1, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: i * 1 }}
            className="absolute text-pink-400/60 text-sm"
            style={{ left: `${20 + i * 15}%` }}
          >
            ♥
          </motion.div>
        ))}
      </div>
    );
  }

  if (e.includes('fear') || e.includes('takut') || e.includes('anxious') || e.includes('khawatir')) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.1, repeat: Infinity, repeatDelay: Math.random() * 4 }}
          className="absolute inset-0 bg-white"
        />
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px]" />
      </div>
    );
  }

  if (e.includes('calm') || e.includes('tenang') || e.includes('peaceful') || e.includes('damai')) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ 
            background: [
              "radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 70%)",
              "radial-gradient(circle at 60% 40%, rgba(52, 211, 153, 0.2) 0%, transparent 70%)",
              "radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 70%)",
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>
    );
  }

  if (e.includes('grateful') || e.includes('bersyukur') || e.includes('touched') || e.includes('tersentuh')) {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-cyan-400/10 blur-3xl"
        />
      </div>
    );
  }

  return null;
};

const PlanetFace: React.FC<{ emotion?: string; color?: string }> = ({ emotion, color = "rgba(0,0,0,0.5)" }) => {
  const e = emotion?.toLowerCase() || 'neutral';
  
  const renderFace = () => {
    // Excited / Very Happy
    if (e.includes('excited') || e.includes('semangat') || e.includes('senang sekali')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-12 mb-2">
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-3xl font-black" style={{ color }}>O</motion.div>
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.1 }} className="text-3xl font-black" style={{ color }}>O</motion.div>
          </div>
          <motion.div 
            animate={{ width: [40, 60, 40], height: [20, 30, 20] }} 
            transition={{ duration: 0.8, repeat: Infinity }}
            className="border-b-[5px] rounded-full" style={{ borderColor: color, width: 40, height: 20 }} 
          />
        </div>
      );
    }
    
    if (e.includes('happy') || e.includes('bahagia') || e.includes('senang')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-10 mb-2">
            <motion.div 
              animate={{ 
                scaleY: [1, 0.4, 1, 1], // Blink
                scaleX: [1, 1.2, 1, 1], // Widen
                y: [0, -1, 0]
              }} 
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                times: [0, 0.05, 0.1, 1],
                delay: Math.random() 
              }} 
              className="text-2xl font-black" 
              style={{ color }}
            >
              ^
            </motion.div>
            <motion.div 
              animate={{ 
                scaleY: [1, 0.4, 1, 1], 
                scaleX: [1, 1.2, 1, 1],
                y: [0, -1, 0]
              }} 
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                times: [0, 0.05, 0.1, 1], 
                delay: 0.1 + Math.random() 
              }} 
              className="text-2xl font-black" 
              style={{ color }}
            >
              ^
            </motion.div>
          </div>
          <motion.div 
            animate={{ 
              scaleX: [1, 1.1, 1],
              scaleY: [1, 1.05, 1],
              y: [0, 2, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-8 border-b-[4px] rounded-full" 
            style={{ borderColor: color }} 
          />
        </div>
      );
    }
    
    if (e.includes('sad') || e.includes('sedih') || e.includes('lonely') || e.includes('kesepian')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-8 mb-4">
            <motion.div 
              animate={{ 
                rotate: [15, 12, 18, 15],
                y: [0, 0.5, -0.5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-2 rounded-full opacity-80" 
              style={{ backgroundColor: color }} 
            />
            <motion.div 
              animate={{ 
                rotate: [-15, -12, -18, -15],
                y: [0, 0.5, -0.5, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="w-5 h-2 rounded-full opacity-80" 
              style={{ backgroundColor: color }} 
            />
          </div>
          <motion.div 
            animate={{ 
              y: [0, 4, 0],
              scaleX: [1, 0.9, 1.1, 1],
              height: [24, 28, 24]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-6 border-t-[4px] rounded-full mt-2 opacity-80" 
            style={{ borderColor: color }} 
          />
          <motion.div 
            animate={{ 
              y: [0, 40], 
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
              x: [-2, 2, -1, 1, 0]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeIn" }}
            className="w-1.5 h-1.5 bg-blue-400 absolute mt-14 mr-10 rounded-full blur-[0.5px]"
          />
        </div>
      );
    }
    
    if (e.includes('love') || e.includes('cinta') || e.includes('sayang')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-10 mb-2">
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 5, -5, 0]
              }} 
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} 
              className="text-3xl" style={{ color: '#ec4899' }}
            >
              ♥
            </motion.div>
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -5, 5, 0]
              }} 
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} 
              className="text-3xl" style={{ color: '#ec4899' }}
            >
              ♥
            </motion.div>
          </div>
          <motion.div 
            animate={{ scaleX: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-7 border-b-[4px] rounded-full" 
            style={{ borderColor: color }} 
          />
        </div>
      );
    }
    
    if (e.includes('angry') || e.includes('marah') || e.includes('kesal')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-8 mb-2">
            <motion.div 
              animate={{ rotate: [30, 35, 30], y: [0, -1, 0] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 1 }}
              className="w-7 h-2 rounded-full" 
              style={{ backgroundColor: color }} 
            />
            <motion.div 
              animate={{ rotate: [-30, -35, -30], y: [0, -1, 0] }}
              transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 1 }}
              className="w-7 h-2 rounded-full" 
              style={{ backgroundColor: color }} 
            />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.05, 1], x: [-0.3, 0.3, -0.3] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="w-14 h-4 rounded-full mt-4" style={{ backgroundColor: color }} 
          />
        </div>
      );
    }
    
    if (e.includes('calm') || e.includes('tenang') || e.includes('damai')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-12 mb-6">
            <motion.div 
              animate={{ width: [32, 28, 32] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-[2px] opacity-60" 
              style={{ backgroundColor: color, width: 32 }} 
            />
            <motion.div 
              animate={{ width: [32, 28, 32] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="h-[2px] opacity-60" 
              style={{ backgroundColor: color, width: 32 }} 
            />
          </div>
          <motion.div 
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="w-12 h-[2px]" 
            style={{ backgroundColor: color }} 
          />
        </div>
      );
    }
    
    if (e.includes('shocked') || e.includes('terkejut') || e.includes('kaget') || e.includes('surprised')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-10 mb-4">
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-6 h-6 rounded-full border-[2px]" 
              style={{ borderColor: color }} 
            />
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="w-6 h-6 rounded-full border-[2px]" 
              style={{ borderColor: color }} 
            />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-10 h-10 border-[3px] rounded-full" 
            style={{ borderColor: color }} 
          />
        </div>
      );
    }

    if (e.includes('anxious') || e.includes('khawatir') || e.includes('takut') || e.includes('fear')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <motion.div 
            animate={{ 
              x: [-1, 1, -1, 1, 0],
              y: [-0.5, 0.5, 0]
            }} 
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1 }} 
            className="flex flex-col items-center"
          >
            <div className="flex gap-10 mb-4">
              <motion.div 
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
                className="w-3 h-5 rounded-full" style={{ backgroundColor: color }} 
              />
              <motion.div 
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2.1 }}
                className="w-3 h-5 rounded-full" style={{ backgroundColor: color }} 
              />
            </div>
            <motion.div 
              animate={{ width: [48, 52, 48] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="h-3 bg-white/20 border-t-[2px] border-black/40 rounded-sm" 
              style={{ width: 48 }}
            />
          </motion.div>
        </div>
      );
    }

    if (e.includes('grateful') || e.includes('bersyukur') || e.includes('tersentuh') || e.includes('touched')) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="flex gap-10 mb-2">
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-4 h-4 rounded-full relative" 
              style={{ backgroundColor: color }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full blur-[2px]" />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="w-4 h-4 rounded-full relative" 
              style={{ backgroundColor: color }}
            >
              <div className="absolute inset-0 bg-white/30 rounded-full blur-[2px]" />
            </motion.div>
          </div>
          <motion.div 
            animate={{ 
              scaleX: [1, 1.05, 1],
              y: [0, 1, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-7 border-b-[3px] rounded-full" 
            style={{ borderColor: color }} 
          />
        </div>
      );
    }

    // Default / Neutral face (as requested, a moon face)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="flex gap-12 mb-8">
          <motion.div 
            animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" 
            style={{ backgroundColor: color }} 
          />
          <motion.div 
            animate={{ scale: [1, 0.9, 1], opacity: [0.3, 0.4, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="w-3 h-3 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]" 
            style={{ backgroundColor: color }} 
          />
        </div>
        <motion.div 
          animate={{ width: [56, 50, 56], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="h-[2px]" 
          style={{ backgroundColor: color, width: 56 }} 
        />
      </div>
    );
  };

  return renderFace();
};

export const Planet: React.FC<PlanetProps> = ({ stage, emotion, intensity = 5 }) => {
  const colors = useMemo(() => {
    switch (stage) {
      case PlanetStage.ASTEROID: return { main: "#5C6B8A", accent: "#3D4D6A", glow: "#7A8BAE", atmospheric: "#4A5568", bands: "#3D4D6A" };
      case PlanetStage.MAGMA: return { main: "#1A1A1A", accent: "#FF4D4D", glow: "#FF6B35", atmospheric: "#FF4D4D", bands: "#FF6B35" };
      case PlanetStage.OCEAN: return { main: "#1E3A8A", accent: "#3B82F6", glow: "#60A5FA", atmospheric: "#93C5FD", bands: "#3B82F6" };
      case PlanetStage.LIVING:
      case PlanetStage.ASCENDED:
        const e = emotion?.toLowerCase() || 'neutral';
        if (e.includes('happy') || e.includes('bahagia') || e.includes('senang') || e.includes('excited')) 
          return { main: "#FDBA74", accent: "#F97316", glow: "#FCD34D", atmospheric: "#FEF08A", bands: "#FFF7ED", faceColor: "#F59E0B" };
        if (e.includes('sad') || e.includes('sedih') || e.includes('lonely') || e.includes('melancholy') || e.includes('kesepian')) 
          return { main: "#334155", accent: "#475569", glow: "#60A5FA", atmospheric: "#E2E8F0", bands: "#F8FAFC", faceColor: "#94A3B8" };
        if (e.includes('love') || e.includes('cinta') || e.includes('affection') || e.includes('sayang')) 
          return { main: "#FDA4AF", accent: "#E11D48", glow: "#F472B6", atmospheric: "#FFE4E6", bands: "#FFF1F2", faceColor: "#ec4899" };
        if (e.includes('angry') || e.includes('marah') || e.includes('frustrated') || e.includes('kesal')) 
          return { main: "#450A0A", accent: "#991B1B", glow: "#EF4444", atmospheric: "#EF4444", bands: "#F87171", faceColor: "#DC2626" };
        if (e.includes('surprised') || e.includes('terkejut') || e.includes('shocked') || e.includes('kaget')) 
          return { main: "#06B6D4", accent: "#0891B2", glow: "#C084FC", atmospheric: "#D1FAE5", bands: "#A21CAF", faceColor: "#8B5CF6" };
        if (e.includes('fear') || e.includes('takut') || e.includes('scared') || e.includes('anxious') || e.includes('khawatir')) 
          return { main: "#1E1B4B", accent: "#312E81", glow: "#4F46E5", atmospheric: "#C7D2FE", bands: "#0F172A", faceColor: "#6366F1" };
        if (e.includes('touched') || e.includes('tersentuh') || e.includes('grateful') || e.includes('bersyukur')) 
          return { main: "#AED9E0", accent: "#76B4BD", glow: "#2DD4BF", atmospheric: "#B2DFDB", bands: "#E0F2F1", faceColor: "#14B8A6" };
        if (e.includes('disappointed') || e.includes('kecewa')) 
          return { main: "#B8A8C8", accent: "#8B7BAE", glow: "#F3E5F5", atmospheric: "#E1BEE7", bands: "#F3E5F5", faceColor: "rgba(0,0,0,0.6)" };
        if (e.includes('calm') || e.includes('tenang') || e.includes('peaceful') || e.includes('damai')) 
          return { main: "#D1FAE5", accent: "#10B981", glow: "#34D399", atmospheric: "#A7F3D0", bands: "#D1FAE5", faceColor: "#10B981" };
        
        return { main: "#F0EDE8", accent: "#D9D5CF", glow: "#ffffff", atmospheric: "#F3F4F6", bands: "#F8FAFC", faceColor: "rgba(0,0,0,0.5)" };
      default: return { main: "#ffffff", accent: "#cccccc", glow: "#ffffff", atmospheric: "#ffffff", bands: "#ffffff" };
    }
  }, [stage, emotion]);

  const getPlanetStyles = () => {
    switch (stage) {
      case PlanetStage.EMPTY:
        return {
          className: "w-32 h-32 blur-3xl bg-blue-500/10 opacity-20",
          label: "Void",
          borderRadius: "50%"
        };
      case PlanetStage.ASTEROID:
        return {
          className: "w-44 h-44 bg-[#5C6B8A] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.5)]",
          label: "Stellar Seed",
          texture: "radial-gradient(circle at 30% 30%, #7A8BAE 0%, #5C6B8A 100%)",
          borderRadius: "45% 55% 65% 35% / 45% 45% 55% 55%"
        };
      case PlanetStage.MAGMA:
        return {
          className: "w-56 h-56 bg-[#3D3D4A] shadow-[0_0_40px_rgba(255,107,53,0.3),inset_-15px_-15px_30px_rgba(0,0,0,0.6)]",
          label: "Igneous Core",
          texture: "radial-gradient(circle at 35% 35%, #4D4D5A 0%, #3D3D4A 100%)",
          borderRadius: "48% 52% 52% 48% / 50% 50% 50% 50%"
        };
      case PlanetStage.OCEAN:
        return {
          className: "w-64 h-64 bg-[#2B5EA7] shadow-[inset_-20px_-20px_40px_rgba(0,0,0,0.4)]",
          label: "Oceanic World",
          texture: "radial-gradient(circle at 30% 30%, #3B6EB7 0%, #2B5EA7 100%)",
          borderRadius: "50% 50% 50% 50% / 52% 48% 52% 48%"
        };
      case PlanetStage.LIVING:
      case PlanetStage.ASCENDED:
        const emotionData: Record<string, { texture: string, label: string }> = {
          happy: { texture: "radial-gradient(circle at 30% 30%, #FFE066 0%, #FFB347 100%)", label: "Happy Moon" },
          bahagia: { texture: "radial-gradient(circle at 30% 30%, #FFE066 0%, #FFB347 100%)", label: "Bulan Bahagia" },
          sad: { texture: "radial-gradient(circle at 30% 30%, #A8B8D0 0%, #7A8BA8 100%)", label: "Sad Moon" },
          sedih: { texture: "radial-gradient(circle at 30% 30%, #A8B8D0 0%, #7A8BA8 100%)", label: "Bulan Sedih" },
          love: { texture: "radial-gradient(circle at 30% 30%, #FFB7C5 0%, #FF8FA3 100%)", label: "Lovely Moon" },
          cinta: { texture: "radial-gradient(circle at 30% 30%, #FFB7C5 0%, #FF8FA3 100%)", label: "Bulan Penuh Cinta" },
          angry: { texture: "radial-gradient(circle at 30% 30%, #C0392B 0%, #922B21 100%)", label: "Angry Moon" },
          marah: { texture: "radial-gradient(circle at 30% 30%, #C0392B 0%, #922B21 100%)", label: "Bulan Marah" },
          fear: { texture: "radial-gradient(circle at 30% 30%, #2D3436 0%, #000000 100%)", label: "Moon of Fear" },
          takut: { texture: "radial-gradient(circle at 30% 30%, #2D3436 0%, #000000 100%)", label: "Bulan Ketakutan" },
          neutral: { texture: "radial-gradient(circle at 30% 30%, #F0EDE8 0%, #D9D5CF 100%)", label: "Silent Moon" },
        };
        const curE = emotion?.toLowerCase() || 'neutral';
        const match = Object.keys(emotionData).find(key => curE.includes(key)) || 'neutral';
        const data = emotionData[match];
        
        return {
          className: `w-72 h-72 shadow-[0_0_60px_rgba(255,255,255,0.1),inset_-25px_-25px_50px_rgba(0,0,0,0.2)]`,
          label: `${data.label}`,
          texture: data.texture,
          borderRadius: "50% 50% 50% 50% / 51% 49% 51% 49%"
        };
      default:
        return { className: "", label: "", borderRadius: "50%" };
    }
  };

  const config = getPlanetStyles();

  return (
    <div className="relative flex items-center justify-center p-20 w-[400px] h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          {stage !== PlanetStage.EMPTY && (
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
              <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#3B82F6" />
              
              <PlanetBody stage={stage} emotion={emotion} intensity={intensity} colors={colors} />
              
              <fog attach="fog" args={['#050B18', 5, 20]} />
            </Canvas>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Expressive Overlays (Atmospheric Layers) */}
      <div className={`relative ${config.className.split(' ').filter(c => c.startsWith('w-') || c.startsWith('h-')).join(' ')} pointer-events-none z-10 overflow-hidden`}>
        {/* Emotional Weather Effects Overlay */}
        <EmotionWeather emotion={emotion || 'neutral'} />

        {/* Face Layer */}
        {(stage === PlanetStage.LIVING || stage === PlanetStage.ASCENDED) && (
          <PlanetFace emotion={emotion} color={colors.faceColor as string} />
        )}
        
        {/* Ambient Overlay Glow */}
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${
            emotion?.toLowerCase() === 'angry' ? 'bg-red-500/20' : 
            emotion?.toLowerCase() === 'happy' ? 'bg-yellow-400/10' :
            emotion?.toLowerCase() === 'love' ? 'bg-pink-400/10' : 'bg-blue-400/5'
          }`}
        />
      </div>

      <div className="absolute -bottom-6 text-blue-200/30 font-mono text-[9px] tracking-[0.5em] uppercase font-bold text-center w-full">
        {config.label}
      </div>
    </div>
  );
};

