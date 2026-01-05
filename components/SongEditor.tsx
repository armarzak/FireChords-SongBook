
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
}

export const SongEditor: React.FC<SongEditorProps> = ({ song, existingArtists, onSave, onCancel, onDelete, onNotify }) => {
  const [title, setTitle] = useState(song?.title || '');
  const [artist, setArtist] = useState(song?.artist || '');
  const [content, setContent] = useState(song?.content || '');
  const [capo, setCapo] = useState(song?.capo || 0);
  const [tuning, setTuning] = useState(song?.tuning || 'Standard');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const handlePublish = async () => {
    const user = storageService.getUser();
    if (!user) {
        onNotify("Please login to publish");
        return;
    }

    if (!title.trim() || !content.trim()) {
      onNotify("Title and content required!");
      return;
    }
    
    setIsPublishing(true);
    const songData: Song = {
        id: song?.id || 'temp-' + Date.now(),
        title: title.trim(),
        artist: artist.trim() || 'Various',
        content,
        capo,
        tuning,
        transpose: 0
    };
    
    try {
      const success = await storageService.publishToForum(songData, user);
      if (success) {
        onNotify("Live on Board! 🚀");
      } else {
        onNotify("Publish failed. Try again.");
      }
    } catch (e) {
        onNotify("Connection error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-[150] flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex justify-between items-center px-4 py-4 border-b border-white/5 bg-zinc-900/80 backdrop-blur-md">
        <button onClick={onCancel} className="text-zinc-500 font-bold text-sm px-4 py-2 active:text-white">Cancel</button>
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Editor</h2>
        <button onClick={() => onSave({ title, artist, content, capo, tuning })} className="text-blue-500 font-black text-sm px-4 py-2 active:scale-95">Save</button>
      </div>

      <div className="flex-1 flex flex-col space-y-0 overflow-y-auto bg-black relative">
        <input 
          className="w-full bg-[#121212] text-3xl font-black border-b border-white/5 py-8 px-6 focus:ring-0 placeholder:text-zinc-800 text-white outline-none tracking-tighter"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="grid grid-cols-1 border-b border-white/5 bg-[#121212]">
          <input 
            className="w-full bg-transparent text-sm font-bold py-5 px-6 placeholder:text-zinc-800 text-zinc-400 outline-none"
            placeholder="Artist / Band"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>

        <div className="flex items-center bg-[#1c1c1e] px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Capo:</span>
                <input type="number" className="w-12 bg-zinc-800 rounded-lg px-2 py-1.5 text-xs font-black text-blue-400 text-center border border-white/5" value={capo} onChange={(e) => setCapo(parseInt(e.target.value) || 0)} />
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Tune:</span>
                <input className="w-24 bg-zinc-800 rounded-lg px-3 py-1.5 text-xs font-black text-blue-400 border border-white/5" value={tuning} onChange={(e) => setTuning(e.target.value)} />
             </div>
          </div>
        </div>

        <textarea 
            className="flex-1 bg-black p-6 text-[15px] mono-grid resize-none border-none focus:ring-0 placeholder:text-zinc-800 text-zinc-300 leading-relaxed min-h-[400px] outline-none"
            placeholder="C        G\nLyrics go here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
        />
        
        <div className="p-6 bg-[#121212] border-t border-white/5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-4">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-5 rounded-3xl font-black text-xs flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] shadow-2xl ${isPublishing ? 'bg-zinc-800 text-zinc-600' : 'bg-white text-black active:scale-[0.98]'}`}
          >
            {isPublishing ? (
              <><div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div> Syncing to Global...</>
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
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-500' : 'bg-transparent text-red-500 border-red-500/10'}`}
            >
                {isConfirmingDelete ? 'Are you sure?' : 'Remove from Library'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
