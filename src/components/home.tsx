import React, { useState, useEffect } from "react";
import TaskSection from "./TaskSection";
import PomodoroTimer from "./PomodoroTimer";
import { Button } from "./ui/button";
import { RotateCcw } from "lucide-react";
import { Toaster } from "./ui/toaster";
import { useAuth } from "./auth/AuthProvider";
import { LoginForm } from "./auth/LoginForm";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  TaskType,
} from "@/lib/api";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface HomeProps {
  onNewDay?: () => void;
}

const Home = ({ onNewDay }: HomeProps) => {
  const { user } = useAuth();
  const [bigTasks, setBigTasks] = useState<Task[]>([]);
  const [mediumTasks, setMediumTasks] = useState<Task[]>([]);
  const [smallTasks, setSmallTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const [big, medium, small] = await Promise.all([
        getTasks("big"),
        getTasks("medium"),
        getTasks("small"),
      ]);
      setBigTasks(big || []);
      setMediumTasks(medium || []);
      setSmallTasks(small || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const handleNewDay = () => {
    if (onNewDay) {
      onNewDay();
    } else {
      setBigTasks([]);
      setMediumTasks([]);
      setSmallTasks([]);
    }
  };

  const handleAddTask = async (text: string, type: TaskType) => {
    try {
      const newTask = await createTask(text, type);
      switch (type) {
        case "big":
          setBigTasks([...bigTasks, newTask]);
          break;
        case "medium":
          setMediumTasks([...mediumTasks, newTask]);
          break;
        case "small":
          setSmallTasks([...smallTasks, newTask]);
          break;
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (id: string, type: TaskType) => {
    try {
      const task = await updateTask(id, { completed: true });
      switch (type) {
        case "big":
          setBigTasks(bigTasks.map((t) => (t.id === id ? task : t)));
          break;
        case "medium":
          setMediumTasks(mediumTasks.map((t) => (t.id === id ? task : t)));
          break;
        case "small":
          setSmallTasks(smallTasks.map((t) => (t.id === id ? task : t)));
          break;
      }
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const handleDeleteTask = async (id: string, type: TaskType) => {
    try {
      await deleteTask(id);
      switch (type) {
        case "big":
          setBigTasks(bigTasks.filter((t) => t.id !== id));
          break;
        case "medium":
          setMediumTasks(mediumTasks.filter((t) => t.id !== id));
          break;
        case "small":
          setSmallTasks(smallTasks.filter((t) => t.id !== id));
          break;
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-50 p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              1-3-5 Todo List
            </h1>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNewDay}
              className="h-8 w-8"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <PomodoroTimer
            workTime={50}
            breakTime={10}
            onTimerComplete={() => console.log("Timer complete")}
          />

          <TaskSection
            title="Big Task (1)"
            maxTasks={1}
            tasks={bigTasks}
            onTaskAdd={(text) => handleAddTask(text, "big")}
            onTaskToggle={(id) => handleToggleTask(id, "big")}
            onTaskDelete={(id) => handleDeleteTask(id, "big")}
          />

          <TaskSection
            title="Medium Tasks (3)"
            maxTasks={3}
            tasks={mediumTasks}
            onTaskAdd={(text) => handleAddTask(text, "medium")}
            onTaskToggle={(id) => handleToggleTask(id, "medium")}
            onTaskDelete={(id) => handleDeleteTask(id, "medium")}
          />

          <TaskSection
            title="Small Tasks (5)"
            maxTasks={5}
            tasks={smallTasks}
            onTaskAdd={(text) => handleAddTask(text, "small")}
            onTaskToggle={(id) => handleToggleTask(id, "small")}
            onTaskDelete={(id) => handleDeleteTask(id, "small")}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Home;
