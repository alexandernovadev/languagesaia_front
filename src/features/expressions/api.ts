/**
 * Expressions — types and backend calls for the Expresiones module (Nubo).
 * Creating one is two steps on the backend: the AI writes it (`generate`),
 * then we save it (`create`). `generateAndSave` does both.
 */
import { api } from "../../lib/api";
import type { ChatMessage, Difficulty, Page } from "../words/api";

export interface Expression {
  _id: string;
  expression: string;
  language: string;
  definition: string;
  examples: string[];
  type: string[];
  context?: string;
  img?: string;
  difficulty: Difficulty;
  spanish?: { expression?: string; definition?: string };
  createdAt?: string;
}

export const EXPRESSION_TYPES: Record<string, string> = {
  idiom: "Modismo",
  phrase: "Frase",
  collocation: "Colocación",
  slang: "Jerga",
  formal: "Formal",
  informal: "Informal",
};

const qs = (q: Record<string, string | number | undefined>) =>
  Object.entries(q)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");

export const expressionsApi = {
  list: (
    { page = 1, limit = 20, search, difficulty, type, language }: { page?: number; limit?: number; search?: string; difficulty?: Difficulty | ""; type?: string; language?: string },
    signal?: AbortSignal,
  ) => api<Page<Expression>>(`/api/expressions?${qs({ page, limit, search, difficulty, type, language, sortBy: "createdAt", sortOrder: "desc" })}`, { signal }),
  get: (id: string) => api<Expression>(`/api/expressions/${id}`),
  async generateAndSave(prompt: string, language: string) {
    const draft = await api<Partial<Expression>>("/api/expressions/generate", { method: "POST", body: { prompt, language } });
    return api<Expression>("/api/expressions", { method: "POST", body: { ...draft, language: draft.language ?? language } });
  },
  update: (id: string, data: Partial<Expression>) => api<Expression>(`/api/expressions/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => api(`/api/expressions/${id}`, { method: "DELETE" }),
  image: (e: Expression) => api<Expression>(`/api/expressions/${e._id}/generate-image`, { method: "POST", body: { expressionString: e.expression, imgOld: e.img } }),
  chat: (id: string) => api<ChatMessage[]>(`/api/expressions/${id}/chat`),
};
