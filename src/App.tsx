import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppShell } from "./app/AppShell";
import { MODULES } from "./app/modules";
import { Toaster } from "./components";
import { useSession } from "./lib/session";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";

/* Each section is its own download, fetched the first time you open it. */
const Profile = lazy(() => import("./pages/Profile/Profile").then((m) => ({ default: m.Profile })));
const Soon = lazy(() => import("./pages/Soon/Soon").then((m) => ({ default: m.Soon })));
const WordDetail = lazy(() => import("./features/words/WordDetail").then((m) => ({ default: m.WordDetail })));
const WordsList = lazy(() => import("./features/words/WordsList").then((m) => ({ default: m.WordsList })));
const Review = lazy(() => import("./features/review/Review").then((m) => ({ default: m.Review })));
const ExpressionDetail = lazy(() => import("./features/expressions/ExpressionDetail").then((m) => ({ default: m.ExpressionDetail })));
const ExpressionsList = lazy(() => import("./features/expressions/ExpressionsList").then((m) => ({ default: m.ExpressionsList })));
const Exams = lazy(() => import("./features/exams/Exams").then((m) => ({ default: m.Exams })));

const AdminLayout = lazy(() => import("./features/admin/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminSystem = lazy(() => import("./features/admin/AdminSystem").then((m) => ({ default: m.AdminSystem })));
const AdminBackups = lazy(() => import("./features/admin/AdminBackups").then((m) => ({ default: m.AdminBackups })));
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
      { path: MODULES.stories.path, element: <Soon module={MODULES.stories} /> },
      { path: MODULES.exams.path, element: <Exams /> },
      { path: MODULES.profile.path, element: <Profile /> },
    ],
  },
  {
    path: "/admin",
    element: <Suspense fallback={null}><AdminLayout /></Suspense>,
    children: [
      { index: true, element: <Navigate to="sistema" replace /> },
      { path: "sistema", element: <AdminSystem /> },
      { path: "backups", element: <AdminBackups /> },
      { path: "datos", element: <AdminData /> },
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
    </>
  );
}
