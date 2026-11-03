/**
 * Home — "¡Hola, Alex!": the daily review front and center (Menti), then each
 * hero presenting their module. Tapping a hero card makes it wave and opens it.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { Button, Icon, Robot, SpeechBubble, useRobotMood, type Hero } from "../../components";
import { tint } from "../../components/types";
import { MODULES, type ModuleDef } from "../../app/modules";
import { useSession } from "../../lib/session";
import { sound } from "../../lib/sound";
import styles from "./Home.module.css";

const CARDS: ModuleDef[] = [MODULES.words, MODULES.expressions, MODULES.stories, MODULES.exams];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Buenos días" : h < 20 ? "Buenas tardes" : "Buenas noches";
};

function HeroCard({ m, index }: { m: ModuleDef; index: number }) {
  const navigate = useNavigate();
  const bot = useRobotMood();
  return (
    <button
      type="button"
      className={styles.card}
      style={{ ...tint(m.tint), "--i": index } as React.CSSProperties}
      onPointerEnter={() => bot.react("wave")}
      onClick={() => {
        sound.play("tap");
        bot.react("happy");
        window.setTimeout(() => navigate(m.path), 260);
      }}
    >
      <span className={styles.cardHero}>
        <Robot hero={m.hero as Hero} {...bot.props} voice={false} />
      </span>
      <span className={styles.cardText}>
        <span className={styles.cardTitle}>
          <Icon name={m.icon} size={22} active />
          {m.label}
        </span>
        <span className={styles.cardPitch}>{m.pitch}</span>
      </span>
      <span className={styles.cardGo} aria-hidden="true">
        <Icon name="next" size={20} />
      </span>
    </button>
  );
}

export function Home() {
  const navigate = useNavigate();
  const user = useSession()?.user;
  const name = (user?.firstName && user.firstName !== "System" ? user.firstName : user?.username) ?? "";
  const menti = useRobotMood();

  useEffect(() => {
    const t = window.setTimeout(() => menti.react("wave"), 500);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.hello}>
        <span className={styles.eyebrow}>{greeting()}</span>
        <h1>¡Hola, {name}! 👋</h1>
      </header>

      {/* Daily review: the heart of Glota */}
      <section className={styles.review} style={tint("mint")}>
        <div className={styles.reviewHero}>
          <Robot hero="menti" {...menti.props} voice={false} />
        </div>
        <div className={styles.reviewBody}>
          <SpeechBubble tail="left">¡Bip! Tus tarjetas te esperan.</SpeechBubble>
          <h2>Repaso del día</h2>
          <p>Unos minutos al día y no olvidas nada. Menti elige las palabras que más te cuestan.</p>
          <Button
            tone="success"
            size="lg"
            attention
            icon={<Icon name="review" size={22} active />}
            onClick={() => {
              menti.react("party");
              window.setTimeout(() => navigate(MODULES.review.path), 450);
            }}
          >
            Empezar a repasar
          </Button>
        </div>
      </section>

      <section className={styles.modules} aria-label="Módulos">
        {CARDS.map((m, i) => (
          <HeroCard key={m.id} m={m} index={i} />
        ))}
      </section>
    </div>
  );
}
