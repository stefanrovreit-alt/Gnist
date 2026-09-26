import { useEffect, useRef, useState } from 'react';
import styles from './SettingsMenu.module.css';
import { appStore, type FretMode, type Settings } from '../../store/appData';

export function SettingsMenu({ settings }: { settings: Settings }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const set = (patch: Partial<Settings>) => appStore.updateSettings(patch);

  return (
    <div className={styles.root} ref={root}>
      <button
        className={styles.gear}
        aria-label="Visningsinnstillinger"
        aria-expanded={open}
        title="Visningsinnstillinger"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
          <path
            fill="currentColor"
            d="M19.4 13a7.7 7.7 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3.3h-4l-.4 2.6c-.6.3-1.2.6-1.7 1l-2.5-1-2 3.5L6.6 11a7.7 7.7 0 0 0 0 2l-2.2 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.6h4l.4-2.6c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5L19.4 13ZM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z"
            transform="translate(-1 0)"
          />
        </svg>
        Visning
      </button>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Visningsinnstillinger">
          <div className={styles.title}>Gripebrett</div>
          <div className={styles.segmented} role="group" aria-label="Markering">
            {(['Enkel', 'Detaljert'] as FretMode[]).map((m) => (
              <button key={m} className={styles.segment} aria-pressed={settings.fretMode === m} onClick={() => set({ fretMode: m })}>
                {m}
              </button>
            ))}
          </div>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.showFingerNumbers}
              onChange={(e) => set({ showFingerNumbers: e.target.checked })}
            />
            Vis fingernumre
          </label>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={settings.showRightHand}
              onChange={(e) => set({ showRightHand: e.target.checked })}
            />
            Vis høyrehånd (p i m a)
          </label>
          <label className={styles.range} data-disabled={settings.fretMode === 'Enkel' || undefined}>
            <span className={styles.rangeHead}>
              <span>Glød</span>
              <span className={styles.rangeValue}>{settings.glow.toFixed(1)}</span>
            </span>
            <input
              type="range"
              min={0.3}
              max={1.6}
              step={0.1}
              value={settings.glow}
              disabled={settings.fretMode === 'Enkel'}
              onChange={(e) => set({ glow: Number(e.target.value) })}
            />
          </label>
          <div className={styles.credit}>Gitarlyd: FluidR3 GM nylon (CC BY 3.0)</div>
        </div>
      )}
    </div>
  );
}
