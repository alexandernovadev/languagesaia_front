import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import DashboardLayout from "./shared/components/layouts/DashboardLayout";
import LoadingSpinner from "./shared/components/LoadingSpinner";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { toast } from "sonner";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { Toaster } from "./shared/components/ui/sonner";

// Importar todas las rutas lazy load
import {
  DashboardPage,
  LecturesPage,
  LectureDetailPage,
  AnkiGamePage,
  LectureGeneratorPage,
  SettingsPage,
  ImportSettingsPage,
  ExportSettingsPage,
  SystemInfoPage,
  SettingsIndexRedirect,
  AIConfigPage,
  WordsPage,
  ExpressionsPage,
  ProfilePage,
  LabsPage,
  UsersPage,
  LoginPage,
  PronunciationGuidePage,
  GrammarPage,
  ExamsPage,
  ExamGeneratorPage,
  ExamStartPage,
  ExamAttemptPage,
  ExamAttemptsHistoryPage,
} from "./routes";

// Componente para manejar rutas desconocidas
function NotFoundRedirect() {
  // Mostrar toast cuando se ejecute este componente
  useEffect(() => {
    toast.error("Página no encontrada", {
      description: "Has sido redirigido a la página principal",
    });
  }, []);

  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes>
          {/* Ruta pública de login (sin DashboardLayout) */}
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas con DashboardLayout */}
          <Route
            path="/*"
            element={
              <DashboardLayout>
                <Routes>
                  {/* Rutas protegidas */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lectures"
                    element={
                      <ProtectedRoute>
                        <LecturesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/lectures/:id"
                    element={
                      <ProtectedRoute>
                        <LectureDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/games/anki"
                    element={
                      <ProtectedRoute>
                        <AnkiGamePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/generator/lecture"
                    element={
                      <ProtectedRoute>
                        <LectureGeneratorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams"
                    element={
                      <ProtectedRoute>
                        <ExamsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams/generator"
                    element={
                      <ProtectedRoute>
                        <ExamGeneratorPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams/:id/start"
                    element={
                      <ProtectedRoute>
                        <ExamStartPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams/:id/attempt/:attemptId"
                    element={
                      <ProtectedRoute>
                        <ExamAttemptPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/exams/:id/attempts/:attemptId?"
                    element={
                      <ProtectedRoute>
                        <ExamAttemptsHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  {/* Labs es PÚBLICA - ruta independiente */}
                  <Route path="/settings/labs" element={<LabsPage />} />

                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<SettingsIndexRedirect />} />
                    <Route path="import" element={<ImportSettingsPage />} />
                    <Route path="export" element={<ExportSettingsPage />} />
                    <Route path="system" element={<SystemInfoPage />} />
                    <Route path="ai-config" element={<AIConfigPage />} />
                  </Route>

                  <Route
                    path="/words"
                    element={
                      <ProtectedRoute>
                        <WordsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-words"
                    element={
                      <ProtectedRoute>
                        <WordsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/expressions"
                    element={
                      <ProtectedRoute>
                        <ExpressionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-expressions"
                    element={
                      <ProtectedRoute>
                        <ExpressionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/pronunciation"
                    element={
                      <ProtectedRoute>
                        <PronunciationGuidePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/grammar"
                    element={
                      <ProtectedRoute>
                        <GrammarPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all route para rutas desconocidas */}
                  <Route path="*" element={<NotFoundRedirect />} />
                </Routes>
              </DashboardLayout>
            }
          />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
