/**
 * Words — types and every backend call for the Palabras module.
 * Most "generate*" calls hit the AI and take 10–60 s.
 */
import { api } from "../../lib/api";
import { progress, type Reward } from "../../lib/progress";

export type Difficulty = "easy" | "medium" | "hard";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface Word {
  _id: string;
  word: string;
  language: string;
  definition: string;
  examples: string[];
  synonyms: string[];
  type: string[];
  IPA?: string;
  seen: number;
  difficulty: Difficulty;
  codeSwitching: string[];
  /** Verbs only: tense → person → form. */
  conjugations?: Record<string, Record<string, string>> | null;
  spanish?: { word?: string; definition?: string };
  img?: string;
  audio?: string;
  createdAt?: string;
}

/** What the review has ready. It's never a limit: you can always keep studying. */
export interface ReviewSummary {
  due: number;
  newWords: number;
  nextDueAt: string | null;
}

export type ReviewAnswer = "again" | "hard" | "easy";

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface WordQuery {
  page?: number;
  limit?: number;
  search?: string;
  difficulty?: Difficulty | "";
  type?: string;
  language?: string;
}

export const WORD_TYPES: Record<string, string> = {
  noun: "Sustantivo",
  verb: "Verbo",
  "auxiliary verb": "Verbo auxiliar",
  "modal verb": "Verbo modal",
  "phrasal verb": "Phrasal verb",
  infinitive: "Infinitivo",
  participle: "Participio",
  gerund: "Gerundio",
  adjective: "Adjetivo",
  adverb: "Adverbio",
  pronoun: "Pronombre",
  preposition: "Preposición",
  conjunction: "Conjunción",
  determiner: "Determinante",
  interjection: "Interjección",
  particle: "Partícula",
};

export const DIFFICULTY: Record<Difficulty, { label: string; tone: "success" | "warning" | "danger" }> = {
  easy: { label: "Fácil", tone: "success" },
  medium: { label: "Medio", tone: "warning" },
  hard: { label: "Difícil", tone: "danger" },
};

const qs = (q: Record<string, string | number | undefined>) =>
  Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

export const wordsApi = {
  list: ({ page = 1, limit = 20, search, difficulty, type, language }: WordQuery, signal?: AbortSignal) =>
    api<Page<Word>>(
      `/api/words?${qs({ page, limit, wordUser: search, difficulty, type, language, sortBy: "createdAt", sortOrder: "desc" })}`,
      { signal },
    ),
  get: (id: string) => api<Word>(`/api/words/${id}`),
  /** Adds a word to your list. If nobody has it yet, the AI creates it for the dictionary first. */
  async generate(word: string, language: string) {
    const created = await api<Word & { alreadyInList: boolean; reward: Reward | null }>("/api/words/generate", { method: "POST", body: { word, language } });
    progress.apply(created.reward);
    return created;
  },
  setDifficulty: (id: string, difficulty: Difficulty) => api<Word>(`/api/words/${id}/difficulty`, { method: "PUT", body: { difficulty } }),
  seen: (id: string) => api<Word>(`/api/words/${id}/increment-seen`, { method: "PUT" }),
  regenerate: (id: string, what: "examples" | "code-switching" | "synonyms" | "types", w: Word) =>
    api<Word>(`/api/words/${id}/generate-${what}`, {
      method: "POST",
      body: { word: w.word, language: w.language, oldExamples: what === "code-switching" ? w.codeSwitching : w.examples },
    }),
  image: (id: string, w: Word) => api<Word>(`/api/words/${id}/generate-image`, { method: "POST", body: { word: w.word, imgOld: w.img } }),
  reviewSummary: () => api<ReviewSummary>("/api/words/review/summary"),
  /** Today's cards: overdue first, then new ones. */
  reviewQueue: (limit: number) => api<Word[]>(`/api/words/review/queue?limit=${limit}`),
  async answerReview(id: string, answer: ReviewAnswer) {
    const { reward } = await api<{ reward: Reward }>(`/api/words/${id}/review`, { method: "POST", body: { answer } });
    progress.apply(reward);
    return reward;
  },
  /** One card of free practice: it earns XP and doesn't touch the schedule. */
  async practice(id: string) {
    const { reward } = await api<{ reward: Reward }>(`/api/words/${id}/practice`, { method: "POST" });
    progress.apply(reward);
    return reward;
  },
  /** Free practice, outside the schedule. `review` = hardest and least seen first; `random` = shuffled. */
  ankiCards: ({ mode = "review", limit = 20, difficulty = ["hard", "medium"], language, type }: { mode?: "random" | "review"; limit?: number; difficulty?: Difficulty[]; language?: string; type?: string }) =>
    api<Word[]>(`/api/words/anki-cards?${qs({ mode, limit, difficulty: difficulty.join(","), language, type })}`),
  chat: (id: string) => api<ChatMessage[]>(`/api/words/${id}/chat`),
  clearChat: (id: string) => api(`/api/words/${id}/chat`, { method: "DELETE" }),
};
