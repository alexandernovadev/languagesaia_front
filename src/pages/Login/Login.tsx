/**
 * Login — the first thing people see of Glota.
 *
 * The squad is on stage and reacts to what you do:
 * - arrive      → they wave one after another
 * - type password → they cover their eyes ("¡No miramos!") — sleep pose
 * - checking    → they think
 * - wrong       → they get sad, the field shakes, soft wrong sound
 * - welcome     → they fly (party), confetti, level-up sound, then the app opens
 *
 * There is no public sign-up: accounts are created by an admin.
 */
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Chip, Field, HEROES, Logo, PasswordInput, Robot, SpeechBubble, useRobotMood, type Hero, type Mood } from "../../components";
import { ApiError } from "../../lib/api";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { login, session, type Session } from "../../lib/session";
import { sound } from "../../lib/sound";
import styles from "./Login.module.css";

const SQUAD: Hero[] = ["tula", "lumi", "nubo", "bruno", "menti"];
const MODULE_ICON: Record<Hero, string> = { lumi: "📘", nubo: "💬", tula: "📖", bruno: "🎯", menti: "🧠" };

type Phase = "idle" | "peek" | "checking" | "error" | "welcome";

export function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [say, setSay] = useState("¡Hola! ¿Seguimos aprendiendo?");
  const submitRef = useRef<HTMLButtonElement>(null);

  // one mood controller per hero
  const bots = {
    tula: useRobotMood(),
    lumi: useRobotMood(),
    nubo: useRobotMood(),
    bruno: useRobotMood(),
    menti: useRobotMood(),
  };
  const all = (mood: Mood, stagger = 0) =>
    SQUAD.forEach((h, i) => (stagger ? window.setTimeout(() => bots[h].react(mood), i * stagger) : bots[h].react(mood)));

  // arrival: a wave that travels along the squad
  useEffect(() => {
    const t = window.setTimeout(() => all("wave", 180), 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const busy = phase === "checking" || phase === "welcome";
  const ready = identifier.trim().length > 0 && password.length > 0;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || busy) return;
    setError(null);
    setPhase("checking");
    setSay("Comprobando…");
    all("think");
    try {
      const data: Session = await login(identifier, password);
      setPhase("welcome");
      const name = data.user.firstName && data.user.firstName !== "System" ? data.user.firstName : data.user.username;
      setSay(`¡Bienvenido, ${name}!`);
      all("party", 90);
      sound.play("levelup");
      haptics.celebrate();
      if (submitRef.current) fx.confetti(submitRef.current, 40, 1.5);
      window.setTimeout(() => session.set(data), 1700);
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 401
          ? "Usuario o contraseña incorrectos."
          : err instanceof ApiError
            ? err.message
            : "Algo salió mal. Inténtalo otra vez.";
      setPhase("error");
      setError(msg);
      setErrorKey((k) => k + 1);
      setSay("Mmm… eso no coincide");
      all("sad");
      sound.play("wrong");
      haptics.error();
    }
  };

  const onPasswordFocus = () => {
    if (busy) return;
    setPhase("peek");
    setSay("¡No miramos! 🙈");
    all("sleep", 60);
  };
  const onPasswordBlur = () => {
    if (busy || phase !== "peek") return;
    setPhase("idle");
    setSay("¡Listo cuando tú digas!");
    all("idle");
  };

  return (
    <main className={styles.page}>
      <section className={styles.stage} aria-label="El escuadrón de Glota">
        <div className={styles.brand}>
          <Logo size={88} animated />
          <p className={styles.tagline}>Aprende idiomas con tu escuadrón</p>
          <ul className={styles.modules}>
            {SQUAD.map((h, i) => (
              <li key={h} style={{ "--i": i } as React.CSSProperties}>
                <Chip tint={HEROES[h].tint} icon={MODULE_ICON[h]}>
                  {HEROES[h].module}
                </Chip>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.squad}>
          <div className={styles.bubble}>
            <SpeechBubble>{say}</SpeechBubble>
          </div>
          {SQUAD.map((h, i) => (
            <div key={h} className={styles.member} data-hero={h} style={{ "--i": i } as React.CSSProperties}>
              <Robot hero={h} {...bots[h].props} voice={h === "nubo"} />
              <span className={styles.shadow} aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.panel}>
        <form className={styles.card} onSubmit={onSubmit} noValidate>
          <div className={styles.mobileLogo}>
            <Logo size={52} animated />
          </div>
          <header className={styles.head}>
            <h1>¡Hola de nuevo!</h1>
            <p>Entra para seguir con tu racha.</p>
          </header>

          <Field label="Usuario o correo">
            <input
              type="text"
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="tu usuario"
              value={identifier}
              disabled={busy}
              onChange={(e) => setIdentifier(e.target.value)}
              onFocus={() => phase === "error" && setPhase("idle")}
            />
          </Field>

          <Field label="Contraseña" error={error ? <span key={errorKey}>{error}</span> : undefined}>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              disabled={busy}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
            />
          </Field>

          <Button
            ref={submitRef}
            type="submit"
            size="lg"
            block
            attention={ready && phase !== "error" && !busy}
            loading={phase === "checking"}
            disabled={!ready && !busy}
            tone={phase === "welcome" ? "success" : "brand"}
          >
            {phase === "welcome" ? "¡Vamos!" : "Entrar"}
          </Button>

          <p className={styles.foot}>
            ¿Aún no tienes cuenta? Pídesela a tu administrador.
            <br />
            <span className={styles.heroes}>
              {SQUAD.map((h) => HEROES[h].name).join(" · ")} te esperan.
            </span>
          </p>
        </form>
      </section>
    </main>
  );
}
