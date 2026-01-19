
import { Song, User } from '../types';
import Dexie, { type Table } from 'dexie';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nakmccxvygrotpdaplwh.supabase.co';
const FALLBACK_KEY = 'sb_publishable__P0cMXcqbjZWKMJB8g_TcA_ltI3Qgm_';
const SUPABASE_KEY = (typeof process !== 'undefined' && process.env?.API_KEY) ? process.env.API_KEY : FALLBACK_KEY; 

let supabase: SupabaseClient | null = null;
try {
  if (SUPABASE_KEY && SUPABASE_KEY.length > 10) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
  }
} catch (e) {
  console.error("Supabase Init error:", e);
}

export type SongbookDatabase = Dexie & {
  songs: Table<Song>;
};

const db = new Dexie('GuitarSongbookDB_v4') as SongbookDatabase;
db.version(1).stores({
  songs: 'id, title, artist, authorId, is_public'
});

const ensureDbOpen = async () => {
  if (!db.isOpen) {
    try {
      await db.open();
    } catch (err) {
      console.error("Failed to open dexie db:", err);
    }
  }
};

const USER_KEY = 'guitar_songbook_user';

const mapFromDb = (s: any): Song => ({
  id: String(s.id),
  title: s.title || 'Untitled',
  artist: s.artist || 'Unknown',
  content: s.content || '',
  transpose: Number(s.transpose) || 0,
  authorName: s.author_name || 'Anonymous',
  authorId: s.user_id,
  createdAt: s.created_at,
  is_public: Boolean(s.is_public)
});

const mapToDb = (s: Song, userId: string) => {
  return {
    id: String(s.id),
    user_id: String(userId),
    title: String(s.title || 'Untitled').trim(),
    artist: String(s.artist || 'Unknown').trim(),
    content: String(s.content || '').trim(),
    transpose: Number(s.transpose) || 0,
    author_name: String(s.authorName || 'Anonymous'),
    is_public: Boolean(s.is_public)
  };
};

export const storageService = {
  isCloudEnabled: () => !!supabase,

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
  },

  saveUser: (stageName: string): User => {
    const existing = storageService.getUser();
    const newUser: User = {
      id: existing?.id || 'u-' + Math.random().toString(36).substr(2, 9),
      stageName: stageName.trim() || 'Guitarist',
      joinedAt: existing?.joinedAt || new Date().toISOString(),
      avatarColor: existing?.avatarColor || '#3b82f6'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  getSongsLocal: async (): Promise<Song[]> => {
    await ensureDbOpen();
    return await db.songs.toArray();
  },

  saveSongLocal: async (song: Song) => {
    await ensureDbOpen();
    const cleanSong = { ...song };
    return await db.songs.put(cleanSong);
  },

  saveSongsBulk: async (songs: Song[]) => {
    if (songs.length === 0) return;
    await ensureDbOpen();
    return await db.songs.bulkPut(songs);
  },

  deleteSongLocal: async (id: string) => {
    await ensureDbOpen();
    await db.songs.delete(id);
    const user = storageService.getUser();
    if (supabase && user) {
        await supabase.from('songs').delete().eq('id', id).eq('user_id', user.id);
    }
  },

  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<{success: boolean, error?: string}> => {
    if (!supabase || !user) return { success: false, error: 'Storage Not Init' };
    try {
      const privateSongs = songs.filter(s => !s.is_public);
      if (privateSongs.length === 0) return { success: true };

      const payload = privateSongs.map(s => mapToDb(s, user.id));
      const { error } = await supabase.from('songs').upsert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    if (!supabase || !user) return null;
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_public', false);
        
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
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) return [];
      return data ? data.map(mapFromDb) : [];
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<{success: boolean, error?: string}> => {
    if (!supabase || !user) return { success: false, error: 'Supabase offline' };
    try {
      const pubId = song.id.startsWith('pub-') ? song.id : `pub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const payload = {
        id: pubId,
        user_id: String(user.id), 
        title: (song.title || 'Untitled').trim(),
        artist: (song.artist || 'Unknown').trim(),
        content: (song.content || '').trim(),
        transpose: Number(song.transpose) || 0,
        author_name: (user.stageName || 'Anonymous').trim(),
        is_public: true
      };
      const { error } = await supabase.from('songs').upsert(payload);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  deleteFromForum: async (id: string, user: User): Promise<{success: boolean, error?: string}> => {
    if (!supabase || !user) return { success: false, error: 'Not authorized' };
    try {
      const { error, status } = await supabase
        .from('songs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('is_public', true);
      
      // Supabase delete might return 204 even if no rows were deleted if filters match nothing, 
      // but here we trust our internal ID logic.
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
};
