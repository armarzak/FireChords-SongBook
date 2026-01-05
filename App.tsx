
import React, { useState, useEffect } from 'react';
import { Song, AppState } from './types';
import { storageService } from './services/storageService';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { PerformanceView } from './components/PerformanceView';
import { ChordDictionary } from './components/ChordDictionary';
import { Tuner } from './components/Tuner';

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [state, setState] = useState<AppState>(AppState.LIST);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadedSongs = storageService.getSongs();
    if (loadedSongs.length === 0) {
      const defaults = storageService.getDefaultSongs();
      setSongs(defaults);
      storageService.saveSongs(defaults);
    } else {
      setSongs(loadedSongs);
    }

    const params = new URLSearchParams(window.location.search);
    const importData = params.get('import');
    if (importData) {
      const decoded = storageService.decodeSongFromUrl(importData);
      if (decoded && decoded.title) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setSongs(prev => {
            const exists = prev.find(s => s.title === decoded.title && s.artist === decoded.artist);
            if (exists) {
                setToast(`Song already in library`);
                return prev;
            }
            const newSong = { ...decoded, id: Date.now().toString() } as Song;
            const updated = [newSong, ...prev];
            storageService.saveSongs(updated);
            setToast(`Imported: ${decoded.title}`);
            return updated;
        });
      }
    }
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  useEffect(() => {
    if (toast) {
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSelectSong = (song: Song) => {
    setCurrentSongId(song.id);
    setState(AppState.PERFORMANCE);
  };

  const handleSaveSong = (songData: Partial<Song>) => {
    let newSongs;
    if (currentSongId) {
      newSongs = songs.map(s => s.id === currentSongId ? { ...s, ...songData } as Song : s);
    } else {
      const newSong: Song = {
        id: Date.now().toString(),
        title: songData.title || 'Untitled',
        artist: songData.artist || 'Unknown',
        content: songData.content || '',
        transpose: 0
      };
      newSongs = [newSong, ...songs];
    }
    setSongs(newSongs);
    storageService.saveSongs(newSongs);
    setState(AppState.LIST);
  };

  const handleDeleteSong = (id: string) => {
    const newSongs = songs.filter(s => s.id !== id);
    setSongs(newSongs);
    storageService.saveSongs(newSongs);
    setCurrentSongId(null);
    setState(AppState.LIST);
  };

  const currentSong = songs.find(s => s.id === currentSongId);
  const existingArtists = Array.from(new Set(songs.map(s => s.artist))).sort();

  return (
    <div className="h-full w-full overflow-hidden bg-[#121212] text-white select-none flex flex-col fixed inset-0">
      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            onSelect={handleSelectSong} 
            onAdd={() => { setCurrentSongId(null); setState(AppState.EDIT); }}
            onExportSuccess={(msg) => setToast(msg)}
          />
        )}

        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            existingArtists={existingArtists}
            onSave={handleSaveSong} 
            onCancel={() => currentSongId ? setState(AppState.PERFORMANCE) : setState(AppState.LIST)}
            onDelete={handleDeleteSong}
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView 
            song={currentSong} 
            onClose={() => setState(AppState.LIST)}
            onEdit={() => setState(AppState.EDIT)}
            onUpdateTranspose={(id, tr) => {
                const updated = songs.map(s => s.id === id ? { ...s, transpose: tr } : s);
                setSongs(updated);
                storageService.saveSongs(updated);
            }}
          />
        )}

        {state === AppState.DICTIONARY && <ChordDictionary />}
        {state === AppState.TUNER && <Tuner />}
      </div>

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[300] bg-blue-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl animate-in slide-in-from-top duration-300">
            {toast}
        </div>
      )}

      {(state === AppState.LIST || state === AppState.DICTIONARY || state === AppState.TUNER) && (
        <div className="h-[calc(60px+env(safe-area-inset-bottom))] bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] z-[100] shrink-0">
          <button onClick={() => setState(AppState.LIST)} className={`flex flex-col items-center gap-1 flex-1 ${state === AppState.LIST ? 'text-blue-500' : 'text-zinc-500'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Songs</span>
          </button>
          <button onClick={() => setState(AppState.DICTIONARY)} className={`flex flex-col items-center gap-1 flex-1 ${state === AppState.DICTIONARY ? 'text-blue-500' : 'text-zinc-500'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Circle</span>
          </button>
          <button onClick={() => setState(AppState.TUNER)} className={`flex flex-col items-center gap-1 flex-1 ${state === AppState.TUNER ? 'text-blue-500' : 'text-zinc-500'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">Tuner</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
