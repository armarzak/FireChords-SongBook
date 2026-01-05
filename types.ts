
export interface User {
  id: string;
  stageName: string;
  joinedAt: string;
  avatarColor: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  content: string;
  transpose: number;
  authorName?: string;
  authorId?: string;
  createdAt?: string;
  likes?: number;
  is_public?: boolean;
}

export enum AppState {
  LIST = 'LIST',
  EDIT = 'EDIT',
  PERFORMANCE = 'PERFORMANCE',
  DICTIONARY = 'DICTIONARY',
  TUNER = 'TUNER',
  FORUM = 'FORUM',
  AUTH = 'AUTH',
  EXPLORER = 'EXPLORER' // Новая вкладка для интерактивного грифа
}

export enum ViewMode {
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS'
}
