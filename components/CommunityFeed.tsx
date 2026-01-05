
import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface CommunityFeedProps {
  onImport: (song: Song) => void;
  onView: (song: Song) => void;
  theme?: 'light' | 'dark';
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onImport, onView, theme = 'dark' }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className={`px-6 py-6 flex justify-between items-end border-b backdrop-blur-xl ${isDark ? 'border-white/5 bg-zinc-900/50' : 'border-zinc-200 bg-white/80'}`}>
        <div>
          <h1 className={`text-4xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-zinc-900'}`}>Common</h1>
          <p className={`text-xs font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Global Archive</p>
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

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
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
        ) : songs.length === 0 ? (
          <div className="text-center py-20 px-10">
            <p className={`font-bold italic mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Board is quiet today.</p>
            <p className={`text-xs uppercase tracking-widest ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Share yours from the Editor!</p>
          </div>
        ) : (
          songs.map((song) => (
            <div 
              key={song.id} 
              onClick={() => onView(song)} 
              className={`border rounded-2xl p-4 shadow-lg active:scale-[0.98] transition-all relative overflow-hidden ${isDark ? 'bg-[#1c1c1e] border-white/5' : 'bg-white border-zinc-100'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 pr-4 truncate">
                  <h3 className={`text-lg font-black leading-tight truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{song.title}</h3>
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
          ))
        )}
      </div>
    </div>
  );
};
