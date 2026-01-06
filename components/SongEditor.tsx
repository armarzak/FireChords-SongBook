
import React, { useState } from 'react';
import { Song, User } from '../types';
import { storageService } from '../services/storageService';

interface SongEditorProps {
  song?: Song;
  existingArtists: string[];
  onSave: (song: Partial<Song>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onNotify: (msg: string) => void;
  theme?: 'light' | 'dark';
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, existingArtists, onSave, onCancel, onDelete, onNotify, theme = 'dark' }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [content, setContent] = useState(song?.content || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const isDark = theme === 'dark';

  const handlePublish = async () => {
    const user = storageService.getUser();
    if (!user) {
        onNotify("Login required");
        return;
    }

    if (!title.trim() || !content.trim()) {
      onNotify("Missing Title/Content");
      return;
    }
    
    setIsPublishing(true);
    
    // Создаем чистый объект песни для публикации
    const songData: Song = {
        id: song?.id || 's-' + Date.now(),
        title: title.trim(),
        artist: artist.trim() || 'Various',
        content: content.trim(),
        transpose: song?.transpose || 0,
        authorName: user.stageName,
        is_public: true
    };
    
    try {
      const result = await storageService.publishToForum(songData, user);
      if (result.success) {
        onNotify("Live on Board! 🚀");
      } else {
        // Выводим конкретную ошибку сервера для диагностики
        const errorDetail = result.error || "Unknown Error";
        console.error("Board Publish Failure:", errorDetail);
        
        if (errorDetail.includes("row-level security")) {
            onNotify("Permission Denied (RLS)");
        } else if (errorDetail.includes("conflict")) {
            onNotify("Already Published");
        } else {
            onNotify(`Error: ${errorDetail.slice(0, 20)}...`);
        }
      }
    } catch (e: any) {
        onNotify("Network Fail");
        console.error(e);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-[150] flex flex-col pt-[env(safe-area-inset-top)] ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa]'}`}>
      <div className={`flex justify-between items-center px-4 py-4 border-b backdrop-blur-md ${isDark ? 'border-white/5 bg-zinc-900/80' : 'border-zinc-200 bg-white/80'}`}>
        <button onClick={onCancel} className={`font-bold text-sm px-4 py-2 active:text-blue-500 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Cancel</button>
        <h2 className={`text-xs font-black uppercase tracking-[0.3em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Editor</h2>
        <button onClick={() => onSave({ title, artist, content })} className="text-blue-500 font-black text-sm px-4 py-2 active:scale-95">Save</button>
      </div>

      <div className={`flex-1 flex flex-col space-y-0 overflow-y-auto relative ${isDark ? 'bg-black' : 'bg-white'}`}>
        <input 
          className={`w-full text-3xl font-black border-b py-8 px-6 focus:ring-0 outline-none tracking-tighter ${isDark ? 'bg-[#121212] border-white/5 text-white placeholder:text-zinc-800' : 'bg-white border-zinc-100 text-zinc-900 placeholder:text-zinc-200'}`}
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className={`grid grid-cols-1 border-b ${isDark ? 'border-white/5 bg-[#121212]' : 'border-zinc-100 bg-white'}`}>
          <input 
            className={`w-full bg-transparent text-sm font-bold py-5 px-6 outline-none ${isDark ? 'placeholder:text-zinc-800 text-zinc-400' : 'placeholder:text-zinc-200 text-zinc-500'}`}
            placeholder="Artist / Band"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            list="artists-list"
            autoComplete="off"
          />
          <datalist id="artists-list">
            {existingArtists.map((a, idx) => (
              <option key={idx} value={a} />
            ))}
          </datalist>
        </div>

        <textarea 
            className={`flex-1 p-6 text-[15px] mono-grid resize-none border-none focus:ring-0 leading-relaxed min-h-[400px] outline-none ${isDark ? 'bg-black text-zinc-300 placeholder:text-zinc-800' : 'bg-white text-zinc-700 placeholder:text-zinc-200'}`}
            placeholder="C        G\nLyrics go here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
        />
        
        <div className={`p-6 border-t pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4 ${isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-zinc-100'}`}>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-5 rounded-3xl font-black text-xs flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] shadow-2xl ${isPublishing ? 'bg-zinc-800 text-zinc-600' : (isDark ? 'bg-white text-black active:scale-[0.98]' : 'bg-blue-600 text-white active:scale-[0.98] shadow-blue-500/20')}`}
          >
            {isPublishing ? (
              <><div className={`w-4 h-4 border-2 rounded-full animate-spin ${isDark ? 'border-zinc-600 border-t-zinc-400' : 'border-white/30 border-t-white'}`}></div> Publishing...</>
            ) : 'Publish to Board'}
          </button>

          {song && (
            <button 
                onClick={() => {
                    if (isConfirmingDelete) onDelete?.(song.id);
                    else {
                        setIsConfirmingDelete(true);
                        setTimeout(() => setIsConfirmingDelete(false), 3000);
                    }
                }}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-500/20' : (isDark ? 'bg-transparent text-red-500 border-red-500/10' : 'bg-zinc-50 text-red-500 border-red-100')}`}
            >
                {isConfirmingDelete ? 'Are you sure?' : 'Remove from Library'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
