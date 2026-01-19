
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
  // --- C Group ---
  'C': [
    { name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 },
    { name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 },
    { name: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 },
    { name: 'Cadd9', strings: ['x', 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], position: 1 }
  ],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],

  // --- A Group ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A7': [{ name: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], position: 1 }],

  // --- D Group ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D7': [{ name: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],

  // --- E Group ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'E7': [{ name: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],

  // --- G Group ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'G7': [{ name: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],

  // --- F Group ---
  'F': [{ name: 'F', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],

  // --- B Group ---
  'B7': [{ name: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],

  // --- C# / Db Backup ---
  'C#': [{ name: 'C#', strings: ['x', 4, 6, 6, 6, 4], fingers: [null, 1, 3, 3, 3, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  if (!chordName) return [];
  const normalized = normalizeName(chordName);
  return chordLibrary[normalized] || [];
};

export const getAllVariationsForRoot = (root: string): ChordFingering[] => {
  const variations: ChordFingering[] = [];
  const suffixes = [
    '', 'm', '7', 'maj7', 'm7', 'sus2', 'sus4', 'dim', 'aug', '6', 'add9'
  ];
  
  suffixes.forEach(s => {
    const fings = getFingerings(root + s);
    if (fings.length > 0) {
      variations.push(...fings);
    }
  });
  
  return variations;
};
