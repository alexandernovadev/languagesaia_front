import { useState } from "react";
import { Sparkles } from "lucide-react";
import { IWord } from "@/types/models/Word";
import { Button } from "@/shared/components/ui/button";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { WordImageSection } from "./WordImageSection";
import { WordHeaderSection } from "./WordHeaderSection";
import { WordDefinitionSection } from "./WordDefinitionSection";
import { WordExamplesSection } from "./WordExamplesSection";
import { WordSynonymsSection } from "./WordSynonymsSection";
import { WordTypesSection } from "./WordTypesSection";
import { WordCodeSwitchingSection } from "./WordCodeSwitchingSection";

interface WordInfoTabProps {
  word: IWord;
  loadingImage: boolean;
  loadingSynonyms: boolean;
  loadingExamples: boolean;
  loadingTypes: boolean;
  loadingCodeSwitching: boolean;
  loadingAll?: boolean;
  onRefreshImage: () => void;
  onRefreshSynonyms: () => void;
  onRefreshExamples: () => void;
  onRefreshTypes: () => void;
  onRefreshCodeSwitching: () => void;
  onRefreshAll?: () => void;
  onUpdateDifficulty?: (difficulty: string) => void;
}

export function WordInfoTab({
  word,
  loadingImage,
  loadingSynonyms,
  loadingExamples,
  loadingTypes,
  loadingCodeSwitching,
  loadingAll,
  onRefreshImage,
  onRefreshSynonyms,
  onRefreshExamples,
  onRefreshTypes,
  onRefreshCodeSwitching,
  onRefreshAll,
  onUpdateDifficulty,
}: WordInfoTabProps) {
  const [refreshConfirmOpen, setRefreshConfirmOpen] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-4 flex-1 min-h-0 space-y-6">
      <WordImageSection
        word={word}
        onRefresh={onRefreshImage}
        loading={loadingImage}
      />
      
      <WordHeaderSection 
        word={word}
        onUpdateDifficulty={onUpdateDifficulty}
      />
      
      <WordDefinitionSection word={word} />
      
      <WordExamplesSection
        word={word}
        onRefresh={onRefreshExamples}
        loading={loadingExamples}
      />
      
      <WordSynonymsSection
        word={word}
        onRefresh={onRefreshSynonyms}
        loading={loadingSynonyms}
      />
      
      <WordTypesSection
        word={word}
        onRefresh={onRefreshTypes}
        loading={loadingTypes}
      />
      
      <WordCodeSwitchingSection
        word={word}
        onRefresh={onRefreshCodeSwitching}
        loading={loadingCodeSwitching}
      />

      {onRefreshAll && (
        <>
          <Button
            className="w-full mb-2"
            onClick={() => setRefreshConfirmOpen(true)}
            disabled={loadingAll}
          >
            <Sparkles className={loadingAll ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            REGENERAR TODO
          </Button>
          <AlertDialogNova
            open={refreshConfirmOpen}
            onOpenChange={setRefreshConfirmOpen}
            title="¿Rehacer toda la información?"
            description={
              <span>
                ¿Está seguro de rehacer toda la información de &quot;{word.word}&quot;? La IA regenerará definición, ejemplos, sinónimos y más.
              </span>
            }
            onConfirm={() => {
              setRefreshConfirmOpen(false);
              onRefreshAll();
            }}
            confirmText="Sí, rehacer"
            cancelText="Cancelar"
            loading={loadingAll}
          />
        </>
      )}
    </div>
  );
}
