/**
 * errors — the error a person should see right now. `lib/api` reports what
 * failed, and <ErrorDialog /> shows it. One at a time: the first one stays.
 */
import { useSyncExternalStore } from "react";

export interface AppError {
  message: string;
  reason?: string;
  hint?: string;
  status: number;
  action: string;
  time: Date;
}

const listeners = new Set<() => void>();
let current: AppError | null = null;

const set = (next: AppError | null) => {
  current = next;
  listeners.forEach((l) => l());
};

export const appErrors = {
  report(error: AppError) {
    if (!current) set(error);
  },
  dismiss: () => set(null),
  showing: () => !!current,
};

export const useAppError = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
  );
