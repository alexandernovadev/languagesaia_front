/**
 * AdminLayout — the frame of /admin. On purpose it looks nothing like the app:
 * a quiet console with straight lines and dense information, no heroes.
 * To add a section: add it to SECTIONS and give it a child route in App.tsx.
 */
import { Suspense } from "react";
import { Link, Navigate, NavLink, Outlet } from "react-router";
import { Icon, Logo } from "../../components";
import type { IconName } from "../../components/Icon/Icon";
import { useSession } from "../../lib/session";
import styles from "./Admin.module.css";

const SECTIONS: Array<{ path: string; label: string; icon: IconName }> = [
  { path: "sistema", label: "Sistema", icon: "settings" },
  { path: "backups", label: "Backups", icon: "check" },
  { path: "datos", label: "Importar y exportar", icon: "send" },
];

export function AdminLayout() {
  const user = useSession()?.user;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <div className={styles.brand}>
          <Logo size={26} />
          <span className={styles.tag}>Admin</span>
        </div>
        <nav className={styles.nav} aria-label="Secciones de administración">
          {SECTIONS.map((s) => (
            <NavLink key={s.path} to={s.path} className={styles.navItem}>
              <Icon name={s.icon} size={18} />
              {s.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/perfil" className={styles.exit}>
          <Icon name="back" size={18} />
          Volver a Glota
        </Link>
      </aside>
      <main className={styles.content}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
