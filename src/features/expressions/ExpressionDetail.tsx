/**
 * ExpressionDetail — /expresiones/:id. One expression with Nubo:
 * image (create/replace), pronunciation, Spanish equivalent, types,
 * difficulty, meaning (+ Spanish), "¿Cuándo se dice?" (context), examples
 * with the expression highlighted, and a chat with Nubo.
 */
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button, Card, ChatPanel, Chip, EmptyState, Icon, Modal, RichText, Robot, Skeleton, SpeakButtons, toast, useRobotMood } from "../../components";
import { tint } from "../../components/types";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import type { Difficulty } from "../words/api";
import { DifficultyPicker } from "../words/WordDetail";
import styles from "../words/WordDetail.module.css";
import info from "../words/WordInfo.module.css";
import { EXPRESSION_TYPES, expressionsApi, type Expression } from "./api";

export function ExpressionDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Expression | null>(null);
  const [failed, setFailed] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [showEs, setShowEs] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const nubo = useRobotMood();
  const diffRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setItem(null);
    setFailed(false);
    expressionsApi
      .get(id)
      .then((e) => alive && setItem(e))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [id]);

  if (failed)
    return (
      <EmptyState kind="error" hero="nubo" title="No encontré esta expresión" action={<Button onClick={() => navigate(MODULES.expressions.path)}>Volver a Expresiones</Button>} />
    );
  if (!item)
    return (
      <div className={styles.page}>
        <Skeleton lines={2} />
        <Skeleton rows={3} />
      </div>
    );

  const newImage = async () => {
    setImgBusy(true);
    nubo.react("think");
    try {
      const updated = await expressionsApi.image(item);
      setItem({ ...item, ...updated });
      nubo.react("happy");
      sound.play("ready");
    } catch (e) {
      nubo.react("sad");
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setImgBusy(false);
    }
  };

  const setDifficulty = async (d: Difficulty) => {
    if (d === item.difficulty) return;
    const prev = item.difficulty;
    setItem({ ...item, difficulty: d });
    if (d === "easy") {
      nubo.react("party");
      sound.play("correct");
      haptics.success();
      if (diffRef.current) fx.confetti(diffRef.current, 18);
    } else nubo.react(d === "hard" ? "sad" : "happy");
    try {
      await expressionsApi.update(item._id, { difficulty: d });
    } catch (e) {
      setItem((x) => (x ? { ...x, difficulty: prev } : x));
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const remove = async () => {
    try {
      await expressionsApi.remove(item._id);
      toast(`«${item.expression}» borrada`, { tone: "info" });
      navigate(MODULES.expressions.path, { replace: true });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  return (
    <div className={styles.page} style={tint("lilac")}>
      <Link to={MODULES.expressions.path} className={styles.back}>
        <Icon name="back" size={20} /> Expresiones
      </Link>

      <section className={styles.hero}>
        <div className={styles.media}>
          {item.img ? (
            <img src={item.img} alt={`Ilustración de ${item.expression}`} className={imgBusy ? styles.dim : undefined} />
          ) : (
            <div className={styles.noImg}>
              <Robot hero="nubo" {...nubo.props} voice={false} />
            </div>
          )}
          <Button tone="neutral" size="sm" className={styles.imgBtn} loading={imgBusy} icon={<Icon name="image" size={18} />} onClick={() => void newImage()}>
            {item.img ? "Otra imagen" : "Crear imagen"}
          </Button>
        </div>

        <div className={styles.info}>
          <h1 className={styles.word}>{item.expression}</h1>
          <div className={styles.meta}>
            <SpeakButtons text={item.expression} language={item.language} recorded size="sm" />
          </div>
          {item.spanish?.expression && (
            <span className={styles.es}>
              <span aria-hidden="true">→</span> {item.spanish.expression}
            </span>
          )}
          <div className={styles.chips}>
            {item.type?.map((t) => (
              <Chip key={t} tint="lilac">
                {EXPRESSION_TYPES[t] ?? t}
              </Chip>
            ))}
          </div>
          <div className={styles.diff} ref={diffRef}>
            <span className={styles.diffLabel}>¿Qué tan difícil es para ti?</span>
            <DifficultyPicker value={item.difficulty} onChange={(d) => void setDifficulty(d)} />
          </div>
        </div>
      </section>

      <div className={styles.columns}>
        <div className={info.root}>
          <Card className={info.section}>
            <header className={info.head}>
              <h2>
                <Icon name="expressions" active /> Qué significa
              </h2>
              {item.spanish?.definition && (
                <Button tone="neutral" variant="ghost" size="sm" onClick={() => setShowEs((v) => !v)}>
                  {showEs ? "Ocultar español" : "Ver en español"}
                </Button>
              )}
            </header>
            <p className={info.definition}>{item.definition}</p>
            {showEs && <p className={info.definitionEs}>{item.spanish?.definition}</p>}
          </Card>

          {item.context && (
            <Card className={info.section}>
              <header className={info.head}>
                <h2>
                  <Icon name="globe" /> ¿Cuándo se dice?
                </h2>
              </header>
              <p className={info.definition}>{item.context}</p>
            </Card>
          )}

          {item.examples?.length > 0 && (
            <Card className={info.section}>
              <header className={info.head}>
                <h2>
                  <Icon name="sparkle" /> Ejemplos
                </h2>
              </header>
              <ol className={info.examples}>
                {item.examples.map((ex, i) => (
                  <li key={i} className={info.exampleRow} style={{ "--i": i } as React.CSSProperties}>
                    <RichText text={ex} highlight={item.expression} />
                    <SpeakButtons text={ex} language={item.language} recorded slow={false} size="sm" />
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>

        <aside className={styles.side}>
          <Card className={styles.chatCard}>
            <h2 className={styles.chatTitle}>
              <Icon name="expressions" active /> Pregúntale a Nubo
            </h2>
            <ChatPanel
              hero="nubo"
              load={() => expressionsApi.chat(item._id)}
              streamPath={`/api/expressions/${item._id}/chat/stream`}
              suggestions={["Dame otro ejemplo", "¿Es muy informal?", "¿Hay una parecida?", "Explícamela fácil"]}
            />
          </Card>
          <Button tone="danger" variant="soft" block icon={<Icon name="trash" size={20} />} onClick={() => setConfirmDelete(true)}>
            Borrar expresión
          </Button>
        </aside>
      </div>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={`¿Borrar «${item.expression}»?`} description="Se borrará con sus ejemplos, imagen y chat. No se puede deshacer.">
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
