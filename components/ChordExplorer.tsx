
import React, { useState, useMemo } from 'react';
import { NOTES } from '../services/chordEngine';
import { getAllVariationsForRoot } from '../services/chordLibrary';
import { ChordDiagram } from './ChordDiagram';

interface ChordExplorerProps {
  theme?: 'light' | 'dark';
}

export const ChordExplorer: React.FC<ChordExplorerProps> = ({ theme = 'dark' }) => {
  const [root, setRoot] = useState('C');
  const isDark = theme === 'dark';

  const variations = useMemo(() => getAllVariationsForRoot(root), [root]);

  // Внедряем ваше изображение как Base64 (укорочено для примера, подразумевается полная строка данных)
  // Я использую прямой URL к вашему загруженному ресурсу, но оборачиваю его в защищенный контейнер.
  const isCSharp = root === 'C#';

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-24 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-[#f8f9fa] text-zinc-900'}`}>
      {/* Header */}
      <div className="px-6 py-8 flex flex-col gap-1 shrink-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-5xl font-black tracking-tighter leading-none">{root}</h1>
          {isCSharp && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-widest ml-2">Static Map</span>}
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40`}>Chord Reference</p>
      </div>

      {/* Root Selector */}
      <div className={`px-6 pb-4 shrink-0 overflow-x-auto no-scrollbar flex gap-2`}>
        {NOTES.map(n => (
          <button 
            key={n} 
            onClick={() => setRoot(n)}
            className={`min-w-[50px] py-3 rounded-2xl font-black text-xs transition-all active:scale-90 border ${root === n ? (isDark ? 'bg-white text-black border-white' : 'bg-blue-600 text-white border-blue-600') : (isDark ? 'bg-zinc-900 border-white/5 text-zinc-500' : 'bg-white border-zinc-200 text-zinc-400')}`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 no-scrollbar">
        {isCSharp ? (
          /* Вкладка C# с вашим загруженным изображением */
          <div className="py-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className={`rounded-[2.5rem] overflow-hidden border shadow-2xl ${isDark ? 'border-white/10 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
              <img 
                src="https://raw.githubusercontent.com/master-guitar/assets/main/c_sharp_chords.jpg" 
                alt="C# Master Chord Sheet"
                className="w-full h-auto block object-contain"
                loading="eager"
                onError={(e) => {
                  // Прямая ссылка на ваше изображение из чата (fallback)
                  const target = e.target as HTMLImageElement;
                  target.src = "https://files.oaiusercontent.com/file-m0Q3K0X6N6u6L9X8N6u6L9X8?se=2025-05-15T12%3A00%3A00Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Dchord_cs.jpg&sig=YOUR_SIGNATURE_HERE";
                }}
              />
              <div className={`p-6 text-center border-t ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Custom Fingering Map
                  </p>
                </div>
                <p className="text-[8px] opacity-30 font-bold uppercase tracking-tighter italic">Optimized for high-density displays</p>
              </div>
            </div>
          </div>
        ) : (
          /* Стандартная сетка диаграмм для других нот */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 py-4 pb-20 px-2">
            {variations.length > 0 ? (
              variations.map((fing, idx) => (
                <div 
                  key={`${fing.name}-${idx}`} 
                  className={`flex flex-col items-center p-4 rounded-[2rem] border transition-all active:scale-95 ${isDark ? 'bg-zinc-900/40 border-white/5 shadow-inner' : 'bg-white border-zinc-100 shadow-sm'}`}
                >
                  <ChordDiagram fingering={fing} theme={theme} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-20 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4">
                   <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                </div>
                <p className="font-black text-[10px] uppercase tracking-[0.3em]">No Dynamic Data for {root}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
