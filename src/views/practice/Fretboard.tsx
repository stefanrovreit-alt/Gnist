import type { CSSProperties, ReactNode } from 'react';
import styles from './Fretboard.module.css';
import type { ChordShape, Note } from '../../data/music';
import type { Settings } from '../../store/appData';

const TOPS = [14, 28.4, 42.8, 57.2, 71.6, 86];
const THICKNESS = [1.2, 1.5, 1.9, 2.4, 2.9, 3.4];
const ACCENT = '#e8963f';

/** x position in the 5-fret window: whole numbers are fret wires, n.5 is mid-fret. */
const fretX = (pos: number) => `calc(61px + (100% - 133px) * ${pos / 5})`;

interface StringLook {
  height: number;
  color: string;
  shadow: string;
  openBorder: string;
  openBg: string;
  openShadow: string;
  rhBg: string;
  rhBorder: string;
  rhShadow: string;
}

interface DotLook {
  bg: string;
  scale: number;
  shadow: string;
}

function stringLook(i: number, fret: number, hit: boolean, s: Settings): StringLook {
  const openHit = hit && fret === 0;
  const rh = s.showRightHand && hit;
  if (s.fretMode === 'Enkel') {
    return {
      height: THICKNESS[i] + (hit ? 0.6 : 0),
      color: hit ? ACCENT : fret < 0 ? 'rgba(185,173,151,.25)' : 'rgba(207,196,174,.55)',
      shadow: hit ? '0 0 6px rgba(232,150,63,.45)' : 'none',
      openBorder: fret < 0 ? 'transparent' : openHit ? ACCENT : 'rgba(233,220,196,.35)',
      openBg: openHit ? ACCENT : fret < 0 ? 'transparent' : '#2e1d13',
      openShadow: 'none',
      rhBg: rh ? ACCENT : 'transparent',
      rhBorder: 'transparent',
      rhShadow: 'none',
    };
  }
  const gl = s.glow;
  return {
    height: THICKNESS[i] + (hit ? 1 : 0),
    color: hit ? '#ffd08a' : fret < 0 ? 'rgba(207,196,174,.3)' : '#cfc4ae',
    shadow: hit ? `0 0 ${10 * gl}px ${2 * gl}px rgba(255,170,80,${Math.min(1, 0.85 * gl)})` : '0 1px 1px rgba(0,0,0,.5)',
    openBorder: fret < 0 ? 'transparent' : openHit ? '#ffd08a' : '#e9dcc4',
    openBg: openHit ? '#ffb35c' : fret < 0 ? 'transparent' : '#2e1d13',
    openShadow: openHit ? `0 0 ${22 * gl}px ${6 * gl}px rgba(255,160,60,${Math.min(1, 0.6 * gl)})` : 'none',
    rhBg: rh ? '#ffb35c' : 'transparent',
    rhBorder: s.showRightHand ? (hit ? '#ffb35c' : 'rgba(233,220,196,.16)') : 'transparent',
    rhShadow: rh ? `0 0 ${18 * gl}px ${4 * gl}px rgba(255,160,60,${Math.min(1, 0.55 * gl)})` : 'none',
  };
}

function dotLook(hit: boolean, s: Settings): DotLook {
  if (s.fretMode === 'Enkel') {
    return { bg: hit ? ACCENT : '#efe2c8', scale: 1, shadow: '0 2px 6px rgba(0,0,0,.35)' };
  }
  const gl = s.glow;
  return hit
    ? {
        bg: '#ffb35c',
        scale: 1.18,
        shadow: `0 0 0 4px rgba(255,179,92,.25), 0 0 ${30 * gl}px ${8 * gl}px rgba(255,150,50,${Math.min(1, 0.7 * gl)})`,
      }
    : { bg: '#efe2c8', scale: 1, shadow: '0 3px 8px rgba(0,0,0,.45)' };
}

interface Props {
  chord: ChordShape;
  /** Notes sounding on the current step. */
  active: Note[];
  settings: Settings;
  /** Rendered at the left of the fret-number row (the settings button). */
  corner?: ReactNode;
}

export function Fretboard({ chord, active, settings, corner }: Props) {
  const hitBy = new Map<number, Note>(active.map((n) => [n.s, n]));

  return (
    <div className={styles.wrap}>
      <div className={styles.board} role="img" aria-label="Gripebrett">
        <div className={styles.grain} />
        <div className={styles.rightZone} />
        <div className={styles.inlay} style={{ left: fretX(2.5) }} />
        <div className={styles.inlay} style={{ left: fretX(4.5) }} />
        <div className={styles.nut} />
        {[1, 2, 3, 4].map((f) => (
          <div key={f} className={styles.fret} style={{ left: fretX(f) }} />
        ))}
        <div className={styles.fret} style={{ left: 'calc(100% - 72px)' }} />

        {TOPS.map((top, i) => {
          const fret = chord.f[i];
          const look = stringLook(i, fret, hitBy.has(i), settings);
          return (
            <div
              key={`s${i}`}
              className={styles.string}
              style={{ top: `${top}%`, height: look.height, background: look.color, boxShadow: look.shadow }}
            />
          );
        })}

        {TOPS.map((top, i) => {
          const fret = chord.f[i];
          if (fret > 0) return null;
          const look = stringLook(i, fret, hitBy.has(i), settings);
          const style: CSSProperties = {
            top: `${top}%`,
            borderColor: look.openBorder,
            background: look.openBg,
            boxShadow: look.openShadow,
          };
          return (
            <div key={`o${i}`} className={styles.open} style={style}>
              {fret < 0 ? '×' : ''}
            </div>
          );
        })}

        {chord.f.map((fret, i) => {
          if (fret <= 0) return null;
          const look = dotLook(hitBy.has(i), settings);
          return (
            <div
              key={`d${i}`}
              className={styles.dot}
              style={{
                left: fretX(fret - 0.5),
                top: `${TOPS[i]}%`,
                background: look.bg,
                boxShadow: look.shadow,
                transform: `translate(-50%,-50%) scale(${look.scale})`,
              }}
            >
              {settings.showFingerNumbers ? chord.g[i] : ''}
            </div>
          );
        })}

        {TOPS.map((top, i) => {
          const look = stringLook(i, chord.f[i], hitBy.has(i), settings);
          const note = hitBy.get(i);
          return (
            <div
              key={`r${i}`}
              className={styles.rightHand}
              style={{ top: `${top}%`, background: look.rhBg, borderColor: look.rhBorder, boxShadow: look.rhShadow }}
            >
              {settings.showRightHand && note ? note.fg : ''}
            </div>
          );
        })}
      </div>

      <div className={styles.numbers}>
        {corner && <div className={styles.corner}>{corner}</div>}
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className={styles.fretNum} style={{ left: fretX(n - 0.5) }}>
            {n}
          </span>
        ))}
        <span className={styles.rightLabel}>høyre</span>
      </div>
    </div>
  );
}
