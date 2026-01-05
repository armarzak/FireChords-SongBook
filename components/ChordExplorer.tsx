
import React, { useState, useMemo } from 'react';
import { NOTES, CHORD_FORMULAS, getChordNotesOnFretboard } from '../services/chordEngine';
import { getFingerings } from '../services/chordLibrary';
import { Fretboard } from './Fretboard';

interface ChordExplorerProps {
  theme?: 'light' | 'dark';
}

export const ChordExplorer: React.FC<ChordExplorerProps> = ({ theme = 'dark' }) => {
  const [root, setRoot] = useState('C');
  const [type, setType] = useState('maj');
  const [mode, setMode] = useState<'notes' | 'shape'>('shape');
  const [variationIdx, setVariationIdx] = useState(0);
  
  const isDark = theme === 'dark';

  const chordNotes = useMemo(() => getChordNotesOnFretboard(root, type), [root, type]);
  const fingerings = useMemo(() => getFingerings(`${root}${type === 'maj' ? '' : type}`), [root, type]);
  const currentFingering = fingerings[variationIdx % fingerings.length];

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-32 ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className="px-6 py-6 flex justify-between items-start">
        <div>
          <h1 className={`text-4xl font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Explorer</h1>
          <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Theory & Practice</p>
        </div>
        
        {/* Переключатель режимов */}
        <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-200 border-zinc-200 shadow-inner'}`}>
          <button 
            onClick={() => setMode('shape')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'shape' ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
          >Shape</button>
          <button 
            onClick={() => setMode('notes')}
            className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${mode === 'notes' ? (isDark ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
          >Notes</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 no-scrollbar">
        
        {/* Гриф */}
        <div className={`p-4 rounded-[2.5rem] border shadow-2xl transition-all ${isDark ? 'bg-black border-white/5 shadow-blue-500/5' : 'bg-white border-zinc-100 shadow-xl'}`}>
           <Fretboard 
             root={root} 
             type={type} 
             chordNotes={chordNotes} 
             theme={theme} 
             mode={mode}
             fingering={currentFingering}
           />
           
           <div className="mt-4 flex justify-between items-center px-2">
              <div className="flex flex-col">
                 <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Current</span>
                 <span className="text-xl font-black text-blue-500">{root}{type === 'maj' ? '' : type}</span>
              </div>
              
              {mode === 'shape' && fingerings.length > 1 && (
                <div className="flex items-center gap-3">
                   <span className="text-[9px] font-bold text-zinc-500">Var {variationIdx + 1}/{fingerings.length}</span>
                   <button 
                    onClick={() => setVariationIdx(v => (v + 1) % fingerings.length)}
                    className={`p-2 rounded-full border ${isDark ? 'bg-zinc-800 border-white/5 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900 shadow-sm'}`}
                   >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                   </button>
                </div>
              )}
              
              {mode === 'notes' && (
                <div className="flex gap-4">
                   {CHORD_FORMULAS[type]?.labels.map((l, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                         <div className={`w-2 h-2 rounded-full ${l === 'R' ? 'bg-blue-500' : (isDark ? 'bg-zinc-800' : 'bg-zinc-200')}`}></div>
                         <span className="text-[9px] font-black text-zinc-500 uppercase">{l}</span>
                      </div>
                   ))}
                </div>
              )}
           </div>
        </div>

        {/* Выбор Тоники */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Root Note</h3>
          <div className="grid grid-cols-6 gap-2">
            {NOTES.map(n => (
              <button 
                key={n} 
                onClick={() => { setRoot(n); setVariationIdx(0); }}
                className={`py-3 rounded-2xl font-black text-xs transition-all active:scale-90 border ${root === n ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm')}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор Типа */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className={`text-[9px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Chord Quality</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(CHORD_FORMULAS).map(t => (
              <button 
                key={t} 
                onClick={() => { setType(t); setVariationIdx(0); }}
                className={`px-5 py-3 rounded-2xl font-black text-xs transition-all active:scale-90 border ${type === t ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm')}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
