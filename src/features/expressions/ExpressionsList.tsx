/**
 * ExpressionsList — /expresiones. Nubo's collection: search, filter by type
 * (modismo, frase, colocación, jerga, formal, informal) and difficulty,
 * endless list, and "Añadir" opens the AI sheet. Same layout as Palabras,
 * tinted lilac (styles are shared with the words module).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Chip, EmptyState, Icon, Segmented, Skeleton } from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { useSession } from "../../lib/session";
import { DIFFICULTY, type Difficulty } from "../words/api";
import styles from "../words/Words.module.css";
import { AddExpressionSheet } from "./AddExpressionSheet";
import { EXPRESSION_TYPES, expressionsApi, type Expression } from "./api";

const DIFF_FILTERS: Array<{ value: Difficulty | ""; label: string; tint: "lilac" | "rose" | "butter" | "mint" }> = [
  { value: "", label: "Todas", tint: "lilac" },
  { value: "hard", label: "Difíciles", tint: "rose" },
  { value: "medium", label: "Medias", tint: "butter" },
  { value: "easy", label: "Fáciles", tint: "mint" },
];

function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), ms);
    return () => window.clearTimeout(t);
  }, [value, ms]);
  return v;
}

function ExpressionRow({ e, index }: { e: Expression; index: number }) {
  const d = DIFFICULTY[e.difficulty] ?? DIFFICULTY.hard;
  return (
    <Link to={`${MODULES.expressions.path}/${e._id}`} className={styles.row} style={{ "--i": Math.min(index, 12) } as React.CSSProperties}>
      <span className={styles.thumb}>
        {e.img ? (
          <img src={e.img} alt="" loading="lazy" />
        ) : (
          <span className={styles.letter}>
            <Icon name="expressions" size={30} active />
          </span>
        )}
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTop}>
          <b className={styles.rowWord}>{e.expression}</b>
        </span>
        <span className={styles.rowSub}>
          {e.spanish?.expression && <span className={styles.translation}>{e.spanish.expression}</span>}
          {e.type?.[0] && <span className={styles.type}>{EXPRESSION_TYPES[e.type[0]] ?? e.type[0]}</span>}
        </span>
      </span>
      <span className={styles.diff} data-tone={d.tone} title={d.label} aria-label={`Dificultad: ${d.label}`} />
      <Icon name="next" size={18} className={styles.chev} />
    </Link>
  );
}

export function ExpressionsList() {
  const navigate = useNavigate();
  const language = useSession()?.user.language ?? "en";
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [type, setType] = useState("");
  const q = useDebounced(search.trim());

  const [items, setItems] = useState<Expression[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [state, setState] = useState<"loading" | "ready" | "more" | "error">("loading");
  const [adding, setAdding] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (p: number, signal?: AbortSignal) => {
      setState(p === 1 ? "loading" : "more");
      try {
        const res = await expressionsApi.list({ page: p, limit: 20, search: q, difficulty, type, language }, signal);
        setItems((prev) => (p === 1 ? res.data : [...prev, ...res.data]));
        setTotal(res.total);
        setPages(res.pages);
        setPage(p);
        setState("ready");
      } catch (e) {
        if ((e as Error).name !== "AbortError") setState("error");
      }
    },
    [q, difficulty, type, language],
  );

  useEffect(() => {
    const ctrl = new AbortController();
    void fetchPage(1, ctrl.signal);
    return () => ctrl.abort();
  }, [fetchPage]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && state === "ready" && page < pages) void fetchPage(page + 1);
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [state, page, pages, fetchPage]);

  const filtering = !!(q || difficulty || type);

  return (
    <div className={styles.page} style={tint("lilac")}>
      <header className={styles.head}>
        <div className={styles.titleRow}>
          <h1>Expresiones</h1>
          {state !== "loading" && <span className={styles.count}>{total}</span>}
        </div>
        <Segmented
          label="Tipo de vocabulario"
          value="expressions"
          onChange={(v) => v === "words" && navigate(MODULES.words.path)}
          options={[
            { value: "words", label: "Palabras", icon: "words", tint: "sky" },
            { value: "expressions", label: "Expresiones", icon: "expressions", tint: "lilac" },
          ]}
        />
      </header>

      <div className={styles.tools}>
        <input type="search" placeholder="Buscar expresión…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar expresión" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de expresión" className={styles.typeSelect}>
          <option value="">Todos los tipos</option>
          {Object.entries(EXPRESSION_TYPES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <Button tone="brand" icon={<Icon name="plus" size={20} />} onClick={() => setAdding(true)} className={styles.addBtn}>
          Añadir
        </Button>
      </div>

      <div className={styles.chips} role="group" aria-label="Dificultad">
        {DIFF_FILTERS.map((f) => (
          <Chip key={f.value || "all"} tint={f.tint} selected={difficulty === f.value} onToggle={() => setDifficulty(f.value)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {state === "loading" && <Skeleton rows={7} />}

      {state === "error" && (
        <EmptyState
          kind="error"
          hero="nubo"
          title="No pude cargar tus expresiones"
          text="Revisa tu conexión e inténtalo otra vez."
          action={<Button onClick={() => void fetchPage(1)}>Reintentar</Button>}
        />
      )}

      {(state === "ready" || state === "more") && items.length === 0 && (
        <EmptyState
          hero="nubo"
          title={filtering ? "No encontré nada" : "Aún no tienes expresiones"}
          text={filtering ? "Prueba con otra búsqueda o quita los filtros." : "Añade la primera: Nubo te explica cuándo y cómo se dice."}
          action={
            filtering ? (
              <Button tone="neutral" onClick={() => (setSearch(""), setDifficulty(""), setType(""))}>
                Quitar filtros
              </Button>
            ) : (
              <Button icon={<Icon name="plus" size={20} />} onClick={() => setAdding(true)}>
                Añadir expresión
              </Button>
            )
          }
        />
      )}

      {items.length > 0 && state !== "loading" && (
        <div className={styles.list}>
          {items.map((e, i) => (
            <ExpressionRow key={e._id} e={e} index={i % 20} />
          ))}
        </div>
      )}
      {state === "more" && <Skeleton rows={2} />}
      <div ref={sentinel} aria-hidden="true" />

      <AddExpressionSheet open={adding} onClose={() => setAdding(false)} language={language} />
    </div>
  );
}
