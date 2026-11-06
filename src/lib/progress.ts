/**
 * progress — XP, level, daily goal and streak, as the backend keeps them.
 * Every action that earns XP answers with a reward; `apply` shows it.
 */
import { useSyncExternalStore } from "react";
import { toast } from "../components/Toast/Toast";
import { api } from "./api";
import { sound } from "./sound";

export type Progress = {
  xp: number;
  level: number;
  levelXp: number;
  levelNeed: number;
  streak: number;
  bestStreak: number;
  freezes: number;
  todayXp: number;
  goal: number;
};

export type Reward = { gained: number; goalReached: boolean; leveledUp: boolean; progress: Progress };

const listeners = new Set<() => void>();
let state: Progress | null = null;

const set = (next: Progress) => {
  state = next;
  listeners.forEach((l) => l());
};

try {
  localStorage.removeItem("glota.progress"); // the old XP, from when it lived in the browser
} catch {
  /* ignore */
}

export const progress = {
  get: () => state,
  async load() {
    set(await api<Progress>("/api/progress"));
  },
  apply(reward?: Reward | null) {
    if (!reward) return;
    // answers can arrive out of order: the highest XP is the newest
    if (!state || reward.progress.xp >= state.xp) set(reward.progress);
    if (reward.goalReached) {
      sound.play("levelup");
      toast(`¡Meta del día cumplida! Racha de ${reward.progress.streak} ${reward.progress.streak === 1 ? "día" : "días"}`, { tone: "success" });
    }
    if (reward.leveledUp) {
      sound.play("levelup");
      toast(`¡Subiste al nivel ${reward.progress.level}!`, { tone: "success" });
    }
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export const useProgress = () => useSyncExternalStore(progress.subscribe, progress.get);
