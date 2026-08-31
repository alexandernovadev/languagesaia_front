import { Languages, TrendingUp } from "lucide-react";
import { IWord } from "@/types/models/Word";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { getDifficultyVariant } from "@/utils/common";

interface WordHeaderSectionProps {
  word: IWord;
  onUpdateDifficulty?: (difficulty: string) => void;
}

export function WordHeaderSection({ word, onUpdateDifficulty }: WordHeaderSectionProps) {
  return (
    <section className="relative">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold capitalize bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                {word.word}
              </h1>
            </div>
            
            {word.IPA && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs md:text-sm font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  /{word.IPA}/
                </span>
              </div>
            )}
            
            {word.spanish?.word && (
              <div className="flex items-center gap-2 mb-2">
                <Languages className="h-3 w-3 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xl md:text-2xl capitalize text-blue-600 dark:text-blue-400 font-semibold">
                  {word.spanish.word}
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant={getDifficultyVariant(word.difficulty)} className="text-sm md:text-base px-3 py-1">
                {word.difficulty || "N/A"}
              </Badge>
              <Badge variant="outline" className="text-sm md:text-base px-3 py-1">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                Visto: {word.seen || 0}
              </Badge>
            </div>
            
            {/* Botones de dificultad - usamos variantes compatibles con Button (easy=default, medium=yellow, hard=destructive) */}
            {onUpdateDifficulty && (
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="default"
                  disabled={word.difficulty === 'easy'}
                  onClick={() => onUpdateDifficulty('easy')}
                  className="text-xs md:text-sm"
                >
                  Easy
                </Button>
                <Button
                  size="sm"
                  variant="yellow"
                  disabled={word.difficulty === 'medium'}
                  onClick={() => onUpdateDifficulty('medium')}
                  className="text-xs md:text-sm"
                >
                  Medium
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={word.difficulty === 'hard'}
                  onClick={() => onUpdateDifficulty('hard')}
                  className="text-xs md:text-sm"
                >
                  Hard
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
