import React, { useState, KeyboardEvent } from 'react';
import { Task, TaskType, parseTaskInfo } from '@/types/task';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableTaskItem } from '../SortableTaskItem';
import infoIcon from '@/assets/info.svg';
import infoFocusIcon from '@/assets/info-focus.svg';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DayTaskViewProps {
  dayIndex: number;
  tasks: Task[];
  onAddTask: (type: TaskType, text: string) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  variant?: 'default' | 'week';
}

interface TaskContainerProps {
  id: string;
  title: string;
  maxTasks: number;
  tasks: Task[];
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  variant?: 'default' | 'week';
}

const TaskContainer: React.FC<TaskContainerProps> = ({
  id,
  title,
  maxTasks,
  tasks,
  onUpdateTask,
  onDeleteTask,
  variant = 'default'
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className="bg-gray-50 p-2 rounded-lg transition-colors"
      style={{ minHeight: '4rem' }}
    >
      <div className="flex justify-between items-center text-xs font-medium text-gray-500 mb-2">
        <span>{title} (max {maxTasks})</span>
        {variant === 'default' && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <img
                  src={infoIcon}
                  alt="Info"
                  onMouseEnter={(e) => e.currentTarget.src = infoFocusIcon}
                  onMouseLeave={(e) => e.currentTarget.src = infoIcon}
                  className="w-4 h-4 cursor-help"
                />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                {title === "Key Focus task" && (
                  <p>This is your most important task for today. Focus on completing this before moving on to other tasks.</p>
                )}
                {title === "Secondary Focus tasks" && (
                  <p>These are your secondary tasks. Start working on these after completing your Key Focus task.</p>
                )}
                {title === "the Rest tasks" && (
                  <p>These tasks can be picked up if there's time left, or delegated/planned for another day.</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <SortableTaskItem
            key={task.id}
            task={parseTaskInfo(task)}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            variant={variant}
          />
        ))}
      </SortableContext>
    </div>
  );
};

export const DayTaskView: React.FC<DayTaskViewProps> = ({
  dayIndex,
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  variant = 'default'
}) => {
  const [newTaskText, setNewTaskText] = useState('');
  
  const bigTasks = tasks.filter(task => task.task_type === 'big');
  const mediumTasks = tasks.filter(task => task.task_type === 'medium');
  const smallTasks = tasks.filter(task => task.task_type === 'small');

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTaskText.trim()) {
      await handleAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleAddTask = async (text: string) => {
    const type = bigTasks.length === 0 ? 'big' :
                mediumTasks.length < 3 ? 'medium' :
                smallTasks.length < 5 ? 'small' : null;
                
    if (type) {
      await onAddTask(type, text);
    }
  };

  const canAddMoreTasks = bigTasks.length < 1 || 
                         mediumTasks.length < 3 || 
                         smallTasks.length < 5;

  return (
    <div className="space-y-3">
      {canAddMoreTasks && (
        <div className="relative">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="+ Add a task"
            className="w-full p-2 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm border focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
      )}
      <TaskContainer
        id={`${dayIndex}-big`}
        title="Key Focus task"
        maxTasks={1}
        tasks={bigTasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        variant={variant}
      />

      <TaskContainer
        id={`${dayIndex}-medium`}
        title="Secondary Focus tasks"
        maxTasks={3}
        tasks={mediumTasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        variant={variant}
      />

      <TaskContainer
        id={`${dayIndex}-small`}
        title="the Rest tasks"
        maxTasks={5}
        tasks={smallTasks}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        variant={variant}
      />
    </div>
  );
};
