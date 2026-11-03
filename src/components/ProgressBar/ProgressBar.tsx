/**
 * ProgressBar — lesson progress that feels like a reward.
 *
 * The fill grows with a spring, a flash of light runs along it on every step,
 * and when it reaches 100% the bar pops, glows and turns mint.
 * For unknown durations (AI generating) use the native `<progress>` without value
 * or the `AIThinking` component instead.
 *
 * @example
 *   <ProgressBar value={3} max={5} label="Lesson" />
 *   <ProgressBar value={xp} max={goal} tone="warning" size="sm" />
 */
import { useEffect, useRef } from "react";
import { useReplay } from "../../lib/useReplay";
import { cx, type Size, type Tone } from "../types";
import styles from "./ProgressBar.module.css";

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: Tone;
  size?: Size;
  /** Text on the left above the bar. */
  label?: string;
  /** Shows "3 / 5" on the right. Default true when there is a label. */
  showValue?: boolean;
  className?: string;
}

export function ProgressBar({ value, max = 100, tone = "success", size = "md", label, showValue = !!label, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const [fillRef, replay] = useReplay<HTMLDivElement>();
  const prev = useRef(value);

  useEffect(() => {
    if (value > prev.current) replay("step");
    prev.current = value;
  }, [value, replay]);

  return (
    <div
      className={cx(styles.root, className)}
      data-tone={tone}
      data-size={size === "md" ? undefined : size}
      data-empty={pct === 0 || undefined}
      data-complete={pct >= 100 || undefined}
    >
      {(label || showValue) && (
        <div className={styles.head}>
          <span>{label}</span>
          {showValue && (
            <span className={styles.value}>
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div ref={fillRef} className={styles.fill} style={{ "--p": `${pct}%` } as React.CSSProperties} />
      </div>
    </div>
  );
}
