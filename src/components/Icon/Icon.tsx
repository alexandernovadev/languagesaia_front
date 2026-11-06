/**
 * Icon — Glota's own icon set. 24×24 grid, round 2.2px strokes, soft corners.
 *
 * Two-tone: every icon has a `body` (a filled shape) and `lines`.
 * - default: body is a faint tint of the current color, lines use currentColor
 * - `active`: body fills with the pastel (`--c`) and lines turn ink — a
 *   "gummy" icon that pops in with a little spring (used for the selected tab)
 *
 * Color comes from `currentColor` + the `--c` variable, so icons follow the
 * module/hero color automatically (wrap in `style={tint("sky")}` or data-tone).
 *
 * @example
 *   <Icon name="words" />
 *   <Icon name="review" active size={28} />
 *   <Icon name="sparkle" label="Generar con IA" />
 */
import type { ReactNode } from "react";
import { cx } from "../types";
import styles from "./Icon.module.css";

type Glyph = { body?: ReactNode; lines: ReactNode };

const G: Record<string, Glyph> = {
  // ── Navigation ──
  home: {
    body: <path d="M4 10.6 12 4l8 6.6V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.4Z" />,
    lines: (
      <>
        <path d="M4 10.6 12 4l8 6.6V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8.4Z" />
        <path d="M10 21v-4.5a2 2 0 0 1 4 0V21" />
      </>
    ),
  },
  words: {
    body: <rect x="3.5" y="3.5" width="17" height="17" rx="5" />,
    lines: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <path d="M8.6 16.4 12 7.6l3.4 8.8M9.9 13.2h4.2" />
      </>
    ),
  },
  expressions: {
    body: <path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1.1 0-2.15-.16-3.12-.46L4.5 20l1.2-3.4C4.6 15.3 3 13.5 3 11.5 3 7.36 7.03 4 12 4Z" />,
    lines: (
      <>
        <path d="M12 4c4.97 0 9 3.36 9 7.5S16.97 19 12 19c-1.1 0-2.15-.16-3.12-.46L4.5 20l1.2-3.4C4.6 15.3 3 13.5 3 11.5 3 7.36 7.03 4 12 4Z" />
        <path className={styles.dot} d="M8.4 11.5h.01M12 11.5h.01M15.6 11.5h.01" strokeWidth="3" />
      </>
    ),
  },
  review: {
    body: <rect x="7.5" y="6" width="12" height="15" rx="3" transform="rotate(8 13.5 13.5)" />,
    lines: (
      <>
        <rect x="4.5" y="3" width="11" height="14.5" rx="3" transform="rotate(-10 10 10)" />
        <rect x="7.5" y="6" width="12" height="15" rx="3" transform="rotate(8 13.5 13.5)" />
        <path d="m13.7 10.2.9 1.9 2 .5-1.6 1.3.3 2-1.6-1-1.8.8.4-2-1.4-1.5 2-.2.8-1.8Z" strokeWidth="1.6" />
      </>
    ),
  },
  stories: {
    body: <path d="M3 6.6C5.6 5 8.6 5 12 6.9 15.4 5 18.4 5 21 6.6V19.2c-2.6-1.4-5.6-1.4-9 .6-3.4-2-6.4-2-9-.6V6.6Z" />,
    lines: (
      <>
        <path d="M3 6.6C5.6 5 8.6 5 12 6.9 15.4 5 18.4 5 21 6.6V19.2c-2.6-1.4-5.6-1.4-9 .6-3.4-2-6.4-2-9-.6V6.6Z" />
        <path d="M12 6.9v12.9" />
      </>
    ),
  },
  lessons: {
    body: <path d="M12 3 19.5 6v5.6c0 4.4-3.1 7.9-7.5 9.4-4.4-1.5-7.5-5-7.5-9.4V6L12 3Z" />,
    lines: (
      <>
        <path d="M12 3 19.5 6v5.6c0 4.4-3.1 7.9-7.5 9.4-4.4-1.5-7.5-5-7.5-9.4V6L12 3Z" />
        <path d="m8.6 12.1 2.4 2.4 4.5-4.7" />
      </>
    ),
  },
  profile: {
    body: (
      <>
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M4.8 20.2c.7-3.8 3.5-5.9 7.2-5.9s6.5 2.1 7.2 5.9H4.8Z" />
      </>
    ),
    lines: (
      <>
        <circle cx="12" cy="8.5" r="3.8" />
        <path d="M4.8 20.2c.7-3.8 3.5-5.9 7.2-5.9s6.5 2.1 7.2 5.9" />
      </>
    ),
  },
  // ── Rewards ──
  flame: {
    body: <path d="M12 21c-3.9 0-6.5-2.7-6.5-6.2 0-3.3 2.4-5.1 3.6-7.8.3 1.7 1 2.7 2 3.3.2-2.8 1.4-5.3 3.9-7.3-.2 3 1.2 4.8 2.4 6.4 1 1.4 1.6 2.8 1.6 4.6C19 18.4 16 21 12 21Z" />,
    lines: (
      <>
        <path d="M12 21c-3.9 0-6.5-2.7-6.5-6.2 0-3.3 2.4-5.1 3.6-7.8.3 1.7 1 2.7 2 3.3.2-2.8 1.4-5.3 3.9-7.3-.2 3 1.2 4.8 2.4 6.4 1 1.4 1.6 2.8 1.6 4.6C19 18.4 16 21 12 21Z" />
        <path d="M12 21c-1.7 0-2.9-1.2-2.9-2.8 0-1.8 1.6-2.6 2.4-4.2.9 1 3.4 2.3 3.4 4.3 0 1.6-1.2 2.7-2.9 2.7Z" />
      </>
    ),
  },
  star: {
    body: <path d="m12 3.5 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.1l-5.1 2.8L8 13.3 3.8 9.4l5.7-.7L12 3.5Z" />,
    lines: <path d="m12 3.5 2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.1l-5.1 2.8L8 13.3 3.8 9.4l5.7-.7L12 3.5Z" />,
  },
  sparkle: {
    body: <path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7Z" />,
    lines: (
      <>
        <path d="M12 3c.6 4.3 2.7 6.4 7 7-4.3.6-6.4 2.7-7 7-.6-4.3-2.7-6.4-7-7 4.3-.6 6.4-2.7 7-7Z" />
        <path d="M18.5 16.5v4M16.5 18.5h4" />
      </>
    ),
  },
  // ── Actions ──
  search: { lines: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></> },
  plus: { lines: <path d="M12 5v14M5 12h14" /> },
  clock: { lines: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></> },
  back: { lines: <path d="M15 5 8 12l7 7" /> },
  next: { lines: <path d="m9 5 7 7-7 7" /> },
  close: { lines: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" /> },
  check: { lines: <path d="m5 12.5 4.5 4.5L19 7.5" /> },
  edit: {
    body: <path d="M15.2 4.8a2.3 2.3 0 0 1 3.3 3.3L8.6 18 4.5 19.5 6 15.4l9.2-10.6Z" />,
    lines: <><path d="M15.2 4.8a2.3 2.3 0 0 1 3.3 3.3L8.6 18 4.5 19.5 6 15.4l9.2-10.6Z" /><path d="m13.5 6.8 3.3 3.3" /></>,
  },
  trash: {
    body: <path d="M6.5 7.5h11l-.8 11a2 2 0 0 1-2 1.9H9.3a2 2 0 0 1-2-1.9l-.8-11Z" />,
    lines: <><path d="M4.5 7.5h15M9.5 7.5V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2v2.3" /><path d="M6.5 7.5h11l-.8 11a2 2 0 0 1-2 1.9H9.3a2 2 0 0 1-2-1.9l-.8-11Z" /></>,
  },
  sound: {
    body: <path d="M4 9.5h3l4.5-4v13l-4.5-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" />,
    lines: <><path d="M4 9.5h3l4.5-4v13l-4.5-4H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" /><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18.2 6.3a8 8 0 0 1 0 11.4" /></>,
  },
  turtle: {
    body: <path d="M4.5 15.5c0-4.2 3.2-7.5 7.3-7.5 4 0 7.2 3.3 7.2 7.5H4.5Z" />,
    lines: (
      <>
        <path d="M4.5 15.5c0-4.2 3.2-7.5 7.3-7.5 4 0 7.2 3.3 7.2 7.5H4.5Z" />
        <path d="M9.2 9.2 10.6 12h2.8l1.4-2.8M10.6 12l-1.8 3.5M13.4 12l1.8 3.5" strokeWidth="1.6" />
        <path d="M19 13.4h1.2a1.8 1.8 0 0 0 0-3.6c-.9 0-1.6.6-1.8 1.4M7 15.5v2.5M17 15.5v2.5" />
      </>
    ),
  },
  image: {
    body: <rect x="3.5" y="4.5" width="17" height="15" rx="4" />,
    lines: <><rect x="3.5" y="4.5" width="17" height="15" rx="4" /><circle cx="9" cy="10" r="1.8" /><path d="m4 17.5 4.6-4.3a1.5 1.5 0 0 1 2 0l1.9 1.8 2.5-2.4a1.5 1.5 0 0 1 2.1 0l3.4 3.4" /></>,
  },
  send: {
    body: <path d="M4 11.6 19.5 4.5 15 20l-3.4-6.6L4 11.6Z" />,
    lines: <><path d="M4 11.6 19.5 4.5 15 20l-3.4-6.6L4 11.6Z" /><path d="m11.6 13.4 3.6-3.6" /></>,
  },
  filter: { lines: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></> },
  settings: {
    body: <circle cx="12" cy="12" r="7" />,
    lines: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M6 18l1.4-1.4M16.6 7.4 18 6" />
        <circle cx="12" cy="12" r="6.5" />
      </>
    ),
  },
  logout: { lines: <><path d="M14 4.5H7a2.5 2.5 0 0 0-2.5 2.5v10A2.5 2.5 0 0 0 7 19.5h7" /><path d="M10.5 12h10M17 8l3.8 4-3.8 4" /></> },
  globe: { lines: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.2 3.6 8.5S14.4 18.1 12 20.5C9.6 18.1 8.4 15.3 8.4 12S9.6 5.9 12 3.5Z" /></> },
};

export type IconName = keyof typeof G;

export interface IconProps {
  name: IconName;
  size?: number;
  active?: boolean;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 24, active, label, className }: IconProps) {
  const g = G[name];
  return (
    <svg
      className={cx(styles.icon, active && styles.active, className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {g.body && <g className={styles.body}>{g.body}</g>}
      <g className={styles.lines}>{g.lines}</g>
    </svg>
  );
}

export const ICON_NAMES = Object.keys(G) as IconName[];
