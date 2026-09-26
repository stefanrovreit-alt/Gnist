const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. */
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() + n);
  return x;
}

/** Monday of the week containing d (weeks start on Monday in Norway). */
export function startOfWeek(d: Date): Date {
  return addDays(d, -((d.getDay() + 6) % 7));
}

/** e.g. "LØRDAG 26. SEPTEMBER" */
export function eyebrowDate(d: Date): string {
  const weekday = d.toLocaleDateString('nb-NO', { weekday: 'long' });
  const month = d.toLocaleDateString('nb-NO', { month: 'long' });
  return `${weekday} ${d.getDate()}. ${month}`.toUpperCase();
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h >= 5 && h < 10) return 'God morgen.';
  if (h >= 10 && h < 17) return 'God dag.';
  if (h >= 17 && h < 23) return 'God kveld.';
  return 'God natt.';
}

/** The word used in "… rolige minutter i {kveld}." */
export function partOfDay(d: Date): string {
  const h = d.getHours();
  if (h >= 5 && h < 10) return 'morgen';
  if (h >= 10 && h < 17) return 'dag';
  if (h >= 17 && h < 23) return 'kveld';
  return 'natt';
}
