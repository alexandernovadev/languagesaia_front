import { useState, useEffect, useCallback } from "react";
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
import { ArrowLeft, Clock, BookOpen, Volume2, Loader2 } from "lucide-react";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { getMarkdownTitle, removeFirstH1 } from "@/utils/common/string/markdown";
import { getSpeechLocale } from "@/utils/common/speech";
import { toast } from "sonner";
import { WordDetailModal } from "@/shared/components/dialogs/WordDetailModal";
import { WordLookupPanel } from "@/shared/components/lecture/WordLookupPanel";

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
    const cleanWord = word.trim().replace(/^\W+|\W+$/g, "");
    if (!cleanWord || /\s/.test(cleanWord)) return;

    setSelectedWord(cleanWord);
    setWordLookup(null);
    setWordLookupLoading(true);
    try {
      const foundWord = await wordService.getWordByName(cleanWord);
      setWordLookup({ exists: true, word: foundWord });
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

  return (
    <div>
      <PageHeader
        actions={
          <>
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
            <Button variant="outline" onClick={() => navigate("/lectures")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </>
}
        footer={
          lecture?.urlAudio ? (
            <audio controls className="w-full h-9 pt-1" preload="none">
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
              <div className="select-text" title="Clic en una palabra para verla en el diccionario">
                <MarkdownRenderer
                  content={removeFirstH1(lecture.content)}
                  variant="reading"
                  onWordClick={handleWordClick}
                />
              </div>
            </CardContent>
          </Card>
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
    </div>
  );
}
