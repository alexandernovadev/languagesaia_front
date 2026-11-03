/**
 * Sound engine — every Glota sound is synthesized with the Web Audio API.
 * No audio files: tiny, instant, and tuned to the design system.
 *
 * - Off by default (browsers block audio until the user interacts anyway).
 * - The on/off choice and the volume persist in localStorage.
 * - `voice` is a pitch multiplier, so each robot hero "speaks" with its own voice
 *   (Bruno 0.62 deep → Menti 1.6 squeaky).
 *
 * @example
 *   import { sound, useSoundEnabled } from "../lib/sound";
 *   sound.play("correct");
 *   sound.play("happy", { voice: 1.32 }); // Nubo celebrating
 *   const [enabled, setEnabled] = useSoundEnabled();
 */
import { useSyncExternalStore } from "react";

export type UiSound = "tap" | "correct" | "wrong" | "combo" | "flip" | "levelup" | "ready";
export type MoodSound = "wave" | "happy" | "party" | "think" | "sad" | "sleep";
export type SoundName = UiSound | MoodSound;

const STORAGE_KEY = "lai.sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = read("enabled", false);
let volume = read("volume", 0.5);
const listeners = new Set<() => void>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(`${STORAGE_KEY}.${key}`, JSON.stringify(value));
  } catch {
    /* private mode: keep it in memory */
  }
}

function ensure(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type ToneOpts = { type?: OscillatorType; gain?: number; glide?: number };

function tone(v: number, freq: number, start: number, dur: number, { type = "sine", gain = 0.22, glide = 0 }: ToneOpts = {}) {
  if (!ctx || !master) return;
  const f = freq * v;
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(start: number, dur: number, { from = 600, to = 3500, gain = 0.12 } = {}) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + start;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(from, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + dur * 0.3);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur);
}

function thud(v: number, start: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(140 * v, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  g.gain.setValueAtTime(0.25, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + 0.16);
}

const SOUNDS: Record<SoundName, (v: number) => void> = {
  // UI
  tap: (v) => tone(v, 880, 0, 0.06, { gain: 0.18, glide: 0.7 }),
  correct: (v) => {
    tone(v, 784, 0, 0.14, { type: "triangle", gain: 0.28 });
    tone(v, 1175, 0.09, 0.22, { type: "triangle", gain: 0.26 });
    tone(v, 2350, 0.09, 0.18, { gain: 0.05 });
  },
  wrong: (v) => {
    tone(v, 330, 0, 0.16, { gain: 0.22 });
    tone(v, 262, 0.13, 0.26, { gain: 0.2, glide: 0.96 });
  },
  combo: (v) => [659, 784, 988, 1319].forEach((f, i) => tone(v, f, i * 0.06, 0.16, { type: "triangle", gain: 0.22 })),
  flip: () => noise(0, 0.22),
  levelup: (v) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(v, f, i * 0.09, 0.3, { type: "triangle", gain: 0.22 }));
    tone(v, 1568, 0.4, 0.5, { gain: 0.1 });
    tone(v, 2093, 0.48, 0.5, { gain: 0.06 });
  },
  ready: (v) => {
    tone(v, 1047, 0, 0.35, { gain: 0.16 });
    tone(v, 1568, 0.12, 0.45, { gain: 0.1 });
  },
  // Robot moods
  wave: (v) => {
    tone(v, 660, 0, 0.09, { type: "square", gain: 0.05 });
    tone(v, 990, 0.1, 0.12, { type: "square", gain: 0.05 });
    tone(v, 1320, 0.2, 0.1, { type: "square", gain: 0.04 });
  },
  happy: (v) => {
    tone(v, 300, 0, 0.14, { gain: 0.12, glide: 2.4 });
    tone(v, 784, 0.3, 0.14, { type: "triangle" });
    tone(v, 1175, 0.39, 0.22, { type: "triangle" });
    thud(v, 0.62);
  },
  party: (v) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(v, f, i * 0.09, 0.3, { type: "triangle", gain: 0.18 }));
    tone(v, 220, 0, 0.9, { type: "sawtooth", gain: 0.025, glide: 2 });
  },
  think: (v) => [0, 0.12, 0.24].forEach((s, i) => tone(v, 1200 + i * 200, s, 0.05, { type: "square", gain: 0.035 })),
  sad: (v) => {
    tone(v, 330, 0, 0.16);
    tone(v, 262, 0.13, 0.26, { glide: 0.96 });
  },
  sleep: (v) => tone(v, 392, 0, 0.6, { gain: 0.1, glide: 0.7 }),
};

const emit = () => listeners.forEach((l) => l());

export const sound = {
  /** Play a sound. Silently does nothing while sound is off. */
  play(name: SoundName, { voice = 1, delay = 0 }: { voice?: number; delay?: number } = {}) {
    if (!enabled) return;
    const run = () => {
      if (ensure()) SOUNDS[name](voice);
    };
    if (delay) window.setTimeout(run, delay);
    else run();
  },
  get enabled() {
    return enabled;
  },
  setEnabled(value: boolean) {
    enabled = value;
    write("enabled", value);
    if (value) {
      ensure();
      SOUNDS.tap(1);
    }
    emit();
  },
  get volume() {
    return volume;
  },
  setVolume(value: number) {
    volume = Math.min(1, Math.max(0, value));
    write("volume", volume);
    if (master) master.gain.value = volume;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/** React hook: `[enabled, setEnabled]`, synced across every component. */
export function useSoundEnabled(): [boolean, (value: boolean) => void] {
  const value = useSyncExternalStore(sound.subscribe, () => sound.enabled);
  return [value, sound.setEnabled];
}
