/**
 * AdminDictionary — /admin/diccionario. The whole shared dictionary, not one
 * learner's list: search it, and find what's missing a picture or details.
 * The filters live in the URL, so going back or sharing the link keeps them,
 * and the #id of the word you opened brings you back to that same row.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Button, Icon, Skeleton } from "../../components";
import { WORD_TYPES } from "../words/api";
import { dictionaryApi, type DictionaryFilters, type DictionaryWord } from "./api";
import styles from "./Admin.module.css";

const START: DictionaryFilters = { language: "en", search: "", type: "", source: "", missing: "", hidden: false, sort: "rank", page: 1 };
const SEARCH_WAIT_MS = 250;

const fromUrl = (params: URLSearchParams): DictionaryFilters => ({
  language: params.get("language") ?? START.language,
  search: params.get("search") ?? "",
  type: params.get("type") ?? "",
  source: params.get("source") ?? "",
  missing: params.get("missing") ?? "",
  hidden: params.get("hidden") === "true",
  sort: params.get("sort") ?? START.sort,
  page: Number(params.get("page")) || START.page,
});

/** Only what differs from the start, so a clean list has a clean URL. */
const toUrl = (filters: DictionaryFilters) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value !== START[key as keyof DictionaryFilters]) params.set(key, String(value));
  return params;
};

/** Where the card's back link returns to: the list as you left it. */
export const lastList = { url: "/admin/diccionario" };

export function AdminDictionary() {
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => fromUrl(params), [params]);
  const [result, setResult] = useState<{ data: DictionaryWord[]; total: number; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (change: Partial<DictionaryFilters>) => setParams(toUrl({ ...filters, page: 1, ...change }), { replace: true });

  useEffect(() => {
    lastList.url = `/admin/diccionario?${params}${hash}`;
  }, [params, hash]);

  // back from a word: its row, where you left it
  useEffect(() => {
    if (result && hash) document.getElementById(hash.slice(1))?.scrollIntoView({ block: "center" });
  }, [result, hash]);

  /** The word goes into this history entry too, so the browser's back finds it as well. */
  const open = (id: string) => {
    lastList.url = `/admin/diccionario?${params}#${id}`;
    window.history.replaceState(window.history.state, "", lastList.url); // right now: a router navigation here would be cut off by the next one
    navigate(id);
  };

  useEffect(() => {
    let stale = false;
    const timer = window.setTimeout(() => {
      dictionaryApi
        .list(filters)
        .then((r) => !stale && setResult(r))
        .catch((e) => !stale && setError((e as Error).message));
    }, SEARCH_WAIT_MS);
    return () => {
      stale = true;
      window.clearTimeout(timer);
    };
  }, [filters]);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Diccionario</h1>
          <p className={styles.muted}>{result ? `${result.total} palabras. Lo que cambies aquí llega a todos los que las tengan.` : "Las palabras de todos."}</p>
        </div>
        <Button size="sm" tone="neutral" variant="soft" sound={false} icon={<Icon name="plus" size={16} />} onClick={() => navigate("nueva")}>
          Nueva palabra
        </Button>
      </header>

      <div className={styles.dictTools}>
        <input type="search" value={filters.search} placeholder="Buscar palabra o traducción…" aria-label="Buscar" onChange={(e) => set({ search: e.target.value })} />
        <select value={filters.language} aria-label="Idioma" onChange={(e) => set({ language: e.target.value })}>
          <option value="en">Inglés</option>
          <option value="pt">Portugués</option>
          <option value="fr">Francés</option>
        </select>
        <select value={filters.type} aria-label="Tipo" onChange={(e) => set({ type: e.target.value })}>
          <option value="">Todos los tipos</option>
          {Object.entries(WORD_TYPES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select value={filters.missing} aria-label="Qué le falta" onChange={(e) => set({ missing: e.target.value })}>
          <option value="">Todas</option>
          <option value="image">Sin imagen</option>
          <option value="details">Ficha incompleta</option>
          <option value="list">No están en mi lista</option>
        </select>
        <select value={filters.source} aria-label="Origen" onChange={(e) => set({ source: e.target.value })}>
          <option value="">Cualquier origen</option>
          <option value="claude">Claude</option>
          <option value="deepseek">DeepSeek</option>
          <option value="gemma">Gemma</option>
          <option value="manual">Agregada a mano</option>
        </select>
        <select value={filters.sort} aria-label="Orden" onChange={(e) => set({ sort: e.target.value })}>
          <option value="rank">Por frecuencia</option>
          <option value="alpha">Alfabético</option>
          <option value="recent">Recientes</option>
        </select>
        <label className={styles.dictCheck}>
          <input type="checkbox" checked={filters.hidden} onChange={(e) => set({ hidden: e.target.checked })} /> Ocultas
        </label>
      </div>

      {error && <p className={styles.notice}>{error}</p>}
      {!result && !error && <Skeleton lines={8} />}
      {result?.data.length === 0 && <p className={styles.muted}>Nada coincide con esos filtros.</p>}

      {result && result.data.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Palabra</th>
                <th>Español</th>
                <th>Tipo</th>
                <th>Imagen</th>
                <th>Ficha</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((w) => (
                <tr key={w._id} id={w._id} className={styles.dictRow} data-last={hash === `#${w._id}` || undefined} onClick={() => open(w._id)}>
                  <td>
                    <Link to={w._id} className={styles.dictWord} onClick={(e) => e.preventDefault()}>
                      {w.word}
                    </Link>{" "}
                    <span className={styles.muted}>{w.IPA}</span>
                  </td>
                  <td>{w.spanish?.word}</td>
                  <td className={styles.muted}>{w.type.map((t) => WORD_TYPES[t] ?? t).join(", ")}</td>
                  <td>{w.img ? "Sí" : <span className={styles.muted}>No</span>}</td>
                  <td>{w.completedAt || w.codeSwitching?.length ? "Completa" : <span className={styles.muted}>Básica</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.pages > 1 && (
        <div className={styles.actions}>
          <Button size="sm" tone="neutral" variant="soft" sound={false} disabled={filters.page <= 1} onClick={() => set({ page: filters.page - 1 })}>
            Anterior
          </Button>
          <span className={styles.muted}>
            Página {filters.page} de {result.pages}
          </span>
          <Button size="sm" tone="neutral" variant="soft" sound={false} disabled={filters.page >= result.pages} onClick={() => set({ page: filters.page + 1 })}>
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}
