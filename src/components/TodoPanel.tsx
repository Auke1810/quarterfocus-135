import React from 'react';
import { TaskView } from './views/TaskView';
import { TaskType } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';

const TodoPanel = () => {
  const { addTask } = useTasks({ viewType: 'focus' });

  const handleAddTask = async (type: TaskType, text: string) => {
    await addTask(type, text);
  };

  return (
    <div className="h-full flex flex-col">
      <TaskView viewType="focus" />
    </div>
  );
};

export default TodoPanel;
