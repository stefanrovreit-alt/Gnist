import { useEffect, useRef, useState } from 'react';
import styles from './Tuner.module.css';
import { TUNING } from '../data/music';
import { guitar } from '../audio/engine';

const TICKS = Array.from({ length: 21 }, (_, i) => (i - 10) * 5);

// The needle is simulated for now: it starts off-pitch and settles towards 0.
// Swap this for microphone pitch detection (getUserMedia + YIN) later.
export function Tuner() {
  const [selected, setSelected] = useState(0);
  const [cents, setCents] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const pick = (i: number, sound: boolean) => {
    if (sound) void guitar.unlock().then(() => guitar.pluck(TUNING[i].midi, 0.8));
    setSelected(i);
    setCents((Math.random() > 0.5 ? 1 : -1) * (16 + Math.random() * 30));
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setCents((c) => {
        const next = c * 0.87 + (Math.random() - 0.5) * 1.4;
        if (Math.abs(next) < 0.9) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return next;
      });
    }, 150);
  };

  useEffect(() => {
    pick(0, false);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const inTune = Math.abs(cents) < 2;
  const color = inTune ? 'var(--green)' : 'var(--glow)';
  const s = TUNING[selected];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="h1">Stemmer</h1>
        <p className="lede">Velg en streng for å høre referansetonen, og stem etter øret. Mikrofonlytting kommer i en senere versjon.</p>
      </header>
      <section className={styles.panel}>
        <div className={styles.note}>
          <span className={styles.noteName}>{s.name}</span>
          <span className={styles.hz}>
            {s.sci} · {s.hz} Hz
          </span>
        </div>
        <div className={styles.gauge}>
          {TICKS.map((k) => (
            <div key={k} className={styles.tick} style={{ transform: `rotate(${k * 1.8}deg)` }}>
              <div
                style={{
                  width: 2,
                  height: k % 25 === 0 ? 18 : 9,
                  borderRadius: 1,
                  background: k === 0 ? 'var(--green)' : 'rgba(233,220,196,.45)',
                }}
              />
            </div>
          ))}
          <div
            className={styles.needle}
            style={{
              transform: `rotate(${Math.max(-50, Math.min(50, cents)) * 1.8}deg)`,
              background: color,
              boxShadow: `0 0 16px ${inTune ? '#9fb07a' : '#ffb35c'}`,
            }}
          />
          <div className={styles.hub} />
        </div>
        <div className={styles.status}>
          <span className={styles.statusText} style={{ color }}>
            {inTune ? 'Stemt' : cents < 0 ? 'Litt lavt — stram strengen' : 'Litt høyt — slakk strengen'}
          </span>
          <span className={styles.cents}>
            {cents > 0 ? '+' : ''}
            {cents.toFixed(1)} cent
          </span>
        </div>
        <div className={styles.strings}>
          {TUNING.map((t, i) => (
            <button
              key={t.sci}
              className={styles.string}
              aria-pressed={i === selected}
              aria-label={`${t.sci}, spill referansetone`}
              onClick={() => pick(i, true)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
