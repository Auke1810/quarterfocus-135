import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { Task, TaskType, ViewType, TaskStatusId } from '@/types/task';
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

      // For brain dump, show open tasks. For other views, show active or completed tasks
      if (viewType === 'brain-dump') {
        query = query.eq('status_id', TaskStatusId.OPEN);
      } else {
        query = query.in('status_id', [TaskStatusId.IN_PROGRESS, TaskStatusId.COMPLETED]);
      }

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
        case 'brain-dump':
          // Brain dump tasks are scheduled far in the future
          const farFuture = new Date('2099-12-31');
          query = query.eq('scheduled_for', farFuture.toISOString());
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
        status_id: viewType === 'brain-dump' ? TaskStatusId.OPEN : TaskStatusId.IN_PROGRESS,
        info: '',
        position,
        user_id: user.id,
        scheduled_for: viewType === 'brain-dump' ? new Date('2099-12-31').toISOString() : getScheduledFor(date).toISOString()
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
          typeof taskData.status_id === 'number' &&
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
            status_id: taskData.status_id,
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

  const toggleTaskCompletion = async (taskId: string, status_id: number) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status_id,
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
        prev.map(t => t.id === taskId ? { ...t, status_id, updated_at: new Date().toISOString() } : t)
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
          existingTask.status_id !== task.status_id && 
          existingTask.text === task.text &&
          existingTask.task_type === task.task_type &&
          existingTask.scheduled_for === task.scheduled_for &&
          existingTask.info === task.info &&
          existingTask.position === task.position) {
        return toggleTaskCompletion(task.id, task.status_id);
      }

      const updatedTask: Task = {
        id: task.id,
        text: task.text,
        task_type: task.task_type,
        status_id: task.status_id,
        scheduled_for: task.scheduled_for || getScheduledFor().toISOString(),
        info: task.info || '',
        position: task.position,
        user_id: task.user_id,
        created_at: task.created_at,
        updated_at: new Date().toISOString()
      };

      // Extract only the fields we want to update
      const { id: _, user_id: __, created_at: ___, ...updateFields } = updatedTask;

      const { error } = await supabase
        .from('tasks')
        .update(updateFields)
        .eq('id', task.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      // Update local state
      setTasks(prevTasks => {
        // Als de status is veranderd naar IN_PROGRESS (1) en we zijn in brain-dump view,
        // dan filteren we de taak eruit
        if (task.status_id === 1 && viewType === 'brain-dump') {
          return prevTasks.filter(t => t.id !== task.id);
        }
        // Anders updaten we de taak
        return prevTasks.map(t => t.id === task.id ? updatedTask : t);
      });
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
        status_id: task.status_id,
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
