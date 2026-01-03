
export interface Song {
  id: string;
  title: string;
  artist: string;
  content: string;
  transpose: number;
}

export enum AppState {
  LIST = 'LIST',
  EDIT = 'EDIT',
  PERFORMANCE = 'PERFORMANCE',
  DICTIONARY = 'DICTIONARY'
}

export enum ViewMode {
  SONGS = 'SONGS',
  ARTISTS = 'ARTISTS'
}
