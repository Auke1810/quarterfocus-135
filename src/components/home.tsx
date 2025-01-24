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
          setBigTasks((prev) => [...prev, newTask]);
          break;
        case "medium":
          setMediumTasks((prev) => [...prev, newTask]);
          break;
        case "small":
          setSmallTasks((prev) => [...prev, newTask]);
          break;
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleToggleTask = async (id: string, type: TaskType) => {
    try {
      // Vind eerst de huidige status van de taak
      let currentTask;
      switch (type) {
        case "big":
          currentTask = bigTasks.find(t => t.id === id);
          break;
        case "medium":
          currentTask = mediumTasks.find(t => t.id === id);
          break;
        case "small":
          currentTask = smallTasks.find(t => t.id === id);
          break;
      }

      if (!currentTask) return;

      // Toggle de completed status
      const task = await updateTask(id, { completed: !currentTask.completed });
      
      // Update de juiste lijst met taken
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
      <div className="flex justify-center items-center h-full">
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Today's Tasks</h2>
        <Button variant="outline" size="icon" onClick={handleNewDay}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6">
        <TaskSection
          title="Key Focus Task"
          tasks={bigTasks}
          maxTasks={1}
          onTaskAdd={(text) => handleAddTask(text, "big")}
          onTaskToggle={(id) => handleToggleTask(id, "big")}
          onTaskDelete={(id) => handleDeleteTask(id, "big")}
        />
        <TaskSection
          title="Secondary Focus Tasks (3)"
          tasks={mediumTasks}
          maxTasks={3}
          onTaskAdd={(text) => handleAddTask(text, "medium")}
          onTaskToggle={(id) => handleToggleTask(id, "medium")}
          onTaskDelete={(id) => handleDeleteTask(id, "medium")}
        />
        <TaskSection
          title="The Rest (5)"
          tasks={smallTasks}
          maxTasks={5}
          onTaskAdd={(text) => handleAddTask(text, "small")}
          onTaskToggle={(id) => handleToggleTask(id, "small")}
          onTaskDelete={(id) => handleDeleteTask(id, "small")}
        />
      </div>
      <Toaster />
    </div>
  );
};

export default Home;
