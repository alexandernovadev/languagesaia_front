import { useEffect, type RefObject } from "react";

/**
 * Publishes an element's live height as a CSS variable on <html>, so other
 * fixed or sticky boxes can stack above it instead of guessing a size.
 */
export function useHeightVar(ref: RefObject<HTMLElement | null>, name: string, active = true) {
  useEffect(() => {
    const el = ref.current;
    const root = document.documentElement;
    if (!el || !active) return;
    const update = () => root.style.setProperty(name, `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty(name);
    };
  }, [ref, name, active]);
}
