
import { Song } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';
/** 
 * ВАЖНО: Мы используем npoint.io для хранения общего списка.
 * Если этот ID перестанет работать, нужно создать новый бин на npoint.io 
 * и вставить новый ID сюда.
 */
const CLOUD_BIN_ID = '6f7e449c303f7e52b27a';
const CLOUD_BIN_URL = `https://api.npoint.io/${CLOUD_BIN_ID}`; 

export const storageService = {
  getSongs: (): Song[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  },
  
  saveSongs: (songs: Song[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  },

  // Загрузка песен со всего мира (Форум)
  fetchForumSongs: async (): Promise<Song[]> => {
    try {
      const response = await fetch(CLOUD_BIN_URL, {
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        if (response.status === 404) return [];
        throw new Error('Server returned error');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Cloud Error:", e);
      return [];
    }
  },

  // Публикация песни на форум
  publishToForum: async (song: Song): Promise<boolean> => {
    try {
      // 1. Сначала получаем текущий список для слияния
      let currentForum: Song[] = [];
      try {
        const fetchRes = await fetch(CLOUD_BIN_URL);
        if (fetchRes.ok) {
          currentForum = await fetchRes.json();
        }
      } catch (err) {
        console.warn("Could not fetch current forum, starting fresh", err);
      }
      
      if (!Array.isArray(currentForum)) currentForum = [];

      // 2. Проверяем дубликаты
      const exists = currentForum.find(s => 
        s.title.toLowerCase() === song.title.toLowerCase() && 
        s.artist.toLowerCase() === song.artist.toLowerCase()
      );
      if (exists) return true; 

      // 3. Добавляем новую в начало
      const newSong = { 
        ...song, 
        id: 'cloud-' + Date.now(), 
        publishDate: new Date().toISOString(),
        likes: 0 
      };
      
      const updatedForum = [newSong, ...currentForum].slice(0, 50); // Лимит 50 песен для стабильности

      // 4. Сохраняем (npoint ожидает POST или PUT для обновления)
      const res = await fetch(CLOUD_BIN_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedForum)
      });
      
      return res.ok;
    } catch (e) {
      console.error("Publishing failed deep:", e);
      return false;
    }
  },

  copyLibraryAsCode: () => {
    const songs = storageService.getSongs();
    const code = JSON.stringify(songs, null, 2);
    navigator.clipboard.writeText(code).catch(err => {
      console.error('Could not copy text: ', err);
    });
  },

  exportDataFile: () => {
    const songs = storageService.getSongs();
    const dataStr = JSON.stringify(songs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `songbook_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  getDefaultSongs: (): Song[] => [
    {
      id: 'default-1',
      title: 'Hotel California',
      artist: 'Eagles',
      transpose: 0,
      content: `[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                     F#\nOn a dark desert highway, cool wind in my hair\nA                      E\nWarm smell of colitas, rising up through the air`
    }
  ],

  encodeSongForUrl: (song: Song): string => {
    const data = JSON.stringify({ t: song.title, a: song.artist, c: song.content });
    return btoa(unescape(encodeURIComponent(data)));
  },

  decodeSongFromUrl: (base64: string): Partial<Song> | null => {
    try {
        const json = decodeURIComponent(escape(atob(base64)));
        const data = JSON.parse(json);
        return {
            title: data.t, artist: data.a, content: data.c,
            id: 'shared-' + Date.now(), transpose: 0
        };
    } catch (e) {
        return null;
    }
  }
};
