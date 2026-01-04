
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
  'C7': [{ name: 'C7 (Open)', strings: ['x', 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], position: 1 }],
  'Cmaj7': [{ name: 'Cmaj7 (Open)', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 }],
  'Cm7': [{ name: 'Cm7 (Barre)', strings: ['x', 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],

  // --- D ---
  'D': [{ name: 'D (Open)', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm (Open)', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'D7': [{ name: 'D7 (Open)', strings: ['x', 'x', 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], position: 1 }],
  'Dsus4': [{ name: 'Dsus4', strings: ['x', 'x', 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], position: 1 }],
  'D7sus4': [{ name: 'D7sus4', strings: ['x', 'x', 0, 2, 1, 3], fingers: [null, null, null, 2, 1, 4], position: 1 }],

  // --- E ---
  'E': [{ name: 'E (Open)', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em (Open)', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'E7': [{ name: 'E7 (Open)', strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], position: 1 }],

  // --- G ---
  'G': [{ name: 'G (Open)', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'G7': [{ name: 'G7 (Open)', strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], position: 1 }],

  // --- A ---
  'A': [{ name: 'A (Open)', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am (Open)', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'A7': [{ name: 'A7 (Open)', strings: ['x', 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], position: 1 }],
  'Am7': [{ name: 'Am7 (Open)', strings: ['x', 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], position: 1 }],
  'Asus2': [{ name: 'Asus2', strings: ['x', 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], position: 1 }],
  'Asus4': [{ name: 'Asus4', strings: ['x', 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'A7sus4': [
    { name: 'A7sus4 (Open)', strings: ['x', 0, 2, 0, 3, 0], fingers: [null, null, 2, null, 3, null], position: 1 },
    { name: 'A7sus4 (Barre)', strings: [5, 7, 5, 7, 5, 5], fingers: [1, 3, 1, 4, 1, 1], barre: { fret: 1, from: 1, to: 6 }, position: 5 }
  ],
  'Aadd9': [{ name: 'Aadd9', strings: ['x', 0, 7, 6, 0, 0], fingers: [null, null, 3, 2, null, null], position: 1 }],

  // --- B ---
  'B': [{ name: 'B (Barre)', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm (Barre)', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'B7': [{ name: 'B7 (Open)', strings: ['x', 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], position: 1 }],

  // --- Others / Advanced ---
  'G#maj': [{ name: 'Abmaj', strings: ['x', 'x', 6, 5, 4, 3], fingers: [null, null, 4, 3, 2, 1], position: 3 }],
  'G#maj7': [{ name: 'Abmaj7', strings: ['x', 'x', 6, 5, 4, 3], fingers: [null, null, 4, 3, 2, 1], position: 3 }],
  'm7b5': [{ name: 'm7b5 (Example Am7b5)', strings: ['x', 0, 1, 0, 1, 'x'], fingers: [null, null, 1, null, 2, null], position: 1 }]
};

/**
 * Расширенный поиск аккорда с каскадной системой фолбэков.
 */
export const getFingerings = (chordName: string): ChordFingering[] => {
  const cleanName = chordName.replace(/\s+/g, '');
  const normalized = normalizeName(cleanName);
  
  // 1. Прямой поиск
  if (chordLibrary[normalized]) return chordLibrary[normalized];
  
  // 2. Синонимы суффиксов
  const aliasMap: Record<string, string> = {
    'maj': '', 'min': 'm', 'M7': 'maj7', 'Δ': 'maj7'
  };
  for (const [alias, replacement] of Object.entries(aliasMap)) {
    if (normalized.endsWith(alias)) {
      const fixed = normalized.slice(0, -alias.length) + replacement;
      if (chordLibrary[fixed]) return chordLibrary[fixed];
    }
  }

  // 3. Каскад фолбэков (для сложных аккордов типа A7sus4)
  // Пытаемся отбрасывать части суффикса справа налево
  let tempName = normalized;
  const suffixSteps = [/sus\d$/, /add\d$/, /[\d]$/, /m$/];
  
  for (const step of suffixSteps) {
    if (tempName.match(step)) {
      tempName = tempName.replace(step, '');
      if (chordLibrary[tempName]) return chordLibrary[tempName];
    }
  }

  // 4. Фолбэк на корень (Трезвучие)
  const rootMatch = normalized.match(/^([A-G][#b]?m?)/);
  if (rootMatch && chordLibrary[rootMatch[1]]) {
    return chordLibrary[rootMatch[1]];
  }

  return [];
};
