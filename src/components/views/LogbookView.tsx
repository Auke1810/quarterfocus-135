import React, { useState, useEffect } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Task } from '@/types/task';
import { useSupabase } from '@/hooks/useSupabase';
import { Button } from '@/components/ui/button';
import { LogbookTaskList } from '../LogbookTaskList';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

export const LogbookView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  const fetchOldTasks = async () => {
    setLoading(true);
    
    try {
      const today = new Date();
      // Taken ouder dan 7 dagen
      const sevenDaysAgo = subDays(today, 7);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .lt('scheduled_for', sevenDaysAgo.toISOString())
        .order('scheduled_for', { ascending: false });
        
      if (error) {
        console.error('Error fetching old tasks:', error);
        toast.error('Fout bij het ophalen van oude taken');
        return;
      }
      
      setTasks((data as unknown) as Task[]);
    } catch (error) {
      console.error('Error in fetchOldTasks:', error);
      toast.error('Er is een fout opgetreden');
    } finally {
      setLoading(false);
    }
  };
  
  const deleteAllOldTasks = async () => {
    if (!tasks.length) return;
    
    const confirmed = confirm('Weet je zeker dat je alle oude taken permanent wilt verwijderen? Dit kan niet ongedaan worden gemaakt.');
    if (!confirmed) return;
    
    try {
      const today = new Date();
      const sevenDaysAgo = subDays(today, 7);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .lt('scheduled_for', sevenDaysAgo.toISOString());
        
      if (error) {
        console.error('Error deleting old tasks:', error);
        toast.error('Fout bij het verwijderen van oude taken');
        return;
      }
      
      toast.success('Alle oude taken zijn permanent verwijderd');
      setTasks([]);
    } catch (error) {
      console.error('Error in deleteAllOldTasks:', error);
      toast.error('Er is een fout opgetreden');
    }
  };
  
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Fout bij het verwijderen van de taak');
        return;
      }
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      toast.success('Taak permanent verwijderd');
    } catch (error) {
      console.error('Error in deleteTask:', error);
      toast.error('Er is een fout opgetreden');
    }
  };
  
  const updateTask = async (updatedTask: Task) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updatedTask as unknown as Record<string, unknown>)
        .eq('id', updatedTask.id);
        
      if (error) {
        console.error('Error updating task:', error);
        toast.error('Fout bij het bijwerken van de taak');
        return;
      }
      
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      
      // Als de taak is gepland voor een nieuwere datum, verwijder deze uit de lijst
      const sevenDaysAgo = subDays(new Date(), 7);
      const taskDate = parseISO(updatedTask.scheduled_for);
      
      if (taskDate >= sevenDaysAgo) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== updatedTask.id));
        toast.success('Taak succesvol opnieuw gepland');
      }
    } catch (error) {
      console.error('Error in updateTask:', error);
      toast.error('Er is een fout opgetreden');
    }
  };
  
  useEffect(() => {
    fetchOldTasks();
  }, []);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Logboek</h1>
        <p className="text-muted-foreground mb-4">
          Bekijk en beheer oude taken. Hier vind je alle taken die ouder zijn dan 7 dagen.
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {tasks.length > 0 ? (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <LogbookTaskList
                tasks={tasks}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
              
              <div className="mt-8 flex justify-center">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={deleteAllOldTasks}
                  className="flex items-center gap-2"
                >
                  <Trash size={16} />
                  <span>Verwijder alle oude taken</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <p className="text-muted-foreground">
                Er zijn geen oude taken gevonden.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
