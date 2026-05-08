import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Rocket, Mic, Image as ImageIcon, AudioLines, BookHeart, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'astronot';
}

interface AstronotChatProps {
  onSendMessage: (texts: string[]) => Promise<void>;
  isProcessing: boolean;
  onSaveJournal: () => Promise<void>;
  isSaving: boolean;
  aiResponse: string | null;
  onClose: () => void;
  selectedDate: Date;
}

export const AstronotChat: React.FC<AstronotChatProps> = ({ 
  onSendMessage, 
  isProcessing, 
  onSaveJournal,
  isSaving,
  aiResponse,
  onClose,
  selectedDate
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isS2SMode, setIsS2SMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Greetings, traveler. Tell me about your day. I'll listen to every word.", sender: 'astronot' }
  ]);
  const [showSave, setShowSave] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          console.warn("Microphone access denied. Ensure 'microphone' is allowed in frame permissions and browser settings.");
        }
        setIsListening(false);
        setIsS2SMode(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setIsS2SMode(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (isS2SMode) setIsS2SMode(false);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const toggleS2S = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isS2SMode) {
      recognitionRef.current.stop();
      setIsS2SMode(false);
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsS2SMode(true);
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start S2S mode:", err);
      }
    }
  };

  useEffect(() => {
    if (aiResponse) {
      const aiMsg: Message = { id: Date.now().toString(), text: aiResponse, sender: 'astronot' };
      setMessages(prev => [...prev, aiMsg]);
      setShowSave(true);
    }
  }, [aiResponse]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSendBubble = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowSave(false);
  };

  const handleCompleteSession = async () => {
    if (isProcessing) return;
    
    const userMessageTexts = messages
      .filter(m => m.sender === 'user')
      .map(m => m.text);

    if (userMessageTexts.length === 0) return;

    try {
      await onSendMessage(userMessageTexts);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div id="astronot-chat" className="flex flex-col h-full w-full bg-[#0A1A3A] relative">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 px-8 py-10 flex items-center justify-between z-10">
        <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <Rocket size={20} className="rotate-180" />
        </button>
        <div className="text-sm font-bold tracking-[0.2em] uppercase">
          {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white mx-0.5" />
          <div className="w-1 h-1 rounded-full bg-white mx-0.5" />
          <div className="w-1 h-1 rounded-full bg-white mx-0.5" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!isS2SMode ? (
            /* Standard Chat View */
            <motion.div
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 pt-32 space-y-8 scrollbar-none"
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    className={cn(
                      "flex",
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      "max-w-[85%] px-6 py-4 rounded-[2rem] text-[15px] leading-relaxed tracking-wide",
                      msg.sender === 'user' 
                        ? 'bg-blue-600/20 border border-blue-500/20 text-blue-50 rounded-tr-none' 
                        : 'bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none markdown-body'
                    )}>
                      {msg.sender === 'astronot' ? (
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isProcessing && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                   <div className="bg-white/5 border border-white/5 rounded-[2rem] px-6 py-4 flex gap-2">
                      <div className="flex gap-1.5">
                         <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                         <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                         <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                      </div>
                   </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Speech-to-Speech Face View */
            <motion.div
              key="face-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex-1 flex flex-col items-center justify-center p-8 pt-20 text-center"
            >
              {/* Vibration Indicator */}
              <div className="h-12 flex items-center justify-center gap-1.5 mb-8">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      height: [16, 32, 24, 40, 20][i % 5] * (isListening ? 1.2 : 0.8),
                      opacity: isListening ? 1 : 0.3
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.8, 
                      ease: "easeInOut",
                      delay: i * 0.1
                    }}
                    className="w-1.5 rounded-full bg-blue-100"
                  />
                ))}
              </div>

              <h2 className="text-2xl font-medium tracking-tight mb-16 text-white/90">Bagaimana harimu?</h2>

              {/* Astronaut Face (Image 5 style) */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
                
                {/* Main Head Structure */}
                <div className="relative w-full h-full rounded-full bg-white p-3 shadow-2xl flex items-center justify-center">
                   <div className="w-full h-full rounded-full bg-[#1A1A2E] flex items-center justify-center relative overflow-hidden border-[6px] border-orange-500">
                      {/* Eyes */}
                      <div className="flex gap-12">
                        <motion.div 
                          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                          transition={{ repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }}
                          className="w-12 h-12 rounded-full bg-white" 
                        />
                        <motion.div 
                          animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                          transition={{ repeat: Infinity, duration: 4, times: [0, 0.45, 0.5, 0.55, 1] }}
                          className="w-12 h-12 rounded-full bg-white" 
                        />
                      </div>

                      {/* Smile */}
                      <div className="absolute bottom-16 w-12 h-6 border-b-4 border-white rounded-full" />
                   </div>
                </div>

                {/* Ears/Side details */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-12 rounded-xl bg-zinc-800 border-r-4 border-white shadow-lg" />
                <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-6 h-12 rounded-xl bg-zinc-800 border-l-4 border-white shadow-lg" />
              </div>

              <div className="mt-16 text-xl font-light text-white/60 tracking-wide italic">
                "Tell me your story"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area (Updated for S2S) */}
      <div className="p-8 pb-12 space-y-6 bg-gradient-to-t from-[#0A1A3A] to-transparent relative z-20">
        
        <AnimatePresence>
          {showSave && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute -top-12 left-8 right-8 flex justify-center"
            >
              <button
                onClick={async () => {
                  await onSaveJournal();
                  setShowSave(false);
                }}
                disabled={isSaving}
                className="flex items-center gap-3 px-8 py-3 bg-blue-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-full shadow-2xl shadow-blue-500/40 active:scale-95"
              >
                <BookHeart size={16} />
                {isSaving ? "Archiving..." : "Save to Journal"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2 shadow-2xl relative overflow-hidden">
            <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <ImageIcon size={20} />
            </button>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && input.trim()) {
                  handleSendBubble();
                }
              }}
              disabled={isProcessing}
              placeholder="Type here"
              className="flex-1 bg-transparent px-2 py-3 text-[15px] text-zinc-800 placeholder:text-zinc-400 focus:outline-none"
            />
            
            <div className="flex items-center gap-1.5">
              {/* Speech to Text Button (Left) */}
              <button 
                onClick={toggleListening}
                className={`p-2 transition-colors ${isListening && !isS2SMode ? 'text-blue-500 font-bold' : 'text-zinc-400'}`}
              >
                <Mic size={20} />
              </button>

              {/* Speech to Speech Button (Right) */}
              <button 
                onClick={toggleS2S}
                className={`p-2 transition-colors ${isS2SMode ? 'text-blue-500' : 'text-zinc-400'}`}
              >
                <AudioLines size={20} />
              </button>

              {isS2SMode && (
                <button 
                  onClick={toggleS2S}
                  className="pl-2 pr-1 border-l border-zinc-200 text-xs font-black text-zinc-900 tracking-tighter uppercase"
                >
                  End
                </button>
              )}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={isFocused || input.trim() ? handleSendBubble : handleCompleteSession}
            disabled={isProcessing || (!input.trim() && !(!isFocused && messages.length > 1))}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isFocused || input.trim() 
                ? 'bg-blue-600 text-white' 
                : 'bg-black text-white shadow-blue-900/20'
            }`}
          >
            {isProcessing ? (
               <Sparkles size={20} className="animate-spin" />
            ) : isFocused || input.trim() ? (
              <Send size={24} />
            ) : (
              <Rocket size={24} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
