import styles from './TabGrid.module.css';
import type { ChordName, Note } from '../../data/music';
import type { Loop, Position } from '../../lib/transport';

interface Props {
  chords: ChordName[];
  bars: Note[][][];
  pos: Position;
  loop: Loop;
  onBarClick: (bar: number) => void;
}

const ROWS = [0, 1, 2, 3, 4, 5] as const;

export function TabGrid({ chords, bars, pos, loop, onBarClick }: Props) {
  return (
    <section className={styles.grid} aria-label="Tabulatur">
      {bars.map((steps, bi) => {
        const current = bi === pos.bar;
        const inLoop = loop.on && bi >= loop.a && bi <= loop.b;
        return (
          <div
            key={bi}
            role="button"
            tabIndex={0}
            aria-label={`Takt ${bi + 1}, ${chords[bi]}`}
            className={styles.bar}
            data-current={current || undefined}
            data-loop={inLoop || undefined}
            onClick={() => onBarClick(bi)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onBarClick(bi);
              }
            }}
          >
            <div className={styles.head}>
              <span>{bi + 1}</span>
              <span className={styles.chord}>{chords[bi]}</span>
            </div>
            {ROWS.map((r) => (
              <div key={r} className={styles.row}>
                {steps.map((notes, si) => {
                  const n = notes.find((x) => x.s === r);
                  const on = current && si === pos.step;
                  return (
                    <span key={si} className={styles.cell} data-on={on || undefined}>
                      {n && (
                        <span className={styles.num} data-on={on || undefined}>
                          {n.fret}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
