/**
 * Card — the graphite surface everything sits on.
 *
 * - default: calm card, 2px border, big bubble corners
 * - `tint`: a soft glow of a pastel from the corner (use the module color)
 * - `onClick`: becomes a pressable 3D tile (renders a `<button>`), lifts on hover
 * - `selected`: highlighted border + 3D edge in its color
 *
 * @example
 *   <Card>Plain content</Card>
 *   <Card tint="sky" onClick={openWords}>Words · 248</Card>
 *   <Card tint="lilac" selected>Chosen</Card>
 */
import type { HTMLAttributes, ReactNode } from "react";
import { cx, tint as tintVars, type Pastel } from "../types";
import styles from "./Card.module.css";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  tint?: Pastel;
  padding?: "sm" | "md" | "lg";
  selected?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function Card({ tint, padding = "md", selected, onClick, className, style, children, ...rest }: CardProps) {
  const props = {
    className: cx(styles.root, className),
    "data-tinted": tint ? true : undefined,
    "data-padding": padding === "md" ? undefined : padding,
    style: { ...(tint ? tintVars(tint) : null), ...style },
    ...rest,
  };
  if (onClick) {
    return (
      <button type="button" data-interactive aria-pressed={selected} onClick={onClick} {...props}>
        {children}
      </button>
    );
  }
  return (
    <div aria-current={selected || undefined} {...props}>
      {children}
    </div>
  );
}
