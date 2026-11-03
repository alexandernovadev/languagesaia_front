/**
 * AddWordSheet — type a word, Lumi researches it with the AI (definition, IPA,
 * examples, synonyms, translation) and opens it when ready. Takes 10–60 s, so
 * Lumi thinks on screen with rotating tips and a timer.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button, Field, Icon, Robot, Sheet, toast, useRobotMood } from "../../components";
import { MODULES, LANGUAGES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { progress } from "../../lib/progress";
import { sound } from "../../lib/sound";
import { wordsApi } from "./api";
import styles from "./Words.module.css";

const TIPS = [
  "Buscando la definición más clara…",
  "Escuchando cómo se pronuncia (IPA)…",
  "Escribiendo ejemplos de la vida real…",
  "Buscando sinónimos…",
  "Traduciendo al español…",
  "Dando el último repaso…",
];

export function AddWordSheet({ open, onClose, language }: { open: boolean; onClose: () => void; language: string }) {
  const navigate = useNavigate();
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tip, setTip] = useState(0);
  const [secs, setSecs] = useState(0);
  const lumi = useRobotMood();
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
      const t = window.setTimeout(() => lumi.react("wave"), 250);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const w = word.trim();
    if (!w || busy) return;
    setBusy(true);
    setError(null);
    setTip(0);
    setSecs(0);
    lumi.react("think");
    try {
      const created = await wordsApi.generate(w, language);
      lumi.react("party");
      sound.play("levelup");
      if (btn.current) fx.confetti(btn.current, 30);
      progress.addXp(5);
      toast(`«${created.word}» guardada`, { tone: "success" });
      window.setTimeout(() => {
        setBusy(false);
        setWord("");
        onClose();
        navigate(`${MODULES.words.path}/${created._id}`);
      }, 900);
    } catch (err) {
      setBusy(false);
      lumi.react("sad");
      setError((err as Error).message);
      sound.play("wrong");
    }
  };

  return (
    <Sheet open={open} onClose={() => !busy && onClose()} title="Nueva palabra" description={`Lumi la investiga por ti en ${lang?.label.toLowerCase() ?? "tu idioma"} ${lang?.flag ?? ""}`}>
      <form className={styles.add} onSubmit={submit}>
        <div className={styles.addHero}>
          <Robot hero="lumi" {...lumi.props} />
        </div>
        {busy ? (
          <div className={styles.addBusy} role="status" aria-live="polite">
            <b>Investigando «{word.trim()}»</b>
            <p key={tip}>{TIPS[tip]}</p>
            <span>{secs} s</span>
          </div>
        ) : (
          <Field label="Palabra" error={error ?? undefined} hint="Ej.: serendipity, run out, although…">
            <input type="text" value={word} onChange={(e) => setWord(e.target.value)} placeholder="Escribe una palabra" autoCapitalize="none" spellCheck={false} />
          </Field>
        )}
        <Button ref={btn} type="submit" tone="info" size="lg" block loading={busy} disabled={!word.trim()} icon={<Icon name="sparkle" size={20} active />}>
          Crear con IA
        </Button>
      </form>
    </Sheet>
  );
}
