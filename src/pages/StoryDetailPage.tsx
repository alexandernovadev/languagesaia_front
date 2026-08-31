import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { storyService } from "@/services/storyService";
import { useChapterGenerator } from "@/shared/hooks/useChapterGenerator";
import { IStory, IChapter } from "@/types/models/Story";
import { CertificationLevel } from "@/types/business";
import { storyGenres } from "@/types/business/storyGenres";
import { ArrowLeft, BookOpen, BookPlus, Loader2, Edit, Trash2, BookOpenText } from "lucide-react";
import { ActionButtonsHeader, HeaderAction } from "@/shared/components/ui/action-buttons-header";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { toast } from "sonner";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { GenerateChapterModal } from "@/shared/components/story/GenerateChapterModal";

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<IStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [continueOpen, setContinueOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { generating, generatingChapter, generateChapter, cancelGenerate } = useChapterGenerator(id);

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
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al cargar la historia";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async (params: {
    instructions: string;
    requestEnding: boolean;
    targetVocabulary: string[];
    targetGrammar: string[];
  }) => {
    if (!story || !id) return;
    setContinueOpen(false);
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
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await storyService.deleteStory(id);
      toast.success("Historia eliminada");
      navigate("/stories");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al eliminar la historia");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const genreLabel = storyGenres.find((g) => g.value === story?.genre)?.label || story?.genre;

  const storyActionsRaw: (HeaderAction | null)[] = [
    !loading && story
      ? {
          id: "edit",
          icon: <Edit className="h-4 w-4" />,
          label: "Editar",
          onClick: () => navigate(`/stories/${id}/edit`),
        }
      : null,
    !loading && story
      ? {
          id: "delete",
          icon: <Trash2 className="h-4 w-4" />,
          label: "Eliminar",
          onClick: () => setDeleteOpen(true),
        }
      : null,
    {
      id: "back",
      icon: <ArrowLeft className="h-4 w-4" />,
      label: "Volver",
      onClick: () => navigate("/stories"),
    },
  ];
  const storyActions: HeaderAction[] = storyActionsRaw.filter(
    (a): a is HeaderAction => a !== null
  );

  return (
    <div className="">
      <PageHeader
        title={story?.title || "Historia"}
        actions={<ActionButtonsHeader actions={storyActions} />}
      />

      <PageLoader
        loading={loading}
        error={error}
        onRetry={loadStory}
        onBack={() => navigate("/stories")}
      >
        {story && (
          <>
            {/* Cover image */}
            <Card>
              <CardContent className="p-0">
                {story.img ? (
                  <img
                    src={deliveryImageUrl(story.img)}
                    alt={story.title}
                    className="w-full h-auto max-h-96 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-lg">
                    <BookOpenText className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardContent className="p-4">
                <p className="text-muted-foreground mb-3">{story.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={getDifficultyVariant(story.languageLevel)}>{story.languageLevel}</Badge>
                  <Badge variant="secondary">{genreLabel}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Capítulos ({story.chapters.length})</h2>
                  <Button onClick={() => setContinueOpen(true)} disabled={generating}>
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookPlus className="h-4 w-4 mr-2" />
                    )}
                    {generating ? "Generando..." : "Agregar capítulo"}
                  </Button>
                </div>

                {story.chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>Todavía no hay capítulos. ¡Generá el primero!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {story.chapters.map((chapter, idx) => (
                      <ChapterItem
                        key={idx}
                        chapter={chapter}
                        index={idx}
                        storyId={story._id}
                        onClick={() => navigate(`/stories/${story._id}/chapter/${idx}`)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live generation preview */}
            {generating && generatingChapter && (
              <Card className="border-primary/40">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-primary">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-semibold">Generando capítulo...</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={cancelGenerate}>
                      Cancelar
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{generatingChapter}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </PageLoader>

      {/* Continue modal */}
      {story && (
        <GenerateChapterModal
          open={continueOpen}
          onOpenChange={setContinueOpen}
          story={story}
          generating={generating}
          onGenerate={handleGenerateChapter}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialogNova
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Eliminar historia"
        description="Esto eliminará permanentemente la historia y todos sus capítulos. Esta acción no se puede deshacer."
        confirmText="Eliminar"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

function ChapterItem({ chapter, index, storyId, onClick }: { chapter: IChapter; index: number; storyId: string; onClick: () => void }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
        chapter.urlAudio && "border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{chapter.title}</p>
        <p className="text-xs text-muted-foreground">
          {chapter.content.split(/\s+/).length} palabras
          {chapter.urlAudio && " • Con audio"}
        </p>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
    </div>
  );
}
