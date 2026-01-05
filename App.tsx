
import React, { useState, useEffect } from 'react';
import { Song, AppState, User } from './types';
import { storageService } from './services/storageService';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { PerformanceView } from './components/PerformanceView';
import { ChordDictionary } from './components/ChordDictionary';
import { Tuner } from './components/Tuner';
import { CommunityFeed } from './components/CommunityFeed';
import { LoginScreen } from './components/LoginScreen';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [state, setState] = useState<AppState>(AppState.LIST);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sharedSong, setSharedSong] = useState<Song | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(storageService.isCloudEnabled());

  useEffect(() => {
    const currentUser = storageService.getUser();
    if (currentUser) {
      setUser(currentUser);
      initApp(currentUser);
    } else {
      setState(AppState.AUTH);
    }

    const params = new URLSearchParams(window.location.search);
    const postData = params.get('post');
    if (postData) {
      const decoded = storageService.decodePostFromUrl(postData);
      if (decoded) {
        setSharedSong(decoded);
        setState(AppState.PERFORMANCE);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    
    // Блокировка стандартного поведения iOS Safari
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  const initApp = async (u: User) => {
    setIsSyncing(true);
    try {
      // Сначала локальные данные (мгновенно)
      const local = await storageService.getSongsLocal();
      if (local.length > 0) {
        setSongs(local);
      }
      
      // Попытка синхронизации с облаком
      if (storageService.isCloudEnabled()) {
        const cloud = await storageService.restoreLibraryFromCloud(u);
        if (cloud && cloud.length > 0) {
          setSongs(cloud);
          await storageService.saveSongsBulk(cloud);
          setIsOnline(true);
        }
      } else {
        setIsOnline(false);
      }

      if (songs.length === 0 && local.length === 0) {
          const defaults = storageService.getDefaultSongs();
          setSongs(defaults);
          await storageService.saveSongsBulk(defaults);
      }
    } catch (e) {
      console.error("App init failed", e);
      setIsOnline(false);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (toast) {
        const t = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(t);
    }
  }, [toast]);

  const handleLogin = (name: string) => {
    const newUser = storageService.saveUser(name);
    setUser(newUser);
    initApp(newUser);
    setState(AppState.LIST);
    setToast(`Rock on, ${name}!`);
  };

  const handleSync = async (updatedSongs: Song[]) => {
    if (!user || !storageService.isCloudEnabled()) return;
    setIsSyncing(true);
    const success = await storageService.syncLibraryWithCloud(updatedSongs, user);
    setIsOnline(success);
    setIsSyncing(false);
    return success;
  };

  const handleImportSong = async (song: Song) => {
    const exists = songs.find(s => s.title === song.title && s.artist === song.artist);
    if (exists) {
        setToast(`Already in library`);
        return;
    }
    const newSong = { ...song, id: 's-' + Date.now() };
    const updated = [newSong, ...songs];
    setSongs(updated);
    await storageService.saveSongLocal(newSong);
    handleSync(updated);
    setToast(`Saved to Cloud DB`);
  };

  const handleSaveSong = async (songData: Partial<Song>) => {
    let updatedSongs;
    const songId = currentSongId || 's-' + Date.now();
    
    if (currentSongId) {
      updatedSongs = songs.map(s => s.id === currentSongId ? { ...s, ...songData } as Song : s);
      const songToSave = updatedSongs.find(s => s.id === currentSongId)!;
      await storageService.saveSongLocal(songToSave);
    } else {
      const newSong: Song = {
        id: songId,
        title: songData.title || 'Untitled',
        artist: songData.artist || 'Unknown',
        content: songData.content || '',
        transpose: 0,
        capo: songData.capo || 0,
        tuning: songData.tuning || 'Standard',
        authorName: user?.stageName || 'Anonymous',
        authorId: user?.id
      };
      updatedSongs = [newSong, ...songs];
      await storageService.saveSongLocal(newSong);
    }

    setSongs(updatedSongs);
    handleSync(updatedSongs);
    setState(AppState.LIST);
    setToast("Database Updated");
  };

  const currentSong = sharedSong || songs.find(s => s.id === currentSongId);
  const existingArtists = Array.from(new Set(songs.map(s => s.artist))).sort();

  return (
    <div className="h-full w-full overflow-hidden bg-[#121212] text-white select-none flex flex-col fixed inset-0">
      {/* iOS Top Blur Status Bar */}
      <div className="h-[env(safe-area-inset-top)] bg-zinc-900/80 backdrop-blur-xl shrink-0 z-[1000]"></div>
      
      {state === AppState.AUTH && <LoginScreen onLogin={handleLogin} />}

      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            isSyncing={isSyncing}
            isOnline={isOnline}
            onSyncManual={() => handleSync(songs).then((s) => setToast(s ? "Sync Successful" : "Offline Mode"))}
            onSelect={(s) => { setCurrentSongId(s.id); setSharedSong(null); setState(AppState.PERFORMANCE); }} 
            onAdd={() => { setCurrentSongId(null); setSharedSong(null); setState(AppState.EDIT); }}
            onExportSuccess={(msg) => setToast(msg)}
          />
        )}

        {state === AppState.FORUM && (
          <CommunityFeed 
            onImport={handleImportSong} 
            onView={(song) => { setSharedSong(song); setState(AppState.PERFORMANCE); }} 
          />
        )}

        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            existingArtists={existingArtists}
            onSave={handleSaveSong} 
            onCancel={() => currentSongId || sharedSong ? setState(AppState.PERFORMANCE) : setState(AppState.LIST)}
            onDelete={async (id) => {
              await storageService.deleteSongLocal(id);
              const newSongs = songs.filter(s => s.id !== id);
              setSongs(newSongs);
              setState(AppState.LIST);
              setToast("Song Removed");
            }}
            onNotify={(m) => setToast(m)}
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView 
            song={currentSong} 
            onClose={() => setState(AppState.LIST)}
            onEdit={() => setState(AppState.EDIT)}
            onUpdateTranspose={async (id, tr) => {
                if (sharedSong) return;
                const updated = songs.map(s => s.id === id ? { ...s, transpose: tr } : s);
                setSongs(updated);
                const songToUpdate = updated.find(s => s.id === id)!;
                await storageService.saveSongLocal(songToUpdate);
            }}
          />
        )}

        {state === AppState.DICTIONARY && <ChordDictionary />}
        {state === AppState.TUNER && <Tuner />}
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-white/10 backdrop-blur-3xl text-white px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10 animate-in slide-in-from-top-8 fade-in duration-500">
            {toast}
        </div>
      )}

      {(state !== AppState.AUTH && state !== AppState.EDIT && state !== AppState.PERFORMANCE) && (
        <div className="h-[calc(64px+env(safe-area-inset-bottom))] bg-zinc-900/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-4 pb-[env(safe-area-inset-bottom)] z-[100] shrink-0">
          {[
            { id: AppState.LIST, label: 'Library', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: AppState.FORUM, label: 'Board', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
            { id: AppState.DICTIONARY, label: 'Theory', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: AppState.TUNER, label: 'Tuner', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setState(tab.id)} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${state === tab.id ? 'text-blue-500 scale-110' : 'text-zinc-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} />
              </svg>
              <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
