import React from 'react';
import { TaskType, Task } from '@/types/task';
import TaskSection from '../TaskSection';
import { format, addDays } from 'date-fns';
import { nl } from 'date-fns/locale';

interface WeekViewProps {
  tasks: Task[];
  onAddTask: (type: TaskType, text: string) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  updateTaskPositions: (tasks: Task[]) => Promise<void>;
}

export const WeekView: React.FC<WeekViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  updateTaskPositions,
}) => {
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
        {weekDays.map((day, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4 capitalize">
              {format(day, 'EEEE d MMMM', { locale: nl })}
            </h2>
            <div className="space-y-6">
              <TaskSection
                type="big"
                tasks={tasks.filter(task => task.scheduled_for === format(day, 'yyyy-MM-dd'))}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                updateTaskPositions={updateTaskPositions}
                maxTasks={1}
              />
              <TaskSection
                type="medium"
                tasks={tasks.filter(task => task.scheduled_for === format(day, 'yyyy-MM-dd'))}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                updateTaskPositions={updateTaskPositions}
                maxTasks={3}
              />
              <TaskSection
                type="small"
                tasks={tasks.filter(task => task.scheduled_for === format(day, 'yyyy-MM-dd'))}
                onAddTask={onAddTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                updateTaskPositions={updateTaskPositions}
                maxTasks={5}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
