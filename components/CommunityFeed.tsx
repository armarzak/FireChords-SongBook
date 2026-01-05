
import React, { useState, useEffect, useMemo } from 'react';
import { Song, ViewMode } from '../types';
import { storageService } from '../services/storageService';

interface CommunityFeedProps {
  onImport: (song: Song) => void;
  onView: (song: Song) => void;
  theme?: 'light' | 'dark';
}

const AcousticGuitarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path 
      d="M32 58c-8.5 0-15.5-6.5-15.5-14.5 0-5 3.5-8.5 5.5-11 0-2.5-1-5.5-1-9 0-6 4.5-11 11-11s11 5 11 11c0 3.5-1 6.5-1 9 2 2.5 5.5 6 5.5 11 0 8-7 14.5-15.5 14.5z" 
      fill="currentColor" 
      fillOpacity="0.2"
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />
    <circle cx="32" cy="42" r="3.5" fill="currentColor" />
    <rect x="30" y="6" width="4" height="15" rx="1" fill="currentColor" />
  </svg>
);

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onImport, onView, theme = 'dark' }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SONGS);

  const isDark = theme === 'dark';

  const loadForum = async () => {
    setError(null);
    if (!refreshing) setLoading(true);
    try {
      const data = await storageService.fetchForumSongs();
      setSongs(data);
    } catch (err) {
      setError("Failed to load community feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadForum();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadForum();
  };

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
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className={`px-6 py-6 flex justify-between items-end border-b backdrop-blur-xl ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}>
        <div className="flex items-center gap-4">
          {/* Triple Acoustic Guitar Logo - recognizably guitars now */}
          <div className="relative w-16 h-12 flex items-center justify-center">
             <AcousticGuitarIcon className={`absolute w-10 h-10 transition-colors -translate-x-4 rotate-[-25deg] ${isDark ? 'text-blue-500 opacity-30' : 'text-blue-400 opacity-40'}`} />
             <AcousticGuitarIcon className={`absolute w-10 h-10 transition-colors translate-x-4 rotate-[25deg] ${isDark ? 'text-blue-500 opacity-30' : 'text-blue-400 opacity-40'}`} />
             <AcousticGuitarIcon className={`absolute w-11 h-11 transition-colors z-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>Common</h1>
            <p className={`text-xs font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Global Archive</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className={`p-3 rounded-full active:scale-90 transition-all border ${refreshing ? 'animate-spin text-blue-500' : ''} ${isDark ? 'bg-zinc-800 text-zinc-400 border-white/5' : 'bg-white text-zinc-400 border-zinc-200 shadow-sm'}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-4 space-y-4 shrink-0">
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
            placeholder="Search global board..." 
            className={`w-full border rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors ${isDark ? 'bg-[#1c1c1e] border-white/5 text-white placeholder:text-zinc-700' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className={`w-5 h-5 absolute left-4 top-4 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Fetching Board...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-10">
            <p className="text-red-400 font-bold mb-4">{error}</p>
            <button onClick={loadForum} className="text-blue-500 font-black uppercase text-xs tracking-widest">Retry Connection</button>
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-20 px-10">
            <p className={`font-bold italic mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>No results found.</p>
            <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Try a different search</p>
          </div>
        ) : (
          processedData.map((group) => (
            <div key={group.label} className="mb-6">
                <div className={`sticky top-0 backdrop-blur-xl px-5 py-2 border-b z-10 flex justify-between items-center ${isDark ? 'bg-[#121212]/90 border-white/5' : 'bg-[#f8f9fa]/90 border-zinc-200'}`}>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{group.label}</span>
                </div>
                <div className="px-3 space-y-2 mt-2">
                    {group.songs.map((song) => (
                        <div 
                        key={song.id} 
                        onClick={() => onView(song)} 
                        className={`border rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden ${isDark ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-zinc-100 shadow-zinc-200/50'}`}
                        >
                        <div className="flex justify-between items-center">
                            <div className="flex-1 pr-4 truncate">
                            <h3 className={`text-[17px] font-bold leading-tight truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{song.title}</h3>
                            <p className="text-blue-500 font-black text-[9px] uppercase tracking-widest mt-0.5 truncate">{song.artist}</p>
                            </div>
                            
                            <button 
                            onClick={(e) => { e.stopPropagation(); onImport(song); }}
                            className={`shrink-0 px-4 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest active:scale-90 transition-all border ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white border-white/5' : 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'}`}
                            >
                            Add
                            </button>
                        </div>
                        </div>
                    ))}
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
