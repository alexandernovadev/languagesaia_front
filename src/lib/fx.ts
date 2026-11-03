/**
 * FX — celebration effects drawn on a fixed, click-through layer above the app.
 * Pure DOM (no React state), so firing confetti never re-renders anything.
 * Respects `prefers-reduced-motion`: confetti and sparkles are skipped, text still shows.
 *
 * Every function accepts either viewport coordinates or an element (uses its center).
 *
 * @example
 *   fx.confetti(buttonEl);            // 18 pastel pieces from the button
 *   fx.float(buttonEl, "+10 XP");     // number rises and fades
 *   fx.sparkles(robotEl, 9);          // butter stars around the hero
 */
import styles from "./fx.module.css";

type Point = { x: number; y: number };
type Target = Point | Element;

const PASTELS = ["mint", "lilac", "sky", "peach", "butter", "rose"] as const;
const SHAPES = ["square", "pill", "dot"] as const;

let layer: HTMLDivElement | null = null;
const getLayer = () => {
  if (!layer || !layer.isConnected) {
    layer = document.createElement("div");
    layer.className = styles.layer;
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
  }
  return layer;
};

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const toPoint = (t: Target): Point => {
  if ("x" in t && "y" in t && !(t instanceof Element)) return t;
  const r = (t as Element).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const spawn = (className: string, vars: Record<string, string>, life: number, extra?: (el: HTMLElement) => void) => {
  const el = document.createElement("span");
  el.className = className;
  for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
  extra?.(el);
  getLayer().appendChild(el);
  window.setTimeout(() => el.remove(), life);
  return el;
};

export const fx = {
  /** Pastel confetti burst. `count` 18 for a correct answer, ~40 for a finished lesson. */
  confetti(target: Target, count = 18, spread = 1) {
    if (reduced()) return;
    const { x, y } = toPoint(target);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = (60 + Math.random() * 100) * spread;
      const c = PASTELS[i % PASTELS.length];
      spawn(
        styles.piece,
        {
          "--x": `${x}px`,
          "--y": `${y}px`,
          "--dx": `${Math.cos(a) * d}px`,
          "--dy": `${Math.sin(a) * d - 30}px`,
          "--rot": `${Math.random() * 540 - 270}deg`,
          "--c": `var(--${c})`,
        },
        900,
        (el) => (el.dataset.shape = SHAPES[i % SHAPES.length]),
      );
    }
  },

  /** Floating text such as "+10 XP". Tone is any palette name (default mint). */
  float(target: Target, text: string, tone: (typeof PASTELS)[number] = "mint") {
    const { x, y } = toPoint(target);
    spawn(styles.float, { "--x": `${x}px`, "--y": `${y - 10}px`, "--c": `var(--${tone})` }, 1100, (el) => (el.textContent = text));
  },

  /** Twinkling butter stars scattered around a point. */
  sparkles(target: Target, count = 8, radius = 70) {
    if (reduced()) return;
    const { x, y } = toPoint(target);
    for (let i = 0; i < count; i++) {
      spawn(
        styles.sparkle,
        {
          "--x": `${x + (Math.random() * 2 - 1) * radius}px`,
          "--y": `${y + (Math.random() * 2 - 1) * radius * 0.7}px`,
        },
        1500,
        (el) => (el.style.animationDelay = `${i * 70}ms`),
      );
    }
  },
};
