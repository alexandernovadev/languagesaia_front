/**
 * StoriesList — your stories, and a sheet to start a new one. Tula writes the
 * premise and the first chapter, using words you're reviewing.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AIThinking, Button, Chip, EmptyState, Field, Icon, LevelBadge, ModuleTitle, Sheet, Skeleton, toast } from "../../components";
import type { CefrLevel } from "../../components/types";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { useSession } from "../../lib/session";
import { sound } from "../../lib/sound";
import { GENRES, storiesApi, type Story } from "./api";
import styles from "./Stories.module.css";

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
const LENGTHS = [
  { value: "3", label: "Corta · 3" },
  { value: "6", label: "Media · 6" },
  { value: "10", label: "Larga · 10" },
];
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function NewStorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [genre, setGenre] = useState("mystery");
  const [level, setLevel] = useState("A2");
  const [length, setLength] = useState("6");
  const [theme, setTheme] = useState("");
  const [busy, setBusy] = useState(false);

  const start = async (surprise = false) => {
    setBusy(true);
    try {
      const story = await storiesApi.create({
        genre: surprise ? pick(Object.keys(GENRES)) : genre,
        languageLevel: level,
        totalChapters: Number(length),
        theme: surprise ? undefined : theme.trim() || undefined,
      });
      await storiesApi.nextChapter(story._id);
      sound.play("levelup");
      haptics.celebrate();
      fx.confetti({ x: window.innerWidth / 2, y: window.innerHeight / 2 }, 40, 1.6);
      navigate(`${MODULES.stories.path}/${story._id}`);
    } catch (e) {
      setBusy(false);
      toast((e as Error).message, { tone: "danger" });
    }
  };

  return (
    <Sheet open={open} onClose={busy ? () => undefined : onClose} title="Nueva historia" description="Tula escribe con las palabras que estás repasando.">
      {busy ? (
        <AIThinking title="Tula está escribiendo" tips={["Inventando a tu protagonista…", "Metiendo tus palabras en la trama…", "Preparando el primer capítulo…"]} skeletonLines={0} />
      ) : (
        <div className={styles.form}>
          <div className={styles.field}>
            <span className={styles.label}>Género</span>
            <div className={styles.chips}>
              {Object.entries(GENRES).map(([value, label]) => (
                <Chip key={value} tint="peach" selected={genre === value} onToggle={() => setGenre(value)}>
                  {label}
                </Chip>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Nivel</span>
            <div className={styles.chips}>
              {LEVELS.map((l) => (
                <Chip key={l} tint="peach" selected={level === l} onToggle={() => setLevel(l)}>
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.label}>Largo</span>
            <div className={styles.chips}>
              {LENGTHS.map((l) => (
                <Chip key={l.value} tint="peach" selected={length === l.value} onToggle={() => setLength(l.value)}>
                  {l.label}
                </Chip>
              ))}
            </div>
          </div>
          <Field label="Tema, si quieres uno">
            <input type="text" value={theme} maxLength={200} placeholder="Una casa vieja en São Paulo" onChange={(e) => setTheme(e.target.value)} />
          </Field>
          <div className={styles.formActions}>
            <Button tone="warning" block onClick={() => void start()}>
              Escribir capítulo 1
            </Button>
            <Button tone="neutral" variant="soft" block onClick={() => void start(true)}>
              Sorpréndeme
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}

function StoryCard({ story, index }: { story: Story; index: number }) {
  const done = story.finishedChapters ?? 0;
  const finished = done >= story.totalChapters;
  return (
    <Link
      to={`${MODULES.stories.path}/${story._id}`}
      onClick={() => {
        sound.play("tap");
        haptics.tap();
      }}
      className={styles.card} style={{ "--i": index } as React.CSSProperties}>
      <span className={styles.cover} data-genre={story.genre}>
        {GENRES[story.genre] ?? story.genre}
        <LevelBadge level={story.languageLevel as CefrLevel} size="sm" />
      </span>
      <span className={styles.cardBody}>
        <b>{story.title}</b>
        <small>{finished ? "Terminada" : `Capítulo ${Math.min(done + 1, story.totalChapters)} de ${story.totalChapters}`}</small>
        <span className={styles.bar}>
          <i style={{ width: `${(done / story.totalChapters) * 100}%` }} />
        </span>
      </span>
    </Link>
  );
}

export function StoriesList() {
  const language = useSession()?.user.language ?? "en";
  const [stories, setStories] = useState<Story[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    setStories(null);
    storiesApi.list(language).then((page) => setStories(page.data)).catch(() => setFailed(true));
  }, [language]);

  const newButton = (
    <Button tone="warning" icon={<Icon name="stories" size={20} active />} onClick={() => setCreating(true)}>
      Nueva historia
    </Button>
  );

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <ModuleTitle hero="tula" title="Historias" />
        {stories && stories.length > 0 && newButton}
      </header>

      {failed && <EmptyState kind="error" hero="tula" title="No pude traer tus historias" text="Revisa la conexión e inténtalo otra vez." />}
      {!failed && !stories && <Skeleton lines={4} />}
      {stories?.length === 0 && <EmptyState hero="tula" title="Aún no tienes historias" text="Elige un género y Tula escribe una con tus palabras." action={newButton} />}
      {stories && stories.length > 0 && (
        <div className={styles.grid}>
          {stories.map((s, i) => (
            <StoryCard key={s._id} story={s} index={i} />
          ))}
        </div>
      )}

      <NewStorySheet open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
