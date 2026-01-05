
import React, { useState } from 'react';
import { Song, User } from '../types';
import { storageService } from '../services/storageService';
import { GoogleGenAI } from "@google/genai";

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
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  
  const handleAIHelp = async () => {
    if (!title) {
        onNotify("Enter song title first!");
        return;
    }
    setIsAIGenerating(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write guitar chords and lyrics for the song "${title}" by "${artist || 'Unknown'}". 
            Use the format: [Intro], [Verse], [Chorus]. Place chords above lyrics. 
            Keep it simple and accurate. Return only the song content.`
        });
        if (response.text) {
            setContent(response.text);
            onNotify("AI chords generated! 🎸");
        }
    } catch (e) {
        onNotify("AI busy. Try again later.");
    } finally {
        setIsAIGenerating(false);
    }
  };

  const handlePublish = async () => {
    const user = storageService.getUser();
    if (!user) {
        onNotify("Session expired. Please re-login.");
        return;
    }

    if (!title.trim() || !content.trim()) {
      onNotify("Title and chords are required!");
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
        onNotify("Published to Global Board! 🚀");
      } else {
        onNotify("Publish failed. Check internet.");
      }
    } catch (e) {
        console.error(e);
        onNotify("Connection error.");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-[150] flex flex-col pt-[env(safe-area-inset-top)]">
      <div className="flex justify-between items-center px-4 py-4 border-b border-[#2c2c2c] bg-zinc-900">
        <button onClick={onCancel} className="text-zinc-500 font-medium text-lg px-2 active:text-white">Cancel</button>
        <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-400">Editor</h2>
        <button onClick={() => onSave({ title, artist, content, capo, tuning })} className="text-blue-500 font-bold text-lg px-2 active:scale-95">Save</button>
      </div>

      <div className="flex-1 flex flex-col space-y-0 overflow-y-auto bg-black relative">
        <input 
          className="w-full bg-[#121212] text-2xl font-black border-b border-white/5 py-6 px-6 focus:ring-0 placeholder:text-zinc-800 text-white outline-none"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div className="grid grid-cols-1 border-b border-white/5 bg-[#121212]">
          <input 
            className="w-full bg-transparent text-sm font-medium py-4 px-6 placeholder:text-zinc-800 text-zinc-400 outline-none"
            placeholder="Artist / Band"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between bg-[#1c1c1e] px-6 py-3 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase">Capo:</span>
                <input type="number" className="w-10 bg-zinc-800 rounded px-1 py-1 text-xs font-bold text-blue-400 text-center" value={capo} onChange={(e) => setCapo(parseInt(e.target.value) || 0)} />
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-600 uppercase">Tune:</span>
                <input className="w-20 bg-zinc-800 rounded px-2 py-1 text-xs font-bold text-blue-400" value={tuning} onChange={(e) => setTuning(e.target.value)} />
             </div>
          </div>
          <button 
            onClick={handleAIHelp}
            disabled={isAIGenerating}
            className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-50"
          >
            {isAIGenerating ? 'Magic...' : 'AI Chords'}
          </button>
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
            onClick={handlePublish}
            disabled={isPublishing}
            className={`w-full py-5 rounded-3xl font-black text-sm flex items-center justify-center gap-3 transition-all uppercase tracking-widest ${isPublishing ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black active:scale-95 shadow-xl shadow-white/5'}`}
          >
            {isPublishing ? 'Syncing...' : 'Publish to Board'}
          </button>

          {song && (
            <button 
                onClick={() => {
                    if (isConfirmingDelete) onDelete(song.id);
                    else {
                        setIsConfirmingDelete(true);
                        setTimeout(() => setIsConfirmingDelete(false), 3000);
                    }
                }}
                className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-500' : 'bg-transparent text-red-500 border-red-500/20'}`}
            >
                {isConfirmingDelete ? 'Delete Forever' : 'Delete Song'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
