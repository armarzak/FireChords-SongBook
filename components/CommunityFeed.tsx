
import React, { useState, useEffect, useMemo } from 'react';
import { Song, ViewMode } from '../types';
import { storageService } from '../services/storageService';

interface CommunityFeedProps {
  onImport: (song: Song) => void;
  onView: (song: Song) => void;
  onDelete?: (songId: string) => Promise<boolean>;
  theme?: 'light' | 'dark';
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ onImport, onView, onDelete, theme = 'dark' }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.SONGS);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const currentUser = storageService.getUser();

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

  const handleDeleteClick = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (!currentUser) return;

    if (confirmDeleteId !== songId) {
      setConfirmDeleteId(songId);
      setTimeout(() => setConfirmDeleteId(null), 3000);
      return;
    }

    if (onDelete) {
      const success = await onDelete(songId);
      if (success) {
        setSongs(prev => prev.filter(s => s.id !== songId));
        setConfirmDeleteId(null);
      }
    }
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
    <div className={`flex flex-col h-full pt-[env(safe-area-inset-top)] ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Header */}
      <div className="px-6 py-8 flex justify-between items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tighter leading-none">Board</h1>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-40`}>Community Archive</p>
        </div>
        <button 
          onClick={handleRefresh}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 border ${isDark ? 'bg-zinc-900 border-white/5 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-400 shadow-sm'}`}
        >
          <svg className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Controls */}
      <div className="px-6 mb-6 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search the archive..." 
            className={`w-full rounded-3xl py-5 pl-14 pr-6 outline-none transition-all font-bold ${isDark ? 'bg-zinc-900 text-white placeholder:text-zinc-700 focus:bg-zinc-800' : 'bg-white text-zinc-900 placeholder:text-zinc-300 shadow-sm border border-zinc-100'}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className={`w-6 h-6 absolute left-5 top-5 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className={`flex p-1 rounded-2xl ${isDark ? 'bg-zinc-900' : 'bg-zinc-200/50'}`}>
            <button 
              onClick={() => setViewMode(ViewMode.SONGS)} 
              className={`flex-1 py-2 text-[9px] font-black rounded-xl transition-all ${viewMode === ViewMode.SONGS ? (isDark ? 'bg-zinc-700 text-white shadow-xl' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
            >BY SONG</button>
            <button 
              onClick={() => setViewMode(ViewMode.ARTISTS)} 
              className={`flex-1 py-2 text-[9px] font-black rounded-xl transition-all ${viewMode === ViewMode.ARTISTS ? (isDark ? 'bg-zinc-700 text-white shadow-xl' : 'bg-white text-zinc-900 shadow-sm') : 'text-zinc-500'}`}
            >BY ARTIST</button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 opacity-20">
            <div className="w-8 h-8 border-4 border-current border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest">Accessing Database</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 px-10">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button onClick={loadForum} className="text-blue-500 font-black uppercase text-[10px] tracking-widest underline">Retry</button>
          </div>
        ) : processedData.length === 0 ? (
          <div className="text-center py-32 opacity-20">
            <p className="font-black text-xl tracking-tight">Nothing found</p>
          </div>
        ) : (
          processedData.map((group) => (
            <div key={group.label} className="mb-8">
                <div className="px-4 mb-4 flex items-center gap-4">
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">{group.label}</span>
                    <div className={`h-[1px] flex-1 ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}`}></div>
                </div>
                <div className="space-y-3">
                    {group.songs.map((song) => (
                        <div 
                          key={song.id} 
                          onClick={() => onView(song)} 
                          className={`group relative rounded-[2rem] p-6 transition-all active:scale-[0.97] overflow-hidden border ${isDark ? 'bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60' : 'bg-white border-zinc-100 shadow-sm hover:shadow-md'}`}
                        >
                          <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-black tracking-tight truncate leading-none mb-2">{song.title}</h3>
                                <div className="flex items-center gap-3">
                                  <span className="text-blue-500 font-black text-[10px] uppercase tracking-widest truncate">{song.artist}</span>
                                  <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                                  <span className={`text-[10px] font-bold truncate opacity-40`}>by {song.authorName}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 shrink-0">
                                {currentUser && song.authorId === currentUser.id && (
                                  <button 
                                    onClick={(e) => handleDeleteClick(e, song.id)}
                                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${confirmDeleteId === song.id ? 'bg-red-600 border-red-500 text-white' : (isDark ? 'bg-zinc-800 border-white/5 text-red-500' : 'bg-red-50 border-red-100 text-red-500')}`}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onImport(song); }}
                                  className={`h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-90 ${isDark ? 'bg-white text-black shadow-white/5' : 'bg-blue-600 text-white shadow-blue-500/20'}`}
                                >
                                  Add
                                </button>
                              </div>
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
