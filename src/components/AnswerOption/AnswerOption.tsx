/**
 * AnswerOption — one choice in a quiz, with the full "correct / wrong" moment.
 *
 * States (controlled by the parent):
 * - `idle`      graphite row, number key on the left
 * - `selected`  lilac (before checking)
 * - `right`     mint + pop. If `celebrate`, confetti bursts from the option,
 *               "+XP" floats up, the correct sound plays and the phone ticks.
 * - `wrong`     rose + shake, soft wrong sound and double buzz
 * - `dim`       the other options fade back once answered
 *
 * Effects fire once when the state changes, so the parent only sets state.
 *
 * @example
 *   <AnswerOption index={1} state={stateOf(i)} onClick={() => choose(i)} celebrate xp={10}>
 *     She has visited London.
 *   </AnswerOption>
 */
import { useEffect, useRef, type ReactNode } from "react";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { cx } from "../types";
import styles from "./AnswerOption.module.css";

export type AnswerState = "idle" | "selected" | "right" | "wrong" | "dim";

export interface AnswerOptionProps {
  state?: AnswerState;
  /** Shown as a keyboard hint (1, 2, 3…). */
  index?: number;
  onClick?: () => void;
  /** On `right`: confetti + floating XP. Default true. */
  celebrate?: boolean;
  /** XP shown floating on `right`. */
  xp?: number;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export function AnswerOption({ state = "idle", index, onClick, celebrate = true, xp, disabled, className, children }: AnswerOptionProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const prev = useRef(state);

  useEffect(() => {
    const el = ref.current;
    if (!el || state === prev.current) return;
    prev.current = state;
    if (state === "right") {
      sound.play("correct", { delay: 60 });
      haptics.success();
      if (celebrate) {
        fx.confetti(el);
        if (xp) fx.float(el, `+${xp} XP`);
      }
    }
    if (state === "wrong") {
      sound.play("wrong", { delay: 60 });
      haptics.error();
    }
  }, [state, celebrate, xp]);

  const locked = disabled || state === "right" || state === "wrong" || state === "dim";

  return (
    <button ref={ref} type="button" className={cx(styles.root, className)} data-state={state} disabled={locked} onClick={onClick}>
      {index !== undefined && (
        <span className={styles.key} aria-hidden="true">
          {state === "right" ? "✓" : state === "wrong" ? "✕" : index}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
}
