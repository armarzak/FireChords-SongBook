
import { Song, User } from '../types';
import Dexie, { type Table } from 'dexie';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Конфигурация
const SUPABASE_URL = 'https://ivfeoqfeigdvzezlwfer.supabase.co';
// ПРЕДУПРЕЖДЕНИЕ: process.env.API_KEY должен быть установлен в настройках Vercel как ваш Supabase Anon Key
const SUPABASE_KEY = process.env.API_KEY || ''; 

let supabase: SupabaseClient | null = null;
try {
  if (SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error("Supabase init failed", e);
}

// SQL-подобная локальная БД (Offline First)
class SongbookDatabase extends Dexie {
  songs!: Table<Song>;
  constructor() {
    super('GuitarSongbookDB_v3');
  }
}

// Инициализация базы данных
export const db = new SongbookDatabase();

// Fix: Moved version definition outside constructor to resolve "Property 'version' does not exist on type 'SongbookDatabase'" error
db.version(1).stores({
  songs: 'id, title, artist, authorId, is_public'
});

const USER_KEY = 'guitar_songbook_user';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Маппинг данных (Postgres -> Frontend)
const mapFromDb = (s: any): Song => ({
  id: s.id,
  title: s.title,
  artist: s.artist,
  content: s.content,
  transpose: s.transpose || 0,
  capo: s.capo || 0,
  tuning: s.tuning || 'Standard',
  authorName: s.author_name,
  authorId: s.user_id,
  createdAt: s.created_at
});

// Маппинг данных (Frontend -> Postgres)
const mapToDb = (s: Song, userId: string) => ({
  id: s.id,
  user_id: userId,
  title: s.title,
  artist: s.artist,
  content: s.content,
  transpose: s.transpose,
  capo: s.capo,
  tuning: s.tuning,
  author_name: s.authorName || 'Anonymous',
  is_public: s.likes !== undefined || s.id.startsWith('pub-') ? true : false
});

export const storageService = {
  isCloudEnabled: () => !!supabase && !!SUPABASE_KEY,

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

  getSongsLocal: async (): Promise<Song[]> => {
    return await db.songs.toArray();
  },

  saveSongLocal: async (song: Song) => {
    return await db.songs.put(song);
  },

  saveSongsBulk: async (songs: Song[]) => {
    return await db.songs.bulkPut(songs);
  },

  deleteSongLocal: async (id: string) => {
    await db.songs.delete(id);
    const user = storageService.getUser();
    if (supabase && user) {
        await supabase.from('songs').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const payload = songs.map(s => mapToDb(s, user.id));
      const { error } = await supabase.from('songs').upsert(payload);
      return !error;
    } catch (e) {
      return false;
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id);
      
      if (error || !data) return null;
      return data.map(mapFromDb);
    } catch (e) {
      return null;
    }
  },

  fetchForumSongs: async (): Promise<Song[]> => {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error || !data) return [];
      return data.map(mapFromDb);
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    if (!supabase) return false;
    try {
      const payload = { ...mapToDb(song, user.id), is_public: true };
      const { error } = await supabase.from('songs').upsert(payload);
      return !error;
    } catch (e) {
      return false;
    }
  },

  copyLibraryAsCode: async () => {
    const songs = await storageService.getSongsLocal();
    const json = JSON.stringify(songs, null, 2);
    try {
        await navigator.clipboard.writeText(json);
        return true;
    } catch (e) {
        return false;
    }
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
