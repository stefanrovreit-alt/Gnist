// Persistence boundary. Everything the app saves goes through a KeyValueStore,
// so the local implementation can later be swapped for a database-backed one.

export interface KeyValueStore {
  read(key: string): unknown;
  write(key: string, value: unknown): void;
}

export function createLocalStore(prefix = 'gnist:'): KeyValueStore {
  return {
    read(key) {
      try {
        const raw = localStorage.getItem(prefix + key);
        return raw == null ? null : JSON.parse(raw);
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(prefix + key, JSON.stringify(value));
      } catch {
        // Storage full or unavailable: keep running with in-memory state.
      }
    },
  };
}

export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>();
  return {
    read: (key) => (map.has(key) ? JSON.parse(map.get(key)!) : null),
    write: (key, value) => void map.set(key, JSON.stringify(value)),
  };
}
