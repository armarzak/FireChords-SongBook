
import React, { useState, useMemo } from 'react';
import { Song, ViewMode } from '../types';
import { storageService } from '../services/storageService';

interface SongListProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onAdd: () => void;
  onExportSuccess: (msg: string) => void;
  isSyncing?: boolean;
  onSyncManual?: () => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, onSelect, onAdd, onExportSuccess, isSyncing, onSyncManual }) => {
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
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)]">
      <div className="px-4 pt-4 pb-2 space-y-4 bg-[#121212]">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">Library</h1>
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${isSyncing ? 'bg-blue-500/10 border-blue-500/20' : 'bg-indigo-500/10 border-indigo-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-400 animate-pulse' : 'bg-indigo-500'}`}></div>
              <span className={`text-[8px] font-black uppercase ${isSyncing ? 'text-blue-400' : 'text-indigo-400'}`}>
                {isSyncing ? 'Postgres Sync' : 'Supabase Cloud'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={onSyncManual}
                className="p-2 bg-zinc-800 rounded-full text-zinc-400 active:text-blue-500 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            </button>
            <button 
                onClick={async () => { await storageService.copyLibraryAsCode(); onExportSuccess('SQL Snapshot Copied'); }}
                className="p-2 bg-zinc-800 rounded-full text-zinc-400 active:text-blue-500 transition-colors"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </button>
          </div>
        </div>

        <div className="flex bg-[#1c1c1e] p-1 rounded-xl">
            <button 
              onClick={() => setViewMode(ViewMode.SONGS)} 
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${viewMode === ViewMode.SONGS ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
            >SONGS</button>
            <button 
              onClick={() => setViewMode(ViewMode.ARTISTS)} 
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${viewMode === ViewMode.ARTISTS ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}
            >ARTISTS</button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search your Postgres library..." 
            className="w-full bg-[#1c1c1e] border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 outline-none focus:ring-1 focus:ring-blue-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32 scroll-smooth">
        {processedData.map(group => (
            <div key={group.label}>
                <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-xl px-4 py-1.5 border-b border-white/5 z-10 flex justify-between items-center">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{group.label}</span>
                </div>
                <div className="px-4">
                {group.songs.map(song => (
                    <button 
                        key={song.id} 
                        onClick={() => onSelect(song)} 
                        className="w-full text-left py-4 border-b border-white/5 active:bg-white/5 transition-colors px-2 rounded-lg my-1 flex justify-between items-center"
                    >
                        <div>
                            <div className="text-[17px] font-bold text-zinc-100">{song.title}</div>
                            <div className="text-sm text-zinc-500 font-medium">{song.artist}</div>
                        </div>
                        {song.id.startsWith('pub-') && (
                            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                        )}
                    </button>
                ))}
                </div>
            </div>
        ))}
      </div>

      <button onClick={onAdd} className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-6 w-14 h-14 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white active:scale-90 transition-transform z-50">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" />
        </svg>
      </button>
    </div>
  );
};
