
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    const currentUser = storageService.getUser();
    if (currentUser) {
      setUser(currentUser);
      initApp(currentUser);
    } else {
      setState(AppState.AUTH);
    }
    
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.style.overflow = '';
      document.body.style.position = '';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.getElementById('theme-color-meta')?.setAttribute('content', '#f8f9fa');
    } else {
      document.body.classList.remove('light-theme');
      document.getElementById('theme-color-meta')?.setAttribute('content', '#121212');
    }
  }, [theme]);

  const initApp = async (u: User) => {
    setIsSyncing(true);
    try {
      const local = await storageService.getSongsLocal();
      if (local.length > 0) setSongs(local);
      
      if (storageService.isCloudEnabled()) {
        const cloud = await storageService.restoreLibraryFromCloud(u);
        if (cloud !== null) {
          setIsOnline(true);
          if (cloud.length > 0) {
            setSongs(cloud);
            await storageService.saveSongsBulk(cloud);
          }
        } else {
          setIsOnline(false);
        }
      }
    } catch (e) {
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSync = async (updatedSongs: Song[]) => {
    if (!user || !storageService.isCloudEnabled()) {
        setIsOnline(false);
        return false;
    }
    setIsSyncing(true);
    const result = await storageService.syncLibraryWithCloud(updatedSongs, user);
    setIsOnline(result.success);
    setIsSyncing(false);
    
    if (!result.success && result.error) {
        console.error("Cloud Error:", result.error);
    }
    return result.success;
  };

  const handleSaveSong = async (songData: Partial<Song>) => {
    let updatedSongs;
    const songId = currentSongId || 's-' + Date.now();
    
    if (currentSongId) {
      updatedSongs = songs.map(s => s.id === currentSongId ? { ...s, ...songData } as Song : s);
      const target = updatedSongs.find(s => s.id === currentSongId);
      if (target) await storageService.saveSongLocal(target);
    } else {
      const newSong: Song = {
        id: songId,
        title: songData.title || 'Untitled',
        artist: songData.artist || 'Unknown',
        content: songData.content || '',
        transpose: 0,
        authorName: user?.stageName || 'Anonymous',
        authorId: user?.id,
        is_public: false
      };
      updatedSongs = [newSong, ...songs];
      await storageService.saveSongLocal(newSong);
    }

    setSongs(updatedSongs);
    const synced = await handleSync(updatedSongs);
    showToast(synced ? "Synced with Cloud" : "Saved Locally (Cloud Error)");
    setState(AppState.LIST);
  };

  const currentSong = sharedSong || songs.find(s => s.id === currentSongId);

  const bgClass = theme === 'light' ? 'bg-[#f8f9fa] text-[#1a1a1a]' : 'bg-[#121212] text-white';
  const navBgClass = theme === 'light' ? 'bg-white/80 border-zinc-200' : 'bg-zinc-900/95 border-white/5';
  const tabActiveColor = 'text-blue-500';
  const tabInactiveColor = theme === 'light' ? 'text-zinc-400' : 'text-zinc-500';

  // Функция для выбора иконки в зависимости от ширины экрана с более детальными путями SVG
  const getSongsIcon = () => {
    if (windowWidth > 1024) {
      // Laptop Icon (Screen + Keyboard base)
      return "M2 16h20M2 16l2 3h16l2-3M4 5h16v11H4z";
    } else if (windowWidth >= 640) {
      // Tablet Icon
      return "M7 20h10M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z";
    } else {
      // Mobile Icon
      return "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z";
    }
  };

  return (
    <div className={`h-full w-full ${bgClass} select-none flex flex-col fixed inset-0 font-sans transition-colors duration-300`}>
      <div className={`h-[env(safe-area-inset-top)] ${theme === 'light' ? 'bg-white' : 'bg-zinc-900/80'} backdrop-blur-xl shrink-0 z-[1000]`}></div>
      
      {state === AppState.AUTH && <LoginScreen onLogin={handleLogin} theme={theme} />}

      <div className="flex-1 relative overflow-hidden">
        {state === AppState.LIST && (
          <SongList 
            songs={songs} 
            isSyncing={isSyncing}
            isOnline={isOnline}
            theme={theme}
            onToggleTheme={toggleTheme}
            onSelect={(s) => { 
                setSharedSong(null);
                setCurrentSongId(s.id); 
                setState(AppState.PERFORMANCE); 
            }} 
            onAdd={() => { setCurrentSongId(null); setState(AppState.EDIT); }}
            onExportSuccess={showToast}
          />
        )}

        {state === AppState.FORUM && (
          <CommunityFeed 
            theme={theme}
            onImport={async (s) => {
              const newSong = { ...s, id: 'pub-' + s.id, is_public: false };
              const newSongs = [newSong, ...songs];
              setSongs(newSongs);
              await storageService.saveSongLocal(newSong);
              handleSync(newSongs);
              showToast("Added to Library");
            }} 
            onView={(song) => { setSharedSong(song); setState(AppState.PERFORMANCE); }} 
          />
        )}

        {state === AppState.EDIT && (
          <SongEditor 
            song={currentSong} 
            theme={theme}
            existingArtists={[]}
            onSave={handleSaveSong} 
            onCancel={() => setState(AppState.LIST)}
            onDelete={async (id) => {
              await storageService.deleteSongLocal(id);
              const filtered = songs.filter(s => s.id !== id);
              setSongs(filtered);
              setState(AppState.LIST);
              showToast("Deleted");
              handleSync(filtered);
            }}
            onNotify={showToast}
          />
        )}

        {state === AppState.PERFORMANCE && currentSong && (
          <PerformanceView 
            song={currentSong} 
            theme={theme}
            onClose={() => {
                setSharedSong(null);
                setState(AppState.LIST);
            }}
            onEdit={() => setState(AppState.EDIT)}
            onUpdateTranspose={async (id, tr) => {
                const updated = songs.map(s => s.id === id ? { ...s, transpose: tr } : s);
                setSongs(updated);
                const target = updated.find(s => s.id === id);
                if (target) {
                    await storageService.saveSongLocal(target);
                    handleSync(updated);
                }
            }}
          />
        )}

        {state === AppState.DICTIONARY && <ChordDictionary theme={theme} />}
        {state === AppState.TUNER && <Tuner theme={theme} />}
      </div>

      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[2000] ${theme === 'light' ? 'bg-white text-zinc-800' : 'bg-zinc-800/90 text-white'} backdrop-blur-2xl px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl border ${theme === 'light' ? 'border-zinc-200' : 'border-white/10'} animate-in fade-in slide-in-from-top-4`}>
            {toast}
        </div>
      )}

      {![AppState.AUTH, AppState.EDIT, AppState.PERFORMANCE].includes(state) && (
        <div className={`h-[calc(64px+env(safe-area-inset-bottom))] ${navBgClass} backdrop-blur-2xl border-t flex items-center justify-around pb-[env(safe-area-inset-bottom)] z-[100]`}>
          {[
            { id: AppState.LIST, label: 'Songs', icon: getSongsIcon() },
            { id: AppState.FORUM, label: 'Board', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' },
            { id: AppState.DICTIONARY, label: 'Theory', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
            { id: AppState.TUNER, label: 'Tuner', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setState(tab.id)} className={`flex flex-col items-center gap-1 flex-1 ${state === tab.id ? tabActiveColor : tabInactiveColor}`}>
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
