/**
 * Chip — small rounded pill for tags and filters.
 *
 * - static (no `onToggle`): a colored tag, e.g. "phrasal verb"
 * - selectable (`onToggle`): graphite until selected, then fills with its color,
 *   bounces and shows a ✓. It's a real toggle button (`aria-pressed`).
 *
 * @example
 *   <Chip tint="sky">noun</Chip>
 *   <Chip tint="mint" selected={on} onToggle={setOn} count={12}>Learned</Chip>
 */
import type { ReactNode } from "react";
import { sound } from "../../lib/sound";
import { cx, tint as tintVars, type Pastel } from "../types";
import styles from "./Chip.module.css";

export interface ChipProps {
  tint?: Pastel;
  selected?: boolean;
  onToggle?: (next: boolean) => void;
  count?: number;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function Chip({ tint = "lilac", selected = false, onToggle, count, icon, className, children }: ChipProps) {
  const content = (
    <>
      {onToggle && <span className={styles.check} aria-hidden="true">✓</span>}
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </>
  );
  if (!onToggle) {
    return (
      <span className={cx(styles.root, className)} style={tintVars(tint)}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={cx(styles.root, className)}
      style={tintVars(tint)}
      aria-pressed={selected}
      onClick={() => {
        sound.play("tap");
        onToggle(!selected);
      }}
    >
      {content}
    </button>
  );
}
