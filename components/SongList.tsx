
import React, { useState, useMemo } from 'react';
import { Song, ViewMode } from '../types';

interface SongListProps {
  songs: Song[];
  onSelect: (song: Song) => void;
  onAdd: () => void;
}

type GroupedSongs = {
  label: string;
  songs: Song[];
}[];

export const SongList: React.FC<SongListProps> = ({ songs, onSelect, onAdd }) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SONGS);

  const processedData = useMemo(() => {
    const term = search.toLowerCase().trim();
    const filtered = songs.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.artist.toLowerCase().includes(term)
    );

    if (viewMode === ViewMode.SONGS) {
      // Группировка по первой букве названия песни (iOS Style)
      const grouped = filtered.reduce((acc, song) => {
        const char = song.title.charAt(0).toUpperCase();
        const label = /[A-Z]/.test(char) ? char : '#';
        if (!acc[label]) acc[label] = [];
        acc[label].push(song);
        return acc;
      }, {} as Record<string, Song[]>);

      return Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map(label => ({
          label,
          songs: grouped[label].sort((a, b) => a.title.localeCompare(b.title))
        })) as GroupedSongs;
    } else {
      // Группировка по артисту (регистронезависимая нормализация)
      const grouped = filtered.reduce((acc, song) => {
        const artistRaw = song.artist?.trim() || 'Unknown Artist';
        const artistKey = artistRaw.toLowerCase();
        
        if (!acc[artistKey]) {
          acc[artistKey] = {
            displayName: artistRaw, // Сохраняем оригинальное написание первого найденного
            songs: []
          };
        }
        acc[artistKey].songs.push(song);
        return acc;
      }, {} as Record<string, { displayName: string, songs: Song[] }>);

      return Object.keys(grouped)
        .sort((a, b) => a.localeCompare(b))
        .map(key => ({
          label: grouped[key].displayName,
          songs: grouped[key].songs.sort((a, b) => a.title.localeCompare(b.title))
        })) as GroupedSongs;
    }
  }, [songs, search, viewMode]);

  return (
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)]">
      {/* Search and Navigation */}
      <div className="px-4 pt-4 pb-2 space-y-4 bg-[#121212]">
        <div className="flex justify-between items-baseline px-1">
          <h1 className="text-3xl font-black tracking-tight text-white">Library</h1>
          <div className="text-blue-500 text-sm font-semibold">{songs.length}</div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full bg-[#1c1c1e] border-none rounded-xl py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-blue-600 transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Segmented Control */}
        <div className="bg-[#1c1c1e] p-0.5 rounded-lg flex relative border border-white/5 shadow-inner">
          <button 
            onClick={() => setViewMode(ViewMode.SONGS)}
            className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all z-10 ${viewMode === ViewMode.SONGS ? 'text-white' : 'text-zinc-500'}`}
          >
            Songs
          </button>
          <button 
            onClick={() => setViewMode(ViewMode.ARTISTS)}
            className={`flex-1 py-1.5 text-[13px] font-bold rounded-md transition-all z-10 ${viewMode === ViewMode.ARTISTS ? 'text-white' : 'text-zinc-500'}`}
          >
            Artists
          </button>
          <div 
            className={`absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-[#636366] rounded-md transition-transform duration-200 ease-out shadow-sm ${viewMode === ViewMode.ARTISTS ? 'translate-x-full' : 'translate-x-0'}`}
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto pb-32">
        {processedData.length > 0 ? (
          processedData.map(group => (
            <div key={group.label} className="group">
              {/* Sticky Section Header */}
              <div className="sticky top-0 z-20 bg-[#121212]/95 backdrop-blur-xl px-4 py-1.5 border-b border-white/5">
                <span className="text-sm font-black text-blue-500 uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              
              {/* Songs in Section */}
              <div className="px-4">
                {group.songs.map((song, idx) => (
                  <button 
                    key={song.id} 
                    onClick={() => onSelect(song)}
                    className={`w-full text-left py-4 active:opacity-50 transition-opacity flex flex-col justify-center ${idx !== group.songs.length - 1 ? 'border-b border-white/5' : ''}`}
                  >
                    <div className="text-[17px] font-semibold text-white truncate leading-tight">
                      {song.title}
                    </div>
                    {viewMode === ViewMode.SONGS && (
                      <div className="text-[14px] text-zinc-500 truncate mt-0.5">
                        {song.artist}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-700">
             <div className="w-16 h-16 mb-4 bg-zinc-900 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
             </div>
             <p className="text-sm font-medium">No results found</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={onAdd}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white active:scale-90 transition-transform z-40"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};
