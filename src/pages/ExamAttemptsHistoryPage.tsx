import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/components/ui/page-header";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { AlertDialogNova } from "@/shared/components/ui/alert-dialog-nova";
import { useExamAttempts } from "@/shared/hooks/useExamAttempts";
import { ExamAttemptResultCard } from "@/shared/components/exam/ExamAttemptResultCard";
import { ExamDetailBar } from "@/shared/components/exam/ExamDetailBar";
import { examService } from "@/services/examService";
import type { IExam, IExamAttempt } from "@/types/models";
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/utils/common/classnames";
import { toast } from "sonner";

export default function ExamAttemptsHistoryPage() {
  const { id, attemptId } = useParams<{ id: string; attemptId?: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<IExam | null>(null);
  const [examLoading, setExamLoading] = useState(true);
  const { attempts, loading: attemptsLoading, refreshAttempts } = useExamAttempts(id ?? null);
  const [attemptToDelete, setAttemptToDelete] = useState<IExamAttempt | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    examService
      .getById(id)
      .then(setExam)
      .catch(() => {
        toast.error("No se pudo cargar el examen");
        navigate("/exams");
      })
      .finally(() => setExamLoading(false));
  }, [id, navigate]);

  const selectedIndex = useMemo(() => {
    if (!attemptId) return 0;
    const idx = attempts.findIndex((a) => a._id === attemptId);
    return idx === -1 ? 0 : idx;
  }, [attempts, attemptId]);

  // Keep the URL pinned to a real attemptId once the list has loaded,
  // so the page is always linkable/bookmarkable and survives deletions.
  useEffect(() => {
    if (!id || attemptsLoading || attempts.length === 0) return;
    const current = attempts[selectedIndex];
    if (current && current._id !== attemptId) {
      navigate(`/exams/${id}/attempts/${current._id}`, { replace: true });
    }
  }, [id, attempts, attemptsLoading, attemptId, selectedIndex, navigate]);

  const selectedAttempt = attempts[selectedIndex];

  const formatDate = (d: Date) => {
    const date = new Date(d);
    return date.toLocaleDateString("es", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToIndex = useCallback(
    (index: number) => {
      const target = attempts[index];
      if (!target || !id) return;
      navigate(`/exams/${id}/attempts/${target._id}`, { replace: true });
    },
    [attempts, id, navigate]
  );

  const handleDeleteConfirm = async () => {
    if (!attemptToDelete || !id) return;
    setDeleteLoading(true);
    try {
      await examService.deleteAttempt(id, attemptToDelete._id);
      await refreshAttempts();
      setAttemptToDelete(null);
      toast.success("Intento eliminado");
    } catch {
      toast.error("Error al eliminar el intento");
    } finally {
      setDeleteLoading(false);
    }
  };

  const resultExam = selectedAttempt
    ? typeof selectedAttempt.examId === "object"
      ? selectedAttempt.examId
      : exam
    : exam;
  const meta = resultExam
    ? {
        language: resultExam.language,
        difficulty: resultExam.difficulty,
        grammarTopics: resultExam.grammarTopics,
        topic: resultExam.topic,
      }
    : null;

  const loading = examLoading || attemptsLoading;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={exam ? `Intentos: ${exam.title}` : "Intentos"} />

      <Button variant="outline" size="sm" onClick={() => navigate("/exams")} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver a Exámenes
      </Button>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : attempts.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No hay intentos para este examen</p>
      ) : selectedAttempt ? (
        <>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">
              #{selectedIndex + 1} de {attempts.length} · {formatDate(selectedAttempt.completedAt)}
            </span>
            <div className="flex items-center justify-between w-full">
              <div
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-1 text-sm w-fit",
                  selectedAttempt.score >= 70
                    ? "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : selectedAttempt.score >= 50
                      ? "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30"
                      : "text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30"
                )}
              >
                <span className="font-bold tabular-nums">{selectedAttempt.score}%</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => goToIndex(selectedIndex - 1)}
                  disabled={selectedIndex === 0}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => goToIndex(selectedIndex + 1)}
                  disabled={selectedIndex === attempts.length - 1}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => setAttemptToDelete(selectedAttempt)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {meta && <ExamDetailBar meta={meta} questionCount={selectedAttempt.attemptQuestions.length} />}

          <ScrollArea className="mt-4">
            <div className="space-y-4 pb-8">
              {selectedAttempt.attemptQuestions.map((aq, i) => (
                <ExamAttemptResultCard key={i} aq={aq} index={i} />
              ))}
            </div>
          </ScrollArea>
        </>
      ) : null}

      <AlertDialogNova
        open={!!attemptToDelete}
        onOpenChange={(o) => !o && setAttemptToDelete(null)}
        title="¿Eliminar intento?"
        description={
          attemptToDelete ? (
            <span>
              Se eliminará el intento con {attemptToDelete.score}% de puntuación. Esta acción no se puede deshacer.
            </span>
          ) : undefined
        }
        onConfirm={handleDeleteConfirm}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteLoading}
        confirmVariant="destructive"
      />
    </div>
  );
}
