import { EXERCISES, SONGS, findItem, isExercise, type Song } from '../data/music';
import { emptyItem, type AppData, type ItemProgress } from '../store/appData';

export interface SessionItem {
  id: string;
  title: string;
  sub: string;
  minutes: number;
  /** Bars (0-based, inclusive) to loop when the item opens. */
  loop?: [number, number];
}

const progress = (data: AppData, id: string): ItemProgress => data.items[id] ?? emptyItem();
const mastered = (data: AppData, id: string) => progress(data, id).mastery >= 100;
const started = (data: AppData, id: string) => {
  const p = progress(data, id);
  return p.practicedSec > 0 || p.mastery > 0;
};
const byRecent = (data: AppData) => (a: Song, b: Song) =>
  (progress(data, b.id).lastActive ?? '').localeCompare(progress(data, a.id).lastActive ?? '');

export type ExerciseStatus = 0 | 1 | 2;
export const STATUS_LABELS = ['Ikke startet', 'I gang', 'Mestret'] as const;

export function exerciseStatus(data: AppData, id: string): ExerciseStatus {
  if (mastered(data, id)) return 2;
  return started(data, id) ? 1 : 0;
}

/** Unmastered songs, easiest first. Level 3 unlocks once a level-2 song is mastered. */
export function recommendations(data: AppData, exclude: string[] = [], count = 3): Song[] {
  const cap = SONGS.some((s) => s.level === 2 && mastered(data, s.id)) ? 3 : 2;
  return SONGS.filter((s) => !exclude.includes(s.id) && !mastered(data, s.id) && s.level <= cap)
    .sort((a, b) => a.level - b.level)
    .slice(0, count);
}

function sessionSong(data: AppData): Song {
  const active = SONGS.filter((s) => !mastered(data, s.id) && progress(data, s.id).lastActive).sort(byRecent(data));
  return active[0] ?? recommendations(data, [], 1)[0] ?? SONGS[0];
}

function sessionExercise(data: AppData) {
  const candidates = EXERCISES.filter((x) => x.id !== 'x1' && !mastered(data, x.id));
  const inProgress = candidates.filter((x) => started(data, x.id)).sort(byRecent(data));
  return inProgress[0] ?? candidates[0] ?? EXERCISES[EXERCISES.length - 1];
}

/** Warm-up, one technique exercise and a song section, built from progress. */
export function eveningSession(data: AppData): SessionItem[] {
  const warmup = EXERCISES[0];
  const exercise = sessionExercise(data);
  const song = sessionSong(data);
  const a = Math.floor(progress(data, song.id).lastBar / 4) * 4;
  const b = Math.min(a + 3, song.bars.length - 1);
  return [
    { id: warmup.id, title: warmup.title, sub: `Oppvarming · ${warmup.focus}`, minutes: 3 },
    { id: exercise.id, title: exercise.title, sub: `Teknikk · ${exercise.focus}`, minutes: 5 },
    { id: song.id, title: song.title, sub: `Låt · takt ${a + 1}–${b + 1} i loop`, minutes: 10, loop: [a, b] },
  ];
}

/** Most recently opened or practiced item, if any. */
export function lastActiveItem(data: AppData): { song: Song; progress: ItemProgress } | null {
  const entries = Object.entries(data.items).filter(([, p]) => p.lastActive);
  if (!entries.length) return null;
  entries.sort(([, a], [, b]) => (b.lastActive ?? '').localeCompare(a.lastActive ?? ''));
  for (const [id, p] of entries) {
    try {
      return { song: findItem(id), progress: p };
    } catch {
      // Stale id from an older catalogue; skip it.
    }
  }
  return null;
}

/** Songs (not exercises) that have been started but not mastered. */
export const songsInProgress = (data: AppData) =>
  SONGS.filter((s) => started(data, s.id) && !mastered(data, s.id));

/** Songs shown under "Låter du lærer": anything started, most progress first. */
export const learningSongs = (data: AppData) =>
  SONGS.filter((s) => started(data, s.id)).sort((a, b) => progress(data, b.id).mastery - progress(data, a.id).mastery);

const ONES = ['null', 'ett', 'to', 'tre', 'fire', 'fem', 'seks', 'sju', 'åtte', 'ni', 'ti', 'elleve', 'tolv', 'tretten', 'fjorten', 'femten', 'seksten', 'sytten', 'atten', 'nitten'];
const TENS = ['', '', 'tjue', 'tretti', 'førti', 'femti', 'seksti'];

/** Norwegian number word for 0–69 ("atten", "tjuefem"). */
export function numberWord(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  return n % 10 ? t + ONES[n % 10] : t;
}

export function homeLede(data: AppData, session: SessionItem[], dayPart: string): string {
  const total = session.reduce((s, x) => s + x.minutes, 0);
  const word = numberWord(total);
  const first = `${word[0].toUpperCase()}${word.slice(1)} rolige minutter i ${dayPart}.`;
  const last = lastActiveItem(data);
  if (!last) return `${first} Start med tommelen, så kommer resten av seg selv.`;
  const { song, progress: p } = last;
  if (isExercise(song)) return `${first} Sist øvde du på «${song.title}».`;
  if (p.mastery >= 100) return `${first} Du har mestret ${song.title}. Tid for en ny låt?`;
  if (p.mastery >= 60) return `${first} Du er snart gjennom ${song.title}.`;
  return `${first} Du er i gang med ${song.title}.`;
}
