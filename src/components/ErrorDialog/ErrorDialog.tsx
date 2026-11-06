/**
 * ErrorDialog — says what failed and why. Mount it once near the app root; it
 * opens by itself when `lib/api` reports an error.
 */
import { useEffect, useState } from "react";
import { useAppError, appErrors } from "../../lib/errors";
import { haptics } from "../../lib/haptics";
import { sound } from "../../lib/sound";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import { RobotStage, useRobotMood } from "../Robot/Robot";
import styles from "./ErrorDialog.module.css";

export function ErrorDialog() {
  const error = useAppError();
  const menti = useRobotMood();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!error) return;
    setCopied(false);
    menti.react("sad");
    sound.play("wrong");
    haptics.error();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const copy = async () => {
    if (!error) return;
    const text = [error.message, error.reason, `${error.status} · ${error.action}`, error.time.toISOString()].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(true);
  };

  return (
    <Modal open={!!error} onClose={appErrors.dismiss} title="Algo salió mal">
      {error && (
        <div className={styles.root}>
          <RobotStage hero="menti" {...menti.props} size={110} className={styles.hero} />
          <p className={styles.message}>{error.hint || error.message}</p>
          {error.reason && <p className={styles.reason}>{error.reason}</p>}
          <dl className={styles.facts}>
            <div>
              <dt>Código</dt>
              <dd>{error.status || "Sin conexión"}</dd>
            </div>
            <div>
              <dt>Acción</dt>
              <dd>{error.action}</dd>
            </div>
            <div>
              <dt>Hora</dt>
              <dd>{error.time.toLocaleTimeString("es")}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            <Button tone="neutral" variant="soft" block sound={false} onClick={() => void copy()}>
              {copied ? "Copiado" : "Copiar detalle"}
            </Button>
            <Button tone="danger" block onClick={appErrors.dismiss}>
              Entendido
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
