/**
 * Toast — short message that springs up from the bottom and leaves on its own.
 *
 * Mount `<Toaster />` once (near the app root), then call `toast()` from anywhere.
 * Tones: success (mint ✓), danger (rose !), info (sky i), ai (peach ✦), or neutral.
 *
 * @example
 *   toast("Saved to Anki", { tone: "success" });
 *   toast("Your story is ready", { tone: "ai", icon: "✦", duration: 5000 });
 */
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Tone } from "../types";
import styles from "./Toast.module.css";

type ToastItem = { id: number; message: ReactNode; tone?: Tone; icon?: ReactNode; duration: number };

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const ICONS: Partial<Record<Tone, string>> = { success: "✓", danger: "!", info: "i", ai: "✦", warning: "!", brand: "★" };

export function toast(message: ReactNode, opts: { tone?: Tone; icon?: ReactNode; duration?: number } = {}) {
  const item: ToastItem = { id: nextId++, message, tone: opts.tone, icon: opts.icon, duration: opts.duration ?? 3000 };
  items = [...items.slice(-2), item]; // never more than 3 on screen
  emit();
  return item.id;
}
const remove = (id: number) => {
  items = items.filter((t) => t.id !== id);
  emit();
};

function ToastView({ item }: { item: ToastItem }) {
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const a = window.setTimeout(() => setLeaving(true), item.duration);
    const b = window.setTimeout(() => remove(item.id), item.duration + 260);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [item]);
  const icon = item.icon ?? (item.tone ? ICONS[item.tone] : null);
  return (
    <div className={styles.toast} data-tone={item.tone} data-leaving={leaving || undefined} role="status">
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      <span className={styles.message}>{item.message}</span>
    </div>
  );
}

export function Toaster() {
  const list = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => items,
  );
  return (
    <div className={styles.region} aria-live="polite">
      {list.map((t) => (
        <ToastView key={t.id} item={t} />
      ))}
    </div>
  );
}
