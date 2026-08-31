import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { BookOpen, Volume2, Plus, Loader2, X } from "lucide-react";
import { cn } from "@/utils/common/classnames";
import { IWord } from "@/types/models/Word";

type WordLookup = { exists: true; word: IWord } | { exists: false } | null;

interface WordLookupPanelProps {
  selectedWord: string | null;
  wordLookup: WordLookup;
  wordLookupLoading: boolean;
  addingWord: boolean;
  isMobile: boolean;
  onSpeak: (word: string, rate: number) => void;
  onOpenDetail: () => void;
  onAddWord: () => void;
  onClose: () => void;
}

export function WordLookupPanel({
  selectedWord,
  wordLookup,
  wordLookupLoading,
  addingWord,
  isMobile,
  onSpeak,
  onOpenDetail,
  onAddWord,
  onClose,
}: WordLookupPanelProps) {
  const displayWord =
    selectedWord || (wordLookup?.exists ? wordLookup.word.word : null) || "—";

  return (
    <Card
      className={cn(
        "sticky bottom-0 z-30 border shadow-lg bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90",
        isMobile ? "-mx-4 rounded-t-xl border-x-0 border-b-0" : "rounded-xl mb-2"
      )}
    >
      <CardContent className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Word + speak + close */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <p className="font-semibold text-lg capitalize truncate">{displayWord}</p>
            {displayWord !== "—" && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSpeak(displayWord, 1); }}
                  className="size-12 border rounded-lg hover:bg-muted transition-colors hover:scale-110 flex items-center justify-center"
                  title="Velocidad normal"
                >
                  <Volume2 className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onSpeak(displayWord, 0.01); }}
                  className="size-12 border rounded-lg hover:bg-muted transition-colors hover:scale-110 text-[32px] leading-none flex items-center justify-center"
                  title="Velocidad lenta"
                >
                  🐢
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto shrink-0 p-1.5 rounded-md border border-red-600 bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {wordLookupLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : wordLookup?.exists ? (
              <Button onClick={onOpenDetail}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ver detalle
              </Button>
            ) : wordLookup && !wordLookup.exists ? (
              <Button onClick={onAddWord} disabled={addingWord} className="w-full sm:w-auto">
                {addingWord ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Añadir
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
