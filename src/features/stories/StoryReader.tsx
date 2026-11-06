/**
 * StoryReader — reads one chapter. Every word can be tapped: a sheet shows its
 * meaning and pronunciation, and adds it to your list. Your words are marked.
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import { AIThinking, AnswerOption, Button, ChatPanel, Chip, EmptyState, Icon, LevelBadge, Logo, Modal, RobotStage, Sheet, Skeleton, SpeakButtons, StreamingText, toast, useRobotMood } from "../../components";
import { MODULES } from "../../app/modules";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { useMedia } from "../../lib/useMedia";
import { wordsApi, type Word } from "../words/api";
import { WordInfo } from "../words/WordInfo";
import { tint, type CefrLevel } from "../../components/types";
import { expressionsApi } from "../expressions/api";
import { GENRES, storiesApi, type Chapter, type Phrase, type Question, type Story, type WordLookup } from "./api";
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

const MAX_GAP = 4; // "turned the old light off": the words a phrase can have in the middle

/** Which words of the chapter belong to a phrase, by their position in the text. */
function phraseMap(chapter: Chapter) {
  const tokens = (chapter.content.match(/\S+/g) ?? []).map(cleanWord);
  const map = new Map<number, Phrase>();
  for (const phrase of chapter.phrases ?? []) {
    const gap = /\.{2,}|…/.test(phrase.text) ? MAX_GAP : 1;
    const words = phrase.text.replace(/\.{2,}|…/g, " ").split(/\s+/).map(cleanWord).filter(Boolean);
    tokens.forEach((token, start) => {
      if (token !== words[0]) return;
      const found = [start];
      for (const word of words.slice(1)) {
        const last = found[found.length - 1];
        const next = tokens.slice(last + 1, last + 1 + gap).indexOf(word);
        if (next < 0) return;
        found.push(last + 1 + next);
      }
      found.filter((at) => !map.has(at)).forEach((at) => map.set(at, phrase));
    });
  }
  return map;
}

/** Drawn once per chapter: tapping a word or the karaoke never redraws the text. */
const Paragraphs = memo(function Paragraphs({ chapter, marks, onWord }: { chapter: Chapter; marks: boolean; onWord: (word: string, sentence: string, phrase?: Phrase) => void }) {
  const mine = useMemo(() => new Set(chapter.targetVocabulary.map(cleanWord)), [chapter]);
  const phrases = useMemo(() => phraseMap(chapter), [chapter]);
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
              const phrase = phrases.get(token);
              if (!word) return <span key={i} data-t={token}>{m[0]}</span>;
              return (
                // a span, not a button: browsers can't select text across buttons
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  data-t={token}
                  className={className}
                  onClick={() => !window.getSelection()?.toString() && onWord(word, paragraph, phrase)}
                  onKeyDown={(e) => e.key === "Enter" && onWord(word, paragraph, phrase)}
                >
                  {before}
                  <span className={phrase ? styles.phrase : marks && mine.has(word) ? styles.mine : undefined}>{core}</span>
                  {after}
                </span>
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
const PHRASE_KINDS: Record<string, string> = { "phrasal verb": "Phrasal verb", idiom: "Modismo", expression: "Expresión" };

/** Words already looked up in this reading: tapping one again is instant. */
const lookups = new Map<string, WordLookup>();

type Tapped = { word: string; sentence: string; phrase?: Phrase };

/** What a word or phrase is, from memory if it was already looked up. */
function useLookup(text: string | undefined, sentence: string, language: string) {
  const [info, setInfo] = useState<WordLookup | null>(null);
  const [failed, setFailed] = useState(false);
  const key = text && `${language}:${text}`;

  useEffect(() => {
    if (!text || !key) return;
    setFailed(false);
    const known = lookups.get(key);
    setInfo(known ?? null);
    if (known) return;
    let stale = false;
    storiesApi
      .lookup(text, sentence, language)
      .then((found) => {
        lookups.set(key, found);
        if (!stale) setInfo(found);
      })
      .catch(() => !stale && setFailed(true));
    return () => {
      stale = true;
    };
    // the sentence only helps the first lookup: the same word must not search again
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = (next: WordLookup) => {
    if (key) lookups.set(key, next);
    setInfo(next);
  };
  return { info, failed, update };
}

function WordDock({ tapped, language, onClose }: { tapped: Tapped | null; language: string; onClose: () => void }) {
  const phrase = tapped?.phrase;
  const word = useLookup(tapped?.word, tapped?.sentence ?? "", language);
  const whole = useLookup(phrase?.base, phrase?.sentence ?? "", language);
  const [adding, setAdding] = useState<"word" | "phrase" | null>(null);
  const [card, setCard] = useState<Word | null>(null);

  const addWord = async () => {
    if (!word.info) return;
    setAdding("word");
    try {
      const saved = await wordsApi.generate(word.info.lemma, language);
      word.update({ ...word.info, inList: true, wordId: saved._id, audio: saved.audio });
      toast(`«${saved.word}» guardada`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setAdding(null);
    }
  };

  /** Phrasal verbs are words; idioms and expressions have their own module. */
  const addPhrase = async () => {
    if (!phrase || !whole.info) return;
    setAdding("phrase");
    try {
      if (phrase.type === "phrasal verb") {
        const saved = await wordsApi.generate(phrase.base, language);
        whole.update({ ...whole.info, inList: true, wordId: saved._id, audio: saved.audio });
      } else {
        await expressionsApi.generateAndSave(phrase.base, language);
        whole.update({ ...whole.info, inList: true });
      }
      toast(`«${phrase.base}» guardada`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setAdding(null);
    }
  };

  const openCard = async (id?: string) => {
    if (!id) return;
    try {
      setCard(await wordsApi.get(id));
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const saveAction = (info: WordLookup, kind: "word" | "phrase", label: string, onSave: () => void) =>
    info.inList && info.wordId ? (
      <Button tone="neutral" variant="soft" size="sm" onClick={() => void openCard(info.wordId)}>
        Ver ficha
      </Button>
    ) : info.inList ? (
      <span className={styles.muted}>Guardada</span>
    ) : (
      <Button tone="warning" size="sm" loading={adding === kind} disabled={!!adding && adding !== kind} onClick={onSave}>
        {label}
      </Button>
    );

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
          <b>{word.info?.lemma ?? tapped.word}</b>
          {word.info?.ipa && <span className={styles.ipa}>{word.info.ipa}</span>}
          <Button tone="neutral" variant="ghost" size="sm" iconOnly icon={<Icon name="close" size={18} />} aria-label="Cerrar" className={styles.dockClose} onClick={onClose} />
        </div>
        {word.failed && <p className={styles.muted}>No pude buscar esta palabra. Inténtalo otra vez.</p>}
        {!word.failed && !word.info && <Skeleton lines={1} />}
        {word.info && (
          <div className={styles.dockBody}>
            <p className={styles.translation}>{word.info.translation}</p>
            <div className={styles.dockActions}>
              <SpeakButtons text={word.info.lemma} language={language} wordId={word.info.wordId} audio={word.info.audio} recorded size="sm" />
              {saveAction(word.info, "word", "Agregar a mi lista", () => void addWord())}
            </div>
          </div>
        )}
        {phrase && (
          <div className={styles.dockPhrase}>
            <span className={styles.phraseKind}>Aquí es parte de: {PHRASE_KINDS[phrase.type] ?? "Expresión"}</span>
            <b>{phrase.base}</b>
            <p className={styles.translation}>En esta frase: {phrase.meaning}</p>
            {whole.info && (
              <div className={styles.dockActions}>
                <SpeakButtons text={phrase.base} language={language} wordId={whole.info.wordId} audio={whole.info.audio} recorded size="sm" />
                {saveAction(whole.info, "phrase", "Guardar", () => void addPhrase())}
              </div>
            )}
          </div>
        )}
      </aside>

      <Modal open={!!card} onClose={() => setCard(null)} title={card?.word} description={card?.spanish?.word} className={styles.cardModal}>
        {card && <WordCard key={card._id} word={card} onChange={setCard} />}
      </Modal>
    </>
  );
}

const ANSWER_XP = 5;
const CHAPTER_XP = 10;

function Quiz({ title: chapterTitle, questions, onDone }: { title: string; questions: Question[]; onDone: (correct: number) => void }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const tula = useRobotMood();
  const wide = useMedia("(min-width: 960px)"); // same as the two-column .quiz
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
      <div className={styles.quizSide}>
        <h1>{chapterTitle}</h1>
        <RobotStage hero="tula" {...tula.props} say={say} bubble="top" size={wide ? 300 : 130} />
      </div>
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

const MIN_SELECTION = 2;

/** Select part of the text and this button offers to ask Tula about it. */
function SelectionAsk({ text, onAsk }: { text: React.RefObject<HTMLDivElement | null>; onAsk: (selected: string) => void }) {
  const [selected, setSelected] = useState<{ text: string; top: number; left: number } | null>(null);

  useEffect(() => {
    const read = () => {
      const selection = window.getSelection();
      const picked = selection?.toString().trim() ?? "";
      if (!selection || picked.length < MIN_SELECTION || !text.current?.contains(selection.anchorNode)) return setSelected(null);
      const box = selection.getRangeAt(0).getBoundingClientRect();
      setSelected({ text: picked, top: box.bottom + 10, left: Math.min(Math.max(box.left + box.width / 2, 110), window.innerWidth - 110) });
    };
    document.addEventListener("selectionchange", read);
    return () => document.removeEventListener("selectionchange", read);
  }, [text]);

  if (!selected) return null;
  return createPortal(
    <div className={styles.askFloat} style={{ top: selected.top, left: selected.left }}>
      <Button
        tone="warning"
        size="sm"
        icon={<Icon name="expressions" size={16} active />}
        onPointerDown={(e) => e.preventDefault()} // keeps the selection alive
        onClick={() => {
          onAsk(selected.text);
          window.getSelection()?.removeAllRanges();
        }}
      >
        Preguntar a Tula
      </Button>
    </div>,
    document.body,
  );
}

const SUGGESTIONS = ["¿Qué significa esto?", "Tradúcelo", "¿Por qué se dice así?"];

/** One conversation per chapter: it remembers everything you asked about it. */
function ChapterChat({ storyId, index, quote, onQuoteClear }: { storyId: string; index: number; quote: string; onQuoteClear: () => void }) {
  return (
    <ChatPanel
      hero="tula"
      fill
      load={() => storiesApi.chat(storyId, index)}
      streamPath={`/api/stories/${storyId}/chapters/${index}/chat/stream`}
      quote={quote}
      onQuoteClear={onQuoteClear}
      suggestions={SUGGESTIONS}
      placeholder="Pregúntale a Tula…"
    />
  );
}

const MAX_IDEA = 300;
const PICTURE_POLL_MS = 5000;
const PICTURE_TRIES = 8;
const WORDS_PER_MINUTE = 130; // a learner's pace, not a native's

/** What this reading is, at a glance. */
function StoryDetails({ story, chapter, marks }: { story: Story; chapter?: Chapter; marks: boolean }) {
  const words = chapter?.content.split(/\s+/).length ?? 0;
  const yours = chapter?.targetVocabulary.length ?? 0;
  return (
    <div className={styles.details}>
      {chapter && (
        <div className={styles.legend}>
          {marks && (
            <span className={styles.legendItem} style={tint("lilac")}>
              <i className={styles.legendSolid} /> Tus palabras
            </span>
          )}
          {!!chapter.phrases?.length && (
            <span className={styles.legendItem} style={tint("sky")}>
              <i className={styles.legendDotted} /> Van juntas: tócalas
            </span>
          )}
        </div>
      )}
      <div className={styles.detailTags}>
        <LevelBadge level={story.languageLevel as CefrLevel} size="sm" />
        <Chip tint="peach">{GENRES[story.genre] ?? story.genre}</Chip>
        {words > 0 && (
          <>
            <span className={styles.stat} style={tint("sky")}>
              <Icon name="stories" size={15} active /> {words} palabras
            </span>
            <span className={styles.stat} style={tint("butter")}>
              <Icon name="clock" size={15} /> {Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min
            </span>
          </>
        )}
        {yours > 0 && (
          <span className={styles.stat} style={tint("mint")}>
            <Icon name="words" size={15} active /> {yours} de tu lista
          </span>
        )}
      </div>
      <p className={styles.premise}>{story.description}</p>
    </div>
  );
}

/** Before each new chapter: you can steer the story, or leave it to Tula. */
function NextIdea({ last, initial, onWrite }: { last: boolean; initial: string; onWrite: (idea?: string) => void }) {
  const [idea, setIdea] = useState(initial); // a failed chapter must not lose what you wrote
  const tula = useRobotMood("wave");
  const wide = useMedia("(min-width: 960px)"); // same as the two-column .quiz
  return (
    <section className={styles.quiz}>
      <RobotStage hero="tula" {...tula.props} say={last ? "¡Último capítulo!" : "¡Tú mandas!"} bubble="top" size={wide ? 300 : 130} />
      <div className={styles.quizBody}>
        <div>
          <h2>{last ? "¿Cómo quieres que termine?" : "¿Qué pasa ahora?"}</h2>
          <p className={styles.muted}>Escribe tu idea, en el idioma que quieras, y Tula la convierte en el siguiente capítulo.</p>
        </div>
        <textarea rows={4} value={idea} maxLength={MAX_IDEA} placeholder="Aparece su hermano con una mala noticia…" aria-label="Tu idea" onChange={(e) => setIdea(e.target.value)} />
        <span className={styles.ideaCount}>
          {idea.length}/{MAX_IDEA}
        </span>
        <Button tone="warning" block disabled={!idea.trim()} onClick={() => onWrite(idea.trim())}>
          Escribir con mi idea
        </Button>
        <Button tone="neutral" variant="soft" block onClick={() => onWrite()}>
          Que Tula decida
        </Button>
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
  const [tapped, setTapped] = useState<Tapped | null>(null);
  const [panel, setPanel] = useState<"word" | "chat">("word");
  const sideBySide = useMedia("(min-width: 900px)"); // same as the two-column .reader
  const [quote, setQuote] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const player = useRef<NarrationHandle>(null);
  const lastIdea = useRef("");

  const write = async (idea?: string) => {
    lastIdea.current = idea ?? "";
    setWriting(true);
    setStuck(false);
    setDraft("");
    try {
      await storiesApi.nextChapter(id, setDraft, idea);
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
  const onWord = useCallback((word: string, sentence: string, phrase?: Phrase) => {
    player.current?.pause();
    setTapped({ word, sentence, phrase });
    setPanel("word");
  }, []);
  const ask = useCallback((selected: string) => {
    setQuote(selected);
    setPanel("chat");
    setChatOpen(true);
  }, []);
  const needsChapter = !!story && story.chapters.length === 0 && !writing && !stuck; // only the first one writes itself
  const written = readDraft(draft);
  const picture = chapter?.img || story?.img;

  // the picture and the phrases come a few seconds after the text
  const waiting = !!chapter && (!chapter.img || !chapter.phrases) && index === (story?.chapters.length ?? 0) - 1;
  useEffect(() => {
    if (!waiting) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (tries > PICTURE_TRIES) return window.clearInterval(timer);
      storiesApi.get(id).then((fresh) => {
        const after = fresh.chapters[index];
        setStory((now) => {
          const before = now?.chapters[index];
          return after?.img !== before?.img || !!after?.phrases !== !!before?.phrases ? fresh : now; // redrawing the text only if it changed
        });
      }).catch(() => undefined);
    }, PICTURE_POLL_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waiting, index]);
  const focused = quiz || (!chapter && !writing); // no text to tap: the side panel goes away

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
    goTo(index + 1); // if it isn't written yet, this asks what happens next
  };

  if (failed) return <EmptyState kind="error" hero="tula" title="No encontré esta historia" action={<Button onClick={() => navigate(MODULES.stories.path)}>Volver a Historias</Button>} />;
  if (!story) return <Skeleton lines={8} />;

  return (
    <div className={styles.reader} data-solo={focused || undefined} data-backdrop={picture ? true : undefined}>
      {picture &&
        createPortal(
          <div className={styles.backdrop} aria-hidden="true">
            <img key={picture} src={picture} alt="" />
          </div>,
          document.body,
        )}
      <div className={styles.readerMain}>
      <div className={styles.readerBar}>
        <Button tone="neutral" variant="ghost" size="sm" iconOnly icon={<Icon name="close" size={18} />} aria-label="Salir de la lectura" onClick={() => navigate(MODULES.stories.path)} />
        <span className={styles.muted}>
          {story.title} · Capítulo {writing ? story.chapters.length + 1 : index + 1} de {story.totalChapters}
        </span>
        <Logo size={26} className={styles.barLogo} />
      </div>
      {!focused && <StoryDetails story={story} chapter={chapter} marks={marks} />}
      <header className={styles.readerHead}>
        {writing ? written.title && <h1>{written.title}</h1> : chapter && !quiz && <h1>{chapter.title}</h1>}
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
      ) : !chapter && story.chapters.length === 0 ? (
        <EmptyState kind="error" hero="tula" title="No pude escribir el capítulo" action={<Button onClick={() => void write()}>Intentar de nuevo</Button>} />
      ) : !chapter ? (
        <NextIdea last={index + 1 === story.totalChapters} initial={lastIdea.current} onWrite={(idea) => void write(idea)} />
      ) : quiz ? (
        <Quiz title={chapter.title} questions={chapter.questions} onDone={(correct) => void finish(correct)} />
      ) : (
        <>
          {chapter.idea && (
            <p className={styles.ideaNote}>
              <b>Tu idea:</b> {chapter.idea}
            </p>
          )}
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

      {chapter && !focused && <SelectionAsk text={textRef} onAsk={ask} />}

      {!focused && (
        <div className={styles.panel}>
          {sideBySide && chapter && (
            <div className={styles.panelTabs} role="tablist" aria-label="Panel">
              {(["word", "chat"] as const).map((value) => (
                <button key={value} type="button" role="tab" className={styles.tab} aria-selected={panel === value} onClick={() => setPanel(value)}>
                  {value === "word" ? "Palabra" : "Tula"}
                </button>
              ))}
            </div>
          )}
          <div className={styles.panelBody} hidden={sideBySide && panel !== "word"}>
            <WordDock
              tapped={tapped}
              language={story.language}
              onClose={() => {
                setTapped(null);
                player.current?.resume();
              }}
            />
          </div>
          {sideBySide && chapter && (
            <div className={styles.panelChat} hidden={panel !== "chat"}>
              <ChapterChat key={index} storyId={id} index={index} quote={quote} onQuoteClear={() => setQuote("")} />
            </div>
          )}
        </div>
      )}

      {!sideBySide && chapter && !focused && (
        <>
          {/* in the body: the page transition would pin it to the text instead of the screen */}
          {createPortal(
            <button type="button" className={styles.tulaFab} data-raised={tapped ? true : undefined} aria-label="Hablar con Tula" onClick={() => setChatOpen(true)}>
              <Icon name="expressions" size={28} active />
            </button>,
            document.body,
          )}
          <Sheet open={chatOpen} onClose={() => setChatOpen(false)} className={styles.askSheet} title="Pregúntale a Tula">
            {chatOpen && <ChapterChat key={index} storyId={id} index={index} quote={quote} onQuoteClear={() => setQuote("")} />}
          </Sheet>
        </>
      )}
    </div>
  );
}
