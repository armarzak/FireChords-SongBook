
export interface ChordFingering {
  name: string;
  strings: (number | 'x')[]; // 6-я -> 1-я (Low E -> High E)
  fingers: (number | null)[]; 
  barre?: { fret: number; from: number; to: number };
  position: number; 
}

const normalizeName = (name: string): string => {
  if (!name) return name;
  // Убираем лишние пробелы и приводим к стандарту
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
  // --- Базовые C ---
  'C': [{ name: 'C', strings: ['x', 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], position: 1 }],
  'Cm': [{ name: 'Cm', strings: ['x', 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 3 }],
  'Cadd9': [{ name: 'Cadd9', strings: ['x', 3, 2, 0, 3, 0], fingers: [null, 3, 2, null, 4, null], position: 1 }],
  'Cmaj7': [{ name: 'Cmaj7', strings: ['x', 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], position: 1 }],
  'C9': [{ name: 'C9', strings: ['x', 3, 2, 3, 3, 3], fingers: [null, 2, 1, 3, 3, 3], barre: { fret: 1, from: 4, to: 6 }, position: 1 }],

  // --- D ---
  'D': [{ name: 'D', strings: ['x', 'x', 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], position: 1 }],
  'Dm': [{ name: 'Dm', strings: ['x', 'x', 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], position: 1 }],
  'Dadd9': [{ name: 'Dadd9', strings: ['x', 'x', 0, 2, 5, 2], fingers: [null, null, null, 1, 4, 2], position: 1 }],
  'D9': [{ name: 'D9', strings: ['x', 5, 4, 5, 5, 5], fingers: [null, 2, 1, 3, 3, 3], barre: { fret: 1, from: 4, to: 6 }, position: 4 }],

  // --- E ---
  'E': [{ name: 'E', strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], position: 1 }],
  'Em': [{ name: 'Em', strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], position: 1 }],
  'Eadd9': [{ name: 'Eadd9', strings: [0, 2, 4, 1, 0, 0], fingers: [null, 2, 4, 1, null, null], position: 1 }],

  // --- G ---
  'G': [{ name: 'G', strings: [3, 2, 0, 0, 0, 3], fingers: [3, 2, null, null, null, 4], position: 1 }],
  'Gadd9': [{ name: 'Gadd9', strings: [3, 2, 0, 2, 0, 3], fingers: [3, 1, null, 2, null, 4], position: 1 }],

  // --- A ---
  'A': [{ name: 'A', strings: ['x', 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], position: 1 }],
  'Am': [{ name: 'Am', strings: ['x', 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], position: 1 }],
  'Aadd9': [{ name: 'Aadd9', strings: ['x', 0, 2, 4, 2, 0], fingers: [null, null, 1, 3, 2, null], position: 1 }],
  'Am9': [{ name: 'Am9', strings: [5, 'x', 5, 5, 5, 7], fingers: [1, null, 1, 1, 1, 4], barre: { fret: 1, from: 1, to: 5 }, position: 5 }],

  // --- B ---
  'B': [{ name: 'B', strings: ['x', 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Bm': [{ name: 'Bm', strings: ['x', 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], barre: { fret: 1, from: 2, to: 6 }, position: 2 }],
  'Badd11': [{ name: 'Badd11', strings: ['x', 2, 4, 4, 4, 0], fingers: [null, 1, 2, 3, 4, null], position: 2 }],
  
  // Формы для 6, 6/9, maj9 (общие примеры)
  'C6': [{ name: 'C6', strings: ['x', 3, 2, 2, 1, 0], fingers: [null, 3, 2, 2, 1, null], position: 1 }],
  'G6': [{ name: 'G6', strings: [3, 2, 0, 0, 0, 0], fingers: [2, 1, null, null, null, null], position: 1 }],
};

export const getFingerings = (chordName: string): ChordFingering[] => {
  const normalized = normalizeName(chordName);
  
  // 1. Поиск точного совпадения
  if (chordLibrary[normalized]) {
    return chordLibrary[normalized];
  }

  // 2. Обработка алиасов и упрощений
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
      // Если точной формы нет, пробуем найти базовую форму без наворотов (фолбэк)
      const root = normalized.match(/^[A-G][#b]?m?/)?.[0];
      if (root && chordLibrary[root]) {
        // Возвращаем базу, если "цветного" аккорда нет в базе
        return chordLibrary[root];
      }
    }
  }

  // 3. Последний шанс: если это минор, вернем обычный минор, если мажор - мажор
  const baseMatch = normalized.match(/^[A-G][#b]?m?/);
  if (baseMatch && chordLibrary[baseMatch[0]]) {
    return chordLibrary[baseMatch[0]];
  }

  return [];
};
