// Chord shapes, picking patterns and the song/exercise catalogue.
// Strings are indexed 0 = high e … 5 = low E throughout the app.

export type StringIndex = 0 | 1 | 2 | 3 | 4 | 5;
export type Finger = 'p' | 'i' | 'm' | 'a';

export interface ChordShape {
  /** Fret per string: -1 muted, 0 open. */
  f: readonly number[];
  /** Fretting finger (1–4) per string, 0 when not fretted. */
  g: readonly number[];
  /** [root bass string, alternate bass string], both played by the thumb. */
  b: readonly [StringIndex, StringIndex];
}

export const CHORDS = {
  C: { f: [0, 1, 0, 2, 3, -1], g: [0, 1, 0, 2, 3, 0], b: [4, 3] },
  Cmaj7: { f: [0, 0, 0, 2, 3, -1], g: [0, 0, 0, 2, 3, 0], b: [4, 3] },
  Cadd9: { f: [0, 3, 0, 2, 3, -1], g: [0, 4, 0, 2, 3, 0], b: [4, 3] },
  G: { f: [3, 0, 0, 0, 2, 3], g: [3, 0, 0, 0, 1, 2], b: [5, 3] },
  Am: { f: [0, 1, 2, 2, 0, -1], g: [0, 1, 3, 2, 0, 0], b: [4, 3] },
  Am7: { f: [0, 1, 0, 2, 0, -1], g: [0, 1, 0, 2, 0, 0], b: [4, 3] },
  Em: { f: [0, 0, 0, 2, 2, 0], g: [0, 0, 0, 3, 2, 0], b: [5, 3] },
  Fmaj7: { f: [0, 1, 2, 3, -1, -1], g: [0, 1, 2, 3, 0, 0], b: [3, 3] },
  D: { f: [2, 3, 2, 0, -1, -1], g: [2, 3, 1, 0, 0, 0], b: [3, 3] },
  A: { f: [0, 2, 2, 2, 0, -1], g: [0, 3, 2, 1, 0, 0], b: [4, 3] },
  Asus2: { f: [0, 0, 2, 2, 0, -1], g: [0, 0, 3, 2, 0, 0], b: [4, 3] },
  Asus4: { f: [0, 3, 2, 2, 0, -1], g: [0, 4, 3, 2, 0, 0], b: [4, 3] },
  E: { f: [0, 0, 1, 2, 2, 0], g: [0, 0, 1, 3, 2, 0], b: [5, 3] },
  Bm7: { f: [2, 0, 2, 0, 2, -1], g: [3, 0, 2, 0, 1, 0], b: [4, 3] },
  Åpen: { f: [0, 0, 0, 0, 0, 0], g: [0, 0, 0, 0, 0, 0], b: [5, 4] },
} as const satisfies Record<string, ChordShape>;

export type ChordName = keyof typeof CHORDS;

/** Pattern token: 'b1'/'b2' = bass strings (thumb), 0/1/2 = e/B/G (a/m/i). */
type Token = 'b1' | 'b2' | 0 | 1 | 2;

export const PATTERNS = {
  travis: [['b1', 1], [2], ['b2'], [0], ['b1'], [1], ['b2'], [2]],
  arp: [['b1'], [2], [1], [0], [1], [2], ['b2'], [2]],
  pinch: [['b1', 0], [], ['b2', 1], [], ['b1', 0], [], ['b2', 1], []],
  thumb: [['b1'], [], ['b2'], [], ['b1'], [], ['b2'], []],
  pima: [['b1'], [2], [1], [0], ['b1'], [2], [1], [0]],
} as const satisfies Record<string, readonly (readonly Token[])[]>;

export type PatternId = keyof typeof PATTERNS;

export const PATTERN_NAMES: Record<PatternId, string> = {
  travis: 'Travis-picking',
  arp: 'Arpeggio',
  pinch: 'Pinch',
  thumb: 'Vekselbass',
  pima: 'p-i-m-a',
};

const TREBLE_FINGER: Record<0 | 1 | 2, Finger> = { 0: 'a', 1: 'm', 2: 'i' };

export const STEPS_PER_BAR = 8;

/** MIDI note of each open string, e (0) down to E (5). */
export const OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const;

export interface Note {
  s: StringIndex;
  fret: number;
  fg: Finger;
}

/** Expands a chord + pattern into 8 steps of notes. Notes on muted strings are dropped. */
export function buildBar(chordName: ChordName, pattern: PatternId): Note[][] {
  const ch: ChordShape = CHORDS[chordName];
  const steps: readonly (readonly Token[])[] = PATTERNS[pattern];
  return steps.map((step) =>
    step
      .map((tk): Note => {
        const s = (tk === 'b1' ? ch.b[0] : tk === 'b2' ? ch.b[1] : tk) as StringIndex;
        return { s, fret: ch.f[s], fg: typeof tk === 'string' ? 'p' : TREBLE_FINGER[tk] };
      })
      .filter((n) => n.fret >= 0),
  );
}

export const noteMidi = (n: Pick<Note, 's' | 'fret'>) => OPEN_MIDI[n.s] + n.fret;

/** Fingers a pattern uses, in first-use order (thumb first). */
export function patternFingers(pattern: PatternId): Finger[] {
  const tokens: readonly Token[] = (PATTERNS[pattern] as readonly (readonly Token[])[]).flat();
  return [...new Set(tokens.map((tk) => (typeof tk === 'string' ? 'p' : TREBLE_FINGER[tk])))];
}

export type Genre = 'Folk' | 'Klassisk' | 'Rock' | 'Metal' | 'Pop' | 'Teknikk';
export type Level = 1 | 2 | 3;

export const LEVEL_NAMES: Record<Level, string> = { 1: 'Nybegynner', 2: 'Litt øvd', 3: 'Utfordrende' };

export const GENRE_TONES: Record<Genre, string> = {
  Folk: '#6b4a2e',
  Klassisk: '#4f5a3c',
  Rock: '#7a3b22',
  Metal: '#2f2a26',
  Pop: '#85562a',
  Teknikk: '#5a4636',
};

export interface Song {
  id: string;
  title: string;
  artist: string;
  genre: Genre;
  level: Level;
  bpm: number;
  pattern: PatternId;
  bars: ChordName[];
}

export interface Exercise extends Song {
  genre: 'Teknikk';
  description: string;
  /** Short subtitle used in the evening session, after "Teknikk · ". */
  focus: string;
}

export const SONGS: Song[] = [
  { id: 'dust', title: 'Dust in the Wind', artist: 'Kansas', genre: 'Folk', level: 2, bpm: 96, pattern: 'travis', bars: ['C', 'Cmaj7', 'Cadd9', 'C', 'Asus2', 'Asus4', 'Asus2', 'Asus4'] },
  { id: 'canonc', title: 'Canon in C', artist: 'Pachelbel', genre: 'Klassisk', level: 1, bpm: 66, pattern: 'arp', bars: ['C', 'G', 'Am', 'Em', 'Fmaj7', 'C', 'Fmaj7', 'G'] },
  { id: 'canond', title: 'Canon in D', artist: 'Pachelbel', genre: 'Klassisk', level: 2, bpm: 66, pattern: 'arp', bars: ['D', 'A', 'Bm7', 'A', 'G', 'D', 'G', 'A'] },
  { id: 'nem', title: 'Nothing Else Matters', artist: 'Metallica', genre: 'Metal', level: 2, bpm: 69, pattern: 'arp', bars: ['Em', 'Em', 'Em', 'Em', 'D', 'C', 'Em', 'Em'] },
  { id: 'ftb', title: 'Fade to Black', artist: 'Metallica', genre: 'Metal', level: 3, bpm: 58, pattern: 'arp', bars: ['Am', 'C', 'G', 'Em', 'Am', 'C', 'G', 'Em'] },
  { id: 'roul', title: 'Roulette', artist: 'System of a Down', genre: 'Rock', level: 2, bpm: 76, pattern: 'pima', bars: ['Am', 'Fmaj7', 'C', 'G', 'Am', 'Fmaj7', 'C', 'E'] },
  { id: 'lonely', title: 'Lonely Day', artist: 'System of a Down', genre: 'Rock', level: 1, bpm: 80, pattern: 'arp', bars: ['Em', 'C', 'G', 'D', 'Em', 'C', 'G', 'D'] },
  { id: 'bb', title: 'Blackbird', artist: 'The Beatles', genre: 'Pop', level: 3, bpm: 92, pattern: 'pinch', bars: ['G', 'Am7', 'G', 'C', 'D', 'C', 'G', 'G'] },
  { id: 'tears', title: 'Tears in Heaven', artist: 'Eric Clapton', genre: 'Pop', level: 2, bpm: 80, pattern: 'arp', bars: ['A', 'E', 'Bm7', 'A', 'D', 'A', 'E', 'A'] },
  { id: 'hall', title: 'Hallelujah', artist: 'Leonard Cohen', genre: 'Folk', level: 1, bpm: 60, pattern: 'arp', bars: ['C', 'Am', 'C', 'Am', 'Fmaj7', 'G', 'C', 'G'] },
  { id: 'land', title: 'Landslide', artist: 'Fleetwood Mac', genre: 'Folk', level: 2, bpm: 80, pattern: 'travis', bars: ['C', 'G', 'Am', 'G', 'C', 'G', 'Am', 'G'] },
  { id: 'boxer', title: 'The Boxer', artist: 'Simon & Garfunkel', genre: 'Folk', level: 2, bpm: 100, pattern: 'travis', bars: ['C', 'Am', 'G', 'C', 'C', 'Am', 'G', 'C'] },
];

export const EXERCISES: Exercise[] = [
  { id: 'x1', title: 'Tommelen alene', artist: 'Øvelse', genre: 'Teknikk', level: 1, bpm: 70, pattern: 'thumb', bars: ['Em', 'Em', 'Am', 'Am', 'C', 'C', 'G', 'G'], description: 'Vekselbass med tommelen. Resten av hånden hviler lett.', focus: 'vekselbass' },
  { id: 'x2', title: 'p-i-m-a på tomme strenger', artist: 'Øvelse', genre: 'Teknikk', level: 1, bpm: 66, pattern: 'pima', bars: ['Åpen', 'Åpen', 'Åpen', 'Åpen', 'Em', 'Em', 'Em', 'Em'], description: 'Hver finger får sin streng. Ingen grep, bare flyt.', focus: 'én finger per streng' },
  { id: 'x3', title: 'Pinch', artist: 'Øvelse', genre: 'Teknikk', level: 1, bpm: 70, pattern: 'pinch', bars: ['C', 'C', 'G', 'G', 'Am', 'Am', 'Em', 'Em'], description: 'Tommel og finger plukker samtidig — grunnlaget for Blackbird.', focus: 'tommel og finger samtidig' },
  { id: 'x4', title: 'Arpeggio gjennom grep', artist: 'Øvelse', genre: 'Teknikk', level: 2, bpm: 66, pattern: 'arp', bars: ['C', 'C', 'Am', 'Am', 'Em', 'Em', 'G', 'G'], description: 'Samme mønster, nye grep. Øv på skiftene uten å stoppe.', focus: 'skift mellom grep' },
  { id: 'x5', title: 'Travis-picking', artist: 'Øvelse', genre: 'Teknikk', level: 2, bpm: 72, pattern: 'travis', bars: ['C', 'C', 'G', 'G', 'Am', 'Am', 'Fmaj7', 'G'], description: 'Vekselbass under en melodi. Nøkkelen til Dust in the Wind.', focus: 'vekselbass under melodi' },
];

const ALL: Song[] = [...SONGS, ...EXERCISES];

export function findItem(id: string): Song {
  const item = ALL.find((x) => x.id === id);
  if (!item) throw new Error(`Unknown song or exercise: ${id}`);
  return item;
}

export const isExercise = (s: Song): s is Exercise => s.genre === 'Teknikk';

/** Up to 5 unique chords, in order of appearance. */
export const uniqueChords = (s: Song) => [...new Set(s.bars)].slice(0, 5);

export const TUNING = [
  { name: 'E', sci: 'E2', hz: '82,41', midi: 40 },
  { name: 'A', sci: 'A2', hz: '110,00', midi: 45 },
  { name: 'D', sci: 'D3', hz: '146,83', midi: 50 },
  { name: 'G', sci: 'G3', hz: '196,00', midi: 55 },
  { name: 'B', sci: 'B3', hz: '246,94', midi: 59 },
  { name: 'e', sci: 'E4', hz: '329,63', midi: 64 },
] as const;
