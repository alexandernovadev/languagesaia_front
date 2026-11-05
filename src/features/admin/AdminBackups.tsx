/**
 * AdminBackups — /admin/backups. How many words and expressions are protected,
 * when the last backup ran, and a button to send one right now.
 */
import { useCallback, useEffect, useState } from "react";
import { Button, Icon, toast } from "../../components";
import { LANGUAGES } from "../../app/modules";
import { adminApi, type BackupStatus } from "./api";
import styles from "./Admin.module.css";

const when = (iso?: string) => (iso ? new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)) : "—");
const languageName = (code: string) => LANGUAGES.find((l) => l.value === code)?.label ?? code;

export function AdminBackups() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus(await adminApi.backupStatus());
      setLoadError(null);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const send = async () => {
    setSending(true);
    try {
      const { wordsCount, expressionsCount } = await adminApi.sendBackup();
      toast(`Backup enviado: ${wordsCount} palabras y ${expressionsCount} expresiones`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setSending(false);
      void load();
    }
  };

  if (loadError) return <p className={styles.notice}>{loadError}</p>;
  if (!status) return <p className={styles.muted}>Cargando…</p>;

  const last = status.runs[0];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Backups</h1>
          <p className={styles.muted}>{status.recipient ? `Se envían a ${status.recipient}` : "No hay un correo de destino configurado"}</p>
        </div>
        <div className={styles.actions}>
          <Button size="sm" sound={false} loading={sending} onClick={send} icon={<Icon name="send" size={16} />}>
            Enviar backup ahora
          </Button>
        </div>
      </header>

      {!status.automatic.active && <p className={styles.notice}>El backup automático está apagado. Revisa BACKUP_EMAIL_ENABLED en el servidor.</p>}

      <section className={styles.stats} aria-label="Resumen">
        <div className={styles.stat}>
          <span className={styles.label}>Palabras</span>
          <strong className={styles.value}>{status.words.total}</strong>
          <span className={styles.muted}>{status.words.byLanguage.map((l) => `${languageName(l.language)} ${l.count}`).join(" · ")}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Expresiones</span>
          <strong className={styles.value}>{status.expressions.total}</strong>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Último backup</span>
          <strong className={styles.value}>{last ? when(last.createdAt) : "Ninguno"}</strong>
          <span className={last && !last.success ? styles.bad : styles.muted}>{last ? (last.success ? `${last.wordsCount} palabras · ${last.expressionsCount} expresiones` : "Falló") : "Todavía no se ha hecho ninguno"}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Próximo automático</span>
          <strong className={styles.value}>{when(status.automatic.nextRun)}</strong>
          <span className={styles.muted}>{status.automatic.timezone}</span>
        </div>
      </section>

      <section>
        <h2 className={styles.label}>Historial</h2>
        {status.runs.length === 0 ? (
          <p className={styles.muted}>Aquí aparecerá cada backup que se haga.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Palabras</th>
                  <th scope="col">Expresiones</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {status.runs.map((r) => (
                  <tr key={r._id}>
                    <td>{when(r.createdAt)}</td>
                    <td className={styles.num}>{r.wordsCount}</td>
                    <td className={styles.num}>{r.expressionsCount}</td>
                    <td className={r.success ? styles.good : styles.bad}>{r.success ? "Enviado" : r.error || "Falló"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
