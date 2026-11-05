/**
 * Flag — small drawn flags of the languages you can learn. Emoji flags don't
 * exist on Windows, where they show up as two letters.
 *
 * @example
 *   <Flag language="pt" />
 */
import type { ReactNode } from "react";
import styles from "./Flag.module.css";

const FLAGS: Record<string, ReactNode> = {
  pt: (
    <>
      <rect width="24" height="16" fill="#2f9e5b" />
      <path d="M12 2 22 8 12 14 2 8Z" fill="#f4d13d" />
      <circle cx="12" cy="8" r="3.4" fill="#27508f" />
    </>
  ),
  en: (
    <>
      <rect width="24" height="16" fill="#f4f4f6" />
      {[0, 2.46, 4.92, 7.38, 9.84, 12.3, 14.76].map((y) => (
        <rect key={y} y={y} width="24" height="1.23" fill="#c8384a" />
      ))}
      <rect width="10.5" height="8.6" fill="#2d4a8a" />
      {[1.8, 4.2, 6.6].flatMap((y) => [2, 5.2, 8.4].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.55" fill="#f4f4f6" />))}
    </>
  ),
  fr: (
    <>
      <rect width="8" height="16" fill="#2d4a8a" />
      <rect x="8" width="8" height="16" fill="#f4f4f6" />
      <rect x="16" width="8" height="16" fill="#c8384a" />
    </>
  ),
  it: (
    <>
      <rect width="8" height="16" fill="#2f9e5b" />
      <rect x="8" width="8" height="16" fill="#f4f4f6" />
      <rect x="16" width="8" height="16" fill="#c8384a" />
    </>
  ),
};

export function Flag({ language, size = 22 }: { language: string; size?: number }) {
  return (
    <svg className={styles.flag} viewBox="0 0 24 16" width={size} height={(size * 2) / 3} aria-hidden="true">
      {FLAGS[language]}
    </svg>
  );
}
