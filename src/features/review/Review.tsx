/**
 * Review — /repasar. Menti's daily flashcard session (Anki-style).
 *
 * 1. Setup: how many cards, which difficulties, review or random order.
 * 2. Session (full screen, no nav): flip the card, answer
 *    Otra vez (forgot → card comes back at the end) · Difícil · Fácil.
 *    Saves the difficulty and +1 "seen" for every card. Space flips, 1/2/3 answer.
 * 3. Done: Menti celebrates, confetti, stats and XP earned.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Button,
  Chip,
  ComboBadge,
  EmptyState,
  Icon,
  ProgressBar,
  ChatPanel,
  RobotStage,
  Segmented,
  Skeleton,
  SpeakButtons,
  useRobotMood,
  type Mood,
} from "../../components";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { progress } from "../../lib/progress";
import { useSession } from "../../lib/session";
import { sound } from "../../lib/sound";
import { DIFFICULTY, WORD_TYPES, wordsApi, type Difficulty, type Word } from "../words/api";
import { WordInfo } from "../words/WordInfo";
import styles from "./Review.module.css";

type Answer = "again" | "hard" | "easy";
const ANSWER: Record<Answer, { difficulty: Difficulty; xp: number; label: string; tone: "danger" | "warning" | "success"; key: string }> = {
  again: { difficulty: "hard", xp: 0, label: "Otra vez", tone: "danger", key: "1" },
  hard: { difficulty: "medium", xp: 1, label: "Difícil", tone: "warning", key: "2" },
  easy: { difficulty: "easy", xp: 3, label: "Fácil", tone: "success", key: "3" },
};

interface Stats {
  again: number;
  hard: number;
  easy: number;
  xp: number;
  bestCombo: number;
}

/* ───────────────────────── Setup ───────────────────────── */
type Cfg = { limit: number; difficulty: Difficulty[]; mode: "review" | "random"; type?: string };

function Setup({ onStart }: { onStart: (cfg: Cfg) => void }) {
  const [limit, setLimit] = useState<"10" | "20" | "30">("20");
  const [type, setType] = useState("");
  const [diff, setDiff] = useState<Difficulty[]>(["hard", "medium"]);
  const [mode, setMode] = useState<"review" | "random">("review");
  const menti = useRobotMood();
  useEffect(() => {
    const t = window.setTimeout(() => menti.react("wave"), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const toggle = (d: Difficulty) => setDiff((v) => (v.includes(d) ? v.filter((x) => x !== d) : [...v, d]));

  return (
    <div className={styles.setup}>
      <RobotStage hero="menti" {...menti.props} say="¡Bip! ¿Cuántas tarjetas hoy?" size={200} />
      <div className={styles.setupCard}>
        <h1>Repaso del día</h1>
        <div className={styles.option}>
          <span>Tarjetas</span>
          <Segmented
            label="Cuántas tarjetas"
            value={limit}
            onChange={setLimit}
            options={[
              { value: "10", label: "10", tint: "mint" },
              { value: "20", label: "20", tint: "mint" },
              { value: "30", label: "30", tint: "mint" },
            ]}
          />
        </div>
        <div className={styles.option}>
          <span>Qué palabras</span>
          <div className={styles.chips}>
            <Chip tint="rose" selected={diff.includes("hard")} onToggle={() => toggle("hard")}>
              Difíciles
            </Chip>
            <Chip tint="butter" selected={diff.includes("medium")} onToggle={() => toggle("medium")}>
              Medias
            </Chip>
            <Chip tint="mint" selected={diff.includes("easy")} onToggle={() => toggle("easy")}>
              Fáciles
            </Chip>
          </div>
        </div>
        <div className={styles.option}>
          <span>Tipo de palabra</span>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de palabra">
            <option value="">Todos los tipos</option>
            {Object.entries(WORD_TYPES).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.option}>
          <span>Orden</span>
          <Segmented
            label="Orden"
            value={mode}
            onChange={setMode}
            options={[
              { value: "review", label: "Las que más cuestan", tint: "mint" },
              { value: "random", label: "Al azar", tint: "mint" },
            ]}
          />
        </div>
        <Button
          tone="success"
          size="lg"
          block
          attention={diff.length > 0}
          disabled={diff.length === 0}
          icon={<Icon name="review" size={22} active />}
          onClick={() => {
            menti.react("party");
            window.setTimeout(() => onStart({ limit: Number(limit), difficulty: diff, mode, type: type || undefined }), 350);
          }}
        >
          Empezar
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Card faces ───────────────────────── */
function Front({ w }: { w: Word }) {
  const d = DIFFICULTY[w.difficulty] ?? DIFFICULTY.hard;
  return (
    <div className={styles.frontFace}>
      <div className={styles.frontMedia}>
        {w.img ? <img src={w.img} alt="" /> : <span className={styles.letter}>{w.word.charAt(0).toUpperCase()}</span>}
        <span className={styles.diffBadge} data-tone={d.tone}>
          {d.label}
        </span>
      </div>
      <div className={styles.frontInfo}>
        <SpeakButtons text={w.word} language={w.language} />
        <b className={styles.cardWord}>{w.word}</b>
        <div className={styles.frontMeta}>
          {w.IPA && <span className={styles.cardIpa}>{w.IPA}</span>}
          {w.type?.[0] && <span className={styles.cardType}>{WORD_TYPES[w.type[0]] ?? w.type[0]}</span>}
        </div>
        <span className={styles.hint}>Toca para girar · Espacio</span>
      </div>
    </div>
  );
}

function Back({ w, onChange, onFlipBack, onMood }: { w: Word; onChange: (w: Word) => void; onFlipBack: () => void; onMood: (m: Mood) => void }) {
  const [tab, setTab] = useState<"info" | "chat">("info");
  return (
    <div className={styles.backFace}>
      <header className={styles.backHead}>
        <div className={styles.backTitle}>
          <span className={styles.backWord}>{w.word}</span>
          <b className={styles.translation}>{w.spanish?.word ?? "—"}</b>
          {w.IPA && <span className={styles.cardIpa}>{w.IPA}</span>}
        </div>
        <div className={styles.backTools}>
          <SpeakButtons text={w.word} language={w.language} size="sm" />
          <Button tone="neutral" size="sm" iconOnly icon={<Icon name="review" size={18} />} aria-label="Volver a la palabra" onClick={onFlipBack} />
        </div>
      </header>
      <Segmented
        label="Sección"
        value={tab}
        onChange={setTab}
        options={[
          { value: "info", label: "Info", icon: "words", tint: "mint" },
          { value: "chat", label: "Chat", icon: "expressions", tint: "mint" },
        ]}
      />
      <div className={styles.backScroll}>
        {tab === "info" ? (
          <WordInfo word={w} onChange={onChange} onMood={onMood} compact />
        ) : (
          <ChatPanel
            hero="lumi"
            load={() => wordsApi.chat(w._id)}
            streamPath={`/api/words/${w._id}/chat/stream`}
            suggestions={["Dame otro ejemplo", "¿Cuándo se usa?", "Explícamelo fácil"]}
          />
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Session ───────────────────────── */
function Session({ cards, onExit, onDone }: { cards: Word[]; onExit: () => void; onDone: (s: Stats) => void }) {
  const [queue, setQueue] = useState<Word[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [leaving, setLeaving] = useState<Answer | null>(null);
  const [combo, setCombo] = useState(0);
  const stats = useRef<Stats>({ again: 0, hard: 0, easy: 0, xp: 0, bestCombo: 0 });
  const requeued = useRef(new Set<string>());
  const menti = useRobotMood();
  const cardRef = useRef<HTMLDivElement>(null);
  const card = queue[index];
  const total = queue.length;

  const flip = useCallback(() => {
    if (leaving) return;
    sound.play("flip");
    haptics.tap();
    setFlipped((f) => !f);
  }, [leaving]);

  const answer = useCallback(
    (a: Answer) => {
      if (!card || !flipped || leaving) return;
      const cfg = ANSWER[a];
      const s = stats.current;
      s[a] += 1;
      s.xp += cfg.xp;
      if (cfg.xp) progress.addXp(cfg.xp);

      if (a === "easy") {
        const c = combo + 1;
        setCombo(c);
        s.bestCombo = Math.max(s.bestCombo, c);
        menti.react(c >= 3 ? "party" : "happy");
        sound.play("correct");
        haptics.success();
        if (cardRef.current) fx.confetti(cardRef.current, 14);
        if (cardRef.current) fx.float(cardRef.current, `+${cfg.xp} XP`);
      } else {
        setCombo(0);
        menti.react(a === "again" ? "sad" : "think");
        sound.play(a === "again" ? "wrong" : "tap");
        if (a === "again") haptics.error();
      }

      // save in the background
      if (card.difficulty !== cfg.difficulty) void wordsApi.setDifficulty(card._id, cfg.difficulty).catch(() => undefined);
      void wordsApi.seen(card._id).catch(() => undefined);

      // "Otra vez": the card comes back once at the end of the session
      if (a === "again" && !requeued.current.has(card._id)) {
        requeued.current.add(card._id);
        setQueue((q) => [...q, { ...card, difficulty: cfg.difficulty }]);
      }

      setLeaving(a);
      window.setTimeout(() => {
        setLeaving(null);
        setFlipped(false);
        setIndex((i) => i + 1);
      }, 380);
    },
    [card, flipped, leaving, combo, menti],
  );

  useEffect(() => {
    if (index >= total && total > 0) onDone(stats.current);
  }, [index, total, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!flipped) flip();
      }
      if (e.key === "1") answer("again");
      if (e.key === "2") answer("hard");
      if (e.key === "3") answer("easy");
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flip, answer, flipped, onExit]);

  if (!card) return null;

  // Rendered on <body>: the page transition uses `translate`, which would trap a fixed overlay.
  return createPortal(
    <div className={styles.session} role="dialog" aria-modal="true" aria-label="Sesión de repaso">
      <header className={styles.sessionTop}>
        <Button tone="neutral" variant="ghost" iconOnly icon={<Icon name="close" />} aria-label="Salir del repaso" onClick={onExit} />
        <ProgressBar value={Math.min(index, total)} max={total} size="md" className={styles.sessionProgress} />
        <span className={styles.counter}>
          {Math.min(index + 1, total)}/{total}
        </span>
      </header>

      <div className={styles.sessionBody}>
        <div className={styles.mentiCorner}>
          <RobotStage hero="menti" {...menti.props} size={110} />
          <ComboBadge count={combo} />
        </div>

        <div className={styles.deck}>
          {/* the next card peeks behind the current one */}
          {queue[index + 1] && <div className={styles.peek} aria-hidden="true" />}
          <div
            key={`${card._id}-${index}`}
            ref={cardRef}
            className={styles.card}
            data-flipped={flipped || undefined}
            data-leaving={leaving ?? undefined}
          >
            <div className={styles.cardInner}>
              <div
                className={`${styles.side} ${styles.front}`}
                role="button"
                tabIndex={flipped ? -1 : 0}
                aria-hidden={flipped}
                aria-label="Ver la respuesta"
                onClick={() => !flipped && flip()}
              >
                <Front w={card} />
              </div>
              <div className={`${styles.side} ${styles.back}`} aria-hidden={!flipped}>
                {flipped && (
                  <Back
                    w={card}
                    onFlipBack={flip}
                    onMood={menti.react}
                    onChange={(u) => setQueue((q) => q.map((x) => (x._id === u._id ? u : x)))}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className={styles.answers}>
        {!flipped ? (
          <Button tone="success" size="lg" block attention onClick={flip} sound={false}>
            Mostrar respuesta
          </Button>
        ) : (
          (Object.keys(ANSWER) as Answer[]).map((a) => (
            <Button key={a} tone={ANSWER[a].tone} size="lg" block sound={false} onClick={() => answer(a)}>
              <span className={styles.key}>{ANSWER[a].key}</span>
              {ANSWER[a].label}
            </Button>
          ))
        )}
      </footer>
    </div>,
    document.body,
  );
}

/* ───────────────────────── Done ───────────────────────── */
function Done({ stats, total, onAgain }: { stats: Stats; total: number; onAgain: () => void }) {
  const navigate = useNavigate();
  const menti = useRobotMood();
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    menti.react("party");
    sound.play("levelup");
    haptics.celebrate();
    const t = window.setTimeout(() => title.current && fx.confetti(title.current, 40, 1.6), 150);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const tiles: Array<[string, number, string]> = [
    ["Fáciles", stats.easy, "mint"],
    ["Difíciles", stats.hard, "butter"],
    ["Otra vez", stats.again, "rose"],
    ["Mejor racha", stats.bestCombo, "lilac"],
  ];
  return (
    <div className={styles.done}>
      <RobotStage hero="menti" {...menti.props} say="¡Memoria de acero!" bubble="top" size={210} />
      <h1 ref={title}>¡Repaso completado!</h1>
      <p className={styles.doneSub}>
        {total} tarjetas · <b>+{stats.xp} XP</b>
      </p>
      <div className={styles.tiles}>
        {tiles.map(([label, n, tone], i) => (
          <div key={label} className={styles.tile} style={{ "--c": `var(--${tone})`, "--i": i } as React.CSSProperties}>
            <b>{n}</b>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className={styles.doneActions}>
        <Button tone="neutral" size="lg" onClick={() => navigate(MODULES.home.path)}>
          Volver al inicio
        </Button>
        <Button tone="success" size="lg" icon={<Icon name="review" size={22} active />} onClick={onAgain}>
          Otra ronda
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export function Review() {
  const language = useSession()?.user.language ?? "en";
  const [phase, setPhase] = useState<"setup" | "loading" | "session" | "done" | "empty" | "error">("setup");
  const [cards, setCards] = useState<Word[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const lastCfg = useRef<Cfg | null>(null);

  const start = async (cfg: Cfg) => {
    lastCfg.current = cfg;
    setPhase("loading");
    try {
      const list = await wordsApi.ankiCards({ ...cfg, language });
      if (!list.length) return setPhase("empty");
      setCards(list);
      setPhase("session");
    } catch {
      setPhase("error");
    }
  };

  const onDone = useCallback((s: Stats) => {
    setStats({ ...s });
    setPhase("done");
  }, []);

  if (phase === "setup") return <Setup onStart={(c) => void start(c)} />;
  if (phase === "loading") return <Skeleton lines={4} />;
  if (phase === "empty")
    return (
      <EmptyState
        hero="menti"
        title="No hay tarjetas con esos filtros"
        text="Prueba con otras dificultades o añade palabras nuevas."
        action={<Button tone="success" onClick={() => setPhase("setup")}>Cambiar filtros</Button>}
      />
    );
  if (phase === "error")
    return (
      <EmptyState
        kind="error"
        hero="menti"
        title="No pude traer tus tarjetas"
        action={<Button onClick={() => lastCfg.current && void start(lastCfg.current)}>Reintentar</Button>}
      />
    );
  if (phase === "done" && stats) return <Done stats={stats} total={stats.easy + stats.hard + stats.again} onAgain={() => lastCfg.current && void start(lastCfg.current)} />;
  return (
    <Session
      cards={cards}
      onExit={() => setPhase("setup")}
      onDone={onDone}
    />
  );
}
