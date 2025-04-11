import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { UserPreferences } from "@/components/UserPreferences";
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
import { syncAll } from "@/lib/sync";

export function LoginButton() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const handleSync = async () => {
    toast.loading("Synchronizing...");
    await syncAll();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <img src={profileIcon} alt="Profile" className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-lg overflow-hidden">
          {user ? (
            <>
              <DropdownMenuItem onSelect={() => setPreferencesOpen(true)}>
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSync}>
                Sync now
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

      <UserPreferences
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
      />
    </>
  );
}