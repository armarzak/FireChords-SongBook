
import { Song, User } from '../types';
import { Dexie, type Table } from 'dexie';

// Определяем SQL-подобную схему базы данных
// Using named import for Dexie class to resolve type inheritance issues
export class SongbookDatabase extends Dexie {
  songs!: Table<Song>;
  settings!: Table<{ key: string, value: any }>;

  constructor() {
    super('GuitarSongbookDB');
    // Ensure version() is called on the database instance; using named Dexie import fixes inheritance types
    this.version(1).stores({
      songs: '++id, title, artist, authorId', // Индексы для быстрого поиска
      settings: 'key'
    });
  }
}

export const db = new SongbookDatabase();

const USER_KEY = 'guitar_songbook_user';
const FORUM_BIN_ID = 'f7478d103b41846b0a70'; 
const FORUM_URL = `https://api.npoint.io/${FORUM_BIN_ID}`;
const SYNC_BIN_ID = '9875155f969b8236f011'; 
const SYNC_URL = `https://api.npoint.io/${SYNC_BIN_ID}`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const storageService = {
  // --- USER (SQL Settings Table) ---
  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (stageName: string): User => {
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      stageName,
      joinedAt: new Date().toISOString(),
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // --- LOCAL SQL STORAGE (Dexie) ---
  getSongsLocal: async (): Promise<Song[]> => {
    return await db.songs.toArray();
  },

  saveSongLocal: async (song: Song) => {
    return await db.songs.put(song);
  },

  deleteSongLocal: async (id: string) => {
    return await db.songs.delete(id);
  },

  saveSongsBulk: async (songs: Song[]) => {
    return await db.songs.bulkPut(songs);
  },

  // --- DATABASE / CLOUD SYNC ---
  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<boolean> => {
    try {
      const res = await fetch(SYNC_URL);
      let allUsersData: Record<string, Song[]> = {};
      if (res.ok) {
        const data = await res.json();
        allUsersData = data.value || data;
      }
      
      allUsersData[user.id] = songs;

      const saveRes = await fetch(SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Ошибка исправлена: оборачиваем в объект value для корректной работы npoint
        body: JSON.stringify({ value: allUsersData })
      });
      return saveRes.ok;
    } catch (e) {
      console.error("Sync Error:", e);
      return false;
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    try {
      const res = await fetch(SYNC_URL);
      if (!res.ok) return null;
      const data = await res.json();
      const allUsersData = data.value || data;
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
      // Обработка разных форматов ответа npoint
      return Array.isArray(data) ? data : (data.value || []);
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    try {
      // 1. Сначала получаем текущее состояние доски
      const getRes = await fetch(FORUM_URL);
      let currentForum: Song[] = [];
      if (getRes.ok) {
        const data = await getRes.json();
        currentForum = Array.isArray(data) ? data : (data.value || []);
      }

      // 2. Создаем новую запись
      const newEntry: Song = {
        ...song,
        id: 'pub-' + Date.now(),
        authorName: user.stageName,
        authorId: user.id,
        createdAt: new Date().toISOString()
      };

      // 3. Добавляем в начало и ограничиваем 50 записями
      const updatedForum = [newEntry, ...currentForum].slice(0, 50);

      // 4. ОШИБКА ИСПРАВЛЕНА: Публикуем с правильной структурой JSON
      const response = await fetch(FORUM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updatedForum })
      });

      return response.ok;
    } catch (e) {
      console.error("Publishing error:", e);
      return false;
    }
  },

  copyLibraryAsCode: async () => {
    const songs = await storageService.getSongsLocal();
    const json = JSON.stringify(songs, null, 2);
    navigator.clipboard.writeText(json);
  },

  decodePostFromUrl: (data: string): Song | null => {
    try {
      const json = atob(data);
      return JSON.parse(json);
    } catch (e) {
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
