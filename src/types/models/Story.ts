import { CertificationLevel, StoryGenre, Language } from "../business";

export interface IChapter {
  order: number;
  title: string;
  content: string;
  urlAudio?: string;
  audioRecordId?: string;
  voice?: string;
  targetVocabulary?: string[];
  targetGrammar?: string[];
  createdAt?: Date;
}

export interface IStory {
  _id: string;
  title: string;
  description: string;
  img: string;
  languageLevel: CertificationLevel;
  language: Language;
  genre: StoryGenre;
  chapters: IChapter[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStoryProgress {
  _id?: string;
  userId: string;
  storyId: string;
  currentChapter: number;
  completedChapters: number[];
  lastReadAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VocabReport {
  word: string;
  count: number;
  chapters: number[];
}
