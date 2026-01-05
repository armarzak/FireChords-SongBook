
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
    'Cb': 'B', 'Fb': 'E'
  };
  const rootMatch = name.match(/^[A-G][#b]?/);
  if (!rootMatch) return name;
  const root = rootMatch[0];
  const suffix = name.slice(root.length);
  return (map[root] || root) + suffix;
};

export const chordLibrary: Record<string, ChordFingering[]> = {
  // --- C ---
  'C': [{ name: 'C (Open)', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm (Barre)', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'C#': [{ name: 'C# (Barre)', strings: ['x', 4, 6, 6, 6, 4], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#m': [{ name: 'C#m (Barre)', strings: ['x', 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],

  // --- D ---
  'D': [{ name: 'D (Open)', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm (Open)', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D#': [{ name: 'Eb (Barre)', strings: ['x', 6, 8, 8, 8, 6], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],

  // --- E ---
  'E': [{ name: 'E (Open)', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em (Open)', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],

  // --- F ---
  'F': [{ name: 'F (Barre)', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'F#': [{ name: 'F# (Barre)', strings: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#m': [{ name: 'F#m (Barre)', strings: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],

  // --- G ---
  'G': [{ name: 'G (Open)', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'G#': [{ name: 'Ab (Barre)', strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#m': [{ name: 'Abm (Barre)', strings: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],

  // --- A ---
  'A': [{ name: 'A (Open)', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am (Open)', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A#': [{ name: 'Bb (Barre)', strings: ['x', 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],

  // --- B ---
  'B': [{ name: 'B (Barre)', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm (Barre)', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }]
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const cleanName = chordName.replace(/\s+/g, '');
  const normalized = normalizeName(cleanName);
  
  if (chordLibrary[normalized]) return chordLibrary[normalized];
  
  const aliasMap: Record<string, string> = {
    'maj': '', 'min': 'm', 'M7': 'maj7', 'Δ': 'maj7'
  };
  for (const [alias, replacement] of Object.entries(aliasMap)) {
    if (normalized.endsWith(alias)) {
      const fixed = normalized.slice(0, -alias.length) + replacement;
      if (chordLibrary[fixed]) return chordLibrary[fixed];
    }
  }

  let tempName = normalized;
  const suffixSteps = [/sus\d$/, /add\d$/, /[\d]$/, /m$/];
  
  for (const step of suffixSteps) {
    if (tempName.match(step)) {
      tempName = tempName.replace(step, '');
      if (chordLibrary[tempName]) return chordLibrary[tempName];
    }
  }

  const rootMatch = normalized.match(/^([A-G][#b]?m?)/);
  if (rootMatch && chordLibrary[rootMatch[1]]) {
    return chordLibrary[rootMatch[1]];
  }

  return [];
};
