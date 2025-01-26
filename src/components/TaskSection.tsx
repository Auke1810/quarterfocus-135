import React, { useState, useEffect } from "react";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus } from "lucide-react";
import pomoStartIcon from "@/assets/pomostart.svg";
import notesIcon from "@/assets/notes.svg";
import trashIcon from "@/assets/Trash.svg";
import PomodoroTimer from "./PomodoroTimer";
import { Textarea } from "./ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { updateTaskInfo, getTaskInfo } from "@/lib/api";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  pomodoroCount?: number;
  info?: string;
}

interface TaskSectionProps {
  title?: React.ReactNode;
  maxTasks?: number;
  tasks?: Task[];
  onTaskAdd?: (text: string) => void;
  onTaskToggle?: (id: string, completed: boolean) => void;
  onTaskDelete?: (id: string) => void;
}

const TaskSection = ({
  title = "Tasks",
  maxTasks = 5,
  tasks: initialTasks = [],
  onTaskAdd,
  onTaskToggle,
  onTaskDelete,
}: TaskSectionProps) => {
  const [newTask, setNewTask] = useState("");
  const [activePomodoro, setActivePomodoro] = useState<string | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskInfo, setTaskInfo] = useState<string>("");
  const [showingInfoFor, setShowingInfoFor] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Update lokale tasks state wanneer props veranderen
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

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

  const handleTaskClick = async (taskId: string) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
      setTaskInfo("");
    } else {
      const info = await getTaskInfo(taskId);
      setTaskInfo(info || "");
      setExpandedTask(taskId);
    }
  };

  const handleSaveInfo = async (taskId: string) => {
    await updateTaskInfo(taskId, taskInfo);
    // Update de task.info in de lokale state zonder de completed status te wijzigen
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, info: taskInfo } : task
      )
    );
    setExpandedTask(null);
  };

  const handleInfoClick = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (showingInfoFor === taskId) {
      setShowingInfoFor(null);
    } else {
      const info = await getTaskInfo(taskId);
      if (info) {
        setShowingInfoFor(taskId);
      }
    }
  };

  const handleSubtaskToggle = async (taskId: string, lineIndex: number, currentLine: string) => {
    const info = await getTaskInfo(taskId);
    if (!info) return;

    const lines = info.split('\n');
    const isCompleted = currentLine.startsWith('- ');
    lines[lineIndex] = isCompleted ? 
      currentLine.replace('- ', 'x ') : 
      currentLine.replace('x ', '- ');

    const newInfo = lines.join('\n');
    await updateTaskInfo(taskId, newInfo);

    // Update de task.info in de lokale state
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, info: newInfo } : task
      )
    );
  };

  const renderInfo = (taskId: string, info: string) => {
    return info.split('\n').map((line, index) => {
      if (line.startsWith('- ') || line.startsWith('x ')) {
        const isCompleted = line.startsWith('x ');
        return (
          <div key={index} className="flex items-center gap-2 ml-2">
            <Checkbox 
              checked={isCompleted}
              onCheckedChange={() => handleSubtaskToggle(taskId, index, line)}
            />
            <span className={`text-gray-500 ${isCompleted ? 'line-through' : ''}`}>
              {line.substring(2)}
            </span>
          </div>
        );
      }
      return (
        <div key={index} className="text-gray-500 text-left">
          {line}
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
      </div>

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

        <div className="space-y-1">
          {tasks.map((task) => (
            <Collapsible
              key={task.id}
              open={expandedTask === task.id}
              onOpenChange={() => handleTaskClick(task.id)}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between hover:bg-gray-50 rounded-md">
                  <div className="flex items-center gap-2 flex-1">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => onTaskToggle?.(task.id, task.completed)}
                      id={task.id}
                    />
                    <img
                      src={pomoStartIcon}
                      alt="Start Pomodoro"
                      className={`w-4 h-4 cursor-pointer hover:opacity-80 ${
                        activePomodoro === task.id ? "opacity-50" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePomodoroStart(task.id);
                      }}
                    />
                    <CollapsibleTrigger asChild>
                      <div
                        className={`flex-1 cursor-pointer ${
                          task.completed ? "line-through text-gray-500" : ""
                        }`}
                      >
                        {task.text}
                        {task.pomodoroCount !== undefined && task.pomodoroCount > 0 && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({task.pomodoroCount} 🍅)
                          </span>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    {task.info && (
                      <img 
                        src={notesIcon} 
                        alt="Has notes" 
                        className="h-4 w-4 opacity-60 cursor-pointer hover:opacity-100"
                        onClick={(e) => handleInfoClick(task.id, e)}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskDelete?.(task.id);
                      }}
                      className="h-8 w-8"
                    >
                      <img src={trashIcon} alt="Delete" className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {showingInfoFor === task.id && task.info && (
                  <div className="px-6 pb-1 text-left">
                    {renderInfo(task.id, task.info)}
                  </div>
                )}
              </div>

              <CollapsibleContent className="px-2 py-2">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add task information..."
                    value={taskInfo}
                    onChange={(e) => setTaskInfo(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveInfo(task.id)}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Save changes
                    </Button>
                    <Button
                      onClick={() => {
                        setExpandedTask(null);
                        setTaskInfo("");
                      }}
                      className="flex-1"
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
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
