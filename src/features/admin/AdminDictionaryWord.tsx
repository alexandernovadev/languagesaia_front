/**
 * AdminDictionaryWord — /admin/diccionario/:id/editar and /nueva. Edit one dictionary
 * entry. Hiding is the normal way out: a real delete only works if nobody has it.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button, Icon, Modal, Skeleton, toast } from "../../components";
import { WORD_TYPES, wordsApi, type Word } from "../words/api";
import { dictionaryApi, type DictionaryWord } from "./api";
import { lastList } from "./AdminDictionary";
import styles from "./Admin.module.css";

const lines = (list?: string[]) => (list ?? []).join("\n");
const list = (text: string) => text.split("\n").map((l) => l.trim()).filter(Boolean);

const EMPTY_EN = { forms: { base: "", past: "", participle: "", gerund: "", third: "" } };
const PERSONS = { eu: "", voce: "", nos: "", eles: "" };
const EMPTY_PT = { presente: { ...PERSONS }, preterito: { ...PERSONS }, imperfeito: { ...PERSONS }, futuro: { ...PERSONS }, subjuntivo: { ...PERSONS } };

type Regen = "examples" | "code-switching" | "synonyms";

export function AdminDictionaryWord() {
  const { id } = useParams();
  const creating = !id;
  const navigate = useNavigate();
  const [word, setWord] = useState<Partial<DictionaryWord> | null>(creating ? { language: "en", word: "", definition: "", examples: [], synonyms: [], codeSwitching: [], type: [] } : null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (id) dictionaryApi.get(id).then(setWord).catch((e) => toast((e as Error).message, { tone: "danger" }));
  }, [id]);

  if (!word) return <Skeleton lines={10} />;
  const set = (change: Partial<DictionaryWord>) => setWord({ ...word, ...change });
  const verb = word.type?.some((t) => t.includes("verb") && t !== "adverb");

  const save = async () => {
    setSaving(true);
    try {
      const saved = creating ? await dictionaryApi.create(word) : await dictionaryApi.save(id, word);
      toast(`«${saved.word}» guardada`, { tone: "success" });
      if (creating) navigate(`../${saved._id}`, { relative: "path", replace: true });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setSaving(false);
    }
  };

  const draft = async () => {
    if (!word.word?.trim()) return;
    setBusy("draft");
    try {
      const made = await dictionaryApi.draft(word.word, word.language ?? "en");
      setWord({ ...word, ...made, word: word.word, language: word.language });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setBusy(null);
    }
  };

  const regen = async (what: Regen) => {
    if (!id) return;
    setBusy(what);
    try {
      const updated = await wordsApi.regenerate(id, what, word as Word);
      setWord({ ...word, ...updated });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setBusy(null);
    }
  };

  const image = async () => {
    if (!id) return;
    setBusy("image");
    try {
      const updated = await wordsApi.image(id, word as Word);
      setWord({ ...word, img: updated.img });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setBusy(null);
    }
  };

  const toggleHidden = async () => {
    if (!id) return;
    try {
      const updated = await dictionaryApi.hide(id, !word.hiddenAt);
      setWord({ ...word, hiddenAt: updated.hiddenAt });
      setLeaving(false);
      toast(updated.hiddenAt ? "Oculta: ya no sale en Repasar" : "Visible otra vez", { tone: "success" });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const remove = async () => {
    if (!id) return;
    try {
      await dictionaryApi.remove(id);
      toast("Palabra borrada", { tone: "success" });
      navigate(lastList.url);
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    }
  };

  const listField = (label: string, field: "examples" | "codeSwitching" | "synonyms", what: Regen) => (
    <div className={styles.dictField}>
      <div className={styles.dictFieldHead}>
        <span className={styles.label}>{label}, una por línea</span>
        {!creating && (
          <Button size="sm" tone="neutral" variant="soft" sound={false} quiet loading={busy === what} disabled={!!busy && busy !== what} onClick={() => void regen(what)}>
            Regenerar
          </Button>
        )}
      </div>
      <textarea rows={field === "synonyms" ? 3 : 5} value={lines(word[field])} onChange={(e) => set({ [field]: e.target.value.split("\n") })} onBlur={(e) => set({ [field]: list(e.target.value) })} />
    </div>
  );

  const conjugations = word.conjugations;
  const setForm = (group: string, key: string, value: string) => set({ conjugations: { ...conjugations, [group]: { ...conjugations?.[group], [key]: value } } });

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <Link to=".." relative="path" className={styles.muted}>
            ← {creating ? "Diccionario" : word.word}
          </Link>
          <h1>{creating ? "Nueva palabra" : word.word}</h1>
          {!creating && (
            <p className={styles.muted}>
              {word.learners ? `${word.learners} ${word.learners === 1 ? "persona la tiene" : "personas la tienen"}` : "Nadie la tiene"}
              {word.rank ? ` · posición ${word.rank}` : ""}
              {word.hiddenAt ? " · oculta" : ""}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {!creating && (
            <Button size="sm" tone="danger" variant="soft" sound={false} onClick={() => setLeaving(true)}>
              {word.hiddenAt ? "Mostrar u ocultar" : "Ocultar o borrar"}
            </Button>
          )}
          <Button size="sm" tone="success" sound={false} loading={saving} onClick={() => void save()}>
            Guardar
          </Button>
        </div>
      </header>

      <div className={styles.dictGrid}>
        <div className={styles.dictField}>
          <span className={styles.label}>Palabra</span>
          <input type="text" value={word.word ?? ""} onChange={(e) => set({ word: e.target.value })} />
        </div>
        {creating ? (
          <div className={styles.dictField}>
            <span className={styles.label}>Idioma</span>
            <select value={word.language} onChange={(e) => set({ language: e.target.value })}>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
          </div>
        ) : (
          <div className={styles.dictField}>
            <span className={styles.label}>Pronunciación</span>
            <input type="text" value={word.IPA ?? ""} onChange={(e) => set({ IPA: e.target.value })} />
          </div>
        )}
      </div>

      {creating && (
        <div>
          <Button size="sm" tone="info" variant="soft" sound={false} quiet loading={busy === "draft"} disabled={!word.word?.trim()} icon={<Icon name="sparkle" size={16} />} onClick={() => void draft()}>
            Llenar con IA
          </Button>
        </div>
      )}

      <div className={styles.dictGrid}>
        <div className={styles.dictField}>
          <span className={styles.label}>Traducción</span>
          <input type="text" value={word.spanish?.word ?? ""} onChange={(e) => set({ spanish: { ...word.spanish, word: e.target.value } })} />
        </div>
        <div className={styles.dictField}>
          <span className={styles.label}>Posición</span>
          <input type="number" value={word.rank ?? ""} onChange={(e) => set({ rank: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div className={styles.dictField}>
        <span className={styles.label}>Definición</span>
        <textarea rows={3} value={word.definition ?? ""} onChange={(e) => set({ definition: e.target.value })} />
      </div>
      <div className={styles.dictField}>
        <span className={styles.label}>Definición en español</span>
        <textarea rows={3} value={word.spanish?.definition ?? ""} onChange={(e) => set({ spanish: { ...word.spanish, definition: e.target.value } })} />
      </div>

      <div className={styles.dictField}>
        <span className={styles.label}>Tipo</span>
        <div className={styles.dictTypes}>
          {Object.entries(WORD_TYPES).map(([value, label]) => (
            <label key={value} className={styles.dictCheck}>
              <input
                type="checkbox"
                checked={word.type?.includes(value) ?? false}
                onChange={(e) => set({ type: e.target.checked ? [...(word.type ?? []), value] : word.type?.filter((t) => t !== value) })}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {listField("Ejemplos", "examples", "examples")}
      {listField("Mezclando idiomas", "codeSwitching", "code-switching")}
      {listField("Sinónimos", "synonyms", "synonyms")}

      {verb && (
        <div className={styles.dictField}>
          <div className={styles.dictFieldHead}>
            <span className={styles.label}>Conjugación</span>
            {!conjugations && (
              <Button size="sm" tone="neutral" variant="soft" sound={false} onClick={() => set({ conjugations: word.language === "pt" ? EMPTY_PT : EMPTY_EN })}>
                Agregar tabla
              </Button>
            )}
          </div>
          {conjugations &&
            Object.entries(conjugations).map(([group, forms]) => (
              <div key={group} className={styles.dictForms}>
                {group !== "forms" && <b>{group}</b>}
                {Object.entries(forms).map(([key, value]) => (
                  <label key={key}>
                    <span className={styles.muted}>{key}</span>
                    <input type="text" value={value} onChange={(e) => setForm(group, key, e.target.value)} />
                  </label>
                ))}
              </div>
            ))}
        </div>
      )}

      {!creating && (
        <div className={styles.dictField}>
          <div className={styles.dictFieldHead}>
            <span className={styles.label}>Imagen</span>
            <Button size="sm" tone="neutral" variant="soft" sound={false} quiet loading={busy === "image"} onClick={() => void image()}>
              {word.img ? "Otra imagen" : "Crear imagen"}
            </Button>
          </div>
          {word.img && <img className={styles.dictImage} src={word.img} alt="" />}
        </div>
      )}

      <Modal open={leaving} onClose={() => setLeaving(false)} title={`¿Qué hacemos con «${word.word}»?`} description={word.learners ? `${word.learners} ${word.learners === 1 ? "persona la tiene" : "personas la tienen"}. Al ocultarla no sale en Repasar y su progreso se conserva.` : "Nadie la tiene todavía."}>
        <Modal.Actions>
          <Button tone="neutral" variant="soft" sound={false} onClick={() => void toggleHidden()}>
            {word.hiddenAt ? "Mostrar otra vez" : "Ocultar"}
          </Button>
          {!word.learners && (
            <Button tone="danger" sound={false} onClick={() => void remove()}>
              Borrar para siempre
            </Button>
          )}
        </Modal.Actions>
      </Modal>
    </div>
  );
}
