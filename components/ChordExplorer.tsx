
import React, { useState, useMemo } from 'react';
import { NOTES, CHORD_FORMULAS, getChordNotesOnFretboard } from '../services/chordEngine';
import { getFingerings } from '../services/chordLibrary';
import { Fretboard } from './Fretboard';
import { ChordDiagram } from './ChordDiagram';

interface ChordExplorerProps {
  theme?: 'light' | 'dark';
}

const ChordReferenceTable: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const isDark = theme === 'dark';
  
  const groups = [
    { title: 'A Group', chords: ['A', 'Am', 'A7', 'Am7', 'Amaj7', 'Asus4', 'A7sus4', 'A9', 'Am6', 'Ammaj7', 'Adim', 'Adim7'] },
    { title: 'B Group', chords: ['B', 'Bm', 'B7', 'B9', 'Bb', 'Bb7'] },
    { title: 'C Group', chords: ['C', 'Cm', 'C7', 'C9', 'C5'] },
    { title: 'D Group', chords: ['D', 'Dm', 'D7', 'D9', 'Daug', 'D5'] },
    { title: 'E Group', chords: ['E', 'Em', 'E7', 'E7#9', 'E11'] },
    { title: 'F Group', chords: ['F', 'Fm', 'Fmaj7', 'F9'] },
    { title: 'G Group', chords: ['G', 'Gm', 'G7', 'G6', 'Gsus4'] },
  ];

  return (
    <div className="space-y-12 pb-32">
      {groups.map((group, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-3 px-2 border-l-4 border-blue-500">
            <h3 className={`text-xs font-black uppercase tracking-[0.3em] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {group.title}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 justify-items-center">
            {group.chords.map(chordName => {
              const fings = getFingerings(chordName);
              if (fings.length === 0) return null;
              return (
                <div key={chordName} className="flex flex-col items-center gap-2">
                  <ChordDiagram fingering={fings[0]} theme={theme} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export const ChordExplorer: React.FC<ChordExplorerProps> = ({ theme = 'dark' }) => {
  const [root, setRoot] = useState('C');
  const [type, setType] = useState('maj');
  const [mode, setMode] = useState<'notes' | 'shape'>('shape');
  const [variationIdx, setVariationIdx] = useState(0);
  const [showReference, setShowReference] = useState(false);
  
  const isDark = theme === 'dark';

  const chordNotes = useMemo(() => getChordNotesOnFretboard(root, type), [root, type]);
  const fingerings = useMemo(() => getFingerings(`${root}${type === 'maj' ? '' : type}`), [root, type]);
  const currentFingering = fingerings[variationIdx % fingerings.length];

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-24 overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className="px-5 py-4 flex justify-between items-start border-b border-white/5">
        <div>
          <h1 className={`text-3xl font-black tracking-tight mb-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Explorer</h1>
          <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Visual Library</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowReference(true)}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-zinc-900 border-white/10 text-blue-500' : 'bg-white border-zinc-200 text-blue-600 shadow-sm'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
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

      <div className="flex-1 overflow-y-auto px-5 space-y-6 no-scrollbar pt-4">
        <div className={`p-4 rounded-3xl border shadow-2xl transition-all ${isDark ? 'bg-black border-white/5 shadow-blue-500/5' : 'bg-white border-zinc-100 shadow-md'}`}>
           <Fretboard 
             root={root} 
             type={type} 
             chordNotes={chordNotes} 
             theme={theme} 
             mode={mode}
             fingering={currentFingering}
           />
           
           <div className="mt-4 flex justify-between items-center px-1">
              <div className="flex flex-col">
                 <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Interactive Fretboard</span>
                 <span className="text-xl font-black text-blue-500">{root}{type === 'maj' ? '' : type}</span>
              </div>
              
              {mode === 'shape' && fingerings.length > 1 && (
                <div className="flex items-center gap-2">
                   <span className="text-[8px] font-bold text-zinc-500">{variationIdx + 1}/{fingerings.length}</span>
                   <button 
                    onClick={() => setVariationIdx(v => (v + 1) % fingerings.length)}
                    className={`p-2 rounded-full border ${isDark ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900 shadow-sm'}`}
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              )}
           </div>
        </div>

        <div>
          <h3 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Root Note</h3>
          <div className="grid grid-cols-6 gap-2">
            {NOTES.map(n => (
              <button 
                key={n} 
                onClick={() => { setRoot(n); setVariationIdx(0); }}
                className={`py-3 rounded-2xl font-black text-[11px] transition-all active:scale-90 border ${root === n ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className={`text-[8px] font-black uppercase tracking-[0.2em] mb-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Chord Quality</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CHORD_FORMULAS).map(t => (
              <button 
                key={t} 
                onClick={() => { setType(t); setVariationIdx(0); }}
                className={`px-4 py-3 rounded-2xl font-black text-[11px] transition-all active:scale-90 border ${type === t ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => setShowReference(true)}
          className={`w-full mt-6 p-6 rounded-[2.5rem] border flex items-center justify-between group transition-all active:scale-[0.98] ${isDark ? 'bg-blue-600 border-white/10 text-white shadow-2xl shadow-blue-500/20' : 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20'}`}
        >
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
             </div>
             <div className="text-left">
                <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Full Chord Chart</p>
                <p className="text-[10px] opacity-70 uppercase font-bold tracking-tight">Complete Reference Library</p>
             </div>
          </div>
          <svg className="w-6 h-6 opacity-50 group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {showReference && (
        <div className="fixed inset-0 z-[2000] bg-black animate-in fade-in zoom-in-95 duration-300 flex flex-col pt-[env(safe-area-inset-top)]">
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 backdrop-blur-xl bg-black/80">
             <div>
                <h2 className="text-white text-xs font-black uppercase tracking-[0.4em]">Chord Library</h2>
                <p className="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mt-1">High Fidelity Digital Reference</p>
             </div>
             <button 
               onClick={() => setShowReference(false)}
               className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10 shadow-lg"
             >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-[#080808] p-6 sm:p-10 no-scrollbar">
             <ChordReferenceTable theme="dark" />
          </div>
          
          <div className="p-8 text-center border-t border-white/10 bg-black/90 backdrop-blur-xl pb-[calc(2rem+env(safe-area-inset-bottom))]">
             <p className="text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em]">Digitally Mastered Reference Sheet</p>
          </div>
        </div>
      )}
    </div>
  );
};
