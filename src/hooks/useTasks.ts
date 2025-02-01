import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Task, TaskType, ViewType } from '@/types/task';
import { useAuth } from '@/components/auth/AuthProvider';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';

interface UseTasksProps {
  viewType: ViewType;
}

export const useTasks = ({ viewType }: UseTasksProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { supabase } = useSupabase();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('position');

      // Add date filters based on viewType
      switch (viewType) {
        case 'focus':
          query = query
            .gte('scheduled_for', startOfDay(now).toISOString())
            .lte('scheduled_for', endOfDay(now).toISOString());
          break;
        case 'tomorrow':
          const tomorrow = addDays(now, 1);
          query = query
            .gte('scheduled_for', startOfDay(tomorrow).toISOString())
            .lte('scheduled_for', endOfDay(tomorrow).toISOString());
          break;
        case 'week':
          // For week view, we want to include today and the next 6 days
          const weekEnd = addDays(now, 6);
          query = query
            .gte('scheduled_for', startOfDay(now).toISOString())
            .lte('scheduled_for', endOfDay(weekEnd).toISOString());
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched tasks:', data);
      setTasks((data as unknown as Task[]) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [user, viewType]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getScheduledFor = (date?: Date) => {
    if (date) return date;
    
    const now = new Date();
    switch (viewType) {
      case 'tomorrow':
        return addDays(now, 1);
      case 'week':
        return startOfWeek(now);
      case 'focus':
      default:
        return now;
    }
  };

  const addTask = async (task_type: TaskType, text: string, date?: Date) => {
    if (!user) return;

    try {
      const position = tasks.filter(t => t.task_type === task_type).length;
      const newTask = {
        text,
        task_type,
        completed: false,
        info: '',
        position,
        user_id: user.id,
        scheduled_for: getScheduledFor(date).toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) {
        console.error('Error adding task:', error);
        throw error;
      }

      if (data) {
        // Eerst controleren of alle vereiste velden aanwezig zijn
        const taskData = data as Record<string, unknown>;
        if (
          typeof taskData.id === 'string' &&
          typeof taskData.text === 'string' &&
          typeof taskData.task_type === 'string' &&
          typeof taskData.completed === 'boolean' &&
          typeof taskData.scheduled_for === 'string' &&
          typeof taskData.user_id === 'string' &&
          typeof taskData.created_at === 'string' &&
          typeof taskData.updated_at === 'string' &&
          (taskData.task_type === 'big' || taskData.task_type === 'medium' || taskData.task_type === 'small')
        ) {
          const task: Task = {
            id: taskData.id,
            text: taskData.text,
            task_type: taskData.task_type,
            completed: taskData.completed,
            scheduled_for: taskData.scheduled_for,
            user_id: taskData.user_id,
            created_at: taskData.created_at,
            updated_at: taskData.updated_at,
            info: typeof taskData.info === 'string' ? taskData.info : undefined,
            position: typeof taskData.position === 'number' ? taskData.position : undefined
          };
          setTasks(prev => [...prev, task]);
        } else {
          console.error('Invalid task data received:', taskData);
          throw new Error('Invalid task data structure');
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task completion:', error);
        throw error;
      }

      // Update local state
      setTasks(prev => 
        prev.map(t => t.id === taskId ? { ...t, completed, updated_at: new Date().toISOString() } : t)
      );
    } catch (error) {
      console.error('Error updating task completion:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const updateTask = async (task: Task) => {
    if (!user) return;

    try {
      // Als alleen completed wordt gewijzigd, gebruik dan toggleTaskCompletion
      const existingTask = tasks.find(t => t.id === task.id);
      if (existingTask && 
          existingTask.completed !== task.completed && 
          existingTask.text === task.text &&
          existingTask.task_type === task.task_type &&
          existingTask.scheduled_for === task.scheduled_for &&
          existingTask.info === task.info &&
          existingTask.position === task.position) {
        return toggleTaskCompletion(task.id, task.completed);
      }

      const updatedTask = {
        id: task.id,
        text: task.text,
        task_type: task.task_type,
        completed: task.completed,
        scheduled_for: task.scheduled_for || getScheduledFor().toISOString(),
        info: task.info || '',
        position: task.position,
        user_id: task.user_id,
        created_at: task.created_at,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      // Update local state with the same task data
      setTasks(prev => 
        prev.map(t => t.id === task.id ? updatedTask : t)
      );
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  const updateTaskPositions = async (updatedTasks: Task[]) => {
    if (!user) return;

    // Update local state immediately for smooth UI
    setTasks(updatedTasks);

    try {
      // Prepare tasks for database update
      const tasksToUpdate = updatedTasks.map(task => ({
        id: task.id,
        text: task.text,
        completed: task.completed,
        info: task.info,
        task_type: task.task_type,
        position: task.position,
        user_id: user.id,
        scheduled_for: task.scheduled_for || getScheduledFor().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tasks')
        .upsert(tasksToUpdate, { 
          onConflict: 'id'
        });

      if (error) {
        console.error('Supabase error:', error);
        // Only fetch from database if there was an error
        await fetchTasks();
        throw error;
      }
    } catch (error) {
      console.error('Error updating task positions:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      // Only fetch from database if there was an error
      await fetchTasks();
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskPositions,
  };
};
