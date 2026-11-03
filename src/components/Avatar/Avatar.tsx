/**
 * Avatar — user picture, or their initials on a pastel picked from their name
 * (same person → same color, always).
 *
 * @example
 *   <Avatar name="Alex Soto" src={user.image} size={40} />
 */
import { useState } from "react";
import { cx, type Pastel } from "../types";
import styles from "./Avatar.module.css";

const PASTELS: Pastel[] = ["lilac", "sky", "mint", "butter", "peach", "rose"];

export function Avatar({ name, src, size = 40, className }: { name: string; src?: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const tone = PASTELS[hash % PASTELS.length];
  return (
    <span
      className={cx(styles.root, className)}
      style={{ width: size, height: size, fontSize: size * 0.4, "--c": `var(--${tone})`, "--c-deep": `var(--${tone}-deep)` } as React.CSSProperties}
      title={name}
    >
      {src && !broken ? <img src={src} alt="" onError={() => setBroken(true)} /> : initials || "?"}
    </span>
  );
}
