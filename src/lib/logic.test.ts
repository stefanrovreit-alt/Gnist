import { describe, expect, it } from 'vitest';
import { EXERCISES, SONGS, buildBar, noteMidi, patternFingers } from '../data/music';
import { nextPosition, stepSeconds } from './transport';
import { currentWeek, formatDuration, heatmap, streak, STREAK_MIN_SEC } from './stats';
import { eveningSession, exerciseStatus, homeLede, lastActiveItem, numberWord, recommendations } from './session';
import { filterSongs } from './library';
import { createAppStore } from '../store/appData';
import { createMemoryStore } from '../store/storage';
import { dayKey, eyebrowDate, greeting, startOfWeek } from './dates';

const at = (iso: string) => new Date(iso);

describe('buildBar', () => {
  it('expands travis picking over C: bass + B string on the first step', () => {
    const bar = buildBar('C', 'travis');
    expect(bar).toHaveLength(8);
    expect(bar[0]).toEqual([
      { s: 4, fret: 3, fg: 'p' },
      { s: 1, fret: 1, fg: 'm' },
    ]);
    expect(bar[3]).toEqual([{ s: 0, fret: 0, fg: 'a' }]);
  });

  it('drops notes on muted strings', () => {
    // D is xx0232: bass strings 3/3 are playable, but nothing lands on 4 or 5.
    const notes = buildBar('D', 'arp').flat();
    expect(notes.every((n) => n.s <= 3)).toBe(true);
  });

  it('maps notes to MIDI from the open strings', () => {
    expect(noteMidi({ s: 5, fret: 0 })).toBe(40);
    expect(noteMidi({ s: 4, fret: 3 })).toBe(48);
  });

  it('lists the fingers a pattern uses', () => {
    expect(patternFingers('thumb')).toEqual(['p']);
    expect(patternFingers('pima')).toEqual(['p', 'i', 'm', 'a']);
  });
});

describe('transport', () => {
  const off = { on: false, a: 0, b: 1 };

  it('advances steps and wraps to bar 0 after the last bar', () => {
    expect(nextPosition({ bar: 0, step: 3 }, 8, off)).toEqual({ bar: 0, step: 4 });
    expect(nextPosition({ bar: 0, step: 7 }, 8, off)).toEqual({ bar: 1, step: 0 });
    expect(nextPosition({ bar: 7, step: 7 }, 8, off)).toEqual({ bar: 0, step: 0 });
  });

  it('cycles A→B while looping', () => {
    const loop = { on: true, a: 2, b: 3 };
    expect(nextPosition({ bar: 2, step: 7 }, 8, loop)).toEqual({ bar: 3, step: 0 });
    expect(nextPosition({ bar: 3, step: 7 }, 8, loop)).toEqual({ bar: 2, step: 0 });
    expect(nextPosition({ bar: 6, step: 7 }, 8, loop)).toEqual({ bar: 2, step: 0 });
  });

  it('uses 8th notes at the scaled tempo', () => {
    expect(stepSeconds(60, 100)).toBeCloseTo(0.5);
    expect(stepSeconds(96, 50)).toBeCloseTo(0.625);
  });
});

describe('dates', () => {
  it('formats the Norwegian eyebrow and greeting', () => {
    expect(eyebrowDate(at('2026-09-26T20:00:00'))).toBe('LØRDAG 26. SEPTEMBER');
    expect(greeting(at('2026-09-26T20:00:00'))).toBe('God kveld.');
    expect(greeting(at('2026-09-26T07:00:00'))).toBe('God morgen.');
  });

  it('starts weeks on Monday', () => {
    expect(dayKey(startOfWeek(at('2026-09-27T12:00:00')))).toBe('2026-09-21');
  });
});

describe('stats', () => {
  const today = at('2026-09-26T20:00:00');
  const full = STREAK_MIN_SEC;

  it('counts the streak through yesterday when today is not done yet', () => {
    const days = { '2026-09-23': full, '2026-09-24': full, '2026-09-25': full };
    expect(streak(days, today)).toBe(3);
    expect(streak({ ...days, '2026-09-26': full }, today)).toBe(4);
  });

  it('breaks the streak on a short day', () => {
    expect(streak({ '2026-09-24': full, '2026-09-25': 60 }, today)).toBe(0);
  });

  it('builds the current week and a 12-week heatmap ending this week', () => {
    const week = currentWeek({ '2026-09-26': 1200 }, today);
    expect(week[5]).toMatchObject({ isToday: true, practiced: true, seconds: 1200 });
    expect(week[6].isFuture).toBe(true);
    const cells = heatmap({ '2026-09-26': 1200 }, today);
    expect(cells).toHaveLength(84);
    expect(cells[82]).toEqual({ key: '2026-09-26', level: 3 });
  });

  it('formats durations like the design', () => {
    expect(formatDuration(97 * 60)).toBe('1 t 37 min');
    expect(formatDuration(12 * 60 + 30)).toBe('12 min');
  });
});

describe('app store', () => {
  it('persists practice, position, mastery, wishes and settings', () => {
    const storage = createMemoryStore();
    const store = createAppStore(storage);
    const now = at('2026-09-26T20:00:00');
    store.addPractice('dust', 90, now);
    store.addPractice('dust', 30, now);
    store.rememberPosition('dust', 2, 80);
    store.setMastery('dust', 140);
    store.addWish('Slayer');
    store.addWish('slayer ');
    store.updateSettings({ fretMode: 'Detaljert' });

    const reloaded = createAppStore(storage).get();
    expect(reloaded.days['2026-09-26']).toBe(120);
    expect(reloaded.items.dust).toMatchObject({ practicedSec: 120, lastBar: 2, lastTempo: 80, mastery: 100 });
    expect(reloaded.wishlist).toEqual(['Slayer']);
    expect(reloaded.settings).toMatchObject({ fretMode: 'Detaljert', showFingerNumbers: true });
  });
});

describe('session', () => {
  const fresh = createAppStore(createMemoryStore());

  it('starts a new user on the warm-up, the next exercise and an easy song', () => {
    const s = eveningSession(fresh.get());
    expect(s.map((x) => x.id)).toEqual(['x1', 'x2', 'canonc']);
    expect(s[2]).toMatchObject({ sub: 'Låt · takt 1–4 i loop', loop: [0, 3] });
    expect(homeLede(fresh.get(), s, 'kveld')).toMatch(/^Atten rolige minutter i kveld\./);
    expect(lastActiveItem(fresh.get())).toBeNull();
  });

  it('follows the song and exercise in progress', () => {
    const store = createAppStore(createMemoryStore());
    store.addPractice('x3', 60, at('2026-09-25T20:00:00'));
    store.addPractice('dust', 60, at('2026-09-26T20:00:00'));
    store.rememberPosition('dust', 5, 70);
    store.setMastery('dust', 70);
    const data = store.get();
    const s = eveningSession(data);
    expect(s[1].id).toBe('x3');
    expect(s[2]).toMatchObject({ id: 'dust', sub: 'Låt · takt 5–8 i loop' });
    expect(homeLede(data, s, 'kveld')).toContain('Du er snart gjennom Dust in the Wind.');
    expect(exerciseStatus(data, 'x3')).toBe(1);
    expect(exerciseStatus(data, 'x4')).toBe(0);
  });

  it('recommends easy unmastered songs and unlocks level 3 later', () => {
    const store = createAppStore(createMemoryStore());
    expect(recommendations(store.get()).map((s) => s.level)).toEqual([1, 1, 1]);
    expect(recommendations(store.get(), [], 99).some((s) => s.level === 3)).toBe(false);
    store.setMastery('nem', 100);
    expect(recommendations(store.get(), [], 99).some((s) => s.level === 3)).toBe(true);
  });

  it('spells numbers in Norwegian', () => {
    expect(numberWord(18)).toBe('atten');
    expect(numberWord(25)).toBe('tjuefem');
    expect(numberWord(30)).toBe('tretti');
  });
});

describe('library filter', () => {
  it('filters on text, genre and level', () => {
    expect(filterSongs(SONGS, 'metallica', 'Alle', 0).map((s) => s.id)).toEqual(['nem', 'ftb']);
    expect(filterSongs(SONGS, '', 'Folk', 1).map((s) => s.id)).toEqual(['hall']);
    expect(filterSongs(SONGS, 'slayer', 'Alle', 0)).toEqual([]);
  });

  it('keeps exercises out of the library', () => {
    expect(filterSongs(SONGS, 'øvelse', 'Alle', 0)).toEqual([]);
    expect(EXERCISES).toHaveLength(5);
  });
});
