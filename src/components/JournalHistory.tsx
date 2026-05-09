import React from 'react';
import { motion } from 'motion/react';
import { Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { AstroStats } from './AstroStats';

import { JournalEntry } from '../types';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
}

export const JournalHistory: React.FC<JournalHistoryProps> = ({ entries, onSelect }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-8 pb-32 h-full overflow-y-auto scrollbar-none">
      <header className="mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Stellar Logs</h2>
        <p className="text-xs text-blue-400 font-bold tracking-[0.2em] uppercase mt-2">Past Earth Cycles</p>
      </header>

      {entries.length > 0 && <AstroStats history={entries} />}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="py-20 text-center opacity-30 italic text-sm">
            No signal detected from past cycles.
          </div>
        ) : (
          entries.map((entry) => {
            const date = entry.createdAt?.seconds 
              ? new Date(entry.createdAt.seconds * 1000) 
              : (entry.createdAt instanceof Date ? entry.createdAt : new Date());

            return (
              <motion.div
                key={entry.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(entry)}
                className="group p-5 bg-white/5 border border-white/10 rounded-[1.5rem] hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
                    <Calendar size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold truncate max-w-[150px]">
                      {entry.analysis.summary.split('.')[0]}
                    </h4>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tighter">
                       {format(date, 'MMM dd, yyyy')} • {entry.analysis.dominantEmotion}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-blue-400 transition-colors" />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
