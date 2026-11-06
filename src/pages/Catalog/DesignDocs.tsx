/** The design documents from docs/design-system, browsable inside the catalog. */
import { useState } from "react";
import { Button, Chip } from "../../components";
import styles from "./Catalog.module.css";

const DOCS = [
  ["01-paleta", "Paleta"],
  ["02-tipografia", "Tipografía"],
  ["03-formas", "Formas"],
  ["04-animacion", "Animación"],
  ["05-personalidad", "Personalidad"],
  ["06-robots", "Robots"],
  ["07-nativos", "Nativos"],
  ["08-marca", "Marca"],
  ["09-mapa", "Mapa"],
  ["10-examenes", "Exámenes"],
] as const;

/** The frame grows with its document, so only the page scrolls. */
function fitToContent(frame: HTMLIFrameElement) {
  const body = frame.contentDocument?.body;
  if (!body) return;
  const fit = () => {
    frame.style.height = `${frame.contentDocument?.documentElement.scrollHeight ?? 0}px`;
  };
  fit();
  new ResizeObserver(fit).observe(body);
}

export function DesignDocs() {
  const [index, setIndex] = useState(0);
  const url = `/docs/design-system/${DOCS[index][0]}.html`;

  return (
    <section className={styles.docs}>
      <h2>Pantallas y estudios de diseño</h2>
      <div className={styles.docsNav}>
        {DOCS.map(([file, label], i) => (
          <Chip key={file} tint="lilac" selected={i === index} onToggle={() => setIndex(i)}>
            {label}
          </Chip>
        ))}
      </div>
      <iframe key={url} className={styles.docsFrame} src={url} title={DOCS[index][1]} scrolling="no" onLoad={(e) => fitToContent(e.currentTarget)} />
      <div className={styles.docsFoot}>
        <Button tone="neutral" size="sm" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Anterior
        </Button>
        <a href={url} target="_blank" rel="noreferrer">
          Abrir en otra pestaña
        </a>
        <Button tone="neutral" size="sm" disabled={index === DOCS.length - 1} onClick={() => setIndex(index + 1)}>
          Siguiente
        </Button>
      </div>
    </section>
  );
}
