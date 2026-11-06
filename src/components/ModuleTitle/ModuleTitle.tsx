/**
 * ModuleTitle — a list page's heading with its hero, who waves when you arrive.
 *
 * @example
 *   <ModuleTitle hero="lumi" title="Palabras" count={total} />
 */
import { useEffect, type ReactNode } from "react";
import { Robot, useRobotMood, type Hero } from "../Robot/Robot";
import styles from "./ModuleTitle.module.css";

export function ModuleTitle({ hero, title, count }: { hero: Hero; title: ReactNode; count?: number }) {
  const bot = useRobotMood();

  useEffect(() => {
    const t = window.setTimeout(() => bot.react("wave"), 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.root}>
      <button type="button" className={styles.hero} aria-label="Saludar" onClick={() => bot.react("happy")}>
        <Robot hero={hero} {...bot.props} voice={false} />
      </button>
      <h1>{title}</h1>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </div>
  );
}
