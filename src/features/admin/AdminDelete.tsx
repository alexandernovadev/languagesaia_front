/**
 * AdminDelete — /admin/borrado. Empties a whole kind of data. There's no way
 * back, so each one asks you to type BORRAR first.
 */
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Button, Modal, toast } from "../../components";
import { adminApi, type DeletableData } from "./api";
import styles from "./Admin.module.css";

const CONFIRMATION = "BORRAR";

const ITEMS: Array<{ id: DeletableData; label: string; detail: string }> = [
  { id: "words", label: "Palabras", detail: "El diccionario y las listas de todos: dificultad, chats y calendario de repaso." },
  { id: "expressions", label: "Expresiones", detail: "Todas las expresiones y sus chats." },
  { id: "lessons", label: "Lecciones", detail: "Lecciones, respuestas, puntos débiles y errores por repetir." },
  { id: "exercises", label: "Banco de ejercicios", detail: "Los ejercicios guardados. Las lecciones nuevas volverán a usar la IA." },
  { id: "stories", label: "Historias", detail: "Todas las historias y sus capítulos." },
];

export function AdminDelete() {
  const [counts, setCounts] = useState<Record<DeletableData, number> | null>(null);
  const [target, setTarget] = useState<(typeof ITEMS)[number] | null>(null);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    adminApi
      .dataCounts()
      .then(setCounts)
      .catch((e) => setError((e as Error).message));
  }, []);

  useEffect(load, [load]);

  const close = () => {
    setTarget(null);
    setTyped("");
  };

  const confirm = async () => {
    if (!target || typed !== CONFIRMATION) return;
    setDeleting(true);
    try {
      const { deletedCount } = await adminApi.deleteAll(target.id);
      toast(`${target.label}: ${deletedCount} borrados`, { tone: "success" });
      close();
      load();
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <h1>Borrado</h1>
          <p className={styles.muted}>Vacía un tipo de dato completo. No se puede deshacer.</p>
        </div>
      </header>

      <p className={styles.notice}>
        Antes de borrar, guarda una copia en <Link to="/admin/datos">Importar y exportar</Link>.
      </p>
      {error && <p className={styles.notice}>{error}</p>}

      <div className={styles.rows}>
        {ITEMS.map((item) => (
          <div key={item.id} className={styles.row}>
            <span className={styles.rowText}>
              {item.label}
              <small className={styles.muted}>{item.detail}</small>
            </span>
            <span className={styles.num}>{counts ? counts[item.id] : "…"}</span>
            <Button size="sm" tone="danger" variant="soft" sound={false} disabled={!counts?.[item.id]} onClick={() => setTarget(item)}>
              Borrar todo
            </Button>
          </div>
        ))}
      </div>

      <Modal open={!!target} onClose={close} title={`¿Borrar ${target?.label.toLowerCase()}?`} description={`Se borrarán ${target ? counts?.[target.id] : 0} registros para siempre. ${target?.detail ?? ""}`}>
        <label className={styles.label} htmlFor="delete-confirmation">
          Escribe {CONFIRMATION} para confirmar
        </label>
        <input
          id="delete-confirmation"
          className={styles.confirm}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <Modal.Actions>
          <Button tone="neutral" variant="soft" sound={false} onClick={close}>
            Cancelar
          </Button>
          <Button tone="danger" sound={false} loading={deleting} disabled={typed !== CONFIRMATION} onClick={() => void confirm()}>
            Borrar para siempre
          </Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
}
