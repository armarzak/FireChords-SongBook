
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types';
import { transposeText, chordRegex } from '../services/chordService';
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
  
  // Состояние для всплывающего аккорда
  const [popover, setPopover] = useState<{ name: string; x: number; y: number; variation: number } | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const preciseScrollTopRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialFontSizeRef = useRef<number>(18);

  const scrollSpeedRef = useRef(scrollSpeed);
  useEffect(() => {
    scrollSpeedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  useEffect(() => {
    const autoFitFontSize = () => {
      if (!containerRef.current) return;
      const padding = 40;
      const availableWidth = containerRef.current.clientWidth - padding;
      const text = transposeText(song.content, transpose);
      const lines = text.split('\n');
      const maxChars = Math.max(...lines.map(l => l.length), 1);
      const charWidthRatio = 0.61; 
      let idealSize = Math.floor(availableWidth / (maxChars * charWidthRatio));
      const clampedSize = Math.min(Math.max(idealSize, 10), 26);
      setFontSize(clampedSize);
    };

    const timer = setTimeout(autoFitFontSize, 100);
    return () => clearTimeout(timer);
  }, [song.id, transpose]);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(() => {});
    }
  }, []);

  const handleScrollFrame = useCallback((time: number) => {
    if (!containerRef.current) return;

    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = time;
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
      return;
    }

    const deltaTime = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    const normalizedSpeed = scrollSpeedRef.current / 100;
    const speedMultiplier = 0.5;
    const increment = normalizedSpeed * speedMultiplier * (deltaTime / 16.6); 

    preciseScrollTopRef.current += increment;
    containerRef.current.scrollTop = preciseScrollTopRef.current;

    const isAtBottom = containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 2;
    
    if (isAtBottom) {
      setScrolling(false);
    } else {
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
    }
  }, []);

  useEffect(() => {
    if (scrolling) {
      setPopover(null); // Закрываем поповер при автоскролле
      if (containerRef.current) {
        preciseScrollTopRef.current = containerRef.current.scrollTop;
      }
      lastFrameTimeRef.current = 0;
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
    } else {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }
    return () => { 
      if (scrollIntervalRef.current) cancelAnimationFrame(scrollIntervalRef.current); 
    };
  }, [scrolling, handleScrollFrame]);

  const changeTranspose = (dir: number) => {
    const newVal = transpose + dir;
    setTranspose(newVal);
    onUpdateTranspose(song.id, newVal);
    setPopover(null); // Закрываем при смене тональности, так как аккорды меняются
  };

  const getUniqueChords = () => {
    const text = transposeText(song.content, transpose);
    const matches = text.match(chordRegex) || [];
    return Array.from(new Set(matches));
  };

  const handleChordClick = (e: React.MouseEvent, chord: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Если кликнули по тому же аккорду, закрываем
    if (popover && popover.name === chord) {
      setPopover(null);
      return;
    }

    setPopover({
      name: chord,
      x: rect.left + rect.width / 2,
      y: rect.top,
      variation: 0
    });
  };

  const nextVariation = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!popover) return;
    const fingerings = getFingerings(popover.name);
    if (fingerings.length > 1) {
      setPopover({
        ...popover,
        variation: (popover.variation + 1) % fingerings.length
      });
    }
  };

  const getLineStyle = (line: string) => {
    const trimmed = line.trim();
    if (sectionRegex.test(trimmed)) {
      const lower = trimmed.toLowerCase();
      if (lower.includes('intro') || lower.includes('вступление')) return 'text-purple-400 font-black mb-2 mt-8';
      if (lower.includes('chorus') || lower.includes('припев')) return 'text-orange-500 font-black mb-2 mt-8 scale-105 origin-left';
      if (lower.includes('verse') || lower.includes('куплет')) return 'text-emerald-400 font-black mb-2 mt-8';
      return 'text-cyan-400 font-black mb-2 mt-8';
    }
    return '';
  };

  const renderContent = () => {
    const text = transposeText(song.content, transpose);
    return text.split('\n').map((line, i) => {
      const sectionStyle = getLineStyle(line);
      const parts = line.split(/(\b[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*(?![a-zA-Z0-9#b]))/g);
      
      return (
        <div key={i} className={`min-h-[1.2em] leading-tight transition-all ${sectionStyle}`}>
          {parts.map((part, pi) => {
            if (part.match(/^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*$/)) {
              return (
                <button 
                  key={pi} 
                  onClick={(e) => handleChordClick(e, part)}
                  className={`text-yellow-400 font-bold active:bg-yellow-400/20 rounded px-0.5 transition-colors ${popover?.name === part ? 'bg-yellow-400/30 ring-1 ring-yellow-400/50' : ''}`}
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
    <div 
      className="fixed inset-0 bg-black z-[100] flex flex-col text-white overscroll-none"
      onTouchStart={(e) => {
        if (e.touches.length === 2) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          initialPinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
          initialFontSizeRef.current = fontSize;
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ratio = dist / initialPinchDistanceRef.current;
          setFontSize(Math.min(Math.max(Math.round(initialFontSizeRef.current * ratio), 10), 80));
        }
      }}
    >
      <div className="pt-[env(safe-area-inset-top)] bg-zinc-900 border-b border-zinc-800 px-4 flex justify-between items-center h-20 shrink-0 z-[140]">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-zinc-400 active:text-white px-2 py-4 text-sm font-medium">Back</button>
          <button onClick={onEdit} className="text-blue-500 active:text-blue-400 px-2 py-4 text-sm font-bold">Edit</button>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-bold truncate max-w-[120px] mb-1 opacity-50 uppercase tracking-widest">{song.title}</h2>
          <div className="flex gap-2">
             <div className="flex items-center bg-zinc-800 rounded-lg border border-white/5">
               <button onClick={() => setFontSize(s => Math.max(s-2, 10))} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white font-bold">A-</button>
               <span className="text-[9px] text-blue-500 font-black w-5 text-center">SZ</span>
               <button onClick={() => setFontSize(s => Math.min(s+2, 80))} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white font-bold">A+</button>
             </div>
             <div className="flex items-center bg-zinc-800 rounded-lg border border-white/5">
               <button onClick={() => changeTranspose(-1)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white font-bold">-</button>
               <span className="text-[9px] text-yellow-500 font-black w-5 text-center">TR</span>
               <button onClick={() => changeTranspose(1)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white font-bold">+</button>
             </div>
          </div>
        </div>

        <button 
          onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} 
          className={`font-bold text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${isChordPanelOpen ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-blue-500/10 text-blue-500 active:bg-blue-500/20'}`}
        >
          Chords
        </button>
      </div>

      <div 
        ref={containerRef}
        onClick={() => {
          if (popover) setPopover(null);
          if (isChordPanelOpen) setIsChordPanelOpen(false);
        }}
        onScroll={() => { 
          if (containerRef.current) {
            preciseScrollTopRef.current = containerRef.current.scrollTop;
          }
          if (popover) setPopover(null); // Закрываем при ручном скролле
        }}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto px-4 py-8 mono-grid whitespace-pre-wrap break-words select-none"
      >
        <div className="mb-10" style={{ fontSize: '1rem', fontFamily: 'sans-serif' }}>
            <h1 className="text-4xl font-black text-white mb-1 tracking-tight">{song.title}</h1>
            <p className="text-xl text-zinc-500">{song.artist}</p>
        </div>
        <div className="leading-[1.65] tracking-normal pb-32">{renderContent()}</div>
        <div className="h-[80vh]"></div>
      </div>

      {/* Popover Diagram */}
      {popover && (
        <div 
          className="fixed z-[200] animate-in zoom-in-95 fade-in duration-150 pointer-events-none"
          style={{ 
            left: `${popover.x}px`, 
            top: `${popover.y - 10}px`, 
            transform: 'translate(-50%, -100%)' 
          }}
        >
          <div className="pointer-events-auto" onClick={nextVariation}>
            {(() => {
              const fingerings = getFingerings(popover.name);
              const fingering = fingerings[popover.variation % fingerings.length];
              if (!fingering) return null;
              
              return (
                <div className="relative">
                  <ChordDiagram fingering={fingering} />
                  {fingerings.length > 1 && (
                    <div className="absolute -bottom-1 left-0 right-0 flex justify-center gap-1">
                      {fingerings.map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${i === popover.variation ? 'bg-yellow-500' : 'bg-zinc-700'}`} />
                      ))}
                    </div>
                  )}
                  {/* Треугольник-указатель */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-zinc-900 shadow-xl"></div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-3xl border-t border-zinc-800 px-6 pb-[calc(15px+env(safe-area-inset-bottom))] pt-5 flex flex-col gap-4 z-[130]">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest min-w-[70px]">Speed: {scrollSpeed}%</span>
            <input 
              type="range" min="1" max="100" value={scrollSpeed} 
              onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
              className="flex-1 accent-blue-500 h-1.5 rounded-full bg-zinc-800 appearance-none cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest min-w-[70px]">Size: {fontSize}px</span>
            <input 
              type="range" min="10" max="80" value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="flex-1 accent-emerald-500 h-1.5 rounded-full bg-zinc-800 appearance-none cursor-pointer"
            />
          </div>
        </div>
        <button 
          onClick={() => setScrolling(!scrolling)}
          className={`w-full py-4 rounded-2xl font-black text-lg active:scale-[0.97] transition-all shadow-lg ${scrolling ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
        >
          {scrolling ? 'STOP' : 'START AUTO-SCROLL'}
        </button>
      </div>

      <ChordPanel chords={getUniqueChords()} isOpen={isChordPanelOpen} onClose={() => setIsChordPanelOpen(false)} />
    </div>
  );
};
