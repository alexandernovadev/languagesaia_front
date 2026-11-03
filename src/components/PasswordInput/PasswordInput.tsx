/**
 * PasswordInput — native password field with a show/hide eye button inside.
 * Forwards every input prop (id, aria-*, onFocus…), so it works inside `<Field>`.
 *
 * @example
 *   <Field label="Contraseña"><PasswordInput value={pw} onChange={…} /></Field>
 */
import { useState, type InputHTMLAttributes } from "react";
import { sound } from "../../lib/sound";
import styles from "./PasswordInput.module.css";

export function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.root}>
      <input {...props} type={visible ? "text" : "password"} className={styles.input} />
      <button
        type="button"
        className={styles.eye}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        aria-pressed={visible}
        onClick={() => {
          sound.play("tap");
          setVisible((v) => !v);
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
          <path className={styles.slash} d="M4 4l16 16" />
        </svg>
      </button>
    </div>
  );
}
