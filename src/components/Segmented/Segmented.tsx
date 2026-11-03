/**
 * Segmented — pick one of 2–4 options (Palabras · Expresiones, Todas · Difíciles…).
 * A pastel "thumb" slides under the selected option with a spring.
 * Keyboard: arrow keys move the selection (it's a radiogroup).
 *
 * @example
 *   <Segmented value={tab} onChange={setTab}
 *     options={[{ value: "words", label: "Palabras", icon: "words" }, { value: "expr", label: "Expresiones", icon: "expressions" }]} />
 */
import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { sound } from "../../lib/sound";
import { Icon, type IconName } from "../Icon/Icon";
import { cx, tint, type Pastel } from "../types";
import styles from "./Segmented.module.css";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
  tint?: Pastel;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const current = options.find((o) => o.value === value);

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(`[data-value="${value}"]`);
    if (el) setThumb({ x: el.offsetLeft, w: el.offsetWidth });
  }, [value, options.length]);

  const onKey = (e: KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value);
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = options[(i + d + options.length) % options.length];
    onChange(next.value);
    root.current?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div
      ref={root}
      role="radiogroup"
      aria-label={label}
      className={cx(styles.root, className)}
      style={tint(current?.tint ?? "lilac")}
      onKeyDown={onKey}
    >
      {thumb && <span className={styles.thumb} style={{ translate: `${thumb.x}px 0`, width: thumb.w }} aria-hidden="true" />}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            data-value={o.value}
            className={styles.option}
            onClick={() => {
              if (!on) sound.play("tap");
              onChange(o.value);
            }}
          >
            {o.icon && <Icon name={o.icon} size={20} active={on} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
