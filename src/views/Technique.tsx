import styles from './Technique.module.css';
import { EXERCISES, patternFingers } from '../data/music';
import { useAppData } from '../store/appData';
import { STATUS_LABELS, exerciseStatus } from '../lib/session';
import type { OpenItem } from '../nav';

export function Technique({ onOpen }: { onOpen: OpenItem }) {
  const data = useAppData();
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className="h1">Teknikk</h1>
        <p className={`lede ${styles.lede}`}>
          Fingerspill bygges nedenfra: tommelen først, så én finger av gangen. Hver øvelse tar under fem minutter.
        </p>
      </header>
      <div className={styles.grid}>
        {EXERCISES.map((x, i) => {
          const status = exerciseStatus(data, x.id);
          return (
            <div key={x.id} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.status} data-status={status}>
                  {STATUS_LABELS[status]}
                </span>
              </div>
              <div className={styles.text}>
                <div className={styles.title}>{x.title}</div>
                <div className={styles.desc}>{x.description}</div>
              </div>
              <div className={styles.fingers}>
                {patternFingers(x.pattern).map((f) => (
                  <span key={f} className={styles.finger}>
                    {f}
                  </span>
                ))}
              </div>
              <button className={`btn-outline ${styles.go}`} onClick={() => onOpen({ id: x.id })}>
                Øv nå
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
