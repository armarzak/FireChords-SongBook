
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Song } from '../types';
import { transposeText, chordRegex } from '../services/chordService';
import { ChordPanel } from './ChordPanel';

interface PerformanceViewProps {
  song: Song;
  onClose: () => void;
  onEdit: () => void;
  onUpdateTranspose: (id: string, newTranspose: number) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ song, onClose, onEdit, onUpdateTranspose }) => {
  const [transpose, setTranspose] = useState(song.transpose || 0);
  const [fontSize, setFontSize] = useState(18);
  const [scrolling, setScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const [isChordPanelOpen, setIsChordPanelOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const preciseScrollTopRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Refs для pinch-to-zoom
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialFontSizeRef = useRef<number>(18);

  const scrollSpeedRef = useRef(scrollSpeed);
  useEffect(() => {
    scrollSpeedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(console.warn);
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

    const speedFactor = (scrollSpeedRef.current / 100) * 0.08; 
    const increment = speedFactor * deltaTime;

    preciseScrollTopRef.current += increment;
    containerRef.current.scrollTop = preciseScrollTopRef.current;

    const isAtBottom = containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 5;
    
    if (isAtBottom) {
      setScrolling(false);
    } else {
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
    }
  }, []);

  useEffect(() => {
    if (scrolling) {
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
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => Math.min(Math.max(prev + delta, 10), 80));
  };

  const getUniqueChords = () => {
    const text = transposeText(song.content, transpose);
    const matches = text.match(chordRegex) || [];
    return Array.from(new Set(matches));
  };

  const renderContent = () => {
    const text = transposeText(song.content, transpose);
    
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\b[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*(?![a-zA-Z0-9#b]))/g);
      
      return (
        <div key={i} className="min-h-[1.2em] leading-tight">
          {parts.map((part, pi) => {
            if (part.match(/^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*$/)) {
              return (
                <span key={pi} className="text-yellow-400 font-bold">
                  {part}
                </span>
              );
            }
            return <span key={pi}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const getDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialPinchDistanceRef.current = getDistance(e.touches);
      initialFontSizeRef.current = fontSize;
    }
    // Остановка при нажатии убрана по просьбе пользователя
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      const currentDistance = getDistance(e.touches);
      const ratio = currentDistance / initialPinchDistanceRef.current;
      const newSize = Math.round(initialFontSizeRef.current * ratio);
      // Ограничиваем размер шрифта от 10 до 80
      setFontSize(Math.min(Math.max(newSize, 10), 80));
    }
  };

  const handleTouchEnd = () => {
    initialPinchDistanceRef.current = null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex flex-col text-white overscroll-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header - Всегда виден */}
      <div className="pt-[env(safe-area-inset-top)] bg-zinc-900 border-b border-zinc-800 px-4 flex justify-between items-center h-20 shrink-0 z-[140]">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-zinc-400 active:text-white px-2 py-4 text-sm font-medium">Back</button>
          <button onClick={onEdit} className="text-blue-500 active:text-blue-400 px-2 py-4 text-sm font-bold">Edit</button>
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="text-[10px] font-bold truncate max-w-[120px] mb-1 opacity-50 uppercase tracking-widest">{song.title}</h2>
          <div className="flex gap-2">
             <div className="flex items-center bg-zinc-800 rounded-lg border border-white/5">
               <button onClick={() => changeTranspose(-1)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white">-</button>
               <span className="text-[9px] text-yellow-500 font-bold w-5 text-center">TR</span>
               <button onClick={() => changeTranspose(1)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white">+</button>
             </div>
             <div className="flex items-center bg-zinc-800 rounded-lg border border-white/5">
               <button onClick={() => changeFontSize(-2)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white">A-</button>
               <span className="text-[9px] text-blue-500 font-bold w-5 text-center">SZ</span>
               <button onClick={() => changeFontSize(2)} className="w-9 h-7 flex items-center justify-center text-zinc-400 active:text-white">A+</button>
             </div>
          </div>
        </div>

        <button 
          onClick={() => setIsChordPanelOpen(!isChordPanelOpen)} 
          className={`font-bold text-[11px] px-3 py-1.5 rounded-full uppercase tracking-wider transition-colors ${isChordPanelOpen ? 'bg-blue-600 text-white' : 'bg-blue-500/10 text-blue-500 active:bg-blue-500/20'}`}
        >
          Chords
        </button>
      </div>

      {/* Контент песни */}
      <div 
        ref={containerRef}
        onClick={() => {
          // Закрываем панель аккордов при тапе на текст, но НЕ останавливаем скролл
          if (isChordPanelOpen) setIsChordPanelOpen(false);
        }}
        onScroll={() => {
            // Синхронизируем положение, чтобы при ручном скролле автопрокрутка продолжалась корректно
            if (containerRef.current) {
                preciseScrollTopRef.current = containerRef.current.scrollTop;
            }
        }}
        style={{ fontSize: `${fontSize}px` }}
        className="flex-1 overflow-y-auto px-4 py-8 mono-grid whitespace-pre select-none cursor-default scroll-smooth-manual"
      >
        <div className="mb-8" style={{ fontSize: '1rem', fontFamily: 'sans-serif' }}>
            <h1 className="text-4xl font-black text-white mb-1 tracking-tight">{song.title}</h1>
            <p className="text-xl text-zinc-500">{song.artist}</p>
        </div>
        
        <div className="leading-[1.45] tracking-normal">
          {renderContent()}
        </div>

        {/* Заполнитель в конце, чтобы песня могла доскроллиться до верха */}
        <div className="h-[75vh]"></div>
      </div>

      {/* Панель управления (Футер) */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-6 pb-[calc(10px+env(safe-area-inset-bottom))] pt-4 flex flex-col gap-4 z-[130]">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest min-w-[80px]">Speed: {scrollSpeed}%</span>
          <input 
            type="range" min="1" max="100" value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
            className="flex-1 accent-blue-500 h-1.5 rounded-full bg-zinc-800 appearance-none cursor-pointer"
          />
        </div>
        <button 
          onClick={() => setScrolling(!scrolling)}
          className={`w-full py-4 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-lg ${scrolling ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
        >
          {scrolling ? 'STOP' : 'START AUTO-SCROLL'}
        </button>
      </div>

      <ChordPanel 
        chords={getUniqueChords()} 
        isOpen={isChordPanelOpen} 
        onClose={() => setIsChordPanelOpen(false)} 
      />
    </div>
  );
};
