/**
 * ChatPanel — talk with a hero about something (a word, an expression, an lesson
 * question). Loads the history, streams the answer word by word and shows the
 * hero's face next to its messages: it thinks while waiting and smiles when done.
 *
 * Generic: pass how to load the history and the streaming endpoint.
 *
 * @example
 *   <ChatPanel hero="lumi" load={() => wordsApi.chat(id)}
 *     streamPath={`/api/words/${id}/chat/stream`}
 *     suggestions={["Dame otro ejemplo", "¿Cuándo se usa?"]} />
 */
import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { apiStream } from "../../lib/api";
import { sound } from "../../lib/sound";
import { Button } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { RichText } from "../RichText/RichText";
import { HEROES, Robot, useRobotMood, type Hero } from "../Robot/Robot";
import { Skeleton } from "../Skeleton/Skeleton";
import { cx, tint } from "../types";
import styles from "./ChatPanel.module.css";

export interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

export interface ChatPanelProps {
  hero: Hero;
  load: () => Promise<ChatMsg[]>;
  streamPath: string;
  suggestions?: string[];
  /** Takes the container's height: only the messages scroll and the input stays in place. */
  fill?: boolean;
  /** A part of a text the next message is about: it travels with it and shows above the input. */
  quote?: string;
  onQuoteClear?: () => void;
  placeholder?: string;
  className?: string;
  /**
   * Splits a reply into the text to show and something to put under it, like a
   * "save this word" card. `done` is false while the reply is still arriving.
   */
  extras?: (content: string, done: boolean) => { text: string; extra?: ReactNode };
}

export function ChatPanel({ hero, load, streamPath, suggestions = [], fill = false, quote, onQuoteClear, placeholder = "Escribe tu pregunta…", className, extras }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[] | null>(null);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bot = useRobotMood();
  const scroller = useRef<HTMLDivElement>(null);
  const h = HEROES[hero];

  useEffect(() => {
    let alive = true;
    load()
      .then((m) => alive && setMessages(m.map(({ role, content }) => ({ role, content: content.trim() }))))
      .catch(() => alive && setMessages([]));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamPath]);

  // Opening the chat shows the latest messages. After you ask, your question goes
  // to the top and stays there: the answer grows below it, and you read it from the start.
  const pinQuestion = useRef(false);
  const opened = useRef(false);
  useEffect(() => {
    const box = scroller.current;
    if (!box || !messages) return;
    if (!opened.current) {
      opened.current = true;
      box.scrollTop = box.scrollHeight;
      return;
    }
    if (!pinQuestion.current) return;
    const asked = [...box.querySelectorAll(`.${styles.user}`)].pop();
    if (!asked) return;
    // until the answer is long enough, the question rises with it; once at the top, it stops there
    const target = box.scrollTop + asked.getBoundingClientRect().top - box.getBoundingClientRect().top - 8;
    const reachable = Math.min(target, box.scrollHeight - box.clientHeight);
    if (reachable > box.scrollTop) box.scrollTop = reachable;
    if (reachable >= target) pinQuestion.current = false;
  }, [messages]);

  /** You scrolled yourself: the chat stops moving the text. */
  const letGo = () => {
    pinQuestion.current = false;
  };

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || streaming) return;
    setError(null);
    setDraft("");
    setStreaming(true);
    bot.react("think");
    const body = quote ? { message, selection: quote } : { message };
    const shown = quote ? `«${quote}»\n${message}` : message;
    onQuoteClear?.();
    pinQuestion.current = true;
    setMessages((m) => [...(m ?? []), { role: "user", content: shown }, { role: "assistant", content: "" }]);
    // if the AI doesn't start answering in 90 s, give up kindly
    const ctrl = new AbortController();
    let started = false;
    const timer = window.setTimeout(() => !started && ctrl.abort(), 90_000);
    try {
      await apiStream(streamPath, body, (_, full) => {
        started = true;
        setMessages((m) => {
          if (!m) return m;
          const next = m.slice();
          next[next.length - 1] = { role: "assistant", content: full.replace(/^\s+/, "") };
          return next;
        });
      }, ctrl.signal);
      bot.react("happy");
      sound.play("ready");
    } catch (e) {
      setMessages((m) => (m ? m.slice(0, -1) : m));
      setError(
        (e as Error).name === "AbortError"
          ? `${h.name} tardó demasiado en responder. La IA está lenta ahora mismo; inténtalo en un rato.`
          : (e as Error).message,
      );
      bot.react("sad");
    } finally {
      window.clearTimeout(timer);
      pinQuestion.current = false;
      setStreaming(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(draft);
  };

  return (
    <div className={cx(styles.root, fill && styles.fill, className)} style={tint(h.tint)}>
      <div className={styles.threadWrap}>
      <div ref={scroller} className={styles.thread} aria-live="polite" onWheel={letGo} onTouchMove={letGo}>
        {messages === null && <Skeleton lines={3} />}
        {messages?.length === 0 && (
          <div className={styles.intro}>
            <div className={styles.introHero}>
              <Robot hero={hero} {...bot.props} voice={false} />
            </div>
            <p>
              Soy <b>{h.name}</b>. Pregúntame lo que quieras: ejemplos, cuándo se usa, matices, diferencias…
            </p>
          </div>
        )}
        {messages?.map((m, i) => {
          const last = i === messages.length - 1;
          const live = last && streaming;
          const shown = m.role === "assistant" && extras ? extras(m.content, !live) : { text: m.content };
          const waiting = live && m.role === "assistant" && !shown.text;
          return m.role === "user" ? (
            <div key={i} className={styles.user}>
              {m.content}
            </div>
          ) : (
            <Fragment key={i}>
            <div className={styles.botRow}>
              <div className={styles.bot}>
                {waiting ? (
                  <span className={styles.dots} aria-label={`${h.name} está escribiendo`}>
                    <i />
                    <i />
                    <i />
                  </span>
                ) : (
                  <RichText text={shown.text} />
                )}
                {live && shown.text && <span className={styles.caret} aria-hidden="true" />}
              </div>
            </div>
            {shown.extra}
            </Fragment>
          );
        })}
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {!!messages?.length && (
        <span className={styles.mascot} aria-hidden="true">
          <Robot hero={hero} {...bot.props} voice={false} />
        </span>
      )}
      </div>

      {suggestions.length > 0 && !streaming && (
        <div className={styles.suggestions}>
          {suggestions.map((s) => (
            <button key={s} type="button" className={styles.suggestion} onClick={() => void send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {quote && (
        <div className={styles.quote}>
          <span>«{quote}»</span>
          <button type="button" aria-label="Quitar la cita" onClick={onQuoteClear}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      <form className={styles.composer} onSubmit={onSubmit}>
        <input type="text" value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} disabled={streaming} aria-label="Mensaje" />
        <Button type="submit" tone="brand" iconOnly icon={<Icon name="send" size={22} active />} aria-label="Enviar" disabled={!draft.trim() || streaming} sound={false} />
      </form>
    </div>
  );
}
