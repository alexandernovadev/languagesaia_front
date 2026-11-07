/**
 * AdminDictionaryCard — /admin/diccionario/:id. The same card as in Palabras,
 * for any dictionary word, with the way to edit it.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button, Chip, Icon, Robot, Skeleton, SpeakButtons, toast } from "../../components";
import { WORD_TYPES, wordsApi, type Word } from "../words/api";
import { WordInfo } from "../words/WordInfo";
import detail from "../words/WordDetail.module.css";
import { dictionaryApi } from "./api";
import { lastList } from "./AdminDictionary";
import styles from "./Admin.module.css";

export function AdminDictionaryCard() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [word, setWord] = useState<Word | null>(null);
  const [painting, setPainting] = useState(false);

  useEffect(() => {
    dictionaryApi.get(id).then((w) => setWord(w as unknown as Word)).catch((e) => toast((e as Error).message, { tone: "danger" }));
  }, [id]);

  if (!word) return <Skeleton lines={10} />;

  const newImage = async () => {
    setPainting(true);
    try {
      const updated = await wordsApi.image(word._id, word);
      setWord({ ...word, img: updated.img });
    } catch (e) {
      toast((e as Error).message, { tone: "danger" });
    } finally {
      setPainting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <Link to={lastList.url} className={styles.muted}>
          ← Diccionario
        </Link>
        <Button size="sm" tone="neutral" variant="soft" sound={false} icon={<Icon name="edit" size={16} />} onClick={() => navigate("editar")}>
          Editar
        </Button>
      </div>

      <section className={detail.hero}>
        <div className={detail.media}>
          {word.img ? (
            <img src={word.img} alt={`Ilustración de ${word.word}`} className={painting ? detail.dim : undefined} />
          ) : (
            <div className={detail.noImg}>
              <Robot hero="lumi" voice={false} />
            </div>
          )}
          <Button tone="neutral" size="sm" className={detail.imgBtn} loading={painting} icon={<Icon name="image" size={18} />} onClick={() => void newImage()}>
            {word.img ? "Otra imagen" : "Crear imagen"}
          </Button>
        </div>
        <div className={detail.info}>
          <h1 className={detail.word}>{word.word}</h1>
          <div className={detail.meta}>
            {word.IPA && <span className={detail.ipa}>{word.IPA}</span>}
            <SpeakButtons text={word.word} language={word.language} wordId={word._id} audio={word.audio} size="sm" />
          </div>
          {word.spanish?.word && (
            <span className={detail.es}>
              <span aria-hidden="true">→</span> {word.spanish.word}
            </span>
          )}
          <div className={detail.chips}>
            {word.type?.map((t) => (
              <Chip key={t} tint="sky">
                {WORD_TYPES[t] ?? t}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      <WordInfo word={word} onChange={setWord} />
    </div>
  );
}
