/**
 * Field — label + native control + hint/error, wired for accessibility.
 *
 * Pass ONE native control as the child (input, textarea or select). Field gives
 * it an id, links the label, the hint and the error (`aria-describedby`), and
 * marks it `aria-invalid` so native.css paints it rose. When an error appears
 * the control shakes once and the message fades in.
 *
 * @example
 *   <Field label="Email" hint="We never share it" error={err}>
 *     <input type="email" value={email} onChange={…} />
 *   </Field>
 */
import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
import { cx } from "../types";
import styles from "./Field.module.css";

export interface FieldProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactElement<Record<string, unknown>>;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: (children.props.id as string | undefined) ?? id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": [errorId, hintId].filter(Boolean).join(" ") || undefined,
      })
    : children;
  const controlId = (children.props.id as string | undefined) ?? id;

  return (
    <div className={cx(styles.root, className)} data-invalid={error ? true : undefined}>
      <label className={styles.label} htmlFor={controlId}>
        {label}
      </label>
      {control}
      {error ? (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      ) : (
        hint && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )
      )}
    </div>
  );
}
