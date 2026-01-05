
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { storageService } from '../services/storageService';

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
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!title || !content) return;
    
    const songData: Song = {
        id: 'temp',
        title,
        artist,
        content,
        transpose: 0
    };
    
    const encoded = storageService.encodeSongForUrl(songData);
    const shareUrl = `${window.location.origin}${window.location.pathname}?import=${encoded}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: `Chords for ${title}`,
                text: `Check out the chords for "${title}" by ${artist}`,
                url: shareUrl
            });
        } catch (e) {
            console.log("Share cancelled");
        }
    } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');
        setTimeout(() => setShareStatus('idle'), 2000);
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
        <button onClick={onCancel} className="text-blue-500 font-medium text-lg px-2">Cancel</button>
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-400">Editor</h2>
        <button onClick={() => onSave({ title, artist, content })} className="text-blue-500 font-bold text-lg px-2">Save</button>
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

        <textarea 
          className="flex-1 bg-black p-6 text-[16px] mono-grid resize-none border-none focus:ring-0 placeholder:text-zinc-800 text-zinc-200 leading-relaxed min-h-[300px] outline-none"
          placeholder="C        G\nHello my friend..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
        />
        
        <div className="p-6 bg-[#121212] border-t border-white/5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-3">
          <button 
            onClick={handleShare}
            className="w-full py-5 rounded-2xl font-black text-sm bg-blue-600/10 text-blue-500 border border-blue-500/20 active:bg-blue-600 active:text-white transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareStatus === 'copied' ? 'LINK COPIED!' : 'SHARE SONG LINK'}
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
                className={`w-full py-5 rounded-2xl font-black text-sm border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-500' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
            >
                {isConfirmingDelete ? 'CONFIRM DELETE' : 'DELETE SONG'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
