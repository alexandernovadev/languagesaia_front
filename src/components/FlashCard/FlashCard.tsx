/**
 * FlashCard — Anki card that flips in 3D with a spring and a paper "flip" sound.
 *
 * Click, tap, Enter or Space flips it. Works controlled (`flipped` + `onFlip`)
 * or uncontrolled. The back is tinted with the card's color (mint for Anki).
 *
 * @example
 *   <FlashCard
 *     front={<><b className="word">serendipity</b><span>/ˌser.ənˈdɪp.ə.ti/</span></>}
 *     back="Finding something good by chance."
 *   />
 */
import { useState, type ReactNode } from "react";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { cx, tint as tintVars, type Pastel } from "../types";
import styles from "./FlashCard.module.css";

export interface FlashCardProps {
  front: ReactNode;
  back: ReactNode;
  tint?: Pastel;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  /** Small text under the front face. */
  hint?: string;
  className?: string;
}

export function FlashCard({ front, back, tint = "mint", flipped, onFlip, hint = "Toca para girar", className }: FlashCardProps) {
  const [inner, setInner] = useState(false);
  const isFlipped = flipped ?? inner;
  const flip = () => {
    sound.play("flip");
    haptics.tap();
    setInner(!isFlipped);
    onFlip?.(!isFlipped);
  };
  return (
    <button type="button" className={cx(styles.root, className)} style={tintVars(tint)} aria-pressed={isFlipped} onClick={flip}>
      <span className={styles.inner}>
        <span className={cx(styles.face, styles.front)} aria-hidden={isFlipped}>
          {front}
          {hint && <span className={styles.hint}>{hint}</span>}
        </span>
        <span className={cx(styles.face, styles.back)} aria-hidden={!isFlipped}>
          {back}
        </span>
      </span>
    </button>
  );
}
