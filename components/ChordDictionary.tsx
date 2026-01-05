
import React, { useState } from 'react';
import { CircleOfFifths } from './CircleOfFifths';
import { ChordDiagram } from './ChordDiagram';
import { getFingerings } from '../services/chordLibrary';

const MAJOR_STEPS = ['', 'm', 'm', '', '', 'm', 'dim'];
const MINOR_STEPS = ['m', 'dim', '', 'm', 'm', '', ''];

interface ChordDictionaryProps {
  theme?: 'light' | 'dark';
}

export const ChordDictionary: React.FC<ChordDictionaryProps> = ({ theme = 'dark' }) => {
  const [selectedKey, setSelectedKey] = useState('C');
  const [isMinor, setIsMinor] = useState(false);
  const [viewingChord, setViewingChord] = useState<string | null>(null);
  const [variationIdx, setVariationIdx] = useState(0);
  const isDark = theme === 'dark';

  const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const getNoteIndex = (note: string) => {
    const map: Record<string, string> = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };
    const normalized = map[note] || note;
    return chromatic.indexOf(normalized);
  };

  const getScaleChords = () => {
    const rootIdx = getNoteIndex(selectedKey);
    if (rootIdx === -1) return [];
    const intervals = isMinor ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
    const steps = isMinor ? MINOR_STEPS : MAJOR_STEPS;
    return intervals.map((interval, i) => {
      const note = chromatic[(rootIdx + interval) % 12];
      return note + steps[i];
    });
  };

  const currentChords = getScaleChords();
  const fingerings = viewingChord ? getFingerings(viewingChord) : [];

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-32 px-4 overflow-y-auto ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className="py-6 text-center">
        <h1 className={`text-2xl font-black uppercase tracking-widest ${isDark ? 'text-white/50' : 'text-zinc-300'}`}>Chord Circle</h1>
      </div>

      <div className="flex justify-center mb-4">
        <div className={`p-1 rounded-xl flex gap-1 ${isDark ? 'bg-[#1e1e1e]' : 'bg-zinc-200'}`}>
          <button 
            onClick={() => setIsMinor(false)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isMinor ? (isDark ? 'bg-blue-600 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
          >
            Major
          </button>
          <button 
            onClick={() => setIsMinor(true)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isMinor ? (isDark ? 'bg-blue-600 text-white' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
          >
            Minor
          </button>
        </div>
      </div>

      <CircleOfFifths 
        selectedKey={selectedKey} 
        onSelectKey={setSelectedKey} 
        isMinor={isMinor} 
        theme={theme}
      />

      <div className="mt-8">
        <h3 className={`text-[10px] uppercase font-black tracking-widest mb-4 px-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          Diatonic Chords in {selectedKey} {isMinor ? 'Minor' : 'Major'}
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {currentChords.map(chord => (
            <button
              key={chord}
              onClick={() => {
                setViewingChord(chord);
                setVariationIdx(0);
              }}
              className={`py-3 rounded-xl font-bold text-sm transition-all active:scale-90 border ${viewingChord === chord ? (isDark ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-blue-600 text-white border-blue-500') : (isDark ? 'bg-zinc-900 text-white border-white/5' : 'bg-white text-zinc-700 border-zinc-200')}`}
            >
              {chord}
            </button>
          ))}
        </div>
      </div>

      {viewingChord && (
        <div className="mt-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
          <div className={`p-6 rounded-3xl border flex flex-col items-center w-full max-w-xs shadow-xl ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-100'}`}>
            {fingerings.length > 0 ? (
              <>
                <ChordDiagram fingering={fingerings[variationIdx % fingerings.length]} theme={theme} />
                {fingerings.length > 1 && (
                   <div className="mt-6 flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        {fingerings.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (variationIdx % fingerings.length) ? (isDark ? 'bg-yellow-500' : 'bg-blue-600') : (isDark ? 'bg-zinc-700' : 'bg-zinc-200')}`} />
                        ))}
                      </div>
                      <button 
                        onClick={() => setVariationIdx(v => v + 1)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 border ${isDark ? 'bg-white/5 text-zinc-400 border-white/5' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}
                      >
                        Next Variation
                      </button>
                   </div>
                )}
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-red-500 font-bold mb-2">Shape Unavailable</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Check back in future updates</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
