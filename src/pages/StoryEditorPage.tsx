import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { PageLoader } from "@/shared/components/ui/page-loader";
import { storyService } from "@/services/storyService";
import { IStory } from "@/types/models/Story";
import { CertificationLevel } from "@/types/business";
import { storyGenres, StoryGenre } from "@/types/business/storyGenres";
import { ArrowLeft, Loader2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { cn } from "@/utils/common/classnames";

const LEVELS: CertificationLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const GRAMMAR_OPTIONS = [
  "Present Simple", "Present Continuous", "Past Simple", "Past Continuous",
  "Future (will)", "Future (going to)", "Present Perfect", "Past Perfect",
  "Conditionals", "Passive Voice", "Modal Verbs", "Reported Speech",
];

export default function StoryEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [filling, setFilling] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState<StoryGenre>("mystery");
  const [level, setLevel] = useState<CertificationLevel>("A1");
  const [targetVocab, setTargetVocab] = useState<string[]>([]);
  const [vocabInput, setVocabInput] = useState("");
  const [targetGrammar, setTargetGrammar] = useState<string[]>([]);
  const [img, setImg] = useState("");

  useEffect(() => {
    if (isEdit) loadStory();
  }, [id]);

  const loadStory = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const story = await storyService.getStoryById(id);
      setTitle(story.title);
      setDescription(story.description);
      setGenre(story.genre);
      setLevel(story.languageLevel);
      setTargetVocab(story.targetVocabulary || []);
      setTargetGrammar(story.targetGrammar || []);
      setImg(story.img || "");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error loading story");
      navigate("/stories");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVocab = () => {
    const word = vocabInput.trim().toLowerCase();
    if (word && !targetVocab.includes(word) && targetVocab.length < 20) {
      setTargetVocab((prev) => [...prev, word]);
      setVocabInput("");
    }
  };

  const handleRemoveVocab = (word: string) => {
    setTargetVocab((prev) => prev.filter((w) => w !== word));
  };

  const toggleGrammar = (g: string) => {
    setTargetGrammar((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  const handleAIFill = async () => {
    setFilling(true);
    try {
      const seed = [title.trim(), description.trim()].filter(Boolean).join(". ") || undefined;
      const idea = await storyService.generateStoryIdea(seed, genre, level);
      setTitle(idea.title);
      setDescription(idea.description);
      toast.success(seed ? "Title & description expanded" : "Story idea generated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Error generating idea");
    } finally {
      setFilling(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        genre,
        languageLevel: level,
        targetVocabulary: targetVocab,
        targetGrammar,
        img,
      };

      if (isEdit && id) {
        await storyService.updateStory(id, data);
        toast.success("Story updated");
        navigate(`/stories/${id}`);
      } else {
        const story = await storyService.createStory(data);
        toast.success("Story created");
        navigate(`/stories/${story._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error saving story");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      <PageHeader
        title={isEdit ? "Edit story" : "Create story"}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(isEdit ? `/stories/${id}` : "/stories")} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </>
        }
      />

      <PageLoader
        loading={loading}
        onRetry={loadStory}
        onBack={() => navigate("/stories")}
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Title</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAIFill} disabled={filling}>
                  {filling ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {filling
                    ? "Generating..."
                    : title.trim() || description.trim()
                    ? "AI to fill"
                    : "AI: random idea"}
                </Button>
              </div>
              <Input
                placeholder="Enter story title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description of the story"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
              />
            </div>

            {/* Genre and Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Genre</Label>
                <Select value={genre} onValueChange={(v) => setGenre(v as StoryGenre)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {storyGenres.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Level</Label>
                <Select value={level} onValueChange={(v) => setLevel(v as CertificationLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Vocabulary */}
            <div>
              <Label>Target vocabulary ({targetVocab.length}/20)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a word..."
                  value={vocabInput}
                  onChange={(e) => setVocabInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVocab())}
                  disabled={targetVocab.length >= 20}
                />
                <Button type="button" onClick={handleAddVocab} disabled={targetVocab.length >= 20}>
                  Add
                </Button>
              </div>
              {targetVocab.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {targetVocab.map((word) => (
                    <Badge key={word} variant="secondary" className="gap-1">
                      {word}
                      <button onClick={() => handleRemoveVocab(word)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Target Grammar */}
            <div>
              <Label>Target grammar (optional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {GRAMMAR_OPTIONS.map((g) => (
                  <Badge
                    key={g}
                    variant={targetGrammar.includes(g) ? "default" : "outline"}
                    className={cn("cursor-pointer", targetGrammar.includes(g) && "bg-primary text-primary-foreground")}
                    onClick={() => toggleGrammar(g)}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => navigate(isEdit ? `/stories/${id}` : "/stories")}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {isEdit ? "Update" : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </PageLoader>
    </div>
  );
}
