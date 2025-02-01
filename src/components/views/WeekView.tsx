import React from 'react';
import { TaskType, Task } from '@/types/task';
import { format, addDays, startOfDay, isEqual } from 'date-fns';
import { nl } from 'date-fns/locale';
import { DayTaskView } from './DayTaskView';
import { DndContext, DragEndEvent, DragOverEvent, closestCenter } from '@dnd-kit/core';

interface WeekViewProps {
  tasks: Task[];
  onAddTask: (type: TaskType, text: string, date: Date) => Promise<void>;
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
  const today = startOfDay(new Date());
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = startOfDay(new Date(task.scheduled_for));
      return isEqual(taskDate, day);
    });
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Bepaal het nieuwe type op basis van de container ID
    const containerId = over.id as string;
    const [dayIndex, containerType] = containerId.split('-');
    const day = weekDays[parseInt(dayIndex)];

    let newType: TaskType;
    if (containerType === 'big') newType = 'big';
    else if (containerType === 'medium') newType = 'medium';
    else if (containerType === 'small') newType = 'small';
    else return;

    // Check of er ruimte is in de doelsectie
    const tasksInDay = getTasksForDay(day);
    const tasksInTargetSection = tasksInDay.filter(t => t.task_type === newType).length;
    const maxTasksForType = newType === 'big' ? 1 : newType === 'medium' ? 3 : 5;

    if (tasksInTargetSection < maxTasksForType && (task.task_type !== newType || !isEqual(startOfDay(new Date(task.scheduled_for)), day))) {
      onUpdateTask({
        ...task,
        task_type: newType,
        scheduled_for: day.toISOString(),
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id as string;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Bepaal de dag op basis van de container ID
    const containerId = over.id as string;
    const [dayIndex] = containerId.split('-');
    const day = weekDays[parseInt(dayIndex)];

    // Update posities binnen dezelfde dag
    const tasksInDay = getTasksForDay(day);
    const updatedTasks = [...tasksInDay];
    const oldIndex = tasksInDay.findIndex(t => t.id === active.id);
    const newIndex = tasksInDay.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      updatedTasks.splice(oldIndex, 1);
      updatedTasks.splice(newIndex, 0, task);
      updateTaskPositions(updatedTasks.map((t, index) => ({ 
        ...t, 
        position: index,
        scheduled_for: day.toISOString(),
      })));
    }
  };

  return (
    <div className="pb-6">
      <DndContext
        collisionDetection={closestCenter}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {weekDays.map((day, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-xl font-semibold mb-3 capitalize">
                {format(day, 'EEEE d MMMM', { locale: nl })}
              </h2>
              <DayTaskView
                dayIndex={index}
                tasks={getTasksForDay(day)}
                onAddTask={(type, text) => onAddTask(type, text, day)}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                variant="week"
              />
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};
