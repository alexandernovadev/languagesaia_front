/** Semantic color roles from tokens.css. `neutral` = graphite, no pastel. */
export type Tone = "brand" | "success" | "danger" | "warning" | "info" | "ai";

/** Raw pastel names, for things colored by identity (modules, heroes, CEFR). */
export type Pastel = "lilac" | "sky" | "mint" | "butter" | "peach" | "rose";

export type Size = "sm" | "md" | "lg";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

/** Joins class names, skipping falsy ones. */
export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/** CSS variables for any pastel, so a component can be tinted with `style={tint("sky")}`. */
export const tint = (p: Pastel) =>
  ({ "--c": `var(--${p})`, "--c-deep": `var(--${p}-deep)`, "--c-soft": `var(--${p}-soft)` }) as React.CSSProperties;
