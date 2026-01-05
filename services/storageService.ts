
import { Song, User } from '../types';
// Import Dexie as a named export to ensure class methods like 'version' are correctly recognized by TypeScript
import { Dexie, type Table } from 'dexie';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Используем ваши актуальные данные
const SUPABASE_URL = 'https://nakmccxvygrotpdaplwh.supabase.co';
// API key must be obtained exclusively from the environment variable process.env.API_KEY
const SUPABASE_KEY = process.env.API_KEY || ''; 

let supabase: SupabaseClient | null = null;
try {
  if (SUPABASE_KEY && SUPABASE_KEY.length > 10) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("📡 Supabase: Connection initialized to " + SUPABASE_URL);
  }
} catch (e) {
  console.error("❌ Supabase: Client init failed:", e);
}

class SongbookDatabase extends Dexie {
  songs!: Table<Song>;
  constructor() {
    super('GuitarSongbookDB_v3');
    // Defining database schema. 'version' is a method inherited from Dexie.
    this.version(1).stores({
      songs: 'id, title, artist, authorId, is_public'
    });
  }
}

export const db = new SongbookDatabase();
const USER_KEY = 'guitar_songbook_user';

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
  createdAt: s.created_at,
  is_public: s.is_public
});

const mapToDb = (s: Song, userId: string) => ({
  id: s.id,
  user_id: userId,
  title: s.title,
  artist: s.artist,
  content: s.content,
  transpose: s.transpose || 0,
  capo: s.capo || 0,
  tuning: s.tuning || 'Standard',
  author_name: s.authorName || 'Anonymous',
  is_public: !!s.is_public
});

export const storageService = {
  isCloudEnabled: () => !!supabase && SUPABASE_KEY.length > 0,

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (stageName: string): User => {
    const newUser: User = {
      id: 'u-' + Math.random().toString(36).substr(2, 9),
      stageName,
      joinedAt: new Date().toISOString(),
      avatarColor: '#3b82f6'
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

  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<{success: boolean, error?: string}> => {
    if (!supabase) return { success: false, error: 'No client' };
    try {
      const payload = songs.map(s => mapToDb(s, user.id));
      const { error } = await supabase.from('songs').upsert(payload);
      if (error) {
          console.error("❌ Sync Error:", error.message, error.details);
          return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
          console.error("❌ Restore Error:", error.message);
          return null;
      }
      return data ? data.map(mapFromDb) : [];
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
        .order('created_at', { ascending: false });
      
      if (error) return [];
      return data ? data.map(mapFromDb) : [];
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
    await navigator.clipboard.writeText(JSON.stringify(songs, null, 2));
    return true;
  },

  decodePostFromUrl: (data: string): Song | null => {
    try {
      return JSON.parse(atob(data));
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
