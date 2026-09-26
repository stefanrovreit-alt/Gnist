import { useState } from 'react';
import styles from './SidePanel.module.css';
import { appStore } from '../../store/appData';

const ANGLES = ['Høyre hånd', 'Venstre hånd', 'Begge'] as const;

export function VideoPanel() {
  const [angle, setAngle] = useState<(typeof ANGLES)[number]>('Høyre hånd');
  return (
    <div className={styles.video}>
      <div className={styles.screen}>
        <span className={styles.playIcon}>
          <span className={styles.triangle} />
        </span>
        <span className={styles.caption}>video · {angle.toLowerCase()}</span>
      </div>
      <div className={styles.segmented} role="group" aria-label="Kameravinkel">
        {ANGLES.map((a) => (
          <button key={a} className={styles.segment} aria-pressed={a === angle} onClick={() => setAngle(a)}>
            {a}
          </button>
        ))}
      </div>
      <div className={styles.note}>Videoen følger tempoet og loopen din.</div>
    </div>
  );
}

/** Manual progress: the user decides how far along they are. */
export function MasteryCard({ id, mastery }: { id: string; mastery: number }) {
  const done = mastery >= 100;
  return (
    <div className={styles.mastery}>
      <div className={styles.masteryHead}>
        <span className={styles.masteryTitle}>Din fremdrift</span>
        <span className={styles.masteryPct}>{mastery} %</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={mastery}
        aria-label="Fremdrift i prosent"
        onChange={(e) => appStore.setMastery(id, Number(e.target.value))}
      />
      {done ? (
        <div className={styles.mastered}>
          <span className={styles.masteredPill}>Mestret</span>
          <button className={styles.link} onClick={() => appStore.setMastery(id, 90)}>
            Angre
          </button>
        </div>
      ) : (
        <button className={styles.markBtn} onClick={() => appStore.setMastery(id, 100)}>
          Marker som mestret
        </button>
      )}
    </div>
  );
}
