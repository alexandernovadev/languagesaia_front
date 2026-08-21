import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { storyService } from "@/services/storyService";
import { IStory, IChapter } from "@/types/models/Story";
import { CertificationLevel } from "@/types/business";
import { storyGenres } from "@/types/business/storyGenres";
import { ArrowLeft, BookOpen, BookPlus, Loader2, Edit, Trash2, BookOpenText } from "lucide-react";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { cn } from "@/utils/common/classnames";
import { toast } from "sonner";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<IStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingChapter, setGeneratingChapter] = useState("");
  const [continueOpen, setContinueOpen] = useState(false);
  const [contInstructions, setContInstructions] = useState("");
  const [requestEnding, setRequestEnding] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const generateAbortRef = useRef<AbortController | null>(null);

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
      const msg = err.response?.data?.message || err.message || "Error loading story";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChapter = async () => {
    if (!story || !id) return;
    setGenerating(true);
    setGeneratingChapter("");
    setContinueOpen(false);

    const controller = new AbortController();
    generateAbortRef.current = controller;

    try {
      const response = await storyService.generateChapter(
        id,
        contInstructions,
        requestEnding,
        controller.signal
      );

      const reader = response.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        acc += decoder.decode(value, { stream: true });
        setGeneratingChapter(acc);
      }

      // Save the generated chapter
      const chapterTitle = `Chapter ${story.chapters.length + 1}`;
      await storyService.saveChapter(id, { title: chapterTitle, content: acc });
      await loadStory();
      toast.success("Chapter saved!");
      navigate(`/stories/${id}/chapter/${story.chapters.length}`);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        const msg = err.response?.data?.message || err.message || "Error generating chapter";
        toast.error(msg);
      }
    } finally {
      setGenerating(false);
      setGeneratingChapter("");
      generateAbortRef.current = null;
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await storyService.deleteStory(id);
      toast.success("Story deleted");
      navigate("/stories");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error deleting story");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const genreLabel = storyGenres.find((g) => g.value === story?.genre)?.label || story?.genre;

  return (
    <div className="">
      <PageHeader
        title={story?.title || "Story"}
        actions={
          <>
            {!loading && story && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/stories/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {!loading && story && (
              <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/stories")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </>
        }
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
                  {story.targetVocabulary.length > 0 && (
                    <Badge variant="outline">{story.targetVocabulary.length} target words</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Chapters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Chapters ({story.chapters.length})</h2>
                  <Button onClick={() => setContinueOpen(true)} disabled={generating}>
                    {generating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <BookPlus className="h-4 w-4 mr-2" />
                    )}
                    {generating ? "Generating..." : "Add chapter"}
                  </Button>
                </div>

                {story.chapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p>No chapters yet. Generate the first one!</p>
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
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-semibold">Generating chapter...</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{generatingChapter}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </PageLoader>

      {/* Continue modal */}
      <ModalNova
        open={continueOpen}
        onOpenChange={(open) => {
          setContinueOpen(open);
          if (!open) {
            setContInstructions("");
            setRequestEnding(false);
          }
        }}
        title="Generate new chapter"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setContinueOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateChapter} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookPlus className="h-4 w-4 mr-2" />}
              Generate
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>Instructions (optional)</Label>
            <Input
              placeholder="e.g. Set in Paris, introduce a new character..."
              value={contInstructions}
              onChange={(e) => setContInstructions(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requestEnding"
              checked={requestEnding}
              onChange={(e) => setRequestEnding(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="requestEnding" className="cursor-pointer">
              This is the final chapter (end the story)
            </Label>
          </div>
        </div>
      </ModalNova>

      {/* Delete confirmation */}
      <AlertDialogNova
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete story"
        description="This will permanently delete the story and all its chapters. This action cannot be undone."
        confirmText="Delete"
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
          {chapter.content.split(/\s+/).length} words
          {chapter.urlAudio && " • Has audio"}
        </p>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 shrink-0" />
    </div>
  );
}
