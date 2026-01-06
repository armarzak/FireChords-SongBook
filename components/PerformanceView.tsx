
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Song } from '../types';
import { transposeText, chordSplitRegex, transposeChord } from '../services/chordService';
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

const sectionKeywords = 'Intro|Verse|Chorus|Bridge|Outro|Solo|Instrumental|Припев|Куплет|Вступление|Проигрыш|Кода|Соло';
const sectionRegex = new RegExp(`^\\s*[\\[\\(]?(${sectionKeywords})(?:\\s*\\d+)?[\\]\\)]?:?\\s*$`, 'i');

export const PerformanceView: React.FC<PerformanceViewProps> = ({ song, onClose, onEdit, onUpdateTranspose, theme = 'dark' }) => {
  const [transpose, setTranspose] = useState(song.transpose || 0);
  const [fontSize, setFontSize] = useState(16); 
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); 
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false);
  const [popover, setPopover] = useState<{ name: string; x: number; y: number; variation: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  
  const virtualScrollRef = useRef<number>(0);
  const lastAppliedScrollRef = useRef<number>(0);

  const isDark = theme === 'dark';

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const lines = song.content.split('\n');
    let maxChars = 10;
    lines.forEach(line => {
      if (line.length > maxChars) maxChars = line.length;
    });
    const padding = 40;
    const availableWidth = containerRef.current.clientWidth - padding;
    let calculatedSize = Math.floor(availableWidth / (maxChars * 0.61));
    calculatedSize = Math.max(8, Math.min(calculatedSize, 24));
    setFontSize(calculatedSize);
  }, [song.content]);

  const scrollStep = () => {
    if (!isScrolling || !containerRef.current) return;
    const element = containerRef.current;
    const currentActualScroll = element.scrollTop;
    if (Math.abs(currentActualScroll - lastAppliedScrollRef.current) > 1) {
      virtualScrollRef.current = currentActualScroll;
    }
    virtualScrollRef.current += (scrollSpeed * 0.6);
    element.scrollTop = virtualScrollRef.current;
    lastAppliedScrollRef.current = element.scrollTop;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 5) {
      setIsScrolling(false);
      return;
    }
    requestRef.current = requestAnimationFrame(scrollStep);
  };

  useEffect(() => {
    if (isScrolling) {
      if (containerRef.current) {
        virtualScrollRef.current = containerRef.current.scrollTop;
        lastAppliedScrollRef.current = containerRef.current.scrollTop;
      }
      requestRef.current = requestAnimationFrame(scrollStep);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isScrolling, scrollSpeed]);

  const renderContent = () => {
    const text = transposeText(song.content, transpose);
    return text.split('\n').map((line: string, i: number) => {
      const trimmedLine = line.trim();
      const isSection = sectionRegex.test(trimmedLine);
      
      if (isSection) {
        return (
          <div key={i} className="text-blue-500 font-black mt-8 mb-2 tracking-widest uppercase text-[0.85em] border-b border-blue-500/10 pb-1">
            {trimmedLine}
          </div>
        );
      }

      const parts = line.split(chordSplitRegex);
      return (
        <div key={i} className="min-h-[1.2em] leading-tight whitespace-pre-wrap break-words">
          {parts.map((part: string, pi: number) => {
            if (typeof part !== 'string') return null;
            
            const chordMatch = part.match(/([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)/);
            if (chordMatch && part.trim().length < 15) {
              const chordName = chordMatch[0];
              const partsOfLine = part.split(chordName);
              
              return (
                <React.Fragment key={pi}>
                  {partsOfLine[0]}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      // Используем fixed поповер, поэтому передаем координаты вьюпорта
                      setPopover(popover?.name === chordName ? null : { 
                        name: chordName, 
                        x: rect.left + rect.width / 2, 
                        y: rect.top, 
                        variation: 0 
                      });
                    }}
                    className={`font-bold px-0.5 rounded transition-all duration-200 ${isDark ? 'text-yellow-400' : 'text-blue-600'} ${popover?.name === chordName ? (isDark ? 'bg-yellow-400/20 ring-1 ring-yellow-400/50' : 'bg-blue-600/10 ring-1 ring-blue-600/50 scale-110') : 'active:scale-125'}`}
                  >
                    {chordName}
                  </button>
                  {partsOfLine[1]}
                </React.Fragment>
              );
            }
            return <span key={pi} className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const detectedChords = Array.from(new Set(
    (song.content.match(/([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)/g) || [])
  )).map((c: string) => transposeChord(c, transpose));

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col overscroll-none transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-zinc-900'}`}>
      <div className={`pt-[env(safe-area-inset-top)] border-b px-4 flex justify-between items-center h-20 shrink-0 z-[140] ${isDark ? 'bg-zinc-900 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className={`px-2 py-2 text-sm font-bold active:scale-95 transition-colors ${isDark ? 'text-zinc-500 active:text-white' : 'text-zinc-400 active:text-zinc-900'}`}>Back</button>
          <button onClick={onEdit} className="text-blue-500 px-2 py-2 text-sm font-bold active:scale-95">Edit</button>
        </div>
        
        <div className="flex flex-col items-center flex-1 px-2">
          <h2 className={`text-[9px] font-black truncate max-w-[100px] mb-1 opacity-50 uppercase tracking-widest text-center ${isDark ? 'text-white' : 'text-zinc-900'}`}>{song.title}</h2>
          <div className="flex gap-3 items-center">
             <div className="flex flex-col items-center gap-0.5">
               <span className="text-[7px] font-black opacity-30 uppercase tracking-tighter">Tr</span>
               <div className={`flex items-center rounded-lg overflow-hidden border ${isDark ? 'bg-zinc-800 border-white/5' : 'bg-white border-zinc-200'}`}>
                 <button onClick={() => { const val = transpose-1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-7 h-6 flex items-center justify-center font-bold text-[9px] active:bg-zinc-700 active:text-white">-</button>
                 <div className={`min-w-[20px] px-1 flex items-center justify-center text-[8px] font-black tabular-nums ${transpose !== 0 ? (isDark ? 'text-blue-400' : 'text-blue-600') : (isDark ? 'text-zinc-600' : 'text-zinc-400')}`}>
                   {transpose > 0 ? `+${transpose}` : transpose}
                 </div>
                 <button onClick={() => { const val = transpose+1; setTranspose(val); onUpdateTranspose(song.id, val); }} className="w-7 h-6 flex items-center justify-center font-bold text-[9px] active:bg-zinc-700 active:text-white">+</button>
               </div>
             </div>
          </div>
        </div>
        
        <button onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} className={`font-black text-[9px] px-3 py-2 rounded-full uppercase tracking-wider active:scale-95 transition-all ${isDark ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'}`}>Chords</button>
      </div>

      <div 
        ref={containerRef}
        onClick={() => setPopover(null)}
        className="flex-1 overflow-auto select-none scroll-smooth touch-pan-y"
      >
        <div className="inline-block w-full px-5 py-8 mono-grid" style={{ fontSize: `${fontSize}px` }}>
            <div className="mb-8" style={{ fontSize: '1rem', fontFamily: 'sans-serif', whiteSpace: 'normal' }}>
                <h1 className="text-4xl font-black mb-1 tracking-tighter leading-none">{song.title}</h1>
                <p className={`text-xl font-bold mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{song.artist}</p>
            </div>

            <div className="leading-[1.6] pb-64">
                {renderContent()}
            </div>
        </div>
      </div>

      {popover && (
        <div 
          className="fixed z-[300] animate-in zoom-in-95 fade-in duration-200" 
          style={{ left: `${popover.x}px`, top: `${popover.y - 12}px`, transform: 'translate(-50%, -100%)' }}
        >
          <div className="relative pointer-events-auto" onClick={(e) => {
            e.stopPropagation();
            const fings = getFingerings(popover.name);
            if (fings.length > 1) setPopover({ ...popover, variation: (popover.variation + 1) % fings.length });
          }}>
            {(() => {
              const fingerings = getFingerings(popover.name);
              const fingering = fingerings[popover.variation % fingerings.length];
              
              if (!fingering) {
                return (
                  <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-[10px] font-black uppercase tracking-widest ${isDark ? 'bg-zinc-900 border-red-500/30 text-red-500' : 'bg-white border-red-100 text-red-600'}`}>
                    Shape not found
                  </div>
                );
              }

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

      <div className={`fixed bottom-0 left-0 right-0 border-t px-4 pb-[calc(10px+env(safe-area-inset-bottom))] pt-4 flex flex-col gap-4 z-[130] ${isDark ? 'bg-zinc-900/95 backdrop-blur-3xl border-white/5' : 'bg-zinc-50/95 backdrop-blur-3xl border-zinc-200'}`}>
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
            onClick={() => setIsScrolling(!isScrolling)} 
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
