/**
 * Logo — the Glota brand: a speech bubble that is also a robot head
 * (lilac bubble · dark visor with sky eyes · butter antenna · side bolts).
 *
 * - `variant="full"`   "gl" + robot bubble as the "o" + "ta" (Baloo 2 800)
 * - `variant="symbol"` just the robot bubble (app icon, favicon, header)
 * - `animated`         the robot blinks, the antenna light pulses and it bobs
 *
 * The symbol is pure SVG with design-token colors and hex fallbacks, so it
 * also renders right outside the app (emails, og images…).
 *
 * @example
 *   <Logo size={48} />                    // full wordmark, 48px tall letters
 *   <Logo variant="symbol" size={32} />   // header / avatar
 *   <Logo size={96} animated />           // login hero
 */
import { cx } from "../types";
import styles from "./Logo.module.css";

const BUBBLE =
  "M48 22h24a30 30 0 0 1 30 30v4a30 30 0 0 1-30 30H58c-6 6-14 11-26 13 4-4 6-9 6-14A30 30 0 0 1 18 56v-4a30 30 0 0 1 30-30Z";

export function GlotaSymbol({ animated, className, title }: { animated?: boolean; className?: string; title?: string }) {
  return (
    <svg
      className={cx(styles.symbol, animated && styles.animated, className)}
      viewBox="0 0 120 120"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {/* antenna */}
      <line x1="60" y1="22" x2="60" y2="9" stroke="var(--lilac-deep, #8e7cc2)" strokeWidth="5" strokeLinecap="round" />
      <g className={styles.light}>
        <circle cx="60" cy="8" r="6.5" fill="var(--butter, #ecdc92)" />
        <circle cx="58" cy="6" r="2" fill="#fff" opacity=".8" />
      </g>
      {/* bubble with its 3D edge */}
      <path d={BUBBLE} fill="var(--lilac-deep, #8e7cc2)" transform="translate(0 5)" />
      <path d={BUBBLE} fill="var(--lilac, #cbbdf9)" />
      <path d="M30 38a24 24 0 0 1 18-12" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
      {/* visor + eyes */}
      <rect x="29" y="37" width="62" height="32" rx="16" fill="#121215" />
      <rect x="33" y="40" width="22" height="4" rx="2" fill="#fff" opacity=".12" />
      <g className={styles.eyes}>
        <rect x="40" y="46" width="13" height="14" rx="6.5" fill="var(--sky, #9bd2fa)" />
        <rect x="67" y="46" width="13" height="14" rx="6.5" fill="var(--sky, #9bd2fa)" />
      </g>
      <circle cx="49" cy="49.5" r="2.2" fill="#fff" />
      <circle cx="76" cy="49.5" r="2.2" fill="#fff" />
      {/* side bolts */}
      <circle cx="22" cy="54" r="5" fill="var(--lilac-deep, #8e7cc2)" />
      <circle cx="98" cy="54" r="5" fill="var(--lilac-deep, #8e7cc2)" />
    </svg>
  );
}

export interface LogoProps {
  variant?: "full" | "symbol";
  /** Letter height in px (full) or symbol size in px. */
  size?: number;
  animated?: boolean;
  className?: string;
}

export function Logo({ variant = "full", size = 40, animated, className }: LogoProps) {
  if (variant === "symbol") {
    return (
      <span className={cx(styles.symbolWrap, className)} style={{ width: size, height: size }}>
        <GlotaSymbol animated={animated} title="Glota" />
      </span>
    );
  }
  return (
    <span className={cx(styles.wordmark, className)} style={{ fontSize: size }} role="img" aria-label="Glota">
      <span aria-hidden="true">gl</span>
      <span className={cx(styles.o, animated && styles.bob)} aria-hidden="true">
        <GlotaSymbol animated={animated} />
      </span>
      <span aria-hidden="true">ta</span>
    </span>
  );
}
