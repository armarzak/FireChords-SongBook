
import { Song, User } from '../types';
import { Dexie, type Table } from 'dexie';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nakmccxvygrotpdaplwh.supabase.co';
const FALLBACK_KEY = 'sb_publishable__P0cMXcqbjZWKMJB8g_TcA_ltI3Qgm_';
const SUPABASE_KEY = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : FALLBACK_KEY; 

let supabase: SupabaseClient | null = null;
try {
  if (SUPABASE_KEY && SUPABASE_KEY.length > 10) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.error("Supabase Init error:", e);
}

export interface SongbookDatabase extends Dexie {
  songs: Table<Song>;
}

const dexieInstance = new Dexie('GuitarSongbookDB_v3');
dexieInstance.version(1).stores({
  songs: 'id, title, artist, authorId, is_public'
});

export const db = dexieInstance as SongbookDatabase;

const USER_KEY = 'guitar_songbook_user';

const mapFromDb = (s: any): Song => ({
  id: s.id,
  title: s.title,
  artist: s.artist,
  content: s.content,
  transpose: s.transpose || 0,
  authorName: s.author_name || 'Anonymous',
  authorId: s.user_id,
  createdAt: s.created_at,
  is_public: s.is_public
});

const mapToDb = (s: Song, userId: string) => ({
  id: s.id,
  user_id: userId,
  title: s.title || 'Untitled',
  artist: s.artist || 'Unknown',
  content: s.content || '',
  transpose: s.transpose || 0,
  author_name: s.authorName || 'Anonymous',
  is_public: !!s.is_public,
  updated_at: new Date().toISOString()
});

export const storageService = {
  isCloudEnabled: () => !!supabase,

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
    if (!supabase) return { success: false, error: 'No connection' };
    try {
      const payload = songs.map(s => mapToDb(s, user.id));
      const { error } = await supabase.from('songs').upsert(payload);
      if (error) {
        console.error("Cloud Sync Error:", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      console.error("Cloud Sync Exception:", e);
      return { success: false, error: e.message };
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase.from('songs').select('*').eq('user_id', user.id);
      if (error) return null;
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
      if (error) {
        console.error("Forum fetch error:", error);
        return [];
      }
      return data ? data.map(mapFromDb) : [];
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    if (!supabase) return false;
    try {
      // Гарантируем, что песня публичная и имеет автора
      const publishedSong = { 
        ...song, 
        is_public: true, 
        authorName: user.stageName,
        authorId: user.id 
      };
      const payload = mapToDb(publishedSong, user.id);
      
      const { error } = await supabase.from('songs').upsert(payload);
      
      if (error) {
        console.error("Board Publish Error:", error);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Board Publish Exception:", e);
      return false;
    }
  },

  copyLibraryAsCode: async () => {
    const songs = await storageService.getSongsLocal();
    await navigator.clipboard.writeText(JSON.stringify(songs, null, 2));
    return true;
  }
};
