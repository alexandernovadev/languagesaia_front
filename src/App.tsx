import { Toaster } from "./components";
import { useSession } from "./lib/session";
import { Catalog } from "./pages/Catalog/Catalog";
import { Login } from "./pages/Login/Login";

export default function App() {
  const session = useSession();
  return (
    <>
      {session ? <Catalog /> : <Login />}
      <Toaster />
    </>
  );
}
