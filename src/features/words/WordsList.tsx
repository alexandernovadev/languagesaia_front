/**
 * WordsList — /palabras. Search, filter by difficulty and type, pages, and
 * "Añadir" opens the AI sheet.
 * Only words of the language the user is learning are shown.
 */
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { ModuleTitle, Button, Chip, EmptyState, Icon, Segmented, Skeleton } from "../../components";
import { MODULES } from "../../app/modules";
import { tint } from "../../components/types";
import { useSession } from "../../lib/session";
import { AddWordSheet } from "./AddWordSheet";
import { useVocabularyList } from "./useVocabularyList";
import { ListPager } from "./ListPager";
import { DIFFICULTY, WORD_TYPES, wordsApi, type Difficulty, type Word } from "./api";
import styles from "./Words.module.css";

const DIFF_FILTERS: Array<{ value: Difficulty | ""; label: string; tint: "lilac" | "rose" | "butter" | "mint" }> = [
  { value: "", label: "Todas", tint: "lilac" },
  { value: "hard", label: "Difíciles", tint: "rose" },
  { value: "medium", label: "Medias", tint: "butter" },
  { value: "easy", label: "Fáciles", tint: "mint" },
];

const tapped = () => {
  sound.play("tap");
  haptics.tap();
};

function WordRow({ w, index, last, onOpen }: { w: Word; index: number; last: boolean; onOpen: (id: string) => void }) {
  const d = DIFFICULTY[w.difficulty] ?? DIFFICULTY.hard;
  return (
    <Link id={w._id} to={`${MODULES.words.path}/${w._id}`} onClick={() => (tapped(), onOpen(w._id))} className={styles.row} data-last={last || undefined} style={{ "--i": Math.min(index, 12) } as React.CSSProperties}>
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
  const [adding, setAdding] = useState(false);
  const { search, difficulty, type, filter, items, total, page, pages, goTo, state, filtering, remember, lastId, retry } = useVocabularyList<Word>(MODULES.words.path, language, wordsApi.list);

  return (
    <div className={styles.page} style={tint("sky")}>
      <header className={styles.head}>
        <ModuleTitle hero="lumi" title="Palabras" count={state === "loading" ? undefined : total} />
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
        <input type="search" placeholder="Buscar palabra…" value={search} onChange={(e) => filter({ search: e.target.value })} aria-label="Buscar palabra" />
        <select value={type} onChange={(e) => filter({ type: e.target.value })} aria-label="Tipo de palabra" className={styles.typeSelect}>
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
          <Chip key={f.value || "all"} tint={f.tint} selected={difficulty === f.value} onToggle={() => filter({ difficulty: f.value })}>
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
          action={<Button onClick={retry}>Reintentar</Button>}
        />
      )}

      {state === "ready" && items.length === 0 && (
        <EmptyState
          hero="lumi"
          title={filtering ? "No encontré nada" : "Aún no tienes palabras"}
          text={filtering ? "Prueba con otra búsqueda o quita los filtros." : "Añade la primera y Lumi te la explica con ejemplos, imagen y todo."}
          action={
            filtering ? (
              <Button tone="neutral" onClick={() => filter({ search: "", difficulty: "", type: "" })}>
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

      {items.length > 0 && state === "ready" && (
        <div className={styles.list}>
          {items.map((w, i) => (
            <WordRow key={w._id} w={w} index={i} last={w._id === lastId} onOpen={remember} />
          ))}
        </div>
      )}
      {state === "ready" && <ListPager page={page} pages={pages} onPage={goTo} />}

      <AddWordSheet open={adding} onClose={() => setAdding(false)} language={language} />
    </div>
  );
}
