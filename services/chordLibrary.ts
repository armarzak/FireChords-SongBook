
export interface ChordFingering {
  name: string;
  strings: (number | 'x')[]; // 6-я -> 1-я (E A D G B E)
  fingers: (number | null)[]; // 1-4 или null
  barre?: { fret: number; from: number; to: number };
  position: number; 
}

const normalizeName = (name: string): string => {
  const map: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Bbm': 'A#m', 'Ebm': 'D#m', 'Abm': 'G#m', 'Dbm': 'C#m', 'Gbm': 'F#m',
    'Bbdim': 'A#dim', 'Ebdim': 'D#dim', 'Abdim': 'G#dim', 'Dbdim': 'C#dim', 'Gbdim': 'F#dim',
    'Cdim': 'B#dim', 'Fdim': 'E#dim'
  };
  const rootMatch = name.match(/^[A-G][#b]?/);
  if (!rootMatch) return name;
  
  const root = rootMatch[0];
  const suffix = name.slice(root.length);
  
  if (map[root]) return map[root] + suffix;
  if (map[name]) return map[name];
  
  return name;
};

export const chordLibrary: Record<string, ChordFingering[]> = {
  'E': [
    { name: 'E (Open)', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 },
    { name: 'E (Barre VII)', strings: ['x', 7, 9, 9, 9, 7], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 7 }
  ],
  'Em': [
    { name: 'Em (Open)', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 },
    { name: 'Em (Barre VII)', strings: ['x', 7, 9, 9, 8, 7], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 7 }
  ],
  'G': [
    { name: 'G (Open)', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 },
    { name: 'G (Barre III)', strings: [3, 5, 5, 4, 3, 3], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }
  ],
  'Gm': [
    { name: 'Gm (Barre III)', strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 },
    { name: 'Gm (Barre X)', strings: ['x', 10, 12, 12, 11, 10], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 10 }
  ],
  'A': [
    { name: 'A (Open)', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 },
    { name: 'A (Barre V)', strings: [5, 7, 7, 6, 5, 5], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 5 }
  ],
  'Am': [
    { name: 'Am (Open)', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 },
    { name: 'Am (Barre V)', strings: [5, 7, 7, 5, 5, 5], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 5 }
  ],
  'C': [
    { name: 'C (Open)', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 },
    { name: 'C (Barre III)', strings: ['x', 3, 5, 5, 5, 3], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 },
    { name: 'C (Barre VIII)', strings: [8, 10, 10, 9, 8, 8], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 8 }
  ],
  'Cm': [
    { name: 'Cm (Barre III)', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 },
    { name: 'Cm (Barre VIII)', strings: [8, 10, 10, 8, 8, 8], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 8 }
  ],
  'D': [
    { name: 'D (Open)', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 },
    { name: 'D (Barre V)', strings: ['x', 5, 7, 7, 7, 5], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 5 }
  ],
  'Dm': [
    { name: 'Dm (Open)', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 },
    { name: 'Dm (Barre V)', strings: ['x', 5, 7, 7, 6, 5], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 5 }
  ],
  'F': [
    { name: 'F (Barre I)', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 },
    { name: 'F (Barre VIII)', strings: ['x', 8, 10, 10, 10, 8], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 8 }
  ],
  'Fm': [
    { name: 'Fm (Barre I)', strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 },
    { name: 'Fm (Barre VIII)', strings: ['x', 8, 10, 10, 9, 8], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 8 }
  ],
  'B': [
    { name: 'B (Barre II)', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 },
    { name: 'B (Barre VII)', strings: [7, 9, 9, 8, 7, 7], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 7 }
  ],
  'Bm': [
    { name: 'Bm (Barre II)', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 },
    { name: 'Bm (Barre VII)', strings: [7, 9, 9, 7, 7, 7], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 7 }
  ],
  'A#': [
    { name: 'A# (Barre I)', strings: ['x', 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 },
    { name: 'A# (Barre VI)', strings: [6, 8, 8, 7, 6, 6], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 6 }
  ],
  'A#m': [
    { name: 'A#m (Barre I)', strings: ['x', 1, 3, 3, 2, 1], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 },
    { name: 'A#m (Barre VI)', strings: [6, 8, 8, 6, 6, 6], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 6 }
  ],
  'C#': [
    { name: 'C# (Barre IV)', strings: ['x', 4, 6, 6, 6, 4], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 },
    { name: 'C# (Barre IX)', strings: [9, 11, 11, 10, 9, 9], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 9 }
  ],
  'C#m': [
    { name: 'C#m (Barre IV)', strings: ['x', 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 },
    { name: 'C#m (Barre IX)', strings: [9, 11, 11, 9, 9, 9], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 9 }
  ],
  'D#': [
    { name: 'D# (Barre VI)', strings: ['x', 6, 8, 8, 8, 6], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 },
    { name: 'D# (Barre XI)', strings: [11, 13, 13, 12, 11, 11], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 11 }
  ],
  'D#m': [
    { name: 'D#m (Barre VI)', strings: ['x', 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 },
    { name: 'D#m (Barre XI)', strings: [11, 13, 13, 11, 11, 11], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 11 }
  ],
  'F#': [
    { name: 'F# (Barre II)', strings: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 },
    { name: 'F# (Barre IX)', strings: ['x', 9, 11, 11, 11, 9], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 9 }
  ],
  'F#m': [
    { name: 'F#m (Barre II)', strings: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 },
    { name: 'F#m (Barre IX)', strings: ['x', 9, 11, 11, 10, 9], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 9 }
  ],
  'G#': [
    { name: 'G# (Barre IV)', strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 },
    { name: 'G# (Barre XI)', strings: ['x', 11, 13, 13, 13, 11], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 11 }
  ],
  'G#m': [
    { name: 'G#m (Barre IV)', strings: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 },
    { name: 'G#m (Barre XI)', strings: ['x', 11, 13, 13, 12, 11], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 11 }
  ],
  
  // Dim Chords (базовые)
  'Cdim': [{ name: 'Cdim', strings: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], position: 1 }],
  'C#dim': [{ name: 'C#dim', strings: ['x', 'x', 2, 3, 2, 3], fingers: [null, null, 1, 3, 2, 4], position: 2 }],
  'Ddim': [{ name: 'Ddim', strings: ['x', 'x', 0, 1, 0, 1], fingers: [null, null, null, 2, null, 3], position: 1 }],
  'D#dim': [{ name: 'D#dim', strings: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], position: 1 }],
  'Edim': [{ name: 'Edim', strings: [0, 1, 2, 0, 2, 0], fingers: [null, 1, 2, null, 3, null], position: 1 }],
  'Fdim': [{ name: 'Fdim', strings: ['x', 'x', 3, 4, 3, 4], fingers: [null, null, 1, 3, 2, 4], position: 3 }],
  'F#dim': [{ name: 'F#dim', strings: ['x', 'x', 4, 5, 4, 5], fingers: [null, null, 1, 3, 2, 4], position: 4 }],
  'Gdim': [{ name: 'Gdim', strings: ['x', 'x', 5, 6, 5, 6], fingers: [null, null, 1, 3, 2, 4], position: 5 }],
  'G#dim': [{ name: 'G#dim', strings: ['x', 'x', 6, 7, 6, 7], fingers: [null, null, 1, 3, 2, 4], position: 6 }],
  'Adim': [{ name: 'Adim', strings: ['x', 'x', 7, 8, 7, 8], fingers: [null, null, 1, 3, 2, 4], position: 7 }],
  'A#dim': [{ name: 'A#dim', strings: ['x', 'x', 8, 9, 8, 9], fingers: [null, null, 1, 3, 2, 4], position: 8 }],
  'Bdim': [{ name: 'Bdim', strings: ['x', 2, 3, 4, 3, 'x'], fingers: [null, 1, 2, 4, 3, null], position: 2 }]
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const normalized = normalizeName(chordName);
  
  if (chordLibrary[normalized]) return chordLibrary[normalized];
  
  const baseMatch = normalized.match(/^([A-G][#b]?m?(?:dim)?)/);
  if (baseMatch && chordLibrary[baseMatch[1]]) {
    return chordLibrary[baseMatch[1]];
  }
  
  const rootOnly = normalized.match(/^[A-G][#b]?/);
  if (rootOnly && chordLibrary[rootOnly[0]]) {
    return chordLibrary[rootOnly[0]];
  }

  return [];
};
