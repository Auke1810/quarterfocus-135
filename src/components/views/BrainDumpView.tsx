import React, { useState } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrainDumpTaskList } from '@/components/BrainDumpTaskList';

export const BrainDumpView: React.FC = () => {
  const [newTaskText, setNewTaskText] = useState('');
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    updateTaskPositions,
  } = useTasks({ viewType: 'brain-dump' });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      await addTask('small', newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Brain dump</h1>
        <p className="text-muted-foreground mb-4">
          Dump je gedachten en taken hier. Deze taken worden niet ingepland maar kunnen later worden toegewezen aan specifieke periodes.
        </p>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Voeg een nieuwe taak toe..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Toevoegen</Button>
        </form>
      </div>

      <BrainDumpTaskList
        tasks={tasks}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
};
