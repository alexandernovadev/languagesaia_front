/**
 * AIThinking — what the user sees while the AI writes (it takes 40–70 s).
 *
 * Four layers so the wait never feels stuck:
 * 1. a peach blob with a face that breathes, morphs and looks around
 * 2. bouncing dots
 * 3. rotating tips about what the AI is doing (new one every 3.5 s)
 * 4. elapsed seconds + a shimmering skeleton of the content to come
 *
 * Set `done` when the result arrives: plays the soft "AI ready" chime.
 *
 * @example
 *   {loading && <AIThinking title="Writing your story…" />}
 *   <AIThinking tips={["Choosing B1 words…", "Adding examples…"]} skeletonLines={5} />
 */
import { useEffect, useState } from "react";
import { sound } from "../../lib/sound";
import { cx } from "../types";
import styles from "./AIThinking.module.css";

const DEFAULT_TIPS = [
  "Buscando ejemplos que suenen naturales…",
  "Revisando la pronunciación…",
  "Eligiendo palabras de tu nivel…",
  "Traduciendo al español…",
  "Casi listo, dando el último repaso…",
];

export interface AIThinkingProps {
  title?: string;
  tips?: string[];
  /** Lines in the shimmering placeholder. 0 hides it. */
  skeletonLines?: number;
  /** Set true when the result arrived: plays the "ready" chime. */
  done?: boolean;
  className?: string;
}

export function AIThinking({ title = "La IA está pensando", tips = DEFAULT_TIPS, skeletonLines = 3, done, className }: AIThinkingProps) {
  const [seconds, setSeconds] = useState(0);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const s = window.setInterval(() => setSeconds((n) => n + 1), 1000);
    const t = window.setInterval(() => setTip((n) => (n + 1) % tips.length), 3500);
    return () => {
      window.clearInterval(s);
      window.clearInterval(t);
    };
  }, [tips.length]);

  useEffect(() => {
    if (done) sound.play("ready");
  }, [done]);

  return (
    <div className={cx(styles.root, className)} role="status" aria-live="polite" aria-busy={!done}>
      <div className={styles.blob} aria-hidden="true" />
      <div className={styles.dots} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={styles.title}>{title}</div>
      <p key={tip} className={styles.tip}>
        {tips[tip]}
      </p>
      <span className={styles.elapsed}>{seconds} s</span>
      {skeletonLines > 0 && (
        <div className={styles.skeleton} aria-hidden="true">
          {Array.from({ length: skeletonLines }, (_, i) => (
            <div key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
