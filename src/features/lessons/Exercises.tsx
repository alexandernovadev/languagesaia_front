/**
 * Exercises — one component per exercise type. All share the same contract:
 * `value` is the learner's current answer, `onChange` updates it, and once
 * `checked` is set the exercise locks and reveals the correct answer.
 *
 * choice     → value: option index
 * fillBlank  → value: option index (chip jumps into the gap)
 * order      → value: token indexes in the order tapped
 * translate  → value: text
 * match      → value: { mistakes, done } (pairs lock as you match them)
 * findError  → value: token index
 */
import { useEffect, useMemo, useState } from "react";
import { AnswerOption, RichText } from "../../components";
import { cx } from "../../components/types";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import type { CheckResult, Question } from "./api";
import styles from "./Exercises.module.css";

export interface ExerciseProps<V> {
  q: Question;
  value: V;
  onChange: (v: V) => void;
  checked: CheckResult | null;
}

/* ───────── Elegir la correcta ───────── */
export function Choice({ q, value, onChange, checked }: ExerciseProps<number | null>) {
  return (
    <div className={styles.stack}>
      <p className={styles.sentence}>
        {renderBlank(
          q.prompt,
          checked ? q.options?.[q.answerIndex ?? 0] : value !== null ? q.options?.[value] : null,
          checked ? (checked.correct ? "right" : "wrong") : undefined,
        )}
      </p>
      <div className={styles.options}>
        {q.options?.map((o, i) => {
          const state = !checked
            ? value === i
              ? "selected"
              : "idle"
            : i === q.answerIndex
              ? "right"
              : i === value
                ? "wrong"
                : "dim";
          return (
            <AnswerOption key={i} index={i + 1} state={state} celebrate={false} onClick={() => onChange(i)}>
              {o}
            </AnswerOption>
          );
        })}
      </div>
    </div>
  );
}

/** Splits "She ___ visited" and puts `fill` (or an empty slot) in the gap. */
function renderBlank(text: string, fill: React.ReactNode, state?: "right" | "wrong") {
  const parts = text.split("___");
  if (parts.length === 1) return text;
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && (
        <span className={styles.gap} data-state={state} data-filled={fill ? true : undefined}>
          {fill || " "}
        </span>
      )}
    </span>
  ));
}

/* ───────── Completar el hueco ───────── */
export function FillBlank({ q, value, onChange, checked }: ExerciseProps<number | null>) {
  const shown = checked && !checked.correct ? q.options?.[q.answerIndex ?? 0] : value !== null ? q.options?.[value] : null;
  return (
    <div className={styles.stack}>
      <p className={styles.sentence}>{renderBlank(q.prompt, shown, checked ? (checked.correct ? "right" : "wrong") : undefined)}</p>
      <div className={styles.bank}>
        {q.options?.map((o, i) => (
          <button
            key={i}
            type="button"
            className={styles.chip}
            data-used={value === i || undefined}
            disabled={!!checked}
            onClick={() => {
              sound.play("tap");
              onChange(value === i ? null : i);
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── Ordenar las palabras ───────── */
export function Order({ q, value, onChange, checked }: ExerciseProps<number[]>) {
  const tokens = q.tokens ?? [];
  return (
    <div className={styles.stack}>
      <p className={styles.source}>{q.prompt}</p>
      <div className={styles.line} data-state={checked ? (checked.correct ? "right" : "wrong") : undefined}>
        {value.length === 0 && !checked && <span className={styles.placeholder}>Toca las palabras en orden</span>}
        {value.map((ti, pos) => (
          <button
            key={`${ti}-${pos}`}
            type="button"
            className={cx(styles.chip, styles.placed)}
            disabled={!!checked}
            onClick={() => {
              sound.play("tap");
              onChange(value.filter((_, p) => p !== pos));
            }}
          >
            {tokens[ti]}
          </button>
        ))}
      </div>
      {checked && !checked.correct && (
        <p className={styles.reveal}>
          <b>Correcto:</b> {(q.answerTokens ?? []).join(" ")}
        </p>
      )}
      <div className={styles.bank}>
        {tokens.map((t, i) => (
          <button
            key={i}
            type="button"
            className={styles.chip}
            data-used={value.includes(i) || undefined}
            disabled={!!checked || value.includes(i)}
            onClick={() => {
              sound.play("tap");
              onChange([...value, i]);
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── Traducir ───────── */
export function Translate({ q, value, onChange, checked }: ExerciseProps<string>) {
  return (
    <div className={styles.stack}>
      <p className={styles.source}>{q.prompt}</p>
      <textarea
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribe la traducción…"
        disabled={!!checked}
        autoCapitalize="sentences"
        spellCheck={false}
        rows={3}
      />
      {checked && (
        <div className={styles.grade} data-state={checked.correct ? "right" : "wrong"}>
          <span className={styles.score}>{Math.round(checked.score * 100)}%</span>
          {checked.feedback && <RichText text={checked.feedback} />}
        </div>
      )}
    </div>
  );
}

/* ───────── Unir parejas ───────── */
export function Match({ q, onChange, checked }: ExerciseProps<{ mistakes: number; done: boolean }>) {
  const pairs = q.pairs ?? [];
  const rights = useMemo(() => [...pairs.keys()].sort(() => Math.random() - 0.5), [q]); // eslint-disable-line react-hooks/exhaustive-deps
  const [left, setLeft] = useState<number | null>(null);
  const [right, setRight] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (left === null || right === null) return;
    if (left === right) {
      const next = new Set(done).add(left);
      setDone(next);
      sound.play("tap");
      haptics.tap();
      onChange({ mistakes, done: next.size === pairs.length });
    } else {
      setMistakes((m) => m + 1);
      setWrong([left, right]);
      sound.play("wrong");
      haptics.error();
      onChange({ mistakes: mistakes + 1, done: false });
      window.setTimeout(() => setWrong(null), 450);
    }
    setLeft(null);
    setRight(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, right]);

  const state = (side: "l" | "r", i: number) =>
    done.has(i) ? "matched" : wrong && wrong[side === "l" ? 0 : 1] === i ? "wrong" : (side === "l" ? left : right) === i ? "selected" : undefined;

  return (
    <div className={styles.pairs}>
      <div className={styles.col}>
        {pairs.map((p, i) => (
          <button key={i} type="button" className={styles.pair} data-state={state("l", i)} disabled={done.has(i) || !!checked} onClick={() => setLeft(i)}>
            {p.left}
          </button>
        ))}
      </div>
      <div className={styles.col}>
        {rights.map((i) => (
          <button key={i} type="button" className={styles.pair} data-state={state("r", i)} disabled={done.has(i) || !!checked} onClick={() => setRight(i)}>
            {pairs[i].right}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────── Encuentra el error ───────── */
export function FindError({ q, value, onChange, checked }: ExerciseProps<number | null>) {
  return (
    <div className={styles.stack}>
      <p className={styles.hint}>Toca la palabra incorrecta</p>
      <div className={styles.tokens}>
        {q.tokens?.map((t, i) => {
          const s = checked ? (i === q.errorIndex ? "right" : i === value ? "wrong" : undefined) : value === i ? "selected" : undefined;
          return (
            <button
              key={i}
              type="button"
              className={styles.token}
              data-state={s}
              disabled={!!checked}
              onClick={() => {
                sound.play("tap");
                onChange(i);
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
      {checked && (
        <p className={styles.reveal}>
          <s>{q.tokens?.[q.errorIndex ?? 0]}</s> → <b>{q.correction}</b>
        </p>
      )}
    </div>
  );
}
