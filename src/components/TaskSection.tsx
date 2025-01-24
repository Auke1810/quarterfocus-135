import React, { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash } from "lucide-react";
import pomoStartIcon from "@/assets/pomostart.svg";
import PomodoroTimer from "./PomodoroTimer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodoroCount?: number;
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
  tasks = [],
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
}: TaskSectionProps) => {
  const [newTask, setNewTask] = useState("");
  const [activePomodoro, setActivePomodoro] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);

  const handleAddTask = () => {
    if (newTask.trim() && tasks.length < maxTasks) {
      if (onTaskAdd) {
        onTaskAdd(newTask.trim());
        setNewTask("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const handlePomodoroStart = (taskId: string) => {
    if (activePomodoro === taskId && showTimer) {
      setShowTimer(false);
      setActivePomodoro(null);
    } else {
      setActivePomodoro(taskId);
      setShowTimer(true);
    }
  };

  const handlePomodoroStop = () => {
    setShowTimer(false);
    setActivePomodoro(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <Collapsible open={showTimer} onOpenChange={setShowTimer}>
        <CollapsibleContent className="mb-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Pomodoro Timer</h4>
            <PomodoroTimer
              workTime={50}
              breakTime={10}
              taskId={activePomodoro}
              onTimerComplete={() => setShowTimer(false)}
              onTimerStop={handlePomodoroStop}
              autoStart={true}
            />
          </div>
        </CollapsibleContent>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded-md"
            >
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => onTaskToggle?.(task.id)}
                  id={task.id}
                />
                <CollapsibleTrigger asChild>
                  <img
                    src={pomoStartIcon}
                    alt="Start Pomodoro"
                    className={`w-4 h-4 cursor-pointer hover:opacity-80 ${
                      activePomodoro === task.id ? "opacity-50" : ""
                    }`}
                    onClick={() => handlePomodoroStart(task.id)}
                  />
                </CollapsibleTrigger>
                <label
                  htmlFor={task.id}
                  className={`flex-1 ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.text}
                  {task.pomodoroCount !== undefined && task.pomodoroCount > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({task.pomodoroCount} 🍅)
                    </span>
                  )}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onTaskDelete?.(task.id)}
                className="h-8 w-8"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {tasks.length < maxTasks && (
            <div className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleAddTask}
                disabled={!newTask.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  );
};

export default TaskSection;
