
import React, { useState, useRef } from 'react';
import { Song } from '../types';
import { storageService } from '../services/storageService';

interface SongEditorProps {
  song?: Song;
  existingArtists: string[];
  onSave: (song: Partial<Song>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
  onNotify: (msg: string) => void;
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, existingArtists, onSave, onCancel, onDelete, onNotify }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [content, setContent] = useState(song?.content || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      onNotify("Title and chords are required!");
      return;
    }
    
    setIsPublishing(true);
    const songData: Song = {
        id: song?.id || 'temp-' + Date.now(),
        title,
        artist: artist || 'Anonymous',
        content,
        transpose: 0
    };
    
    try {
      const success = await storageService.publishToForum(songData);
      if (success) {
        onNotify("Successfully posted to Forum! 🚀");
      } else {
        onNotify("Post failed. Check your connection.");
      }
    } catch (e) {
      onNotify("Error during publishing.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleArtistChange = (value: string) => {
    setArtist(value);
    const trimmedValue = value.trim();
    if (trimmedValue.length > 0) {
      const filtered = existingArtists.filter(a => 
        a.toLowerCase().startsWith(trimmedValue.toLowerCase()) && 
        a.toLowerCase() !== trimmedValue.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-[150] flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex justify-between items-center px-4 py-4 border-b border-[#2c2c2c] bg-zinc-900">
        <button onClick={onCancel} className="text-zinc-500 font-medium text-lg px-2 active:text-white">Cancel</button>
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-400">Editor</h2>
        <button onClick={() => onSave({ title, artist, content })} className="text-blue-500 font-bold text-lg px-2 active:scale-95">Save</button>
      </div>

      <div className="flex-1 flex flex-col space-y-0 overflow-y-auto bg-black relative">
        <input 
          className="w-full bg-[#121212] text-2xl font-black border-b border-white/5 py-6 px-6 focus:ring-0 placeholder:text-zinc-800 text-white outline-none"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="relative" ref={suggestionRef}>
          <input 
            className="w-full bg-[#121212] text-lg font-medium border-b border-white/5 py-4 px-6 focus:ring-0 placeholder:text-zinc-800 text-zinc-400 outline-none"
            placeholder="Artist / Author"
            value={artist}
            onChange={(e) => handleArtistChange(e.target.value)}
            autoComplete="off"
          />
          {showSuggestions && (
            <div className="absolute left-0 right-0 bg-zinc-900 border-b border-white/10 z-[160] shadow-2xl">
              {suggestions.map((s, idx) => (
                <button key={idx} onMouseDown={() => { setArtist(s); setShowSuggestions(false); }} className="w-full text-left px-6 py-4 text-white border-b border-white/5 active:bg-blue-600">
                  <span className="font-semibold">{s}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex-1 flex flex-col">
            <textarea 
                className="flex-1 bg-black p-6 text-[16px] mono-grid resize-none border-none focus:ring-0 placeholder:text-zinc-800 text-zinc-200 leading-relaxed min-h-[300px] outline-none"
                placeholder="C        G\nHello my friend..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
            />
        </div>
        
        <div className="p-6 bg-[#121212] border-t border-white/5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${isPublishing ? 'bg-zinc-800 text-zinc-500' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 active:scale-95'}`}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                Publishing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Post to Forum
              </>
            )}
          </button>

          {song && onDelete && (
            <button 
                onClick={(e) => {
                    if (isConfirmingDelete) onDelete(song.id);
                    else {
                        setIsConfirmingDelete(true);
                        setTimeout(() => setIsConfirmingDelete(false), 3000);
                    }
                }}
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
            >
                {isConfirmingDelete ? 'CONFIRM DELETE' : 'DELETE FROM LIBRARY'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
