/** Stories — types and backend calls for the Historias module (Tula). */
import { api, apiStream } from "../../lib/api";
import { progress, type Reward } from "../../lib/progress";
import type { Page } from "../words/api";

export interface Question {
  question: string;
  options: string[];
  answer: number;
}

export interface Chapter {
  order: number;
  title: string;
  content: string;
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
  nextChapter: (id: string, onText: (full: string) => void) => apiStream(`/api/stories/${id}/chapters/next`, {}, (_, full) => onText(full)),
  progress: (id: string) => api<StoryProgress | null>(`/api/stories/${id}/progress`),
  async finishChapter(id: string, chapterIndex: number, correct: number) {
    const { reward } = await api<{ reward: Reward | null }>(`/api/stories/${id}/progress`, { method: "POST", body: { chapterIndex, correct } });
    progress.apply(reward);
    return reward;
  },
  narrate: (id: string, chapterIndex: number) =>
    api<{ urlAudio: string; audioAlignment: WordTime[] }>(`/api/stories/${id}/chapters/${chapterIndex}/generate-audio`, { method: "POST" }),
  lookup: (word: string, sentence: string, language: string) => api<WordLookup>("/api/stories/word-lookup", { method: "POST", body: { word, sentence, language } }),
};
