
import { Song } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';
/** 
 * НОВЫЙ ID хранилища npoint.io. 
 * Если база будет переполнена, создайте новый бин на npoint.io и замените этот ID.
 */
const CLOUD_BIN_ID = 'f7478d103b41846b0a70'; 
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

  // Загрузка песен из облака (Форум)
  fetchForumSongs: async (): Promise<Song[]> => {
    try {
      const response = await fetch(CLOUD_BIN_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache'
      });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("Cloud Fetch Error:", e);
      return [];
    }
  },

  // Публикация на форум
  publishToForum: async (song: Song): Promise<boolean> => {
    try {
      // 1. Получаем текущее состояние базы
      let currentForum: Song[] = [];
      try {
        const getRes = await fetch(CLOUD_BIN_URL);
        if (getRes.ok) {
          const data = await getRes.json();
          currentForum = Array.isArray(data) ? data : [];
        }
      } catch (e) {
        console.warn("Could not fetch forum, might be empty");
      }

      // 2. Проверяем дубликат
      const isDuplicate = currentForum.some(s => 
        s.title.toLowerCase().trim() === song.title.toLowerCase().trim() && 
        s.artist.toLowerCase().trim() === song.artist.toLowerCase().trim()
      );
      if (isDuplicate) return true;

      // 3. Формируем запись
      const newEntry = {
        id: 'c-' + Date.now() + Math.random().toString(36).substr(2, 4),
        title: song.title.trim(),
        artist: song.artist.trim() || 'Anonymous',
        content: song.content,
        transpose: 0,
        publishDate: new Date().toISOString(),
        likes: Math.floor(Math.random() * 5) // Немного начальных лайков для красоты
      };

      const updatedForum = [newEntry, ...currentForum].slice(0, 50);

      // 4. Отправляем ПОЛНЫЙ список (npoint заменяет содержимое бина при POST/PUT)
      const response = await fetch(CLOUD_BIN_URL, {
        method: 'POST', // npoint использует POST для обновления по ID
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedForum)
      });

      return response.ok;
    } catch (e) {
      console.error("Critical Publish Error:", e);
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
