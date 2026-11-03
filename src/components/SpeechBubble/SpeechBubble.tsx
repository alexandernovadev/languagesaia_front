/**
 * SpeechBubble — what a robot hero says. Bumps every time the text changes.
 * Tail points `bottom` (bubble above the hero) or `left` (bubble beside it).
 *
 * @example
 *   <SpeechBubble tail="left">¡Eso es! +10 XP</SpeechBubble>
 */
import { useEffect, type ReactNode } from "react";
import { useReplay } from "../../lib/useReplay";
import { cx } from "../types";
import styles from "./SpeechBubble.module.css";

export function SpeechBubble({ tail = "bottom", className, children }: { tail?: "bottom" | "left"; className?: string; children: ReactNode }) {
  const [ref, replay] = useReplay<HTMLDivElement>();
  const key = typeof children === "string" ? children : "";
  useEffect(() => replay("bump"), [key, replay]);
  return (
    <div ref={ref} className={cx(styles.root, className)} data-tail={tail} aria-live="polite">
      {children}
    </div>
  );
}
