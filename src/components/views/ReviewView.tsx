import React, { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Task } from '@/types/task';
import { ReviewTaskItem } from '@/components/ReviewTaskItem';
import { useSupabase } from '@/hooks/useSupabase';

export const ReviewView: React.FC = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Begin van vandaag
      const startDate = subDays(endDate, 7); // Fetch last 7 days

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('scheduled_for', startDate.toISOString())
        .lte('scheduled_for', endDate.toISOString())
        .order('position');

      if (error) {
        console.error('Error fetching tasks:', error);
        return;
      }

      // Group tasks by date
      const groupedTasks: Record<string, Task[]> = {};
      (data as unknown as Task[])?.forEach((task) => {
        const date = task.scheduled_for.split('T')[0];
        if (!groupedTasks[date]) {
          groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
      });

      setTasks(groupedTasks);
      setLoading(false);
    };

    fetchTasks();
  }, [supabase]);

  const renderDateBlock = (date: string, tasks: Task[]) => {
    const formattedDate = format(new Date(date), 'EEEE d MMMM', { locale: nl });
    
    return (
      <div key={date} className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{formattedDate}</h2>
        <div className="space-y-2">
          {tasks.map(task => (
            <ReviewTaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-600">Taken laden...</div>
      </div>
    );
  }

  const sortedDates = Object.keys(tasks).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Review</h1>
      {sortedDates.map(date => renderDateBlock(date, tasks[date]))}
    </div>
  );
};
