/**
 * Lessons — /lecciones. Bruno trains you, Duolingo-style (no lives, no timer).
 *
 * Home     continue the open lesson, modes (Lección rápida · Lección por tema ·
 *          Repetir errores), weak points per grammar topic, recent lessons.
 * Prepare  Bruno warms up while the AI writes and reviews the exercises.
 * Session  full screen, one exercise at a time: answer → "Comprobar" →
 *          instant result + explanation, "¿Por qué?" opens a chat with Bruno.
 *          Every answer is saved: leaving and coming back loses nothing.
 * Result   score, XP, what to reinforce.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { LevelBadge, DailyGoal,
  Button,
  Card,
  ChatPanel,
  Chip,
  EmptyState,
  FeedbackBanner,
  Icon,
  Modal,
  ProgressBar,
  RichText,
  RobotStage,
  Robot,
  Segmented,
  Sheet,
  Skeleton,
  toast,
  useRobotMood,
} from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { correctAnswerOf, lessonsApi, LEVELS, TYPE_LABEL, type CheckResult, type LessonMode, type LessonStats, type GrammarGroup, type Level, type LessonRun } from "./api";
import { Choice, FillBlank, FindError, Match, Order, Translate } from "./Exercises";
import styles from "./Lessons.module.css";

const LEVEL_KEY = "glota.lessonLevel";
const savedLevel = (): Level => {
  try {
    return (localStorage.getItem(LEVEL_KEY) as Level) || "B1";
  } catch {
    return "B1";
  }
};

/* ───────────────────────── Home ───────────────────────── */
function Home({ onStart, onResume }: { onStart: (cfg: { mode: LessonMode; level?: Level; grammarTopics?: string[]; count?: number }) => void; onResume: (open: LessonRun) => void }) {
  const [stats, setStats] = useState<LessonStats | null>(null);
  const [open, setOpen] = useState<LessonRun | null>(null);
  const [level, setLevel] = useState<Level>(savedLevel());
  const [topicOpen, setTopicOpen] = useState(false);
  const bruno = useRobotMood();

  useEffect(() => {
    lessonsApi.stats().then(setStats).catch(() => setStats({ topics: [], recent: [], mistakes: 0 }));
    lessonsApi.current().then(setOpen).catch(() => undefined);
    const t = window.setTimeout(() => bruno.react("wave"), 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickLevel = (l: Level) => {
    setLevel(l);
    try {
      localStorage.setItem(LEVEL_KEY, l);
    } catch {
      /* ignore */
    }
  };

  const weak = stats?.topics.filter((t) => t.accuracy < 85) ?? [];

  return (
    <div className={styles.home} style={tint("butter")}>
      <section className={styles.hero}>
        <RobotStage hero="bruno" {...bruno.props} say="¡A entrenar, recluta! Sin vidas, sin prisa." size={200} />
        <div className={styles.heroBody}>
          <h1>Lecciones</h1>
          <p>Ejercicios cortos y variados con respuesta al instante. Bruno te explica cada error y recuerda en qué fallas.</p>
          <div className={styles.level}>
            <span>Tu nivel</span>
            <Segmented label="Nivel" value={level} onChange={pickLevel} options={LEVELS.map((l) => ({ value: l, label: l, tint: "butter" as const }))} />
          </div>
        </div>
      </section>

      {open && (
        <button type="button" className={styles.resume} style={tint("butter")} onClick={() => onResume(open)}>
          <span>
            <b>Continuar lección</b>
            <span>{open.lesson.title}</span>
          </span>
          <em>
            {open.answered?.length ?? 0}/{open.lesson.questions.length}
          </em>
          <Icon name="next" size={22} />
        </button>
      )}

      <section className={styles.modes}>
        <button type="button" className={styles.mode} style={tint("butter")} onClick={() => onStart({ mode: "quick", level })}>
          <span className={styles.modeIcon}>⚡</span>
          <b>Lección rápida</b>
          <span>8 ejercicios con tus palabras y tus puntos débiles.</span>
          <em>3–5 min</em>
        </button>
        <button type="button" className={styles.mode} style={tint("sky")} onClick={() => setTopicOpen(true)}>
          <span className={styles.modeIcon}>🎯</span>
          <b>Lección por tema</b>
          <span>Elige los temas de gramática que quieras entrenar.</span>
          <em>10–15 min</em>
        </button>
        <button
          type="button"
          className={styles.mode}
          style={tint("rose")}
          disabled={!stats?.mistakes}
          onClick={() => onStart({ mode: "mistakes", level })}
        >
          <span className={styles.modeIcon}>🔁</span>
          <b>Repetir errores</b>
          <span>{stats?.mistakes ? `Tienes ${stats.mistakes} ${stats.mistakes === 1 ? "error" : "errores"} por dominar.` : "Aún no tienes errores. ¡Bien!"}</span>
          <em>lo que haga falta</em>
        </button>
      </section>

      <div className={styles.columns}>
        <Card>
          <h2 className={styles.cardTitle}>
            <Icon name="lessons" active /> Tus puntos débiles
          </h2>
          {!stats ? (
            <Skeleton lines={3} />
          ) : stats.topics.length === 0 ? (
            <p className={styles.muted}>Haz tu primera lección y aquí verás qué temas te cuestan más.</p>
          ) : (
            <ul className={styles.topics}>
              {stats.topics.slice(0, 6).map((t) => (
                <li key={t.value}>
                  <ProgressBar
                    value={t.accuracy}
                    max={100}
                    size="sm"
                    label={t.label}
                    showValue={false}
                    tone={t.accuracy < 50 ? "danger" : t.accuracy < 85 ? "warning" : "success"}
                  />
                  <span className={styles.pct}>{t.accuracy}%</span>
                </li>
              ))}
            </ul>
          )}
          {weak.length > 0 && (
            <Button tone="warning" variant="soft" size="sm" onClick={() => onStart({ mode: "topic", level, grammarTopics: weak.slice(0, 3).map((t) => t.value), count: 8 })}>
              Entrenar lo más flojo
            </Button>
          )}
        </Card>
        <Card>
          <h2 className={styles.cardTitle}>
            <Icon name="star" active /> Últimas lecciones
          </h2>
          {!stats ? (
            <Skeleton lines={3} />
          ) : stats.recent.length === 0 ? (
            <p className={styles.muted}>Todavía no has hecho ninguna.</p>
          ) : (
            <ul className={styles.recent}>
              {stats.recent.slice(0, 5).map((r) => (
                <li key={r._id}>
                  <span className={styles.recentTitle}>{r.title}</span>
                  <span className={styles.recentScore} data-tone={(r.score ?? 0) >= 85 ? "success" : (r.score ?? 0) >= 50 ? "warning" : "danger"}>
                    {r.score ?? 0}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <TopicSheet open={topicOpen} onClose={() => setTopicOpen(false)} level={level} onStart={(topics, count) => onStart({ mode: "topic", level, grammarTopics: topics, count })} />
    </div>
  );
}

/* ───────────────────────── Topic picker ───────────────────────── */
function TopicSheet({ open, onClose, level, onStart }: { open: boolean; onClose: () => void; level: Level; onStart: (topics: string[], count: number) => void }) {
  const [groups, setGroups] = useState<GrammarGroup[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [count, setCount] = useState<"5" | "10" | "15">("10");
  useEffect(() => {
    if (open && !groups) lessonsApi.catalog().then(setGroups).catch(() => setGroups([]));
  }, [open, groups]);
  const toggle = (v: string) => setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : p.length >= 4 ? p : [...p, v]));
  return (
    <Sheet open={open} onClose={onClose} title="Lección por tema" description={`Elige hasta 4 temas · nivel ${level}`}>
      <div className={styles.sheet}>
        {!groups ? (
          <Skeleton lines={4} />
        ) : (
          groups.map((g) => (
            <div key={g.value} className={styles.group}>
              <span className={styles.groupLabel}>{g.label}</span>
              <div className={styles.chips}>
                {g.topics.map((t) => (
                  <Chip key={t.value} tint="sky" selected={picked.includes(t.value)} onToggle={() => toggle(t.value)}>
                    {t.label}
                    <LevelBadge level={t.level} size="sm" />
                  </Chip>
                ))}
              </div>
            </div>
          ))
        )}
        <div className={styles.group}>
          <span className={styles.groupLabel}>Ejercicios</span>
          <Segmented label="Ejercicios" value={count} onChange={setCount} options={[{ value: "5", label: "5", tint: "sky" }, { value: "10", label: "10", tint: "sky" }, { value: "15", label: "15", tint: "sky" }]} />
        </div>
        <Button
          tone="info"
          size="lg"
          block
          disabled={!picked.length}
          onClick={() => {
            onClose();
            onStart(picked, Number(count));
          }}
        >
          Empezar lección
        </Button>
      </div>
    </Sheet>
  );
}

/* ───────────────────────── Prepare ───────────────────────── */
const TIPS = ["Bruno está calentando…", "Eligiendo ejercicios a tu nivel…", "Metiendo tus palabras difíciles…", "Revisando cada ejercicio…", "¡Casi listo, recluta!"];
function Prepare() {
  const bruno = useRobotMood("think");
  const [tip, setTip] = useState(0);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const a = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 3000);
    const b = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, []);
  return (
    <div className={styles.prepare} style={tint("butter")}>
      <div className={styles.prepareHero}>
        <Robot hero="bruno" {...bruno.props} voice={false} />
      </div>
      <h2>Preparando tu lección</h2>
      <p key={tip} className={styles.tip}>
        {TIPS[tip]}
      </p>
      <span className={styles.secs}>{secs} s</span>
    </div>
  );
}

/* ───────────────────────── Session ───────────────────────── */
type Value = unknown;
const emptyValue = (t: string): Value => (t === "order" ? [] : t === "translate" ? "" : t === "match" ? { mistakes: 0, done: false } : null);
const isAnswered = (t: string, v: Value) =>
  t === "order" ? (v as number[]).length > 0 : t === "translate" ? String(v).trim().length > 1 : t === "match" ? (v as { done: boolean }).done : v !== null;

function Session({ current, startAt, onExit, onDone }: { current: LessonRun; startAt: number; onExit: () => void; onDone: (r: { score: number; xp: number; correct: number; total: number }) => void }) {
  const questions = current.lesson.questions;
  const [index, setIndex] = useState(startAt);
  const q = questions[index];
  const [value, setValue] = useState<Value>(emptyValue(q.type));
  const [checked, setChecked] = useState<CheckResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [why, setWhy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [run, setRun] = useState(0);
  const bruno = useRobotMood();
  const area = useRef<HTMLDivElement>(null);

  const toAnswer = (v: Value) => (q.type === "order" ? (v as number[]).map((i) => q.tokens?.[i] ?? "") : v);

  const check = useCallback(async () => {
    if (checked || checking || !isAnswered(q.type, value)) return;
    setChecking(true);
    if (q.type === "translate") bruno.react("think");
    try {
      const r = await lessonsApi.answer(current.attemptId, index, toAnswer(value));
      setChecked(r);
      if (r.correct) {
        const n = run + 1;
        setRun(n);
        bruno.react(n >= 3 ? "party" : "happy");
        sound.play("correct");
        haptics.success();
        if (area.current) fx.confetti(area.current, 18);
      } else {
        setRun(0);
        bruno.react("sad");
        sound.play("wrong");
        haptics.error();
      }
    } catch {
      setChecked({ correct: false, score: 0, feedback: "No pude comprobarla. Sigue con la siguiente." });
    } finally {
      setChecking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked, checking, value, q, index, run]);

  const next = useCallback(async () => {
    if (index + 1 < questions.length) {
      const nq = questions[index + 1];
      setIndex(index + 1);
      setValue(emptyValue(nq.type));
      setChecked(null);
      bruno.react("idle");
      return;
    }
    try {
      onDone(await lessonsApi.finish(current.attemptId));
    } catch {
      onDone({ score: 0, xp: 0, correct: 0, total: questions.length });
    }
  }, [index, questions, current.attemptId, onDone, bruno]);

  const report = async () => {
    try {
      await lessonsApi.report(current.attemptId, index);
      toast("Ejercicio descartado. No cuenta para tu nota.", { tone: "info" });
    } catch {
      toast("No pude descartarlo. Sigue con el siguiente.", { tone: "danger" });
    }
    await next();
  };

  // Enter = check / continue; 1-4 pick options
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (why || leaving) return;
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT");
      if (e.key === "Enter" && (!typing || e.metaKey || e.ctrlKey || q.type === "translate")) {
        if (typing && q.type === "translate" && e.shiftKey) return;
        e.preventDefault();
        if (checked) void next();
        else void check();
      }
      if (!typing && !checked && (q.type === "choice" || q.type === "fillBlank") && /^[1-4]$/.test(e.key)) setValue(Number(e.key) - 1);
    };
    // On release: the browser would close a dialog opened during the same key press
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !why && !leaving) setLeaving(true);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [check, next, checked, q.type, why, leaving]);

  const Exercise = { choice: Choice, fillBlank: FillBlank, order: Order, translate: Translate, match: Match, findError: FindError }[q.type] as React.ComponentType<{
    q: typeof q;
    value: Value;
    onChange: (v: Value) => void;
    checked: CheckResult | null;
  }>;

  return createPortal(
    <div className={styles.session} role="dialog" aria-modal="true" aria-label="Lección" style={tint("butter")}>
      <header className={styles.top}>
        <Button tone="neutral" variant="ghost" iconOnly icon={<Icon name="close" />} aria-label="Salir" onClick={() => setLeaving(true)} />
        <ProgressBar value={index + (checked ? 1 : 0)} max={questions.length} tone="warning" className={styles.progress} />
        <span className={styles.counter}>
          {index + 1}/{questions.length}
        </span>
      </header>

      <main className={styles.body}>
        <div className={styles.exercise} ref={area} key={index}>
          <div className={styles.kind}>
            <span className={styles.brunoMini}>
              <Robot hero="bruno" {...bruno.props} voice={false} />
            </span>
            <span>{TYPE_LABEL[q.type]}</span>
          </div>
          <Exercise q={q} value={value} onChange={setValue} checked={checked} />
          <Button tone="neutral" variant="ghost" size="sm" className={styles.report} onClick={() => void report()}>
            Este ejercicio está mal
          </Button>
        </div>
      </main>

      <footer className={styles.footer} data-state={checked ? (checked.correct ? "right" : "wrong") : undefined}>
        <div className={styles.footerInner}>
          {checked ? (
            <FeedbackBanner
              kind={checked.correct ? "right" : "wrong"}
              title={checked.correct ? (checked.score < 1 ? "¡Bien!" : "¡Correcto!") : "Casi"}
              detail={
                <>
                  {!checked.correct && q.type !== "translate" && q.type !== "match" && (
                    <span className={styles.answerLine}>
                      Respuesta: <b>{correctAnswerOf(q)}</b>
                    </span>
                  )}
                  {q.explanation && q.type !== "translate" && <RichText text={q.explanation} className={styles.explanation} />}
                </>
              }
              action={
                <div className={styles.actions}>
                  <Button tone="neutral" variant="soft" icon={<Icon name="expressions" size={18} />} onClick={() => setWhy(true)}>
                    ¿Por qué?
                  </Button>
                  <Button tone={checked.correct ? "success" : "danger"} onClick={() => void next()}>
                    Continuar
                  </Button>
                </div>
              }
            />
          ) : (
            <Button tone="warning" size="lg" block loading={checking} disabled={!isAnswered(q.type, value)} attention={isAnswered(q.type, value)} onClick={() => void check()} sound={false}>
              Comprobar
            </Button>
          )}
        </div>
      </footer>

      <Modal open={leaving} onClose={() => setLeaving(false)} title="¿Salir de la lección?" description="Tu progreso queda guardado y puedes continuar cuando quieras.">
        <Modal.Actions>
          <Button tone="neutral" variant="soft" onClick={onExit}>
            Salir
          </Button>
          <Button tone="warning" onClick={() => setLeaving(false)}>
            Seguir
          </Button>
        </Modal.Actions>
      </Modal>

      <Sheet open={why} onClose={() => setWhy(false)} title="Pregúntale a Bruno" description={q.grammarTopic ? `Tema: ${current.topics.find((t) => t.value === q.grammarTopic)?.label ?? q.grammarTopic}` : undefined}>
        {why && (
          <ChatPanel
            hero="bruno"
            load={() => lessonsApi.chat(current.attemptId, index)}
            streamPath={lessonsApi.chatPath(current.attemptId, index)}
            suggestions={["¿Por qué es así?", "Dame otro ejemplo", "¿Cuál es la regla?"]}
          />
        )}
      </Sheet>
    </div>,
    document.body,
  );
}

/* ───────────────────────── Result ───────────────────────── */
function Result({ r, topics, onAgain, onHome }: { r: { score: number; xp: number; correct: number; total: number }; topics: LessonRun["topics"]; onAgain: () => void; onHome: () => void }) {
  const bruno = useRobotMood();
  const title = useRef<HTMLHeadingElement>(null);
  const great = r.score >= 85;
  const ok = r.score >= 50;
  useEffect(() => {
    if (ok) {
      bruno.react("party");
      sound.play("levelup");
      haptics.celebrate();
      const t = window.setTimeout(() => title.current && fx.confetti(title.current, great ? 44 : 24, 1.5), 150);
      return () => window.clearTimeout(t);
    }
    bruno.react("think");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className={styles.result} style={tint("butter")}>
      <RobotStage hero="bruno" {...bruno.props} bubble="top" size={200} say={great ? "¡Así se entrena, recluta!" : ok ? "¡Bien! Vamos a pulir lo que falló." : "Cada error es un músculo nuevo. ¡Otra!"} />
      <h1 ref={title}>{great ? "¡Excelente!" : ok ? "¡Buen entrenamiento!" : "¡A seguir entrenando!"}</h1>
      <div className={styles.ring} style={{ "--p": `${r.score}%` } as React.CSSProperties} data-tone={great ? "success" : ok ? "warning" : "danger"}>
        <span>{r.score}%</span>
      </div>
      <p className={styles.resultSub}>
        {r.correct} de {r.total} correctas · <b>+{r.xp} XP</b>
      </p>
      <DailyGoal compact />
      {topics.length > 0 && (
        <div className={styles.chips}>
          {topics.map((t) => (
            <Chip key={t.value} tint="butter">
              {t.label}
            </Chip>
          ))}
        </div>
      )}
      <div className={styles.resultActions}>
        <Button tone="neutral" size="lg" onClick={onHome}>
          Volver
        </Button>
        <Button tone="warning" size="lg" icon={<Icon name="lessons" size={22} active />} onClick={onAgain}>
          Otra lección
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export function Lessons() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"home" | "prepare" | "session" | "result" | "error">("home");
  const [current, setCurrent] = useState<LessonRun | null>(null);
  const [startAt, setStartAt] = useState(0);
  const [result, setResult] = useState<{ score: number; xp: number; correct: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const last = useRef<Parameters<typeof lessonsApi.create>[0] | null>(null);

  const start = async (cfg: Parameters<typeof lessonsApi.create>[0]) => {
    last.current = cfg;
    setPhase("prepare");
    try {
      setCurrent(await lessonsApi.create(cfg));
      setStartAt(0);
      setPhase("session");
    } catch (e) {
      setError((e as Error).message);
      setPhase("error");
    }
  };

  /** Back to the first exercise without an answer; if none is left, straight to the result. */
  const resume = async (open: LessonRun) => {
    const next = open.lesson.questions.findIndex((_, i) => !open.answered?.includes(i));
    setCurrent(open);
    if (next >= 0) {
      setStartAt(next);
      setPhase("session");
      return;
    }
    setResult(await lessonsApi.finish(open.attemptId));
    setPhase("result");
  };

  if (phase === "prepare") return <Prepare />;
  if (phase === "error")
    return (
      <EmptyState
        kind="error"
        hero="bruno"
        title="Bruno no pudo preparar la lección"
        text={error}
        action={
          <div style={{ display: "flex", gap: 12 }}>
            <Button tone="neutral" onClick={() => setPhase("home")}>
              Volver
            </Button>
            <Button tone="warning" onClick={() => last.current && void start(last.current)}>
              Reintentar
            </Button>
          </div>
        }
      />
    );
  if (phase === "session" && current)
    return (
      <Session
        current={current}
        startAt={startAt}
        onExit={() => setPhase("home")}
        onDone={(r) => {
          setResult(r);
          setPhase("result");
        }}
      />
    );
  if (phase === "result" && result && current)
    return <Result r={result} topics={current.topics} onAgain={() => last.current && void start(last.current)} onHome={() => (setPhase("home"), navigate(MODULES.lessons.path))} />;
  return <Home onStart={(cfg) => void start(cfg)} onResume={(open) => void resume(open)} />;
}
