import { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import type { IExamQuestion } from "@/types/models";
import { cn } from "@/utils/common/classnames";
import { shuffleArray } from "@/utils/common/shuffle";

const QUESTION_TYPE_LABELS: Record<string, string> = {
  multiple: "Opción múltiple",
  unique: "Respuesta única",
  fillInBlank: "Completar huecos",
  translateText: "Traducir texto",
};

interface ExamQuestionInputProps {
  question: IExamQuestion;
  index: number;
  value: number | string | number[] | null;
  onChange: (value: number | string | number[]) => void;
  shuffleOptions?: boolean;
}

export function ExamQuestionInput({ question: q, index, value, onChange, shuffleOptions = false }: ExamQuestionInputProps) {
  const hasOptions = q.options && q.options.length > 0;
  const isMultipleSelect = q.type === "multiple" && hasOptions;
  const isSingleSelect =
    (q.type === "unique" && hasOptions) || (q.type === "fillInBlank" && hasOptions);

  const optionsToDisplay = useMemo(() => {
    if (!q.options?.length) return [];
    const withIndex = q.options.map((opt, i) => ({ opt, originalIndex: i }));
    return shuffleOptions ? shuffleArray(withIndex) : withIndex;
  }, [q.options, shuffleOptions]);

  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">Pregunta {index + 1}</h3>
        <Badge variant="outline" className="text-xs shrink-0">
          {QUESTION_TYPE_LABELS[q.type] ?? q.type}
        </Badge>
      </div>
      <div className="space-y-3">
        {q.type === "translateText" ? (
          <>
            <p className="text-xs text-muted-foreground font-medium">Texto a traducir:</p>
            <p className="text-sm">{q.text}</p>
          </>
        ) : (
          <p className="text-sm">{q.text}</p>
        )}

        {isMultipleSelect && hasOptions && (
          <div className="space-y-2">
            {optionsToDisplay.map(({ opt, originalIndex }, displayIdx) => {
              const selected = Array.isArray(value) ? value.includes(originalIndex) : false;
              return (
                <div
                  key={originalIndex}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors",
                    selected && "border-primary bg-primary/5"
                  )}
                  onClick={() => {
                    const current = Array.isArray(value) ? [...value] : [];
                    const next = current.includes(originalIndex)
                      ? current.filter((x) => x !== originalIndex)
                      : [...current, originalIndex].sort((a, b) => a - b);
                    onChange(next);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      const current = Array.isArray(value) ? [...value] : [];
                      const next = current.includes(originalIndex)
                        ? current.filter((x) => x !== originalIndex)
                        : [...current, originalIndex].sort((a, b) => a - b);
                      onChange(next);
                    }
                  }}
                >
                  <Checkbox
                    id={`q${index}-opt${originalIndex}`}
                    checked={selected}
                    tabIndex={-1}
                    className="pointer-events-none"
                  />
                  <Label
                    className="flex-1 cursor-pointer text-sm font-normal"
                  >
                    {String.fromCharCode(65 + displayIdx)}. {opt}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {isSingleSelect && hasOptions && (
          <RadioGroup
            value={typeof value === "number" ? String(value) : ""}
            onValueChange={(v) => onChange(parseInt(v, 10))}
            className="space-y-2"
          >
            {optionsToDisplay.map(({ opt, originalIndex }, displayIdx) => (
              <div
                key={originalIndex}
                className={cn(
                  "flex items-center space-x-2 rounded-lg border p-3 cursor-pointer transition-colors",
                  value === originalIndex && "border-primary bg-primary/5"
                )}
                onClick={() => onChange(originalIndex)}
              >
                <RadioGroupItem value={String(originalIndex)} id={`q${index}-opt${originalIndex}`} />
                <Label
                  htmlFor={`q${index}-opt${originalIndex}`}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  {String.fromCharCode(65 + displayIdx)}. {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {!isMultipleSelect && !isSingleSelect && (
          <div className="space-y-2">
            <Label htmlFor={`q${index}-input`} className="text-sm font-medium">
              Tu respuesta
            </Label>
            <Textarea
              id={`q${index}-input`}
              value={value != null ? String(value) : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Escribe aquí..."
              rows={3}
              className="min-h-[15dvh] resize-y"
            />
          </div>
        )}
      </div>
    </div>
  );
}
