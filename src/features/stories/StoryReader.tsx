/**
 * StoryReader — reads one chapter. Every word can be tapped: a sheet shows its
 * meaning and pronunciation, and adds it to your list. Your words are marked.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AIThinking, AnswerOption, Button, ChatPanel, Chip, EmptyState, Icon, Modal, RobotStage, Skeleton, SpeakButtons, StreamingText, toast, useRobotMood } from "../../components";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { wordsApi, type Word } from "../words/api";
import { WordInfo } from "../words/WordInfo";
import { storiesApi, type Chapter, type Question, type Story, type WordLookup } from "./api";
import { Narration, type NarrationHandle } from "./Narration";
import styles from "./Stories.module.css";

const MARKS_KEY = "glota.storyMarks";

const savedMarks = () => {
  try {
    return localStorage.getItem(MARKS_KEY) !== "off";
  } catch {
    return true;
  }
};

const END_OF_TEXT = "\u0003";

/** The chapter as it arrives: the title on the first line, then the text. */
function readDraft(full: string) {
  const written = full.replace(END_OF_TEXT, "").trimStart();
  const cut = written.indexOf("\n");
  return {
    title: (cut < 0 ? written : written.slice(0, cut)).replace(/[#*"“”]/g, "").trim(),
    text: cut < 0 ? "" : written.slice(cut).trim(),
    finished: full.includes(END_OF_TEXT),
  };
}

const cleanWord = (w: string) => w.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, "");

/** The ranges of a paragraph that get a color: short quotes and short asides. */
function colored(text: string) {
  const ranges: Array<[number, number, string]> = [];
  for (const m of text.matchAll(/"[^"\n]{1,40}"|“[^”\n]{1,40}”/g)) ranges.push([m.index, m.index + m[0].length, styles.quote]);
  for (const m of text.matchAll(/(?<![\p{L}\d])\([^()\n]{1,60}\)/gu)) ranges.push([m.index, m.index + m[0].length, styles.aside]);
  return ranges;
}

/** Drawn once per chapter: tapping a word or the karaoke never redraws the text. */
const Paragraphs = memo(function Paragraphs({ chapter, marks, onWord }: { chapter: Chapter; marks: boolean; onWord: (word: string, sentence: string) => void }) {
  const mine = useMemo(() => new Set(chapter.targetVocabulary.map(cleanWord)), [chapter]);
  let token = -1; // the same whitespace split as the narration's word times
  return (
    <div className={styles.text}>
      {chapter.content.split(/\n{2,}/).map((paragraph, p) => {
        const ranges = colored(paragraph);
        return (
          <p key={p}>
            {[...paragraph.matchAll(/\S+|\s+/g)].map((m, i) => {
              if (!m[0].trim()) return m[0];
              token += 1;
              const word = cleanWord(m[0]);
              const range = ranges.find(([a, b]) => m.index >= a && m.index < b);
              const [, before, core, after] = /^([^\p{L}]*)(.*?)([^\p{L}]*)$/su.exec(m[0]) ?? [];
              const className = [styles.word, range?.[2]].filter(Boolean).join(" ");
              if (!word) return <span key={i} data-t={token}>{m[0]}</span>;
              return (
                <button key={i} type="button" data-t={token} className={className} onClick={() => onWord(word, paragraph)}>
                  {before}
                  <span className={marks && mine.has(word) ? styles.mine : undefined}>{core}</span>
                  {after}
                </button>
              );
            })}
          </p>
        );
      })}
    </div>
  );
});

/** The word's whole card, without leaving the story. */
function WordCard({ word, onChange }: { word: Word; onChange: (w: Word) => void }) {
  const [tab, setTab] = useState<"info" | "chat">("info");
  return (
    <div className={styles.wordCard}>
      <div className={styles.wordTop}>
        <Chip tint="peach" selected={tab === "info"} onToggle={() => setTab("info")}>
          Info
        </Chip>
        <Chip tint="peach" selected={tab === "chat"} onToggle={() => setTab("chat")}>
          Chat
        </Chip>
        {word.IPA && <span className={styles.ipa}>{word.IPA}</span>}
        <SpeakButtons text={word.word} language={word.language} wordId={word._id} audio={word.audio} recorded size="sm" />
      </div>
      {tab === "info" ? (
        <div className={styles.wordBody}>
          {word.img && <img className={styles.wordImage} src={word.img} alt="" />}
          <WordInfo word={word} onChange={onChange} onMood={() => undefined} compact />
        </div>
      ) : (
        <div className={styles.wordChat}>
          <ChatPanel
            hero="lumi"
            fill
            load={() => wordsApi.chat(word._id)}
            streamPath={`/api/words/${word._id}/chat/stream`}
            suggestions={["Dame otro ejemplo", "¿Cuándo se usa?", "Explícamelo fácil"]}
          />
        </div>
      )}
    </div>
  );
}

/** Stays over the text without covering it, so you keep reading while it's open. */
function WordDock({ tapped, language, onClose }: { tapped: { word: string; sentence: string } | null; language: string; onClose: () => void }) {
  const [info, setInfo] = useState<WordLookup | null>(null);
  const [failed, setFailed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [card, setCard] = useState<Word | null>(null);

  useEffect(() => {
    if (!tapped) return;
    setInfo(null);
    setFailed(false);
    storiesApi.lookup(tapped.word, tapped.sentence, language).then(setInfo).catch(() => setFailed(true));
  }, [tapped, language]);

  const add = async () => {
    if (!info) return;
    setAdding(true);
    try {
      const saved = await wordsApi.generate(info.lemma, language);
      setInfo({ ...info, inList: true, wordId: saved._id, audio: saved.audio });
      toast(`«${saved.word}» guardada`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setAdding(false);
    }
  };

  const openCard = async () => {
    if (!info?.wordId) return;
    try {
      setCard(await wordsApi.get(info.wordId));
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  if (!tapped) {
    return (
      <aside className={styles.dockIdle}>
        <b>Toca cualquier palabra</b>
        <span>Aquí verás su significado y su pronunciación, sin perder el hilo.</span>
      </aside>
    );
  }
  return (
    <>
      <aside className={styles.dock} aria-label="Palabra">
        <div className={styles.dockHead}>
          <b>{info?.lemma ?? tapped.word}</b>
          {info?.ipa && <span className={styles.ipa}>{info.ipa}</span>}
          <Button tone="neutral" variant="ghost" size="sm" iconOnly icon={<Icon name="close" size={18} />} aria-label="Cerrar" className={styles.dockClose} onClick={onClose} />
        </div>
        {failed && <p className={styles.muted}>No pude buscar esta palabra. Inténtalo otra vez.</p>}
        {!failed && !info && <Skeleton lines={1} />}
        {info && (
          <div className={styles.dockBody}>
            <p className={styles.translation}>{info.translation}</p>
            <div className={styles.dockActions}>
              <SpeakButtons text={info.lemma} language={language} wordId={info.wordId} audio={info.audio} recorded size="sm" />
              {info.inList ? (
                <Button tone="neutral" variant="soft" size="sm" onClick={() => void openCard()}>
                  Ver ficha
                </Button>
              ) : (
                <Button tone="warning" size="sm" loading={adding} onClick={() => void add()}>
                  Agregar a mi lista
                </Button>
              )}
            </div>
          </div>
        )}
      </aside>

      <Modal open={!!card} onClose={() => setCard(null)} title={card?.word} description={card?.spanish?.word} className={styles.cardModal}>
        {card && <WordCard key={card._id} word={card} onChange={setCard} />}
      </Modal>
    </>
  );
}

const wide = window.matchMedia("(min-width: 960px)").matches; // same as the two-column .quiz
const ANSWER_XP = 5;
const CHAPTER_XP = 10;

function Quiz({ questions, onDone }: { questions: Question[]; onDone: (correct: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const tula = useRobotMood();
  const title = useRef<HTMLHeadingElement>(null);
  const finished = Object.keys(answers).length === questions.length;
  const correct = questions.filter((q, i) => answers[i] === q.answer).length;

  const answer = (question: number, option: number) => {
    setAnswers({ ...answers, [question]: option });
    tula.react(option === questions[question].answer ? "happy" : "sad");
  };

  useEffect(() => {
    if (!finished) return;
    const great = correct === questions.length;
    tula.react(correct > 0 ? "party" : "think");
    if (correct > 0) sound.play("levelup", { delay: 300 });
    if (great) {
      haptics.celebrate();
      if (title.current) fx.confetti(title.current, 40, 1.5);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const say = !finished ? "¿Qué recuerdas?" : correct === questions.length ? "¡Perfecto, lo entendiste todo!" : correct > 0 ? "¡Bien! Sigamos la historia." : "No pasa nada, sigamos.";

  return (
    <section className={styles.quiz}>
      <RobotStage hero="tula" {...tula.props} say={say} bubble="top" size={wide ? 220 : 130} />
      <div className={styles.quizBody}>
      <div>
        <h2 ref={title}>¿Entendiste?</h2>
        <p className={styles.muted}>Cada acierto suma {ANSWER_XP} XP para tu meta de hoy.</p>
      </div>
      {questions.map((q, i) => (
        <div key={i} className={styles.question}>
          <b>{q.question}</b>
          {q.options.map((option, o) => {
            const picked = answers[i];
            const state = picked === undefined ? "idle" : o === q.answer ? "right" : o === picked ? "wrong" : "dim";
            return (
              <AnswerOption key={o} index={o + 1} state={state} celebrate={picked === q.answer} xp={ANSWER_XP} onClick={() => answer(i, o)}>
                {option}
              </AnswerOption>
            );
          })}
        </div>
      ))}
      {finished && (
        <Button tone="warning" block attention onClick={() => onDone(correct)}>
          {correct} de {questions.length} · +{CHAPTER_XP + correct * ANSWER_XP} XP · Continuar
        </Button>
      )}
      </div>
    </section>
  );
}

export function StoryReader() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const [writing, setWriting] = useState(false);
  const [draft, setDraft] = useState("");
  const [stuck, setStuck] = useState(false);
  const [done, setDone] = useState<number[]>([]);
  const [marks, setMarks] = useState(savedMarks);
  const [tapped, setTapped] = useState<{ word: string; sentence: string } | null>(null);
  const [quiz, setQuiz] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const player = useRef<NarrationHandle>(null);

  const write = async () => {
    setWriting(true);
    setStuck(false);
    setDraft("");
    try {
      await storiesApi.nextChapter(id, setDraft);
      const updated = await storiesApi.get(id);
      setStory(updated);
      setIndex(updated.chapters.length - 1);
      sound.play("ready");
      haptics.success();
    } catch (e) {
      setStuck(true);
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setWriting(false);
    }
  };

  useEffect(() => {
    Promise.all([storiesApi.get(id), storiesApi.progress(id)])
      .then(([s, p]) => {
        setStory(s);
        setDone(p?.completedChapters ?? []);
        setIndex(Math.min(p?.currentChapter ?? 0, s.totalChapters - 1));
      })
      .catch(() => setFailed(true));
  }, [id]);

  const chapter = story?.chapters[index];
  const onWord = useCallback((word: string, sentence: string) => {
    player.current?.pause();
    setTapped({ word, sentence });
  }, []);
  const needsChapter = !!story && !chapter && !writing && !stuck;
  const written = readDraft(draft);

  useEffect(() => {
    if (needsChapter) void write();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsChapter]);

  const toggleMarks = () => {
    const next = !marks;
    setMarks(next);
    try {
      localStorage.setItem(MARKS_KEY, next ? "on" : "off");
    } catch {
      /* it just won't be remembered */
    }
  };

  const goTo = (chapterIndex: number) => {
    setQuiz(false);
    setTapped(null);
    setIndex(chapterIndex);
    window.scrollTo({ top: 0 });
  };

  const finish = async (correct: number) => {
    if (!story) return;
    setQuiz(false);
    try {
      await storiesApi.finishChapter(id, index, correct);
      setDone((list) => [...list, index]);
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
      return;
    }
    if (index + 1 >= story.totalChapters) {
      toast("¡Historia terminada!", { tone: "success" });
      sound.play("levelup");
      haptics.celebrate();
      fx.confetti({ x: window.innerWidth / 2, y: window.innerHeight / 3 }, 60, 1.8);
      navigate(MODULES.stories.path);
    } else next();
  };

  /** Moves on from a chapter that's already finished. */
  const next = () => {
    if (story?.chapters[index + 1]) goTo(index + 1);
    else {
      setTapped(null);
      window.scrollTo({ top: 0 });
      void write();
    }
  };

  if (failed) return <EmptyState kind="error" hero="tula" title="No encontré esta historia" action={<Button onClick={() => navigate(MODULES.stories.path)}>Volver a Historias</Button>} />;
  if (!story) return <Skeleton lines={8} />;

  return (
    <div className={styles.reader} data-solo={quiz || undefined}>
      <div className={styles.readerMain}>
      <div className={styles.readerBar}>
        <Button tone="neutral" variant="ghost" size="sm" iconOnly icon={<Icon name="close" size={18} />} aria-label="Salir de la lectura" onClick={() => navigate(MODULES.stories.path)} />
        <span className={styles.muted}>
          {story.title} · Capítulo {writing ? story.chapters.length + 1 : index + 1} de {story.totalChapters}
        </span>
      </div>
      <header className={styles.readerHead}>
        {writing ? written.title && <h1>{written.title}</h1> : chapter && <h1>{chapter.title}</h1>}
      </header>

      {!writing && story.chapters.length > 1 && (
        <nav className={styles.chips} aria-label="Capítulos">
          {story.chapters.map((c, i) => (
            <Chip key={i} tint="peach" selected={i === index} onToggle={() => goTo(i)}>
              {i + 1}
            </Chip>
          ))}
        </nav>
      )}

      {writing && written.title ? (
        <>
          <StreamingText text={written.text} streaming={!written.finished} className={styles.draft} />
          {written.finished && <AIThinking title="Tula está preparando las preguntas" tips={["Releyendo el capítulo…", "Buscando tus palabras…", "Pensando las preguntas…"]} skeletonLines={0} />}
        </>
      ) : writing ? (
        <AIThinking title="Tula está escribiendo" tips={["Siguiendo la trama…", "Metiendo tus palabras de hoy…"]} />
      ) : !chapter ? (
        <EmptyState kind="error" hero="tula" title="No pude escribir el capítulo" action={<Button onClick={() => void write()}>Intentar de nuevo</Button>} />
      ) : quiz ? (
        <Quiz questions={chapter.questions} onDone={(correct) => void finish(correct)} />
      ) : (
        <>
          <Narration key={index} ref={player} storyId={id} index={index} chapter={chapter} text={textRef} />
          <div ref={textRef}>
            <Paragraphs
              chapter={chapter}
              marks={marks}
              onWord={onWord}
            />
          </div>
          <div className={styles.readerFoot}>
            <label className={styles.switch}>
              <input type="checkbox" role="switch" checked={marks} onChange={toggleMarks} /> Marcar mis palabras
            </label>
            {!done.includes(index) ? (
              <Button tone="warning" block onClick={() => (chapter.questions.length ? setQuiz(true) : void finish(0))}>
                Terminé el capítulo
              </Button>
            ) : index + 1 < story.totalChapters ? (
              <Button tone="warning" block onClick={next}>
                Siguiente capítulo
              </Button>
            ) : (
              <Button tone="neutral" variant="soft" block onClick={() => navigate(MODULES.stories.path)}>
                Volver a Historias
              </Button>
            )}
          </div>
        </>
      )}
      </div>

      {!quiz && (
        <WordDock
          tapped={tapped}
          language={story.language}
          onClose={() => {
            setTapped(null);
            player.current?.resume();
          }}
        />
      )}
    </div>
  );
}
