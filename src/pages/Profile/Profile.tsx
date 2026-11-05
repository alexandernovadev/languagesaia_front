/**
 * Profile — who you are, which language you learn and in which language the
 * explanations come. Saves to the backend (PUT /api/users/:id) and updates the
 * session so every screen follows the new language right away.
 */
import { useState } from "react";
import { Link } from "react-router";
import { Avatar, Button, Card, Field, Icon, SoundToggle, toast } from "../../components";
import { LANGUAGES } from "../../app/modules";
import { api } from "../../lib/api";
import { logout, session, useSession, type User } from "../../lib/session";
import styles from "./Profile.module.css";

export function Profile() {
  const s = useSession();
  const user = s?.user;
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [explains, setExplains] = useState(user?.explainsLanguage ?? "es");
  const [saving, setSaving] = useState(false);
  if (!s || !user) return null;

  const name = [user.firstName, user.lastName].filter((n) => n && n !== "System").join(" ") || user.username;
  const dirty = language !== user.language || explains !== user.explainsLanguage;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api<User>(`/api/users/${user._id}`, { method: "PUT", body: { language, explainsLanguage: explains } });
      session.set({ ...s, user: { ...user, ...updated, language, explainsLanguage: explains } });
      toast("Idiomas guardados", { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card tint="lilac" padding="lg" className={styles.who}>
        <Avatar name={name} src={user.image} size={72} />
        <div>
          <h1>{name}</h1>
          <p className={styles.handle}>
            @{user.username}
            {user.role === "admin" && <span className={styles.admin}>Admin</span>}
          </p>
        </div>
      </Card>

      <Card>
        <h2 className={styles.title}>
          <Icon name="globe" /> Idiomas
        </h2>
        <div className={styles.grid}>
          <Field label="Estoy aprendiendo">
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.filter((l) => l.value !== "es").map((l) => (
                <option key={l.value} value={l.value}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Explicaciones en">
            <select value={explains} onChange={(e) => setExplains(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <Button onClick={save} loading={saving} disabled={!dirty} icon={<Icon name="check" size={20} />}>
            Guardar
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className={styles.title}>
          <Icon name="settings" /> Ajustes
        </h2>
        <SoundToggle />
        {import.meta.env.DEV && user.role === "admin" && (
          <Link to="/catalogo" className={styles.link}>
            <Icon name="sparkle" /> Catálogo del sistema de diseño
            <Icon name="next" size={18} />
          </Link>
        )}
      </Card>

      <Button tone="danger" variant="soft" block icon={<Icon name="logout" size={20} />} onClick={logout}>
        Cerrar sesión
      </Button>
    </div>
  );
}
