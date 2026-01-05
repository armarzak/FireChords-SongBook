
import { Song } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';

/**
 * СЮДА ВСТАВЛЯЙТЕ СВОИ ПЕСНИ ДЛЯ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ
 * Скопируйте результат работы функции "Export for Code" и замените этот массив.
 */
const DEFAULT_SONGS: Song[] = [
  {
    id: 'default-1',
    title: 'Hotel California',
    artist: 'Eagles',
    transpose: 0,
    content: `[Intro]\nBm  F#  A  E  G  D  Em  F#\n\n[Verse 1]\nBm                     F#\nOn a dark desert highway, cool wind in my hair\nA                      E\nWarm smell of colitas, rising up through the air`
  }
];

/**
 * URL К ВАШЕМУ ОБЛАЧНОМУ ФАЙЛУ (например, GitHub Gist)
 * Если здесь будет ссылка на JSON, приложение подтянет его в раздел "Community".
 */
const COMMUNITY_SONGS_URL = ''; 

export const storageService = {
  getSongs: (): Song[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  },
  
  getDefaultSongs: (): Song[] => DEFAULT_SONGS,
  
  saveSongs: (songs: Song[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  },

  // Загрузка "облачных" песен (если вы настроите хостинг JSON-файла)
  fetchCommunitySongs: async (): Promise<Song[]> => {
    if (!COMMUNITY_SONGS_URL) return [];
    try {
        const res = await fetch(COMMUNITY_SONGS_URL);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Cloud fetch failed", e);
        return [];
    }
  },

  // Копирует всю текущую библиотеку как готовый код для переменной DEFAULT_SONGS
  copyLibraryAsCode: async () => {
    const songs = storageService.getSongs();
    const code = JSON.stringify(songs, null, 2);
    await navigator.clipboard.writeText(code);
  },

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
  },

  exportDataFile: () => {
    const songs = storageService.getSongs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songs));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = "my_guitar_songbook.json";
    a.click();
  }
};
