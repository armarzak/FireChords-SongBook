
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';

interface SongEditorProps {
  song?: Song;
  existingArtists: string[];
  onSave: (song: Partial<Song>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, existingArtists, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [content, setContent] = useState(song?.content || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const deleteTimerRef = useRef<number | null>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

  // Закрытие подсказок при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleArtistChange = (value: string) => {
    setArtist(value);
    const trimmedValue = value.trim();
    if (trimmedValue.length > 0) {
      const filtered = existingArtists.filter(a => 
        a.toLowerCase().startsWith(trimmedValue.toLowerCase()) && 
        a.toLowerCase() !== trimmedValue.toLowerCase()
      );
      setSuggestions(filtered.slice(0, 5)); // Показываем топ-5
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setArtist(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
        alert('Title is required');
        return;
    }
    onSave({ 
        title: title.trim(), 
        artist: artist.trim() || 'Unknown Artist', 
        content: content, 
        transpose: song?.transpose || 0 
    });
  };

  const initiateDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!song) return;

    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000);
    } else {
      if (onDelete) {
        onDelete(song.id);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-[150] flex flex-col pt-[env(safe-area-inset-top)]">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-[#2c2c2c] bg-zinc-900">
        <button onClick={onCancel} className="text-blue-500 font-medium text-lg px-2 active:opacity-50">Cancel</button>
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-400">{song ? 'Edit Song' : 'New Song'}</h2>
        <button onClick={handleSave} className="text-blue-500 font-bold text-lg px-2 active:opacity-50">Save</button>
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
            onFocus={() => handleArtistChange(artist)}
            autoComplete="off"
          />
          
          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 bg-zinc-900 border-b border-white/10 z-[160] shadow-2xl animate-in fade-in slide-in-from-top-1 overflow-hidden">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  // Используем onMouseDown вместо onClick для мгновенного срабатывания перед потерей фокуса
                  onMouseDown={(e) => {
                    e.preventDefault(); // Предотвращаем потерю фокуса инпутом
                    selectSuggestion(s);
                  }}
                  className="w-full text-left px-6 py-4 text-white bg-zinc-900 hover:bg-zinc-800 border-b border-white/5 active:bg-blue-600 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">{s}</span>
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>

        <textarea 
          className="flex-1 bg-black p-6 text-[16px] mono-grid resize-none border-none focus:ring-0 placeholder:text-zinc-800 text-zinc-200 leading-relaxed min-h-[300px] outline-none"
          placeholder="Paste your chords and lyrics here...&#10;&#10;C        G&#10;Hello my friend..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        
        {/* Delete Section */}
        {song && onDelete && (
          <div className="p-6 bg-[#121212] border-t border-white/5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <button 
                type="button"
                onClick={initiateDelete}
                className={`w-full py-5 rounded-2xl font-black text-sm transition-all duration-200 transform active:scale-[0.98] border ${
                  isConfirmingDelete 
                    ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                    : 'bg-red-500/10 text-red-500 border-red-500/20 active:bg-red-500/20'
                }`}
            >
                {isConfirmingDelete ? 'TAP AGAIN TO CONFIRM DELETE' : 'DELETE SONG'}
            </button>
            {isConfirmingDelete && (
                <p className="text-center text-zinc-600 text-[10px] mt-3 font-bold uppercase tracking-widest animate-pulse">
                  Canceling in 3 seconds...
                </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
