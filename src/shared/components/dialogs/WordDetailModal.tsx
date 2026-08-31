import { ModalNova } from "@/shared/components/ui/modal-nova";
import { WordDetailTabs } from "../word-detail/WordDetailTabs";
import { useWordDetail } from "@/shared/hooks/useWordDetail";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface WordDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wordId: string | null;
  onWordUpdate?: (word: any) => void;
}

export function WordDetailModal({
  open,
  onOpenChange,
  wordId,
  onWordUpdate,
}: WordDetailModalProps) {
  const {
    word,
    loading,
    loadingImage,
    loadingSynonyms,
    loadingExamples,
    loadingTypes,
    loadingCodeSwitching,
    loadingAll,
    loadingChat,
    refreshImage,
    refreshSynonyms,
    refreshExamples,
    refreshTypes,
    refreshCodeSwitching,
    refreshAll,
    sendMessage,
    clearChat,
    updateDifficulty,
  } = useWordDetail({ wordId: open ? wordId : null, onWordUpdate });

  if (!word && loading) {
    return (
      <ModalNova
        open={open}
        onOpenChange={onOpenChange}
        size="5xl"
        height="h-[95dvh]"
      >
        <div className="px-6 py-4 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </ModalNova>
    );
  }

  if (!word) {
    return null;
  }

  return (
    <ModalNova
      open={open}
      onOpenChange={onOpenChange}
      size="3xl"
      height="h-[95dvh]"
      title={word.word[0]?.toUpperCase() + word.word.slice(1)}
    >
      <div className="flex flex-col h-full pb-5">
        <div className="flex-1 min-h-0">
          <WordDetailTabs
            word={word}
            cardId={wordId || ""}
            loadingImage={loadingImage}
            loadingSynonyms={loadingSynonyms}
            loadingExamples={loadingExamples}
            loadingTypes={loadingTypes}
            loadingCodeSwitching={loadingCodeSwitching}
            loadingChat={loadingChat}
            loadingAll={loadingAll}
            onRefreshImage={refreshImage}
            onRefreshSynonyms={refreshSynonyms}
            onRefreshExamples={refreshExamples}
            onRefreshTypes={refreshTypes}
            onRefreshCodeSwitching={refreshCodeSwitching}
            onRefreshAll={refreshAll}
            onSendMessage={sendMessage}
            onClearChat={clearChat}
            onUpdateDifficulty={updateDifficulty}
          />
        </div>
      </div>
    </ModalNova>
  );
}
