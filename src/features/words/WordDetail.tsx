/**
 * WordDetail — /palabras/:id. Everything about one word:
 * image (create/replace with AI), pronunciation (normal + slow), IPA,
 * translation, types, how hard it is for you, all the info sections
 * (WordInfo) and a chat with Lumi. Opening the page counts as one "seen".
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button, Card, ChatPanel, Chip, EmptyState, Icon, Robot, Segmented, Skeleton, SpeakButtons, toast, useRobotMood } from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { useSession } from "../../lib/session";
import { sound } from "../../lib/sound";
import { DIFFICULTY, WORD_TYPES, wordsApi, type Difficulty, type Word } from "./api";
import { WordInfo } from "./WordInfo";
import styles from "./WordDetail.module.css";

export function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  return (
    <Segmented
      label="Dificultad"
      value={value}
      onChange={onChange}
      options={[
        { value: "easy", label: DIFFICULTY.easy.label, tint: "mint" },
        { value: "medium", label: DIFFICULTY.medium.label, tint: "butter" },
        { value: "hard", label: DIFFICULTY.hard.label, tint: "rose" },
      ]}
    />
  );
}

export function WordDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [failed, setFailed] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const isAdmin = useSession()?.user.role === "admin";
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
      <EmptyState kind="error" hero="lumi" title="No encontré esta palabra" action={<Button onClick={() => navigate(MODULES.words.path)}>Volver a Palabras</Button>} />
    );
  if (!word)
    return (
      <div className={styles.page}>
        <Skeleton lines={2} />
        <Skeleton rows={3} />
      </div>
    );

  const newImage = async () => {
    setImgBusy(true);
    lumi.react("think");
    try {
      const updated = await wordsApi.image(word._id, word);
      setWord({ ...word, ...updated });
      lumi.react("happy");
      sound.play("ready");
    } catch (e) {
      lumi.react("sad");
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setImgBusy(false);
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
    } else lumi.react(d === "hard" ? "sad" : "happy");
    try {
      await wordsApi.setDifficulty(word._id, d);
    } catch (e) {
      setWord((w) => (w ? { ...w, difficulty: prev } : w));
      toast((e as Error).message, { tone: "danger" });
    }
  };

  return (
    <div className={styles.page} style={tint("sky")}>
      <Link to={MODULES.words.path} className={styles.back}>
        <Icon name="back" size={20} /> Palabras
      </Link>

      <section className={styles.hero}>
        <div className={styles.media}>
          {word.img ? (
            <img src={word.img} alt={`Ilustración de ${word.word}`} className={imgBusy ? styles.dim : undefined} />
          ) : (
            <div className={styles.noImg}>
              <Robot hero="lumi" {...lumi.props} voice={false} />
            </div>
          )}
          {/* the picture is shared by everyone */}
          {isAdmin && (
            <Button tone="neutral" size="sm" className={styles.imgBtn} loading={imgBusy} icon={<Icon name="image" size={18} />} onClick={() => void newImage()}>
            {word.img ? "Otra imagen" : "Crear imagen"}
          </Button>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.word}>{word.word}</h1>
          <div className={styles.meta}>
            {word.IPA && <span className={styles.ipa}>{word.IPA}</span>}
            <SpeakButtons text={word.word} language={word.language} size="sm" />
          </div>
          {word.spanish?.word && (
            <span className={styles.es}>
              <span aria-hidden="true">→</span> {word.spanish.word}
            </span>
          )}
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
            <DifficultyPicker value={word.difficulty} onChange={(d) => void setDifficulty(d)} />
          </div>
        </div>
      </section>

      <div className={styles.columns}>
        <WordInfo word={word} onChange={setWord} onMood={lumi.react} />
        <aside className={styles.side}>
          <Card className={styles.chatCard}>
            <h2 className={styles.chatTitle}>
              <Icon name="expressions" active /> Pregúntale a Lumi
            </h2>
            <ChatPanel
              hero="lumi"
              load={() => wordsApi.chat(word._id)}
              streamPath={`/api/words/${word._id}/chat/stream`}
              suggestions={["Dame otro ejemplo", "¿Cuándo se usa?", "¿Formal o informal?", "Explícamelo fácil"]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
