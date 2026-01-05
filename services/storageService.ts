
import { Song, User } from '../types';

const LOCAL_STORAGE_KEY = 'guitar_songbook_songs';
const USER_KEY = 'guitar_songbook_user';

// Публичный бин для "Глобальной доски" (все видят всех)
const FORUM_BIN_ID = 'f7478d103b41846b0a70'; 
const FORUM_URL = `https://api.npoint.io/${FORUM_BIN_ID}`;

// Бин для синхронизации личных библиотек (упрощенная имитация БД)
// В реальном приложении здесь был бы эндпоинт типа /api/songs?userId=...
const SYNC_BIN_ID = '9875155f969b8236f011'; 
const SYNC_URL = `https://api.npoint.io/${SYNC_BIN_ID}`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const storageService = {
  // --- USER ---
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (stageName: string): User => {
    const existing = storageService.getUser();
    if (existing) return existing;
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      stageName,
      joinedAt: new Date().toISOString(),
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // --- LOCAL STORAGE ---
  getSongsLocal: (): Song[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveSongsLocal: (songs: Song[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(songs));
  },

  // --- DATABASE / CLOUD SYNC ---
  // Синхронизирует локальную библиотеку с облачным хранилищем
  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<boolean> => {
    try {
      // Получаем все данные из облака
      const res = await fetch(SYNC_URL);
      let allUsersData: Record<string, Song[]> = {};
      if (res.ok) {
        allUsersData = await res.json();
      }
      
      // Обновляем данные текущего пользователя
      allUsersData[user.id] = songs;

      // Сохраняем обратно
      const saveRes = await fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allUsersData)
      });
      return saveRes.ok;
    } catch (e) {
      console.error("Sync Error:", e);
      return false;
    }
  },

  // Пытается восстановить библиотеку из облака (например, после переустановки)
  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    try {
      const res = await fetch(SYNC_URL);
      if (!res.ok) return null;
      const allUsersData = await res.json();
      return allUsersData[user.id] || [];
    } catch (e) {
      return null;
    }
  },

  // --- GLOBAL BOARD (FORUM) ---
  fetchForumSongs: async (): Promise<Song[]> => {
    try {
      const response = await fetch(FORUM_URL, { cache: 'no-cache' });
      if (!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data) ? data : (data.value || []);
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    try {
      const getRes = await fetch(FORUM_URL);
      let currentForum: Song[] = [];
      if (getRes.ok) {
        const data = await getRes.json();
        currentForum = Array.isArray(data) ? data : (data.value || []);
      }

      const newEntry: Song = {
        ...song,
        id: 'pub-' + Date.now(),
        authorName: user.stageName,
        authorId: user.id,
        createdAt: new Date().toISOString()
      };

      const updatedForum = [newEntry, ...currentForum].slice(0, 50);

      const response = await fetch(FORUM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForum)
      });

      return response.ok;
    } catch (e) {
      return false;
    }
  },

  // Fix for error: Property 'copyLibraryAsCode' does not exist on storageService
  copyLibraryAsCode: () => {
    const songs = storageService.getSongsLocal();
    const json = JSON.stringify(songs, null, 2);
    navigator.clipboard.writeText(json).catch(err => {
      console.error('Could not copy text: ', err);
    });
  },

  // Fix for error: Property 'decodePostFromUrl' does not exist on storageService
  decodePostFromUrl: (data: string): Song | null => {
    try {
      const json = atob(data);
      return JSON.parse(json);
    } catch (e) {
      console.error('Error decoding post from URL', e);
      return null;
    }
  },

  getDefaultSongs: (): Song[] => [
    {
      id: 'def-1',
      title: 'Imagine',
      artist: 'John Lennon',
      transpose: 0,
      content: `[Intro]\nC  Cmaj7  F\n\n[Verse]\nC            Cmaj7    F\nImagine there's no heaven\nC            Cmaj7    F\nIt's easy if you try`,
      capo: 0,
      tuning: 'Standard',
      authorName: 'System'
    }
  ]
};
