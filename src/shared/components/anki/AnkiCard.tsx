import { useEffect, useRef } from 'react';
import { Volume2 } from 'lucide-react';
import { IWord } from '@/types/models/Word';
import { Card, CardContent } from '@/shared/components/ui/card';
import { deliveryImageUrl } from '@/utils/common';
import { cn } from '@/utils/common/classnames';
import { getSpeechLocale } from '@/utils/common/speech';
import { WordDetailTabs } from '../word-detail/WordDetailTabs';
import { useWordDetail } from '@/shared/hooks/useWordDetail';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface AnkiCardProps {
  word: IWord;
  isFlipped: boolean;
  onFlip: () => void;
}

export function AnkiCard({ word, isFlipped, onFlip }: AnkiCardProps) {

  // Use wordDetail hook for managing word state and functions
  // Pasar word como initialWord para evitar llamada API innecesaria
  const {
    word: updatedWord,
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
    incrementSeen,
    updateDifficulty,
  } = useWordDetail({
    wordId: word._id,
    initialWord: word, // Pasar la palabra completa para evitar llamada API
    onWordUpdate: (updated) => {
      // Word is updated automatically by the hook
    }
  });

  // Use updated word if available, otherwise use original
  const displayWord = updatedWord || word;

  // Track previous flipped state to detect when card is flipped
  const prevFlippedRef = useRef(false);

  // Increment seen when card is flipped (only once per flip)
  useEffect(() => {
    if (isFlipped && !prevFlippedRef.current && displayWord) {
      // Card was just flipped from false to true
      incrementSeen();
    }
    prevFlippedRef.current = isFlipped;
  }, [isFlipped, displayWord, incrementSeen]);

  const speak = (text: string, lang: string = 'en-US', rate: number = 1) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFlip = () => {
    onFlip();
  };

  const handleAudioClick = (e: React.MouseEvent, rate: number = 1) => {
    e.stopPropagation();
    speak(displayWord.word, getSpeechLocale(displayWord?.language), rate);
  };

  return (
    <div
      className="relative w-full h-[90dvh] cursor-pointer pb-6"
      style={{ perspective: '1000px' }}
      onClick={handleFlip}
    >
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-500"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* FRENTE */}
        <Card
          className="absolute w-full h-full flex flex-col overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <CardContent className="flex flex-col h-full w-full p-0">
            {/* Imagen: zona principal, crece para llenar el espacio */}
            <div className="flex-1 min-h-0 flex items-center justify-center p-4">
              {displayWord.img ? (
                <img
                  src={deliveryImageUrl(displayWord.img)}
                  alt={displayWord.word}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-muted-foreground text-6xl">
                  🔤
                </div>
              )}
            </div>

            {/* Info: zona inferior fija */}
            <div className="flex flex-col items-center gap-2 px-6 pb-6 pt-3">
              <div className="flex items-center gap-2">
                  <button
                   onClick={(e) => handleAudioClick(e, 1)}
                   className="size-12 border border-white rounded-lg hover:bg-muted transition-colors hover:scale-110 shadow-lg backdrop-blur-sm bg-background/80 flex items-center justify-center"
                   title="Reproducir velocidad normal"
                 >
                   <Volume2 className="h-6 w-6" />
                 </button>
                 <button
                   onClick={(e) => handleAudioClick(e, 0.1)}
                   className="size-12 border border-white rounded-lg hover:bg-muted transition-colors hover:scale-110 shadow-lg backdrop-blur-sm bg-background/80 text-[32px] leading-none flex items-center justify-center"
                   title="Reproducir velocidad lenta"
                >
                  🐢
                </button>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold capitalize">{displayWord.word}</h2>

              {displayWord.IPA && (
                <span className="text-[13px] md:text-sm font-mono text-muted-foreground bg-muted px-3 py-1 rounded">
                  /{displayWord.IPA}/
                </span>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                Toca para voltear
              </p>
            </div>
          </CardContent>
        </Card>

        {/* REVERSO */}
        <Card
          className={cn(
            "absolute w-full h-full",
            "flex flex-col overflow-hidden"
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardContent className="flex flex-col h-full p-0 relative">
            {/* WordDetailTabs */}
            <div className="flex-1 min-h-0" onClick={(e) => e.stopPropagation()}>
              {displayWord ? (
                <WordDetailTabs
                  cardId={displayWord._id}
                  word={displayWord}
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
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-64 w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
