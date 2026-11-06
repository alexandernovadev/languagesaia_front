/**
 * Catalog — living showcase of the Glota design system.
 * Every component, every state and every effect, working together.
 * Route: /catalogo, in development only.
 */
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  AIThinking,
  AnswerOption,
  Button,
  Card,
  Chip,
  ComboBadge,
  FeedbackBanner,
  Field,
  FlashCard,
  HEROES,
  LevelBadge,
  Logo,
  Modal,
  PageTransition,
  ProgressBar,
  RobotStage,
  Robot,
  Sheet,
  SoundToggle,
  StreakCounter,
  StreamingText,
  XPCounter,
  toast,
  tint,
  useFakeStream,
  useRobotMood,
  type AnswerState,
  type Hero,
  type Mood,
} from "../../components";
import { fx } from "../../lib/fx";
import { sound } from "../../lib/sound";
import { DesignDocs } from "./DesignDocs";
import styles from "./Catalog.module.css";

const QUESTIONS = [
  { q: "¿Cuál es correcta?", o: ["She have visited London.", "She has visited London.", "She has visit London."], ok: 1 },
  { q: "¿Qué significa «whimsical»?", o: ["Caprichoso y encantador", "Muy aburrido", "Enfadado"], ok: 0 },
  { q: "Completa: I ___ to the gym every day.", o: ["goes", "going", "go"], ok: 2 },
];
const MOODS: Array<[Mood, string]> = [
  ["wave", "Saludar"],
  ["happy", "Acierto"],
  ["party", "¡A volar!"],
  ["think", "Pensando"],
  ["sad", "Fallo"],
  ["sleep", "Dormido"],
];
const LINES: Partial<Record<Mood, string>> = {
  happy: "¡Eso es! +10 XP",
  party: "¡Lección completa!",
  think: "Pensando…",
  sad: "Casi. ¡Otra vez!",
  sleep: "Zzz…",
};
const STORY =
  "Every night, Marta climbed the spiral staircase of the old lighthouse. The wind howled against the windows, but she was never afraid. Up there, the sea told her stories in a language only she understood.";

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2>{title}</h2>
        <code>{code}</code>
      </div>
      {children}
    </section>
  );
}

export function Catalog() {
  const navigate = useNavigate();

  // header rewards
  const [xp, setXp] = useState(120);
  const [streak, setStreak] = useState(6);

  // ── Quiz moment ──
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const quizBot = useRobotMood("idle");
  const [say, setSay] = useState("¡Tú puedes!");
  const q = QUESTIONS[qi % QUESTIONS.length];
  const answered = picked !== null;
  const stateOf = (i: number): AnswerState => {
    if (!answered) return "idle";
    if (i === picked) return i === q.ok ? "right" : "wrong";
    if (i === q.ok && picked !== q.ok) return "right";
    return "dim";
  };
  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === q.ok) {
      const n = run + 1;
      setRun(n);
      setXp((v) => v + 10);
      quizBot.react(n >= 3 ? "party" : "happy");
      setSay(n >= 3 ? "¡Imparable!" : ["¡Bien hecho!", "¡Exacto!", "¡Genial!"][n % 3]);
      if (n === 3) setStreak((s) => s + 1);
    } else {
      setRun(0);
      quizBot.react("sad");
      setSay("Casi. ¡Sigue, vas bien!");
    }
  };
  const nextQuestion = () => {
    setQi((n) => n + 1);
    setPicked(null);
    quizBot.react("idle");
    setSay("¡Tú puedes!");
  };

  // ── Squad ──
  const [hero, setHero] = useState<Hero>("lumi");
  const squadBot = useRobotMood("wave");
  const [squadSay, setSquadSay] = useState(HEROES.lumi.hello);

  // ── Buttons ──
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [loading, setLoading] = useState(false);
  const flipFeedback = () => setFeedback((f) => (f === "success" ? "error" : "success"));

  // ── Misc ──
  const [chips, setChips] = useState({ noun: true, verb: false, phrasal: true, idiom: false });
  const [step, setStep] = useState(2);
  const [thinking, setThinking] = useState(true);
  const stream = useFakeStream(STORY, 90);
  const [modal, setModal] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [email, setEmail] = useState("esto no es un correo");
  const [screen, setScreen] = useState<"words" | "stories">("words");

  return (
    <main className={styles.page}>
      <div className={styles.top}>
        <Logo variant="symbol" size={36} animated />
        <XPCounter value={xp} />
        <StreakCounter days={streak} />
        <Button tone="neutral" size="sm" onClick={() => navigate("/perfil")}>
          Volver
        </Button>
      </div>

      <header className={styles.hero}>
        <span className={styles.eyebrow}>Sistema de diseño · componentes</span>
        <h1>
          Todo Glota, <span>vivo</span>
        </h1>
        <p>
          Cada componente con sus estados, sonidos y efectos. Cada toque, acierto y robot tiene su voz.
        </p>
      </header>

      <DesignDocs />

      {/* ───────── QUIZ MOMENT ───────── */}
      <Section title="El momento de responder" code="RobotStage · AnswerOption · FeedbackBanner · XP · racha · combo">
        <Card tint="lilac" padding="lg">
          <div className={styles.quiz}>
            <RobotStage hero="nubo" {...quizBot.props} say={say} size={230} />
            <div className={styles.stack}>
              <div className={styles.quizStats}>
                <ProgressBar value={qi % 3} max={3} size="sm" className={styles.wide} />
                <ComboBadge count={run} />
              </div>
              <div className={styles.question}>{q.q}</div>
              <div className={styles.stack}>
                {q.o.map((text, i) => (
                  <AnswerOption key={`${qi}-${i}`} index={i + 1} state={stateOf(i)} xp={10} onClick={() => choose(i)}>
                    {text}
                  </AnswerOption>
                ))}
              </div>
              {answered && (
                <FeedbackBanner
                  key={qi}
                  kind={picked === q.ok ? "right" : "wrong"}
                  title={picked === q.ok ? "¡Correcto!" : "Casi"}
                  detail={picked === q.ok ? "+10 XP" : `Era: ${q.o[q.ok]}`}
                  action={
                    <Button tone={picked === q.ok ? "success" : "danger"} onClick={nextQuestion} block>
                      Continuar
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </Card>
        <p className={styles.note}>Acierta 3 seguidas: Nubo despega, aparece el combo y la racha sube.</p>
      </Section>

      {/* ───────── BUTTONS ───────── */}
      <Section title="Botones" code="<Button>">
        <div className={styles.grid}>
          <Card>
            <h3 className={styles.cardTitle}>Tonos</h3>
            <div className={styles.row}>
              <Button>Comprobar</Button>
              <Button tone="success">¡Correcto!</Button>
              <Button tone="danger">Reintentar</Button>
              <Button tone="info">Escuchar</Button>
              <Button tone="warning">Lección</Button>
              <Button tone="ai">Generar</Button>
              <Button tone="neutral">Neutro</Button>
            </div>
            <p className={styles.note}>Pasa el ratón: un brillo cruza el botón. Pulsa: se hunde y suena.</p>
          </Card>
          <Card>
            <h3 className={styles.cardTitle}>Variantes, tamaños e iconos</h3>
            <div className={styles.row}>
              <Button size="sm">Pequeño</Button>
              <Button>Normal</Button>
              <Button size="lg">Grande</Button>
            </div>
            <div className={styles.row}>
              <Button variant="soft">Suave</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button tone="info" icon="🔊">Escuchar</Button>
              <Button tone="neutral" icon="🔊" iconOnly aria-label="Escuchar" />
              <Button tone="ai" icon="✦" iconOnly aria-label="Generar con IA" />
            </div>
          </Card>
          <Card>
            <h3 className={styles.cardTitle}>Con vida</h3>
            <Button tone="success" celebrate block onClick={() => setXp((v) => v + 5)}>
              🎉 Celebrar (confeti)
            </Button>
            <Button feedback={feedback} tone={feedback === "error" ? "danger" : "success"} block onClick={flipFeedback}>
              {feedback === "error" ? "✕ Error: sacude" : "✓ Acierto: pop"}
            </Button>
            <Button
              tone="ai"
              block
              loading={loading}
              onClick={() => {
                setLoading(true);
                window.setTimeout(() => {
                  setLoading(false);
                }, 1600);
              }}
            >
              Generar historia
            </Button>
            <Button size="lg" block attention>
              Continuar
            </Button>
            <p className={styles.note}>El último "respira": úsalo solo en el botón principal de la pantalla.</p>
          </Card>
        </div>
      </Section>

      {/* ───────── ROBOTS ───────── */}
      <Section title="El escuadrón" code="<Robot> · <RobotStage> · useRobotMood()">
        <Card tint={HEROES[hero].tint} padding="lg">
          <RobotStage hero={hero} {...squadBot.props} say={squadSay} size={260} />
          <div className={styles.moodRow} style={tint(HEROES[hero].tint)}>
            {MOODS.map(([m, label]) => (
              <Button
                key={m}
                tone="neutral"
                size="sm"
                sound={false}
                onClick={() => {
                  squadBot.react(m);
                  setSquadSay(LINES[m] ?? HEROES[hero].hello);
                }}
              >
                {label}
              </Button>
            ))}
          </div>
        </Card>
        <div className={styles.squad}>
          {(Object.keys(HEROES) as Hero[]).map((h) => (
            <Card
              key={h}
              tint={HEROES[h].tint}
              padding="sm"
              selected={h === hero}
              className={styles.member}
              onClick={() => {
                sound.play("tap", { voice: HEROES[h].voice });
                setHero(h);
                squadBot.react("wave");
                setSquadSay(HEROES[h].hello);
              }}
            >
              <Robot hero={h} voice={false} />
              <b>{HEROES[h].name}</b>
              <small>{HEROES[h].module}</small>
            </Card>
          ))}
        </div>
      </Section>

      {/* ───────── SURFACES & TAGS ───────── */}
      <Section title="Tarjetas, chips y niveles" code="<Card> · <Chip> · <LevelBadge>">
        <div className={styles.grid}>
          <Card tint="sky" onClick={() => toast("Abrir Palabras", { tone: "info" })}>
            <h3 className={styles.cardTitle}>📘 Palabras</h3>
            <span className={styles.note}>248 palabras · toca la tarjeta</span>
            <ProgressBar value={68} tone="info" size="sm" />
          </Card>
          <Card>
            <h3 className={styles.cardTitle}>Filtros</h3>
            <div className={styles.row}>
              <Chip tint="sky" selected={chips.noun} onToggle={(v) => setChips({ ...chips, noun: v })} count={120}>
                Sustantivos
              </Chip>
              <Chip tint="mint" selected={chips.verb} onToggle={(v) => setChips({ ...chips, verb: v })} count={64}>
                Verbos
              </Chip>
              <Chip tint="lilac" selected={chips.phrasal} onToggle={(v) => setChips({ ...chips, phrasal: v })} count={31}>
                Phrasal verbs
              </Chip>
              <Chip tint="peach" selected={chips.idiom} onToggle={(v) => setChips({ ...chips, idiom: v })} count={18}>
                Modismos
              </Chip>
            </div>
            <div className={styles.row}>
              <Chip tint="sky">noun</Chip>
              <Chip tint="lilac" icon="💬">expresión</Chip>
              <Chip tint="butter">formal</Chip>
            </div>
          </Card>
          <Card>
            <h3 className={styles.cardTitle}>Niveles MCER</h3>
            <div className={styles.row}>
              {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((l) => (
                <LevelBadge key={l} level={l} />
              ))}
            </div>
            <div className={styles.row}>
              <LevelBadge level="B2" size="lg" showName />
              <LevelBadge level="A1" size="sm" />
            </div>
          </Card>
        </div>
      </Section>

      {/* ───────── PROGRESS ───────── */}
      <Section title="Progreso y recompensas" code="<ProgressBar> · <XPCounter> · <StreakCounter>">
        <div className={styles.grid}>
          <Card>
            <ProgressBar value={step} max={5} label="Lección" />
            <div className={styles.row}>
              <Button size="sm" onClick={() => setStep((s) => (s >= 5 ? 0 : s + 1))}>
                Avanzar
              </Button>
              <span className={styles.note}>Cada paso: destello. Al 100 %: pop y brillo.</span>
            </div>
          </Card>
          <Card>
            <div className={styles.row}>
              <Button
                tone="success"
                size="sm"
                onClick={(e) => {
                  setXp((v) => v + 10);
                  fx.float(e.currentTarget, "+10 XP");
                  sound.play("correct");
                }}
              >
                +10 XP
              </Button>
              <Button tone="warning" size="sm" onClick={() => setStreak((s) => s + 1)}>
                🔥 Subir racha
              </Button>
              <Button
                tone="brand"
                size="sm"
                onClick={(e) => {
                  fx.sparkles(e.currentTarget, 10);
                  sound.play("levelup");
                }}
              >
                ✨ Destellos
              </Button>
            </div>
            <p className={styles.note}>Mira arriba: el XP rebota y la racha se enciende.</p>
          </Card>
        </div>
      </Section>

      {/* ───────── AI ───────── */}
      <Section title="La IA trabajando" code="<AIThinking> · <StreamingText>">
        <div className={styles.grid}>
          <div className={styles.stack}>
            {thinking ? <AIThinking title="Escribiendo tu historia…" /> : <Card>✓ ¡Lista!</Card>}
            <Button tone="neutral" size="sm" onClick={() => setThinking((t) => !t)}>
              {thinking ? "Terminar" : "Volver a pensar"}
            </Button>
          </div>
          <Card tint="peach">
            <StreamingText text={stream.text} streaming={stream.streaming} />
            <Button tone="ai" size="sm" onClick={stream.restart}>
              Generar otra vez
            </Button>
          </Card>
        </div>
      </Section>

      {/* ───────── ANKI ───────── */}
      <Section title="Tarjeta Anki" code="<FlashCard>">
        <div className={styles.row}>
          <FlashCard
            front={
              <>
                <b className={styles.word}>serendipity</b>
                <span className={styles.ipa}>/ˌser.ənˈdɪp.ə.ti/</span>
              </>
            }
            back={
              <>
                <b>Serendipia</b>
                <span className={styles.note}>Finding something good by chance, without looking for it.</span>
              </>
            }
          />
          <div className={styles.row}>
            <Button tone="danger" size="sm">
              Otra vez
            </Button>
            <Button tone="warning" size="sm">
              Difícil
            </Button>
            <Button tone="success" size="sm" celebrate>
              Fácil
            </Button>
          </div>
        </div>
      </Section>

      {/* ───────── FORMS ───────── */}
      <Section title="Formularios" code="<Field> + controles nativos">
        <div className={styles.grid}>
          <Card>
            <Field label="Nombre" hint="Así te saludarán los robots">
              <input type="text" placeholder="¿Cómo te llamas?" />
            </Field>
            <Field label="Correo" error={email.includes("@") ? undefined : "Ese correo no es válido."}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Idioma">
              <select defaultValue="pt">
                <option value="en">🇬🇧 Inglés</option>
                <option value="pt">🇧🇷 Portugués</option>
                <option value="fr">🇫🇷 Francés</option>
              </select>
            </Field>
          </Card>
          <Card>
            <fieldset>
              <legend>Ajustes</legend>
              <SoundToggle label="Sonidos" />
              <label>
                Vibración <input type="checkbox" role="switch" defaultChecked />
              </label>
              <label>
                <input type="checkbox" defaultChecked /> Recordatorio diario
              </label>
            </fieldset>
          </Card>
        </div>
      </Section>

      {/* ───────── OVERLAYS ───────── */}
      <Section title="Modal, hoja inferior y avisos" code="<Modal> · <Sheet> · toast()">
        <Card>
          <div className={styles.row}>
            <Button onClick={() => setModal(true)}>Abrir modal</Button>
            <Button tone="info" onClick={() => setSheet(true)}>
              Abrir hoja inferior
            </Button>
            <Button tone="success" variant="soft" onClick={() => toast("Guardado en Anki", { tone: "success" })}>
              Aviso de éxito
            </Button>
            <Button tone="ai" variant="soft" onClick={() => toast("Tu historia está lista", { tone: "ai" })}>
              Aviso de la IA
            </Button>
            <Button tone="danger" variant="soft" onClick={() => toast("No hay conexión", { tone: "danger" })}>
              Aviso de error
            </Button>
          </div>
          <p className={styles.note}>La hoja se cierra arrastrando el tirador hacia abajo.</p>
        </Card>
        <Modal open={modal} onClose={() => setModal(false)} title="¡Lección completada! 🎉" description="Has ganado +40 XP y tu racha sube a 7 días.">
          <Modal.Actions>
            <Button tone="neutral" onClick={() => setModal(false)}>
              Ahora no
            </Button>
            <Button tone="success" celebrate onClick={() => setModal(false)}>
              Siguiente lección
            </Button>
          </Modal.Actions>
        </Modal>
        <Sheet open={sheet} onClose={() => setSheet(false)} title="¿Qué idioma aprendes?" description="Tu progreso se guarda por idioma.">
          <div className={styles.stack}>
            {["🇬🇧 Inglés", "🇧🇷 Portugués", "🇫🇷 Francés", "🇩🇪 Alemán"].map((l, i) => (
              <label key={l}>
                <input type="radio" name="lang" defaultChecked={i === 0} /> {l}
              </label>
            ))}
            <Button tone="info" size="lg" block onClick={() => setSheet(false)}>
              Guardar
            </Button>
          </div>
        </Sheet>
      </Section>

      {/* ───────── NAVIGATION ───────── */}
      <Section title="Cambiar de pantalla" code="<PageTransition>">
        <div className={styles.grid}>
          <div className={styles.phone}>
            <PageTransition screen={screen} direction={screen === "stories" ? "forward" : "back"}>
              <div className={styles.screen} style={tint(screen === "words" ? "sky" : "peach")}>
                <h4>{screen === "words" ? "📘 Palabras" : "📖 Historias"}</h4>
                <div className={styles.line} />
                <div className={styles.line} style={{ width: "80%" }} />
                <div className={styles.line} style={{ width: "60%" }} />
              </div>
            </PageTransition>
          </div>
          <div className={styles.stack}>
            <Button tone="neutral" onClick={() => setScreen((s) => (s === "words" ? "stories" : "words"))}>
              {screen === "words" ? "Ir a Historias →" : "← Volver a Palabras"}
            </Button>
            <p className={styles.note}>Navegar es suave, sin rebote. El rebote es para lo que tocas y para celebrar.</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
