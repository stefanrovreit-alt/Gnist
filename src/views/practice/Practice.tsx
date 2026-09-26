import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './Practice.module.css';
import { CHORDS, PATTERN_NAMES, buildBar, findItem, isExercise, noteMidi, type StringIndex } from '../../data/music';
import { appStore, useAppData, emptyItem } from '../../store/appData';
import { guitar } from '../../audio/engine';
import { StepScheduler } from '../../audio/scheduler';
import { nextPosition, stepSeconds, type Loop, type Position } from '../../lib/transport';
import { MENU_LABEL, type MenuView, type OpenRequest } from '../../nav';
import { Fretboard } from './Fretboard';
import { TabGrid } from './TabGrid';
import { MasteryCard, VideoPanel } from './SidePanel';
import { SettingsMenu } from './SettingsMenu';

const BEATS = ['1', '&', '2', '&', '3', '&', '4', '&'];
const TEMPO_MIN = 40;
const TEMPO_MAX = 120;
/** How often playback time is written to progress while playing. */
const FLUSH_MS = 10_000;

interface Props {
  request: OpenRequest;
  from: MenuView;
  onBack: () => void;
}

export function Practice({ request, from, onBack }: Props) {
  const data = useAppData();
  const song = findItem(request.id);
  const bars = useMemo(() => song.bars.map((c) => buildBar(c, song.pattern)), [song]);
  const saved = data.items[song.id] ?? emptyItem();
  const lastBar = song.bars.length - 1;

  const [pos, setPos] = useState<Position>({ bar: Math.min(request.bar ?? 0, lastBar), step: 0 });
  const [playing, setPlaying] = useState(false);
  const [tempo, setTempo] = useState(saved.lastTempo);
  const [muted, setMuted] = useState(guitar.muted);
  const [loop, setLoop] = useState<Loop>(
    request.loop ? { on: true, a: request.loop[0], b: Math.min(request.loop[1], lastBar) } : { on: false, a: 0, b: 1 },
  );
  // 0 = next bar click sets A, 1 = next click sets B.
  const [pick, setPick] = useState<0 | 1>(0);

  const tempoRef = useRef(tempo);
  const loopRef = useRef(loop);
  tempoRef.current = tempo;
  loopRef.current = loop;

  const scheduler = useMemo(
    () =>
      new StepScheduler({
        now: () => guitar.now,
        stepSeconds: () => stepSeconds(song.bpm, tempoRef.current),
        next: (p) => nextPosition(p, bars.length, loopRef.current),
        schedule: (p, time) =>
          bars[p.bar][p.step].forEach((n) => guitar.pluck(noteMidi(n), n.fg === 'p' ? 0.85 : 0.6, time, n.s)),
        onStep: setPos,
      }),
    [song, bars],
  );

  useEffect(() => {
    appStore.markOpened(song.id);
    return () => scheduler.stop();
  }, [song.id, scheduler]);

  useEffect(() => {
    appStore.rememberPosition(song.id, pos.bar, tempo);
  }, [song.id, pos.bar, tempo]);

  // Count playback time towards today's practice and the item.
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const flush = () => {
      const now = performance.now();
      appStore.addPractice(song.id, Math.round((now - last) / 1000));
      last = now;
    };
    const id = setInterval(flush, FLUSH_MS);
    return () => {
      clearInterval(id);
      flush();
    };
  }, [playing, song.id]);

  const togglePlay = async () => {
    if (playing) {
      scheduler.stop();
      setPlaying(false);
      return;
    }
    await guitar.unlock();
    scheduler.start(pos);
    setPlaying(true);
  };

  const seek = (bar: number) => {
    const next = { bar, step: 0 };
    setPos(next);
    if (playing) scheduler.seek(next);
  };

  const strum = async (bar: number) => {
    await guitar.unlock();
    const ch = CHORDS[song.bars[bar]];
    const start = guitar.now;
    [5, 4, 3, 2, 1, 0].forEach((s, k) => {
      if (ch.f[s] >= 0) guitar.pluck(noteMidi({ s: s as StringIndex, fret: ch.f[s] }), 0.5, start + k * 0.028, s);
    });
  };

  const barClick = (i: number) => {
    if (!playing) void strum(i);
    if (!loop.on) return seek(i);
    if (pick === 0) {
      setLoop({ on: true, a: i, b: i });
      setPick(1);
      return seek(i);
    }
    const a = Math.min(loop.a, i);
    setLoop({ on: true, a, b: Math.max(loop.a, i) });
    setPick(0);
    seek(a);
  };

  const toggleLoop = () => {
    setLoop(loop.on ? { ...loop, on: false } : { on: true, a: pos.bar, b: Math.min(pos.bar + 1, lastBar) });
    setPick(0);
  };

  const toggleMute = () => {
    guitar.muted = !muted;
    if (guitar.muted) guitar.silence();
    setMuted(guitar.muted);
  };

  // Space plays/pauses, arrows step between bars.
  const keys = useRef({ togglePlay, seek, pos, lastBar });
  keys.current = { togglePlay, seek, pos, lastBar };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('input, textarea, [role="dialog"]') || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = keys.current;
      if (e.code === 'Space' && !t.closest('button, [role="button"]')) {
        e.preventDefault();
        void k.togglePlay();
      } else if (e.key === 'ArrowLeft') k.seek(Math.max(0, k.pos.bar - 1));
      else if (e.key === 'ArrowRight') k.seek((k.pos.bar + 1) % (k.lastBar + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const chordName = song.bars[pos.bar];
  const inLoop = (i: number) => loop.on && i >= loop.a && i <= loop.b;
  const exercise = isExercise(song);
  const meta = `${song.artist} · ${exercise ? '' : 'Forenklet arrangement · '}${PATTERN_NAMES[song.pattern]} · ${song.bpm} BPM`;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={onBack}>
        ← {MENU_LABEL[from === 'tune' ? 'lib' : from]}
      </button>

      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>{song.title}</h1>
          <div className={styles.meta}>{meta}</div>
        </div>
        <div className={styles.chips}>
          {song.bars.map((c, i) => (
            <button
              key={i}
              className={styles.chip}
              data-current={i === pos.bar || undefined}
              data-loop={inLoop(i) || undefined}
              aria-label={`Takt ${i + 1}, ${c}`}
              onClick={() => barClick(i)}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <Fretboard
        chord={CHORDS[chordName]}
        active={bars[pos.bar][pos.step]}
        settings={data.settings}
        corner={<SettingsMenu settings={data.settings} />}
      />

      <div className={styles.chordLine}>
        <div className={styles.chordNow}>
          <span className={styles.chordName}>{chordName}</span>
          <span className={styles.next}>neste: {song.bars[(pos.bar + 1) % song.bars.length]}</span>
        </div>
        <div className={styles.beats}>
          {BEATS.map((b, i) => (
            <span key={i} className={styles.beat} data-on={i === pos.step || undefined}>
              {b}
            </span>
          ))}
        </div>
        <p className={styles.hint}>Hold {chordName}-grepet med venstre hånd. Høyre hånd plukker strengene som lyser.</p>
      </div>

      <div className={styles.transport}>
        <button className={styles.round} aria-label="Forrige takt" onClick={() => seek(Math.max(0, pos.bar - 1))}>
          ⏮
        </button>
        <button className={styles.play} aria-label={playing ? 'Pause' : 'Spill'} onClick={() => void togglePlay()}>
          {playing ? (
            <>
              <span className={styles.pauseBar} />
              <span className={styles.pauseBar} />
            </>
          ) : (
            <span className={styles.playTriangle} />
          )}
        </button>
        <button className={styles.round} aria-label="Neste takt" onClick={() => seek((pos.bar + 1) % song.bars.length)}>
          ⏭
        </button>
        <div className={styles.tempo}>
          <div className={styles.tempoHead}>
            <span className={styles.tempoLabel}>Tempo {tempo} %</span>
            <span className={styles.bpm}>{Math.round((song.bpm * tempo) / 100)} BPM</span>
          </div>
          <input
            type="range"
            min={TEMPO_MIN}
            max={TEMPO_MAX}
            step={5}
            value={tempo}
            aria-label="Tempo"
            onChange={(e) => setTempo(Number(e.target.value))}
          />
        </div>
        <button className={styles.toggle} aria-pressed={loop.on} onClick={toggleLoop}>
          {loop.on ? `Loop takt ${loop.a + 1}–${loop.b + 1}` : 'Loop'}
        </button>
        <button className={styles.toggle} data-muted={muted || undefined} aria-pressed={!muted} onClick={toggleMute}>
          {muted ? 'Lyd av' : 'Lyd på'}
        </button>
        {loop.on && (
          <span className={styles.loopHint}>{pick ? 'Klikk sluttakten' : 'Klikk to takter for å velge ny loop'}</span>
        )}
      </div>

      <div className={styles.lower}>
        <TabGrid chords={song.bars} bars={bars} pos={pos} loop={loop} onBarClick={barClick} />
        <aside>
          <VideoPanel />
          <MasteryCard id={song.id} mastery={saved.mastery} />
        </aside>
      </div>
    </div>
  );
}
