import React from 'react';
import { ViewType, TaskType } from '@/types/task';
import TaskSection from '../TaskSection';
import { useTasks } from '@/hooks/useTasks';
import { useViewFocus } from '@/hooks/useViewFocus';
import { DayFocus } from '../DayFocus';
import { WeekView } from './WeekView';
import { PomodoroStats } from '../PomodoroStats';
import { usePomodoroStats } from '@/hooks/usePomodoroStats';

interface TaskViewProps {
  viewType: ViewType;
}

export const TaskView: React.FC<TaskViewProps> = ({ viewType }) => {
  const { tasks, loading, addTask, updateTask, deleteTask, updateTaskPositions } = useTasks({ viewType });
  const { focus, updateFocus } = useViewFocus(viewType);
  const { totalPomodoros, totalMinutes, completedTasks, loading: statsLoading, refresh: refreshStats } = usePomodoroStats();

  const handleAddTask = async (type: TaskType, text: string, date?: Date) => {
    await addTask(type, text, date);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0">
        {viewType === 'focus' && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Focus today</h1>
            {!statsLoading && (
              <PomodoroStats 
                totalPomodoros={totalPomodoros} 
                totalMinutes={totalMinutes}
                completedTasks={completedTasks}
              />
            )}
          </>
        )}
        {viewType === 'tomorrow' && <h1 className="text-2xl font-bold tracking-tight">Tomorrow</h1>}
        {viewType === 'week' && <h1 className="text-2xl font-bold tracking-tight">This Week</h1>}
        {viewType === 'focus' && (
          <DayFocus focus={focus} onUpdateFocus={updateFocus} />
        )}
      </div>

      <div className="flex-1 min-h-0">
        {viewType === 'week' ? (
          <WeekView
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            updateTaskPositions={updateTaskPositions}
          />
        ) : (
          <div className="grid gap-2">
            <TaskSection
              type="big"
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              updateTaskPositions={updateTaskPositions}
              maxTasks={1}
              viewType={viewType}
              onTimerComplete={refreshStats}
            />

            <TaskSection
              type="medium"
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              updateTaskPositions={updateTaskPositions}
              maxTasks={3}
              viewType={viewType}
            />

            <TaskSection
              type="small"
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
              updateTaskPositions={updateTaskPositions}
              maxTasks={5}
              viewType={viewType}
            />
          </div>
        )}
      </div>
    </div>
  );
};
