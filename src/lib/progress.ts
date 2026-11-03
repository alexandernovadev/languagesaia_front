/**
 * progress — XP and streak shown in the top bar.
 * TEMPORARY: kept in localStorage until the backend stores them
 * (decided: XP/streak/daily goal will live in the backend).
 */
import { useSyncExternalStore } from "react";

type Progress = { xp: number; streak: number };
const KEY = "glota.progress";
const listeners = new Set<() => void>();
let state: Progress = (() => {
  try {
    return { xp: 0, streak: 0, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { xp: 0, streak: 0 };
  }
})();

export const progress = {
  get: () => state,
  addXp(n: number) {
    state = { ...state, xp: state.xp + n };
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useProgress = () => useSyncExternalStore(progress.subscribe, progress.get);
