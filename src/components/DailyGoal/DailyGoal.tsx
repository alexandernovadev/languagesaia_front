/**
 * DailyGoal — today's XP against the goal, with streak and level.
 * `compact` is the short version for the end of a session.
 *
 * @example
 *   <DailyGoal />
 *   <DailyGoal compact />
 */
import { useProgress } from "../../lib/progress";
import { Icon } from "../Icon/Icon";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { cx } from "../types";
import styles from "./DailyGoal.module.css";

export function DailyGoal({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  if (!p) return null;
  const done = p.todayXp >= p.goal;
  const percent = Math.min(100, Math.round((p.todayXp / p.goal) * 100));
  return (
    <section className={cx(styles.goal, compact && styles.compact)} aria-label="Meta de hoy">
      <div className={styles.ring} data-done={done || undefined} style={{ "--p": `${percent}%` } as React.CSSProperties}>
        {done ? <Icon name="star" size={compact ? 22 : 30} active /> : <span>{percent}%</span>}
      </div>
      <div className={styles.body}>
        <h2>{done ? "¡Meta cumplida!" : "Meta de hoy"}</h2>
        <p>
          {p.todayXp} / {p.goal} XP
        </p>
        {!compact && (
          <>
            <div className={styles.facts}>
              <span>
                <Icon name="flame" size={18} active /> {p.streak} {p.streak === 1 ? "día" : "días"}
              </span>
              {p.freezes > 0 && <span>{p.freezes === 1 ? "1 protector" : `${p.freezes} protectores`}</span>}
            </div>
            <ProgressBar value={p.levelXp} max={p.levelNeed} size="sm" label={`Nivel ${p.level}`} />
          </>
        )}
      </div>
    </section>
  );
}
