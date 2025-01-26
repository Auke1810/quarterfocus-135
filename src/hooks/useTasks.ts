import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  size: string;
  pomodoroCount?: number;
  info?: string;
  user_id: string;
  task_type: 'big' | 'medium' | 'small';
  created_at: string;
}

export function useTasks(taskType: 'big' | 'medium' | 'small') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('task_type', taskType)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setTasks(data || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();

    // Subscribe to changes
    const subscription = supabase
      .channel(`tasks_channel_${user.id}_${taskType}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id} AND task_type=eq.${taskType}` 
        }, 
        (payload) => {
          console.log('Received realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            setTasks(current => [...current, payload.new as Task]);
          } else if (payload.eventType === 'DELETE') {
            setTasks(current => current.filter(task => task.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setTasks(current =>
              current.map(task =>
                task.id === payload.new.id ? { ...task, ...payload.new } : task
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, taskType]);

  const addTask = async (text: string) => {
    if (!user) return;

    const newTask: Partial<Task> = {
      text,
      completed: false,
      user_id: user.id,
      task_type: taskType,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      // Optimistic update
      if (data) {
        setTasks(current => [...current, data]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !currentCompleted })
      .eq("id", id);

    if (error) throw error;

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !currentCompleted } : task
      )
    );
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    // Optimistic update
    setTasks(current => current.filter(t => t.id !== taskId));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        // Revert on error
        setTasks(current => [...current, taskToDelete]);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
  };
}
