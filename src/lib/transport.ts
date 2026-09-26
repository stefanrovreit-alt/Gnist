import { STEPS_PER_BAR } from '../data/music';

export interface Position {
  bar: number;
  step: number;
}

export interface Loop {
  on: boolean;
  a: number;
  b: number;
}

/** The step after pos: wraps to bar 0 after the last bar, or cycles A→B while looping. */
export function nextPosition(pos: Position, barCount: number, loop: Loop): Position {
  let step = pos.step + 1;
  let bar = pos.bar;
  if (step >= STEPS_PER_BAR) {
    step = 0;
    bar++;
    if (loop.on) {
      if (bar > loop.b || bar < loop.a) bar = loop.a;
    } else if (bar >= barCount) bar = 0;
  }
  return { bar, step };
}

/** Length of one 8th-note step in seconds. */
export const stepSeconds = (bpm: number, tempoPct: number) => 60 / (bpm * (tempoPct / 100)) / 2;
