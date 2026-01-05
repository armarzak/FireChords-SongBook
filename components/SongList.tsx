
import React, { useState, useMemo } from 'react';
import { Song, ViewMode } from '../types';
import { storageService } from '../services/storageService';

interface SongListProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onAdd: () => void;
  onExportSuccess: (msg: string) => void;
  isSyncing?: boolean;
  isOnline?: boolean;
  onSyncManual?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, onSelect, onAdd, onExportSuccess, isSyncing, isOnline, onSyncManual, theme, onToggleTheme }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SONGS);

  const processedData = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = songs.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.artist.toLowerCase().includes(term)
    );

    const grouped = filtered.reduce((acc, song) => {
        let label = '';
        if (viewMode === ViewMode.SONGS) {
            const firstChar = song.title.trim().charAt(0).toUpperCase();
            label = /[A-ZА-Я0-9]/.test(firstChar) ? firstChar : '#';
        } else {
            label = song.artist.trim() || 'Unknown Artist';
        }
        if (!acc[label]) acc[label] = [];
        acc[label].push(song);
        return acc;
    }, {} as Record<string, Song[]>);

    return Object.keys(grouped).sort((a, b) => a.localeCompare(b)).map(label => ({
        label,
        songs: grouped[label].sort((a, b) => a.title.localeCompare(b.title))
    }));
  }, [songs, search, viewMode]);

  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col h-full ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className={`px-6 pt-6 pb-2 space-y-5 ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
        <div className="flex justify-between items-start">
          <div className="flex flex-col flex-1">
            <div className="flex items-center gap-3">
                {/* Refined Acoustic Guitar Logo */}
                <svg className={`w-12 h-12 shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} viewBox="0 0 64 64" fill="none">
                  {/* Body Silhouette */}
                  <path 
                    d="M32 58c-8.5 0-15.5-6.5-15.5-14.5 0-5 3.5-8.5 5.5-11 0-2.5-1-5.5-1-9 0-6 4.5-11 11-11s11 5 11 11c0 3.5-1 6.5-1 9 2 2.5 5.5 6 5.5 11 0 8-7 14.5-15.5 14.5z" 
                    fill="currentColor" 
                    fillOpacity="0.1"
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinejoin="round" 
                  />
                  {/* Soundhole */}
                  <circle cx="32" cy="42" r="3.5" fill="currentColor" />
                  {/* Neck */}
                  <rect x="30" y="6" width="4" height="15" rx="1" fill="currentColor" />
                  {/* Bridge */}
                  <rect x="27" y="49" width="10" height="2" rx="1" fill="currentColor" />
                </svg>
                <h1 className={`text-4xl font-black tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>YOUR <span className="block text-xl opacity-60 uppercase">SONGS</span></h1>
            </div>
            <div className="mt-4 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isOnline ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? (isSyncing ? 'bg-blue-400 animate-pulse' : 'bg-blue-500') : 'bg-orange-500 animate-pulse'}`}></div>
                    <span className={`text-[8px] font-black uppercase ${isOnline ? 'text-blue-400' : 'text-orange-400'}`}>
                        {isOnline ? 'Cloud Synced' : 'Local Only'}
                    </span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onToggleTheme}
                className={`p-3 rounded-full transition-all border ${isDark ? 'bg-zinc-800/50 text-zinc-400 border-white/5' : 'bg-white text-zinc-600 border-zinc-200 shadow-sm'}`}
            >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.243 16.243l.707.707M7.05 7.05l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
            </button>
          </div>
        </div>

        <div className={`flex p-1 rounded-2xl border shadow-inner ${isDark ? 'bg-[#1c1c1e] border-white/5' : 'bg-zinc-200/50 border-zinc-200'}`}>
            <button 
              onClick={() => setViewMode(ViewMode.SONGS)} 
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${viewMode === ViewMode.SONGS ? (isDark ? 'bg-zinc-700 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')}`}
            >SONGS</button>
            <button 
              onClick={() => setViewMode(ViewMode.ARTISTS)} 
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${viewMode === ViewMode.ARTISTS ? (isDark ? 'bg-zinc-700 text-white shadow-lg' : 'bg-white text-zinc-900 shadow-sm') : (isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-500 hover:text-zinc-700')}`}
            >ARTISTS</button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search repertoire..." 
            className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${isDark ? 'bg-[#1c1c1e] border-white/5 text-white placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className={`w-5 h-5 absolute left-4 top-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 scroll-smooth px-2">
        {processedData.map(group => (
            <div key={group.label} className="mb-4">
                <div className={`sticky top-0 backdrop-blur-xl px-5 py-2 border-b z-10 flex justify-between items-center ${isDark ? 'bg-[#121212]/90 border-white/5' : 'bg-[#f8f9fa]/90 border-zinc-200'}`}>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{group.label}</span>
                </div>
                <div className="px-3">
                {group.songs.map(song => (
                    <button 
                        key={song.id} 
                        onClick={() => onSelect(song)} 
                        className={`w-full text-left py-4 border-b active:bg-white/5 transition-all px-4 rounded-2xl my-1 flex justify-between items-center group ${isDark ? 'border-white/5' : 'border-zinc-100 hover:bg-zinc-50'}`}
                    >
                        <div className="flex-1">
                            <div className={`text-[17px] font-bold group-active:text-blue-400 transition-colors ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{song.title}</div>
                            <div className={`text-sm font-medium ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{song.artist}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            {song.id.startsWith('pub-') && (
                                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            )}
                            <svg className={`w-4 h-4 ${isDark ? 'text-zinc-800' : 'text-zinc-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
                </div>
            </div>
        ))}
        {processedData.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-zinc-900 text-zinc-700' : 'bg-zinc-100 text-zinc-300'}`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>No matching tracks</p>
            </div>
        )}
      </div>

      <button onClick={onAdd} className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-6 w-16 h-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-all z-[150] shadow-blue-600/40 hover:scale-105 active:rotate-12">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" />
        </svg>
      </button>
    </div>
  );
};
