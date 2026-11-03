/**
 * speech — pronounce words with the browser's own voices (Web Speech API).
 * Free and offline-ish; quality depends on the device. Used until the backend
 * has a TTS provider again.
 *
 * @example
 *   speak("saudade", "pt");          // normal speed
 *   speak("saudade", "pt", 0.5);     // slow, to hear every sound
 */
const LOCALES: Record<string, string> = { en: "en-US", pt: "pt-BR", es: "es-ES", it: "it-IT", fr: "fr-FR" };

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

const pickVoice = (locale: string) => {
  const voices = window.speechSynthesis.getVoices();
  const lang = locale.slice(0, 2);
  return voices.find((v) => v.lang === locale && /google|natural|premium|enhanced/i.test(v.name)) ?? voices.find((v) => v.lang === locale) ?? voices.find((v) => v.lang.startsWith(lang));
};

export function speak(text: string, language = "en", rate = 1) {
  if (!canSpeak() || !text) return;
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
