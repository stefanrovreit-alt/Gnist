import { useSyncExternalStore } from 'react';
import { createLocalStore, type KeyValueStore } from './storage';
import { dayKey } from '../lib/dates';

export type FretMode = 'Enkel' | 'Detaljert';

export interface Settings {
  fretMode: FretMode;
  showFingerNumbers: boolean;
  showRightHand: boolean;
  /** Glow strength for the detailed fretboard mode, 0.3–1.6. */
  glow: number;
}

export interface ItemProgress {
  /** Manually set progress, 0–100. 100 means mastered. */
  mastery: number;
  lastBar: number;
  lastTempo: number;
  practicedSec: number;
  /** ISO timestamp of the last time the item was opened or practiced. */
  lastActive: string | null;
}

export interface AppData {
  version: 1;
  /** Seconds of playback per local day, keyed YYYY-MM-DD. */
  days: Record<string, number>;
  items: Record<string, ItemProgress>;
  wishlist: string[];
  settings: Settings;
}

export const DEFAULT_SETTINGS: Settings = {
  fretMode: 'Enkel',
  showFingerNumbers: true,
  showRightHand: true,
  glow: 1,
};

export const DEFAULT_TEMPO = 70;

export const emptyItem = (): ItemProgress => ({
  mastery: 0,
  lastBar: 0,
  lastTempo: DEFAULT_TEMPO,
  practicedSec: 0,
  lastActive: null,
});

const emptyData = (): AppData => ({
  version: 1,
  days: {},
  items: {},
  wishlist: [],
  settings: { ...DEFAULT_SETTINGS },
});

const KEY = 'data';

function normalize(raw: unknown): AppData {
  const base = emptyData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppData>;
  return {
    version: 1,
    days: { ...(r.days ?? {}) },
    items: Object.fromEntries(Object.entries(r.items ?? {}).map(([id, p]) => [id, { ...emptyItem(), ...p }])),
    wishlist: Array.isArray(r.wishlist) ? [...r.wishlist] : [],
    settings: { ...DEFAULT_SETTINGS, ...(r.settings ?? {}) },
  };
}

export function createAppStore(storage: KeyValueStore) {
  let data = normalize(storage.read(KEY));
  const listeners = new Set<() => void>();

  const commit = (next: AppData) => {
    data = next;
    storage.write(KEY, data);
    listeners.forEach((l) => l());
  };

  const updateItem = (id: string, fn: (p: ItemProgress) => ItemProgress) =>
    commit({ ...data, items: { ...data.items, [id]: fn(data.items[id] ?? emptyItem()) } });

  return {
    get: () => data,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    item: (id: string): ItemProgress => data.items[id] ?? emptyItem(),

    /** Adds playback time to today's total and to the item. */
    addPractice(id: string, seconds: number, now = new Date()) {
      if (seconds <= 0) return;
      const key = dayKey(now);
      const item = data.items[id] ?? emptyItem();
      commit({
        ...data,
        days: { ...data.days, [key]: (data.days[key] ?? 0) + seconds },
        items: {
          ...data.items,
          [id]: { ...item, practicedSec: item.practicedSec + seconds, lastActive: now.toISOString() },
        },
      });
    },
    markOpened(id: string, now = new Date()) {
      updateItem(id, (p) => ({ ...p, lastActive: now.toISOString() }));
    },
    rememberPosition(id: string, lastBar: number, lastTempo: number) {
      const p = data.items[id] ?? emptyItem();
      if (p.lastBar === lastBar && p.lastTempo === lastTempo) return;
      updateItem(id, (p) => ({ ...p, lastBar, lastTempo }));
    },
    setMastery(id: string, mastery: number) {
      updateItem(id, (p) => ({ ...p, mastery: Math.max(0, Math.min(100, Math.round(mastery))) }));
    },
    addWish(query: string) {
      const q = query.trim();
      if (!q || data.wishlist.some((w) => w.toLowerCase() === q.toLowerCase())) return;
      commit({ ...data, wishlist: [...data.wishlist, q] });
    },
    updateSettings(patch: Partial<Settings>) {
      commit({ ...data, settings: { ...data.settings, ...patch } });
    },
  };
}

export type AppStore = ReturnType<typeof createAppStore>;

export const appStore = createAppStore(createLocalStore());

export function useAppData(): AppData {
  return useSyncExternalStore(appStore.subscribe, appStore.get);
}
