/**
 * Sheet — bottom sheet: slides up from the bottom with a grab handle.
 * From 960px up it is a centered modal instead (native.css).
 *
 * The phone-native way to pick options, filter or show quick actions.
 * Close it by dragging the handle down (past 90px or a fast flick), tapping
 * outside, pressing Esc, or any `<form method="dialog">` button.
 * Built on the native `<dialog data-sheet>` so focus is trapped for free.
 *
 * @example
 *   <Sheet open={open} onClose={() => setOpen(false)} title="Which language?">
 *     <label><input type="radio" name="lang" /> English</label>
 *   </Sheet>
 */
import { useEffect, useRef, type ReactNode } from "react";
import { cx } from "../types";
import styles from "./Sheet.module.css";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function Sheet({ open, onClose, title, description, className, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.style.translate = "";
      d.showModal();
    }
    if (!open && d.open) d.close();
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current?.setAttribute("data-dragging", "");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !ref.current) return;
    const dy = Math.max(0, e.clientY - drag.current.y);
    // a bit of resistance when pulling up
    drag.current.dy = dy;
    ref.current.style.translate = `0 ${dy}px`;
  };
  const onUp = () => {
    const d = ref.current;
    const g = drag.current;
    drag.current = null;
    if (!d || !g) return;
    d.removeAttribute("data-dragging");
    const speed = g.dy / Math.max(1, performance.now() - g.t); // px per ms
    d.style.translate = "";
    if (g.dy > 90 || speed > 0.6) d.close();
  };

  return (
    <dialog
      ref={ref}
      data-sheet
      className={cx(styles.root, className)}
      onClose={onClose}
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        if (e.clientY < r.top) e.currentTarget.close();
      }}
    >
      <div className={styles.grab} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} aria-hidden="true" />
      {(title || description) && (
        <header className={styles.head}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
        </header>
      )}
      {children}
    </dialog>
  );
}
