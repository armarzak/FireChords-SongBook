
import React, { useState, useEffect, useMemo } from 'react';
import { Song, AppState, User } from './types';
import { storageService } from './services/storageService';
import { SongList } from './components/SongList';
import { SongEditor } from './components/SongEditor';
import { PerformanceView } from './components/PerformanceView';
import { ChordDictionary } from './components/ChordDictionary';
import { Tuner } from './components/Tuner';
import { CommunityFeed } from './components/CommunityFeed';
import { LoginScreen } from './components/LoginScreen';
import { ChordExplorer } from './components/ChordExplorer';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [state, setState] = useState<AppState>(AppState.LIST);
  const [currentSongId, setCurrentSongId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sharedSong, setSharedSong] = useState<Song | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const currentUser = storageService.getUser();
    if (currentUser) {
      setUser(currentUser);
      initApp(currentUser);
    } else {
      setState(AppState.AUTH);
      setIsAppReady(true);
    }
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  const initApp = async (u: User) => {
    setIsSyncing(true);
    try {
      // 1. Сначала локальные
      const localSongs = await storageService.getSongsLocal();
      setSongs(localSongs);
      setIsAppReady(true);

      // 2. Затем фоновая сверка с облаком
      if (storageService.isCloudEnabled()) {
        const cloudSongs = await storageService.restoreLibraryFromCloud(u);
        
        if (cloudSongs !== null) {
          setIsOnline(true);
          
          const mergedMap = new Map<string, Song>();
          localSongs.forEach(s => mergedMap.set(s.id, s));
          cloudSongs.forEach(s => mergedMap.set(s.id, s));
          
          const finalSongs = Array.from(mergedMap.values());
          setSongs(finalSongs);
          
          await storageService.saveSongsBulk(finalSongs);
          
          // Синхронизируем только если есть разница
          if (localSongs.length !== cloudSongs.length) {
            await storageService.syncLibraryWithCloud(finalSongs, u);
          }
        }
      }
    } catch (e) {
      console.error("[App] Init error:", e);
      setIsOnline(false);
      setIsAppReady(true);
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
  };

  const existingArtists = useMemo(() => {
    const artists = songs.map(s => s.artist).filter(a => a && a.trim() !== '');
    return Array.from(new Set(artists)).sort();
  }, [songs]);

  const currentSong = sharedSong || songs.find(s => s.id === currentSongId);
  const navBgClass = theme === 'light' ? 'bg-white/90 border-zinc-200' : 'bg-zinc-900/95 border-white/5';

  if (!isAppReady) {
    return (
      <div className={`h-full w-full flex items-center justify-center ${theme === 'light' ? 'bg-[#f8f9fa]' : 'bg-[#121212]'}`}>
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={`h-full w-full select-none flex flex-col fixed inset-0 font-sans transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8f9fa] text-zinc-900' : 'bg-[#121212] text-white'}`}>
      <div className={`h-[env(safe-area-inset-top)] ${theme === 'light' ? 'bg-white' : 'bg-zinc-900/80'} shrink-0 z-[1000]`}></div>
      
      {state === AppState.AUTH && <LoginScreen onLogin={handleLogin} theme={theme} />}

      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            isSyncing={isSyncing} 
            isOnline={isOnline} 
            theme={theme} 
            onToggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} 
            onSelect={s => { setCurrentSongId(s.id); setSharedSong(null); setState(AppState.PERFORMANCE); }} 
            onAdd={() => { 
              setCurrentSongId(null); 
              setSharedSong(null); 
              setState(AppState.EDIT); 
            }} 
            onExportSuccess={showToast} 
          />
        )}
        {state === AppState.EXPLORER && <ChordExplorer theme={theme} />}
        {state === AppState.DICTIONARY && <ChordDictionary theme={theme} />}
        {state === AppState.FORUM && (
          <CommunityFeed 
            onImport={async s => { 
              // ИСПРАВЛЕНИЕ: Импортированная песня становится приватной копией с новым ID
              const importedSong: Song = {
                ...s,
                id: 's-imp-' + Date.now(),
                is_public: false,
                authorId: user?.id,
                authorName: s.authorName + ' (Cover)'
              };
              const updated = [importedSong, ...songs];
              setSongs(updated);
              await storageService.saveSongLocal(importedSong);
              if (user) storageService.syncLibraryWithCloud(updated, user);
              showToast("Added to Songs"); 
            }} 
            onView={s => { setSharedSong(s); setCurrentSongId(null); setState(AppState.PERFORMANCE); }} 
            theme={theme} 
          />
        )}
        {state === AppState.TUNER && <Tuner theme={theme} />}
        
        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            existingArtists={existingArtists} 
            onSave={async d => {
              const id = currentSongId || 's-'+Date.now();
              const newSong: Song = {
                id,
                title: d.title || 'Untitled',
                artist: d.artist || 'Various',
                content: d.content || '',
                transpose: currentSong?.transpose || 0,
                authorName: user?.stageName || 'Me',
                authorId: user?.id,
                is_public: false // Новые песни всегда приватные по умолчанию
              };
              
              const updatedSongsList = currentSongId 
                ? songs.map(s => s.id === id ? newSong : s)
                : [newSong, ...songs];

              setSongs(updatedSongsList);
              await storageService.saveSongLocal(newSong);
              
              if (user) {
                storageService.syncLibraryWithCloud(updatedSongsList, user).then(res => {
                  if (res.success) setIsOnline(true);
                });
              }

              setCurrentSongId(null);
              setSharedSong(null);
              setState(AppState.LIST);
              showToast("Song Saved");
            }} 
            onDelete={async id => {
              await storageService.deleteSongLocal(id);
              setSongs(songs.filter(s => s.id !== id));
              setCurrentSongId(null);
              setSharedSong(null);
              setState(AppState.LIST);
              showToast("Removed");
            }}
            onCancel={() => {
              setCurrentSongId(null);
              setSharedSong(null);
              setState(AppState.LIST);
            }} 
            onNotify={showToast} 
            theme={theme} 
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView song={currentSong} theme={theme} onClose={() => { setSharedSong(null); setCurrentSongId(null); setState(AppState.LIST); }} onEdit={() => setState(AppState.EDIT)} onUpdateTranspose={(id, val) => {
             const updated = songs.map(s => s.id === id ? {...s, transpose: val} : s);
             setSongs(updated);
             const s = updated.find(x => x.id === id);
             if (s) storageService.saveSongLocal(s);
          }} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-2">
          <div className={`px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl ${theme === 'dark' ? 'bg-white text-black' : 'bg-zinc-900 text-white'}`}>
            {toast}
          </div>
        </div>
      )}

      {![AppState.AUTH, AppState.EDIT, AppState.PERFORMANCE].includes(state) && (
        <div className={`h-[calc(68px+env(safe-area-inset-bottom))] ${navBgClass} backdrop-blur-2xl border-t flex items-center justify-around pb-[env(safe-area-inset-bottom)] z-[100]`}>
          {[
            { id: AppState.LIST, label: 'Songs', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
            { id: AppState.EXPLORER, label: 'Fret', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
            { id: AppState.DICTIONARY, label: 'Circle', icon: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0' },
            { id: AppState.FORUM, label: 'Board', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9' },
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
