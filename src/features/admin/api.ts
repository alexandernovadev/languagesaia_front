/** Admin panel — backend calls. Everything here needs the admin role. */
import { api } from "../../lib/api";

export interface BackupRun {
  _id: string;
  success: boolean;
  wordsCount: number;
  expressionsCount: number;
  error?: string;
  createdAt: string;
}

export interface BackupStatus {
  words: { total: number; byLanguage: Array<{ language: string; count: number }> };
  expressions: { total: number };
  automatic: { active: boolean; nextRun?: string; timezone: string };
  recipient: string | null;
  runs: BackupRun[];
}

export interface SystemInfo {
  server: { environment: string; version: string; buildDate: string | null; node: string; uptimeSeconds: number; memoryMb: number };
  database: { online: boolean; host: string | null; name: string | null; sizeMb: number | null; collections: Array<{ name: string; count: number }> };
  ai: {
    usingFallback: boolean;
    fallbackUntil: string | null;
    text: { provider: string; model: string; fallback: string };
    image: { provider: string; model: string };
    audio: { provider: string; model: string };
  };
  integrations: Array<{ name: string; purpose: string; configured: boolean }>;
  errors: Array<{ time: string; message: string }>;
}

export type DeletableData = "words" | "expressions" | "lessons" | "exercises" | "stories";

export type DataKind = "words" | "expressions";
export type DuplicateStrategy = "skip" | "overwrite";

interface ImportFailure {
  index: number;
  label: string;
  error: string;
}

/** What an import would do. Nothing has changed yet. */
export interface ImportPreview {
  total: number;
  new: number;
  duplicates: number;
  invalid: number;
  failures: ImportFailure[];
}

export interface ImportOutcome {
  totalInserted: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  /** Words only: expressions report these as errors. */
  totalInvalid?: number;
  failures: ImportFailure[];
}

const upload = <T>(kind: DataKind, file: File, query: string) => {
  const body = new FormData();
  // the backend only takes application/json, whatever the browser guessed
  body.append("file", new File([file], file.name, { type: "application/json" }));
  return api<T>(`/api/${kind}/import-file?${query}`, { method: "POST", body });
};

export const adminApi = {
  dataCounts: () => api<Record<DeletableData, number>>("/api/labs/data/counts"),
  deleteAll: (what: DeletableData) => api<{ deletedCount: number }>(`/api/labs/data/${what}/delete-all`, { method: "DELETE" }),
  system: () => api<SystemInfo>("/api/labs/system"),
  backupStatus: () => api<BackupStatus>("/api/labs/backup/status"),
  sendBackup: () => api<{ wordsCount: number; expressionsCount: number }>("/api/labs/backup/send-email", { method: "POST" }),
  /** Wrapped as `{ data }` these are the shapes `/import-file` accepts, so the files can be restored. */
  exportWords: () => api<{ totalWords: number; exportDate: string; words: unknown[] }>("/api/words/export-file"),
  exportExpressions: () => api<{ totalExpressions: number; exportDate: string; expressions: unknown[] }>("/api/expressions/export-file"),
  previewImport: (kind: DataKind, file: File) => upload<ImportPreview>(kind, file, "validateOnly=true"),
  runImport: (kind: DataKind, file: File, strategy: DuplicateStrategy) => upload<ImportOutcome>(kind, file, `duplicateStrategy=${strategy}`),
};
