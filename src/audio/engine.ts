// Sample-based nylon guitar. One voice per string, like a real guitar: a new
// note on a string damps the note already ringing on it.

const SAMPLE_FIRST = 40;
const SAMPLE_LAST = 76;
const sampleUrl = (midi: number) => `${import.meta.env.BASE_URL}samples/nylon/${midi}.mp3`;

interface Voice {
  src: AudioBufferSourceNode;
  gain: GainNode;
}

export class GuitarEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private buffers = new Map<number, AudioBuffer>();
  private loading: Promise<void> | null = null;
  private voices: (Voice | null)[] = [null, null, null, null, null, null];
  muted = false;

  /** Creates the context (suspended until a user gesture) and starts loading samples. */
  context(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext({ latencyHint: 'interactive' });
      this.out = this.ctx.createGain();
      this.out.gain.value = 0.8;
      this.out.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  get now(): number {
    return this.context().currentTime;
  }

  load(): Promise<void> {
    if (this.loading) return this.loading;
    const ctx = this.context();
    const jobs: Promise<void>[] = [];
    for (let m = SAMPLE_FIRST; m <= SAMPLE_LAST; m++) {
      jobs.push(
        fetch(sampleUrl(m))
          .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`sample ${m}: ${r.status}`))))
          .then((ab) => ctx.decodeAudioData(ab))
          .then((buf) => void this.buffers.set(m, buf))
          .catch((e) => console.warn('[gnist] could not load sample', m, e)),
      );
    }
    this.loading = Promise.all(jobs).then(() => undefined);
    return this.loading;
  }

  /** Call from a user gesture (Play, bar click, tuner string) so audio may start. */
  async unlock(): Promise<void> {
    const ctx = this.context();
    if (ctx.state === 'suspended') await ctx.resume();
    await this.load();
  }

  /** Nearest loaded sample and the playback rate that shifts it to midi. */
  private sampleFor(midi: number): { buf: AudioBuffer; rate: number } | null {
    for (let d = 0; d <= 12; d++) {
      for (const m of d ? [midi - d, midi + d] : [midi]) {
        const buf = this.buffers.get(m);
        if (buf) return { buf, rate: Math.pow(2, (midi - m) / 12) };
      }
    }
    return null;
  }

  /**
   * Plays midi at `when` (context time). With a string index the previous note
   * on that string is damped at the same moment.
   */
  pluck(midi: number, velocity: number, when = 0, string?: number): void {
    if (this.muted) return;
    const ctx = this.context();
    const sample = this.sampleFor(midi);
    if (!sample || !this.out) return;
    const t = Math.max(when, ctx.currentTime);

    if (string != null) {
      const prev = this.voices[string];
      if (prev) {
        prev.gain.gain.setTargetAtTime(0, t, 0.015);
        prev.src.stop(t + 0.2);
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = sample.buf;
    src.playbackRate.value = sample.rate;
    const gain = ctx.createGain();
    gain.gain.value = velocity;
    src.connect(gain).connect(this.out);
    src.start(t);
    const voice = { src, gain };
    if (string != null) {
      this.voices[string] = voice;
      src.onended = () => {
        if (this.voices[string] === voice) this.voices[string] = null;
      };
    }
  }

  /** Damps everything that is ringing. */
  silence(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.voices.forEach((v, i) => {
      if (!v) return;
      v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.03);
      v.src.stop(ctx.currentTime + 0.3);
      this.voices[i] = null;
    });
  }
}

export const guitar = new GuitarEngine();
