import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "./AuthProvider";
import { Mail, CheckCircle2 } from "lucide-react";

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess("Registratie succesvol! Check je email om je account te verifiëren.");
        // Reset form
        setEmail("");
        setPassword("");
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Card className="p-6 w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <div className="text-sm text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {success}
          </div>
        )}
        <Button type="submit" className="w-full gap-2">
          <Mail className="h-4 w-4" />
          {isSignUp ? "Sign Up" : "Sign In"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setSuccess("");
          }}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </Button>
      </form>
    </Card>
  );
}
