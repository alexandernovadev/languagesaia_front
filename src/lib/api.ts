/**
 * api — tiny fetch wrapper for the Glota backend.
 *
 * The backend answers `{ success: true, message, data }` or `{ success: false, error }`.
 * `api()` returns `data` or throws an `ApiError` with the HTTP status and a
 * user-friendly Spanish message. Authenticated calls send the access token and,
 * on a 401, refresh it once and retry.
 *
 * @example
 *   const words = await api<Word[]>("/api/words");
 *   await api("/api/words", { method: "POST", body: { word: "serendipity" } });
 */
import { appErrors } from "./errors";
import { API_BASE as BASE, session, type Session } from "./session";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public detail?: unknown,
  ) {
    super(message);
  }
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  /** Background work: a failure doesn't open the error dialog. */
  silent?: boolean;
};

/** Failures that aren't the person's doing. A wrong form field is shown next to the field. */
const worthTelling = (status: number) => status === 0 || status === 409 || status === 429 || status >= 500;

const FRIENDLY: Record<number, string> = {
  0: "No pudimos conectar con Glota. Revisa tu conexión.",
  401: "Tu sesión terminó. Vuelve a entrar.",
  403: "No tienes permiso para esto.",
  404: "No encontramos lo que buscas.",
  429: "Demasiados intentos. Espera un momento y vuelve a probar.",
  500: "Algo falló de nuestro lado. Inténtalo otra vez.",
};

async function raw<T>(path: string, { method = "GET", body, auth = true, signal }: Options, retried = false): Promise<T> {
  const headers: Record<string, string> = { "X-Time-Zone": Intl.DateTimeFormat().resolvedOptions().timeZone };
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  const token = session.get()?.token;
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined || isForm ? (body as FormData | undefined) : JSON.stringify(body), signal });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(FRIENDLY[0], 0, e);
  }

  if (res.status === 401 && auth && !retried && session.get()?.refreshToken) {
    const ok = await session.refresh();
    if (ok) return raw<T>(path, { method, body, auth, signal }, true);
    session.clear();
  }

  let json: { success?: boolean; data?: T; error?: string; message?: string; detail?: { reason?: string; hint?: string } } = {};
  try {
    json = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok || json.success === false) {
    const status = res.status;
    throw new ApiError(FRIENDLY[status] ?? FRIENDLY[500], status, json.detail ?? json.error ?? json.message);
  }
  return json.data as T;
}

let failed = 0;
/** How many calls have failed so far: a Button compares it to know how its work ended. */
export const failures = () => failed;

export const api = <T = unknown>(path: string, options: Options = {}) =>
  raw<T>(path, options).catch((e) => {
    if ((e as Error).name !== "AbortError") failed += 1;
    const method = options.method ?? "GET";
    if (e instanceof ApiError && method !== "GET" && !options.silent && worthTelling(e.status)) {
      const detail = e.detail as { reason?: string; hint?: string } | undefined;
      appErrors.report({ message: e.message, reason: detail?.reason, hint: detail?.hint, status: e.status, action: `${method} ${path.split("?")[0]}`, time: new Date() });
    }
    throw e;
  });

/** Throws ApiError on bad credentials. Doesn't start the session: the login page celebrates first, then calls session.set(). */
export const login = (identifier: string, password: string) =>
  api<Session>("/api/auth/login", { method: "POST", body: { username: identifier.trim(), password }, auth: false });

/**
 * Streams a plain-text response chunk by chunk (AI chats).
 * Calls `onChunk` with each new piece and resolves with the full text.
 */
export async function apiStream(path: string, body: unknown, onChunk: (piece: string, full: string) => void, signal?: AbortSignal): Promise<string> {
  const doFetch = () =>
    fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.get()?.token ?? ""}` },
      body: JSON.stringify(body),
      signal,
    });
  let res: Response;
  try {
    res = await doFetch();
    if (res.status === 401) {
      if (await session.refresh()) res = await doFetch();
      else session.clear();
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(FRIENDLY[0], 0, e);
  }
  if (!res.ok || !res.body) throw new ApiError(FRIENDLY[res.status] ?? FRIENDLY[500], res.status);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      const piece = decoder.decode(value, { stream: true });
      full += piece;
      onChunk(piece, full);
    }
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiError(FRIENDLY[500], 500, e); // the answer was cut halfway
  }
  return full;
}
