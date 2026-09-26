import styles from './Home.module.css';
import { PATTERN_NAMES, LEVEL_NAMES, uniqueChords } from '../data/music';
import { useAppData } from '../store/appData';
import { eyebrowDate, greeting, partOfDay } from '../lib/dates';
import { eveningSession, homeLede, lastActiveItem, recommendations } from '../lib/session';
import type { MenuView, OpenItem } from '../nav';

interface Props {
  onOpen: OpenItem;
  onNavigate: (v: MenuView) => void;
}

export function Home({ onOpen, onNavigate }: Props) {
  const data = useAppData();
  const now = new Date();
  const session = eveningSession(data);
  const total = session.reduce((s, x) => s + x.minutes, 0);
  const last = lastActiveItem(data);
  const recs = recommendations(data, [session[2].id]);
  const openSession = (i: number) => onOpen({ id: session[i].id, bar: session[i].loop?.[0], loop: session[i].loop });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{eyebrowDate(now)}</div>
        <h1 className={styles.h1}>{greeting(now)}</h1>
        <p className={styles.lede}>{homeLede(data, session, partOfDay(now))}</p>
      </header>

      <div className={styles.grid}>
        <section className={styles.session}>
          <div className={styles.sessionHead}>
            <h2 className={styles.h2}>Kveldens økt</h2>
            <span className={styles.meta}>{total} MIN</span>
          </div>
          <div className={styles.rows}>
            {session.map((x, i) => (
              <button key={x.id} className={styles.row} onClick={() => openSession(i)}>
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{x.title}</span>
                  <span className={styles.rowSub}>{x.sub}</span>
                </span>
                <span className={styles.meta}>{x.minutes} MIN</span>
              </button>
            ))}
          </div>
          <button className={`btn-primary ${styles.start}`} onClick={() => openSession(0)}>
            Start økten
          </button>
        </section>

        <section className={styles.resume}>
          <div className={styles.halo} />
          <div className={styles.resumeEyebrow}>FORTSETT DER DU SLAPP</div>
          {last ? (
            <>
              <div className={styles.resumeTitleBlock}>
                <div className={styles.resumeTitle}>{last.song.title}</div>
                <div className={styles.resumeSub}>
                  {last.song.artist} · {PATTERN_NAMES[last.song.pattern]}
                </div>
              </div>
              <div className={styles.resumeProgress}>
                <div className={styles.resumeStats}>
                  <span>
                    Takt {last.progress.lastBar + 1} av {last.song.bars.length}
                  </span>
                  <span>{last.progress.lastTempo} % tempo</span>
                </div>
                <div className={styles.track}>
                  <div className={styles.fill} style={{ width: `${last.progress.mastery}%` }} />
                </div>
              </div>
              <button className={styles.ghost} onClick={() => onOpen({ id: last.song.id, bar: last.progress.lastBar })}>
                Fortsett
              </button>
            </>
          ) : (
            <>
              <div className={styles.resumeTitleBlock}>
                <div className={styles.resumeTitle}>Ingenting ennå</div>
                <div className={styles.resumeSub}>Når du har øvd på en låt, kan du plukke den opp igjen her.</div>
              </div>
              <button className={`${styles.ghost} ${styles.pushDown}`} onClick={() => onNavigate('lib')}>
                Åpne biblioteket
              </button>
            </>
          )}
        </section>
      </div>

      {recs.length > 0 && (
        <section className={styles.recs}>
          <h2 className={styles.h2Small}>Passer der du er nå</h2>
          <div className={styles.recGrid}>
            {recs.map((s) => (
              <button key={s.id} className={styles.rec} onClick={() => onOpen({ id: s.id })}>
                <span className={styles.recChords}>{uniqueChords(s).join(' ')}</span>
                <span className={styles.recText}>
                  <span className={styles.recTitle}>{s.title}</span>
                  <span className={styles.recSub}>
                    {s.artist} · {LEVEL_NAMES[s.level]}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
