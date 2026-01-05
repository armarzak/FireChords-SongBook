
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
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
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleAiOptimize = async () => {
    if (!content.trim()) return;
    setIsAiProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a professional guitar editor. 
        Please format these guitar chords and lyrics to be perfectly aligned. 
        Use standard chord notation. Ensure there is vertical space between lines.
        Only return the formatted content, no explanations.
        
        Content to format:
        ${content}`,
      });
      
      const optimized = response.text;
      if (optimized) {
        setContent(optimized);
        onNotify("AI Optimized your chords!");
      }
    } catch (e) {
      onNotify("AI failed to process content");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      onNotify("Fill title and chords first!");
      return;
    }
    
    setIsPublishing(true);
    const songData: Song = {
        id: song?.id || 'temp-' + Date.now(),
        title,
        artist,
        content,
        transpose: 0
    };
    
    const success = await storageService.publishToForum(songData);
    if (success) {
      onNotify("Published to Forum! 🚀");
    } else {
      onNotify("Publishing failed. Try later.");
    }
    setIsPublishing(false);
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
            
            {/* AI Overlay Loader */}
            {isAiProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[10]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Gemini is Thinking...</span>
                    </div>
                </div>
            )}
        </div>
        
        <div className="p-6 bg-[#121212] border-t border-white/5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-3">
          <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAiOptimize}
                disabled={isAiProcessing}
                className="py-4 rounded-2xl font-black text-[10px] bg-purple-600/10 text-purple-400 border border-purple-500/20 active:bg-purple-600 active:text-white flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                <span className="text-sm">✨</span> AI Optimize
              </button>
              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="py-4 rounded-2xl font-black text-[10px] bg-green-600/10 text-green-400 border border-green-500/20 active:bg-green-600 active:text-white flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                {isPublishing ? (
                    <div className="w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>🚀 Post to Forum</>
                )}
              </button>
          </div>

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
