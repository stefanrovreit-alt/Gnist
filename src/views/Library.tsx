import { useState } from 'react';
import styles from './Library.module.css';
import { GENRE_TONES, LEVEL_NAMES, PATTERN_NAMES, SONGS, uniqueChords, type Genre, type Level, type Song } from '../data/music';
import { appStore, useAppData } from '../store/appData';
import { filterSongs } from '../lib/library';
import type { OpenItem } from '../nav';

const GENRES: ('Alle' | Genre)[] = ['Alle', 'Folk', 'Klassisk', 'Rock', 'Metal', 'Pop'];
const LEVELS: [0 | Level, string][] = [
  [0, 'Alle nivåer'],
  [1, LEVEL_NAMES[1]],
  [2, LEVEL_NAMES[2]],
  [3, LEVEL_NAMES[3]],
];

export function Library({ onOpen }: { onOpen: OpenItem }) {
  const data = useAppData();
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState<'Alle' | Genre>('Alle');
  const [level, setLevel] = useState<0 | Level>(0);
  const songs = filterSongs(SONGS, q, genre, level);
  const wished = data.wishlist.some((w) => w.toLowerCase() === q.trim().toLowerCase());

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="h1">Bibliotek</h1>
        <input
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Søk etter låt, artist eller sjanger"
          aria-label="Søk"
        />
        <div className={styles.filters}>
          <div className={styles.chips}>
            {GENRES.map((g) => (
              <button key={g} className="chip" aria-pressed={genre === g} onClick={() => setGenre(g)}>
                {g}
              </button>
            ))}
          </div>
          <div className={styles.chips}>
            {LEVELS.map(([v, l]) => (
              <button key={v} className="chip" aria-pressed={level === v} onClick={() => setLevel(v)}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {songs.length > 0 && (
        <div className={styles.grid}>
          {songs.map((s) => (
            <SongCard key={s.id} song={s} onClick={() => onOpen({ id: s.id })} />
          ))}
        </div>
      )}

      {songs.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>
            {q.trim() ? <>Ingen treff på «{q.trim()}» ennå.</> : 'Ingen låter i dette utvalget ennå.'}
          </div>
          <p className={styles.emptyText}>
            {wished
              ? 'Lagt til i ønskelisten. Du får beskjed når et forenklet arrangement er klart.'
              : 'Vi lager forenklede fingerspill-arrangementer av låtene du ønsker deg.'}
          </p>
          {q.trim() && !wished && (
            <button className={`btn-primary ${styles.wish}`} onClick={() => appStore.addWish(q)}>
              Ønsk deg låten
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SongCard({ song, onClick }: { song: Song; onClick: () => void }) {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.band} style={{ background: GENRE_TONES[song.genre] }}>
        <span className={styles.pattern}>{PATTERN_NAMES[song.pattern].toUpperCase()}</span>
        <span className={styles.chords}>{uniqueChords(song).join(' ')}</span>
      </span>
      <span className={styles.body}>
        <span className={styles.titleBlock}>
          <span className={styles.title}>{song.title}</span>
          <span className={styles.artist}>{song.artist}</span>
        </span>
        <span className={styles.metaRow}>
          <span className={styles.meter} aria-hidden>
            {[1, 2, 3].map((n) => (
              <span key={n} className={styles.meterBar} data-on={song.level >= n || undefined} />
            ))}
          </span>
          {LEVEL_NAMES[song.level]}
          <span className={styles.bpm}>{song.bpm} BPM</span>
        </span>
      </span>
    </button>
  );
}
