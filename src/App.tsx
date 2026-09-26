import { useState } from 'react';
import styles from './App.module.css';
import { Sidebar } from './components/Sidebar';
import { Home } from './views/Home';
import { Library } from './views/Library';
import { Technique } from './views/Technique';
import { Progress } from './views/Progress';
import { Tuner } from './views/Tuner';
import { Practice } from './views/practice/Practice';
import { findItem, isExercise } from './data/music';
import type { MenuView, OpenRequest, View } from './nav';

export function App() {
  const [view, setView] = useState<View>('home');
  const [from, setFrom] = useState<MenuView>('home');
  const [open, setOpen] = useState<(OpenRequest & { key: number }) | null>(null);

  const openItem = (req: OpenRequest) => {
    if (view !== 'play') setFrom(view);
    setOpen({ ...req, key: Date.now() });
    setView('play');
  };

  // In the practice view the menu highlights where the item belongs.
  const active: MenuView =
    view === 'play' && open
      ? isExercise(findItem(open.id))
        ? 'tech'
        : from === 'home'
          ? 'home'
          : 'lib'
      : (view as MenuView);

  return (
    <div className={styles.shell}>
      <Sidebar active={active} onNavigate={setView} />
      <main className={styles.main}>
        {view === 'home' && <Home onOpen={openItem} onNavigate={setView} />}
        {view === 'lib' && <Library onOpen={openItem} />}
        {view === 'tech' && <Technique onOpen={openItem} />}
        {view === 'prog' && <Progress onOpen={openItem} />}
        {view === 'tune' && <Tuner />}
        {view === 'play' && open && (
          <Practice key={open.key} request={open} from={from} onBack={() => setView(from)} />
        )}
      </main>
    </div>
  );
}
