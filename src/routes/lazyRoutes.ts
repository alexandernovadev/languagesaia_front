import { lazy } from "react";

// Lazy load de todas las páginas
export const AnkiGamePage = lazy(() => import("../pages/AnkiGamePage"));
export const SettingsPage = lazy(() => import("../pages/SettingsPage"));
export const ImportSettingsPage = lazy(() => import("../pages/ImportSettingsPage"));
export const ExportSettingsPage = lazy(() => import("../pages/ExportSettingsPage"));
export const SystemInfoPage = lazy(() => import("../pages/SystemInfoPage"));
export const SettingsIndexRedirect = lazy(() => import("../pages/SettingsIndexRedirect"));
export const AIConfigPage = lazy(() => import("../pages/AIConfigPage"));
export const WordsPage = lazy(() => import("../pages/WordsPage"));
export const ExpressionsPage = lazy(() => import("../pages/ExpressionsPage"));
export const ProfilePage = lazy(() => import("../pages/ProfilePage"));
export const LabsPage = lazy(() => import("../pages/LabsPage"));
export const UsersPage = lazy(() => import("../pages/UsersPage"));
export const LoginPage = lazy(() => import("../pages/LoginPage"));
export const ExamsPage = lazy(() => import("../pages/ExamsPage"));
export const ExamGeneratorPage = lazy(() => import("../pages/ExamGeneratorPage"));
export const ExamStartPage = lazy(() => import("../pages/ExamStartPage"));
export const ExamAttemptPage = lazy(() => import("../pages/ExamAttemptPage"));
export const ExamAttemptsHistoryPage = lazy(() => import("../pages/ExamAttemptsHistoryPage"));

// Story routes
export const StoriesPage = lazy(() => import("../pages/StoriesPage"));
export const StoryDetailPage = lazy(() => import("../pages/StoryDetailPage"));
export const StoryEditorPage = lazy(() => import("../pages/StoryEditorPage"));
export const ChapterReaderPage = lazy(() => import("../pages/ChapterReaderPage"));