import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";
import { Github } from "lucide-react";

export function LoginButton() {
  const { user, signIn, signOut } = useAuth();

  return user ? (
    <Button variant="outline" onClick={signOut} className="gap-2">
      <Github className="h-4 w-4" />
      Sign Out
    </Button>
  ) : (
    <Button variant="outline" onClick={signIn} className="gap-2">
      <Github className="h-4 w-4" />
      Sign in with GitHub
    </Button>
  );
}
