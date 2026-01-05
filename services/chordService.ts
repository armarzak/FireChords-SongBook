
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const normalizationMap: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
};

/**
 * Регулярное выражение для поиска аккордов.
 * Оптимизировано для работы с бемолями и различными суффиксами.
 */
export const chordRegex = /([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)/g;

/**
 * Регулярное выражение для разбивки строки на части (текст и аккорды).
 * Использует захватывающие скобки, чтобы аккорды сохранялись в массиве после split.
 */
export const chordSplitRegex = /((?:^|[\s\[])(?:[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*))/g;

export const transposeChord = (chord: string, semitones: number): string => {
  // Извлекаем корень и суффикс
  const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!match) return chord;

  let baseNote = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const suffix = match[2];

  // Приводим к диезной форме для работы со шкалой
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
  
  // Транспонируем только те части, которые похожи на аккорды
  return text.split(chordSplitRegex).map(part => {
    const chordMatch = part.match(/([A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|[\d\/\+#b])*)/);
    if (chordMatch) {
      const fullChord = chordMatch[0];
      const transposed = transposeChord(fullChord, semitones);
      return part.replace(fullChord, transposed);
    }
    return part;
  }).join('');
};
