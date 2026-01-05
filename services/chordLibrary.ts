
export interface ChordFingering {
  name: string;
  strings: (number | 'x')[]; // 6-я -> 1-я (Low E -> High E)
  fingers: (number | null)[]; 
  barre?: { fret: number; from: number; to: number };
  position: number; 
}

const normalizeName = (name: string): string => {
  if (!name) return name;
  const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
  const map: Record<string, string> = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
    'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
  };
  const rootMatch = capitalized.match(/^[A-G][#b]?/);
  if (!rootMatch) return capitalized;
  const root = rootMatch[0];
  const suffix = capitalized.slice(root.length);
  return (map[root] || root) + suffix;
};

export const chordLibrary: Record<string, ChordFingering[]> = {
  // --- C ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'C7': [{ name: 'C7', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'Cmaj7': [{ name: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 }],
  'Cm7': [{ name: 'Cm7', strings: ['x', 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Cdim': [{ name: 'Cdim', strings: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], position: 1 }],
  'Csus2': [{ name: 'Csus2', strings: ['x', 3, 5, 5, 3, 3], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Csus4': [{ name: 'Csus4', strings: ['x', 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],

  // --- C# / Db ---
  'C#': [{ name: 'C#', strings: ['x', 4, 6, 6, 6, 4], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#m': [{ name: 'C#m', strings: ['x', 4, 6, 6, 5, 4], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#7': [{ name: 'C#7', strings: ['x', 4, 6, 4, 6, 4], fingers: [null, 1, 3, 1, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#maj7': [{ name: 'C#maj7', strings: ['x', 4, 6, 5, 6, 4], fingers: [null, 1, 3, 2, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#dim': [{ name: 'C#dim', strings: ['x', 'x', 2, 3, 2, 3], fingers: [null, null, 1, 3, 2, 4], position: 2 }],
  'C#sus2': [{ name: 'C#sus2', strings: ['x', 4, 6, 6, 4, 4], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],
  'C#sus4': [{ name: 'C#sus4', strings: ['x', 4, 6, 6, 7, 4], fingers: [null, 1, 3, 4, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 4 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D7': [{ name: 'D7', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],
  'Dmaj7': [{ name: 'Dmaj7', strings: ['x', 'x', 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3], position: 1 }],
  'Dm7': [{ name: 'Dm7', strings: ['x', 'x', 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], barre: { fret: 1, from: 5, to: 6 }, position: 1 }],
  'Ddim': [{ name: 'Ddim', strings: ['x', 'x', 0, 1, 0, 1], fingers: [null, null, null, 1, null, 2], position: 1 }],
  'Dsus2': [{ name: 'Dsus2', strings: ['x', 'x', 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], position: 1 }],
  'Dsus4': [{ name: 'Dsus4', strings: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], position: 1 }],

  // --- D# / Eb ---
  'D#': [{ name: 'D#', strings: ['x', 6, 8, 8, 8, 6], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#m': [{ name: 'D#m', strings: ['x', 6, 8, 8, 7, 6], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#7': [{ name: 'D#7', strings: ['x', 6, 8, 6, 8, 6], fingers: [null, 1, 3, 1, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#maj7': [{ name: 'D#maj7', strings: ['x', 6, 8, 7, 8, 6], fingers: [null, 1, 3, 2, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#dim': [{ name: 'D#dim', strings: ['x', 'x', 1, 2, 1, 2], fingers: [null, null, 1, 3, 2, 4], position: 1 }],
  'D#sus2': [{ name: 'D#sus2', strings: ['x', 6, 8, 8, 6, 6], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],
  'D#sus4': [{ name: 'D#sus4', strings: ['x', 6, 8, 8, 9, 6], fingers: [null, 1, 3, 4, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 6 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'E7': [{ name: 'E7', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],
  'Emaj7': [{ name: 'Emaj7', strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], position: 1 }],
  'Em7': [{ name: 'Em7', strings: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], position: 1 }],
  'Edim': [{ name: 'Edim', strings: ['x', 'x', 2, 3, 2, 3], fingers: [null, null, 1, 3, 2, 4], position: 2 }],
  'Esus2': [{ name: 'Esus2', strings: [0, 2, 4, 4, 0, 0], fingers: [null, 1, 3, 4, null, null], position: 1 }],
  'Esus4': [{ name: 'Esus4', strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], position: 1 }],

  // --- F ---
  'F': [{ name: 'F', strings: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fm': [{ name: 'Fm', strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'F7': [{ name: 'F7', strings: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fmaj7': [{ name: 'Fmaj7', strings: ['x', 'x', 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], position: 1 }],
  'Fm7': [{ name: 'Fm7', strings: [1, 3, 1, 1, 1, 1], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fdim': [{ name: 'Fdim', strings: ['x', 'x', 3, 4, 3, 4], fingers: [null, null, 1, 3, 2, 4], position: 3 }],
  'Fsus2': [{ name: 'Fsus2', strings: [1, 3, 3, 0, 1, 1], fingers: [1, 3, 4, null, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],
  'Fsus4': [{ name: 'Fsus4', strings: [1, 3, 3, 3, 1, 1], fingers: [1, 3, 4, 4, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 1 }],

  // --- F# / Gb ---
  'F#': [{ name: 'F#', strings: [2, 4, 4, 3, 2, 2], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#m': [{ name: 'F#m', strings: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#7': [{ name: 'F#7', strings: [2, 4, 2, 3, 2, 2], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#maj7': [{ name: 'F#maj7', strings: [2, 4, 3, 3, 2, 2], fingers: [1, 3, 2, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#m7': [{ name: 'F#m7', strings: [2, 4, 2, 2, 2, 2], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#dim': [{ name: 'F#dim', strings: ['x', 'x', 4, 5, 4, 5], fingers: [null, null, 1, 3, 2, 4], position: 4 }],
  'F#sus2': [{ name: 'F#sus2', strings: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],
  'F#sus4': [{ name: 'F#sus4', strings: [2, 4, 4, 4, 2, 2], fingers: [1, 3, 4, 4, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 2 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gm': [{ name: 'Gm', strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }],
  'G7': [{ name: 'G7', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],
  'Gmaj7': [{ name: 'Gmaj7', strings: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], position: 1 }],
  'Gm7': [{ name: 'Gm7', strings: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 3 }],
  'Gdim': [{ name: 'Gdim', strings: ['x', 'x', 5, 6, 5, 6], fingers: [null, null, 1, 3, 2, 4], position: 5 }],
  'Gsus2': [{ name: 'Gsus2', strings: [3, 0, 0, 2, 3, 3], fingers: [2, null, null, 1, 3, 4], position: 1 }],
  'Gsus4': [{ name: 'Gsus4', strings: [3, 3, 0, 0, 1, 3], fingers: [3, 4, null, null, 1, 4], position: 1 }],

  // --- G# / Ab ---
  'G#': [{ name: 'G#', strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#m': [{ name: 'G#m', strings: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#7': [{ name: 'G#7', strings: [4, 6, 4, 5, 4, 4], fingers: [1, 3, 1, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#maj7': [{ name: 'G#maj7', strings: [4, 6, 5, 5, 4, 4], fingers: [1, 3, 2, 2, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#m7': [{ name: 'G#m7', strings: [4, 6, 4, 4, 4, 4], fingers: [1, 3, 1, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#dim': [{ name: 'G#dim', strings: ['x', 'x', 6, 7, 6, 7], fingers: [null, null, 1, 3, 2, 4], position: 6 }],
  'G#sus2': [{ name: 'G#sus2', strings: [4, 6, 6, 4, 4, 4], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],
  'G#sus4': [{ name: 'G#sus4', strings: [4, 6, 6, 6, 4, 4], fingers: [1, 3, 4, 4, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 4 }],

  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A7': [{ name: 'A7', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 2, null], position: 1 }],
  'Amaj7': [{ name: 'Amaj7', strings: ['x', 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], position: 1 }],
  'Am7': [{ name: 'Am7', strings: ['x', 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], position: 1 }],
  'Adim': [{ name: 'Adim', strings: ['x', 'x', 7, 8, 7, 8], fingers: [null, null, 1, 3, 2, 4], position: 7 }],
  'Asus2': [{ name: 'Asus2', strings: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], position: 1 }],
  'Asus4': [{ name: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 2, 3, 4, null], position: 1 }],

  // --- A# / Bb ---
  'A#': [{ name: 'A#', strings: ['x', 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#m': [{ name: 'A#m', strings: ['x', 1, 3, 3, 2, 1], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#7': [{ name: 'A#7', strings: ['x', 1, 3, 1, 3, 1], fingers: [null, 1, 3, 1, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#maj7': [{ name: 'A#maj7', strings: ['x', 1, 3, 2, 3, 1], fingers: [null, 1, 3, 2, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#m7': [{ name: 'A#m7', strings: ['x', 1, 3, 1, 2, 1], fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#dim': [{ name: 'A#dim', strings: ['x', 'x', 8, 9, 8, 9], fingers: [null, null, 1, 3, 2, 4], position: 8 }],
  'A#sus2': [{ name: 'A#sus2', strings: ['x', 1, 3, 3, 1, 1], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],
  'A#sus4': [{ name: 'A#sus4', strings: ['x', 1, 3, 3, 4, 1], fingers: [null, 1, 3, 4, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 1 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'B7': [{ name: 'B7', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],
  'Bmaj7': [{ name: 'Bmaj7', strings: ['x', 2, 4, 3, 4, 2], fingers: [null, 1, 3, 2, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm7': [{ name: 'Bm7', strings: ['x', 2, 4, 2, 3, 2], fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bdim': [
    { name: 'Bdim', strings: ['x', 2, 3, 4, 3, 'x'], fingers: [null, 1, 2, 4, 3, null], position: 2 },
    { name: 'Bdim', strings: ['x', 'x', 9, 10, 9, 10], fingers: [null, null, 1, 3, 2, 4], position: 9 }
  ],
  'Bsus2': [{ name: 'Bsus2', strings: ['x', 2, 4, 4, 2, 2], fingers: [null, 1, 3, 4, 1, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bsus4': [{ name: 'Bsus4', strings: ['x', 2, 4, 4, 5, 2], fingers: [null, 1, 3, 4, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const cleanName = chordName.replace(/\s+/g, '');
  const normalized = normalizeName(cleanName);
  
  // 1. Прямое соответствие
  if (chordLibrary[normalized]) {
    return chordLibrary[normalized].map(f => ({ ...f, name: chordName }));
  }

  // 2. Алиасы типов
  const aliasMap: Record<string, string> = {
    'maj': '', 'min': 'm', 'M7': 'maj7', 'Δ': 'maj7', 'dim7': 'dim', 'o': 'dim'
  };
  
  for (const [alias, replacement] of Object.entries(aliasMap)) {
    if (normalized.endsWith(alias)) {
      const fixed = normalized.slice(0, -alias.length) + replacement;
      if (chordLibrary[fixed]) {
        return chordLibrary[fixed].map(f => ({ ...f, name: chordName }));
      }
    }
  }

  // 3. Умный фолбэк
  let tempName = normalized;
  
  if (tempName.endsWith('7')) {
    const base = tempName.replace('7', '');
    if (chordLibrary[base]) {
       return chordLibrary[base].map(f => ({ ...f, name: chordName }));
    }
  }

  const suffixSteps = [/maj7$/, /sus\d$/, /add\d$/];
  for (const step of suffixSteps) {
    if (tempName.match(step)) {
      const base = tempName.replace(step, '');
      if (chordLibrary[base]) {
        return chordLibrary[base].map(f => ({ ...f, name: chordName }));
      }
    }
  }

  const strictQualities = ['m', 'dim', 'sus', 'aug'];
  if (strictQualities.some(q => normalized.includes(q))) {
    return [];
  }

  return [];
};
