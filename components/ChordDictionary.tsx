
import React, { useState } from 'react';
import { CircleOfFifths } from './CircleOfFifths';
import { ChordDiagram } from './ChordDiagram';
import { getFingerings } from '../services/chordLibrary';

const MAJOR_STEPS = ['', 'm', 'm', '', '', 'm', 'dim'];
const MINOR_STEPS = ['m', 'dim', '', 'm', 'm', '', ''];

export const ChordDictionary: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('C');
  const [isMinor, setIsMinor] = useState(false);
  const [viewingChord, setViewingChord] = useState<string | null>(null);
  const [variationIdx, setVariationIdx] = useState(0);

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
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)] pb-32 px-4 overflow-y-auto">
      <div className="py-6 text-center">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white/50">Chord Circle</h1>
      </div>

      <div className="flex justify-center mb-4">
        <div className="bg-[#1e1e1e] p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setIsMinor(false)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isMinor ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
          >
            Major
          </button>
          <button 
            onClick={() => setIsMinor(true)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isMinor ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}
          >
            Minor
          </button>
        </div>
      </div>

      <CircleOfFifths 
        selectedKey={selectedKey} 
        onSelectKey={setSelectedKey} 
        isMinor={isMinor} 
      />

      <div className="mt-8">
        <h3 className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-4 px-2">
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
              className={`py-3 rounded-xl font-bold text-sm transition-all active:scale-90 ${viewingChord === chord ? 'bg-yellow-500 text-black' : 'bg-zinc-900 text-white border border-white/5'}`}
            >
              {chord}
            </button>
          ))}
        </div>
      </div>

      {viewingChord && (
        <div className="mt-10 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 flex flex-col items-center w-full max-w-xs">
            {fingerings.length > 0 ? (
              <>
                <ChordDiagram fingering={fingerings[variationIdx % fingerings.length]} />
                {fingerings.length > 1 && (
                   <div className="mt-6 flex flex-col items-center gap-2">
                      <div className="flex gap-1">
                        {fingerings.map((_, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (variationIdx % fingerings.length) ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                        ))}
                      </div>
                      <button 
                        onClick={() => setVariationIdx(v => v + 1)}
                        className="bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-400 active:bg-white/10"
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
