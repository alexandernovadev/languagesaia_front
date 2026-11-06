/**
 * AppShell — the frame around every screen once you're logged in.
 *
 * Top bar (logo · XP · streak · avatar) + 5 tabs, Repasar as the big mint button
 * in the middle. On a phone the tabs are a bottom bar; on desktop, a floating dock.
 * While reading a story both go away: the reader has its own X.
 *
 * Each tab lights up with its module color: the icon fills with the pastel,
 * a small pill appears under it and it springs in.
 */
import { Suspense, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { Avatar, Icon, Logo, PageTransition, StreakCounter, XPCounter } from "../components";
import { tint } from "../components/types";
import { progress, useProgress } from "../lib/progress";
import { useSession } from "../lib/session";
import { sound } from "../lib/sound";
import { BOTTOM_NAV, MODULES, type ModuleDef } from "./modules";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./AppShell.module.css";

const isActive = (m: ModuleDef, path: string) =>
  m.path === "/" ? path === "/" : path === m.path || path.startsWith(`${m.path}/`) || (m.id === "words" && path.startsWith(MODULES.expressions.path));

export function AppShell() {
  const { pathname } = useLocation();
  const user = useSession()?.user;
  const stats = useProgress();

  useEffect(() => {
    progress.load().catch(() => undefined);
  }, [user?._id]);

  const reading = pathname.startsWith(`${MODULES.stories.path}/`);
  const name = [user?.firstName, user?.lastName].filter((n) => n && n !== "System").join(" ") || user?.username || "Tú";

  return (
    <div className={styles.shell} data-reading={reading || undefined}>
      <div className={styles.main}>
        {/* ── Top bar ── */}
        {!reading && <header className={styles.top}>
          <NavLink to="/" className={styles.topBrand} aria-label="Glota, inicio">
            <Logo size={30} />
            <span className={styles.version}>v{__APP_VERSION__}</span>
          </NavLink>
          <div className={styles.stats}>
            {stats && (
              <>
                <XPCounter value={stats.xp} />
                <StreakCounter days={stats.streak} />
              </>
            )}
          </div>
          <LanguageSwitcher />
          <NavLink to="/perfil" className={styles.avatarLink} aria-label="Tu perfil" onClick={() => sound.play("tap")}>
            <Avatar name={name} src={user?.image} size={38} />
          </NavLink>
        </header>}

        <main className={styles.content}>
          {/* the language is part of the key: every screen reloads its data when it changes */}
          <PageTransition screen={`${user?.language}:${pathname}`}>
            <Suspense fallback={null}>
              <Outlet />
            </Suspense>
          </PageTransition>
        </main>
      </div>

      {/* ── Tabs: bottom bar on a phone, floating dock on desktop ── */}
      {!reading && <nav className={styles.bottom} aria-label="Secciones">
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
                <Icon name={m.icon} size={center ? 26 : 22} active={active || center} />
              </span>
              <span className={styles.tabLabel}>{m.label}</span>
            </NavLink>
          );
        })}
      </nav>}
    </div>
  );
}
