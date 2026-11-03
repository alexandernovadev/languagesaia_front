/**
 * Button — the chunky 3D pastel button of Glota.
 *
 * Built on the native `<button>` (styled in native.css), so keyboard, focus and
 * forms work for free. On top of that it adds life:
 * - squish + 3D edge collapse on press, tap sound and a tiny haptic
 * - a light sweep on hover and a "gummy" lip highlight (pastel tones)
 * - `feedback`: replays a pop (success) or shake (error) every time it changes
 * - `celebrate`: confetti + "correct" sound from the button on click
 * - `attention`: breathes with a soft glow ring (use on the ONE main CTA)
 * - `loading`: text hides, spinner shows, clicks are ignored
 *
 * @example
 *   <Button onClick={check}>Check</Button>
 *   <Button tone="success" celebrate>Got it!</Button>
 *   <Button tone="neutral" icon="🔊" iconOnly aria-label="Listen" />
 *   <Button size="lg" block attention>Continue</Button>
 *   <Button variant="soft" tone="danger">Delete</Button>
 */
import { forwardRef, useEffect, useImperativeHandle, type ButtonHTMLAttributes, type ReactNode } from "react";
import { fx } from "../../lib/fx";
import { haptics } from "../../lib/haptics";
import { sound, type SoundName } from "../../lib/sound";
import { useReplay } from "../../lib/useReplay";
import { cx, type Size, type Tone } from "../types";
import styles from "./Button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Color role. `neutral` is graphite. Default `brand` (lilac). */
  tone?: Tone | "neutral";
  /** `solid` (default), `soft` tinted background, `ghost` text only. */
  variant?: "solid" | "soft" | "ghost";
  size?: Size;
  /** Full width. */
  block?: boolean;
  /** Emoji or SVG placed before the label. */
  icon?: ReactNode;
  /** Round icon button (pass `aria-label`). */
  iconOnly?: boolean;
  loading?: boolean;
  /** Sound on press. Default `tap`; `false` for silence. */
  sound?: SoundName | false;
  /** Confetti + correct sound on click. */
  celebrate?: boolean;
  /** Change it to replay: `success` pops, `error` shakes. */
  feedback?: "success" | "error" | null;
  /** Breathing glow for the single main call to action. */
  attention?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    tone = "brand",
    variant = "solid",
    size = "md",
    block,
    icon,
    iconOnly,
    loading,
    sound: soundName = "tap",
    celebrate,
    feedback,
    attention,
    type = "button",
    className,
    children,
    onClick,
    onPointerDown,
    ...rest
  },
  forwarded,
) {
  const [ref, replay] = useReplay<HTMLButtonElement>();
  useImperativeHandle(forwarded, () => ref.current as HTMLButtonElement);

  useEffect(() => {
    if (feedback === "success") replay("pop");
    if (feedback === "error") replay("shake");
  }, [feedback, replay]);

  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.root, className)}
      data-tone={tone === "neutral" ? undefined : tone}
      data-variant={variant === "solid" ? undefined : variant}
      data-size={size === "md" ? undefined : size}
      data-block={block || undefined}
      data-icon={iconOnly || undefined}
      data-attention={attention || undefined}
      aria-busy={loading || undefined}
      onPointerDown={(e) => {
        if (!loading && soundName) sound.play(soundName);
        if (!loading) haptics.tap();
        onPointerDown?.(e);
      }}
      onClick={(e) => {
        if (loading) return e.preventDefault();
        if (celebrate) {
          replay("pop");
          fx.confetti(e.currentTarget);
          sound.play("correct", { delay: 60 });
          haptics.success();
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {!iconOnly && children}
    </button>
  );
});
