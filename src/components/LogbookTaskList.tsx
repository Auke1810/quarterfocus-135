import React, { useState } from 'react';
import { Task, TaskType, TaskWithParsedInfo, parseTaskInfo } from '@/types/task';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import notesIcon from '@/assets/notes.svg';
import notesFocusIcon from '@/assets/notes-focus.svg';
import calendarIcon from '@/assets/calendar.svg';
import calendarFocusIcon from '@/assets/calendar-focus.svg';
import trashIcon from '@/assets/Trash.svg';
import trashFocusIcon from '@/assets/Trash-focus.svg';
import { ScheduleTaskPopup } from './ScheduleTaskPopup';

interface LogbookTaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

interface IconState {
  notes: boolean;
  calendar: boolean;
  trash: boolean;
}

export const LogbookTaskList: React.FC<LogbookTaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [viewingNote, setViewingNote] = useState<string | null>(null);
  const [hoveredIcons, setHoveredIcons] = useState<Record<string, IconState>>({});
  const [schedulingTask, setSchedulingTask] = useState<TaskWithParsedInfo | null>(null);

  const handleNotesIconClick = (e: React.MouseEvent, task: TaskWithParsedInfo) => {
    e.stopPropagation();
    if (viewingNote === task.id) {
      setViewingNote(null);
    } else {
      setViewingNote(task.id);
    }
  };

  const handleScheduleClick = (e: React.MouseEvent, task: TaskWithParsedInfo) => {
    e.stopPropagation();
    setSchedulingTask(task);
  };

  const handleScheduleTask = async (date: Date, taskType: TaskType) => {
    if (schedulingTask) {
      try {
        await onUpdateTask({
          ...schedulingTask,
          task_type: taskType,
          status_id: 1, // IN_PROGRESS
          scheduled_for: date.toISOString(),
        });
      } finally {
        setSchedulingTask(null);
      }
    }
  };

  return (
    <div className="space-y-0">
      {tasks.map(parseTaskInfo).map((task) => {
        // Format de datum
        const taskDate = parseISO(task.scheduled_for);
        const formattedDate = format(taskDate, 'd MMMM yyyy', { locale: nl });
        
        return (
          <div key={task.id} className="group border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2 p-3 hover:bg-accent">
              {/* Task Date */}
              <span className="text-xs text-muted-foreground min-w-[100px]">
                {formattedDate}
              </span>
              
              {/* Task Text */}
              <div className="flex-1">
                <span className="text-sm">
                  {task.text}
                </span>
                
                {/* Task Type Badge */}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  task.task_type === 'big' 
                    ? 'bg-red-100 text-red-800' 
                    : task.task_type === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.task_type === 'big' ? 'Key' : task.task_type === 'medium' ? 'Medium' : 'Small'}
                </span>
                
                {/* Status Badge */}
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  task.status_id === 2 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {task.status_id === 2 ? 'Afgerond' : 'Open'}
                </span>
              </div>

              {/* Icons */}
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {/* Notes Icon */}
                {task.info && (
                  <button
                    onClick={(e) => handleNotesIconClick(e, task)}
                    onMouseEnter={() => setHoveredIcons(prev => ({
                      ...prev,
                      [task.id]: { ...prev[task.id], notes: true }
                    }))}
                    onMouseLeave={() => setHoveredIcons(prev => ({
                      ...prev,
                      [task.id]: { ...prev[task.id], notes: false }
                    }))}
                    className="opacity-50 hover:opacity-100"
                  >
                    <img 
                      src={hoveredIcons[task.id]?.notes ? notesFocusIcon : notesIcon} 
                      alt="Notes" 
                      className="w-4 h-4" 
                    />
                  </button>
                )}

                {/* Calendar Icon */}
                <button
                  onClick={(e) => handleScheduleClick(e, task)}
                  onMouseEnter={() => setHoveredIcons(prev => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], calendar: true }
                  }))}
                  onMouseLeave={() => setHoveredIcons(prev => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], calendar: false }
                  }))}
                  className="opacity-50 hover:opacity-100"
                >
                  <img 
                    src={hoveredIcons[task.id]?.calendar ? calendarFocusIcon : calendarIcon} 
                    alt="Schedule" 
                    className="w-4 h-4" 
                  />
                </button>

                {/* Delete Icon */}
                <button
                  onClick={() => onDeleteTask(task.id)}
                  onMouseEnter={() => setHoveredIcons(prev => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], trash: true }
                  }))}
                  onMouseLeave={() => setHoveredIcons(prev => ({
                    ...prev,
                    [task.id]: { ...prev[task.id], trash: false }
                  }))}
                  className="opacity-50 hover:opacity-100"
                >
                  <img 
                    src={hoveredIcons[task.id]?.trash ? trashFocusIcon : trashIcon} 
                    alt="Delete" 
                    className="w-4 h-4" 
                  />
                </button>
              </div>
            </div>

            {/* Notes Viewer */}
            {viewingNote === task.id && task.info && (
              <div className="mt-2 pl-8 pr-2 pb-3 text-sm text-muted-foreground whitespace-pre-wrap">
                {task.info}
              </div>
            )}
          </div>
        );
      })}
      <ScheduleTaskPopup
        open={schedulingTask !== null}
        onClose={() => setSchedulingTask(null)}
        onSchedule={handleScheduleTask}
      />
    </div>
  );
};
