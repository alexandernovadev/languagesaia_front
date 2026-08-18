import { CertificationLevel, Language } from "../business";

export type ExamQuestionType = "multiple" | "unique" | "fillInBlank" | "translateText";

export interface IExamQuestion {
  id?: string;
  type: ExamQuestionType;
  text: string;
  options?: string[];
  /** Single correct (unique/fillInBlank) */
  correctIndex?: number;
  /** Multiple correct (multiple = select all that apply) */
  correctIndices?: number[];
  correctAnswer?: string;
  grammarTopic: string;
  explanation: string;
}

export interface IExam {
  _id: string;
  title: string;
  language: Language;
  difficulty: CertificationLevel;
  grammarTopics: string[];
  topic?: string;
  questions: IExamQuestion[];
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  /** Number of user's attempts (from API list when authenticated) */
  attemptCount?: number;
  /** Best score among user's attempts (from API list when authenticated) */
  bestScore?: number;
}

export interface IAttemptQuestion {
  questionIndex: number;
  questionText: string;
  questionType: ExamQuestionType;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];
  correctAnswer?: string;
  grammarTopic?: string;
  userAnswer: number | number[] | string;
  isCorrect: boolean;
  partialScore?: number;
  isPartial?: boolean;
  aiFeedback?: string;
  chat: Array<{ role: string; content: string }>;
}

export interface IExamAttempt {
  _id: string;
  examId: string | IExam;
  userId: string;
  score: number;
  startedAt: Date;
  completedAt: Date;
  attemptQuestions: IAttemptQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

// API request/response types
export interface GenerateExamParams {
  language: string;
  grammarTopics: string[];
  difficulty: string;
  questionCount: number;
  questionTypes?: ExamQuestionType[];
  topic?: string;
}

export interface GeneratedExam {
  title: string;
  questions: Omit<IExamQuestion, "id">[];
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  feedback: string;
  issues: Array<{ questionIndex: number; type: string; message: string }>;
  suggestions: string[];
  thumbsUp: boolean;
}
