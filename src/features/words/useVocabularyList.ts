/**
 * What Palabras and Expresiones share: everything lives in the URL.
 * `?difficulty=hard&page=3#id` is the filters, the page and the row you opened,
 * so coming back from a card finds the list exactly as you left it.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router";
import type { Difficulty, Page } from "./api";

const PAGE_SIZE = 24;
const SEARCH_WAIT_MS = 300;

export type ListQuery = { page: number; limit: number; search: string; difficulty: Difficulty | ""; type: string; language: string };

/** Where each list's back link returns to: the list as you left it. */
const lastUrls = new Map<string, string>();
export const listUrl = (base: string) => lastUrls.get(base) ?? base;

function useDebounced<T>(value: T) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), SEARCH_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [value]);
  return debounced;
}

export function useVocabularyList<T extends { _id: string }>(base: string, language: string, list: (query: ListQuery, signal?: AbortSignal) => Promise<Page<T>>) {
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const difficulty = (params.get("difficulty") ?? "") as Difficulty | "";
  const type = params.get("type") ?? "";
  const page = Number(params.get("page")) || 1;
  const q = useDebounced(search.trim());

  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const scrolledTo = useRef("");

  const write = useCallback(
    (change: { search?: string; difficulty?: string; type?: string; page?: number }) => {
      const next = new URLSearchParams();
      const all = { search, difficulty, type, page: 1, ...change };
      for (const [key, value] of Object.entries(all)) if (value && !(key === "page" && value === 1)) next.set(key, String(value));
      setParams(next, { replace: true });
    },
    [search, difficulty, type, setParams],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    setState("loading");
    list({ page, limit: PAGE_SIZE, search: q, difficulty, type, language }, ctrl.signal)
      .then((res) => {
        setItems(res.data);
        setTotal(res.total);
        setPages(res.pages);
        setState("ready");
      })
      .catch((e) => (e as Error).name !== "AbortError" && setState("error"));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, difficulty, type, language, attempt]);

  useEffect(() => {
    lastUrls.set(base, `${base}?${params}${hash}`);
  }, [base, params, hash]);

  // back from a card: its row, where you left it
  useEffect(() => {
    if (state !== "ready" || !hash || scrolledTo.current === hash) return;
    scrolledTo.current = hash;
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: "center" });
  }, [state, hash]);

  /** Written right away: the link's own navigation comes next. */
  const remember = useCallback(
    (id: string) => {
      const url = `${base}?${params}#${id}`;
      lastUrls.set(base, url);
      window.history.replaceState(window.history.state, "", url);
    },
    [base, params],
  );

  const goTo = (next: number) => {
    write({ page: next });
    window.scrollTo({ top: 0 });
  };

  return {
    search,
    difficulty,
    type,
    filter: write,
    items,
    total,
    page,
    pages,
    goTo,
    state,
    filtering: !!(q || difficulty || type),
    remember,
    lastId: hash.slice(1),
    retry: () => setAttempt((n) => n + 1),
  };
}
