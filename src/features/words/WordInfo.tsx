/**
 * WordInfo — everything we know about a word, section by section:
 * definition (+ Spanish), examples (word highlighted), mixed-language examples,
 * synonyms and word types. Every AI section can be regenerated (✦).
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

export function WordInfo({ word, onChange, onMood, compact, className }: WordInfoProps) {
  const [busy, setBusy] = useState<Regen | null>(null);
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

  const regenBtn = (what: Regen) => (
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
