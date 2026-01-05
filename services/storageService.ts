
import { Song, User } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';
const USER_KEY = 'guitar_songbook_user';
const CLOUD_BIN_ID = 'f7478d103b41846b0a70'; 
const CLOUD_BIN_URL = `https://api.npoint.io/${CLOUD_BIN_ID}`; 

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const storageService = {
  // User Profile
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (stageName: string): User => {
    const existing = storageService.getUser();
    if (existing) return existing;

    const newUser: User = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      stageName,
      joinedAt: new Date().toISOString(),
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Songs
  getSongs: (): Song[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  },
  
  saveSongs: (songs: Song[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  },

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

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    try {
      // 1. Получаем текущее состояние доски
      let currentForum: Song[] = [];
      try {
        const getRes = await fetch(CLOUD_BIN_URL);
        if (getRes.ok) {
          const data = await getRes.json();
          currentForum = Array.isArray(data) ? data : [];
        }
      } catch (e) {
        console.warn("Could not fetch existing forum, starting fresh", e);
      }

      // 2. Создаем чистую запись без лишних полей
      const newEntry: Song = {
        id: 'cp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        title: song.title.trim(),
        artist: song.artist.trim() || 'Various Artists',
        content: song.content,
        capo: song.capo || 0,
        tuning: song.tuning || 'Standard',
        transpose: 0,
        authorName: user.stageName,
        authorId: user.id,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      // 3. Добавляем в начало и ограничиваем список (например, 50 последних)
      const updatedForum = [newEntry, ...currentForum].slice(0, 50);

      // 4. Отправляем обновленный список на сервер
      const response = await fetch(CLOUD_BIN_URL, {
        method: 'POST', // npoint.io использует POST для обновления содержимого бина по его ID
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedForum)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Server responded with error:", response.status, errText);
        return false;
      }

      return true;
    } catch (e) {
      console.error("Critical Publish Error:", e);
      return false;
    }
  },

  generateShareLink: (song: Song): string => {
    const data = JSON.stringify({
      t: song.title,
      a: song.artist,
      c: song.content,
      cp: song.capo || 0,
      tu: song.tuning || 'Standard',
      au: song.authorName || 'Anonymous'
    });
    const encoded = btoa(unescape(encodeURIComponent(data)));
    return `${window.location.origin}${window.location.pathname}?post=${encoded}`;
  },

  decodePostFromUrl: (base64: string): Song | null => {
    try {
      const json = decodeURIComponent(escape(atob(base64)));
      const d = JSON.parse(json);
      return {
        id: 'shared-' + Date.now(),
        title: d.t,
        artist: d.a,
        content: d.c,
        capo: d.cp,
        tuning: d.tu,
        authorName: d.au,
        transpose: 0
      };
    } catch (e) {
      return null;
    }
  },

  getDefaultSongs: (): Song[] => [
    {
      id: 'default-1',
      title: 'Imagine',
      artist: 'John Lennon',
      transpose: 0,
      content: `[Intro]\nC  Cmaj7  F\n\n[Verse]\nC            Cmaj7    F\nImagine there's no heaven\nC            Cmaj7    F\nIt's easy if you try`,
      capo: 0,
      tuning: 'Standard',
      authorName: 'System'
    }
  ],

  copyLibraryAsCode: () => {
    const songs = storageService.getSongs();
    const data = JSON.stringify(songs, null, 2);
    navigator.clipboard.writeText(data).catch(err => console.error(err));
  },

  exportDataFile: () => {
    const songs = storageService.getSongs();
    const data = JSON.stringify(songs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `songbook-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
