
import React, { useState, useEffect, useRef } from 'react';
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
  theme?: 'light' | 'dark';
}

const sectionRegex = /^\[?(Intro|Verse|Chorus|Bridge|Outro|Solo|Instrumental|Припев|Куплет|Вступление|Проигрыш|Кода|Соло)(?:\s*\d+)?\]?:?\s*$/i;

export const PerformanceView: React.FC<PerformanceViewProps> = ({ song, onClose, onEdit, onUpdateTranspose, theme = 'dark' }) => {
  const [transpose, setTranspose] = useState(song.transpose || 0);
  const [fontSize, setFontSize] = useState(16); 
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); 
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false);
  const [popover, setPopover] = useState<{ name: string; x: number; y: number; variation: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const isDark = theme === 'dark';

  const scrollStep = () => {
    if (!isScrolling || !containerRef.current) return;
    
    scrollPosRef.current += (scrollSpeed * 0.5);
    containerRef.current.scrollTop = scrollPosRef.current;

    if (containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 5) {
      setIsScrolling(false);
      return;
    }

    requestRef.current = requestAnimationFrame(scrollStep);
  };

  useEffect(() => {
    if (isScrolling) {
      scrollPosRef.current = containerRef.current?.scrollTop || 0;
      requestRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isScrolling, scrollSpeed]);

  const renderContent = () => {
    const text = transposeText(song.content, transpose);
    return text.split('\n').map((line, i) => {
      const isSection = sectionRegex.test(line.trim());
      const parts = line.split(chordSplitRegex);
      
      return (
        <div key={i} className={`min-h-[1.2em] leading-tight transition-all ${isSection ? 'text-blue-500 font-black mt-6 mb-2' : ''}`}>
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
                  className={`font-bold px-0.5 rounded transition-colors ${isDark ? 'text-yellow-400' : 'text-blue-600'} ${popover?.name === part ? (isDark ? 'bg-yellow-400/20 ring-1 ring-yellow-400/50' : 'bg-blue-600/10 ring-1 ring-blue-600/50') : ''}`}
                >
                  {part}
                </button>
              );
            }
            return <span key={pi} className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const detectedChords = Array.from(new Set(
    (song.content.match(/[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*/g) || []) as string[]
  )).map(c => transposeChord(c, transpose));

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col overscroll-none transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      {/* Header */}
      <div className={`pt-[env(safe-area-inset-top)] border-b px-4 flex justify-between items-center h-20 shrink-0 z-[140] ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className={`px-2 py-2 text-sm font-bold active:scale-95 transition-colors ${isDark ? 'text-zinc-500 active:text-white' : 'text-zinc-400 active:text-zinc-900'}`}>Back</button>
          <button onClick={onEdit} className="text-blue-500 px-2 py-2 text-sm font-bold active:scale-95">Edit</button>
        </div>
        <div className="flex flex-col items-center flex-1 px-2">
          <h2 className={`text-[9px] font-black truncate max-w-[120px] mb-1 opacity-50 uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>{song.title}</h2>
          <div className="flex gap-1.5">
             <div className={`flex items-center rounded-lg overflow-hidden border ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-white border-zinc-200'}`}>
               <button onClick={() => setFontSize(s => Math.max(s-1, 8))} className="w-7 h-6 flex items-center justify-center font-bold text-[10px] active:bg-zinc-700 active:text-white">A-</button>
               <div className={`w-[1px] h-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
               <button onClick={() => setFontSize(s => Math.min(s+1, 30))} className="w-7 h-6 flex items-center justify-center font-bold text-[10px] active:bg-zinc-700 active:text-white">A+</button>
             </div>
             <div className={`flex items-center rounded-lg overflow-hidden border ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-white border-zinc-200'}`}>
               <button onClick={() => { const val = transpose-1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-7 h-6 flex items-center justify-center font-bold text-[10px] active:bg-zinc-700 active:text-white">-</button>
               <div className={`w-[1px] h-3 ${isDark ? 'bg-zinc-700' : 'bg-zinc-200'}`}></div>
               <button onClick={() => { const val = transpose+1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-7 h-6 flex items-center justify-center font-bold text-[10px] active:bg-zinc-700 active:text-white">+</button>
             </div>
          </div>
        </div>
        <button onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} className={`font-black text-[9px] px-3 py-2 rounded-full uppercase tracking-wider active:scale-95 transition-all ${isDark ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}>Chords</button>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        onClick={() => setPopover(null)}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto overflow-x-auto px-3 py-8 mono-grid whitespace-pre select-none scroll-smooth"
      >
        <div className="mb-8" style={{ fontSize: '1rem', fontFamily: 'sans-serif', whiteSpace: 'normal' }}>
            <h1 className="text-4xl font-black mb-1 tracking-tighter leading-none">{song.title}</h1>
            <p className={`text-xl font-bold mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{song.artist}</p>
            <div className="flex flex-wrap gap-1.5">
              {song.capo ? <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">Capo {song.capo}</span> : null}
              {song.tuning && song.tuning !== 'Standard' ? <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-zinc-800 text-zinc-400 border-white/5' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>{song.tuning}</span> : null}
            </div>
        </div>
        <div className="leading-[1.6] pb-64 inline-block min-w-full">
            {renderContent()}
        </div>
      </div>

      {/* Chord Popover */}
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
                  <ChordDiagram fingering={fingering} theme={theme} />
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] ${isDark ? 'border-t-zinc-900' : 'border-t-white'}`}></div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className={`fixed bottom-0 left-0 right-0 border-t px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-4 flex flex-col gap-3 z-[130] ${isDark ? 'bg-zinc-900/95 backdrop-blur-3xl border-white/5' : 'bg-zinc-50/95 backdrop-blur-3xl border-zinc-200'}`}>
        <div className="flex items-center gap-3">
           <div className={`flex-1 flex p-1 rounded-xl border ${isDark ? 'bg-black/40 border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
              {[0.5, 1, 2].map(speed => (
                <button 
                  key={speed}
                  onClick={() => setScrollSpeed(speed)}
                  className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition-all ${scrollSpeed === speed ? (isDark ? 'bg-zinc-700 text-white shadow-lg' : 'bg-zinc-100 text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
                >
                  {speed === 0.5 ? 'SLOW' : speed === 1 ? 'MED' : 'FAST'}
                </button>
              ))}
           </div>
           <button 
            onClick={() => {
              if (isScrolling) setIsScrolling(false);
              else {
                scrollPosRef.current = containerRef.current?.scrollTop || 0;
                setIsScrolling(true);
              }
            }} 
            className={`flex-[1.5] py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isScrolling ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-blue-600 text-white active:scale-95 shadow-xl shadow-blue-600/20'}`}
          >
            {isScrolling ? (
              <><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> Stop</>
            ) : 'Auto Scroll'}
          </button>
        </div>
      </div>
      
      <ChordPanel chords={detectedChords} theme={theme} isOpen={isChordPanelOpen} onClose={() => setIsChordPanelOpen(false)} />
    </div>
  );
};

function transposeChord(chord: string, semitones: number): string {
  const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const normalizationMap: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
  };

  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  let baseNote = match[1];
  const suffix = match[2];

  if (normalizationMap[baseNote]) baseNote = normalizationMap[baseNote];
  const index = chromaticScale.indexOf(baseNote);
  if (index === -1) return chord;

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return chromaticScale[newIndex] + suffix;
}
