import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ChevronLeft, ChevronRight, Rocket, X } from 'lucide-react';

interface StellarDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (date: Date) => void;
}

export const StellarDatePicker: React.FC<StellarDatePickerProps> = ({ isOpen, onClose, onLaunch }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    if (nextMonth <= new Date()) {
      setViewDate(nextMonth);
    }
  };

  const isFutureDate = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date > new Date();
  };

  const isToday = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toDateString() === new Date().toDateString();
  };

  const isSelected = (day: number) => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = Array.from({ length: daysInMonth(viewDate.getMonth(), viewDate.getFullYear()) }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth(viewDate.getMonth(), viewDate.getFullYear()) }, (_, i) => i);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#050B18]/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full" />
            
            <header className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.4em] mb-1">Navigation System</span>
                <h2 className="text-2xl font-bold tracking-tight">Select Origin</h2>
              </div>
              <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </header>

            <div className="space-y-6 relative z-10">
              <div className="flex items-center justify-between px-2">
                <button onClick={handlePrevMonth} className="p-2 text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                  {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button 
                  onClick={handleNextMonth} 
                  disabled={new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1) > new Date()}
                  className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="h-10 flex items-center justify-center text-[10px] font-black text-white/20 uppercase">
                    {d}
                  </div>
                ))}
                {padding.map(p => <div key={`p-${p}`} className="h-12" />)}
                {days.map(d => {
                  const future = isFutureDate(d);
                  const selected = isSelected(d);
                  const today = isToday(d);
                  
                  return (
                    <button
                      key={d}
                      disabled={future}
                      onClick={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), d))}
                      className={`h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                        selected 
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                          : future 
                            ? 'text-white/5 cursor-not-allowed' 
                            : 'hover:bg-white/5 text-white/80'
                      }`}
                    >
                      <span className="text-sm font-medium">{d}</span>
                      {today && !selected && (
                        <div className="absolute bottom-2 w-1 h-1 bg-blue-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onLaunch(selectedDate)}
                className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 mt-4 hover:bg-blue-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Sequence <Rocket size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
