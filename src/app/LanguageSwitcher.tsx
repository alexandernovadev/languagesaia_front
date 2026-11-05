/**
 * LanguageSwitcher — the flag in the top bar: shows the language you're
 * learning and changes it in two taps. Saves it like Profile does, and every
 * screen reloads because AppShell keys them by language.
 *
 * Phone and tablet: bottom sheet. Desktop: small menu under the flag.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router";
import { Flag, Icon, Sheet, toast } from "../components";
import { api } from "../lib/api";
import { session, useSession, type User } from "../lib/session";
import { sound } from "../lib/sound";
import { LANGUAGES } from "./modules";
import styles from "./LanguageSwitcher.module.css";

const LEARNABLE = LANGUAGES.filter((l) => l.value !== "es");

/** Same breakpoint as AppShell's sidebar. */
const desktop = window.matchMedia("(min-width: 960px)");
const useIsDesktop = () =>
  useSyncExternalStore(
    (onChange) => {
      desktop.addEventListener("change", onChange);
      return () => desktop.removeEventListener("change", onChange);
    },
    () => desktop.matches,
  );

export function LanguageSwitcher() {
  const current = useSession();
  const language = current?.user.language ?? "en";
  const isDesktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unfinished, setUnfinished] = useState<string[]>([]);
  const root = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    api<Array<{ language: string; count: number }>>("/api/words/languages")
      .then((list) => setCounts(Object.fromEntries(list.map((l) => [l.language, l.count]))))
      .catch(() => undefined);
    api<string[]>("/api/lessons/open-languages").then(setUnfinished).catch(() => undefined);
  }, [open]);

  // The sheet closes itself; the desktop menu needs this
  useEffect(() => {
    if (!open || !isDesktop) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, isDesktop]);

  const choose = async (next: string) => {
    if (!current || saving) return;
    setOpen(false);
    if (next === language) return;
    setSaving(true);
    try {
      const updated = await api<User>(`/api/users/${current.user._id}`, { method: "PUT", body: { language: next } });
      // a word or an expression belongs to one language: go back to its list
      const section = pathname.split("/")[1];
      if (pathname !== `/${section}`) navigate(`/${section}`);
      session.set({ ...current, user: { ...current.user, ...updated, language: next } });
      sound.play("tap");
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const label = LANGUAGES.find((l) => l.value === language)?.label ?? language;

  const options = LEARNABLE.map((l) => (
    <button key={l.value} type="button" role="menuitemradio" aria-checked={l.value === language} className={styles.item} onClick={() => void choose(l.value)}>
      <Flag language={l.value} size={26} />
      <span className={styles.text}>
        <b>{l.label}</b>
        <small>
          {counts[l.value] ?? 0} palabras
          {unfinished.includes(l.value) && " · lección a medias"}
        </small>
      </span>
      {l.value === language && <Icon name="check" size={20} />}
    </button>
  ));

  return (
    <div ref={root} className={styles.root}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup={isDesktop ? "menu" : "dialog"}
        aria-expanded={open}
        aria-label={`Estás aprendiendo ${label}. Cambiar idioma`}
        onClick={() => setOpen((o) => !o)}
      >
        <Flag language={language} />
        <span className={styles.name}>{label}</span>
      </button>

      {isDesktop ? (
        open && (
          <div className={styles.menu} role="menu" aria-label="Estoy aprendiendo">
            <p className={styles.title}>Estoy aprendiendo</p>
            {options}
          </div>
        )
      ) : (
        <Sheet open={open} onClose={() => setOpen(false)} title="Estoy aprendiendo">
          <div className={styles.sheet} role="menu" aria-label="Estoy aprendiendo">
            {options}
          </div>
        </Sheet>
      )}
    </div>
  );
}
