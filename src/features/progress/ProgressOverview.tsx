/**
 * ProgressOverview — the last five weeks of study and the achievements. An
 * achievement is measured from what's already saved, so it can't be lost.
 */
import { useEffect, useState } from "react";
import { Card, Icon, ProgressBar } from "../../components";
import { api } from "../../lib/api";
import styles from "./ProgressOverview.module.css";

type Totals = { goalDays: number; reviewed: number; lessons: number; bestStreak: number; level: number };
type Overview = { today: string; goal: number; days: Array<{ day: string; xp: number }>; totals: Totals };

const ACHIEVEMENTS: Array<{ label: string; metric: keyof Totals; unit: string; targets: number[] }> = [
  { label: "Racha", metric: "bestStreak", unit: "días seguidos", targets: [3, 7, 30, 100] },
  { label: "Constancia", metric: "goalDays", unit: "metas cumplidas", targets: [10, 50, 200] },
  { label: "Memoria", metric: "reviewed", unit: "palabras repasadas", targets: [50, 250, 1000, 5000] },
  { label: "Entrenamiento", metric: "lessons", unit: "lecciones", targets: [1, 10, 50] },
  { label: "Nivel", metric: "level", unit: "de nivel", targets: [5, 10, 20] },
];

const WEEKS = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** Whole weeks from Monday, ending in the current one. */
function calendarDays(today: string) {
  const end = Date.parse(today);
  const weekday = (new Date(end).getUTCDay() + 6) % 7;
  const start = end - (weekday + (WEEKS - 1) * 7) * DAY_MS;
  return Array.from({ length: WEEKS * 7 }, (_, i) => iso(start + i * DAY_MS));
}

export function ProgressOverview() {
  const [data, setData] = useState<Overview | null>(null);

  useEffect(() => {
    api<Overview>("/api/progress/overview").then(setData).catch(() => undefined);
  }, []);

  if (!data) return null;
  const xpByDay = new Map(data.days.map((d) => [d.day, d.xp]));

  return (
    <Card>
      <h2 className={styles.title}>
        <Icon name="flame" /> Tu progreso
      </h2>

      <div className={styles.calendar} aria-label="Días estudiados en las últimas cinco semanas">
        {WEEKDAYS.map((d) => (
          <span key={d} className={styles.weekday}>
            {d}
          </span>
        ))}
        {calendarDays(data.today).map((day) => {
          const xp = xpByDay.get(day) ?? 0;
          const state = day > data.today ? "future" : xp >= data.goal ? "goal" : xp > 0 ? "some" : "none";
          return <span key={day} className={styles.day} data-state={state} data-today={day === data.today || undefined} title={`${day}: ${xp} XP`} />;
        })}
      </div>
      <p className={styles.legend}>
        <span className={styles.day} data-state="some" /> Estudiaste
        <span className={styles.day} data-state="goal" /> Meta cumplida
      </p>

      <h3 className={styles.subtitle}>Logros</h3>
      <div className={styles.achievements}>
        {ACHIEVEMENTS.map(({ label, metric, unit, targets }) => {
          const value = data.totals[metric];
          const stars = targets.filter((t) => value >= t).length;
          const next = targets[stars];
          return (
            <div key={label} className={styles.achievement}>
              <div className={styles.achievementHead}>
                <b>{label}</b>
                <span className={styles.stars} aria-label={`${stars} de ${targets.length}`}>
                  {targets.map((t, i) => (
                    <span key={t} data-on={i < stars || undefined}>
                      <Icon name="star" size={16} active={i < stars} />
                    </span>
                  ))}
                </span>
              </div>
              {next ? <ProgressBar value={value} max={next} size="sm" label={`${next} ${unit}`} /> : <p className={styles.complete}>¡Completado!</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
