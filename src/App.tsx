import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import TodoPanel from "./components/TodoPanel";
import routes from "tempo-routes";
import { AuthProvider } from "./components/auth/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<TodoPanel />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
