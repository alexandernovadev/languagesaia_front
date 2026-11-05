/**
 * AdminSystem — /admin/sistema. The dev's dashboard: what is running, whether
 * the database and the AI are healthy, which keys are missing and what failed
 * lately. Anything that needs attention shows up at the top.
 */
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "../../components";
import { API_BASE } from "../../lib/session";
import { adminApi, type SystemInfo } from "./api";
import styles from "./Admin.module.css";

const when = (iso: string) => new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));

function duration(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
}

const environment = (env: string) => ({ production: "Producción", development: "Desarrollo" })[env] ?? env;

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.panel}>
      <h2 className={styles.label}>{title}</h2>
      <dl className={styles.kv}>{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Health({ ok, children }: { ok: boolean; children: ReactNode }) {
  return <span className={ok ? styles.good : styles.bad}>{children}</span>;
}

export function AdminSystem() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setInfo(await adminApi.system());
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!info) return error ? <p className={styles.notice}>{error}</p> : <p className={styles.muted}>Cargando…</p>;

  const { server, database, ai, integrations, errors } = info;
  const missing = integrations.filter((i) => !i.configured).map((i) => i.name);
  const alerts = [
    !database.online && "La base de datos no responde.",
    ai.usingFallback && ai.fallbackUntil && `La IA está usando el modelo de respaldo hasta las ${new Date(ai.fallbackUntil).toLocaleTimeString("es")}.`,
    missing.length > 0 && `Faltan claves: ${missing.join(", ")}.`,
  ].filter(Boolean);

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Sistema</h1>
          <p className={styles.muted}>Estado del servidor y de lo que depende de él.</p>
        </div>
        <div className={styles.actions}>
          <Button size="sm" tone="neutral" variant="soft" sound={false} loading={loading} onClick={load}>
            Actualizar
          </Button>
        </div>
      </header>

      {error && <p className={styles.notice}>{error}</p>}
      {alerts.map((a) => (
        <p key={String(a)} className={styles.notice}>
          {a}
        </p>
      ))}

      <div className={styles.panels}>
        <Panel title="Backend">
          <Row label="Estado">
            <Health ok>En línea</Health>
          </Row>
          <Row label="Ambiente">{environment(server.environment)}</Row>
          <Row label="Versión">{server.version}</Row>
          <Row label="Último deploy">{server.buildDate ? when(server.buildDate) : "Sin build (desarrollo)"}</Row>
          <Row label="Encendido">{duration(server.uptimeSeconds)}</Row>
          <Row label="Memoria">{server.memoryMb} MB</Row>
          <Row label="Node">{server.node}</Row>
        </Panel>

        <Panel title="Frontend">
          <Row label="Ambiente">{import.meta.env.DEV ? "Desarrollo" : "Producción"}</Row>
          <Row label="Versión">{__APP_VERSION__}</Row>
          <Row label="Último deploy">{__BUILD_DATE__ ? when(__BUILD_DATE__) : "Sin build (desarrollo)"}</Row>
          <Row label="API">{API_BASE || "Mismo dominio"}</Row>
        </Panel>

        <Panel title="Base de datos">
          <Row label="Estado">
            <Health ok={database.online}>{database.online ? "Conectada" : "Sin conexión"}</Health>
          </Row>
          <Row label="Servidor">{database.host ?? "—"}</Row>
          <Row label="Nombre">{database.name ?? "—"}</Row>
          {database.sizeMb !== null && <Row label="Tamaño">{database.sizeMb} MB</Row>}
          {database.collections.map((c) => (
            <Row key={c.name} label={c.name}>
              {c.count}
            </Row>
          ))}
        </Panel>

        <Panel title="Inteligencia artificial">
          <Row label="Texto">
            <Health ok={!ai.usingFallback}>{ai.usingFallback ? ai.text.fallback : ai.text.model}</Health>
          </Row>
          <Row label="Respaldo">{ai.text.fallback}</Row>
          <Row label="Proveedor">{ai.text.provider}</Row>
          <Row label="Imágenes">{ai.image.model}</Row>
          <Row label="Audio">{ai.audio.model}</Row>
        </Panel>

        <Panel title="Claves configuradas">
          {integrations.map((i) => (
            <Row key={i.name} label={`${i.name} · ${i.purpose}`}>
              <Health ok={i.configured}>{i.configured ? "Sí" : "Falta"}</Health>
            </Row>
          ))}
        </Panel>
      </div>

      <section className={styles.block}>
        <h2 className={styles.label}>Últimos errores</h2>
        {errors.length === 0 ? (
          <p className={styles.muted}>No hay errores en el log.</p>
        ) : (
          <div className={styles.rows}>
            {errors.map((e, i) => (
              <div key={`${e.time}-${i}`} className={styles.logLine}>
                <time>{e.time}</time>
                <span>{e.message}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
