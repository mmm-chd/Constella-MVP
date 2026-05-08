import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { 
  setDoc, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { LogOut, Rocket, LayoutGrid, Settings, Star, BookOpen, BarChart3, ChevronRight, Sparkles, BookHeart, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import firebaseConfig from '../firebase-applet-config.json';
import { SpaceBackground } from './components/SpaceBackground';
import { Planet } from './components/Planet';
import { AstronotChat } from './components/AstronotChat';
import { JournalHistory } from './components/JournalHistory';
import { PlanetProgress } from './components/PlanetProgress';
import { SummaryView } from './components/SummaryView';
import { StellarDatePicker } from './components/StellarDatePicker';
import { analyzeJournal } from './services/gemini';
import { Planet as PlanetType, PlanetStage, UserProfile, JournalEntry } from './types';
import { db, auth, handleFirestoreError, OperationType } from './services/firebase';

type AppTab = 'home' | 'journal' | 'progress' | 'settings';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentPlanet, setCurrentPlanet] = useState<PlanetType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [isChatting, setIsChatting] = useState(false);
  const [history, setHistory] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        initializeUserData(u);
      } else {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const initializeUserData = async (u: FirebaseUser) => {
    try {
      const profRef = doc(db, 'users', u.uid);
      let profSnap;
      try {
        profSnap = await getDoc(profRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${u.uid}`);
        return;
      }
      
      let currentProfile: UserProfile;
      if (!profSnap.exists()) {
        currentProfile = {
          uid: u.uid,
          email: u.email!,
          displayName: u.displayName || 'Traveler',
          createdAt: serverTimestamp(),
        };
        try {
          await setDoc(profRef, currentProfile);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${u.uid}`);
        }
      } else {
        currentProfile = profSnap.data() as UserProfile;
      }
      setProfile(currentProfile);

      const planetQuery = query(
        collection(db, 'planets'),
        where('userId', '==', u.uid),
        where('status', '==', 'active'),
        limit(1)
      );
      
      let planetSnap;
      try {
        planetSnap = await getDocs(planetQuery);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'planets');
        return;
      }
      
      if (!planetSnap.empty) {
        const pDoc = planetSnap.docs[0];
        setCurrentPlanet({ id: pDoc.id, ...pDoc.data() } as PlanetType);
      } else {
        const newPlanet: PlanetType = {
          userId: u.uid,
          stage: PlanetStage.EMPTY,
          totalInputs: 0,
          currentEmotion: 'neutral',
          emotionalBlend: [],
          emotionalSummary: 'The emotional universe is beginning to form.',
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        try {
          const newPRef = await addDoc(collection(db, 'planets'), newPlanet);
          setCurrentPlanet({ id: newPRef.id, ...newPlanet });
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, 'planets');
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    if (history.length > 0) {
      const dateString = selectedDate.toDateString();
      const existingEntry = history.find(e => {
        const d = e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : (e.createdAt instanceof Date ? e.createdAt : null);
        return d && d.toDateString() === dateString;
      });
      if (existingEntry) {
        setSelectedEntry(existingEntry);
      } else {
        setSelectedEntry(null);
      }
    }
  }, [selectedDate, history]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'journals'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JournalEntry[];
      setHistory(entries);
      
      // Auto-select entry for current date if it exists
      const dateString = selectedDate.toDateString();
      const existingEntry = entries.find(e => {
        const d = e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000) : (e.createdAt as any);
        return d instanceof Date && d.toDateString() === dateString;
      });
      
      if (existingEntry) {
         // Optionally do something if we want to show it immediately
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'journals');
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => signOut(auth);

  const getPlanetStage = (totalInputs: number): PlanetStage => {
    if (totalInputs <= 0) return PlanetStage.EMPTY;
    if (totalInputs <= 5) return PlanetStage.ASTEROID;
    if (totalInputs <= 10) return PlanetStage.MAGMA;
    if (totalInputs <= 20) return PlanetStage.OCEAN;
    if (totalInputs <= 35) return PlanetStage.LIVING;
    return PlanetStage.ASCENDED;
  };
  

  const onSendMessage = async (texts: string[]) => {
    if (!user || !currentPlanet || !currentPlanet.id) return;
    setIsProcessing(true);

    try {
      const combinedText = texts.join(". ");
      const analysisContext = `User feels currently ${currentPlanet.currentEmotion}. ${currentPlanet.emotionalSummary}`;
      const result = await analyzeJournal(combinedText, analysisContext);
      
      setLastAnalysis({ ...result, originalTexts: texts });
      // We don't save to document yet, user click "Save to Journal" for that
    } catch (error) {
       console.error("Analysis error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const onSaveJournal = async () => {
    if (!user || !currentPlanet || !lastAnalysis) return;
    setIsSaving(true);
    try {
      const entryDate = new Date(selectedDate);
      // If it's today, we can use serverTimestamp for precision, 
      // but otherwise we use the selected date at the current time for order
      const isToday = entryDate.toDateString() === new Date().toDateString();
      
      const journal: JournalEntry = {
        userId: user.uid,
        planetId: currentPlanet.id!,
        text: lastAnalysis.originalTexts.join("\n"),
        analysis: lastAnalysis.analysis,
        createdAt: isToday ? serverTimestamp() : entryDate,
      };
      await addDoc(collection(db, 'journals'), journal);

      const nextTotalInputs = currentPlanet.totalInputs + 1;
      const nextStage = getPlanetStage(nextTotalInputs);
      console.log("CURRENT:", currentPlanet.totalInputs);
      console.log("NEXT:", nextTotalInputs);
      console.log("STAGE:", nextStage);
      
      const updatedPlanet = {
        totalInputs: nextTotalInputs,
        stage: nextStage,
        currentEmotion: lastAnalysis.analysis.dominantEmotion,
        emotionalBlend: lastAnalysis.analysis.blend,
        emotionalSummary: lastAnalysis.analysis.summary,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, 'planets', currentPlanet.id!), updatedPlanet);
      setCurrentPlanet(prev => prev ? { ...prev, ...updatedPlanet } : null);
      
      // Refresh history
      fetchHistory();
      
      setLastAnalysis(null);
      setIsChatting(false);
      setActiveTab('journal');
      // Set the newly created journal as temporary selected entry to show summary
      setSelectedEntry({
        ...journal,
        id: 'newly-created' // Temporary ID for immediate view
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'journals/planets');
    } finally {
      setIsSaving(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleLaunchChat = (date: Date) => {
    setSelectedDate(date);
    setIsDatePickerOpen(false);
    setIsChatting(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B18] flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white font-mono tracking-[0.2em]"
        >
          SYNCING EMOTIONS...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans overflow-hidden selection:bg-blue-500/30 selection:text-white">
      <SpaceBackground />
      
      {!user ? (
        <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6 max-w-xl"
          >
            <div className="flex justify-center mb-8">
              <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-400/20 shadow-2xl shadow-blue-500/20">
                <Rocket size={48} className="text-blue-400" />
              </div>
            </div>
            <h1 className="text-7xl font-semibold tracking-tighter sm:text-8xl">Constella</h1>
            <p className="text-lg text-blue-200/50 font-light leading-relaxed max-w-md mx-auto">
              Your emotions shape the cosmos. Begin your stellar journey of self-reflection.
            </p>
            <button
              onClick={handleLogin}
              id="login-button"
              className="mt-8 px-10 py-5 bg-white text-black rounded-full font-bold flex items-center gap-3 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/20 uppercase tracking-widest text-xs"
            >
              Begin Journey
            </button>
          </motion.div>
        </div>
      ) : (
        <div className="h-screen flex flex-col relative">
          
          {/* Header Overlay */}
          <header className="p-8 flex justify-between items-center z-50">
             <div className="flex flex-col relative">
                <span className="text-[10px] text-white/30 uppercase tracking-[0.4em] font-bold">Stellar Cycle</span>
                <div className="relative">
                  <input 
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-lg font-bold tracking-tight text-white/90 flex items-center gap-2">
                    {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    <ChevronRight size={14} className="text-white/20 rotate-90 mt-0.5" />
                  </div>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                  <Settings size={18} />
                </button>
             </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 relative flex items-center justify-center overflow-hidden">
             <AnimatePresence mode="wait">
                {activeTab === 'home' && (
                  <motion.div key="home" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full h-full flex flex-col items-center justify-center pb-20 p-8 text-center">
                     <Planet stage={currentPlanet?.stage} emotion={currentPlanet?.currentEmotion} />
                     <div className="mt-16 space-y-4 max-w-xs">
                        <h2 className="text-3xl font-bold tracking-tight uppercase">{currentPlanet?.currentEmotion === 'neutral' ? 'Silent Orbit' : currentPlanet?.currentEmotion}</h2>
                        <div className="text-sm text-white/40 font-light leading-relaxed italic">"{currentPlanet?.emotionalSummary}"</div>
                     </div>
                  </motion.div>
                )}
                {activeTab === 'journal' && <JournalHistory entries={history} onSelect={setSelectedEntry} />}
                {activeTab === 'progress' && <PlanetProgress planet={currentPlanet} />}
                {activeTab === 'settings' && (
                  <div className="w-full max-w-md p-10 space-y-8">
                     <h2 className="text-3xl font-bold tracking-tight">System Core</h2>
                     <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4">
                        <div className="text-xs text-white/30 uppercase font-bold tracking-[0.3em]">AI Protocol</div>
                        <div className="p-4 bg-blue-500/10 border border-blue-400/20 rounded-2xl text-blue-100 flex items-center justify-between">
                           <span>Analytical Voyager</span>
                           <Sparkles size={16} />
                        </div>
                        <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 text-red-500 text-xs font-bold uppercase rounded-2xl tracking-[0.2em] border border-red-500/10">Terminate Sync</button>
                     </div>
                  </div>
                )}
             </AnimatePresence>
          </main>

          <AnimatePresence>
             {isChatting && (
               <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[100]">
                  <AstronotChat 
                    onSendMessage={onSendMessage}
                    isProcessing={isProcessing}
                    onSaveJournal={onSaveJournal}
                    isSaving={isSaving}
                    aiResponse={lastAnalysis?.response || null}
                    onClose={() => setIsChatting(false)}
                    selectedDate={selectedDate}
                  />
               </motion.div>
             )}
          </AnimatePresence>

          <AnimatePresence>
             {selectedEntry && (
               <SummaryView entry={selectedEntry} onBack={() => setSelectedEntry(null)} />
             )}
          </AnimatePresence>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 p-8 flex justify-center items-center gap-6 z-50">
             <div className="flex bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 shadow-2xl relative">
                {[
                  { id: 'home', icon: LayoutGrid },
                  { id: 'journal', icon: BookOpen },
                  { id: 'progress', icon: BarChart3 },
                  { id: 'settings', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AppTab)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/20'}`}
                  >
                    <tab.icon size={22} />
                  </button>
                ))}
             </div>
             
             {/* Separate Rocket Button */}
             <motion.button 
               whileTap={{ scale: 0.9 }}
               onClick={() => setIsDatePickerOpen(true)}
               className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative group overflow-hidden"
             >
                <Rocket size={28} className="relative z-10" />
             </motion.button>
          </nav>

          <StellarDatePicker 
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            onLaunch={handleLaunchChat}
          />
        </div>
      )}
    </div>
  );
}
