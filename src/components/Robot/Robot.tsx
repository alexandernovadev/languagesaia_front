/**
 * Robot — the five superhero robots of LanguagesAI (squad v5).
 *
 * Hand-built SVG with a full skeleton (shoulder → elbow → hand, hip → knee → foot),
 * many detail layers and 7 moods animated with the 12 principles of animation:
 * idle · wave · happy · party · think · sad · sleep.
 *
 * | hero  | module      | color  | voice |
 * |-------|-------------|--------|-------|
 * | lumi  | Words       | sky    | 1.18  |
 * | nubo  | Expressions | lilac  | 1.32  |
 * | tula  | Stories     | peach  | 1.06  |
 * | bruno | Exams       | butter | 0.62  |
 * | menti | Anki        | mint   | 1.6   |
 *
 * - `<Robot>` is just the character. Changing `mood` replays the pose and plays the
 *   hero's own voice for it (pitch-shifted). Pass a new `replay` number to replay
 *   the same mood again (e.g. a second correct answer).
 * - `<RobotStage>` adds the world around it: floor shadow that shrinks when it
 *   flies, dust puffs on landing, sparkles on party, and an optional speech bubble.
 * - `useRobotMood()` handles the timing: short moods (wave, happy) go back to idle.
 *
 * @example
 *   const robot = useRobotMood();
 *   <RobotStage hero="nubo" {...robot.props} say="¡Hola!" />
 *   robot.react("happy");   // on a correct answer
 *   robot.react("party");   // lesson complete (stays until next react)
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { fx } from "../../lib/fx";
import { sound } from "../../lib/sound";
import { SpeechBubble } from "../SpeechBubble/SpeechBubble";
import { cx, type Pastel } from "../types";
import { ROBOT_ART } from "./robotArt";
import "./robot.css";
import styles from "./Robot.module.css";

export type Hero = keyof typeof ROBOT_ART;
export type Mood = "idle" | "wave" | "happy" | "party" | "think" | "sad" | "sleep";

export const HEROES: Record<Hero, { name: string; module: string; tint: Pastel; voice: number; hello: string }> = {
  lumi: { name: "Lumi", module: "Palabras", tint: "sky", voice: 1.18, hello: "¡Hola! Cada palabra cuenta." },
  nubo: { name: "Nubo", module: "Expresiones", tint: "lilac", voice: 1.32, hello: "¡Hola! Hoy recolecté 12 expresiones." },
  tula: { name: "Tula", module: "Historias", tint: "peach", voice: 1.06, hello: "Te tengo una historia…" },
  bruno: { name: "Bruno", module: "Exámenes", tint: "butter", voice: 0.62, hello: "¡A entrenar, recluta!" },
  menti: { name: "Menti", module: "Anki", tint: "mint", voice: 1.6, hello: "¡Bip! No olvido nada." },
};

export interface RobotProps {
  hero: Hero;
  mood?: Mood;
  /** Change this number to replay the same mood. */
  replay?: number;
  /** Play the hero's voice when the mood changes. Default true. */
  voice?: boolean;
  className?: string;
}

export function Robot({ hero, mood = "idle", replay = 0, voice = true, className }: RobotProps) {
  const ref = useRef<SVGSVGElement>(null);
  const first = useRef(true);
  const h = HEROES[hero];

  // Restart the pose from idle so every mood plays from its first frame.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.mood = "idle";
    void el.getBoundingClientRect();
    el.dataset.mood = mood;
    if (first.current) {
      first.current = false;
      return;
    }
    if (voice && mood !== "idle") sound.play(mood, { voice: h.voice });
  }, [mood, replay, voice, h.voice]);

  return (
    <svg
      ref={ref}
      key={hero}
      className={cx("robot", `r-${hero}`, `c-${h.tint}`, className)}
      viewBox="0 0 200 260"
      data-mood={mood}
      role="img"
      aria-label={`${h.name}, robot de ${h.module}`}
      dangerouslySetInnerHTML={{ __html: ROBOT_ART[hero] }}
    />
  );
}

/** Mood state with timing: transient moods return to idle by themselves. */
export function useRobotMood(initial: Mood = "idle") {
  const [mood, setMood] = useState<Mood>(initial);
  const [replay, setReplay] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const react = useCallback((next: Mood) => {
    window.clearTimeout(timer.current);
    setMood(next);
    setReplay((n) => n + 1);
    const back = next === "wave" ? 2200 : next === "happy" ? 1700 : 0;
    if (back) timer.current = window.setTimeout(() => setMood("idle"), back);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  return { mood, react, props: { mood, replay } };
}

export interface RobotStageProps extends RobotProps {
  /** Text in a speech bubble next to the hero. */
  say?: ReactNode;
  /** Bubble on the side (default) or above. */
  bubble?: "side" | "top";
  /** Max width of the robot in px. Default 260. */
  size?: number;
}

export function RobotStage({ say, bubble = "side", size = 260, className, ...robot }: RobotStageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const floor = useRef<HTMLDivElement>(null);
  const { mood = "idle", replay = 0 } = robot;

  useEffect(() => {
    const w = wrap.current;
    const f = floor.current;
    if (!w || !f) return;
    if (mood === "happy") {
      f.removeAttribute("data-hop");
      void f.offsetWidth;
      f.setAttribute("data-hop", "");
      // dust when the feet touch the ground again
      const t = window.setTimeout(() => puffs(w), 600);
      return () => window.clearTimeout(t);
    }
    if (mood === "party") fx.sparkles(w, 10, 120);
  }, [mood, replay]);

  return (
    <div className={cx(styles.stage, className)} data-bubble={bubble} style={{ "--size": `${size}px` } as React.CSSProperties}>
      <div ref={wrap} className={styles.hero} data-flying={mood === "party" || undefined}>
        <div ref={floor} className={styles.floor} aria-hidden="true" />
        <Robot {...robot} />
      </div>
      {say && (
        <div className={styles.say}>
          <SpeechBubble tail={bubble === "side" ? "left" : "bottom"}>{say}</SpeechBubble>
        </div>
      )}
    </div>
  );
}

/** Little dust clouds puffing out from both feet. */
function puffs(container: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  [-1, 1].forEach((dir) => {
    for (let i = 0; i < 3; i++) {
      const d = document.createElement("span");
      d.className = styles.dust;
      d.style.left = `calc(50% + ${dir * (30 + i * 8)}px)`;
      d.style.setProperty("--dx", `${dir * (14 + i * 10)}px`);
      d.style.animationDelay = `${i * 40}ms`;
      container.appendChild(d);
      window.setTimeout(() => d.remove(), 800);
    }
  });
}
