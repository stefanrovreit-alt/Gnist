import styles from './Sidebar.module.css';
import { MENU, type MenuView } from '../nav';
import { useAppData } from '../store/appData';
import { currentWeek, streak } from '../lib/stats';

const DAY_LETTERS = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

interface Props {
  active: MenuView;
  onNavigate: (v: MenuView) => void;
}

export function Sidebar({ active, onNavigate }: Props) {
  const data = useAppData();
  const today = new Date();
  const days = streak(data.days, today);
  const week = currentWeek(data.days, today);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.spark} />
        <span className={styles.wordmark}>Gnist</span>
      </div>
      <nav className={styles.nav}>
        {MENU.map((m) => (
          <button
            key={m.id}
            className={styles.navItem}
            aria-current={active === m.id ? 'page' : undefined}
            onClick={() => onNavigate(m.id)}
          >
            <span className={styles.navBar} />
            {m.label}
          </button>
        ))}
      </nav>
      <div className={styles.streak}>
        <div className={styles.streakHead}>
          <span className={styles.streakNum}>{days}</span>
          <span className={styles.streakLabel}>{days === 1 ? 'dag på rad' : 'dager på rad'}</span>
        </div>
        <div className={styles.week}>
          {week.map((d, i) => (
            <div key={i} className={styles.day}>
              <span
                className={styles.dot}
                data-practiced={d.practiced || undefined}
                data-today={d.isToday || undefined}
                title={d.date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
              />
              <span className={styles.dayLetter}>{DAY_LETTERS[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
