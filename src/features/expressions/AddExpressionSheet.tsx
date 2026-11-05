/**
 * AddExpressionSheet — type an expression, Nubo analyses it with the AI
 * (meaning, when it's used, examples, Spanish equivalent) and opens it.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button, Field, Icon, Robot, Sheet, toast, useRobotMood } from "../../components";
import { LANGUAGES, MODULES } from "../../app/modules";
import { ApiError } from "../../lib/api";
import { fx } from "../../lib/fx";
import { progress } from "../../lib/progress";
import { sound } from "../../lib/sound";
import styles from "../words/Words.module.css";
import { expressionsApi } from "./api";

const TIPS = [
  "Escuchando cómo la dice la gente…",
  "Buscando en qué situaciones se usa…",
  "Escribiendo ejemplos reales…",
  "Encontrando su equivalente en español…",
  "Midiendo si es formal o informal…",
];

export function AddExpressionSheet({ open, onClose, language }: { open: boolean; onClose: () => void; language: string }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState(0);
  const [secs, setSecs] = useState(0);
  const nubo = useRobotMood();
  const btn = useRef<HTMLButtonElement>(null);
  const lang = LANGUAGES.find((l) => l.value === language);

  useEffect(() => {
    if (!busy) return;
    const a = window.setInterval(() => setTip((t) => (t + 1) % TIPS.length), 3200);
    const b = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
  }, [busy]);

  useEffect(() => {
    if (open) {
      setError(null);
      const t = window.setTimeout(() => nubo.react("wave"), 250);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    setTip(0);
    setSecs(0);
    nubo.react("think");
    try {
      const created = await expressionsApi.generateAndSave(value, language);
      nubo.react("party");
      sound.play("levelup");
      if (btn.current) fx.confetti(btn.current, 30);
      progress.addXp(5);
      toast(`«${created.expression}» guardada`, { tone: "success" });
      window.setTimeout(() => {
        setBusy(false);
        setText("");
        onClose();
        navigate(`${MODULES.expressions.path}/${created._id}`);
      }, 900);
    } catch (err) {
      setBusy(false);
      nubo.react("sad");
      sound.play("wrong");
      const dup = err instanceof ApiError && (err.status === 409 || /duplicate|E11000|exist/i.test(String(err.detail)));
      setError(dup ? "Ya tienes esa expresión guardada." : (err as Error).message);
    }
  };

  return (
    <Sheet open={open} onClose={() => !busy && onClose()} title="Nueva expresión" description={`Nubo la analiza por ti en ${lang?.label.toLowerCase() ?? "tu idioma"} ${lang?.flag ?? ""}`}>
      <form className={styles.add} onSubmit={submit}>
        <div className={styles.addHero}>
          <Robot hero="nubo" {...nubo.props} />
        </div>
        {busy ? (
          <div className={styles.addBusy} role="status" aria-live="polite">
            <b>Analizando «{text.trim()}»</b>
            <p key={tip}>{TIPS[tip]}</p>
            <span>{secs} s</span>
          </div>
        ) : (
          <Field label="Expresión" error={error ?? undefined} hint="Ej.: break the ice, a piece of cake, dar um jeitinho…">
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe una expresión" autoCapitalize="none" spellCheck={false} />
          </Field>
        )}
        <Button ref={btn} type="submit" size="lg" block loading={busy} disabled={!text.trim()} icon={<Icon name="sparkle" size={20} active />}>
          Crear con IA
        </Button>
      </form>
    </Sheet>
  );
}
