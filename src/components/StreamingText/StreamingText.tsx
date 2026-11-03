/**
 * StreamingText — text that arrives word by word, like the AI is writing it live.
 *
 * Pass the text received so far; only the NEW words animate in (fade + un-blur),
 * the old ones stay still. A blinking caret shows while `streaming` is true.
 * Uses the reader size (19px, line-height 1.75, ~62 characters per line).
 *
 * `useFakeStream(text)` is a helper for demos: it reveals a full string over time.
 *
 * @example
 *   <StreamingText text={partial} streaming={!finished} />
 *   const { text, streaming, restart } = useFakeStream(story, 90);
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "../types";
import styles from "./StreamingText.module.css";

export interface StreamingTextProps {
  text: string;
  streaming?: boolean;
  className?: string;
}

export function StreamingText({ text, streaming = false, className }: StreamingTextProps) {
  // split keeping spaces, so words keep stable keys as text grows
  const tokens = text.split(/(\s+)/).filter(Boolean);
  return (
    <p className={cx(styles.root, className)} aria-live="polite" aria-busy={streaming}>
      {tokens.map((t, i) =>
        /\s/.test(t) ? (
          t
        ) : (
          <span key={i} className={styles.word}>
            {t}
          </span>
        ),
      )}
      {streaming && <span className={styles.caret} aria-hidden="true" />}
    </p>
  );
}

/** Demo helper: reveals `full` one word every `ms` milliseconds. */
export function useFakeStream(full: string, ms = 90) {
  const words = useRef(full.split(" "));
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    words.current = full.split(" ");
    setCount(0);
    const id = window.setInterval(() => {
      setCount((n) => {
        if (n >= words.current.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 1;
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [full, ms, run]);

  const restart = useCallback(() => setRun((r) => r + 1), []);
  return { text: words.current.slice(0, count).join(" "), streaming: count < words.current.length, restart };
}
