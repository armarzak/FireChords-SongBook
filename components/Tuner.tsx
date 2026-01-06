
import React, { useState, useEffect, useRef } from 'react';

const NOTES = [
  { name: 'E', freq: 82.41, oct: 2 },
  { name: 'A', freq: 110.00, oct: 2 },
  { name: 'D', freq: 146.83, oct: 3 },
  { name: 'G', freq: 196.00, oct: 3 },
  { name: 'B', freq: 246.94, oct: 3 },
  { name: 'E', freq: 329.63, oct: 4 }
];

const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface TunerProps {
  theme?: 'light' | 'dark';
}

export const Tuner: React.FC<TunerProps> = ({ theme = 'dark' }) => {
  const [note, setNote] = useState<string>('--');
  const [cents, setCents] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(true);

  const isDark = theme === 'dark';

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Рефы для сглаживания (EMA - Exponential Moving Average)
  const smoothedCentsRef = useRef<number>(0);
  const smoothingFactor = 0.15; // Чем меньше, тем плавнее (0.1 - 0.2 идеал)
  const lastDetectedNoteRef = useRef<string>('--');

  const startTuner = async () => {
    setIsRequesting(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048; // Достаточно для гитарного диапазона
      source.connect(analyser);
      analyserRef.current = analyser;
      setIsRequesting(false);
      updatePitch();
    } catch (err) {
      setError('Microphone access denied or not supported');
      setIsRequesting(false);
      console.error(err);
    }
  };

  const stopTuner = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
  };

  useEffect(() => {
    startTuner();
    return () => stopTuner();
  }, []);

  const updatePitch = () => {
    if (!analyserRef.current || !audioCtxRef.current) return;
    
    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);
    
    const freq = autoCorrelate(buffer, audioCtxRef.current.sampleRate);
    
    if (freq !== -1) {
      const { noteName, centsOff } = getNoteFromFreq(freq);
      
      // Сглаживаем отклонение (cents)
      smoothedCentsRef.current = smoothedCentsRef.current * (1 - smoothingFactor) + centsOff * smoothingFactor;
      
      // Обновляем состояние только если есть значимое изменение или сменилась нота
      if (Math.abs(smoothedCentsRef.current - cents) > 0.1 || noteName !== lastDetectedNoteRef.current) {
        setCents(smoothedCentsRef.current);
        setNote(noteName);
        lastDetectedNoteRef.current = noteName;
      }
    } else {
      // Плавный возврат к центру при потере сигнала (опционально)
      if (Math.abs(smoothedCentsRef.current) > 0.5) {
        smoothedCentsRef.current *= 0.9;
        setCents(smoothedCentsRef.current);
      }
    }
    
    animationRef.current = requestAnimationFrame(updatePitch);
  };

  const autoCorrelate = (buffer: Float32Array, sampleRate: number) => {
    let SIZE = buffer.length;
    let rms = 0;
    for (let i = 0; i < SIZE; i++) {
      let val = buffer[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);
    
    // Порог шума (чуть выше для отсечения фонового гула)
    if (rms < 0.015) return -1;

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }
    
    const slicedBuffer = buffer.slice(r1, r2);
    const slicedSize = slicedBuffer.length;
    
    let c = new Float32Array(slicedSize).fill(0);
    for (let i = 0; i < slicedSize; i++)
      for (let j = 0; j < slicedSize - i; j++)
        c[i] = c[i] + slicedBuffer[j] * slicedBuffer[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < slicedSize; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    
    let T0 = maxpos;
    let x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    let a = (x1 + x3 - 2 * x2) / 2;
    let b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);
    
    return sampleRate / T0;
  };

  const getNoteFromFreq = (freq: number) => {
    const noteNum = 12 * (Math.log(freq / 440) / Math.log(2));
    const roundedNote = Math.round(noteNum) + 69;
    const noteName = ALL_NOTES[roundedNote % 12];
    const centsOff = Math.floor(100 * (noteNum - Math.round(noteNum)));
    return { noteName, centsOff };
  };

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] overflow-hidden transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-[#f8f9fa]'}`}>
      <div className="py-6 text-center shrink-0">
        <h1 className={`text-2xl font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-300'}`}>Tuner</h1>
      </div>

      {isRequesting ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Waking up mic...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-red-500/10 border border-red-500/20">
             <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>No Signal</h2>
          <p className="text-zinc-500 text-sm mb-8 max-w-[240px]">{error}</p>
          <button onClick={startTuner} className="bg-blue-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg active:scale-95 transition-transform">Retry</button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between py-10 animate-in fade-in duration-700">
          <div className="relative w-full flex flex-col items-center px-6">
             <div className="w-full max-w-sm aspect-[2/1] relative overflow-hidden">
                <svg viewBox="0 0 200 100" className="w-full">
                   {/* Шкала */}
                   <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke={isDark ? "#1c1c1e" : "#e4e4e7"} strokeWidth="15" strokeLinecap="round" />
                   {/* Центральная метка */}
                   <line x1="100" y1="10" x2="100" y2="25" stroke={Math.abs(cents) < 3 ? '#22c55e' : '#3b82f6'} strokeWidth="3" />
                   
                   {/* Стрелка */}
                   <g style={{ 
                      transform: `rotate(${cents * 0.9}deg)`, 
                      transformOrigin: '100px 90px',
                      // Использование transform для плавности вместе с программным сглаживанием
                      transition: 'transform 0.05s linear' 
                   }}>
                      <line x1="100" y1="90" x2="100" y2="15" stroke={Math.abs(cents) < 5 ? '#22c55e' : '#ef4444'} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="100" cy="90" r="4" fill={isDark ? "white" : "#1a1a1a"} />
                   </g>
                </svg>
                
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                   <div className={`text-8xl font-black tracking-tighter transition-colors duration-300 ${Math.abs(cents) < 5 ? 'text-green-500' : (isDark ? 'text-white' : 'text-zinc-900')}`}>
                      {note}
                   </div>
                   <div className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${Math.abs(cents) < 5 ? 'text-green-500' : 'text-zinc-500'}`}>
                      {Math.abs(cents) < 5 ? 'Perfect' : cents > 0 ? 'Sharp' : 'Flat'}
                   </div>
                </div>
             </div>
          </div>

          <div className="w-full px-8 grid grid-cols-6 gap-2 max-w-md">
            {NOTES.map((n, i) => {
              const isMatch = note === n.name;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isMatch ? (isDark ? 'bg-white border-white text-black scale-110 shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg') : (isDark ? 'bg-transparent border-zinc-900 text-zinc-800' : 'bg-transparent border-zinc-100 text-zinc-300')}`}>
                      <span className="text-[10px] font-black">{n.name}</span>
                   </div>
                   <span className={`text-[7px] font-black ${isMatch ? (isDark ? 'text-white' : 'text-blue-600') : (isDark ? 'text-zinc-800' : 'text-zinc-300')}`}>{n.oct}</span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-4">
             <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${isDark ? 'bg-zinc-900/50 border-white/5' : 'bg-white border-zinc-200'}`}>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Mic active</span>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
