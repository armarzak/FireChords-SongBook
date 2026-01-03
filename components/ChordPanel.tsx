
import React, { useState } from 'react';
import { ChordDiagram } from './ChordDiagram';
import { getFingerings } from '../services/chordLibrary';

interface ChordPanelProps {
  chords: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ChordSection: React.FC<{ chord: string }> = ({ chord }) => {
  const fingerings = getFingerings(chord);
  const [variationIdx, setVariationIdx] = useState(0);

  if (fingerings.length === 0) {
    return (
      <div className="w-28 bg-red-500/5 border border-red-500/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
        <span className="text-red-500 font-bold text-xs mb-1">{chord}</span>
        <span className="text-[8px] text-zinc-500 leading-tight">Shape not available.</span>
      </div>
    );
  }

  const nextVar = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setVariationIdx((prev) => (prev + 1) % fingerings.length);
  };

  return (
    <div 
      className="relative group flex flex-col items-center mb-4 cursor-pointer active:scale-95 transition-transform"
      onClick={nextVar}
    >
      <ChordDiagram fingering={fingerings[variationIdx % fingerings.length]} />
      
      {fingerings.length > 1 && (
        <div className="flex flex-col items-center mt-2 pointer-events-none">
          <div className="flex gap-1 mb-1">
            {fingerings.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1 h-1 rounded-full transition-colors ${idx === (variationIdx % fingerings.length) ? 'bg-yellow-500 scale-125' : 'bg-zinc-800'}`} 
              />
            ))}
          </div>
          <span className="text-[7px] text-zinc-500 uppercase font-black">
            Tap for variation {variationIdx + 1}/{fingerings.length}
          </span>
        </div>
      )}
    </div>
  );
};

export const ChordPanel: React.FC<ChordPanelProps> = ({ chords, isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-transparent"
          onClick={onClose}
        />
      )}
      
      <div 
        className={`fixed top-0 right-0 bottom-0 w-36 bg-black/95 border-l border-white/10 z-[120] transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto pt-[env(safe-area-inset-top)] pb-24 px-3 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]`}
      >
        <div className="flex flex-col items-center py-6">
          <div className="mb-8 flex flex-col items-center">
            <h3 className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black mb-2">Shapes</h3>
            <div className="h-0.5 w-4 bg-yellow-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            {chords.length > 0 ? (
              chords.map((chord, idx) => (
                <ChordSection key={`${chord}-${idx}`} chord={chord} />
              ))
            ) : (
              <div className="text-[10px] text-zinc-700 text-center italic py-20 px-4">
                No chords detected
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
