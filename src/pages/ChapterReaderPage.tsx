import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { storyService } from "@/services/storyService";
import { wordService } from "@/services/wordService";
import { useChapterGenerator } from "@/shared/hooks/useChapterGenerator";
import { IStory, VocabReport } from "@/types/models/Story";
import { IWord } from "@/types/models/Word";
import { ArrowLeft, Volume2, Loader2, Subtitles, BookOpen, ChevronLeft, ChevronRight, ListTodo, Sparkles, Edit } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { ActionButtonsHeader, HeaderAction } from "@/shared/components/ui/action-buttons-header";
import { deliveryImageUrl } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { getSpeechLocale } from "@/utils/common/speech";
import { cleanWord } from "@/utils/common/string";
import { toast } from "sonner";
import { WordDetailModal } from "@/shared/components/dialogs/WordDetailModal";
import { WordLookupPanel } from "@/shared/components/lecture/WordLookupPanel";
import { MarkdownRenderer } from "@/shared/components/ui/markdown-renderer";
import KaraokeView from "@/shared/components/lecture/KaraokeView";
import AudioPlayer from "@/shared/components/lecture/AudioPlayer";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { GenerateChapterModal } from "@/shared/components/story/GenerateChapterModal";
import { useAuth } from "@/shared/hooks/useAuth";

export default function ChapterReaderPage() {
  const { id, chapterIndex } = useParams<{ id: string; chapterIndex: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useSidebar();
  const idx = parseInt(chapterIndex || "0");

  const [story, setStory] = useState<IStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [karaokeOn, setKaraokeOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [pinnedWordIndex, setPinnedWordIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Set right before we programmatically seek from a karaoke word click, so the
  // resulting "seeked" event doesn't clear the pin we just set.
  const suppressNextSeekRef = useRef(false);
  const pauseChapterAudio = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    setPinnedWordIndex(null);
  }, [idx]);

  // Word lookup state
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordLookup, setWordLookup] = useState<{ exists: true; word: IWord } | { exists: false } | null>(null);
  const [wordLookupLoading, setWordLookupLoading] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalWordId, setDetailModalWordId] = useState<string | null>(null);

  // Vocab report
  const [vocabReportOpen, setVocabReportOpen] = useState(false);
  const [vocabReport, setVocabReport] = useState<VocabReport[]>([]);
  const [vocabReportLoading, setVocabReportLoading] = useState(false);

  // Generate next chapter
  const [nextGenOpen, setNextGenOpen] = useState(false);

  // Edit chapter
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const { generating, generatingChapter, generateChapter, cancelGenerate } = useChapterGenerator(id);

  const chapter = story?.chapters[idx];
  const wordPanelOpen = !!(selectedWord || wordLookupLoading || wordLookup);

  useEffect(() => {
    if (id) loadStory();
  }, [id]);

  const loadStory = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await storyService.getStoryById(id);
      setStory(data);
      // Update progress
      await storyService.updateProgress(id, idx);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al cargar la historia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = useCallback(
    (word: string, rate: number = 1) => {
      if (!word || !("speechSynthesis" in window)) return;
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = getSpeechLocale(story?.language || user?.language);
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    },
    [story?.language, user?.language]
  );

  const handleWordClick = useCallback(async (word: string) => {
    pauseChapterAudio();
    const cleaned = cleanWord(word.trim());
    if (!cleaned || /\s/.test(cleaned)) return;

    // Always pronounce on click, even if it's the same word clicked again.
    speakWord(cleaned, 1);

    // Panel already open for this exact word: just re-pronounce, don't refetch.
    // A fresh lookup only happens for a new word, or after the panel was closed.
    if (cleaned === selectedWord) return;

    setSelectedWord(cleaned);
    setWordLookup(null);
    setWordLookupLoading(true);
    try {
      const foundWord = await wordService.getWordByName(cleaned);
      const wordData = foundWord?.data ?? foundWord;
      setWordLookup({ exists: true, word: wordData });
    } catch (err: any) {
      if (err.response?.status === 404 || err.status === 404) {
        setWordLookup({ exists: false });
      } else {
        toast.error(err.response?.data?.message || err.message || "Error al buscar la palabra");
      }
    } finally {
      setWordLookupLoading(false);
    }
  }, [pauseChapterAudio, selectedWord, speakWord]);

  const handleKaraokeWordClick = useCallback(
    (word: string, start: number, index: number) => {
      pauseChapterAudio();
      suppressNextSeekRef.current = true;
      setCurrentTime(start);
      if (audioRef.current) audioRef.current.currentTime = start;
      setPinnedWordIndex(index);
      handleWordClick(word);
    },
    [handleWordClick, pauseChapterAudio]
  );

  const handleOpenDetail = useCallback(() => {
    if (wordLookup && wordLookup.exists) {
      setDetailModalWordId(wordLookup.word._id);
      setDetailModalOpen(true);
    }
  }, [wordLookup]);

  const handleCloseWordLookup = useCallback(() => {
    setSelectedWord(null);
    setWordLookup(null);
    setWordLookupLoading(false);
  }, []);

  const handleAddWord = useCallback(async () => {
    if (!selectedWord) return;
    setAddingWord(true);
    try {
      const response = await wordService.generateWord(selectedWord, story?.language || user?.language || "en");
      const wordData = response?.data ?? response;
      setWordLookup({ exists: true, word: wordData });
      setDetailModalWordId(wordData._id);
      setDetailModalOpen(true);
      toast.success("Palabra agregada al diccionario");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al agregar la palabra");
    } finally {
      setAddingWord(false);
    }
  }, [selectedWord, story?.language, user?.language]);

  const handleGenerateAudio = useCallback(async () => {
    if (!story || !id) return;
    setAudioGenerating(true);
    try {
      const audio = await storyService.generateChapterAudio(id, idx);
      setStory((current) => current ? {
        ...current,
        chapters: current.chapters.map((currentChapter, chapterIdx) =>
          chapterIdx === idx
            ? {
                ...currentChapter,
                urlAudio: audio.urlAudio,
                audioRecordId: audio.recordId,
                voice: audio.voice,
                audioAlignment: audio.audioAlignment,
              }
            : currentChapter
        ),
      } : current);
      setPinnedWordIndex(null);
      toast.success("Audio generado correctamente");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al generar el audio");
    } finally {
      setAudioGenerating(false);
    }
  }, [story, id, idx]);

  const handleLoadVocabReport = useCallback(async () => {
    if (!id) return;
    setVocabReportLoading(true);
    try {
      const report = await storyService.getVocabReport(id);
      setVocabReport(report);
      setVocabReportOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al cargar el reporte de vocabulario");
    } finally {
      setVocabReportLoading(false);
    }
  }, [id]);

  const handleGenerateNext = useCallback(
    async (params: {
      instructions: string;
      requestEnding: boolean;
      targetVocabulary: string[];
      targetGrammar: string[];
    }) => {
      if (!story || !id) return;
      setNextGenOpen(false);
      const saved = await generateChapter(
        params.instructions,
        params.requestEnding,
        story.chapters.length + 1,
        params.targetVocabulary,
        params.targetGrammar
      );
      if (saved) {
        setStory(saved);
        navigate(`/stories/${id}/chapter/${saved.chapters.length - 1}`);
      }
    },
    [story, id, generateChapter, navigate]
  );

  const handleOpenEdit = useCallback(() => {
    if (!chapter) return;
    setEditTitle(chapter.title);
    setEditContent(chapter.content);
    setEditOpen(true);
  }, [chapter]);

  const handleSaveEdit = useCallback(async () => {
    if (!id || !story) return;
    setSavingEdit(true);
    try {
      await storyService.updateChapter(id, idx, { title: editTitle, content: editContent });
      setStory({
        ...story,
        chapters: story.chapters.map((ch, i) =>
          i === idx ? { ...ch, title: editTitle, content: editContent } : ch
        ),
      });
      toast.success("Capítulo actualizado");
      setEditOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al actualizar el capítulo");
    } finally {
      setSavingEdit(false);
    }
  }, [id, idx, story, editTitle, editContent]);

  const hasPrev = idx > 0;
  const hasNext = story && idx < story.chapters.length - 1;

  const chapterNav = story && (
    <div className="flex items-center justify-between mt-4">
      <Button
        variant="outline"
        size="icon"
        disabled={!hasPrev}
        onClick={() => navigate(`/stories/${id}/chapter/${idx - 1}`)}
        title="Capítulo anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="flex-1 min-w-0 truncate text-center text-sm text-muted-foreground">
        Capítulo {idx + 1} de {story.chapters.length}
        {chapter?.title ? ` · ${chapter.title}` : ""}
      </span>
      {hasNext ? (
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/stories/${id}/chapter/${idx + 1}`)}
          title="Siguiente capítulo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          size="icon"
          onClick={() => setNextGenOpen(true)}
          disabled={generating}
          title={generating ? "Generando..." : "Generar siguiente capítulo"}
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );

  const chapterActionsRaw: (HeaderAction | null)[] = [
    !loading && chapter
      ? {
          id: "edit",
          icon: <Edit className="h-4 w-4" />,
          label: "Editar",
          onClick: handleOpenEdit,
        }
      : null,
    !loading && chapter?.urlAudio && chapter.audioAlignment?.length
      ? {
          id: "karaoke",
          icon: <Subtitles className="h-4 w-4" />,
          label: karaokeOn ? "Lectura" : "Karaoke",
          onClick: () => setKaraokeOn((value) => !value),
          variant: karaokeOn ? "default" : "outline",
        }
      : null,
    !loading && story && story.chapters.some((ch) => (ch.targetVocabulary?.length ?? 0) > 0)
      ? {
          id: "vocab-report",
          icon: <ListTodo className="h-4 w-4" />,
          label: "Reporte de vocabulario",
          onClick: handleLoadVocabReport,
          disabled: vocabReportLoading,
        }
      : null,
    !loading && chapter
      ? {
          id: "audio",
          icon: audioGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Volume2 className="h-4 w-4" />
          ),
          label: chapter.urlAudio ? "Regenerar audio" : "Generar audio",
          onClick: handleGenerateAudio,
          disabled: audioGenerating,
        }
      : null,
    {
      id: "back",
      icon: <ArrowLeft className="h-4 w-4" />,
      label: "Volver a la historia",
      onClick: () => navigate(`/stories/${id}`),
    },
  ];
  const chapterActions: HeaderAction[] = chapterActionsRaw.filter(
    (a): a is HeaderAction => a !== null
  );

  return (
    <div className="">
      <PageHeader
        actions={<ActionButtonsHeader actions={chapterActions} />}
        footer={
          chapterNav || chapter?.urlAudio ? (
            <div className="space-y-3">
              {chapterNav}
              {chapter?.urlAudio && (
                <AudioPlayer
                  key={chapter.urlAudio}
                  src={chapter.urlAudio}
                  audioRef={audioRef}
                  onPlay={() => setPinnedWordIndex(null)}
                  onTimeUpdate={(time) => setCurrentTime(time)}
                  onSeeked={(time) => {
                    setCurrentTime(time);
                    if (suppressNextSeekRef.current) {
                      suppressNextSeekRef.current = false;
                    } else {
                      setPinnedWordIndex(null);
                    }
                  }}
                />
              )}
            </div>
          ) : undefined
        }
      />

      <PageLoader
        loading={loading}
        error={error}
        onRetry={loadStory}
        onBack={() => navigate(`/stories/${id}`)}
      >
        {story && chapter && (
          <>
            {/* Live generation preview */}
            {generating && generatingChapter && (
              <Card className="border-primary/40 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-semibold">Generando siguiente capítulo...</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={cancelGenerate}>
                      Cancelar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{generatingChapter}</p>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                {chapter.urlAudio && karaokeOn && chapter.audioAlignment?.length ? (
                  <KaraokeView
                    content={chapter.content}
                    currentTime={currentTime}
                    wordTimings={chapter.audioAlignment}
                    pinnedIndex={pinnedWordIndex}
                    onWordClick={handleKaraokeWordClick}
                  />
                ) : (
                  <div className="select-text">
                    <MarkdownRenderer
                      content={chapter.content}
                      variant="reading"
                      onWordClick={handleWordClick}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </PageLoader>

      {/* Word lookup panel */}
      {wordPanelOpen && (
        <WordLookupPanel
          selectedWord={selectedWord}
          wordLookup={wordLookup}
          wordLookupLoading={wordLookupLoading}
          addingWord={addingWord}
          isMobile={isMobile}
          onSpeak={speakWord}
          onOpenDetail={handleOpenDetail}
          onAddWord={handleAddWord}
          onClose={handleCloseWordLookup}
        />
      )}

      {/* Word detail modal */}
      <WordDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        wordId={detailModalWordId}
      />

      {/* Vocab report modal */}
      <ModalNova
        open={vocabReportOpen}
        onOpenChange={setVocabReportOpen}
        title="Reporte de vocabulario"
        size="md"
        height="h-auto"
        footer={
          <Button onClick={() => setVocabReportOpen(false)}>Cerrar</Button>
        }
      >
        <div className="px-6">
          {vocabReport.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Todavía no se encontraron palabras objetivo en la historia.</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {vocabReport.map((item) => (
                <div key={item.word} className="flex items-center justify-between p-2 rounded border">
                  <span className="font-medium">{item.word}</span>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{item.count} {item.count === 1 ? "vez" : "veces"}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Cap. {item.chapters.map((c) => c + 1).join(", ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ModalNova>

      {/* Generate next chapter modal */}
      {story && (
        <GenerateChapterModal
          open={nextGenOpen}
          onOpenChange={setNextGenOpen}
          story={story}
          generating={generating}
          onGenerate={handleGenerateNext}
        />
      )}

      {/* Edit chapter modal */}
      <ModalNova
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Editar capítulo"
        size="lg"
        height="h-auto"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={savingEdit}>
              {savingEdit ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Guardar
            </Button>
          </>
        }
      >
        <div className="px-6 space-y-4">
          <div>
            <Label>Título</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={200} />
          </div>
          <div>
            <Label>Contenido</Label>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>
        </div>
      </ModalNova>
    </div>
  );
}
