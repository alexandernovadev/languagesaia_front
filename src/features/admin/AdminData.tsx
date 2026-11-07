/**
 * AdminData — /admin/datos. One backup file with everything but images and
 * audio, and the way back. Importing goes in two steps: "Revisar" reports what
 * would happen without touching anything, then "Importar" does it.
 */
import { useRef, useState, type DragEvent } from "react";
import { Button, Icon, toast } from "../../components";
import { ApiError } from "../../lib/api";
import { adminApi, type BackupSection, type ImportStrategy, type SectionReport } from "./api";
import styles from "./Admin.module.css";

const SECTIONS: Record<BackupSection, string> = {
  dictionary: "Diccionario",
  expressions: "Expresiones",
  stories: "Historias",
  lessons: "Lecciones",
  progress: "Tu progreso",
};

function saveFile(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `glota-backup-${new Date().toISOString().slice(0, 10)}.json.gz`;
  link.click();
  URL.revokeObjectURL(url);
}

function Sections({ rows }: { rows: SectionReport[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Qué</th>
            <th scope="col">En el archivo</th>
            <th scope="col">Nuevos</th>
            <th scope="col">Ya existen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.section}>
              <td>{SECTIONS[row.section]}</td>
              <td>{row.total}</td>
              <td>{row.new}</td>
              <td>{row.existing}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminData() {
  const [exporting, setExporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>("keep");
  const [preview, setPreview] = useState<{ createdAt: string; sections: SectionReport[] } | null>(null);
  const [outcome, setOutcome] = useState<{ sections: SectionReport[]; failed: number } | null>(null);
  const [busy, setBusy] = useState<"review" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const resetReview = () => {
    setPreview(null);
    setOutcome(null);
    setError(null);
  };

  const pick = (next: File | undefined) => {
    if (!next) return;
    resetReview();
    if (!next.name.toLowerCase().endsWith(".gz")) {
      setFile(null);
      setError("El archivo tiene que ser una copia .json.gz");
      return;
    }
    setFile(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  };

  const download = async () => {
    setExporting(true);
    try {
      saveFile(await adminApi.downloadBackup());
      toast("Copia descargada", { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setExporting(false);
    }
  };

  const failMessage = (e: unknown) => (e instanceof ApiError && e.status === 400 ? (e.detail as { reason?: string }).reason : undefined) ?? (e as Error).message;

  const review = async () => {
    if (!file) return;
    setBusy("review");
    resetReview();
    try {
      setPreview(await adminApi.previewBackup(file));
    } catch (e) {
      setError(failMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setBusy("import");
    setError(null);
    try {
      setOutcome(await adminApi.importBackup(file, strategy));
      setPreview(null);
      setFile(null);
      if (input.current) input.current.value = "";
    } catch (e) {
      setError(failMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const willWrite = preview?.sections.reduce((sum, row) => sum + row.new + (strategy === "replace" ? row.existing : 0), 0) ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Importar y exportar</h1>
          <p className={styles.muted}>Toda tu Glota en un solo archivo.</p>
        </div>
      </header>

      <section className={styles.block}>
        <h2 className={styles.label}>Exportar</h2>
        <p className={styles.muted}>Diccionario, expresiones, historias, lecciones y tu progreso. Imágenes y audios no van en el archivo: se guardan sus enlaces.</p>
        <div className={styles.actions}>
          <Button size="sm" tone="brand" sound={false} loading={exporting} onClick={download}>
            Descargar copia
          </Button>
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={styles.label}>Importar</h2>

        <div
          className={styles.drop}
          data-active={dragging || undefined}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          {file ? (
            <p>
              <strong>{file.name}</strong> <span className={styles.muted}>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
            </p>
          ) : (
            <p className={styles.muted}>Arrastra aquí una copia .json.gz</p>
          )}
          <Button size="sm" tone="neutral" variant="soft" sound={false} onClick={() => input.current?.click()}>
            {file ? "Cambiar archivo" : "Elegir archivo"}
          </Button>
          <input ref={input} type="file" accept=".gz" hidden aria-label="Archivo a importar" onChange={(e) => pick(e.target.files?.[0])} />
        </div>

        <span className={styles.label} id="duplicates-label">
          Si ya existe
        </span>
        <div className={styles.choices} role="radiogroup" aria-labelledby="duplicates-label">
          <label>
            <input type="radio" name="strategy" checked={strategy === "keep"} onChange={() => setStrategy("keep")} />
            Dejar lo que tengo
          </label>
          <label>
            <input type="radio" name="strategy" checked={strategy === "replace"} onChange={() => setStrategy("replace")} />
            Reemplazarlo con lo del archivo
          </label>
        </div>

        {strategy === "replace" && <p className={styles.notice}>Reemplazar pisa lo que tengas ahora, incluido tu progreso. Descarga antes una copia.</p>}

        <div className={styles.actions}>
          <Button size="sm" tone="neutral" variant="soft" sound={false} disabled={!file || busy !== null} loading={busy === "review"} onClick={review}>
            Revisar
          </Button>
          <Button
            size="sm"
            tone={strategy === "replace" ? "danger" : "brand"}
            sound={false}
            disabled={!preview || willWrite === 0 || busy !== null}
            loading={busy === "import"}
            onClick={runImport}
            icon={<Icon name="check" size={16} />}
          >
            {preview ? `Importar ${willWrite}` : "Importar"}
          </Button>
        </div>

        {error && <p className={styles.notice}>{error}</p>}

        {preview && (
          <div className={styles.report}>
            <h3 className={styles.label}>Revisión · todavía no se ha cambiado nada</h3>
            <p className={styles.muted}>Copia del {new Date(preview.createdAt).toLocaleString("es")}</p>
            <Sections rows={preview.sections} />
          </div>
        )}

        {outcome && (
          <div className={styles.report}>
            <h3 className={styles.label}>Importación terminada</h3>
            <Sections rows={outcome.sections} />
            {outcome.failed > 0 && <p className={styles.notice}>{outcome.failed} registros no se pudieron importar. El resto sí.</p>}
          </div>
        )}
      </section>
    </div>
  );
}
