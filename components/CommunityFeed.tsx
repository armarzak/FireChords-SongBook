
import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface CommunityFeedProps {
  onImport: (song: Song) => void;
  onView: (song: Song) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onImport, onView }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)]">
      <div className="px-6 py-6 flex justify-between items-end border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Board</h1>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mt-1">Global Chord Archive</p>
        </div>
        <button 
          onClick={handleRefresh}
          className={`p-3 rounded-full bg-zinc-800 text-zinc-400 active:scale-90 transition-all ${refreshing ? 'animate-spin text-blue-500' : ''}`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-600 font-black text-xs uppercase tracking-widest">Fetching Board...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-10">
            <p className="text-red-400 font-bold mb-4">{error}</p>
            <button onClick={loadForum} className="text-blue-500 font-black uppercase text-xs tracking-widest">Retry Connection</button>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20 px-10">
            <p className="text-zinc-600 font-bold italic mb-2">Board is quiet today.</p>
            <p className="text-zinc-700 text-xs uppercase tracking-widest">Share yours from the Editor!</p>
          </div>
        ) : (
          songs.map((song) => (
            <div key={song.id} onClick={() => onView(song)} className="bg-[#1c1c1e] border border-white/5 rounded-3xl p-6 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-12">
                  <h3 className="text-xl font-black text-white leading-tight">{song.title}</h3>
                  <p className="text-blue-500 font-black text-[10px] uppercase tracking-widest mt-1">{song.artist}</p>
                </div>
                {song.capo && (
                   <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Capo {song.capo}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter">By {song.authorName || 'Anon'}</span>
                <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-tighter">{song.tuning || 'Standard'}</span>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                <div className="text-[9px] text-zinc-700 font-black uppercase tracking-widest">
                  {song.createdAt ? new Date(song.createdAt).toLocaleDateString() : 'Shared'}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onImport(song); }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-2xl font-black text-[9px] uppercase tracking-widest active:scale-90 transition-all border border-white/5"
                >
                  Save to Library
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
