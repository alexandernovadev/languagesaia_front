import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { ExamAttemptResultCard } from "@/shared/components/exam/ExamAttemptResultCard";
import { ExamDetailBar } from "@/shared/components/exam/ExamDetailBar";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/utils/common/classnames";
import { ArrowLeft } from "lucide-react";
import type { IExam, IExamAttempt } from "@/types/models";

interface ExamSubmittedViewProps {
  submittedAttempt: IExamAttempt;
  exam: IExam;
}

export function ExamSubmittedView({ submittedAttempt, exam }: ExamSubmittedViewProps) {
  const navigate = useNavigate();
  const resultExam = typeof submittedAttempt.examId === "object" ? submittedAttempt.examId : exam;

  const meta = resultExam
    ? {
        language: resultExam.language,
        difficulty: resultExam.difficulty,
        grammarTopics: resultExam.grammarTopics,
        topic: resultExam.topic,
      }
    : null;

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {resultExam?.title ?? exam?.title ?? "Examen completado"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Revisa tus respuestas y el feedback de la IA
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card px-6 py-4 min-w-[100px]">
              <span
                className={cn(
                  "text-3xl font-bold tabular-nums",
                  submittedAttempt.score >= 70
                    ? "text-emerald-600 dark:text-emerald-400"
                    : submittedAttempt.score >= 50
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {submittedAttempt.score}%
              </span>
              <span className="text-xs font-medium text-muted-foreground mt-0.5">
                Puntuación
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/exams")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/exams/${(exam ?? resultExam)?._id}/attempts`)}
              >
                Ver intentos
              </Button>
            </div>
          </div>
        </div>

        {meta && (
          <ExamDetailBar
            meta={meta}
            questionCount={submittedAttempt.attemptQuestions.length}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Resultados por pregunta</h2>
        <ScrollArea className="h-[calc(100dvh-320px)] pr-4">
          <div className="space-y-4 pb-8">
            {submittedAttempt.attemptQuestions.map((aq, i) => (
              <ExamAttemptResultCard key={i} aq={aq} index={i} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
