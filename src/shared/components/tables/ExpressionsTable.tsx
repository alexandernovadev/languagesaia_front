import { IExpression } from "@/types/models/Expression";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Edit, Trash2, Image as ImageIcon, Volume2, MessageSquare, Sparkles } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { deliveryImageUrl, getDifficultyVariant } from "@/utils/common";
import { getSpeechLocale } from "@/utils/common/speech";

interface ExpressionsTableProps {
  expressions: IExpression[];
  loading: boolean;
  onEdit: (expression: IExpression) => void;
  onDelete: (expression: IExpression) => void;
  onView?: (expression: IExpression) => void;
  searchTerm?: string;
  onGenerateWithAI?: (expression: string) => void;
  isGenerating?: boolean;
}

export function ExpressionsTable({
  expressions,
  loading,
  onEdit,
  onDelete,
  onView,
  searchTerm,
  onGenerateWithAI,
  isGenerating = false
}: ExpressionsTableProps) {
  const speak = (text: string, lang: string = 'en-US', rate: number = 1) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (expressions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `No se encontró la expresión "${searchTerm}"` : "No expressions found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm 
                ? "¿Quieres generar esta expresión con IA?" 
                : "Try adjusting your search or filters"}
            </p>
            {searchTerm && onGenerateWithAI && (
              <Button
                onClick={() => onGenerateWithAI(searchTerm)}
                disabled={isGenerating}
                className={`mt-4 ${isGenerating ? 'animate-pulse' : ''}`}
                variant="default"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? "Generando..." : "Generar con AI"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 overflow-x-hidden max-w-full">
      {expressions.map((expression) => (
        <Card key={expression._id} className="hover:shadow-md transition-shadow overflow-hidden max-w-full">
          <CardContent className="p-2 sm:p-4 max-w-full">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start max-w-full">
              {/* Image */}
              <div className="flex-shrink-0 cursor-pointer w-full sm:w-auto flex justify-center sm:justify-start" onClick={() => onView?.(expression)}>
                {expression.img ? (
                  <img
                    src={deliveryImageUrl(expression.img)}
                    alt={expression.expression}
                    className="h-32 w-32 sm:h-24 sm:w-24 md:h-28 md:w-28 object-contain rounded max-w-full"
                  />
                ) : (
                  <div className="h-32 w-32 sm:h-24 sm:w-24 md:h-28 md:w-28 bg-muted rounded flex items-center justify-center max-w-full">
                    <ImageIcon className="h-12 w-12 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                  {/* Expression Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-2xl capitalize">{expression.expression}</h3>
                      <button
                        onClick={() => speak(expression.expression, getSpeechLocale(expression.language), 1)}
                        className="p-1 border rounded hover:bg-muted transition-colors"
                        title="Play normal speed"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => speak(expression.expression, getSpeechLocale(expression.language), 0.1)}
                        className="p-1 border rounded hover:bg-muted transition-colors text-xl leading-none"
                        title="Play very slow speed"
                      >
                        🐢
                      </button>
                    </div>
                    {expression.spanish?.expression && (
                      <p className="text-lg capitalize text-blue-600 dark:text-blue-400">
                        {expression.spanish.expression}
                      </p>
                    )}
                    {expression.context && (
                      <div className="flex items-start gap-1 mt-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground italic">{expression.context}</p>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant={getDifficultyVariant(expression.difficulty)}>
                      {expression.difficulty || "N/A"}
                    </Badge>
                  </div>
                </div>

                {/* Definition */}
                <p className="text-sm mb-2">{expression.definition}</p>
                
                {/* Spanish Definition */}
                {expression.spanish?.definition && (
                  <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-2">
                    {expression.spanish.definition}
                  </p>
                )}

                {/* Type tags */}
                {expression.type && expression.type.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {expression.type.map((t, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEdit(expression)}
                    title="Editar"
                  >
                    <Edit />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => onDelete(expression)}
                    title="Eliminar"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
