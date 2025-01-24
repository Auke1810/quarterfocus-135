import React, { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, X } from "lucide-react";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskSectionProps {
  title?: string;
  maxTasks?: number;
  tasks?: Task[];
  onTaskAdd?: (task: string) => void;
  onTaskToggle?: (taskId: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

const TaskSection = ({
  title = "Tasks",
  maxTasks = 5,
  tasks: propTasks,
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
}: TaskSectionProps) => {
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>(
    propTasks || [
      { id: "1", text: "Sample task 1", completed: false },
      { id: "2", text: "Sample task 2", completed: true },
    ],
  );

  const handleAddTask = () => {
    if (newTask.trim() && tasks.length < maxTasks) {
      const task = {
        id: Date.now().toString(),
        text: newTask.trim(),
        completed: false,
      };
      if (onTaskAdd) {
        onTaskAdd(newTask);
      } else {
        setTasks([...tasks, task]);
      }
      setNewTask("");
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (onTaskToggle) {
      onTaskToggle(taskId);
    } else {
      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task,
        ),
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (onTaskDelete) {
      onTaskDelete(taskId);
    } else {
      setTasks(tasks.filter((task) => task.id !== taskId));
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded-md"
          >
            <div className="flex items-center gap-2 flex-1">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleTask(task.id)}
                id={task.id}
              />
              <label
                htmlFor={task.id}
                className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""}`}
              >
                {task.text}
              </label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteTask(task.id)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {tasks.length < maxTasks && (
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Add new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1"
          />
          <Button onClick={handleAddTask} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-500">
        {tasks.length}/{maxTasks} tasks
      </div>
    </div>
  );
};

export default TaskSection;
