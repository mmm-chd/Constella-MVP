import React from 'react';
import { motion } from 'motion/react';
import { Share2, ArrowLeft } from 'lucide-react';
import { Planet } from './Planet';

interface SummaryViewProps {
  entry: any; // Can be a new session or a historical one
  onBack: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ entry, onBack }) => {
  if (!entry) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-[100] bg-[#0A1A3A] p-8 overflow-y-auto"
    >
      <header className="flex justify-between items-center mb-16">
        <button onClick={onBack} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
          <ArrowLeft size={20} />
        </button>
        <div className="text-xs font-bold tracking-[0.3em] uppercase">Session Recap</div>
        <button className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
          <Share2 size={18} />
        </button>
      </header>

      <div className="max-w-md mx-auto space-y-12 text-center">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-blue-100">
            {entry.analysis?.dominantEmotion === 'neutral' ? 'Silent Orbit' : entry.analysis?.dominantEmotion}
          </h2>
          <div className="h-1 w-12 bg-blue-500/30 mx-auto rounded-full" />
        </div>

        <div className="flex justify-center scale-110">
          <Planet 
            stage={4} // We show the final planet form in summary
            emotion={entry.analysis?.dominantEmotion} 
          />
        </div>

        <div className="space-y-8 text-left bg-white/5 p-8 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">The Core Narrative</h3>
            <p className="text-lg text-white font-light leading-relaxed italic">
              "{entry.analysis?.summary}"
            </p>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
             <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Transcription Logs</h3>
             <p className="text-sm text-zinc-400 leading-relaxed max-h-40 overflow-y-auto pr-4 scrollbar-thin">
                {entry.text}
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
