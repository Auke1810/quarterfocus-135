import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import profileIcon from "@/assets/profile.svg";

export function LoginButton() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const handleSync = () => {
    // TODO: Implementeer echte synchronisatie
    toast.success("Synchronisatie gestart");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <img src={profileIcon} alt="Profile" className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {user ? (
            <>
              <DropdownMenuItem>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSync}>
                Nu synchroniseren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                Logout
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onSelect={() => setOpen(true)}>
              Inloggen / Inschrijven
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In</DialogTitle>
            <DialogDescription>
              Log in om toegang te krijgen tot je taken en instellingen.
            </DialogDescription>
          </DialogHeader>
          <LoginForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}