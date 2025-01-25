import React, { useEffect } from "react";
import { LoginButton } from "./auth/LoginButton";
import { TodoList } from "./TodoList";
import qfLogo from "@/assets/qflogo.svg";

const TodoPanel = () => {
  useEffect(() => {
    console.log('TodoPanel component mounted');
  }, []);

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 py-2 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src={qfLogo} alt="Quarter Focus Logo" className="h-6 w-6" />
          <h2 className="text-lg font-semibold">Quarter Focus</h2>
        </div>
        <LoginButton />
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <TodoList />
      </div>
    </div>
  );
};

export default TodoPanel;
