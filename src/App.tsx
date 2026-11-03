import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { AppShell } from "./app/AppShell";
import { MODULES } from "./app/modules";
import { Toaster } from "./components";
import { useSession } from "./lib/session";
import { Catalog } from "./pages/Catalog/Catalog";
import { Home } from "./pages/Home/Home";
import { Login } from "./pages/Login/Login";
import { Profile } from "./pages/Profile/Profile";
import { Soon } from "./pages/Soon/Soon";
import { WordDetail } from "./features/words/WordDetail";
import { WordsList } from "./features/words/WordsList";
import { Review } from "./features/review/Review";

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <Home /> },
      { path: MODULES.words.path, element: <WordsList /> },
      { path: `${MODULES.words.path}/:id`, element: <WordDetail /> },
      { path: MODULES.expressions.path, element: <Soon module={MODULES.expressions} /> },
      { path: MODULES.review.path, element: <Review /> },
      { path: MODULES.stories.path, element: <Soon module={MODULES.stories} /> },
      { path: MODULES.exams.path, element: <Soon module={MODULES.exams} /> },
      { path: MODULES.profile.path, element: <Profile /> },
    ],
  },
  { path: "/catalogo", element: <Catalog /> },
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
