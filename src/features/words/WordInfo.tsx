/**
 * WordInfo — everything we know about a word, section by section:
 * definition (+ Spanish), examples (word highlighted), mixed-language examples,
 * synonyms and word types. An admin can regenerate every AI section (✦).
 *
 * Shared by the word page and the back of review cards.
 * `compact` = lighter sections for small spaces (the card back).
 *
 * @example
 *   <WordInfo word={word} onChange={setWord} onMood={(m) => lumi.react(m)} />
 */
import { useState, type ReactNode } from "react";
import { Button, Card, Chip, Icon, RichText, Skeleton, toast, type Mood } from "../../components";
import { cx } from "../../components/types";
import { useSession } from "../../lib/session";
import { sound } from "../../lib/sound";
import { WORD_TYPES, wordsApi, type Word } from "./api";
import styles from "./WordInfo.module.css";

type Regen = "examples" | "code-switching" | "synonyms" | "types";

function Section({ compact, title, icon, action, children }: { compact?: boolean; title: string; icon?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return compact ? (
    <section className={styles.compactSection}>
      <header className={styles.head}>
        <h3>
          {icon}
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  ) : (
    <Card className={styles.section}>
      <header className={styles.head}>
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

export interface WordInfoProps {
  word: Word;
  onChange: (w: Word) => void;
  /** Lets a hero react to what happens (think while the AI works, happy when done). */
  onMood?: (m: Mood) => void;
  compact?: boolean;
  className?: string;
}

const TENSES = [
  ["presente", "Presente"],
  ["preterito", "Pretérito"],
  ["imperfeito", "Imperfecto"],
  ["futuro", "Futuro"],
  ["subjuntivo", "Subjuntivo"],
] as const;
const ENGLISH_FORMS = [
  ["base", "Base"],
  ["past", "Pasado"],
  ["participle", "Participio"],
  ["gerund", "Gerundio"],
  ["third", "He / she"],
] as const;
const PERSONS = [
  ["eu", "eu"],
  ["voce", "você"],
  ["nos", "nós"],
  ["eles", "eles"],
] as const;

export function WordInfo({ word, onChange, onMood, compact, className }: WordInfoProps) {
  const [busy, setBusy] = useState<Regen | null>(null);
  const isAdmin = useSession()?.user.role === "admin";
  const [showEs, setShowEs] = useState(compact ?? false);
  const highlight = word.word.split(" ")[0];

  const regen = async (what: Regen) => {
    setBusy(what);
    onMood?.("think");
    try {
      const updated = await wordsApi.regenerate(word._id, what, word);
      onChange({ ...word, ...updated });
      onMood?.("happy");
      sound.play("ready");
    } catch (e) {
      onMood?.("sad");
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setBusy(null);
    }
  };

  // the content of a word is shared by everyone
  const regenBtn = (what: Regen) => isAdmin && (
    <Button
      tone="info"
      variant="soft"
      size="sm"
      loading={busy === what}
      disabled={!!busy && busy !== what}
      icon={<Icon name="sparkle" size={18} />}
      onClick={(e) => {
        e.stopPropagation();
        void regen(what);
      }}
    >
      Otros
    </Button>
  );

  return (
    <div className={cx(styles.root, compact && styles.compact, className)}>
      <Section
        compact={compact}
        title="Definición"
        icon={<Icon name="words" active />}
        action={
          word.spanish?.definition && (
            <Button
              tone="neutral"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowEs((v) => !v);
              }}
            >
              {showEs ? "Ocultar español" : "Ver en español"}
            </Button>
          )
        }
      >
        <p className={styles.definition}>{word.definition}</p>
        {showEs && word.spanish?.definition && <p className={styles.definitionEs}>{word.spanish.definition}</p>}
      </Section>

      <Section compact={compact} title="Ejemplos" icon={<Icon name="expressions" active />} action={regenBtn("examples")}>
        {busy === "examples" ? (
          <Skeleton lines={4} />
        ) : (
          <ol className={styles.examples}>
            {word.examples.map((ex, i) => (
              <li key={i} style={{ "--i": i } as React.CSSProperties}>
                <RichText text={ex} highlight={highlight} />
              </li>
            ))}
          </ol>
        )}
      </Section>

      {word.codeSwitching?.length > 0 && (
        <Section compact={compact} title="Mezclando idiomas" icon={<Icon name="globe" />} action={regenBtn("code-switching")}>
          {busy === "code-switching" ? (
            <Skeleton lines={3} />
          ) : (
            <ul className={styles.examples}>
              {word.codeSwitching.map((ex, i) => (
                <li key={i} style={{ "--i": i } as React.CSSProperties}>
                  <RichText text={ex} highlight={highlight} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {word.conjugations && (
        <Section compact={compact} title="Conjugación" icon={<Icon name="review" />}>
          <div className={styles.conjugations}>
            {word.conjugations.forms && (
              <div className={styles.tense}>
                <dl>
                  {ENGLISH_FORMS.map(([form, name]) => (
                    <div key={form}>
                      <dt>{name}</dt>
                      <dd>{word.conjugations?.forms?.[form]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            {TENSES.filter(([key]) => word.conjugations?.[key]).map(([key, label]) => (
              <div key={key} className={styles.tense}>
                <b>{label}</b>
                <dl>
                  {PERSONS.map(([person, name]) => (
                    <div key={person}>
                      <dt>{name}</dt>
                      <dd>{word.conjugations?.[key]?.[person]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section compact={compact} title="Sinónimos" icon={<Icon name="sparkle" />} action={regenBtn("synonyms")}>
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

      <Section compact={compact} title="Tipo de palabra" icon={<Icon name="filter" />} action={regenBtn("types")}>
        {busy === "types" ? (
          <Skeleton lines={1} />
        ) : (
          <div className={styles.chips}>
            {word.type?.map((t) => (
              <Chip key={t} tint="lilac">
                {WORD_TYPES[t] ?? t}
              </Chip>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
