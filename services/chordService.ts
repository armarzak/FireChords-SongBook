
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const normalizationMap: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
};

/**
 * Улучшенный поиск аккордов.
 * Ищет последовательности типа F#m, C#maj7, Bb, не обрезая символы # и b.
 */
export const chordRegex = /(?<=^|[\s\[])([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)(?=[\s\]]|$)/g;
export const chordSplitRegex = /((?<=^|[\s\[])[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*(?=[\s\]]|$))/g;

export const transposeChord = (chord: string, semitones: number): string => {
  // Находим корень аккорда (буква + опционально # или b)
  const match = chord.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return chord;

  let baseNote = match[1];
  const suffix = match[2];

  if (normalizationMap[baseNote]) {
    baseNote = normalizationMap[baseNote];
  }

  const index = chromaticScale.indexOf(baseNote);
  if (index === -1) return chord;

  let newIndex = (index + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return chromaticScale[newIndex] + suffix;
};

export const transposeText = (text: string, semitones: number): string => {
  if (semitones === 0) return text;
  return text.replace(chordRegex, (match) => transposeChord(match, semitones));
};
