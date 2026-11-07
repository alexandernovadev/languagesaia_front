/** Stories — types and backend calls for the Historias module (Tula). */
import { api, apiStream } from "../../lib/api";
import { progress, type Reward } from "../../lib/progress";
import type { Page } from "../words/api";

export interface Question {
  question: string;
  options: string[];
  answer: number;
}

export interface Phrase {
  text: string;
  base: string;
  type: string;
  meaning: string;
  sentence: string;
}

export interface Chapter {
  order: number;
  title: string;
  content: string;
  img?: string;
  idea?: string;
  /** Empty until the questions are ready, a few seconds after the chapter. */
  summary?: string;
  /** Missing until they've been looked for, a few seconds after the chapter. */
  phrases?: Phrase[];
  targetVocabulary: string[];
  questions: Question[];
  urlAudio?: string;
  audioAlignment?: WordTime[];
}

export interface WordTime {
  word: string;
  start: number;
  end: number;
}

export interface Story {
  _id: string;
  title: string;
  description: string;
  img?: string;
  language: string;
  languageLevel: string;
  genre: string;
  totalChapters: number;
  chapters: Chapter[];
  finishedChapters?: number;
}

export interface StoryProgress {
  currentChapter: number;
  completedChapters: number[];
}

export interface WordLookup {
  lemma: string;
  translation: string;
  ipa: string;
  wordId?: string;
  audio?: string;
  inList: boolean;
  /** When the tapped word is a form of a verb. */
  grammar?: { tense: string; persons: string[] };
}

export interface NewStory {
  genre: string;
  languageLevel: string;
  totalChapters: number;
  theme?: string;
}

export const GENRES: Record<string, string> = {
  mystery: "Misterio",
  horror: "Terror",
  comedy: "Comedia",
  action: "Acción",
  adventure: "Aventura",
  romance: "Romance",
  fantasy: "Fantasía",
  "sci-fi": "Ciencia ficción",
  drama: "Drama",
  thriller: "Thriller",
  historical: "Histórica",
};

export const storiesApi = {
  list: (language: string) => api<Page<Story>>(`/api/stories?limit=50&language=${language}&sortBy=updatedAt&sortOrder=desc`),
  get: (id: string) => api<Story>(`/api/stories/${id}`),
  create: (data: NewStory) => api<Story>("/api/stories", { method: "POST", body: data }),
  remove: (id: string) => api(`/api/stories/${id}`, { method: "DELETE" }),
  /** Resolves when the chapter is saved. `onText` gets everything written so far. */
  nextChapter: (id: string, onText: (full: string) => void, idea?: string) => apiStream(`/api/stories/${id}/chapters/next`, { idea }, (_, full) => onText(full)),
  progress: (id: string) => api<StoryProgress | null>(`/api/stories/${id}/progress`),
  async finishChapter(id: string, chapterIndex: number, correct: number) {
    const { reward } = await api<{ reward: Reward | null }>(`/api/stories/${id}/progress`, { method: "POST", body: { chapterIndex, correct } });
    progress.apply(reward);
    return reward;
  },
  narrate: (id: string, chapterIndex: number) =>
    api<{ urlAudio: string; audioAlignment: WordTime[] }>(`/api/stories/${id}/chapters/${chapterIndex}/generate-audio`, { method: "POST" }),
  chat: (id: string, chapterIndex: number) => api<{ role: "user" | "assistant"; content: string }[]>(`/api/stories/${id}/chapters/${chapterIndex}/chat`),
  lookup: (word: string, sentence: string, language: string) => api<WordLookup>("/api/stories/word-lookup", { method: "POST", body: { word, sentence, language } }),
};
