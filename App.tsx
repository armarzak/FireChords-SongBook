
import React, { useState, useEffect } from 'react';
import { Song, AppState } from './types';
import { storageService } from './services/storageService';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { PerformanceView } from './components/PerformanceView';
import { ChordDictionary } from './components/ChordDictionary';

const App: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [state, setState] = useState<AppState>(AppState.LIST);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);

  useEffect(() => {
    setSongs(storageService.getSongs());
  }, []);

  const handleAddSong = () => {
    setCurrentSongId(null);
    setState(AppState.EDIT);
  };

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
      newSongs = [...songs, newSong];
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

  const handleUpdateTranspose = (id: string, transpose: number) => {
    const newSongs = songs.map(s => s.id === id ? { ...s, transpose } : s);
    setSongs(newSongs);
    storageService.saveSongs(newSongs);
  };

  const currentSong = songs.find(s => s.id === currentSongId);
  
  // Получаем список уникальных артистов для автодополнения
  const existingArtists = Array.from(new Set(songs.map(s => s.artist))).sort();

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#121212] text-white select-none flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            onSelect={handleSelectSong} 
            onAdd={handleAddSong}
          />
        )}

        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            existingArtists={existingArtists}
            onSave={handleSaveSong} 
            onCancel={() => {
                if (currentSongId) setState(AppState.PERFORMANCE);
                else setState(AppState.LIST);
            }}
            onDelete={handleDeleteSong}
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView 
            song={currentSong} 
            onClose={() => setState(AppState.LIST)}
            onEdit={() => setState(AppState.EDIT)}
            onUpdateTranspose={handleUpdateTranspose}
          />
        )}

        {state === AppState.DICTIONARY && (
          <ChordDictionary />
        )}
      </div>

      {(state === AppState.LIST || state === AppState.DICTIONARY) && (
        <div className="h-[calc(60px+env(safe-area-inset-bottom))] bg-zinc-900/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-10 pb-[env(safe-area-inset-bottom)] z-[100]">
          <button 
            onClick={() => setState(AppState.LIST)}
            className={`flex flex-col items-center gap-1 transition-colors ${state === AppState.LIST ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${state === AppState.LIST ? 'bg-blue-500' : 'bg-transparent'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Songs</span>
          </button>
          
          <button 
            onClick={() => setState(AppState.DICTIONARY)}
            className={`flex flex-col items-center gap-1 transition-colors ${state === AppState.DICTIONARY ? 'text-blue-500' : 'text-zinc-500'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${state === AppState.DICTIONARY ? 'bg-blue-500' : 'bg-transparent'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">Circle</span>
          </button>
        </div>
      )}
      
      {!navigator.onLine && (
        <div className="fixed top-0 left-0 right-0 bg-orange-600 text-[10px] text-center py-0.5 z-[200]">
          OFFLINE MODE
        </div>
      )}
    </div>
  );
};

export default App;
