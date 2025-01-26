import { Toaster } from "sonner";
import { AuthProvider } from "./components/auth/AuthProvider";
import TodoPanel from "./components/TodoPanel";
import { useScreenSize } from "./hooks/useScreenSize";
import { LoginButton } from "./components/auth/LoginButton";
import qfLogo from "@/assets/qflogo.svg";

function App() {
  const { width, height } = useScreenSize();

  return (
    <AuthProvider>
      <div 
        className="bg-background text-foreground flex flex-col" 
        style={{ 
          width: `${width}px`,
          height: `${height}px`,
          transition: 'width 0.2s, height 0.2s'
        }}
      >
        <header className="px-4 py-2 border-b flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <img src={qfLogo} alt="Quarter Focus Logo" className="h-6 w-6" />
            <h2 className="text-lg font-semibold">Quarter Focus</h2>
          </div>
          <LoginButton />
        </header>
        
        <main className="flex-1 overflow-y-auto p-4">
          <TodoPanel />
        </main>
        
        <Toaster richColors />
      </div>
    </AuthProvider>
  );
}

export default App;
