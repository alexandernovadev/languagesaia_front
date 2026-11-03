/**
 * Soon — placeholder for modules still being built. The module's hero thinks
 * about it. Words/Expressions share a segmented switch at the top.
 */
import { useLocation, useNavigate } from "react-router";
import { EmptyState, Segmented } from "../../components";
import { MODULES, type ModuleDef } from "../../app/modules";
import type { Hero } from "../../components";
import styles from "./Soon.module.css";

export function Soon({ module }: { module: ModuleDef }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const vocab = module.id === "words" || module.id === "expressions";
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>{module.label}</h1>
        {vocab && (
          <Segmented
            label="Tipo de vocabulario"
            value={pathname.startsWith(MODULES.expressions.path) ? "expressions" : "words"}
            onChange={(v) => navigate(MODULES[v].path)}
            options={[
              { value: "words", label: "Palabras", icon: "words", tint: "sky" },
              { value: "expressions", label: "Expresiones", icon: "expressions", tint: "lilac" },
            ]}
          />
        )}
      </header>
      <EmptyState
        kind="soon"
        hero={module.hero as Hero}
        title={`${module.label}: muy pronto`}
        text={`${module.pitch} Estamos construyendo esta pantalla.`}
      />
    </div>
  );
}
