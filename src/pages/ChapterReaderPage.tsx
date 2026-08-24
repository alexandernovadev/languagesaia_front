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
import { ArrowLeft, Volume2, Loader2, Subtitles, BookOpen, ChevronLeft, ChevronRight, ListTodo, Sparkles } from "lucide-react";
import { ActionButtonsHeader, HeaderAction } from "@/shared/components/ui/action-buttons-header";
import { deliveryImageUrl } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { getSpeechLocale } from "@/utils/common/speech";
import { cleanWord } from "@/utils/common/string";
import { toast } from "sonner";
import { WordDetailModal } from "@/shared/components/dialogs/WordDetailModal";
import { WordLookupPanel } from "@/shared/components/lecture/WordLookupPanel";
import KaraokeView from "@/shared/components/lecture/KaraokeView";
import { MarkdownRenderer } from "@/shared/components/ui/markdown-renderer";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { useSidebar } from "@/shared/components/ui/sidebar";
import { GenerateChapterModal } from "@/shared/components/story/GenerateChapterModal";
import { useAuth } from "@/shared/hooks/useAuth";

export default function ChapterReaderPage() {
  const { id, chapterIndex } = useParams<{ id: string; chapterIndex: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state: sidebarState, isMobile } = useSidebar();
  const idx = parseInt(chapterIndex || "0");

  const [story, setStory] = useState<IStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioGenerating, setAudioGenerating] = useState(false);
  const [karaokeOn, setKaraokeOn] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
      const msg = err.response?.data?.message || err.message || "Error loading story";
      setError(msg);
      toast.error(msg);
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
        toast.error(err.response?.data?.message || err.message || "Error looking up word");
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
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = getSpeechLocale(user?.language);
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    },
    [user?.language]
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
    if (!selectedWord) return;
    setAddingWord(true);
    try {
      const response = await wordService.generateWord(selectedWord, "en");
      const wordData = response?.data ?? response;
      setWordLookup({ exists: true, word: wordData });
      setDetailModalWordId(wordData._id);
      setDetailModalOpen(true);
      toast.success("Word added to dictionary");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error adding word");
    } finally {
      setAddingWord(false);
    }
  }, [selectedWord]);

  const handleKaraokeWordClick = useCallback(
    (word: string, start?: number) => {
      if (start != null && audioRef.current) {
        audioRef.current.currentTime = start;
      }
      handleWordClick(word);
    },
    [handleWordClick]
  );

  const handleGenerateAudio = useCallback(async () => {
    if (!story || !id) return;
    setAudioGenerating(true);
    try {
      // TODO: Implement chapter audio endpoint
      toast.info("Audio generation coming soon");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error generating audio");
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
      toast.error(err.response?.data?.message || err.message || "Error loading vocab report");
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

  const hasPrev = idx > 0;
  const hasNext = story && idx < story.chapters.length - 1;

  const chapterActionsRaw: (HeaderAction | null)[] = [
    !loading && story && story.chapters.some((ch) => (ch.targetVocabulary?.length ?? 0) > 0)
      ? {
          id: "vocab-report",
          icon: <ListTodo className="h-4 w-4" />,
          label: "Vocab report",
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
          label: chapter.urlAudio ? "Regenerate audio" : "Generate audio",
          onClick: handleGenerateAudio,
          disabled: audioGenerating,
        }
      : null,
    !loading && chapter?.urlAudio
      ? {
          id: "karaoke",
          icon: <Subtitles className="h-4 w-4" />,
          label: karaokeOn ? "Reading" : "Karaoke",
          onClick: () => setKaraokeOn((v) => !v),
          variant: karaokeOn ? "default" : "outline",
        }
      : null,
    {
      id: "back",
      icon: <ArrowLeft className="h-4 w-4" />,
      label: "Back to story",
      onClick: () => navigate(`/stories/${id}`),
    },
  ];
  const chapterActions: HeaderAction[] = chapterActionsRaw.filter(
    (a): a is HeaderAction => a !== null
  );

  return (
    <div className="">
      <PageHeader
        title={chapter?.title || "Chapter"}
        actions={<ActionButtonsHeader actions={chapterActions} />}
        footer={
          chapter?.urlAudio ? (
            <audio
              ref={audioRef}
              controls
              className="w-full h-9 pt-1"
              preload="metadata"
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration)}
              onDurationChange={(e) => setAudioDuration(e.currentTarget.duration)}
            >
              <source src={chapter.urlAudio} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
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
            {/* Chapter navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                disabled={!hasPrev}
                onClick={() => navigate(`/stories/${id}/chapter/${idx - 1}`)}
                title="Previous chapter"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Chapter {idx + 1} of {story.chapters.length}
              </span>
              {hasNext ? (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(`/stories/${id}/chapter/${idx + 1}`)}
                  title="Next chapter"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={() => setNextGenOpen(true)}
                  disabled={generating}
                  title={generating ? "Generating..." : "Generate next chapter"}
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>

            {/* Live generation preview */}
            {generating && generatingChapter && (
              <Card className="border-primary/40 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-semibold">Generating next chapter...</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={cancelGenerate}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{generatingChapter}</p>
                </CardContent>
              </Card>
            )}

            {/* Content */}
            <Card>
              <CardContent className="p-4 sm:p-6 md:p-8">
                <div className="pb-12">
                  {chapter.urlAudio && karaokeOn ? (
                    <KaraokeView
                      content={chapter.content}
                      currentTime={currentTime}
                      duration={audioDuration}
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
                </div>
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
          sidebarState={sidebarState}
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
        title="Vocabulary Report"
        footer={
          <Button onClick={() => setVocabReportOpen(false)}>Close</Button>
        }
      >
        {vocabReport.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No target words found in the story yet.</p>
        ) : (
          <div className="space-y-2">
            {vocabReport.map((item) => (
              <div key={item.word} className="flex items-center justify-between p-2 rounded border">
                <span className="font-medium">{item.word}</span>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{item.count} {item.count === 1 ? "time" : "times"}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Ch. {item.chapters.map((c) => c + 1).join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}
