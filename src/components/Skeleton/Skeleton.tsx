/**
 * Skeleton — shimmering placeholders while data loads.
 * `rows` draws list rows (thumbnail + two lines); `lines` draws text lines.
 *
 * @example
 *   {loading ? <Skeleton rows={6} /> : <List … />}
 *   <Skeleton lines={3} />
 */
import { cx } from "../types";
import styles from "./Skeleton.module.css";

export function Skeleton({ rows, lines, className }: { rows?: number; lines?: number; className?: string }) {
  if (rows) {
    return (
      <div className={cx(styles.list, className)} aria-busy="true" aria-label="Cargando">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className={styles.row} style={{ animationDelay: `${i * 60}ms` }}>
            <span className={cx(styles.block, styles.thumb)} />
            <span className={styles.texts}>
              <span className={styles.block} style={{ width: `${45 + ((i * 17) % 30)}%` }} />
              <span className={styles.block} style={{ width: `${25 + ((i * 11) % 25)}%`, height: 10 }} />
            </span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cx(styles.lines, className)} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: lines ?? 3 }, (_, i) => (
        <span key={i} className={styles.block} style={{ width: i === (lines ?? 3) - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}
