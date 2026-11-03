/**
 * LevelBadge — CEFR level (A1 → C2) as a tiny 3D pastel block.
 * Each level has its own color so progress reads at a glance:
 * A1 mint · A2 sky · B1 lilac · B2 butter · C1 peach · C2 rose.
 *
 * @example
 *   <LevelBadge level="B1" />
 *   <LevelBadge level="C2" size="lg" showName />  // "C2 Maestría"
 */
import { cx, type CefrLevel, type Size } from "../types";
import styles from "./LevelBadge.module.css";

const NAMES: Record<CefrLevel, string> = {
  A1: "Acceso",
  A2: "Plataforma",
  B1: "Umbral",
  B2: "Avanzado",
  C1: "Dominio",
  C2: "Maestría",
};

export interface LevelBadgeProps {
  level: CefrLevel;
  size?: Size;
  /** Adds the level name next to the code. */
  showName?: boolean;
  className?: string;
}

export function LevelBadge({ level, size = "md", showName, className }: LevelBadgeProps) {
  const key = level.toLowerCase();
  return (
    <span
      className={cx(styles.root, className)}
      data-size={size === "md" ? undefined : size}
      style={{ "--c": `var(--cefr-${key})`, "--c-deep": `color-mix(in oklab, var(--cefr-${key}), black 32%)` } as React.CSSProperties}
      title={`Nivel ${level} · ${NAMES[level]}`}
    >
      {level}
      {showName && <span className={styles.name}>{NAMES[level]}</span>}
    </span>
  );
}
