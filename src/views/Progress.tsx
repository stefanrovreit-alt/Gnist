import styles from './Progress.module.css';
import { useAppData, emptyItem } from '../store/appData';
import { currentWeek, formatDuration, heatmap, streak, weekSeconds } from '../lib/stats';
import { learningSongs, songsInProgress } from '../lib/session';
import type { OpenItem } from '../nav';

const WEEKDAYS = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
const HEAT = ['var(--divider)', 'var(--heat-1)', 'var(--heat-2)', 'var(--amber-deep)'];
const BAR_MAX_PX = 110;

export function Progress({ onOpen }: { onOpen: OpenItem }) {
  const data = useAppData();
  const today = new Date();
  const days = streak(data.days, today);
  const week = currentWeek(data.days, today);
  const minutes = week.map((d) => Math.floor(d.seconds / 60));
  const maxMin = Math.max(1, ...minutes);
  const learning = learningSongs(data);

  const stats = [
    { v: String(days), l: days === 1 ? 'dag på rad' : 'dager på rad' },
    { v: formatDuration(weekSeconds(data.days, today)), l: 'øvd denne uka' },
    { v: String(songsInProgress(data).length), l: 'låter i gang' },
  ];

  return (
    <div className={styles.page}>
      <h1 className="h1">Fremdrift</h1>

      <div className={styles.stats}>
        {stats.map((s) => (
          <div key={s.l} className={styles.stat}>
            <span className={styles.statValue}>{s.v}</span>
            <span className={styles.statLabel}>{s.l}</span>
          </div>
        ))}
      </div>

      <div className={styles.charts}>
        <section className={styles.panel}>
          <h2 className={styles.h2}>Siste tolv uker</h2>
          <div className={styles.heat}>
            {heatmap(data.days, today).map((c) => (
              <div key={c.key} className={styles.cell} style={{ background: HEAT[c.level] }} title={c.key} />
            ))}
          </div>
          <div className={styles.legend}>
            Mindre
            {HEAT.map((bg) => (
              <span key={bg} className={styles.legendCell} style={{ background: bg }} />
            ))}
            Mer
          </div>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.h2}>Denne uka</h2>
          <div className={styles.bars}>
            {week.map((d, i) => {
              const m = minutes[i];
              return (
                <div key={i} className={styles.barCol}>
                  <span className={styles.barValue}>{d.isFuture ? '' : m}</span>
                  <div
                    className={styles.bar}
                    style={{
                      height: m ? Math.round((m / maxMin) * BAR_MAX_PX) : 3,
                      background: !m ? 'var(--divider)' : d.isToday ? 'var(--accent)' : 'var(--heat-2)',
                    }}
                  />
                  <span className={styles.barDay}>{WEEKDAYS[i]}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className={`${styles.panel} ${styles.learning}`}>
        <h2 className={`${styles.h2} ${styles.learningTitle}`}>Låter du lærer</h2>
        {learning.length === 0 && (
          <p className={styles.none}>Ingen låter i gang ennå. Åpne en låt i biblioteket og trykk play for å komme i gang.</p>
        )}
        {learning.map((s) => {
          const pct = (data.items[s.id] ?? emptyItem()).mastery;
          return (
            <button key={s.id} className={styles.row} onClick={() => onOpen({ id: s.id })}>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{s.title}</span>
                <span className={styles.rowSub}>{s.artist}</span>
              </span>
              <span className={styles.track}>
                <span className={styles.fill} style={{ width: `${pct}%` }} />
              </span>
              <span className={styles.pct}>{pct}%</span>
            </button>
          );
        })}
      </section>
    </div>
  );
}
