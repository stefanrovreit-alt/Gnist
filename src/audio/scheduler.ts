// Lookahead scheduler: a timer schedules audio slightly ahead on the
// AudioContext clock, and an animation frame loop publishes each step to the
// UI at the moment it actually sounds.

import type { Position } from '../lib/transport';

const LOOKAHEAD_SEC = 0.12;
const TIMER_MS = 25;

export interface SchedulerHooks {
  now(): number;
  /** Seconds per step; read each step so tempo changes apply immediately. */
  stepSeconds(): number;
  next(pos: Position): Position;
  schedule(pos: Position, time: number): void;
  onStep(pos: Position): void;
}

export class StepScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private raf = 0;
  private nextTime = 0;
  private current: Position = { bar: 0, step: 0 };
  private queue: { pos: Position; time: number }[] = [];

  constructor(private hooks: SchedulerHooks) {}

  get running() {
    return this.timer != null;
  }

  start(from: Position) {
    this.stop();
    this.seek(from);
    this.timer = setInterval(this.tick, TIMER_MS);
    this.tick();
    this.raf = requestAnimationFrame(this.frame);
  }

  /** Jump to a position; the next scheduled step is pos itself. */
  seek(pos: Position) {
    this.queue = [];
    this.current = pos;
    this.nextTime = this.hooks.now() + 0.03;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    cancelAnimationFrame(this.raf);
    this.queue = [];
  }

  private tick = () => {
    const horizon = this.hooks.now() + LOOKAHEAD_SEC;
    while (this.nextTime < horizon) {
      this.hooks.schedule(this.current, this.nextTime);
      this.queue.push({ pos: this.current, time: this.nextTime });
      this.nextTime += this.hooks.stepSeconds();
      this.current = this.hooks.next(this.current);
    }
  };

  private frame = () => {
    const now = this.hooks.now();
    let due: Position | null = null;
    while (this.queue.length && this.queue[0].time <= now) due = this.queue.shift()!.pos;
    if (due) this.hooks.onStep(due);
    if (this.timer) this.raf = requestAnimationFrame(this.frame);
  };
}
