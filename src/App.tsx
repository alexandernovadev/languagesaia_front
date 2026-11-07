import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppShell } from "./app/AppShell";
import { MODULES } from "./app/modules";
import { ErrorDialog, Toaster } from "./components";
import { useSession } from "./lib/session";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";

/* Each section is its own download, fetched the first time you open it. */
const Profile = lazy(() => import("./pages/Profile/Profile").then((m) => ({ default: m.Profile })));
const WordDetail = lazy(() => import("./features/words/WordDetail").then((m) => ({ default: m.WordDetail })));
const WordsList = lazy(() => import("./features/words/WordsList").then((m) => ({ default: m.WordsList })));
const Review = lazy(() => import("./features/review/Review").then((m) => ({ default: m.Review })));
const ExpressionDetail = lazy(() => import("./features/expressions/ExpressionDetail").then((m) => ({ default: m.ExpressionDetail })));
const ExpressionsList = lazy(() => import("./features/expressions/ExpressionsList").then((m) => ({ default: m.ExpressionsList })));
const StoriesList = lazy(() => import("./features/stories/StoriesList").then((m) => ({ default: m.StoriesList })));
const StoryReader = lazy(() => import("./features/stories/StoryReader").then((m) => ({ default: m.StoryReader })));
const Lessons = lazy(() => import("./features/lessons/Lessons").then((m) => ({ default: m.Lessons })));

const AdminLayout = lazy(() => import("./features/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminSystem = lazy(() => import("./features/admin/AdminSystem").then((m) => ({ default: m.AdminSystem })));
const AdminBackups = lazy(() => import("./features/admin/AdminBackups").then((m) => ({ default: m.AdminBackups })));
const AdminDelete = lazy(() => import("./features/admin/AdminDelete").then((m) => ({ default: m.AdminDelete })));
const AdminDictionary = lazy(() => import("./features/admin/AdminDictionary").then((m) => ({ default: m.AdminDictionary })));
const AdminDictionaryCard = lazy(() => import("./features/admin/AdminDictionaryCard").then((m) => ({ default: m.AdminDictionaryCard })));
const AdminDictionaryWord = lazy(() => import("./features/admin/AdminDictionaryWord").then((m) => ({ default: m.AdminDictionaryWord })));
const AdminData = lazy(() => import("./features/admin/AdminData").then((m) => ({ default: m.AdminData })));

/* Design system showcase: development only, it never ships to production. */
const Catalog = import.meta.env.DEV ? lazy(() => import("./pages/Catalog/Catalog").then((m) => ({ default: m.Catalog }))) : null;

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: MODULES.words.path, element: <WordsList /> },
      { path: `${MODULES.words.path}/:id`, element: <WordDetail /> },
      { path: MODULES.expressions.path, element: <ExpressionsList /> },
      { path: `${MODULES.expressions.path}/:id`, element: <ExpressionDetail /> },
      { path: MODULES.review.path, element: <Review /> },
      { path: MODULES.stories.path, element: <StoriesList /> },
      { path: `${MODULES.stories.path}/:id`, element: <StoryReader /> },
      { path: MODULES.lessons.path, element: <Lessons /> },
      { path: MODULES.profile.path, element: <Profile /> },
    ],
  },
  {
    path: "/admin",
    element: <Suspense fallback={null}><AdminLayout /></Suspense>,
    children: [
      { index: true, element: <Navigate to="sistema" replace /> },
      { path: "sistema", element: <AdminSystem /> },
      { path: "diccionario", element: <AdminDictionary /> },
      { path: "diccionario/nueva", element: <AdminDictionaryWord /> },
      { path: "diccionario/:id", element: <AdminDictionaryCard /> },
      { path: "diccionario/:id/editar", element: <AdminDictionaryWord /> },
      { path: "backups", element: <AdminBackups /> },
      { path: "datos", element: <AdminData /> },
      { path: "borrado", element: <AdminDelete /> },
    ],
  },
  ...(Catalog ? [{ path: "/catalogo", element: <Suspense fallback={null}><Catalog /></Suspense> }] : []),
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default function App() {
  const session = useSession();
  return (
    <>
      {session ? <RouterProvider router={router} /> : <Login />}
      <Toaster />
      <ErrorDialog />
    </>
  );
}
