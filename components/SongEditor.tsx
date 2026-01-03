
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';

interface SongEditorProps {
  song?: Song;
  onSave: (song: Partial<Song>) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, onSave, onCancel, onDelete }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [content, setContent] = useState(song?.content || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const deleteTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    };
  }, []);

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
      // Сброс через 3 секунды
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = window.setTimeout(() => {
        setIsConfirmingDelete(false);
      }, 3000);
    } else {
      // Второе нажатие - удаляем
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

      <div className="flex-1 flex flex-col space-y-0 overflow-y-auto bg-black">
        <input 
          className="w-full bg-[#121212] text-2xl font-black border-b border-white/5 py-6 px-6 focus:ring-0 placeholder:text-zinc-800 text-white outline-none"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          className="w-full bg-[#121212] text-lg font-medium border-b border-white/5 py-4 px-6 focus:ring-0 placeholder:text-zinc-800 text-zinc-400 outline-none"
          placeholder="Artist / Author"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
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
