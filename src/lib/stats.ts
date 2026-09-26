import { addDays, dayKey, startOfWeek } from './dates';

/** A day counts towards the streak after this much playback. */
export const STREAK_MIN_SEC = 5 * 60;

type Days = Record<string, number>;

const practiced = (days: Days, d: Date) => (days[dayKey(d)] ?? 0) >= STREAK_MIN_SEC;

/**
 * Consecutive practiced days ending today. If today isn't practiced yet the
 * streak is still alive and counts from yesterday.
 */
export function streak(days: Days, today: Date): number {
  let d = practiced(days, today) ? today : addDays(today, -1);
  let n = 0;
  while (practiced(days, d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export interface WeekDay {
  date: Date;
  seconds: number;
  practiced: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/** Monday–Sunday of the current week. */
export function currentWeek(days: Days, today: Date): WeekDay[] {
  const monday = startOfWeek(today);
  const todayKey = dayKey(today);
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    const key = dayKey(date);
    return {
      date,
      seconds: days[key] ?? 0,
      practiced: practiced(days, date),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    };
  });
}

export const weekSeconds = (days: Days, today: Date) =>
  currentWeek(days, today).reduce((sum, d) => sum + d.seconds, 0);

/** Heatmap level 0–3 from seconds practiced on a day. */
export function heatLevel(seconds: number): 0 | 1 | 2 | 3 {
  const min = seconds / 60;
  if (min < 1) return 0;
  if (min < 10) return 1;
  if (min < 20) return 2;
  return 3;
}

/**
 * 12 weeks × 7 days, column-major (each week Monday→Sunday), ending with the
 * current week. Days after today are level 0.
 */
export function heatmap(days: Days, today: Date): { key: string; level: 0 | 1 | 2 | 3 }[] {
  const first = addDays(startOfWeek(today), -7 * 11);
  const todayKey = dayKey(today);
  return Array.from({ length: 84 }, (_, i) => {
    const key = dayKey(addDays(first, i));
    return { key, level: key > todayKey ? 0 : heatLevel(days[key] ?? 0) };
  });
}

/** "1 t 37 min", "12 min", "0 min" */
export function formatDuration(seconds: number): string {
  const total = Math.floor(seconds / 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h} t ${m} min` : `${m} min`;
}
