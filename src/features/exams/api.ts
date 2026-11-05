/**
 * Exams (Bruno) — types and backend calls.
 * A practice = an exam (its exercises, with answers) + an attempt where each
 * answer is checked one by one.
 */
import { api } from "../../lib/api";

export type QuestionType = "choice" | "fillBlank" | "order" | "translate" | "match" | "findError";
export type ExamMode = "quick" | "topic" | "mistakes";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Question {
  type: QuestionType;
  prompt: string;
  grammarTopic?: string;
  explanation?: string;
  options?: string[];
  answerIndex?: number;
  tokens?: string[];
  answerTokens?: string[];
  reference?: string;
  pairs?: Array<{ left: string; right: string }>;
  errorIndex?: number;
  correction?: string;
}

export interface Practice {
  exam: { _id: string; title: string; mode: ExamMode; level: Level; questions: Question[] };
  attemptId: string;
  topics: Array<{ value: string; label: string }>;
}

export interface CheckResult {
  correct: boolean;
  score: number;
  feedback?: string;
}

export interface GrammarGroup {
  value: string;
  label: string;
  topics: Array<{ value: string; label: string; level: Level }>;
}

export interface ExamStats {
  topics: Array<{ value: string; label: string; seen: number; accuracy: number }>;
  recent: Array<{ _id: string; title: string; mode: ExamMode; level: Level; score?: number; xp?: number; completedAt?: string }>;
  mistakes: number;
}

export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const examsApi = {
  catalog: () => api<GrammarGroup[]>("/api/exams/catalog"),
  stats: () => api<ExamStats>("/api/exams/stats"),
  practice: (body: { mode: ExamMode; level?: Level; grammarTopics?: string[]; count?: number }) =>
    api<Practice>("/api/exams/practice", { method: "POST", body }),
  answer: (attemptId: string, index: number, answer: unknown) =>
    api<CheckResult>(`/api/exams/attempts/${attemptId}/answer`, { method: "POST", body: { index, answer } }),
  finish: (attemptId: string) => api<{ score: number; xp: number; correct: number; total: number }>(`/api/exams/attempts/${attemptId}/finish`, { method: "POST" }),
  chat: (attemptId: string, index: number) => api<Array<{ role: "user" | "assistant"; content: string }>>(`/api/exams/attempts/${attemptId}/questions/${index}/chat`),
  chatPath: (attemptId: string, index: number) => `/api/exams/attempts/${attemptId}/questions/${index}/chat/stream`,
};

/** Human readable correct answer (shown after checking). */
export const correctAnswerOf = (q: Question): string => {
  switch (q.type) {
    case "choice":
    case "fillBlank":
      return q.options?.[q.answerIndex ?? 0] ?? "";
    case "order":
      return (q.answerTokens ?? []).join(" ");
    case "translate":
      return q.reference ?? "";
    case "findError":
      return `${q.tokens?.[q.errorIndex ?? 0] ?? ""} → ${q.correction ?? ""}`;
    case "match":
      return "";
  }
};

export const TYPE_LABEL: Record<QuestionType, string> = {
  choice: "Elige la correcta",
  fillBlank: "Completa el hueco",
  order: "Ordena la frase",
  translate: "Traduce",
  match: "Une las parejas",
  findError: "Encuentra el error",
};
