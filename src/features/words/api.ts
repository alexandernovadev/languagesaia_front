/**
 * Words — types and every backend call for the Palabras module.
 * Most "generate*" calls hit the AI and take 10–60 s.
 */
import { api } from "../../lib/api";

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
  spanish?: { word?: string; definition?: string };
  img?: string;
  createdAt?: string;
}

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
  /** AI creates the full word (definition, IPA, examples…) and saves it. */
  generate: (word: string, language: string) => api<Word>("/api/words/generate", { method: "POST", body: { word, language } }),
  remove: (id: string) => api(`/api/words/${id}`, { method: "DELETE" }),
  setDifficulty: (id: string, difficulty: Difficulty) => api<Word>(`/api/words/${id}/difficulty`, { method: "PUT", body: { difficulty } }),
  seen: (id: string) => api<Word>(`/api/words/${id}/increment-seen`, { method: "PUT" }),
  regenerate: (id: string, what: "examples" | "code-switching" | "synonyms" | "types", w: Word) =>
    api<Word>(`/api/words/${id}/generate-${what}`, {
      method: "POST",
      body: { word: w.word, language: w.language, oldExamples: what === "code-switching" ? w.codeSwitching : w.examples },
    }),
  image: (id: string, w: Word) => api<Word>(`/api/words/${id}/generate-image`, { method: "POST", body: { word: w.word, imgOld: w.img } }),
  chat: (id: string) => api<ChatMessage[]>(`/api/words/${id}/chat`),
  clearChat: (id: string) => api(`/api/words/${id}/chat`, { method: "DELETE" }),
};
