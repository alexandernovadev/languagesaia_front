/**
 * Stat pills — the little rewards that live in the header.
 *
 * - `XPCounter`: ⭐ total XP; bumps when it grows. Pass `floatFrom` (an element)
 *   to also launch a floating "+N XP" from where the user earned it.
 * - `StreakCounter`: 🔥 days in a row; when it grows the flame dances and
 *   two rings of butter light pulse out, with the level-up sound.
 * - `ComboBadge`: "¡3 seguidas!" — invisible below 3 correct in a row,
 *   bumps and plays the combo arpeggio each time it increases.
 *
 * @example
 *   <XPCounter value={xp} />
 *   <StreakCounter days={streak} />
 *   <ComboBadge count={run} />
 */
import { useEffect, useRef } from "react";
import { fx } from "../../lib/fx";
import { sound } from "../../lib/sound";
import { useReplay } from "../../lib/useReplay";
import { Icon } from "../Icon/Icon";
import { cx, tint } from "../types";
import styles from "./Stat.module.css";

/** Runs `onUp(diff)` whenever `value` increases (not on first render). */
function useIncrease(value: number, onUp: (diff: number) => void) {
  const prev = useRef(value);
  useEffect(() => {
    if (value > prev.current) onUp(value - prev.current);
    prev.current = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

export function XPCounter({ value, floatFrom, className }: { value: number; floatFrom?: Element | null; className?: string }) {
  const [ref, replay] = useReplay<HTMLSpanElement>();
  useIncrease(value, (diff) => {
    replay("bump");
    if (floatFrom) fx.float(floatFrom, `+${diff} XP`);
  });
  return (
    <span ref={ref} className={cx(styles.pill, className)} style={tint("mint")} aria-label={`${value} XP`}>
      <span className={styles.icon}><Icon name="star" size={20} active /></span>
      {value} XP
    </span>
  );
}

export function StreakCounter({ days, className }: { days: number; className?: string }) {
  const [ref, replay] = useReplay<HTMLSpanElement>();
  useIncrease(days, () => {
    replay("glow");
    sound.play("levelup");
  });
  return (
    <span ref={ref} className={cx(styles.pill, className)} style={tint("butter")} aria-label={`Racha de ${days} días`}>
      <span className={styles.icon}><Icon name="flame" size={20} active /></span>
      {days}
    </span>
  );
}

export function ComboBadge({ count, min = 3, className }: { count: number; min?: number; className?: string }) {
  const [ref, replay] = useReplay<HTMLSpanElement>();
  useIncrease(count, () => {
    if (count >= min) {
      replay("bump");
      sound.play("combo", { delay: 300 });
    }
  });
  return (
    <span ref={ref} className={cx(styles.combo, className)} aria-live="polite">
      {count >= min ? `¡${count} seguidas!` : ""}
    </span>
  );
}
