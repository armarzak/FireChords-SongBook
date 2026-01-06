
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const STRINGS_STANDARD = ['E', 'A', 'D', 'G', 'B', 'E']; 

export interface ChordFormula {
  name: string;
  intervals: number[]; 
  labels: string[];    
}

export const CHORD_FORMULAS: Record<string, ChordFormula> = {
  'maj': { name: 'Major', intervals: [0, 4, 7], labels: ['R', '3', '5'] },
  'm': { name: 'Minor', intervals: [0, 3, 7], labels: ['R', 'b3', '5'] },
  '6': { name: 'Major 6', intervals: [0, 4, 7, 9], labels: ['R', '3', '5', '6'] },
  '7': { name: 'Dominant 7', intervals: [0, 4, 7, 10], labels: ['R', '3', '5', 'b7'] },
  'maj7': { name: 'Major 7', intervals: [0, 4, 7, 11], labels: ['R', '3', '5', '7'] },
  'm7': { name: 'Minor 7', intervals: [0, 3, 7, 10], labels: ['R', 'b3', '5', 'b7'] },
  'add9': { name: 'Added 9', intervals: [0, 4, 7, 2], labels: ['R', '3', '5', '9'] },
  'add11': { name: 'Added 11', intervals: [0, 4, 7, 5], labels: ['R', '3', '5', '11'] },
  'sus2': { name: 'Sus 2', intervals: [0, 2, 7], labels: ['R', '2', '5'] },
  'sus4': { name: 'Sus 4', intervals: [0, 5, 7], labels: ['R', '4', '5'] },
  '6sus2': { name: '6sus2', intervals: [0, 2, 7, 9], labels: ['R', '2', '5', '6'] },
};

export const getNoteAt = (stringRoot: string, fret: number): string => {
  const rootIdx = NOTES.indexOf(stringRoot);
  return NOTES[(rootIdx + fret) % 12];
};

export const getChordNotesOnFretboard = (root: string, type: string, maxFret: number = 15) => {
  const formula = CHORD_FORMULAS[type];
  if (!formula) return [];

  const targetNotes = formula.intervals.map(i => NOTES[(NOTES.indexOf(root) + i) % 12]);
  const results: { stringIdx: number, fret: number, note: string, label: string, isRoot: boolean }[] = [];

  STRINGS_STANDARD.forEach((stringNote, sIdx) => {
    for (let f = 0; f <= maxFret; f++) {
      const currentNote = getNoteAt(stringNote, f);
      const intervalIdx = targetNotes.indexOf(currentNote);
      if (intervalIdx !== -1) {
        results.push({
          stringIdx: sIdx, 
          fret: f,
          note: currentNote,
          label: formula.labels[intervalIdx],
          isRoot: currentNote === root
        });
      }
    }
  });

  return results;
};
