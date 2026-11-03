/**
 * session — who is logged in. Tokens + user, persisted in localStorage and
 * shared with React through `useSession()`.
 *
 * @example
 *   await login("novask88", "•••");     // throws ApiError on bad credentials
 *   const user = useSession()?.user;
 *   logout();
 */
import { useSyncExternalStore } from "react";

export interface User {
  _id: string;
  username: string;
  email?: string;
  role: "admin" | "user" | string;
  firstName?: string;
  lastName?: string;
  image?: string;
  /** Language being learned, e.g. "en". */
  language: string;
  /** Language used for explanations, e.g. "es". */
  explainsLanguage: string;
}

export interface Session {
  token: string;
  refreshToken: string;
  user: User;
}

const KEY = "glota.session";
const BASE = (import.meta.env.VITE_BACK_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const listeners = new Set<() => void>();

let current: Session | null = (() => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
})();

const save = (s: Session | null) => {
  current = s;
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* private mode: keep it in memory only */
  }
  listeners.forEach((l) => l());
};

let refreshing: Promise<boolean> | null = null;

export const session = {
  get: () => current,
  set: save,
  clear: () => save(null),
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** Exchanges the refresh token for new tokens. Concurrent calls share one request. */
  refresh(): Promise<boolean> {
    if (refreshing) return refreshing;
    const rt = current?.refreshToken;
    if (!rt) return Promise.resolve(false);
    refreshing = fetch(`${BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const { data } = await res.json();
        save({ token: data.accessToken, refreshToken: data.refreshToken, user: data.user });
        return true;
      })
      .catch(() => false)
      .finally(() => (refreshing = null));
    return refreshing;
  },
};

export async function login(identifier: string, password: string): Promise<Session> {
  const { api } = await import("./api");
  const data = await api<Session>("/api/auth/login", { method: "POST", body: { username: identifier.trim(), password }, auth: false });
  // don't switch screens yet: the login page celebrates first, then calls session.set(data)
  return data;
}

export const logout = () => session.clear();

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get);
}
