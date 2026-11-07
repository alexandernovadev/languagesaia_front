/**
 * ExpressionsList — /expresiones. Nubo's collection: search, filter by type
 * (modismo, frase, colocación, jerga, formal, informal) and difficulty,
 * pages, and "Añadir" opens the AI sheet. Same layout as Palabras,
 * tinted lilac (styles are shared with the words module).
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { ModuleTitle, Button, Chip, EmptyState, Icon, Segmented, Skeleton } from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { useSession } from "../../lib/session";
import { DIFFICULTY, type Difficulty } from "../words/api";
import { useVocabularyList } from "../words/useVocabularyList";
import { ListPager } from "../words/ListPager";
import styles from "../words/Words.module.css";
import { AddExpressionSheet } from "./AddExpressionSheet";
import { EXPRESSION_TYPES, expressionsApi, type Expression } from "./api";

const DIFF_FILTERS: Array<{ value: Difficulty | ""; label: string; tint: "lilac" | "rose" | "butter" | "mint" }> = [
  { value: "", label: "Todas", tint: "lilac" },
  { value: "hard", label: "Difíciles", tint: "rose" },
  { value: "medium", label: "Medias", tint: "butter" },
  { value: "easy", label: "Fáciles", tint: "mint" },
];

function ExpressionRow({ e, index, last, onOpen }: { e: Expression; index: number; last: boolean; onOpen: (id: string) => void }) {
  const d = DIFFICULTY[e.difficulty] ?? DIFFICULTY.hard;
  return (
    <Link
      id={e._id}
      to={`${MODULES.expressions.path}/${e._id}`}
      onClick={() => {
        sound.play("tap");
        haptics.tap();
        onOpen(e._id);
      }}
      className={styles.row} data-last={last || undefined} style={{ "--i": Math.min(index, 12) } as React.CSSProperties}>
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
  const [adding, setAdding] = useState(false);
  const { search, difficulty, type, filter, items, total, page, pages, goTo, state, filtering, remember, lastId, retry } = useVocabularyList<Expression>(MODULES.expressions.path, language, expressionsApi.list);

  return (
    <div className={styles.page} style={tint("lilac")}>
      <header className={styles.head}>
        <ModuleTitle hero="nubo" title="Expresiones" count={state === "loading" ? undefined : total} />
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
        <input type="search" placeholder="Buscar expresión…" value={search} onChange={(e) => filter({ search: e.target.value })} aria-label="Buscar expresión" />
        <select value={type} onChange={(e) => filter({ type: e.target.value })} aria-label="Tipo de expresión" className={styles.typeSelect}>
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
          <Chip key={f.value || "all"} tint={f.tint} selected={difficulty === f.value} onToggle={() => filter({ difficulty: f.value })}>
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
          action={<Button onClick={retry}>Reintentar</Button>}
        />
      )}

      {state === "ready" && items.length === 0 && (
        <EmptyState
          hero="nubo"
          title={filtering ? "No encontré nada" : "Aún no tienes expresiones"}
          text={filtering ? "Prueba con otra búsqueda o quita los filtros." : "Añade la primera: Nubo te explica cuándo y cómo se dice."}
          action={
            filtering ? (
              <Button tone="neutral" onClick={() => filter({ search: "", difficulty: "", type: "" })}>
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

      {items.length > 0 && state === "ready" && (
        <div className={styles.list}>
          {items.map((e, i) => (
            <ExpressionRow key={e._id} e={e} index={i} last={e._id === lastId} onOpen={remember} />
          ))}
        </div>
      )}
      {state === "ready" && <ListPager page={page} pages={pages} onPage={goTo} />}

      <AddExpressionSheet open={adding} onClose={() => setAdding(false)} language={language} />
    </div>
  );
}
