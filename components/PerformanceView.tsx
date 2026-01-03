
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
  const touchStartRef = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').catch(console.warn);
    }
  }, []);

  // Основная функция анимации прокрутки
  const handleScrollFrame = useCallback((time: number) => {
    if (!scrolling || !containerRef.current) return;

    // Инициализация времени при первом кадре
    if (!lastFrameTimeRef.current) {
      lastFrameTimeRef.current = time;
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
      return;
    }

    const deltaTime = time - lastFrameTimeRef.current;
    lastFrameTimeRef.current = time;

    // Базовый коэффициент скорости. 
    // На iPhone scrollSpeed 50 должен давать комфортное движение.
    // Вычисляем пикселей в миллисекунду.
    const speedFactor = (scrollSpeed / 100) * 0.08; 
    const increment = speedFactor * deltaTime;

    // Накапливаем точное значение
    preciseScrollTopRef.current += increment;
    
    // Применяем к элементу
    containerRef.current.scrollTop = preciseScrollTopRef.current;

    // Проверка на достижение конца
    const isAtBottom = containerRef.current.scrollTop + containerRef.current.clientHeight >= containerRef.current.scrollHeight - 5;
    
    if (isAtBottom) {
      setScrolling(false);
    } else {
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
    }
  }, [scrolling, scrollSpeed]);

  useEffect(() => {
    if (scrolling) {
      // Синхронизируем текущую позицию перед стартом
      if (containerRef.current) {
        preciseScrollTopRef.current = containerRef.current.scrollTop;
      }
      lastFrameTimeRef.current = 0;
      scrollIntervalRef.current = requestAnimationFrame(handleScrollFrame);
    } else {
      if (scrollIntervalRef.current) {
        cancelAnimationFrame(scrollIntervalRef.current);
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
    setFontSize(prev => Math.min(Math.max(prev + delta, 10), 40));
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    // Если пользователь коснулся экрана во время скролла — останавливаем
    if (scrolling) setScrolling(false);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const deltaX = touchStartRef.current.x - e.changedTouches[0].clientX;
    const deltaY = Math.abs(touchStartRef.current.y - e.changedTouches[0].clientY);

    if (deltaX > 70 && deltaY < 50) setIsChordPanelOpen(true);
    if (deltaX < -70 && deltaY < 50 && isChordPanelOpen) setIsChordPanelOpen(false);
    touchStartRef.current = null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-[100] flex flex-col text-white"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!scrolling && (
        <div className="pt-[env(safe-area-inset-top)] bg-zinc-900 border-b border-zinc-800 px-4 flex justify-between items-center h-20 shrink-0 animate-in fade-in slide-in-from-top-4 duration-200">
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
            className="text-blue-500 font-bold text-[11px] bg-blue-500/10 px-3 py-1.5 rounded-full active:bg-blue-500/20 uppercase tracking-wider"
          >
            Chords
          </button>
        </div>
      )}

      <div 
        ref={containerRef}
        onClick={() => {
          if (scrolling) setScrolling(false);
          if (isChordPanelOpen) setIsChordPanelOpen(false);
        }}
        onScroll={() => {
            // Обновляем точный счетчик, если пользователь скроллит вручную
            if (!scrolling && containerRef.current) {
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

        <div className="h-[75vh]"></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800 px-6 pb-[calc(10px+env(safe-area-inset-bottom))] pt-4 flex flex-col gap-4 z-[130]">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest min-w-[80px]">Speed: {scrollSpeed}%</span>
          <input 
            type="range" min="1" max="100" value={scrollSpeed} 
            onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
            className="flex-1 accent-blue-500 h-1.5 rounded-full bg-zinc-800 appearance-none"
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
