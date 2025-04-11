import React from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskWithParsedInfo, parseTaskInfo, ViewType, TaskStatusId } from '@/types/task';
import { SortableTaskItem } from './SortableTaskItem';

interface SortableTaskListProps {
  tasks: Task[];
  onTasksReorder: (tasks: Task[]) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  viewType?: ViewType;
}

export const SortableTaskList: React.FC<SortableTaskListProps> = ({
  tasks,
  onTasksReorder,
  onUpdateTask,
  onDeleteTask,
  viewType = 'focus',
}) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      const reorderedTasks = [...tasks];
      const [movedTask] = reorderedTasks.splice(oldIndex, 1);
      reorderedTasks.splice(newIndex, 0, movedTask);

      // Update positions
      const updatedTasks = reorderedTasks.map((task, index) => ({
        ...task,
        position: index,
      }));

      // Call the reorder handler and wait for it to complete
      await onTasksReorder(updatedTasks);
    }
  };

  // Parse tasks to include notes and subtasks
  const parsedTasks = tasks.map(parseTaskInfo);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={parsedTasks} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {parsedTasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              viewType={viewType}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
