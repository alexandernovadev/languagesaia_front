/**
 * EmptyState — a hero fills the gap when there's nothing to show.
 * Use it for "no words yet", "coming soon", "nothing found" and errors
 * (pass `kind="error"` + an action to retry: the hero looks sad).
 *
 * @example
 *   <EmptyState hero="lumi" title="Aún no tienes palabras"
 *     text="Añade la primera y Lumi te la explica." action={<Button>Añadir</Button>} />
 *   <EmptyState hero="bruno" kind="error" title="Algo falló" action={<Button onClick={retry}>Reintentar</Button>} />
 */
import { useEffect, type ReactNode } from "react";
import { HEROES, Robot, useRobotMood, type Hero } from "../Robot/Robot";
import { cx, tint } from "../types";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  hero: Hero;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  kind?: "empty" | "soon" | "error";
  className?: string;
}

export function EmptyState({ hero, title, text, action, kind = "empty", className }: EmptyStateProps) {
  const bot = useRobotMood(kind === "error" ? "sad" : kind === "soon" ? "think" : "idle");
  useEffect(() => {
    if (kind === "empty") {
      const t = window.setTimeout(() => bot.react("wave"), 400);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
  return (
    <div className={cx(styles.root, className)} style={tint(HEROES[hero].tint)} data-kind={kind}>
      <div className={styles.hero}>
        <Robot hero={hero} {...bot.props} voice={false} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      {text && <p className={styles.text}>{text}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
