
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
  capo?: number;
  tuning?: string;
  createdAt?: string;
  likes?: number;
}

export enum AppState {
  LIST = 'LIST',
  EDIT = 'EDIT',
  PERFORMANCE = 'PERFORMANCE',
  DICTIONARY = 'DICTIONARY',
  TUNER = 'TUNER',
  FORUM = 'FORUM',
  AUTH = 'AUTH',
  PROFILE = 'PROFILE'
}

export enum ViewMode {
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS'
}
