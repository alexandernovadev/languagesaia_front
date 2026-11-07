/**
 * Narration — the chapter read aloud, with karaoke. The first press creates
 * the recording. The highlight runs outside React: a loop reads the audio's
 * position and touches only the word that ends and the one that starts.
 * Every word knows its second, so you can jump to a word, back or to a sentence.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type RefObject } from "react";
import { Button, Icon, toast } from "../../components";
import { sound } from "../../lib/sound";
import { storiesApi, type Chapter, type WordTime } from "./api";
import styles from "./Stories.module.css";

export interface NarrationHandle {
  /** A word was tapped: stop, and remember to go on. */
  pause: () => void;
  resume: () => void;
}

const RATES = [1, 0.9, 0.8];
const RATE_KEY = "glota.storyRate";
const JUMP_SECONDS = 5;
const FOLLOW_PAUSE_MS = 4000; // after you scroll by hand, the text stays where you left it
const TOP_MARGIN = 100; // the close bar
const BOTTOM_MARGIN = 170; // the player
const SENTENCE_END = /[.!?…]["”»)]*$/;

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

const savedRate = () => {
  try {
    const rate = Number(localStorage.getItem(RATE_KEY));
    return RATES.includes(rate) ? rate : 1;
  } catch {
    return 1;
  }
};

export const Narration = forwardRef<NarrationHandle, { storyId: string; index: number; chapter: Chapter; text: RefObject<HTMLDivElement | null>; from?: number }>(function Narration(
  { storyId, index, chapter, text, from },
  ref,
) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(savedRate);
  const [seconds, setSeconds] = useState(0);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // recording a chapter takes a while: the count shows it's moving
  useEffect(() => {
    if (!loading) return;
    setSeconds(0);
    const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [loading]);
  const audio = useRef<HTMLAudioElement | null>(null);
  const times = useRef<WordTime[]>(chapter.audioAlignment ?? []);
  const url = useRef(chapter.urlAudio);
  const spans = useRef<Element[]>([]);
  const current = useRef(-1);
  const frame = useRef(0);
  const interrupted = useRef(false);

  const scrolledAt = useRef(0);

  /** The word being read stays on screen, also after jumping far with the bar. */
  const follow = useCallback((force = false) => {
    const word = spans.current[current.current];
    if (!word || (!force && Date.now() - scrolledAt.current < FOLLOW_PAUSE_MS)) return;
    const { top, bottom } = word.getBoundingClientRect();
    if (top < TOP_MARGIN || bottom > window.innerHeight - BOTTOM_MARGIN) word.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  const mark = useCallback((next: number) => {
    spans.current[current.current]?.classList.remove(styles.now);
    spans.current[next]?.classList.add(styles.now);
    current.current = next;
    follow();
  }, [follow]);

  useEffect(() => {
    const byHand = () => {
      scrolledAt.current = Date.now();
    };
    window.addEventListener("wheel", byHand, { passive: true });
    window.addEventListener("touchmove", byHand, { passive: true });
    return () => {
      window.removeEventListener("wheel", byHand);
      window.removeEventListener("touchmove", byHand);
    };
  }, []);

  const tick = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    const now = player.currentTime;
    let next = current.current;
    while (next + 1 < times.current.length && times.current[next + 1].start <= now) next += 1;
    if (next !== current.current) mark(next);
    setTime(Math.floor(now)); // whole seconds: this bar redraws once a second, the text never
    if (!player.paused) frame.current = requestAnimationFrame(tick);
  }, [mark]);

  const pauseAudio = useCallback(() => {
    audio.current?.pause();
    cancelAnimationFrame(frame.current);
    setPlaying(false);
  }, []);

  const playAudio = useCallback(async () => {
    const player = audio.current;
    if (!player) return;
    await player.play();
    setPlaying(true);
    frame.current = requestAnimationFrame(tick);
  }, [tick]);

  /** Creates the player the first time, and the recording if there's none yet. */
  const prepare = useCallback(async () => {
    if (!url.current) {
      const made = await storiesApi.narrate(storyId, index);
      url.current = made.urlAudio;
      sound.play("ready");
      times.current = made.audioAlignment;
    }
    if (audio.current) return;
    const player = new Audio(url.current);
    player.playbackRate = rate;
    player.onloadedmetadata = () => setDuration(player.duration);
    player.onended = () => {
      cancelAnimationFrame(frame.current);
      mark(-1);
      setPlaying(false);
    };
    audio.current = player;
    spans.current = [...(text.current?.querySelectorAll("[data-t]") ?? [])];
  }, [storyId, index, rate, mark, text]);

  const seek = useCallback(
    (to: number) => {
      const player = audio.current;
      if (!player) return;
      player.currentTime = Math.max(0, Math.min(to, player.duration || to));
      const after = times.current.findIndex((t) => t.start > player.currentTime);
      mark(after < 0 ? times.current.length - 1 : after - 1);
      follow(true);
      setTime(Math.floor(player.currentTime));
    },
    [mark, follow],
  );

  const playFrom = useCallback(
    async (token: number) => {
      interrupted.current = false;
      await prepare();
      seek(times.current[token]?.start ?? 0);
      await playAudio();
    },
    [prepare, seek, playAudio],
  );

  /** Back to where the sentence being read begins. */
  const repeatSentence = () => {
    let start = Math.max(current.current, 0);
    while (start > 0 && !SENTENCE_END.test(times.current[start - 1].word)) start -= 1;
    void playFrom(start);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const player = audio.current;
      if (!player || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement).tagName)) return;
      if (e.key === " ") {
        e.preventDefault();
        if (player.paused) void playAudio();
        else pauseAudio();
      }
      if (e.key === "ArrowLeft") seek(player.currentTime - JUMP_SECONDS);
      if (e.key === "ArrowRight") seek(player.currentTime + JUMP_SECONDS);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seek, playAudio, pauseAudio]);

  useImperativeHandle(ref, () => ({
    pause() {
      if (audio.current && !audio.current.paused) {
        interrupted.current = true;
        pauseAudio();
      }
    },
    resume() {
      if (interrupted.current) {
        interrupted.current = false;
        void playAudio();
      }
    },
  }), [pauseAudio, playAudio]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      audio.current?.pause();
    },
    [],
  );

  const toggle = async () => {
    if (playing) return pauseAudio();
    setLoading(true);
    try {
      await prepare();
      await playAudio();
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setLoading(false);
    }
  };

  const changeRate = (next: number) => {
    setRate(next);
    if (audio.current) audio.current.playbackRate = next;
    try {
      localStorage.setItem(RATE_KEY, String(next));
    } catch {
      /* it just won't be remembered */
    }
  };

  return (
    <div className={styles.player}>
      <Button tone="warning" iconOnly loading={loading} quiet icon={<Icon name={playing ? "pause" : "play"} size={22} />} aria-label={playing ? "Pausar" : "Narrar"} sound={false} onClick={() => void toggle()} />
      {loading && (
        <span className={styles.recording} aria-live="off">
          Grabando… <b>{seconds} s</b>
        </span>
      )}
      {from !== undefined && url.current && (
        <Button tone="info" variant="soft" size="sm" sound={false} onClick={() => void playFrom(from)}>
          ▶ Desde aquí
        </Button>
      )}
      {duration > 0 && (
        <>
          <Button tone="success" variant="soft" size="sm" sound={false} className={styles.jump} aria-label={`Atrás ${JUMP_SECONDS} segundos`} onClick={() => seek((audio.current?.currentTime ?? 0) - JUMP_SECONDS)}>
            −{JUMP_SECONDS}s
          </Button>
          <Button tone="success" variant="soft" size="sm" sound={false} className={styles.jump} aria-label={`Adelante ${JUMP_SECONDS} segundos`} onClick={() => seek((audio.current?.currentTime ?? 0) + JUMP_SECONDS)}>
            +{JUMP_SECONDS}s
          </Button>
          <Button tone="neutral" variant="soft" size="sm" sound={false} onClick={repeatSentence}>
            Repetir frase
          </Button>
          <div className={styles.timeline}>
            <input type="range" min={0} max={Math.ceil(duration)} step={1} value={time} aria-label="Posición del audio" style={{ "--val": `${(time / duration) * 100}%` } as React.CSSProperties} onChange={(e) => seek(Number(e.target.value))} />
            <span>
              {clock(time)} / {clock(duration)}
            </span>
          </div>
        </>
      )}
      <select className={styles.speed} value={rate} aria-label="Velocidad" onChange={(e) => changeRate(Number(e.target.value))}>
        {RATES.map((r) => (
          <option key={r} value={r}>
            {r}×
          </option>
        ))}
      </select>
    </div>
  );
});
