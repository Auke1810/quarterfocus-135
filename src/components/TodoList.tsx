import React, { useState } from 'react';
import TaskSection from './TaskSection';
import { useTasks } from '@/hooks/useTasks';
import { useDayFocus } from '@/hooks/useDayFocus';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const DEFAULT_FOCUS = "What is your focus today? Who would you like to be? Click to change.";

const TaskInfo = ({ title, description }: { title: string; description: string }) => (
  <div className="flex items-center gap-2">
    <span>{title}</span>
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
          <Info className="h-4 w-4" />
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <p className="text-sm text-muted-foreground">{description}</p>
      </HoverCardContent>
    </HoverCard>
  </div>
);

export const TodoList = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const { dayFocus, updateDayFocus } = useDayFocus();
  
  const { 
    tasks: bigTasks, 
    loading: loadingBig,
    addTask: addBigTask,
    toggleTask: toggleBigTask,
    deleteTask: deleteBigTask
  } = useTasks('big');

  const { 
    tasks: mediumTasks, 
    loading: loadingMedium,
    addTask: addMediumTask,
    toggleTask: toggleMediumTask,
    deleteTask: deleteMediumTask
  } = useTasks('medium');

  const { 
    tasks: smallTasks, 
    loading: loadingSmall,
    addTask: addSmallTask,
    toggleTask: toggleSmallTask,
    deleteTask: deleteSmallTask
  } = useTasks('small');

  const handleFocusClick = () => {
    setEditText(dayFocus || DEFAULT_FOCUS);
    setIsEditing(true);
  };

  const handleFocusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editText.trim()) {
      await updateDayFocus(editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col">
      {isEditing ? (
        <form onSubmit={handleFocusSubmit} className="mb-3">
          <Input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="text-sm text-center italic"
            autoFocus
            onBlur={handleFocusSubmit}
          />
        </form>
      ) : (
        <p 
          className="text-sm text-gray-500 mb-3 text-center italic cursor-pointer hover:text-gray-700"
          onClick={handleFocusClick}
        >
          {dayFocus || DEFAULT_FOCUS}
        </p>
      )}
      <h3 className="text-lg font-semibold mb-2">Focus Today</h3>
      <div className="space-y-4 flex-1 overflow-y-auto">
        <section>
          <TaskSection 
            title={
              <TaskInfo 
                title="Key Focus Task (1)"
                description="One major task that has the most significant impact or is the top priority of the day."
              />
            }
            maxTasks={1} 
            tasks={bigTasks}
            onTaskAdd={addBigTask}
            onTaskToggle={toggleBigTask}
            onTaskDelete={deleteBigTask}
          />
        </section>
        <section>
          <TaskSection 
            title={
              <TaskInfo 
                title="Seconday Focus Task (3)"
                description="Up to 3 tasks, Important but not as critical as the key focus task; these contribute meaningfully to progress"
              />
            }
            maxTasks={3} 
            tasks={mediumTasks}
            onTaskAdd={addMediumTask}
            onTaskToggle={toggleMediumTask}
            onTaskDelete={deleteMediumTask}
          />
        </section>
        <section>
          <TaskSection 
            title={
              <TaskInfo 
                title="the Rest (5)"
                description="Up to 5 easier-to-complete tasks that don't require deep focus but still need to be handled."
              />
            }
            maxTasks={5} 
            tasks={smallTasks}
            onTaskAdd={addSmallTask}
            onTaskToggle={toggleSmallTask}
            onTaskDelete={deleteSmallTask}
          />
        </section>
      </div>
    </div>
  );
};
