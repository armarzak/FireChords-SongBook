
const chromaticScale = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const normalizationMap: { [key: string]: string } = {
  'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#',
  'Cb': 'B', 'Fb': 'E', 'E#': 'F', 'B#': 'C'
};

const sectionKeywords = 'Intro|Verse|Chorus|Bridge|Outro|Solo|Instrumental|Припев|Куплет|Вступление|Проигрыш|Кода|Соло';
const sectionRegex = new RegExp(`^\\s*[\\[\\(]?(${sectionKeywords})(?:\\s*\\d+)?[\\]\\)]?:?\\s*$`, 'i');

/** 
 * Улучшенное регулярное выражение.
 * (?![a-z]) гарантирует, что заглавная буква — это не начало обычного слова.
 * Также разрешаем типичные суффиксы аккордов.
 */
export const chordRegex = /\b[A-G][#b]?(?:m|maj|min|dim|aug|sus|add|M|7|9|11|13|[\d\/\+#b])*(?![a-z])\b/g;

/**
 * Проверка, является ли строка строкой с аккордами.
 */
export const isChordLine = (line: string): boolean => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (sectionRegex.test(trimmed)) return false;
  
  const chords = trimmed.match(chordRegex) || [];
  if (chords.length === 0) return false;
  
  // Строка считается текстовой, если в ней есть слова длиннее 2 букв,
  // которые НЕ являются аккордами.
  const words = trimmed.split(/\s+/).filter(w => w.length > 2);
  let nonChordWords = 0;
  
  for (const word of words) {
    if (!word.match(chordRegex)) {
      nonChordWords++;
    }
  }

  // Если обычных слов больше или столько же, сколько аккордов — скорее всего это текст (лирика)
  if (nonChordWords >= chords.length) return false;

  return true;
};

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
  
  return text.split('\n').map(line => {
    if (sectionRegex.test(line.trim())) return line;
    if (!isChordLine(line)) return line;
    
    return line.replace(chordRegex, (match) => transposeChord(match, semitones));
  }).join('\n');
};
