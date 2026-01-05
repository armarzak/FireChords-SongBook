
import { Song, User } from '../types';
import { Dexie, type Table } from 'dexie';
import { createClient } from '@supabase/supabase-js';

// Конфигурация Supabase
const SUPABASE_URL = 'https://ivfeoqfeigdvzezlwfer.supabase.co';
// Используем API_KEY как Anon Key для Supabase, так как в данной среде он предоставляется как единственный ключ доступа
const SUPABASE_KEY = process.env.API_KEY || ''; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Локальная база для офлайн-режима
export class SongbookDatabase extends Dexie {
  songs!: Table<Song>;
  constructor() {
    super('GuitarSongbookDB');
    // Fix: Added @ts-ignore to address the "Property 'version' does not exist" error which can occur in some TS/ESM environments with Dexie inheritance.
    // @ts-ignore
    this.version(2).stores({
      songs: '++id, title, artist, authorId, is_public'
    });
  }
}
export const db = new SongbookDatabase();

const USER_KEY = 'guitar_songbook_user';
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const storageService = {
  // --- USER ---
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

  // --- LOCAL CACHE ---
  getSongsLocal: async (): Promise<Song[]> => {
    return await db.songs.toArray();
  },

  saveSongLocal: async (song: Song) => {
    return await db.songs.put(song);
  },

  // Fix: Added missing saveSongsBulk method required by App.tsx
  saveSongsBulk: async (songs: Song[]) => {
    return await db.songs.bulkPut(songs);
  },

  // Fix: Added missing deleteSongLocal method required by App.tsx
  deleteSongLocal: async (id: string) => {
    return await db.songs.delete(id);
  },

  // --- SUPABASE CLOUD ---
  syncLibraryWithCloud: async (songs: Song[], user: User): Promise<boolean> => {
    try {
      const formattedSongs = songs.map(s => ({
        id: s.id,
        user_id: user.id,
        title: s.title,
        artist: s.artist,
        content: s.content,
        transpose: s.transpose,
        capo: s.capo,
        tuning: s.tuning,
        author_name: user.stageName,
        is_public: s.likes !== undefined ? true : false // Используем временный костыль или отдельное поле
      }));

      const { error } = await supabase
        .from('songs')
        .upsert(formattedSongs);

      return !error;
    } catch (e) {
      console.error("Supabase Sync Error:", e);
      return false;
    }
  },

  restoreLibraryFromCloud: async (user: User): Promise<Song[] | null> => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) return null;
      return data.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        content: s.content,
        transpose: s.transpose,
        capo: s.capo,
        tuning: s.tuning,
        authorName: s.author_name,
        authorId: s.user_id
      }));
    } catch (e) {
      return null;
    }
  },

  // --- THE BOARD (Supabase Realtime Board) ---
  fetchForumSongs: async (): Promise<Song[]> => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) return [];
      return data.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        content: s.content,
        transpose: s.transpose,
        capo: s.capo,
        tuning: s.tuning,
        authorName: s.author_name,
        authorId: s.user_id,
        createdAt: s.created_at
      }));
    } catch (e) {
      return [];
    }
  },

  publishToForum: async (song: Song, user: User): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('songs')
        .upsert({
          id: song.id,
          user_id: user.id,
          title: song.title,
          artist: song.artist,
          content: song.content,
          transpose: song.transpose,
          capo: song.capo,
          tuning: song.tuning,
          author_name: user.stageName,
          is_public: true
        });
      
      return !error;
    } catch (e) {
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
