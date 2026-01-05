
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
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const currentUser = storageService.getUser();
    if (currentUser) {
      setUser(currentUser);
      initApp(currentUser);
    } else {
      setState(AppState.AUTH);
    }
    
    // Блокировка скролла для iOS Safari
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
      // 1. Сначала локальное хранилище
      const local = await storageService.getSongsLocal();
      if (local.length > 0) setSongs(local);
      
      // 2. Проверка облака
      if (storageService.isCloudEnabled()) {
        const cloud = await storageService.restoreLibraryFromCloud(u);
        if (cloud) {
          setSongs(cloud);
          await storageService.saveSongsBulk(cloud);
          setIsOnline(true);
          console.log("✅ Cloud connection established");
        } else {
          setIsOnline(false);
          console.warn("⚠️ Cloud enabled but fetch failed");
        }
      } else {
        setIsOnline(false);
        console.warn("⚠️ Supabase is not configured");
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (name: string) => {
    const newUser = storageService.saveUser(name);
    setUser(newUser);
    initApp(newUser);
    setState(AppState.LIST);
    showToast(`Welcome, ${name}!`);
  };

  const handleSync = async (updatedSongs: Song[]) => {
    if (!user || !storageService.isCloudEnabled()) {
        showToast("Cloud connection missing");
        return;
    }
    setIsSyncing(true);
    const success = await storageService.syncLibraryWithCloud(updatedSongs, user);
    setIsOnline(success);
    setIsSyncing(false);
    showToast(success ? "Synced with Supabase" : "Sync Failed: Check Tables");
    return success;
  };

  const handleSaveSong = async (songData: Partial<Song>) => {
    let updatedSongs;
    const songId = currentSongId || 's-' + Date.now();
    
    if (currentSongId) {
      updatedSongs = songs.map(s => s.id === currentSongId ? { ...s, ...songData } as Song : s);
      await storageService.saveSongLocal(updatedSongs.find(s => s.id === currentSongId)!);
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
  };

  const currentSong = sharedSong || songs.find(s => s.id === currentSongId);

  return (
    <div className="h-full w-full bg-[#121212] text-white select-none flex flex-col fixed inset-0 font-sans">
      <div className="h-[env(safe-area-inset-top)] bg-zinc-900/80 backdrop-blur-xl shrink-0 z-[1000]"></div>
      
      {state === AppState.AUTH && <LoginScreen onLogin={handleLogin} />}

      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            isSyncing={isSyncing}
            isOnline={isOnline}
            onSyncManual={() => handleSync(songs)}
            onSelect={(s) => { setCurrentSongId(s.id); setState(AppState.PERFORMANCE); }} 
            onAdd={() => { setCurrentSongId(null); setState(AppState.EDIT); }}
            onExportSuccess={showToast}
          />
        )}

        {state === AppState.FORUM && (
          <CommunityFeed 
            onImport={async (s) => {
              const newSongs = [s, ...songs];
              setSongs(newSongs);
              await storageService.saveSongLocal(s);
              handleSync(newSongs);
              showToast("Imported to Cloud");
            }} 
            onView={(song) => { setSharedSong(song); setState(AppState.PERFORMANCE); }} 
          />
        )}

        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            existingArtists={[]}
            onSave={handleSaveSong} 
            onCancel={() => setState(AppState.LIST)}
            onDelete={async (id) => {
              await storageService.deleteSongLocal(id);
              setSongs(songs.filter(s => s.id !== id));
              setState(AppState.LIST);
              showToast("Deleted");
            }}
            onNotify={showToast}
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView 
            song={currentSong} 
            onClose={() => setState(AppState.LIST)}
            onEdit={() => setState(AppState.EDIT)}
            onUpdateTranspose={async (id, tr) => {
                const updated = songs.map(s => s.id === id ? { ...s, transpose: tr } : s);
                setSongs(updated);
                await storageService.saveSongLocal(updated.find(s => s.id === id)!);
            }}
          />
        )}

        {state === AppState.DICTIONARY && <ChordDictionary />}
        {state === AppState.TUNER && <Tuner />}
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] bg-zinc-800/90 backdrop-blur-2xl text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-4">
            {toast}
        </div>
      )}

      {![AppState.AUTH, AppState.EDIT, AppState.PERFORMANCE].includes(state) && (
        <div className="h-[calc(64px+env(safe-area-inset-bottom))] bg-zinc-900/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around pb-[env(safe-area-inset-bottom)] z-[100]">
          {[
            { id: AppState.LIST, label: 'Songs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: AppState.FORUM, label: 'Board', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
            { id: AppState.DICTIONARY, label: 'Theory', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: AppState.TUNER, label: 'Tuner', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setState(tab.id)} className={`flex flex-col items-center gap-1 flex-1 ${state === tab.id ? 'text-blue-500' : 'text-zinc-500'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={tab.icon} /></svg>
              <span className="text-[8px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
