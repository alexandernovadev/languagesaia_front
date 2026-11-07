/**
 * Narration — the chapter read aloud, with karaoke. The first press creates
 * the recording. The highlight runs outside React: a loop reads the audio's
 * position and touches only the word that ends and the one that starts.
 */
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type RefObject } from "react";
import { Button, Icon, Segmented, toast } from "../../components";
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

const savedRate = () => {
  try {
    const rate = Number(localStorage.getItem(RATE_KEY));
    return RATES.includes(rate) ? rate : 1;
  } catch {
    return 1;
  }
};

export const Narration = forwardRef<NarrationHandle, { storyId: string; index: number; chapter: Chapter; text: RefObject<HTMLDivElement | null> }>(function Narration(
  { storyId, index, chapter, text },
  ref,
) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(savedRate);
  const [seconds, setSeconds] = useState(0);

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

  const mark = useCallback((next: number) => {
    spans.current[current.current]?.classList.remove(styles.now);
    spans.current[next]?.classList.add(styles.now);
    current.current = next;
  }, []);

  const tick = useCallback(() => {
    const player = audio.current;
    if (!player) return;
    const now = player.currentTime;
    let next = current.current;
    while (next + 1 < times.current.length && times.current[next + 1].start <= now) next += 1;
    if (next !== current.current) mark(next);
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
      if (!url.current) {
        const made = await storiesApi.narrate(storyId, index);
        url.current = made.urlAudio;
        sound.play("ready");
        times.current = made.audioAlignment;
      }
      if (!audio.current) {
        const player = new Audio(url.current);
        player.playbackRate = rate;
        player.onended = () => {
          cancelAnimationFrame(frame.current);
          mark(-1);
          setPlaying(false);
        };
        audio.current = player;
        spans.current = [...(text.current?.querySelectorAll("[data-t]") ?? [])];
      }
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
      <Button tone="warning" size="sm" loading={loading} quiet icon={<Icon name="sound" size={18} active />} sound={false} onClick={() => void toggle()}>
        {playing ? "Pausar" : "Narrar"}
      </Button>
      {loading && (
        <span className={styles.recording} aria-live="off">
          Grabando… <b>{seconds} s</b>
        </span>
      )}
      <div className={styles.speed}>
        <Segmented label="Velocidad" value={String(rate)} onChange={(v) => changeRate(Number(v))} options={RATES.map((r) => ({ value: String(r), label: `${r}×` }))} />
      </div>
    </div>
  );
});
