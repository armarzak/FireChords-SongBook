
import { Song } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';
// Это публичный ID для нашего "Форума". В реальном приложении здесь будет URL вашего сервера или Firebase.
// Для теста используем JSON-хранилище, которое позволяет записывать/читать всем.
const CLOUD_BIN_URL = 'https://api.npoint.io/6f7e449c303f7e52b27a'; 

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
      const response = await fetch(CLOUD_BIN_URL);
      if (!response.ok) throw new Error('Failed to fetch forum');
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
      // 1. Сначала получаем текущий список
      const currentForum = await storageService.fetchForumSongs();
      
      // 2. Проверяем, нет ли уже такой песни
      const exists = currentForum.find(s => s.title === song.title && s.artist === song.artist);
      if (exists) return true; // Считаем успехом

      // 3. Добавляем новую
      const updatedForum = [
        { 
          ...song, 
          id: 'cloud-' + Date.now(), 
          publishDate: new Date().toISOString(),
          likes: Math.floor(Math.random() * 5) 
        }, 
        ...currentForum
      ].slice(0, 100); // Ограничим 100 песнями для демо

      // 4. Сохраняем обратно в облако
      const res = await fetch(CLOUD_BIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForum)
      });
      
      return res.ok;
    } catch (e) {
      console.error("Publishing failed:", e);
      return false;
    }
  },

  // Копирование библиотеки в виде кода (для DEFAULT_SONGS)
  copyLibraryAsCode: () => {
    const songs = storageService.getSongs();
    const code = JSON.stringify(songs, null, 2);
    navigator.clipboard.writeText(code).catch(err => {
      console.error('Could not copy text: ', err);
    });
  },

  // Экспорт библиотеки в JSON файл
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
