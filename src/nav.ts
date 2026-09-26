export type View = 'home' | 'lib' | 'tech' | 'prog' | 'tune' | 'play';
export type MenuView = Exclude<View, 'play'>;

export interface OpenRequest {
  id: string;
  bar?: number;
  /** Start with this loop (0-based bars, inclusive). */
  loop?: [number, number];
}

export type OpenItem = (req: OpenRequest) => void;

export const MENU: { id: MenuView; label: string }[] = [
  { id: 'home', label: 'Hjem' },
  { id: 'lib', label: 'Bibliotek' },
  { id: 'tech', label: 'Teknikk' },
  { id: 'prog', label: 'Fremdrift' },
  { id: 'tune', label: 'Stemmer' },
];

export const MENU_LABEL = Object.fromEntries(MENU.map((m) => [m.id, m.label])) as Record<MenuView, string>;
