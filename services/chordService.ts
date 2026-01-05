
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const normalizationMap: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
};

/**
 * Улучшенный поиск аккордов.
 * Поддерживает как заглавные [A-G], так и строчные [a-g] буквы.
 */
export const chordRegex = /(?<=^|[\s\[])([A-Ga-g][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)(?=[\s\]]|$)/g;
export const chordSplitRegex = /((?<=^|[\s\[])[A-Ga-g][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*(?=[\s\]]|$))/g;

export const transposeChord = (chord: string, semitones: number): string => {
  const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) return chord;

  let baseNote = match[1].charAt(0).toUpperCase() + match[1].slice(1);
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
