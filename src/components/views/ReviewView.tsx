import React, { useEffect, useState } from 'react';
import { format, subDays, addDays, addWeeks, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import { Task, TaskStatusId } from '@/types/task';
import { ReviewTaskItem } from '@/components/ReviewTaskItem';
import { useSupabase } from '@/hooks/useSupabase';
import { toast } from 'sonner';

export const ReviewView: React.FC = () => {
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  // Removed alert state in favor of toast
  const { supabase } = useSupabase();

  const fetchTasksForReview = async (): Promise<Record<string, Task[]>> => {
    const today = new Date();
    // End is yesterday 23:59:59
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59);
    // Start is 7 days before yesterday
    const startDate = subDays(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 0, 0, 0), 6);

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('scheduled_for', startDate.toISOString())
      .lte('scheduled_for', endDate.toISOString())
      .in('status_id', [TaskStatusId.IN_PROGRESS, TaskStatusId.COMPLETED])
      .order('position');

    if (error) {
      console.error('Error fetching tasks:', error);
      return {};
    }

    // Group tasks by date
    const groupedTasks: Record<string, Task[]> = {};
    (data as unknown as Task[])?.forEach((task) => {
      // Parse the date and set it to midnight local time
      const taskDate = parseISO(task.scheduled_for);
      const localDate = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );
      const dateKey = format(localDate, 'yyyy-MM-dd');

      if (!groupedTasks[dateKey]) {
        groupedTasks[dateKey] = [];
      }
      groupedTasks[dateKey].push(task);
    });

    return groupedTasks;
  };

  useEffect(() => {
    const loadTasks = async () => {
      setLoading(true);
      const groupedTasks = await fetchTasksForReview();
      setTasks(groupedTasks);
      setLoading(false);

      // Check if all tasks have been processed
      const totalTasks = Object.values(groupedTasks).reduce((sum, tasks) => sum + tasks.length, 0);
      if (!loading && totalTasks === 0) {
        toast.success('Congratulations! You have reviewed all your tasks. Time to celebrate your wins! 🎉');
      }
    };

    loadTasks();
  }, [supabase]);

  const getTaskTypeLimit = (taskType: Task['task_type']) => {
    switch (taskType) {
      case 'big': return 1;
      case 'medium': return 3;
      case 'small': return 5;
      default: return 0;
    }
  };

  const getTaskTypeName = (taskType: Task['task_type']) => {
    switch (taskType) {
      case 'big': return 'Key Focus Task';
      case 'medium': return 'Secondary Focus Tasks';
      case 'small': return 'the Rest';
      default: return taskType;
    }
  };

  const handleDuplicate = async (task: Task) => {
    try {
      // Bereken de datum voor volgende week
      const taskDate = parseISO(task.scheduled_for);
      // Zet de tijd op middernacht om timezone issues te voorkomen
      const dateWithoutTime = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const nextWeekDate = addWeeks(dateWithoutTime, 1);
      
      // Check hoeveel taken er al zijn voor deze dag en type
      const { data: existingTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('task_type', task.task_type)
        .eq('scheduled_for', nextWeekDate.toISOString())
        .in('status_id', [TaskStatusId.IN_PROGRESS, TaskStatusId.COMPLETED]);

      if (fetchError) {
        console.error('Error checking existing tasks:', fetchError);
        return;
      }

      const taskLimit = getTaskTypeLimit(task.task_type);
      const taskTypeName = getTaskTypeName(task.task_type);

      if (existingTasks && existingTasks.length >= taskLimit) {
        toast.warning(`You have already reached the maximum number of ${taskTypeName} (${taskLimit}) planned for next week on this day.`);
        return;
      }

      // Maak een nieuwe taak aan
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            text: task.text,
            task_type: task.task_type,
            status_id: TaskStatusId.IN_PROGRESS,
            info: task.info,
            position: task.position,
            user_id: task.user_id,
            scheduled_for: nextWeekDate.toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error duplicating task:', insertError);
        return;
      }

      // Update tasks list
      const updatedTasks = await fetchTasksForReview();
      setTasks(updatedTasks);
      
      // Check if all tasks are processed
      const totalTasks = Object.values(updatedTasks).reduce((sum, tasks) => sum + tasks.length, 0);
      if (totalTasks === 0) {
        toast.success('Congratulations! You have reviewed all your tasks. Time to celebrate your wins! 🎉');
      } else {
        toast.success('Task successfully duplicated to next week!');
      }
    } catch (error) {
      console.error('Error duplicating task:', error);
    }
  };

  const handleArchive = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status_id: TaskStatusId.ARCHIVED,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) {
        console.error('Error archiving task:', error);
        return;
      }

      // Update local state
      setTasks(prevTasks => {
        const newTasks = { ...prevTasks };
        Object.keys(newTasks).forEach(date => {
          newTasks[date] = newTasks[date].filter(task => task.id !== taskId);
          // Remove date if no tasks remain
          if (newTasks[date].length === 0) {
            delete newTasks[date];
          }
        });
        return newTasks;
      });
    } catch (error) {
      console.error('Error archiving task:', error);
    }
  };

  const renderDateBlock = (date: string, tasks: Task[]) => {
    const formattedDate = format(new Date(date), 'EEEE d MMMM', { locale: nl });
    
    return (
      <div key={date} className="mb-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">{formattedDate}</h2>
        <div className="space-y-2">
          {tasks.map(task => (
            <ReviewTaskItem 
              key={task.id} 
              task={task} 
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-600">Loading tasks...</div>
      </div>
    );
  }

  const sortedDates = Object.keys(tasks).sort((a, b) => b.localeCompare(a));

  return (
    <div className="container mx-auto p-4">
      {/* Alert is now handled by Sonner toast */}
      <h1 className="text-2xl font-bold mb-6">Review</h1>
      {sortedDates.map(date => renderDateBlock(date, tasks[date]))}
    </div>
  );
};
