import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Award, Zap, BarChart3 } from 'lucide-react';
import { Planet } from './Planet';

interface ProgressProps {
  planet: any;
}

export const PlanetProgress: React.FC<ProgressProps> = ({ planet }) => {
  const stats = [
    { label: 'Sync Streak', value: '7 Days', icon: Zap, color: 'text-orange-400' },
    { label: 'Evolution Rate', value: `${Math.round((planet?.totalInputs / 35) * 100)}%`, icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Core Stability', value: 'High', icon: BarChart3, color: 'text-emerald-400' },
  ];

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-10 pb-32 h-full overflow-y-auto">
      <header className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">System Status</h2>
        <p className="text-xs text-blue-400 font-bold tracking-[0.2em] uppercase mt-2">Evolution Metrics</p>
      </header>

      <div className="flex justify-center py-6">
        <Planet stage={planet?.stage} emotion={planet?.currentEmotion} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-sm font-medium text-white/60">{stat.label}</span>
            </div>
            <span className="text-lg font-mono font-bold">{stat.value}</span>
          </motion.div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">Achievements</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {[1,2,3].map((_, i) => (
            <div key={i} className="min-w-[120px] p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-3 grayscale opacity-30">
               <Award size={32} />
               <span className="text-[10px] font-bold uppercase tracking-tighter">Class {i + 1} Star</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
