/**
 * AdminData — /admin/datos. Export words and expressions to a file, and bring
 * them back. Importing always goes in two steps: "Revisar" reports what would
 * happen without touching anything, then "Importar" does it.
 */
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Button, Icon, Segmented, toast } from "../../components";
import { ApiError } from "../../lib/api";
import { adminApi, type DataKind, type DuplicateStrategy, type ImportOutcome, type ImportPreview } from "./api";
import styles from "./Admin.module.css";

const KINDS: Record<DataKind, { label: string; lower: string }> = {
  words: { label: "Palabras", lower: "palabras" },
  expressions: { label: "Expresiones", lower: "expresiones" },
};

function saveFile(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Failures({ items, total }: { items: ImportPreview["failures"]; total: number }) {
  if (items.length === 0) return null;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Registro</th>
            <th scope="col">Problema</th>
          </tr>
        </thead>
        <tbody>
          {items.map((f) => (
            <tr key={f.index}>
              <td>{f.label}</td>
              <td className={`${styles.bad} ${styles.wrap}`}>{f.error}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {total > items.length && <p className={styles.more}>Y {total - items.length} más.</p>}
    </div>
  );
}

function Figures({ items }: { items: Array<[string, number]> }) {
  return (
    <div className={styles.figures}>
      {items.map(([label, value]) => (
        <div key={label}>
          <span className={styles.label}>{label}</span>
          <strong className={styles.value}>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export function AdminData() {
  const [totals, setTotals] = useState<Record<DataKind, number> | null>(null);
  const [exporting, setExporting] = useState<DataKind | null>(null);

  const [kind, setKind] = useState<DataKind>("words");
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<DuplicateStrategy>("skip");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [busy, setBusy] = useState<"review" | "import" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const loadTotals = () =>
    adminApi
      .backupStatus()
      .then((s) => setTotals({ words: s.words.total, expressions: s.expressions.total }))
      .catch((e) => setError((e as Error).message));

  useEffect(() => {
    void loadTotals();
  }, []);

  const resetReview = () => {
    setPreview(null);
    setOutcome(null);
    setError(null);
  };

  const pick = (next: File | undefined) => {
    if (!next) return;
    resetReview();
    if (!next.name.toLowerCase().endsWith(".json")) {
      setFile(null);
      setError("El archivo tiene que ser .json");
      return;
    }
    setFile(next);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  };

  const exportData = async (what: DataKind) => {
    setExporting(what);
    try {
      const data = what === "words" ? await adminApi.exportWords() : await adminApi.exportExpressions();
      saveFile(`glota-${KINDS[what].lower}-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ data }, null, 2));
      toast(`${KINDS[what].label} exportadas`, { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setExporting(null);
    }
  };

  const failMessage = (e: unknown) =>
    e instanceof ApiError && e.status === 400 ? `Este archivo no parece de ${KINDS[kind].lower}: ${(e.detail as { reason?: string } | undefined)?.reason ?? ""}` : (e as Error).message;

  const review = async () => {
    if (!file) return;
    setBusy("review");
    resetReview();
    try {
      setPreview(await adminApi.previewImport(kind, file));
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
      const result = await adminApi.runImport(kind, file, strategy);
      setOutcome(result);
      setPreview(null);
      setFile(null);
      if (input.current) input.current.value = "";
      void loadTotals();
    } catch (e) {
      setError(failMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const willWrite = preview ? preview.new + (strategy === "overwrite" ? preview.duplicates : 0) : 0;
  const invalidInOutcome = outcome?.totalInvalid ?? 0;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Importar y exportar</h1>
          <p className={styles.muted}>Copias de tus palabras y expresiones en archivos JSON.</p>
        </div>
      </header>

      <section className={styles.block}>
        <h2 className={styles.label}>Exportar</h2>
        <div className={styles.rows}>
          {(Object.keys(KINDS) as DataKind[]).map((k) => (
            <div key={k} className={styles.row}>
              <span>{KINDS[k].label}</span>
              <span className={styles.num}>{totals ? totals[k] : "…"}</span>
              <Button size="sm" tone="neutral" variant="soft" sound={false} loading={exporting === k} disabled={exporting !== null} onClick={() => exportData(k)}>
                Exportar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <h2 className={styles.label}>Importar</h2>

        <Segmented
          label="Qué quieres importar"
          value={kind}
          onChange={(v) => {
            setKind(v);
            resetReview();
          }}
          options={[
            { value: "words", label: "Palabras" },
            { value: "expressions", label: "Expresiones" },
          ]}
        />

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
              <strong>{file.name}</strong> <span className={styles.muted}>{(file.size / 1024).toFixed(0)} KB</span>
            </p>
          ) : (
            <p className={styles.muted}>Arrastra aquí un archivo .json de exportación o de backup</p>
          )}
          <Button size="sm" tone="neutral" variant="soft" sound={false} onClick={() => input.current?.click()}>
            {file ? "Cambiar archivo" : "Elegir archivo"}
          </Button>
          <input ref={input} type="file" accept=".json,application/json" hidden aria-label="Archivo a importar" onChange={(e) => pick(e.target.files?.[0])} />
        </div>

        <span className={styles.label} id="duplicates-label">
          Si ya existe
        </span>
        <div className={styles.choices} role="radiogroup" aria-labelledby="duplicates-label">
          <label>
            <input type="radio" name="strategy" checked={strategy === "skip"} onChange={() => setStrategy("skip")} />
            Dejar la que tengo
          </label>
          <label>
            <input type="radio" name="strategy" checked={strategy === "overwrite"} onChange={() => setStrategy("overwrite")} />
            Reemplazarla con la del archivo
          </label>
        </div>

        {strategy === "overwrite" && (
          <p className={styles.notice}>Reemplazar pisa lo que tengas ahora, incluidos la dificultad, las veces vistas y el chat. Exporta antes una copia.</p>
        )}

        <div className={styles.actions}>
          <Button size="sm" tone="neutral" variant="soft" sound={false} disabled={!file || busy !== null} loading={busy === "review"} onClick={review}>
            Revisar
          </Button>
          <Button
            size="sm"
            tone={strategy === "overwrite" ? "danger" : "brand"}
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
            <Figures
              items={[
                ["En el archivo", preview.total],
                ["Nuevas", preview.new],
                ["Ya existen", preview.duplicates],
                ["Con errores", preview.invalid],
              ]}
            />
            {preview.invalid > 0 && <p className={styles.muted}>Los registros con errores no se importarán; el resto sí.</p>}
            <Failures items={preview.failures} total={preview.invalid} />
          </div>
        )}

        {outcome && (
          <div className={styles.report}>
            <h3 className={styles.label}>Importación terminada</h3>
            <Figures
              items={[
                ["Añadidas", outcome.totalInserted],
                ["Reemplazadas", outcome.totalUpdated],
                ["Omitidas", outcome.totalSkipped - invalidInOutcome],
                ["Con errores", outcome.totalErrors + invalidInOutcome],
              ]}
            />
            <Failures items={outcome.failures} total={outcome.totalErrors + invalidInOutcome} />
          </div>
        )}
      </section>
    </div>
  );
}
