/**
 * SpeakButtons — hear a word: 🔊 normal speed and 🐢 slow (every sound).
 * Uses the browser's voices; hidden when the device can't speak.
 * Clicks don't bubble, so they're safe inside clickable cards.
 *
 * @example
 *   <SpeakButtons text="saudade" language="pt" />
 */
import { canSpeak, speak } from "../../lib/speech";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { cx } from "../types";
import styles from "./SpeakButtons.module.css";

export function SpeakButtons({ text, language, size = "md", className }: { text: string; language: string; size?: "sm" | "md"; className?: string }) {
  if (!canSpeak()) return null;
  const say = (rate: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(text, language, rate);
  };
  return (
    <span className={cx(styles.root, className)} data-size={size}>
      <Button tone="info" iconOnly size={size === "sm" ? "sm" : "md"} icon={<Icon name="sound" size={size === "sm" ? 18 : 22} active />} aria-label="Escuchar" sound={false} onClick={say(1)} />
      <Button tone="neutral" iconOnly size={size === "sm" ? "sm" : "md"} icon={<Icon name="turtle" size={size === "sm" ? 18 : 22} />} aria-label="Escuchar despacio" sound={false} onClick={say(0.45)} />
    </span>
  );
}
