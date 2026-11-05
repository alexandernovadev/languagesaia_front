/**
 * WordsList — /palabras. Search, filter by difficulty and type, endless list
 * (loads more as you scroll), and "Añadir" opens the AI sheet.
 * Only words of the language the user is learning are shown.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button, Chip, EmptyState, Icon, Segmented, Skeleton } from "../../components";
import { MODULES } from "../../app/modules";
import { tint } from "../../components/types";
import { useSession } from "../../lib/session";
import { AddWordSheet } from "./AddWordSheet";
import { DIFFICULTY, WORD_TYPES, wordsApi, type Difficulty, type Word } from "./api";
import styles from "./Words.module.css";

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

export function WordRow({ w, index }: { w: Word; index: number }) {
  const d = DIFFICULTY[w.difficulty] ?? DIFFICULTY.hard;
  return (
    <Link to={`${MODULES.words.path}/${w._id}`} className={styles.row} style={{ "--i": Math.min(index, 12) } as React.CSSProperties}>
      <span className={styles.thumb}>
        {w.img ? <img src={w.img} alt="" loading="lazy" /> : <span className={styles.letter}>{w.word.charAt(0).toUpperCase()}</span>}
      </span>
      <span className={styles.rowText}>
        <span className={styles.rowTop}>
          <b className={styles.rowWord}>{w.word}</b>
          {w.IPA && <span className={styles.ipa}>{w.IPA}</span>}
        </span>
        <span className={styles.rowSub}>
          {w.spanish?.word && <span className={styles.translation}>{w.spanish.word}</span>}
          {w.type?.[0] && <span className={styles.type}>{WORD_TYPES[w.type[0]] ?? w.type[0]}</span>}
        </span>
      </span>
      <span className={styles.diff} data-tone={d.tone} title={d.label} aria-label={`Dificultad: ${d.label}`} />
      <Icon name="next" size={18} className={styles.chev} />
    </Link>
  );
}

export function WordsList() {
  const navigate = useNavigate();
  const language = useSession()?.user.language ?? "en";
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [type, setType] = useState("");
  const q = useDebounced(search.trim());

  const [items, setItems] = useState<Word[]>([]);
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
        const res = await wordsApi.list({ page: p, limit: 20, search: q, difficulty, type, language }, signal);
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

  // endless scroll
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && state === "ready" && page < pages) void fetchPage(page + 1);
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [state, page, pages, fetchPage]);

  const filtering = !!(q || difficulty || type);

  return (
    <div className={styles.page} style={tint("sky")}>
      <header className={styles.head}>
        <div className={styles.titleRow}>
          <h1>Palabras</h1>
          {state !== "loading" && <span className={styles.count}>{total}</span>}
        </div>
        <Segmented
          label="Tipo de vocabulario"
          value="words"
          onChange={(v) => v === "expressions" && navigate(MODULES.expressions.path)}
          options={[
            { value: "words", label: "Palabras", icon: "words", tint: "sky" },
            { value: "expressions", label: "Expresiones", icon: "expressions", tint: "lilac" },
          ]}
        />
      </header>

      <div className={styles.tools}>
        <input type="search" placeholder="Buscar palabra…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar palabra" />
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de palabra" className={styles.typeSelect}>
          <option value="">Todos los tipos</option>
          {Object.entries(WORD_TYPES).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <Button tone="info" icon={<Icon name="plus" size={20} />} onClick={() => setAdding(true)} className={styles.addBtn}>
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
          hero="lumi"
          title="No pudimos cargar tus palabras"
          text="Revisa tu conexión e inténtalo otra vez."
          action={<Button onClick={() => void fetchPage(1)}>Reintentar</Button>}
        />
      )}

      {(state === "ready" || state === "more") && items.length === 0 && (
        <EmptyState
          hero="lumi"
          title={filtering ? "No encontré nada" : "Aún no tienes palabras"}
          text={filtering ? "Prueba con otra búsqueda o quita los filtros." : "Añade la primera y Lumi te la explica con ejemplos, imagen y todo."}
          action={
            filtering ? (
              <Button tone="neutral" onClick={() => (setSearch(""), setDifficulty(""), setType(""))}>
                Quitar filtros
              </Button>
            ) : (
              <Button tone="info" icon={<Icon name="plus" size={20} />} onClick={() => setAdding(true)}>
                Añadir palabra
              </Button>
            )
          }
        />
      )}

      {items.length > 0 && state !== "loading" && (
        <div className={styles.list}>
          {items.map((w, i) => (
            <WordRow key={w._id} w={w} index={i % 20} />
          ))}
        </div>
      )}
      {state === "more" && <Skeleton rows={2} />}
      <div ref={sentinel} aria-hidden="true" />

      <AddWordSheet open={adding} onClose={() => setAdding(false)} language={language} />
    </div>
  );
}
