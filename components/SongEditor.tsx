
import React, { useState } from 'react';
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

  const handleSave = () => {
    if (!title.trim()) return alert('Title is required');
    onSave({ title, artist, content, transpose: song?.transpose || 0 });
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-50 flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex justify-between items-center px-4 py-4 border-b border-[#2c2c2c] bg-zinc-900">
        <button onClick={onCancel} className="text-blue-500 font-medium text-lg px-2 active:opacity-50">Cancel</button>
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-400">{song ? 'Edit Song' : 'New Song'}</h2>
        <button onClick={handleSave} className="text-blue-500 font-bold text-lg px-2 active:opacity-50">Save</button>
      </div>

      <div className="flex-1 flex flex-col space-y-0 overflow-y-auto bg-black">
        <input 
          className="w-full bg-[#121212] text-2xl font-black border-b border-white/5 py-6 px-6 focus:ring-0 placeholder:text-zinc-800 text-white"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input 
          className="w-full bg-[#121212] text-lg font-medium border-b border-white/5 py-4 px-6 focus:ring-0 placeholder:text-zinc-800 text-zinc-400"
          placeholder="Artist / Author"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <textarea 
          className="flex-1 bg-black p-6 text-[16px] mono-grid resize-none border-none focus:ring-0 placeholder:text-zinc-800 text-zinc-200 leading-relaxed"
          placeholder="Paste your chords and lyrics here...&#10;&#10;C        G&#10;Hello my friend..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        
        {song && onDelete && (
          <div className="p-6 bg-black">
            <button 
                onClick={() => onDelete(song.id)}
                className="w-full py-4 text-red-500 bg-red-500/5 border border-red-500/20 rounded-2xl font-bold active:bg-red-500/10 transition-colors"
            >
                DELETE SONG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
