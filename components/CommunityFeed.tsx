
import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface CommunityFeedProps {
  onImport: (song: Song) => void;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onImport }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadForum = async () => {
    setLoading(true);
    const data = await storageService.fetchForumSongs();
    setSongs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadForum();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadForum();
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212] pt-[env(safe-area-inset-top)]">
      <div className="px-6 py-6 flex justify-between items-end border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white">Forum</h1>
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">Community Chords</p>
        </div>
        <button 
          onClick={handleRefresh}
          className={`p-3 rounded-full bg-blue-600/10 text-blue-500 active:scale-90 transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-zinc-600 font-black text-xs uppercase tracking-widest">Loading Feed...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 font-bold italic">No songs on the forum yet.<br/>Be the first to publish!</p>
          </div>
        ) : (
          songs.map((song) => (
            <div key={song.id} className="bg-zinc-900/80 border border-white/5 rounded-3xl p-6 shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                 <div className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                    <span className="text-[10px] font-black text-yellow-500">★</span>
                    <span className="text-[10px] font-black text-zinc-400">{song.likes || 0}</span>
                 </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-black text-white leading-tight mb-1">{song.title}</h3>
                <p className="text-zinc-500 font-bold text-sm uppercase tracking-wide">{song.artist}</p>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-[10px] text-zinc-700 font-black uppercase tracking-tighter">
                  Published {song.publishDate ? new Date(song.publishDate).toLocaleDateString() : 'recently'}
                </div>
                <button 
                  onClick={() => onImport(song)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 active:scale-90 transition-all"
                >
                  Add to Library
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
