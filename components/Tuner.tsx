
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

export const Tuner: React.FC = () => {
  const [pitch, setPitch] = useState<number | null>(null);
  const [note, setNote] = useState<string>('--');
  const [cents, setCents] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  const startTuner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      
      setIsActive(true);
      updatePitch();
    } catch (err) {
      setError('Microphone access denied or not supported');
      console.error(err);
    }
  };

  const stopTuner = () => {
    setIsActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
  };

  useEffect(() => {
    return () => stopTuner();
  }, []);

  const updatePitch = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(buffer);

    const autoCorrelateValue = autoCorrelate(buffer, audioCtxRef.current!.sampleRate);

    if (autoCorrelateValue !== -1) {
      setPitch(autoCorrelateValue);
      const { noteName, centsOff } = getNoteFromFreq(autoCorrelateValue);
      setNote(noteName);
      setCents(centsOff);
    } else {
      setPitch(null);
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
    if (rms < 0.01) return -1; // Сигнал слишком тихий

    let r1 = 0, r2 = SIZE - 1, thres = 0.2;
    for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - i]) < thres) { r2 = SIZE - i; break; }

    buffer = buffer.slice(r1, r2);
    SIZE = buffer.length;

    let c = new Float32Array(SIZE).fill(0);
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE - i; j++)
        c[i] = c[i] + buffer[j] * buffer[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < SIZE; i++) {
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
    <div className="flex flex-col h-full bg-black pt-[env(safe-area-inset-top)] overflow-hidden">
      <div className="py-6 text-center shrink-0">
        <h1 className="text-2xl font-black uppercase tracking-widest text-zinc-500">Tuner</h1>
      </div>

      {!isActive ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
             <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to tune?</h2>
          <p className="text-zinc-500 text-sm mb-10 max-w-[240px]">We'll need access to your microphone to detect the strings.</p>
          <button 
            onClick={startTuner}
            className="bg-blue-600 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
          >
            Enable Microphone
          </button>
          {error && <p className="mt-4 text-red-500 text-xs font-bold">{error}</p>}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-between py-10">
          {/* Gauge Section */}
          <div className="relative w-full flex flex-col items-center px-6">
             <div className="w-full max-w-sm aspect-[2/1] relative overflow-hidden">
                {/* Background Arc */}
                <svg viewBox="0 0 200 100" className="w-full">
                   <path d="M20,90 A80,80 0 0,1 180,90" fill="none" stroke="#1c1c1e" strokeWidth="15" strokeLinecap="round" />
                   {/* Target markers */}
                   <line x1="100" y1="10" x2="100" y2="25" stroke="#3b82f6" strokeWidth="2" />
                   
                   {/* The Needle */}
                   <g style={{ 
                      transform: `rotate(${cents * 0.9}deg)`, 
                      transformOrigin: '100px 90px',
                      transition: 'transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)'
                   }}>
                      <line x1="100" y1="90" x2="100" y2="20" stroke={Math.abs(cents) < 5 ? '#22c55e' : '#ef4444'} strokeWidth="2" strokeLinecap="round" />
                      <circle cx="100" cy="90" r="4" fill="white" />
                   </g>
                </svg>

                {/* Digital Readout */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                   <div className={`text-7xl font-black tracking-tighter transition-colors ${Math.abs(cents) < 5 ? 'text-green-500' : 'text-white'}`}>
                      {note}
                   </div>
                   <div className={`text-xs font-black uppercase tracking-widest mt-2 ${Math.abs(cents) < 5 ? 'text-green-500' : 'text-zinc-500'}`}>
                      {Math.abs(cents) < 5 ? 'In Tune' : cents > 0 ? `${cents} cents sharp` : `${Math.abs(cents)} cents flat`}
                   </div>
                </div>
             </div>
          </div>

          {/* String Guide */}
          <div className="w-full px-8 grid grid-cols-6 gap-2 max-w-md">
            {NOTES.map((n, i) => {
              const isActiveString = note === n.name;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                   <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isActiveString ? 'bg-zinc-100 border-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-transparent border-zinc-800 text-zinc-600'}`}>
                      <span className="text-xs font-bold">{n.name}</span>
                   </div>
                   <span className="text-[8px] font-black text-zinc-700">{n.oct}</span>
                </div>
              );
            })}
          </div>

          <button 
            onClick={stopTuner}
            className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] py-4 px-8 border border-zinc-900 rounded-full active:bg-zinc-900"
          >
            Turn Off
          </button>
        </div>
      )}
    </div>
  );
};
