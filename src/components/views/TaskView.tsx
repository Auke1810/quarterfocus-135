import React from 'react';
import { ViewType, TaskType } from '@/types/task';
import TaskSection from '../TaskSection';
import { useTasks } from '@/hooks/useTasks';
import { useViewFocus } from '@/hooks/useViewFocus';
import { DayFocus } from '../DayFocus';

interface TaskViewProps {
  viewType: ViewType;
}

export const TaskView: React.FC<TaskViewProps> = ({ viewType }) => {
  const { tasks, loading, addTask, updateTask, deleteTask, updateTaskPositions } = useTasks({ viewType });
  const { focus, updateFocus } = useViewFocus(viewType);

  const handleAddTask = async (type: TaskType, text: string) => {
    await addTask(type, text);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="space-y-1">
        {viewType === 'focus' && <h1 className="text-2xl font-bold tracking-tight">Focus today</h1>}
        {viewType === 'tomorrow' && <h1 className="text-2xl font-bold tracking-tight">Tomorrow</h1>}
        {viewType === 'week' && <h1 className="text-2xl font-bold tracking-tight">This Week</h1>}
        {viewType === 'focus' && (
          <DayFocus focus={focus} onUpdateFocus={updateFocus} />
        )}
      </div>

      <div className="grid gap-6">
        <TaskSection
          type="big"
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          updateTaskPositions={updateTaskPositions}
          maxTasks={1}
        />

        <TaskSection
          type="medium"
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          updateTaskPositions={updateTaskPositions}
          maxTasks={3}
        />

        <TaskSection
          type="small"
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          updateTaskPositions={updateTaskPositions}
          maxTasks={5}
        />
      </div>
    </div>
  );
};
