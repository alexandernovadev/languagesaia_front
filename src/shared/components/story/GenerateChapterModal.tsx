import { useEffect, useState } from "react";
import { Loader2, BookPlus, BookOpenText, FlagTriangleRight } from "lucide-react";
import { ModalNova } from "@/shared/components/ui/modal-nova";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { cn } from "@/utils/common/classnames";
import { IStory } from "@/types/models/Story";
import { grammarTopicsJson } from "@/data/business/en";
import { WordSelector } from "@/shared/components/lecture-generator/WordSelector";
import { GrammarTopicsGrid } from "@/shared/components/story/GrammarTopicsGrid";

interface GenerateChapterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: IStory;
  generating: boolean;
  onGenerate: (params: {
    instructions: string;
    requestEnding: boolean;
    targetVocabulary: string[];
    targetGrammar: string[];
  }) => void;
}

export function GenerateChapterModal({
  open,
  onOpenChange,
  story,
  generating,
  onGenerate,
}: GenerateChapterModalProps) {
  const [instructions, setInstructions] = useState("");
  const [requestEnding, setRequestEnding] = useState(false);
  const [targetVocab, setTargetVocab] = useState<string[]>([]);
  const [targetGrammar, setTargetGrammar] = useState<string[]>([]);

  const chapterNumber = story.chapters.length + 1;
  const lastChapter = story.chapters[story.chapters.length - 1];

  useEffect(() => {
    if (open) {
      setInstructions("");
      setRequestEnding(false);
      setTargetVocab(lastChapter?.targetVocabulary || []);
      setTargetGrammar(lastChapter?.targetGrammar || []);
    }
  }, [open]);

  const handleGenerate = () => {
    onGenerate({ instructions, requestEnding, targetVocabulary: targetVocab, targetGrammar });
  };

  return (
    <ModalNova
      open={open}
      onOpenChange={onOpenChange}
      title="Generate new chapter"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <BookPlus className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>
      }
    >
      <div className="px-6 py-4 space-y-6">
        {/* Context banner */}
        <div className="flex items-center gap-3 rounded-lg border bg-gradient-to-br from-primary/10 to-primary/5 p-3">
          <div className="flex items-center justify-center size-9 rounded-full bg-primary/10 text-primary shrink-0">
            <BookOpenText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              Chapter {chapterNumber} of "{story.title}"
            </p>
            <p className="text-xs text-muted-foreground">
              {story.chapters.length > 0
                ? `${story.chapters.length} chapter${story.chapters.length === 1 ? "" : "s"} written so far`
                : "This will be the first chapter"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Instructions (optional)</Label>
          <Input
            placeholder="e.g. Set in Paris, introduce a new character..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>

        <WordSelector selected={targetVocab} onChange={setTargetVocab} maxSelections={20} />

        <GrammarTopicsGrid
          topics={grammarTopicsJson}
          selected={targetGrammar}
          onChange={setTargetGrammar}
          maxSelections={5}
        />

        <label
          htmlFor="requestEnding"
          className={cn(
            "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
            requestEnding ? "border-primary bg-primary/5" : "hover:bg-muted/50"
          )}
        >
          <Checkbox
            id="requestEnding"
            checked={requestEnding}
            onCheckedChange={(checked) => setRequestEnding(checked === true)}
            className="mt-0.5"
          />
          <span className="flex items-start gap-2">
            <FlagTriangleRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span>
              <span className="block text-sm font-medium leading-tight">This is the final chapter</span>
              <span className="block text-xs text-muted-foreground">Bring the story to a satisfying conclusion instead of leaving it open.</span>
            </span>
          </span>
        </label>
      </div>
    </ModalNova>
  );
}
