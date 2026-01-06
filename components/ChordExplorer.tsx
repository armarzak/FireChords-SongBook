
import React, { useState, useMemo } from 'react';
import { NOTES, CHORD_FORMULAS, getChordNotesOnFretboard } from '../services/chordEngine';
import { getFingerings } from '../services/chordLibrary';
import { Fretboard } from './Fretboard';

interface ChordExplorerProps {
  theme?: 'light' | 'dark';
}

// Используем надежный хостинг для шпаргалки или Base64 (здесь надежный URL)
const CHORD_SHEET_URL = "https://www.standardguitar.com/images/chords/guitar-chords-chart.png";

export const ChordExplorer: React.FC<ChordExplorerProps> = ({ theme = 'dark' }) => {
  const [root, setRoot] = useState('C');
  const [type, setType] = useState('maj');
  const [mode, setMode] = useState<'notes' | 'shape'>('shape');
  const [variationIdx, setVariationIdx] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const isDark = theme === 'dark';

  const chordNotes = useMemo(() => getChordNotesOnFretboard(root, type), [root, type]);
  const fingerings = useMemo(() => getFingerings(`${root}${type === 'maj' ? '' : type}`), [root, type]);
  const currentFingering = fingerings[variationIdx % fingerings.length];

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-24 overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className="px-5 py-4 flex justify-between items-start">
        <div>
          <h1 className={`text-3xl font-black tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Explorer</h1>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Theory & Practice</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowReference(true); setImgError(false); }}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-zinc-900 border-white/5 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
          
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-200 border-zinc-200 shadow-inner'}`}>
            <button 
              onClick={() => setMode('shape')}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${mode === 'shape' ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
            >Shape</button>
            <button 
              onClick={() => setMode('notes')}
              className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${mode === 'notes' ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
            >Notes</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-4 no-scrollbar">
        {/* Интерактивный гриф */}
        <div className={`p-2 rounded-3xl border shadow-xl transition-all ${isDark ? 'bg-black border-white/5 shadow-blue-500/5' : 'bg-white border-zinc-100 shadow-md'}`}>
           <Fretboard 
             root={root} 
             type={type} 
             chordNotes={chordNotes} 
             theme={theme} 
             mode={mode}
             fingering={currentFingering}
           />
           
           <div className="mt-2 flex justify-between items-center px-1">
              <div className="flex flex-col">
                 <span className={`text-[7px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Current</span>
                 <span className="text-lg font-black text-blue-500">{root}{type === 'maj' ? '' : type}</span>
              </div>
              
              {mode === 'shape' && fingerings.length > 1 && (
                <div className="flex items-center gap-2">
                   <span className="text-[8px] font-bold text-zinc-500">Var {variationIdx + 1}/{fingerings.length}</span>
                   <button 
                    onClick={() => setVariationIdx(v => (v + 1) % fingerings.length)}
                    className={`p-1.5 rounded-full border ${isDark ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900 shadow-sm'}`}
                   >
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              )}
           </div>
        </div>

        {/* Выбор Тоники */}
        <div>
          <h3 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Root Note</h3>
          <div className="grid grid-cols-6 gap-1.5">
            {NOTES.map(n => (
              <button 
                key={n} 
                onClick={() => { setRoot(n); setVariationIdx(0); }}
                className={`py-2 rounded-xl font-black text-[10px] transition-all active:scale-90 border ${root === n ? 'bg-blue-600 text-white border-blue-500 shadow-md' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор Типа */}
        <div>
          <h3 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Chord Quality</h3>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(CHORD_FORMULAS).map(t => (
              <button 
                key={t} 
                onClick={() => { setType(t); setVariationIdx(0); }}
                className={`px-3 py-2 rounded-xl font-black text-[10px] transition-all active:scale-90 border ${type === t ? 'bg-blue-600 text-white border-blue-500 shadow-md' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Ссылка на таблицу */}
        <button 
          onClick={() => { setShowReference(true); setImgError(false); }}
          className={`w-full mt-4 p-5 rounded-3xl border flex items-center justify-between group transition-all active:scale-[0.98] ${isDark ? 'bg-zinc-900/50 border-white/5 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`}
        >
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
             </div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest">Chord Cheat Sheet</p>
                <p className="text-[8px] opacity-50 uppercase font-bold tracking-tighter">Full Visual Reference</p>
             </div>
          </div>
          <svg className="w-5 h-5 opacity-30 group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Модальное окно с таблицей */}
      {showReference && (
        <div className="fixed inset-0 z-[2000] bg-black animate-in fade-in zoom-in-95 duration-300 flex flex-col pt-[env(safe-area-inset-top)]">
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-black/50">
             <div>
                <h2 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Reference Chart</h2>
                <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest">Pinch to Zoom</p>
             </div>
             <button 
               onClick={() => setShowReference(false)}
               className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/5"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
          
          <div className="flex-1 overflow-auto bg-[#1a1a1a] flex items-start justify-center p-2 sm:p-6">
             {!imgError ? (
               <img 
                 src={CHORD_SHEET_URL} 
                 alt="Guitar Chords Chart" 
                 onLoad={() => console.log('Image Loaded')}
                 onError={() => setImgError(true)}
                 className="max-w-none w-full h-auto rounded shadow-2xl transition-opacity duration-500"
                 style={{ minWidth: '800px' }} 
               />
             ) : (
               <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-4 px-10">
                  <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-black uppercase text-sm">Failed to Load Chart</h3>
                  <p className="text-zinc-500 text-xs">This might be due to a poor connection or the image host being blocked.</p>
                  <button 
                    onClick={() => { setImgError(false); }}
                    className="bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95"
                  >
                    Retry Loading
                  </button>
               </div>
             )}
          </div>
          
          <div className="p-6 text-center border-t border-white/10 bg-black/80 backdrop-blur-xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
             <div className="flex justify-center gap-8 mb-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                  <span className="text-white text-[8px] font-black uppercase tracking-tighter">Horizontal Scroll</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-green-500"></div>
                  <span className="text-white text-[8px] font-black uppercase tracking-tighter">Pinch Zoom</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
