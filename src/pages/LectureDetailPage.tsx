import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { MarkdownRenderer } from "@/shared/components/ui/markdown-renderer";
import { lectureService } from "@/services/lectureService";
import { wordService } from "@/services/wordService";
import { ILecture } from "@/types/models/Lecture";
import { IWord } from "@/types/models/Word";
import { ArrowLeft, Clock, BookOpen, Volume2, Loader2, Subtitles, BookPlus } from "lucide-react";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { getMarkdownTitle, removeFirstH1 } from "@/utils/common/string/markdown";
import { cleanWord } from "@/utils/common/string";
import { getSpeechLocale } from "@/utils/common/speech";
import { toast } from "sonner";
import { WordDetailModal } from "@/shared/components/dialogs/WordDetailModal";
import { WordLookupPanel } from "@/shared/components/lecture/WordLookupPanel";
import KaraokeView from "@/shared/components/lecture/KaraokeView";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export default function LectureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const [lecture, setLecture] = useState<ILecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Word lookup state (double-click to select word)
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [wordLookup, setWordLookup] = useState<{
    exists: true;
    word: IWord;
  } | { exists: false } | null>(null);
  const [wordLookupLoading, setWordLookupLoading] = useState(false);
  const [addingWord, setAddingWord] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailModalWordId, setDetailModalWordId] = useState<string | null>(null);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [karaokeOn, setKaraokeOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Continue story state
  const [continueOpen, setContinueOpen] = useState(false);
  const [contRangeMin, setContRangeMin] = useState(150);
  const [contRangeMax, setContRangeMax] = useState(250);
  const [contInstructions, setContInstructions] = useState("");
  const [continuing, setContinuing] = useState(false);
  const [continuationText, setContinuationText] = useState("");
  const continueAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (id) {
      loadLecture();
    }
  }, [id]);

  const loadLecture = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await lectureService.getLectureById(id);
      if (!data) {
        setError("Lectura no encontrada");
        return;
      }
      setLecture(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error al cargar la lectura";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = useCallback(async (word: string) => {
    const cleaned = cleanWord(word.trim());
    if (!cleaned || /\s/.test(cleaned)) return;

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
  }, []);

  const handleOpenDetail = useCallback(() => {
    if (wordLookup && wordLookup.exists) {
      setDetailModalWordId(wordLookup.word._id);
      setDetailModalOpen(true);
    }
  }, [wordLookup]);

  const speakWord = useCallback(
    (word: string, rate: number = 1) => {
      if (!word || !("speechSynthesis" in window)) return;
      const lang = getSpeechLocale(lecture?.language);
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = lang;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    },
    [lecture?.language]
  );

  useEffect(() => {
    if (selectedWord) {
      speakWord(selectedWord, 1);
    }
  }, [selectedWord, speakWord]);

  const handleCloseWordLookup = useCallback(() => {
    setSelectedWord(null);
    setWordLookup(null);
    setWordLookupLoading(false);
  }, []);

  const handleAddWord = useCallback(async () => {
    if (!selectedWord || !lecture) return;
    setAddingWord(true);
    try {
      const response = await wordService.generateWord(selectedWord, lecture.language || "en");
      const wordData = response?.data ?? response;
      setWordLookup({ exists: true, word: wordData });
      setDetailModalWordId(wordData._id);
      setDetailModalOpen(true);
      toast.success("Palabra añadida al diccionario");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al añadir la palabra");
    } finally {
      setAddingWord(false);
    }
  }, [selectedWord, lecture]);

  const lectureTitle = loading
    ? "Cargando..."
    : getMarkdownTitle(lecture?.content!) || lecture?.typeWrite || "Lectura";
  const wordPanelOpen = !!(selectedWord || wordLookupLoading || wordLookup);

  const handleGenerateAudio = useCallback(async () => {
    if (!lecture) return;
    setAudioGenerating(true);
    try {
      const result = await lectureService.generateLectureAudio(lecture._id, "nova");
      setLecture((prev) => (prev ? { ...prev, urlAudio: result.urlAudio, voice: "nova" } : prev));
      toast.success("Audio generado correctamente");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error al generar el audio");
    } finally {
      setAudioGenerating(false);
    }
  }, [lecture]);

  const handleKaraokeWordClick = useCallback(
    (word: string, start?: number) => {
      if (start != null && audioRef.current) {
        audioRef.current.currentTime = start;
      }
      handleWordClick(word);
    },
    [handleWordClick]
  );

  const openContinueModal = useCallback(() => {
    if (!lecture?.content?.trim()) return;
    setContRangeMin(150);
    setContRangeMax(250);
    setContInstructions("");
    setContinueOpen(true);
  }, [lecture?.content]);

  // Mirrors the backend sanitizer so the live preview shows paragraph
  // breaks even when the model streams everything on a single line.
  const normalizeParagraphs = useCallback((text: string): string => {
    if (!text.trim()) return text;
    if (!text.includes("\n")) {
      const sentences = (text.match(/[^.!?]+[.!?]+["'"”]?|\S+$/g) || []).map((s) => s.trim());
      const paras: string[] = [];
      for (let i = 0; i < sentences.length; i += 3) {
        paras.push(sentences.slice(i, i + 3).join(" "));
      }
      return paras.filter(Boolean).join("\n\n");
    }
    const lines = text.split("\n");
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      out.push(lines[i]);
      const next = lines[i + 1];
      if (!next) continue;
      const a = lines[i].trim();
      const b = next.trim();
      if (!a || !b) continue;
      if (/^[#>|\-*+\d.]/.test(a) || /^[#>|\-*+\d.]/.test(b)) continue;
      if (/[.!?]["'"”]?$/.test(a) && /^[A-ZÀ-Ý"“]/.test(b)) {
        out.push("");
      }
    }
    return out.join("\n");
  }, []);

  const handleContinue = useCallback(async () => {
    if (!lecture || !id) return;
    setContinueOpen(false);
    setContinuing(true);
    setContinuationText("");

    const abortController = new AbortController();
    continueAbortRef.current = abortController;

    try {
      const response = await lectureService.continueLecture(
        id,
        {
          rangeMin: contRangeMin || 150,
          rangeMax: contRangeMax || 250,
          instructions: contInstructions.trim(),
        },
        abortController.signal
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to continue lecture");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let acc = "";
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        acc += decoder.decode(value, { stream: true });
        setContinuationText(normalizeParagraphs(acc));
      }

      const continuation = acc.trim();
      if (!continuation) {
        toast.error("No se generó ninguna continuación");
        return;
      }

      const newContent = `${lecture.content.trimEnd()}\n\n${continuation}`;
      const updated = await lectureService.updateLecture(id, { content: newContent });
      setLecture(updated);
      toast.success("Historia continuada y guardada");
    } catch (err: any) {
      if (err.name === "AbortError") return;
      toast.error(err.response?.data?.message || err.message || "Error al continuar la historia");
    } finally {
      setContinuing(false);
      setContinuationText("");
      continueAbortRef.current = null;
    }
  }, [lecture, id, contRangeMin, contRangeMax, contInstructions]);

  useEffect(() => {
    return () => {
      continueAbortRef.current?.abort();
    };
  }, []);

  return (
    <div>
      <PageHeader
        actions={
          <>
            {!loading && lecture && (
              <Button
                variant="outline"
                size="sm"
                onClick={openContinueModal}
                disabled={continuing || !lecture.content?.trim()}
              >
                {continuing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BookPlus className="h-4 w-4 mr-2" />
                )}
                {continuing ? "Continuando..." : "Continuar historia"}
              </Button>
            )}
            {!loading && lecture && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateAudio}
                disabled={audioGenerating}
              >
                {audioGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Volume2 className="h-4 w-4 mr-2" />
                )}
                {lecture.urlAudio ? "Regenerar audio" : "Generar audio"}
              </Button>
            )}
            {!loading && lecture?.urlAudio && (
              <Button
                variant={karaokeOn ? "default" : "outline"}
                size="sm"
                onClick={() => setKaraokeOn((v) => !v)}
              >
                <Subtitles className="h-4 w-4 mr-2" />
                {karaokeOn ? "Lectura" : "Karaoke"}
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/lectures")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </>
}
        footer={
          lecture?.urlAudio ? (
            <audio
              ref={audioRef}
              controls
              className="w-full h-9 pt-1"
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
              onDurationChange={(e) => setAudioDuration(e.currentTarget.duration)}
            >
              <source src={lecture.urlAudio} type="audio/mpeg" />
              Tu navegador no soporta el elemento de audio.
            </audio>
          ) : undefined
        }
      />

      <PageLoader
        loading={loading}
        error={error ?? (!lecture ? "Lectura no encontrada" : null)}
        onRetry={loadLecture}
        onBack={() => (window.history.length > 1 ? navigate(-1) : navigate("/lectures"))}
        skeletonRows={5}
      >

      {lecture && (
        <>
          {/* Image */}
          <Card>
            <CardContent className="p-0">
              {lecture.img ? (
                <img
                  src={deliveryImageUrl(lecture.img)}
                  alt={lecture.typeWrite || "Lecture"}
                  className="w-full h-auto max-h-96 object-cover rounded-t-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-muted/50 rounded-t-lg text-muted-foreground text-sm">
                  Image should appear here
                </div>
              )}
            </CardContent>
          </Card>

          {/* Title */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h1 className="text-2xl sm:text-3xl font-bold break-words">{lectureTitle}</h1>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant={getDifficultyVariant(lecture.difficulty)}>
                  {lecture.difficulty || "N/A"}
                </Badge>
                {lecture.time && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lecture.time} min
                  </Badge>
                )}
                {lecture.typeWrite && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {lecture.typeWrite}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="pb-12">
                {karaokeOn ? (
                  <KaraokeView
                    content={lecture.content}
                    currentTime={currentTime}
                    duration={audioDuration}
                    onWordClick={handleKaraokeWordClick}
                  />
                ) : (
                  <div className="select-text">
                    <MarkdownRenderer
                      content={removeFirstH1(lecture.content)}
                      variant="reading"
                      onWordClick={handleWordClick}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live continuation preview */}
          {continuing && (
            <Card className="border-primary/40">
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-semibold">Generando continuación...</span>
                </div>
                <div className="select-text">
                  <MarkdownRenderer content={continuationText} variant="reading" />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {wordPanelOpen && (
        <WordLookupPanel
          selectedWord={selectedWord}
          wordLookup={wordLookup}
          wordLookupLoading={wordLookupLoading}
          addingWord={addingWord}
          isMobile={isMobile}
          sidebarState={state}
          onSpeak={speakWord}
          onOpenDetail={handleOpenDetail}
          onAddWord={handleAddWord}
          onClose={handleCloseWordLookup}
        />
      )}

      </PageLoader>

      {/* Word detail modal — outside PageLoader so it works even on error */}
      <WordDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        wordId={detailModalWordId}
      />

      {/* Continue story modal */}
      <ModalNova
        open={continueOpen}
        onOpenChange={setContinueOpen}
        title="Continuar historia"
        description="Genera la siguiente parte de esta lectura y se guarda automáticamente."
        size="md"
        height="h-auto"
        footer={
          <>
            <Button variant="outline" onClick={() => setContinueOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleContinue} disabled={continuing}>
              {continuing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BookPlus className="h-4 w-4 mr-2" />
              )}
              Generar continuación
            </Button>
          </>
        }
      >
        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cont-range-min">Palabras mínimas</Label>
              <Input
                id="cont-range-min"
                type="number"
                min={50}
                max={1000}
                value={contRangeMin}
                onChange={(e) => setContRangeMin(Number(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cont-range-max">Palabras máximas</Label>
              <Input
                id="cont-range-max"
                type="number"
                min={50}
                max={1000}
                value={contRangeMax}
                onChange={(e) => setContRangeMax(Number(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cont-instructions">Instrucción opcional</Label>
            <textarea
              id="cont-instructions"
              value={contInstructions}
              onChange={(e) => setContInstructions(e.target.value)}
              placeholder="Ej: que el personaje viaje a otra ciudad"
              rows={3}
              className="w-full rounded-md border-2 border-input bg-background px-2 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm resize-none"
            />
          </div>
        </div>
      </ModalNova>
    </div>
  );
}
