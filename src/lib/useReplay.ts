/**
 * useReplay — restart a CSS animation on demand, even if it is the same one again.
 *
 * Sets `data-anim="<name>"` on the element after forcing a reflow, so CSS like
 * `.root[data-anim="pop"] { animation: pop … }` replays every time you call it.
 *
 * @example
 *   const [ref, replay] = useReplay<HTMLSpanElement>();
 *   useEffect(() => replay("bump"), [count]);
 *   return <span ref={ref} className={styles.counter}>{count}</span>;
 */
import { useCallback, useRef } from "react";

export function useReplay<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const replay = useCallback((name: string) => {
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("data-anim");
    void el.offsetWidth; // reflow → the browser forgets the previous run
    el.setAttribute("data-anim", name);
  }, []);
  return [ref, replay] as const;
}
