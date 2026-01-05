
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
}

export const SongList: React.FC<SongListProps> = ({ songs, onSelect, onAdd, onExportSuccess, isSyncing, isOnline, onSyncManual }) => {
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

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="px-6 pt-6 pb-2 space-y-5 bg-[#121212]">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-4xl font-black tracking-tight text-white leading-none">Library</h1>
            <div className="mt-2 flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isOnline ? 'bg-blue-500/10 border-blue-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? (isSyncing ? 'bg-blue-400 animate-pulse' : 'bg-blue-500') : 'bg-orange-500 animate-pulse'}`}></div>
                    <span className={`text-[8px] font-black uppercase ${isOnline ? 'text-blue-400' : 'text-orange-400'}`}>
                        {isOnline ? 'Postgres Cloud' : 'Local Only'}
                    </span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onSyncManual}
                className="p-3 bg-zinc-800/50 backdrop-blur-xl rounded-full text-zinc-400 active:text-blue-500 transition-colors border border-white/5"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </button>
            <button 
                onClick={async () => { 
                    const ok = await storageService.copyLibraryAsCode(); 
                    if (ok) onExportSuccess('Snapshot Copied'); 
                }}
                className="p-3 bg-zinc-800/50 backdrop-blur-xl rounded-full text-zinc-400 active:text-blue-500 transition-colors border border-white/5"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>
          </div>
        </div>

        <div className="flex bg-[#1c1c1e] p-1 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => setViewMode(ViewMode.SONGS)} 
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${viewMode === ViewMode.SONGS ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >SONGS</button>
            <button 
              onClick={() => setViewMode(ViewMode.ARTISTS)} 
              className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${viewMode === ViewMode.ARTISTS ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >ARTISTS</button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search repertoire..." 
            className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-5 h-5 text-zinc-600 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-40 scroll-smooth px-2">
        {processedData.map(group => (
            <div key={group.label} className="mb-4">
                <div className="sticky top-0 bg-[#121212]/90 backdrop-blur-xl px-5 py-2 border-b border-white/5 z-10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{group.label}</span>
                </div>
                <div className="px-3">
                {group.songs.map(song => (
                    <button 
                        key={song.id} 
                        onClick={() => onSelect(song)} 
                        className="w-full text-left py-4 border-b border-white/5 active:bg-white/5 transition-all px-4 rounded-2xl my-1 flex justify-between items-center group"
                    >
                        <div className="flex-1">
                            <div className="text-[17px] font-bold text-zinc-100 group-active:text-blue-400 transition-colors">{song.title}</div>
                            <div className="text-sm text-zinc-500 font-medium">{song.artist}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            {song.id.startsWith('pub-') && (
                                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            )}
                            <svg className="w-4 h-4 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 text-zinc-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-zinc-600 font-black text-xs uppercase tracking-widest">No matching tracks</p>
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
