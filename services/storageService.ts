
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

const requestPersistence = async () => {
  if (navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log(`[Storage] Persisted: ${isPersisted}`);
    } catch (e) {}
  }
};
requestPersistence();

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
  // Очищаем объект от undefined полей для Supabase
  const payload: any = {
    id: String(s.id),
    user_id: userId,
    title: String(s.title || 'Untitled').trim(),
    artist: String(s.artist || 'Unknown').trim(),
    content: String(s.content || '').trim(),
    transpose: Number(s.transpose) || 0,
    author_name: String(s.authorName || 'Anonymous'),
    is_public: Boolean(s.is_public),
    updated_at: new Date().toISOString()
  };
  return payload;
};

export const storageService = {
  isCloudEnabled: () => !!supabase,

  getUser: (): User | null => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  saveUser: (stageName: string): User => {
    const existing = storageService.getUser();
    const newUser: User = {
      id: existing?.id || 'u-' + Math.random().toString(36).substr(2, 9),
      stageName: stageName.trim(),
      joinedAt: existing?.joinedAt || new Date().toISOString(),
      avatarColor: existing?.avatarColor || '#3b82f6'
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
    if (songs.length === 0) return;
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
    if (!supabase || !user) return { success: false, error: 'Not initialized' };
    try {
      const payload = songs.map(s => mapToDb(s, user.id));
      const { error } = await supabase.from('songs').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.error("Cloud Sync Error:", error);
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
      if (error) return [];
      return data ? data.map(mapFromDb) : [];
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<{success: boolean, error?: string}> => {
    if (!supabase) return { success: false, error: 'Supabase offline' };
    try {
      // Генерируем ID публикации, если его нет
      const pubId = song.id.startsWith('pub-') ? song.id : `pub-${user.id.slice(-4)}-${Date.now()}`;
      
      const publishedSong: Song = { 
        ...song, 
        id: pubId,
        is_public: true, 
        authorName: user.stageName,
        authorId: user.id 
      };

      const payload = mapToDb(publishedSong, user.id);
      
      // Используем upsert для гибкости
      const { error } = await supabase
        .from('songs')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn("Supabase Board Error:", error);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Connection failed' };
    }
  }
};
