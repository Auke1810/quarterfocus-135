import { useEffect } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";
import TodoPanel from "./components/TodoPanel";

function App() {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <AuthProvider>
      <div className="w-[400px] h-[600px] bg-white">
        <TodoPanel />
      </div>
    </AuthProvider>
  );
}

export default App;
