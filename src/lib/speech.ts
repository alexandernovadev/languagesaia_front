/**
 * speech — pronounce text. A word plays its saved recording (`play`); anything
 * else uses the browser's own voices (Web Speech API), whose quality depends
 * on the device.
 *
 * @example
 *   speak("saudade", "pt");          // normal speed
 *   speak("saudade", "pt", 0.5);     // slow, to hear every sound
 */
import { api } from "./api";

const LOCALES: Record<string, string> = { en: "en-US", pt: "pt-BR", es: "es-ES", it: "it-IT", fr: "fr-FR" };

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

const pickVoice = (locale: string) => {
  const voices = window.speechSynthesis.getVoices();
  const lang = locale.slice(0, 2);
  return voices.find((v) => v.lang === locale && /google|natural|premium|enhanced/i.test(v.name)) ?? voices.find((v) => v.lang === locale) ?? voices.find((v) => v.lang.startsWith(lang));
};

/** Recordings asked for in this visit: the word on screen doesn't know its new URL yet. */
const recordings = new Map<string, Promise<string>>();

/** The word's recording. The first request creates it, so it can be asked for ahead of time. */
export function wordRecording(wordId: string) {
  const known = recordings.get(wordId);
  if (known) return known;
  const request = api<{ url: string }>(`/api/words/${wordId}/audio`, { method: "POST", silent: true }).then((r) => r.url);
  recordings.set(wordId, request);
  request.catch(() => recordings.delete(wordId));
  return request;
}

/** The recording of an example or an expression, created the first time. */
export function textRecording(text: string, language: string) {
  const key = `${language}:${text}`;
  const known = recordings.get(key);
  if (known) return known;
  const request = api<{ url: string }>("/api/audio", { method: "POST", body: { text, language }, silent: true }).then((r) => r.url);
  recordings.set(key, request);
  request.catch(() => recordings.delete(key));
  return request;
}

let current: HTMLAudioElement | null = null;

/** Plays a recording. `rate` below 1 slows it down keeping its pitch. */
export async function play(url: string, rate = 1) {
  current?.pause();
  if (canSpeak()) window.speechSynthesis.cancel();
  current = new Audio(url);
  current.playbackRate = rate;
  await current.play();
}

export function speak(text: string, language = "en", rate = 1) {
  if (!canSpeak() || !text) return;
  current?.pause();
  const synth = window.speechSynthesis;
  synth.cancel();
  const locale = LOCALES[language] ?? language;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = locale;
  u.rate = rate;
  const voice = pickVoice(locale);
  if (voice) u.voice = voice;
  synth.speak(u);
}
