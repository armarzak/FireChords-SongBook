
export interface Song {
  id: string;
  title: string;
  artist: string;
  content: string;
  transpose: number;
  authorId?: string;
  publishDate?: string;
  likes?: number;
}

export enum AppState {
  LIST = 'LIST',
  EDIT = 'EDIT',
  PERFORMANCE = 'PERFORMANCE',
  DICTIONARY = 'DICTIONARY',
  TUNER = 'TUNER',
  FORUM = 'FORUM'
}

export enum ViewMode {
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS'
}
