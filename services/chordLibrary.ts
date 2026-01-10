
export interface ChordFingering {
  name: string;
  strings: (number | 'x')[]; 
  fingers: (number | null)[]; 
  barre?: { fret: number; from: number; to: number };
  position: number; 
}

const normalizeName = (name: string): string => {
  if (!name) return name;
  let res = name.replace(/\s+/g, '');
  const map: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
  };
  const rootMatch = res.match(/^[A-G][#b]?/);
  if (!rootMatch) return res;
  const root = rootMatch[0];
  const suffix = res.slice(root.length);
  const normalizedRoot = map[root] || root;
  return normalizedRoot + suffix;
};

export const chordLibrary: Record<string, ChordFingering[]> = {
  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A7': [{ name: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], position: 1 }],
  'Am7': [{ name: 'Am7', strings: ['x', 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], position: 1 }],
  'Amaj7': [{ name: 'Amaj7', strings: ['x', 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], position: 1 }],
  'Asus4': [{ name: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'A7sus4': [{ name: 'A7sus4', strings: ['x', 0, 2, 0, 3, 0], fingers: [null, null, 1, null, 3, null], position: 1 }],
  'A9': [{ name: 'A9', strings: ['x', 0, 2, 4, 2, 3], fingers: [null, null, 1, 3, 1, 2], position: 1 }],
  'Am6': [{ name: 'Am6', strings: ['x', 0, 2, 2, 1, 2], fingers: [null, null, 2, 3, 1, 4], position: 1 }],
  'Ammaj7': [{ name: 'Ammaj7', strings: ['x', 0, 2, 1, 1, 0], fingers: [null, null, 2, 1, 1, null], position: 1 }],
  'Adim': [{ name: 'Adim', strings: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], position: 1 }],
  'Adim7': [{ name: 'Adim7', strings: ['x', 'x', 4, 5, 4, 5], fingers: [null, null, 1, 3, 2, 4], position: 4 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'B7': [{ name: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],
  'B9': [{ name: 'B9', strings: ['x', 2, 1, 2, 2, 2], fingers: [null, 2, 1, 3, 3, 3], barre: { fret: 2, from: 4, to: 6 }, position: 1 }],
  'Bb': [{ name: 'Bb', strings: ['x', 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'Bb7': [{ name: 'Bb7', strings: ['x', 1, 3, 1, 3, 1], fingers: [null, 1, 3, 1, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],

  // --- C ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'C9': [{ name: 'C9', strings: ['x', 3, 2, 3, 3, 3], fingers: [null, 2, 1, 3, 3, 3], barre: { fret: 3, from: 4, to: 6 }, position: 1 }],
  'C5': [{ name: 'C5', strings: ['x', 3, 5, 5, 'x', 'x'], fingers: [null, 1, 3, 4, null, null], position: 3 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D7': [{ name: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],
  'D9': [{ name: 'D9', strings: ['x', 5, 4, 5, 5, 5], fingers: [null, 2, 1, 3, 3, 3], barre: { fret: 1, from: 4, to: 6 }, position: 5 }],
  'Daug': [{ name: 'Daug', strings: ['x', 'x', 0, 3, 3, 2], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D5': [{ name: 'D5', strings: ['x', 5, 7, 7, 'x', 'x'], fingers: [null, 1, 3, 4, null, null], position: 5 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'E7': [{ name: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],
  'E7#9': [{ name: 'E7#9', strings: [0, 7, 6, 7, 8, 'x'], fingers: [null, 2, 1, 3, 4, null], position: 6 }],
  'E11': [{ name: 'E11', strings: [0, 0, 0, 1, 0, 0], fingers: [null, null, null, 1, null, null], position: 1 }],

  // --- F ---
  'F': [{ name: 'F', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fm': [{ name: 'Fm', strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fmaj7': [{ name: 'Fmaj7', strings: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], position: 1 }],
  'F9': [{ name: 'F9', strings: [1, 3, 1, 2, 1, 3], fingers: [1, 3, 1, 2, 1, 4], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gm': [{ name: 'Gm', strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }],
  'G7': [{ name: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],
  'G6': [{ name: 'G6', strings: [3, 2, 0, 0, 0, 0], fingers: [3, 2, null, null, null, null], position: 1 }],
  'Gsus4': [{ name: 'Gsus4', strings: [3, 'x', 0, 0, 1, 3], fingers: [2, null, null, null, 1, 3], position: 3 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  if (!chordName) return [];
  const normalized = normalizeName(chordName);
  
  // Сначала ищем точное совпадение в библиотеке пресетов
  if (chordLibrary[normalized]) return chordLibrary[normalized];

  const rootMatch = normalized.match(/^[A-G][#b]?/);
  if (!rootMatch) return [];
  const root = rootMatch[0];
  const suffix = normalized.slice(root.length);

  // Список поддерживаемых суффиксов для автоматического маппинга
  const supported = ['m', '7', 'maj7', 'm7', 'sus2', 'sus4', '7sus4', 'add9', '6', 'add11', '6sus2', '9', '6', 'maj7', '5', 'aug', 'dim', 'dim7'];
  for (const s of supported) {
    if (suffix === s && chordLibrary[root + s]) return chordLibrary[root + s];
  }
  
  if (chordLibrary[root]) return chordLibrary[root];
  return [];
};
