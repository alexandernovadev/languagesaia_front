/**
 * SpeakButtons — hear a word: 🔊 normal speed and 🐢 slow (every sound).
 * With `wordId` it plays the word's recording, and with `recorded` the text's,
 * created the first time. If that fails, or without either, it uses the
 * browser's voices. `slow={false}` leaves only the 🔊 button.
 * Clicks don't bubble, so they're safe inside clickable cards.
 *
 * @example
 *   <SpeakButtons text="saudade" language="pt" />
 *   <SpeakButtons text={w.word} language={w.language} wordId={w._id} audio={w.audio} />
 */
import { useState } from "react";
import { canSpeak, play, speak, textRecording, wordRecording } from "../../lib/speech";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { cx } from "../types";
import styles from "./SpeakButtons.module.css";

const SLOW_RECORDING = 0.6;
const SLOW_VOICE = 0.45;

export function SpeakButtons({ text, language, wordId, audio, recorded = false, slow: showSlow = true, size = "md", className }: { text: string; language: string; wordId?: string; audio?: string; recorded?: boolean; slow?: boolean; size?: "sm" | "md"; className?: string }) {
  const [loading, setLoading] = useState(false);
  const hasRecording = !!wordId || recorded;
  if (!canSpeak() && !hasRecording) return null;

  const say = (slow: boolean) => async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasRecording) return speak(text, language, slow ? SLOW_VOICE : 1);
    if (loading) return;
    setLoading(true);
    try {
      const url = audio || (await (wordId ? wordRecording(wordId) : textRecording(text, language)));
      await play(url, slow ? SLOW_RECORDING : 1);
    } catch {
      speak(text, language, slow ? SLOW_VOICE : 1);
    } finally {
      setLoading(false);
    }
  };

  const buttonSize = size === "sm" ? "sm" : "md";
  const iconSize = size === "sm" ? 18 : 22;
  return (
    <span className={cx(styles.root, className)} data-size={size}>
      <Button tone="info" iconOnly size={buttonSize} loading={loading} quiet icon={<Icon name="sound" size={iconSize} active />} aria-label="Escuchar" sound={false} onClick={say(false)} />
      {showSlow && <Button tone="neutral" iconOnly size={buttonSize} disabled={loading} icon={<Icon name="turtle" size={iconSize} />} aria-label="Escuchar despacio" sound={false} onClick={say(true)} />}
    </span>
  );
}
