
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
}

const sectionRegex = /^\[?(Intro|Verse|Chorus|Bridge|Outro|Solo|Instrumental|Припев|Куплет|Вступление|Проигрыш|Кода|Соло)(?:\s*\d+)?\]?:?\s*$/i;

export const PerformanceView: React.FC<PerformanceViewProps> = ({ song, onClose, onEdit, onUpdateTranspose }) => {
  const [transpose, setTranspose] = useState(song.transpose || 0);
  const [fontSize, setFontSize] = useState(18);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = normal, 2 = fast, 0.5 = slow
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false);
  const [popover, setPopover] = useState<{ name: string; x: number; y: number; variation: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollPosRef = useRef(0);
  const requestRef = useRef<number | null>(null);

  const scrollStep = () => {
    if (!isScrolling || !containerRef.current) return;
    
    // Плавное приращение позиции
    scrollPosRef.current += (scrollSpeed * 0.5);
    containerRef.current.scrollTop = scrollPosRef.current;

    // Остановка, если дошли до конца
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

  // Fixed the type error by explicitly casting matches to string array to avoid 'unknown' type in map
  const detectedChords = Array.from(new Set(
    (song.content.match(/[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*/g) || []) as string[]
  )).map(c => transposeChord(c, transpose));

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col text-white overscroll-none">
      {/* Header */}
      <div className="pt-[env(safe-area-inset-top)] bg-zinc-900 border-b border-white/5 px-4 flex justify-between items-center h-20 shrink-0 z-[140]">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-zinc-500 px-3 py-2 text-sm font-bold active:text-white">Back</button>
          <button onClick={onEdit} className="text-blue-500 px-3 py-2 text-sm font-bold active:scale-95">Edit</button>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-black truncate max-w-[140px] mb-1 opacity-50 uppercase tracking-widest text-center">{song.title}</h2>
          <div className="flex gap-2">
             <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
               <button onClick={() => setFontSize(s => Math.max(s-2, 10))} className="w-8 h-7 flex items-center justify-center font-bold text-xs active:bg-zinc-700">A-</button>
               <div className="w-[1px] h-4 bg-zinc-700"></div>
               <button onClick={() => setFontSize(s => Math.min(s+2, 40))} className="w-8 h-7 flex items-center justify-center font-bold text-xs active:bg-zinc-700">A+</button>
             </div>
             <div className="flex items-center bg-zinc-800 rounded-lg overflow-hidden border border-white/5">
               <button onClick={() => { const val = transpose-1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-8 h-7 flex items-center justify-center font-bold text-xs active:bg-zinc-700">-</button>
               <div className="w-[1px] h-4 bg-zinc-700"></div>
               <button onClick={() => { const val = transpose+1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-8 h-7 flex items-center justify-center font-bold text-xs active:bg-zinc-700">+</button>
             </div>
          </div>
        </div>
        <button onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} className="font-black text-[10px] px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider active:scale-95">Chords</button>
      </div>

      {/* Main Content */}
      <div 
        ref={containerRef}
        onClick={() => setPopover(null)}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto px-6 py-10 mono-grid whitespace-pre-wrap select-none scroll-smooth"
      >
        <div className="mb-12" style={{ fontSize: '1rem', fontFamily: 'sans-serif' }}>
            <h1 className="text-5xl font-black mb-2 tracking-tighter">{song.title}</h1>
            <p className="text-2xl text-zinc-500 font-bold mb-6">{song.artist}</p>
            <div className="flex flex-wrap gap-2">
              {song.capo ? <span className="bg-blue-600/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Capo {song.capo}</span> : null}
              {song.tuning && song.tuning !== 'Standard' ? <span className="bg-zinc-800 text-zinc-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">{song.tuning}</span> : null}
              {song.authorName && <span className="bg-zinc-900 text-zinc-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">By {song.authorName}</span>}
            </div>
        </div>
        <div className="leading-[1.7] pb-64">{renderContent()}</div>
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
                  <ChordDiagram fingering={fingering} />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-zinc-900"></div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-3xl border-t border-white/5 px-6 pb-[calc(20px+env(safe-area-inset-bottom))] pt-6 flex flex-col gap-4 z-[130]">
        <div className="flex items-center gap-4">
           <div className="flex-1 flex bg-black/40 p-1 rounded-2xl border border-white/5">
              {[0.5, 1, 2].map(speed => (
                <button 
                  key={speed}
                  onClick={() => setScrollSpeed(speed)}
                  className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${scrollSpeed === speed ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-600'}`}
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
            className={`flex-[2] py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${isScrolling ? 'bg-red-500 text-white' : 'bg-blue-600 text-white active:scale-95 shadow-xl shadow-blue-600/20'}`}
          >
            {isScrolling ? (
              <><span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Stop Scroll</>
            ) : 'Auto Scroll'}
          </button>
        </div>
      </div>
      
      <ChordPanel chords={detectedChords} isOpen={isChordPanelOpen} onClose={() => setIsChordPanelOpen(false)} />
    </div>
  );
};

// Вспомогательная функция для обновления аккордов в списке
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
