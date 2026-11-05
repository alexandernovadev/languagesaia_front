/**
 * AppShell — the frame around every screen once you're logged in.
 *
 * Phone/tablet (< 960px): top bar (logo · XP · streak · avatar) + bottom bar with
 * 5 tabs, Repasar as the big mint button in the middle.
 * Desktop: sidebar with every module + profile; XP/streak/avatar top-right.
 *
 * Each tab lights up with its module color: the icon fills with the pastel,
 * a small pill appears under it and it springs in.
 */
import { Suspense } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Avatar, Icon, Logo, PageTransition, StreakCounter, XPCounter } from "../components";
import { tint } from "../components/types";
import { useProgress } from "../lib/progress";
import { useSession } from "../lib/session";
import { sound } from "../lib/sound";
import { BOTTOM_NAV, MODULES, SIDEBAR, type ModuleDef } from "./modules";
import styles from "./AppShell.module.css";

const isActive = (m: ModuleDef, path: string) =>
  m.path === "/" ? path === "/" : path === m.path || path.startsWith(`${m.path}/`) || (m.id === "words" && path.startsWith(MODULES.expressions.path));

export function AppShell() {
  const { pathname } = useLocation();
  const user = useSession()?.user;
  const { xp, streak } = useProgress();
  const name = [user?.firstName, user?.lastName].filter((n) => n && n !== "System").join(" ") || user?.username || "Tú";

  return (
    <div className={styles.shell}>
      {/* ── Desktop sidebar ── */}
      <aside className={styles.sidebar}>
        <NavLink to="/" className={styles.brand} aria-label="Glota, inicio">
          <Logo size={40} animated />
        </NavLink>
        <nav className={styles.sideNav} aria-label="Secciones">
          {SIDEBAR.map((group, gi) => (
            <div key={gi} className={styles.sideGroup}>
              {group.map((m) => {
                const on = isActive(m, pathname) && !(m.id === "words" && pathname.startsWith(MODULES.expressions.path));
                const expr = m.id === "expressions" && pathname.startsWith(m.path);
                const active = on || expr;
                return (
                  <NavLink
                    key={m.id}
                    to={m.path}
                    end={m.path === "/"}
                    className={styles.sideItem}
                    style={tint(m.tint)}
                    aria-current={active ? "page" : undefined}
                    onClick={() => sound.play("tap")}
                  >
                    {m.id === "profile" ? <Avatar name={name} src={user?.image} size={26} /> : <Icon name={m.icon} active={active} />}
                    <span>{m.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        {/* ── Top bar ── */}
        <header className={styles.top}>
          <NavLink to="/" className={styles.topBrand} aria-label="Glota, inicio">
            <Logo size={30} />
          </NavLink>
          <div className={styles.stats}>
            <XPCounter value={xp} />
            <StreakCounter days={streak} />
          </div>
          <NavLink to="/perfil" className={styles.avatarLink} aria-label="Tu perfil" onClick={() => sound.play("tap")}>
            <Avatar name={name} src={user?.image} size={38} />
          </NavLink>
        </header>

        <main className={styles.content}>
          <PageTransition screen={pathname}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </main>
      </div>

      {/* ── Phone bottom bar ── */}
      <nav className={styles.bottom} aria-label="Secciones">
        {BOTTOM_NAV.map((m) => {
          const active = isActive(m, pathname);
          const center = m.id === "review";
          return (
            <NavLink
              key={m.id}
              to={m.path}
              end={m.path === "/"}
              className={center ? styles.center : styles.tab}
              style={tint(m.tint)}
              aria-current={active ? "page" : undefined}
              onClick={() => sound.play("tap")}
            >
              <span className={styles.tabIcon}>
                <Icon name={m.icon} size={center ? 30 : 26} active={active || center} />
              </span>
              <span className={styles.tabLabel}>{m.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
