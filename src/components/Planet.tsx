import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlanetStage } from '@/src/types';

interface PlanetProps {
  stage: PlanetStage;
  emotion?: string;
  intensity?: number;
}

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
  
  if (e === 'happy') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <Sparkle delay={0} x="20%" y="30%" />
        <Sparkle delay={0.5} x="70%" y="20%" />
        <Sparkle delay={1.2} x="40%" y="60%" />
        <Sparkle delay={1.8} x="80%" y="70%" />
        <Sparkle delay={2.5} x="10%" y="80%" />
      </div>
    );
  }

  if (e === 'sad') {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-[1px]" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 100] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: "linear" }}
            className="absolute w-[1px] h-6 bg-blue-300/30"
            style={{ left: `${15 + i * 15}%`, top: '-24px' }}
          />
        ))}
      </div>
    );
  }

  if (e === 'angry') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-600/20"
        />
        <div className="absolute inset-0 mix-blend-overlay opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <path d="M10,20 Q30,50 10,80 M60,10 Q80,40 50,70" fill="none" stroke="#FF4D4D" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
      </div>
    );
  }

  if (e === 'love') {
    return (
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-full h-full bg-pink-400/10 rounded-full blur-xl"
        />
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: -40, opacity: [0, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.3 }}
            className="absolute text-pink-400/40 text-xs"
            style={{ left: `${30 + i * 20}%` }}
          >
            ♥
          </motion.div>
        ))}
      </div>
    );
  }

  return null;
};

const PlanetFace: React.FC<{ emotion?: string }> = ({ emotion }) => {
  if (!emotion || emotion === 'neutral') {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex gap-6 mb-4">
          <div className="w-2 h-2 bg-black/50 rounded-full" />
          <div className="w-2 h-2 bg-black/50 rounded-full" />
        </div>
        <div className="absolute top-[60%] w-8 h-[1px] bg-black/30" />
      </div>
    );
  }

  const renderFace = () => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-8 mb-2">
              <div className="text-black/60 text-2xl font-black">^</div>
              <div className="text-black/60 text-2xl font-black">^</div>
            </div>
            <div className="w-12 h-6 border-b-[3px] border-black/60 rounded-full" />
          </div>
        );
      case 'sad':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-6 mb-3 opacity-70">
              <div className="w-3 h-1.5 bg-black rounded-full rotate-[20deg]" />
              <div className="w-3 h-1.5 bg-black rounded-full -rotate-[20deg]" />
            </div>
            <div className="w-8 h-4 border-t-[3px] border-black/60 rounded-full mt-3" />
          </div>
        );
      case 'love':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-8 mb-2">
              <div className="text-red-500/80 text-xl animate-pulse">♥</div>
              <div className="text-red-500/80 text-xl animate-pulse">♥</div>
            </div>
            <div className="w-14 h-7 border-b-[3px] border-black/40 rounded-full" />
          </div>
        );
      case 'angry':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-6 mb-2">
              <div className="w-4 h-1.5 bg-black/70 rounded-full rotate-[35deg]" />
              <div className="w-4 h-1.5 bg-black/70 rounded-full -rotate-[35deg]" />
            </div>
            <div className="w-10 h-3 bg-black/70 rounded-full mt-4" />
          </div>
        );
      case 'touched':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-8 mb-2">
              <div className="w-3 h-3 bg-black/70 rounded-full relative">
                <div className="absolute -bottom-1.5 -right-1.5 w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" />
              </div>
              <div className="w-3 h-3 bg-black/70 rounded-full relative">
                 <div className="absolute -bottom-1.5 -right-1.5 w-1.5 h-1.5 bg-white/90 rounded-full animate-pulse" />
              </div>
            </div>
            <div className="w-10 h-5 border-b-[3px] border-black/60 rounded-full" />
          </div>
        );
      case 'disappointed':
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="flex gap-6 mb-3 opacity-60">
               <div className="w-3 h-1.5 bg-black rounded-full rotate-[-15deg]" />
               <div className="w-3 h-1.5 bg-black rounded-full rotate-[15deg]" />
            </div>
            <div className="w-10 h-4 border-t-[3px] border-black/50 rounded-full" />
          </div>
        );
      default:
        return null;
    }
  };

  return renderFace();
};

export const Planet: React.FC<PlanetProps> = ({ stage, emotion, intensity = 5 }) => {
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
        const emotionColors: Record<string, string> = {
          happy: "radial-gradient(circle at 30% 30%, #FFE066 0%, #FFB347 100%)",
          sad: "radial-gradient(circle at 30% 30%, #A8B8D0 0%, #7A8BA8 100%)",
          love: "radial-gradient(circle at 30% 30%, #FFB7C5 0%, #FF8FA3 100%)",
          angry: "radial-gradient(circle at 30% 30%, #C0392B 0%, #922B21 100%)",
          neutral: "radial-gradient(circle at 30% 30%, #F0EDE8 0%, #D9D5CF 100%)",
          disappointed: "radial-gradient(circle at 30% 30%, #B8A8C8 0%, #8B7BAE 100%)",
          touched: "radial-gradient(circle at 30% 30%, #AED9E0 0%, #76B4BD 100%)",
        };
        const currentEmotion = emotion?.toLowerCase() || 'neutral';
        return {
          className: `w-72 h-72 shadow-[0_0_60px_rgba(255,255,255,0.1),inset_-25px_-25px_50px_rgba(0,0,0,0.2)]`,
          label: `Biosphere: ${currentEmotion}`,
          texture: emotionColors[currentEmotion] || emotionColors.neutral,
          borderRadius: "50% 50% 50% 50% / 51% 49% 51% 49%"
        };
      default:
        return { className: "", label: "", borderRadius: "50%" };
    }
  };

  const config = getPlanetStyles();

  return (
    <div className="relative flex items-center justify-center p-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: [0, -15, 0], 
          }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: "easeOut",
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          className={`relative ${config.className} overflow-hidden transition-all duration-1000 border-2 border-white/5`}
          style={{ 
            background: (config as any).texture || undefined,
            borderRadius: (config as any).borderRadius || '50%'
          }}
        >
          {/* Detailed Terrain Rendering */}
          <div className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-60">
            {/* Stage-based Terrain */}
            {stage >= PlanetStage.OCEAN && (
              <div className="absolute inset-0">
                {/* Rivers / Flows */}
                <svg className="w-full h-full opacity-40" viewBox="0 0 100 100">
                  <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round" />
                  <path d="M20,0 Q40,40 20,100" fill="none" stroke="#60A5FA" strokeWidth="4" strokeLinecap="round" />
                </svg>
                
                {/* Landmasses / Biodiversity */}
                {stage >= PlanetStage.LIVING && (
                  <>
                    <div className="absolute top-[10%] left-[25%] w-32 h-20 bg-emerald-600/40 rounded-full blur-md rotate-12" />
                    <div className="absolute bottom-[20%] right-[15%] w-24 h-24 bg-emerald-700/40 rounded-full blur-md" />
                    <div className="absolute top-[40%] right-[30%] w-12 h-12 bg-emerald-500/30 rounded-full blur-sm" />
                  </>
                )}
              </div>
            )}

            {/* Magma Cracks for Stage 2 */}
            {stage === PlanetStage.MAGMA && (
              <div className="absolute inset-0">
                 <svg className="w-full h-full" viewBox="0 0 100 100">
                    <path d="M30,0 L40,30 L20,50 L50,80 L70,100" fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="5 5" className="animate-pulse" />
                    <path d="M80,0 L60,40 L90,60 L70,80" fill="none" stroke="#F87171" strokeWidth="1.5" className="animate-pulse delay-75" />
                 </svg>
              </div>
            )}
          </div>

          {/* Organic Silhouettes on edges (Reference match) */}
          <div className="absolute -inset-1 pointer-events-none opacity-40 scale-105">
            {stage >= PlanetStage.LIVING && (
              <>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-emerald-800 rounded-t-full origin-bottom rotate-[-15deg]" />
                <div className="absolute bottom-0 left-[30%] w-3 h-5 bg-emerald-900 rounded-t-full origin-bottom rotate-[10deg]" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-5 h-3 bg-emerald-800 rounded-l-full origin-right" />
              </>
            )}
          </div>

          {/* Emotional Weather Effects Overlay */}
          <EmotionWeather emotion={emotion || 'neutral'} />

          {/* Face Layer */}
          {(stage === PlanetStage.LIVING || stage === PlanetStage.ASCENDED) && (
            <PlanetFace emotion={emotion} />
          )}

          {/* Final Lighting & Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none" />
          <div className="absolute inset-0 border-[8px] border-white/5 rounded-inherit pointer-events-none" />
          
          {/* Glow Pulsing (Ambient) */}
          <motion.div 
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`absolute inset-0 rounded-full blur-2xl pointer-events-none ${
              emotion?.toLowerCase() === 'angry' ? 'bg-red-500/30' : 
              emotion?.toLowerCase() === 'happy' ? 'bg-yellow-400/20' :
              emotion?.toLowerCase() === 'love' ? 'bg-pink-400/20' : 'bg-blue-400/10'
            }`}
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute -bottom-6 text-blue-200/30 font-mono text-[9px] tracking-[0.5em] uppercase font-bold">
        {config.label}
      </div>
    </div>
  );
};

