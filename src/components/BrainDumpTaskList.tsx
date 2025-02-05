import React, { useState } from 'react';
import { Task, TaskType, TaskWithParsedInfo, parseTaskInfo } from '@/types/task';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import notesIcon from '@/assets/notes.svg';
import notesFocusIcon from '@/assets/notes-focus.svg';
import calendarIcon from '@/assets/calendar.svg';
import calendarFocusIcon from '@/assets/calendar-focus.svg';
import trashIcon from '@/assets/Trash.svg';
import trashFocusIcon from '@/assets/Trash-focus.svg';
import { ScheduleTaskPopup } from './ScheduleTaskPopup';

interface BrainDumpTaskListProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

interface IconState {
  notes: boolean;
  calendar: boolean;
  trash: boolean;
}

export const BrainDumpTaskList: React.FC<BrainDumpTaskListProps> = ({
  tasks,
  onUpdateTask,
  onDeleteTask,
}) => {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [hoveredIcons, setHoveredIcons] = useState<Record<string, IconState>>({});
  const [schedulingTask, setSchedulingTask] = useState<TaskWithParsedInfo | null>(null);

  const handleTaskClick = (task: TaskWithParsedInfo) => {
    setViewingNote(null);
    if (editingNote === task.id) {
      setEditingNote(null);
    } else {
      setEditingNote(task.id);
      setNoteText(task.info || '');
    }
  };

  const handleNotesIconClick = (e: React.MouseEvent, task: TaskWithParsedInfo) => {
    e.stopPropagation();
    setEditingNote(null);
    if (viewingNote === task.id) {
      setViewingNote(null);
    } else {
      setViewingNote(task.id);
    }
  };

  const handleSaveNote = async (task: TaskWithParsedInfo) => {
    await onUpdateTask({
      ...task,
      info: noteText,
    });
    setEditingNote(null);
  };

  const handleScheduleClick = (e: React.MouseEvent, task: TaskWithParsedInfo) => {
    e.stopPropagation();
    setSchedulingTask(task);
  };

  const handleScheduleTask = async (date: Date, taskType: TaskType) => {
    if (schedulingTask) {
      try {
        // Update the task with new date and type
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
      {tasks.map(parseTaskInfo).map((task) => (
        <div key={task.id} className="group">
          <div 
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent"
            onClick={() => handleTaskClick(task)}
          >
            {/* Task Text */}
            <span className="flex-1 text-sm cursor-pointer">
              {task.text}
            </span>

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
            <div className="mt-2 pl-8 pr-2 text-sm text-muted-foreground">
              {task.info}
            </div>
          )}

          {/* Notes Editor */}
          {editingNote === task.id && (
            <div className="mt-2 pl-8 pr-2">
              <Textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add notes..."
                className="min-h-[100px] mb-2"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingNote(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveNote(task)}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <ScheduleTaskPopup
        open={schedulingTask !== null}
        onClose={() => setSchedulingTask(null)}
        onSchedule={handleScheduleTask}
      />
    </div>
  );
};
