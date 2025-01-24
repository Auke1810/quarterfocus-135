import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ListTodo } from "lucide-react";
import Home from "./home";
import { LoginButton } from "./auth/LoginButton";
import { useAuth } from "./auth/AuthProvider";

const TodoPanel = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed right-4 top-4 z-50"
        >
          <ListTodo className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="px-4 py-2 border-b flex justify-between items-center">
          <SheetTitle>Quarter Focus 1-3-5</SheetTitle>
          <LoginButton />
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <Home />
        </div>
        <SheetDescription className="sr-only">
          A panel containing your 1-3-5 todo list and task management tools
        </SheetDescription>
      </SheetContent>
    </Sheet>
  );
};

export default TodoPanel;
