
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
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'Csus2': [{ name: 'Csus2', strings: ['x', 3, 0, 0, 3, 3], fingers: [null, 1, null, null, 3, 4], position: 1 }],
  'Csus4': [{ name: 'Csus4', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],

  // --- C# / Db ---
  'C#': [{ name: 'C#', strings: ['x', 4, 6, 6, 6, 4], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#m': [{ name: 'C#m', strings: ['x', 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#7': [{ name: 'C#7', strings: ['x', 4, 3, 4, 2, 'x'], fingers: [null, 4, 2, 3, 1, null], position: 3 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D7': [{ name: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],
  'Dsus2': [{ name: 'Dsus2', strings: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], position: 1 }],
  'Dsus4': [{ name: 'Dsus4', strings: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], position: 1 }],

  // --- D# / Eb ---
  'D#': [{ name: 'D#', strings: ['x', 6, 8, 8, 8, 6], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#m': [{ name: 'D#m', strings: ['x', 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'E7': [{ name: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],
  'Esus4': [{ name: 'Esus4', strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], position: 1 }],

  // --- F ---
  'F': [{ name: 'F', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fm': [{ name: 'Fm', strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'F7': [{ name: 'F7', strings: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],

  // --- F# / Gb ---
  'F#': [{ name: 'F#', strings: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#m': [{ name: 'F#m', strings: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#7': [{ name: 'F#7', strings: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gm': [{ name: 'Gm', strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }],
  'G7': [{ name: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],
  'Gsus4': [{ name: 'Gsus4', strings: [3, 3, 0, 0, 3, 3], fingers: [2, 3, null, null, 1, 1], position: 1 }],

  // --- G# / Ab ---
  'G#': [{ name: 'G#', strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#m': [{ name: 'G#m', strings: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],

  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A7': [{ name: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], position: 1 }],
  'Asus2': [{ name: 'Asus2', strings: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], position: 1 }],
  'Asus4': [{ name: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 4, null], position: 1 }],

  // --- A# / Bb ---
  'A#': [{ name: 'A#', strings: ['x', 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#m': [{ name: 'A#m', strings: ['x', 1, 3, 3, 2, 1], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'B7': [{ name: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const normalized = normalizeName(chordName);
  if (chordLibrary[normalized]) return chordLibrary[normalized];

  // Поиск упрощенной версии (если не найден мажор/септ и т.д.)
  const baseMatch = normalized.match(/^[A-G][#b]?m?/);
  if (baseMatch && chordLibrary[baseMatch[0]]) return chordLibrary[baseMatch[0]];

  return [];
};
