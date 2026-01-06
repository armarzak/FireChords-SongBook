
export interface ChordFingering {
  name: string;
  strings: (number | 'x')[]; // 6-я -> 1-я (Low E -> High E)
  fingers: (number | null)[]; 
  barre?: { fret: number; from: number; to: number };
  position: number; 
}

const normalizeName = (name: string): string => {
  if (!name) return name;
  let res = name.replace(/\s+/g, '');
  res = res.charAt(0).toUpperCase() + res.slice(1);
  
  const map: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
  };

  const rootMatch = res.match(/^[A-G][#b]?/);
  if (!rootMatch) return res;
  const root = rootMatch[0];
  const suffix = res.slice(root.length);
  
  return (map[root] || root) + suffix;
};

export const chordLibrary: Record<string, ChordFingering[]> = {
  // --- C ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Csus2': [{ name: 'Csus2', strings: ['x', 3, 0, 0, 3, 3], fingers: [null, 1, null, null, 3, 4], position: 1 }],
  'Csus4': [{ name: 'Csus4', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'Dsus2': [{ name: 'Dsus2', strings: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], position: 1 }],
  'Dsus4': [{ name: 'Dsus4', strings: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], position: 1 }],
  'D7': [{ name: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'Esus4': [{ name: 'Esus4', strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], position: 1 }],
  'E7': [{ name: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gsus4': [{ name: 'Gsus4', strings: [3, 3, 0, 0, 3, 3], fingers: [1, 2, null, null, 3, 4], position: 3 }],
  'G7': [{ name: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],

  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'Asus2': [{ name: 'Asus2', strings: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], position: 1 }],
  'Asus4': [{ name: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 4, null], position: 1 }],
  'A7': [{ name: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], position: 1 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bsus2': [{ name: 'Bsus2', strings: ['x', 2, 4, 4, 2, 2], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'B7': [{ name: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],

  // Популярные доп. формы
  'Cadd9': [{ name: 'Cadd9', strings: ['x', 3, 2, 0, 3, 0], fingers: [null, 3, 2, null, 4, null], position: 1 }],
  'Aadd9': [{ name: 'Aadd9', strings: ['x', 0, 2, 4, 2, 0], fingers: [null, null, 1, 3, 2, null], position: 1 }],
  'Badd11': [{ name: 'Badd11', strings: ['x', 2, 4, 4, 4, 0], fingers: [null, 1, 2, 3, 4, null], position: 2 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const normalized = normalizeName(chordName);
  
  if (chordLibrary[normalized]) {
    return chordLibrary[normalized];
  }

  // Предотвращаем подмену sus-аккордов мажорами
  if (normalized.includes('sus')) {
    // Если точного sus нет, ищем только по корню с тем же типом sus (если были бы универсальные формы)
    return [];
  }

  const transformations = [
    { from: /maj7$/, to: 'maj7' },
    { from: /add9$/, to: 'add9' },
    { from: /add11$/, to: 'add11' },
    { from: /m9$/, to: 'm9' },
    { from: /9$/, to: '9' },
    { from: /6$/, to: '6' }
  ];

  for (const t of transformations) {
    if (normalized.match(t.from)) {
      const root = normalized.match(/^[A-G][#b]?m?/)?.[0];
      if (root && chordLibrary[root]) {
        return chordLibrary[root];
      }
    }
  }

  const baseMatch = normalized.match(/^[A-G][#b]?m?/);
  if (baseMatch && chordLibrary[baseMatch[0]]) {
    return chordLibrary[baseMatch[0]];
  }

  return [];
};
