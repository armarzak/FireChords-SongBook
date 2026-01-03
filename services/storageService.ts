
import { Song } from '../types';

const STORAGE_KEY = 'guitar_songbook_songs';

export const storageService = {
  getSongs: (): Song[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSongs: (songs: Song[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
  },
  exportData: () => {
    const songs = storageService.getSongs();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(songs));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "songbook_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },
  importData: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const songs = JSON.parse(e.target?.result as string);
          storageService.saveSongs(songs);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }
};
