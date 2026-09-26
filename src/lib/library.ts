import type { Genre, Level, Song } from '../data/music';

/** Live filter used by the library: genre, level and free text over title/artist/genre. */
export function filterSongs(songs: Song[], q: string, genre: 'Alle' | Genre, level: 0 | Level): Song[] {
  const needle = q.trim().toLowerCase();
  return songs.filter(
    (s) =>
      (genre === 'Alle' || s.genre === genre) &&
      (!level || s.level === level) &&
      (!needle || `${s.title} ${s.artist} ${s.genre}`.toLowerCase().includes(needle)),
  );
}
