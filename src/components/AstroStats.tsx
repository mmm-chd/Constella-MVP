import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

import { JournalEntry } from '../types';

interface AstroStatsProps {
  history: JournalEntry[];
}

export const AstroStats: React.FC<AstroStatsProps> = ({ history }) => {
  const data = history
    .slice(-7)
    .map(entry => {
      const date = entry.createdAt?.seconds 
        ? new Date(entry.createdAt.seconds * 1000) 
        : (entry.createdAt instanceof Date ? entry.createdAt : new Date());
      
      return {
        date: format(date, 'MMM dd'),
        score: (isNaN(entry.analysis.sentimentScore) ? 0.5 : (entry.analysis.sentimentScore ?? 0.5)) * 100,
        emotion: entry.analysis.dominantEmotion
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mt-6 relative overflow-hidden"
    >
      {/* Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] mb-1 block">Emotional Data</span>
          <h3 className="text-xl font-bold">Stellar Resonance</h3>
        </div>
        <div className="p-3 bg-white/5 rounded-2xl">
          <TrendingUp size={20} className="text-blue-400" />
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(5, 11, 24, 0.95)', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '12px'
              }}
              itemStyle={{ color: '#fff', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={14} className="text-blue-400" />
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Avg Clarity</span>
          </div>
          <p className="text-lg font-bold">84%</p>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-3xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Astro Sync</span>
          </div>
          <p className="text-lg font-bold">Stable</p>
        </div>
      </div>
    </motion.div>
  );
};
