
import React, { useState } from 'react';

interface ChordExplorerProps {
  theme?: 'light' | 'dark';
}

export const ChordExplorer: React.FC<ChordExplorerProps> = ({ theme = 'dark' }) => {
  const [loading, setLoading] = useState(true);
  const isDark = theme === 'dark';
  
  const CHORD_CHART_URL = "https://i.pinimg.com/736x/89/5b/de/895bdec93ce26e7d074587eb5d42ff4d.jpg";

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] pb-24 overflow-hidden ${isDark ? 'bg-black text-white' : 'bg-[#f8f9fa] text-zinc-900'}`}>
      {/* Header */}
      <div className="px-6 py-8 flex flex-col gap-1 shrink-0">
        <h1 className="text-5xl font-black tracking-tighter leading-none">Chords</h1>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] opacity-40`}>Ultimate Master Chart</p>
      </div>

      {/* Image Container */}
      <div className="flex-1 overflow-y-auto px-4 no-scrollbar pb-10">
        <div className={`relative rounded-[2.5rem] overflow-hidden border shadow-2xl transition-all duration-700 ${loading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} ${isDark ? 'border-white/10 bg-zinc-950' : 'border-zinc-200 bg-white'}`}>
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/20 backdrop-blur-sm z-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <img 
            src={CHORD_CHART_URL} 
            alt="All Guitar Chords Chart"
            className="w-full h-auto block object-contain"
            onLoad={() => setLoading(false)}
            loading="eager"
          />

          <div className={`p-6 text-center border-t ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-zinc-100 bg-zinc-50/50'}`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                High-Resolution Reference
              </p>
            </div>
          </div>
        </div>

        {/* Info Tip */}
        <div className="mt-6 px-4 text-center">
          <p className={`text-[9px] font-bold uppercase tracking-widest opacity-30 leading-relaxed`}>
            Scroll to explore all essential shapes<br/>for your performance
          </p>
        </div>
      </div>
    </div>
  );
};
