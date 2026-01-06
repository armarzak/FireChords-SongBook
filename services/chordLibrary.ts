
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
  // --- C ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Cmaj7': [{ name: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 }],
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'Csus2': [{ name: 'Csus2', strings: ['x', 3, 0, 0, 3, 3], fingers: [null, 1, null, null, 3, 4], position: 1 }],
  'Csus4': [{ name: 'Csus4', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'Dmaj7': [{ name: 'Dmaj7', strings: ['x', 'x', 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], barre: { fret: 1, from: 4, to: 6 }, position: 1 }],
  'Dsus2': [{ name: 'Dsus2', strings: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], position: 1 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'Emaj7': [{ name: 'Emaj7', strings: [0, 2, 1, 1, 0, 0], fingers: [null, 2, 1, 1, null, null], position: 1 }],

  // --- F ---
  'F': [{ name: 'F', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fmaj7': [{ name: 'Fmaj7', strings: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], position: 1 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gm': [{ name: 'Gm', strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }],
  'Gmaj7': [{ name: 'Gmaj7', strings: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], position: 1 }],

  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'Amaj7': [{ name: 'Amaj7', strings: ['x', 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], position: 1 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bmaj7': [{ name: 'Bmaj7', strings: ['x', 2, 4, 3, 4, 2], fingers: [null, 1, 3, 2, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const normalized = normalizeName(chordName);
  
  // 1. Точное совпадение (Cmaj7, G6sus2 и т.д.)
  if (chordLibrary[normalized]) return chordLibrary[normalized];

  // 2. Поиск по сложным типам (maj7, sus2), чтобы не свалиться в минор по ошибке
  const types = ['maj7', 'maj9', 'sus2', 'sus4', 'add9', '6sus2', '7'];
  for (const t of types) {
    if (normalized.includes(t)) {
      const root = normalized.split(t)[0];
      if (chordLibrary[root + t]) return chordLibrary[root + t];
    }
  }

  // 3. Базовый минор (только если в имени есть 'm' НЕ как часть 'maj')
  if (normalized.includes('m') && !normalized.includes('maj')) {
    const root = normalized.split('m')[0];
    if (chordLibrary[root + 'm']) return chordLibrary[root + 'm'];
  }

  // 4. Чистая тоника (мажор)
  const rootMatch = normalized.match(/^[A-G][#b]?/);
  if (rootMatch && chordLibrary[rootMatch[0]]) return chordLibrary[rootMatch[0]];

  return [];
};
