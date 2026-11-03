/**
 * Modal — controlled wrapper around the native `<dialog>` (styled in native.css).
 *
 * Desktop: centered, springs in, blurs what's behind.
 * Phone (≤ 520px): becomes a bottom sheet automatically.
 * Esc, a click outside, or any `<form method="dialog">` button closes it, and
 * `onClose` always fires so your state stays in sync.
 *
 * @example
 *   <Modal open={open} onClose={() => setOpen(false)} title="Lesson complete!">
 *     <p>+40 XP</p>
 *     <Modal.Actions><Button onClick={next}>Next</Button></Modal.Actions>
 *   </Modal>
 */
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  /** Render as a bottom sheet on every screen size. */
  sheet?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Modal({ open, onClose, title, description, sheet, className, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className}
      data-sheet={sheet || undefined}
      onClose={onClose}
      onClick={(e) => {
        // click on the backdrop (the dialog itself, outside its content box)
        if (e.target !== e.currentTarget) return;
        const r = e.currentTarget.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) e.currentTarget.close();
      }}
    >
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

Modal.Actions = function ModalActions({ children }: { children: ReactNode }) {
  return <div className={styles.actions}>{children}</div>;
};
