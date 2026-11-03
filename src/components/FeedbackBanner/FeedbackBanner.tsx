/**
 * FeedbackBanner — the strip that slides up after checking an answer.
 * Mint with ✓ when right, rose with ✕ when wrong (never harsh: the copy should
 * encourage). Springs up from below; the round badge pops a beat later.
 * Re-mount it (change `key`) to replay the entrance for the next question.
 *
 * @example
 *   <FeedbackBanner kind="right" title="¡Correcto!" detail="+10 XP"
 *     action={<Button tone="success">Continue</Button>} />
 *   <FeedbackBanner kind="wrong" title="Casi" detail="Es «has visited»" />
 */
import type { ReactNode } from "react";
import { cx } from "../types";
import styles from "./FeedbackBanner.module.css";

export interface FeedbackBannerProps {
  kind: "right" | "wrong";
  title: ReactNode;
  detail?: ReactNode;
  /** Usually the "Continue" button. */
  action?: ReactNode;
  className?: string;
}

export function FeedbackBanner({ kind, title, detail, action, className }: FeedbackBannerProps) {
  return (
    <div className={cx(styles.root, className)} data-tone={kind === "right" ? "success" : "danger"} role="status">
      <span className={styles.badge} aria-hidden="true">
        {kind === "right" ? "✓" : "✕"}
      </span>
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
