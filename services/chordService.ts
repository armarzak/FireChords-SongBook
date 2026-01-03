
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const normalizationMap: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
};

/**
 * Улучшенное регулярное выражение:
 * \b[A-G][#b]? - Корень аккорда с границей слова в начале
 * (?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])* - Любые суффиксы
 * (?![a-zA-Z0-9#b]) - Негативный lookahead вместо \b в конце (важно для аккордов заканчивающихся на #)
 */
export const chordRegex = /\b[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*(?![a-zA-Z0-9#b])/g;

export const transposeChord = (chord: string, semitones: number): string => {
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
  return text.replace(chordRegex, (chord) => transposeChord(chord, semitones));
};
