/**
 * WordDetail — /palabras/:id. Everything about one word:
 * image, IPA, translation, types, how hard it is for you, definition (+ Spanish),
 * examples with the word highlighted, mixed-language examples, synonyms,
 * and a chat with Lumi. Every AI section can be regenerated (✦).
 * Opening the page counts as one more "seen".
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Button,
  Card,
  ChatPanel,
  Chip,
  EmptyState,
  Icon,
  Modal,
  RichText,
  Robot,
  Segmented,
  Skeleton,
  toast,
  useRobotMood,
} from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { progress } from "../../lib/progress";
import { sound } from "../../lib/sound";
import { DIFFICULTY, WORD_TYPES, wordsApi, type Difficulty, type Word } from "./api";
import styles from "./WordDetail.module.css";

type Regen = "examples" | "code-switching" | "synonyms" | "types" | "image";

function Section({ title, icon, action, children }: { title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <Card className={styles.section}>
      <header className={styles.sectionHead}>
        <h2>
          {icon}
          {title}
        </h2>
        {action}
      </header>
      {children}
    </Card>
  );
}

export function WordDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState<Regen | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showEs, setShowEs] = useState(false);
  const lumi = useRobotMood();
  const counted = useRef(false);
  const diffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setWord(null);
    setFailed(false);
    wordsApi
      .get(id)
      .then((w) => alive && setWord(w))
      .catch(() => alive && setFailed(true));
    if (!counted.current) {
      counted.current = true;
      void wordsApi.seen(id).catch(() => undefined);
    }
    return () => {
      alive = false;
    };
  }, [id]);

  if (failed)
    return (
      <EmptyState
        kind="error"
        hero="lumi"
        title="No encontré esta palabra"
        action={<Button onClick={() => navigate(MODULES.words.path)}>Volver a Palabras</Button>}
      />
    );
  if (!word)
    return (
      <div className={styles.page}>
        <Skeleton lines={2} />
        <Skeleton rows={3} />
      </div>
    );

  const regen = async (what: Regen) => {
    setBusy(what);
    lumi.react("think");
    try {
      const updated = what === "image" ? await wordsApi.image(word._id, word) : await wordsApi.regenerate(word._id, what, word);
      setWord({ ...word, ...updated });
      lumi.react("happy");
      sound.play("ready");
    } catch (e) {
      lumi.react("sad");
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setBusy(null);
    }
  };

  const setDifficulty = async (d: Difficulty) => {
    if (d === word.difficulty) return;
    const prev = word.difficulty;
    setWord({ ...word, difficulty: d });
    if (d === "easy") {
      lumi.react("party");
      sound.play("correct");
      if (diffRef.current) fx.confetti(diffRef.current, 18);
      progress.addXp(2);
    } else lumi.react(d === "hard" ? "sad" : "happy");
    try {
      await wordsApi.setDifficulty(word._id, d);
    } catch (e) {
      setWord((w) => (w ? { ...w, difficulty: prev } : w));
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const remove = async () => {
    try {
      await wordsApi.remove(word._id);
      toast(`«${word.word}» borrada`, { tone: "info" });
      navigate(MODULES.words.path, { replace: true });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const regenBtn = (what: Regen, label = "Otros") => (
    <Button tone="info" variant="soft" size="sm" loading={busy === what} disabled={!!busy && busy !== what} icon={<Icon name="sparkle" size={18} />} onClick={() => void regen(what)}>
      {label}
    </Button>
  );

  return (
    <div className={styles.page} style={tint("sky")}>
      <Link to={MODULES.words.path} className={styles.back}>
        <Icon name="back" size={20} /> Palabras
      </Link>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.media}>
          {word.img ? (
            <img src={word.img} alt={`Ilustración de ${word.word}`} className={busy === "image" ? styles.dim : undefined} />
          ) : (
            <div className={styles.noImg}>
              <Robot hero="lumi" {...lumi.props} voice={false} />
            </div>
          )}
          <Button
            tone="neutral"
            size="sm"
            className={styles.imgBtn}
            loading={busy === "image"}
            disabled={!!busy && busy !== "image"}
            icon={<Icon name="image" size={18} />}
            onClick={() => void regen("image")}
          >
            {word.img ? "Otra imagen" : "Crear imagen"}
          </Button>
        </div>

        <div className={styles.info}>
          <h1 className={styles.word}>{word.word}</h1>
          <div className={styles.meta}>
            {word.IPA && <span className={styles.ipa}>{word.IPA}</span>}
            {word.spanish?.word && (
              <span className={styles.es}>
                <span aria-hidden="true">→</span> {word.spanish.word}
              </span>
            )}
          </div>
          <div className={styles.chips}>
            {word.type?.map((t) => (
              <Chip key={t} tint="sky">
                {WORD_TYPES[t] ?? t}
              </Chip>
            ))}
            <Chip tint="lilac" icon="👁">
              {word.seen + 1} {word.seen + 1 === 1 ? "vez" : "veces"}
            </Chip>
          </div>
          <div className={styles.diff} ref={diffRef}>
            <span className={styles.diffLabel}>¿Qué tan difícil es para ti?</span>
            <Segmented
              label="Dificultad"
              value={word.difficulty}
              onChange={(d) => void setDifficulty(d)}
              options={[
                { value: "easy", label: DIFFICULTY.easy.label, tint: "mint" },
                { value: "medium", label: DIFFICULTY.medium.label, tint: "butter" },
                { value: "hard", label: DIFFICULTY.hard.label, tint: "rose" },
              ]}
            />
          </div>
        </div>
      </section>

      <div className={styles.columns}>
        <div className={styles.main}>
          <Section
            title="Definición"
            icon={<Icon name="words" active />}
            action={
              word.spanish?.definition && (
                <Button tone="neutral" variant="ghost" size="sm" onClick={() => setShowEs((v) => !v)}>
                  {showEs ? "Ocultar español" : "Ver en español"}
                </Button>
              )
            }
          >
            <p className={styles.definition}>{word.definition}</p>
            {showEs && <p className={styles.definitionEs}>{word.spanish?.definition}</p>}
          </Section>

          <Section title="Ejemplos" icon={<Icon name="expressions" active />} action={regenBtn("examples")}>
            {busy === "examples" ? (
              <Skeleton lines={4} />
            ) : (
              <ol className={styles.examples}>
                {word.examples.map((ex, i) => (
                  <li key={i} style={{ "--i": i } as React.CSSProperties}>
                    <RichText text={ex} highlight={word.word.split(" ")[0]} />
                  </li>
                ))}
              </ol>
            )}
          </Section>

          {word.codeSwitching?.length > 0 && (
            <Section title="Mezclando idiomas" icon={<Icon name="globe" />} action={regenBtn("code-switching")}>
              {busy === "code-switching" ? (
                <Skeleton lines={3} />
              ) : (
                <ul className={styles.examples}>
                  {word.codeSwitching.map((ex, i) => (
                    <li key={i} style={{ "--i": i } as React.CSSProperties}>
                      <RichText text={ex} highlight={word.word.split(" ")[0]} />
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          )}

          <Section title="Sinónimos" icon={<Icon name="sparkle" />} action={regenBtn("synonyms")}>
            {busy === "synonyms" ? (
              <Skeleton lines={1} />
            ) : (
              <div className={styles.chips}>
                {word.synonyms.map((s) => (
                  <Chip key={s} tint="sky">
                    {s}
                  </Chip>
                ))}
              </div>
            )}
          </Section>
        </div>

        <aside className={styles.side}>
          <Section title={`Pregúntale a Lumi`} icon={<Icon name="expressions" active />}>
            <ChatPanel
              hero="lumi"
              load={() => wordsApi.chat(word._id)}
              streamPath={`/api/words/${word._id}/chat/stream`}
              suggestions={["Dame otro ejemplo", "¿Cuándo se usa?", "¿Formal o informal?", "Explícamelo fácil"]}
            />
          </Section>
          <Button tone="danger" variant="soft" block icon={<Icon name="trash" size={20} />} onClick={() => setConfirmDelete(true)}>
            Borrar palabra
          </Button>
        </aside>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`¿Borrar «${word.word}»?`} description="Se borrará con sus ejemplos, imagen y chat. No se puede deshacer.">
        <Modal.Actions>
          <Button tone="neutral" onClick={() => setConfirmDelete(false)}>
            Cancelar
          </Button>
          <Button tone="danger" onClick={() => void remove()}>
            Sí, borrar
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
