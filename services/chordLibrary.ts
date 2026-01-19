
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
  // --- C Group (Полная библиотека) ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'C11': [{ name: 'C11', strings: ['x', 3, 2, 3, 1, 1], fingers: [null, 3, 2, 4, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],
  'C13': [{ name: 'C13', strings: ['x', 3, 5, 3, 5, 5], fingers: [null, 1, 2, 1, 3, 4], position: 3 }],
  'C2': [{ name: 'C2', strings: ['x', 3, 0, 0, 3, 3], fingers: [null, 2, null, null, 3, 4], position: 1 }],
  'C5': [{ name: 'C5', strings: ['x', 3, 5, 5, 'x', 'x'], fingers: [null, 1, 3, 4, null, null], position: 3 }],
  'C6': [{ name: 'C6', strings: ['x', 3, 2, 2, 1, 0], fingers: [null, 4, 2, 3, 1, null], position: 1 }],
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'C7sus2': [{ name: 'C7sus2', strings: ['x', 3, 0, 3, 3, 3], fingers: [null, 1, null, 2, 3, 4], position: 1 }],
  'C7sus4': [{ name: 'C7sus4', strings: ['x', 3, 3, 3, 1, 'x'], fingers: [null, 2, 3, 4, 1, null], position: 1 }],
  'C9': [{ name: 'C9', strings: ['x', 3, 2, 3, 3, 3], fingers: [null, 2, 1, 3, 4, 4], position: 1 }],
  'Cadd9': [{ name: 'Cadd9', strings: ['x', 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], position: 1 }],
  'Caug': [{ name: 'Caug', strings: ['x', 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], position: 1 }],
  'Caug7': [{ name: 'Caug7', strings: ['x', 3, 6, 3, 5, 'x'], fingers: [null, 1, 4, 1, 3, null], position: 3 }],
  'Cdim': [{ name: 'Cdim', strings: ['x', 3, 4, 5, 4, 'x'], fingers: [null, 1, 2, 4, 3, null], position: 3 }],
  'Cdim7': [{ name: 'Cdim7', strings: ['x', 3, 4, 2, 4, 'x'], fingers: [null, 2, 3, 1, 4, null], position: 2 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Cm6': [{ name: 'Cm6', strings: ['x', 3, 1, 2, 1, 3], fingers: [null, 3, 1, 2, 1, 4], position: 1 }],
  'Cm7': [{ name: 'Cm7', strings: ['x', 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Cm9': [{ name: 'Cm9', strings: ['x', 3, 1, 3, 3, 'x'], fingers: [null, 3, 1, 4, 4, null], position: 1 }],
  'Cmadd9': [{ name: 'Cmadd9', strings: ['x', 3, 0, 0, 4, 3], fingers: [null, 1, null, null, 3, 2], position: 1 }],
  'Cmaj7': [{ name: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 }],
  'Cmaj9': [{ name: 'Cmaj9', strings: ['x', 3, 0, 0, 0, 0], fingers: [null, 3, null, null, null, null], position: 1 }],
  'Csus': [{ name: 'Csus', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], position: 1 }],
  'Csus2': [{ name: 'Csus2', strings: ['x', 3, 0, 0, 3, 3], fingers: [null, 1, null, null, 3, 4], position: 1 }],
  'Csus4': [{ name: 'Csus4', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], position: 1 }],

  // --- C# Group (Очищено, оставлен только базовый) ---
  'C#': [{ 
    name: 'C#', strings: ['x', 4, 3, 1, 2, 1], fingers: [null, 4, 3, 1, 2, 1], 
    barre: { fret: 1, from: 4, to: 6 }, position: 1 
  }],

  // --- Other ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  if (!chordName) return [];
  const normalized = normalizeName(chordName);
  return chordLibrary[normalized] || [];
};

export const getAllVariationsForRoot = (root: string): ChordFingering[] => {
  const variations: ChordFingering[] = [];
  const suffixes = [
    '', '11', '13', '2', '5', '6', '7', '7sus2', '7sus4', '9', 'add9', 
    'aug', 'aug7', 'dim', 'dim7', 'm', 'm6', 'm7', 'm9', 'madd9', 
    'maj7', 'maj9', 'sus', 'sus2', 'sus4'
  ];
  
  suffixes.forEach(s => {
    const fings = getFingerings(root + s);
    if (fings.length > 0) {
      variations.push(...fings);
    }
  });
  
  return variations;
};
