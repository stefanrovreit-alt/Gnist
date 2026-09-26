// Downloads the FluidR3 GM nylon-string guitar samples (CC BY 3.0) used by the
// audio engine into public/samples/nylon/<midi>.mp3. Run once: npm run fetch-samples
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const BASE = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/acoustic_guitar_nylon-mp3/';
const OUT = new URL('../public/samples/nylon/', import.meta.url);
const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// E2 (low E string) up to E5 covers every note the chord shapes can reach.
const FIRST = 40;
const LAST = 76;

const noteName = (midi) => NAMES[midi % 12] + (Math.floor(midi / 12) - 1);

await mkdir(OUT, { recursive: true });
for (let midi = FIRST; midi <= LAST; midi++) {
  const target = new URL(`${midi}.mp3`, OUT);
  if (existsSync(target)) continue;
  const res = await fetch(BASE + noteName(midi) + '.mp3');
  if (!res.ok) throw new Error(`${noteName(midi)}: HTTP ${res.status}`);
  await writeFile(target, Buffer.from(await res.arrayBuffer()));
  console.log('fetched', midi, noteName(midi));
}
