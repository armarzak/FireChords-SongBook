
import React, { useState, useMemo, useEffect } from 'react';
import { Song, ViewMode } from '../types';
import { storageService } from '../services/storageService';

interface SongListProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onAdd: () => void;
  onExportSuccess: (msg: string) => void;
}

export const SongList: React.FC<SongListProps> = ({ songs, onSelect, onAdd, onExportSuccess }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SONGS);
  const [isCommunityMode, setIsCommunityMode] = useState(false);
  const [communitySongs, setCommunitySongs] = useState<Song[]>([]);

  useEffect(() => {
    if (isCommunityMode) {
        // Fix: fetchCommunitySongs -> fetchForumSongs
        storageService.fetchForumSongs().then(setCommunitySongs);
    }
  }, [isCommunityMode]);

  const activeSource = isCommunityMode ? communitySongs : songs;

  const processedData = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = activeSource.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.artist.toLowerCase().includes(term)
    );

    const grouped = filtered.reduce((acc, song) => {
        const label = viewMode === ViewMode.SONGS 
            ? (/[A-ZА-Я]/.test(song.title.charAt(0).toUpperCase()) ? song.title.charAt(0).toUpperCase() : '#')
            : song.artist;
        if (!acc[label]) acc[label] = [];
        acc[label].push(song);
        return acc;
    }, {} as Record<string, Song[]>);

    return Object.keys(grouped).sort().map(label => ({
        label,
        songs: grouped[label].sort((a, b) => a.title.localeCompare(b.title))
    }));
  }, [activeSource, search, viewMode]);

  return (
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)]">
      <div className="px-4 pt-4 pb-2 space-y-4 bg-[#121212]">
        <div className="flex justify-between items-center px-1">
          <h1 className="text-3xl font-black tracking-tight text-white">
            {isCommunityMode ? 'Cloud' : 'Library'}
          </h1>
          <div className="flex items-center gap-3">
            {/* Кнопка экспорта кода для Вас (Админа) */}
            {!isCommunityMode && (
                <button 
                  onClick={() => { storageService.copyLibraryAsCode(); onExportSuccess('Code copied! Paste into DEFAULT_SONGS'); }}
                  className="p-2 bg-blue-500/10 rounded-full text-blue-500 active:bg-blue-500 transition-all"
                  title="Copy Library as Code"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
            )}
            <button 
              onClick={() => storageService.exportDataFile()}
              className="p-2 bg-zinc-800 rounded-full text-zinc-400 active:text-blue-500"
              title="Download JSON File"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex bg-[#1c1c1e] p-1 rounded-xl">
            <button onClick={() => setIsCommunityMode(false)} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${!isCommunityMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>LOCAL</button>
            <button onClick={() => setIsCommunityMode(true)} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${isCommunityMode ? 'bg-blue-600 text-white' : 'text-zinc-500'}`}>COMMUNITY</button>
        </div>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search songs..." 
            className="w-full bg-[#1c1c1e] border-none rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-32">
        {processedData.map(group => (
          <div key={group.label}>
            <div className="sticky top-0 bg-[#121212]/95 backdrop-blur-xl px-4 py-1.5 border-b border-white/5">
              <span className="text-xs font-black text-blue-500 uppercase">{group.label}</span>
            </div>
            <div className="px-4">
              {group.songs.map(song => (
                <button key={song.id} onClick={() => onSelect(song)} className="w-full text-left py-4 border-b border-white/5 active:opacity-50">
                  <div className="text-[17px] font-semibold">{song.title}</div>
                  <div className="text-sm text-zinc-500">{song.artist}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!isCommunityMode && (
        <button onClick={onAdd} className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v12m6-6H6" />
          </svg>
        </button>
      )}
    </div>
  );
};
