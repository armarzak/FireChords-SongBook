
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types';
import { transposeText, chordSplitRegex } from '../services/chordService';
import { ChordPanel } from './ChordPanel';
import { ChordDiagram } from './ChordDiagram';
import { getFingerings } from '../services/chordLibrary';

interface PerformanceViewProps {
  song: Song;
  onClose: () => void;
  onEdit: () => void;
  onUpdateTranspose: (id: string, newTranspose: number) => void;
}

const sectionRegex = /^\[?(Intro|Verse|Chorus|Bridge|Outro|Solo|Instrumental|Припев|Куплет|Вступление|Проигрыш|Кода|Соло)(?:\s*\d+)?\]?:?\s*$/i;

export const PerformanceView: React.FC<PerformanceViewProps> = ({ song, onClose, onEdit, onUpdateTranspose }) => {
  const [transpose, setTranspose] = useState(song.transpose || 0);
  const [fontSize, setFontSize] = useState(18);
  const [scrolling, setScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50); 
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false);
  const [popover, setPopover] = useState<{ name: string; x: number; y: number; variation: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const renderContent = () => {
    const text = transposeText(song.content, transpose);
    return text.split('\n').map((line, i) => {
      const isSection = sectionRegex.test(line.trim());
      const parts = line.split(chordSplitRegex);
      
      return (
        <div key={i} className={`min-h-[1.2em] leading-tight transition-all ${isSection ? 'text-blue-400 font-black mt-6 mb-2' : ''}`}>
          {parts.map((part, pi) => {
            const isChord = part.match(/^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*$/);
            if (isChord) {
              return (
                <button 
                  key={pi} 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setPopover(popover?.name === part ? null : { name: part, x: rect.left + rect.width / 2, y: rect.top, variation: 0 });
                  }}
                  className={`text-yellow-400 font-bold px-0.5 rounded transition-colors ${popover?.name === part ? 'bg-yellow-400/20 ring-1 ring-yellow-400/50' : ''}`}
                >
                  {part}
                </button>
              );
            }
            return <span key={pi}>{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col text-white overscroll-none">
      <div className="pt-[env(safe-area-inset-top)] bg-zinc-900 border-b border-zinc-800 px-4 flex justify-between items-center h-20 shrink-0 z-[140]">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-zinc-400 px-2 py-4 text-sm font-medium">Back</button>
          <button onClick={onEdit} className="text-blue-500 px-2 py-4 text-sm font-bold">Edit</button>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-bold truncate max-w-[120px] mb-1 opacity-50 uppercase tracking-widest">{song.title}</h2>
          <div className="flex gap-2">
             <div className="flex items-center bg-zinc-800 rounded-lg">
               <button onClick={() => setFontSize(s => Math.max(s-2, 10))} className="w-8 h-6 flex items-center justify-center font-bold">A-</button>
               <button onClick={() => setFontSize(s => Math.min(s+2, 80))} className="w-8 h-6 flex items-center justify-center font-bold">A+</button>
             </div>
             <div className="flex items-center bg-zinc-800 rounded-lg">
               <button onClick={() => { const val = transpose-1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-8 h-6 flex items-center justify-center font-bold">-</button>
               <button onClick={() => { const val = transpose+1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-8 h-6 flex items-center justify-center font-bold">+</button>
             </div>
          </div>
        </div>
        <button onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} className="font-bold text-[11px] px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 uppercase tracking-wider">Chords</button>
      </div>

      <div 
        ref={containerRef}
        onClick={() => setPopover(null)}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto px-4 py-8 mono-grid whitespace-pre-wrap select-none"
      >
        <div className="mb-10" style={{ fontSize: '1rem', fontFamily: 'sans-serif' }}>
            <h1 className="text-4xl font-black mb-1">{song.title}</h1>
            <p className="text-xl text-zinc-500 mb-4">{song.artist}</p>
            {(song.capo || song.tuning) && (
              <div className="flex gap-4">
                {song.capo ? <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Capo {song.capo}</span> : null}
                {song.tuning ? <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{song.tuning}</span> : null}
              </div>
            )}
            {song.authorName && (
              <p className="text-xs text-zinc-600 mt-2 font-bold uppercase tracking-widest">Shared by: {song.authorName}</p>
            )}
        </div>
        <div className="leading-[1.65] pb-32">{renderContent()}</div>
      </div>

      {popover && (
        <div className="fixed z-[200] animate-in zoom-in-95 pointer-events-none" style={{ left: `${popover.x}px`, top: `${popover.y - 10}px`, transform: 'translate(-50%, -100%)' }}>
          <div className="pointer-events-auto" onClick={(e) => {
            e.stopPropagation();
            const fings = getFingerings(popover.name);
            if (fings.length > 1) setPopover({ ...popover, variation: (popover.variation + 1) % fings.length });
          }}>
            {(() => {
              const fingerings = getFingerings(popover.name);
              const fingering = fingerings[popover.variation % fingerings.length];
              if (!fingering) return null;
              return (
                <div className="relative">
                  <ChordDiagram fingering={fingering} />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900"></div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-3xl border-t border-zinc-800 px-6 pb-[calc(15px+env(safe-area-inset-bottom))] pt-5 flex flex-col gap-4 z-[130]">
        <button onClick={() => setScrolling(!scrolling)} className={`w-full py-4 rounded-2xl font-black text-lg ${scrolling ? 'bg-red-500' : 'bg-blue-600'}`}>
          {scrolling ? 'STOP' : 'AUTO-SCROLL'}
        </button>
      </div>
      <ChordPanel chords={[]} isOpen={isChordPanelOpen} onClose={() => setIsChordPanelOpen(false)} />
    </div>
  );
};
