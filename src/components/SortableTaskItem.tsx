import React, { useState, useEffect } from 'react';
import { useTaskCompletionDialog } from '@/hooks/useTaskCompletionDialog';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskWithParsedInfo, TaskStatusId, ViewType } from '@/types/task';
import { getTaskPomodoroCount } from '@/lib/api';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { PomodoroOverlay } from './PomodoroOverlay';
import { TaskCompletionDialog } from './TaskCompletionDialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import pomoStartIcon from '@/assets/pomostart.svg';
import notesIcon from '@/assets/notes.svg';
import trashIcon from '@/assets/Trash.svg';
import dragHandleIcon from '@/assets/draghandle.svg';

interface SortableTaskItemProps {
  task: TaskWithParsedInfo;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  variant?: 'default' | 'week';
  viewType?: ViewType;
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
  variant = 'default',
  viewType = 'focus'
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // Gebruik de task completion dialog hook
  const { isOpen, taskName, openCompletionDialog, closeCompletionDialog } = useTaskCompletionDialog();

  useEffect(() => {
    const loadPomodoroCount = async () => {
      try {
        const count = await getTaskPomodoroCount(task.id);
        setPomodoroCount(count);
      } catch (error) {
        console.error('Error loading pomodoro count:', error);
      }
    };

    loadPomodoroCount();
  }, [task.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleUpdateSubtask = (subtaskIndex: number, completed: boolean) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], completed };
    
    // Reconstruct info field
    const info = [
      ...task.notes,
      ...updatedSubtasks.map(st => `- [${st.completed ? 'x' : ' '}] ${st.text}`)
    ].join('\n');
    
    onUpdateTask({ ...task, info });
  };

  const handleNoteEdit = () => {
    setEditingNote(task.id);
    setNoteText(task.info || '');
  };

  const handleNoteSave = () => {
    const { notes, subtasks, ...baseTask } = task;
    onUpdateTask({ 
      ...baseTask, 
      info: noteText
    });
    setEditingNote(null);
  };

  const toggleNotes = () => {
    setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
  };
  
  // Functie om een taak bij te werken en felicitatie te tonen
  const handleTaskUpdate = async (checked: boolean) => {
    const wasCompleted = task.status_id === TaskStatusId.COMPLETED;
    const willBeCompleted = checked;
    
    // Update de taak
    await onUpdateTask({
      ...task,
      status_id: checked ? TaskStatusId.COMPLETED : TaskStatusId.IN_PROGRESS
    });
    
    // Toon een felicitatie alleen als de taak nieuw is afgevinkt
    if (!wasCompleted && willBeCompleted) {
      openCompletionDialog(task);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="space-y-2"
      >
        <div>
          {variant === 'default' ? (
            <div className="flex items-center gap-3">
              {viewType === 'focus' && (
                <Checkbox
                  checked={task.status_id === TaskStatusId.COMPLETED}
                  onCheckedChange={(checked) => handleTaskUpdate(checked as boolean)}
                  id={task.id}
                />
              )}
              
              {viewType === 'focus' && (
                <>
                  <img 
                    src={pomoStartIcon} 
                    alt="Start Pomodoro" 
                    className="w-4 h-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setIsPomodoroOpen(true)}
                  />
                  
                  <PomodoroOverlay
                    isOpen={isPomodoroOpen}
                    onClose={() => setIsPomodoroOpen(false)}
                    taskId={task.id}
                  />
                </>
              )}
              
              <span 
                className={task.status_id === TaskStatusId.COMPLETED ? "line-through text-gray-500" : ""}
                onClick={handleNoteEdit}
              >
                {task.text}
              </span>
              
              <div className="ml-auto flex items-center gap-2">
                {(task.notes.length > 0 || task.subtasks.length > 0) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img 
                          src={notesIcon} 
                          alt="Notes" 
                          className="w-4 h-4 cursor-pointer"
                          onClick={toggleNotes}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2 text-sm">
                        <div>
                          {task.notes.map((note, i) => (
                            <p key={i} className="whitespace-pre-wrap">{note}</p>
                          ))}
                          {task.subtasks.length > 0 && (
                            <ul className="mt-1">
                              {task.subtasks.map((subtask, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span>{subtask.completed ? '✓' : '○'}</span>
                                  <span>{subtask.text}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                </button>
                
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <img src={dragHandleIcon} alt="Drag" className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              
              <span 
                className={task.status_id === TaskStatusId.COMPLETED ? "line-through text-gray-500" : ""}
                onClick={handleNoteEdit}
              >
                {task.text}
              </span>
              
              <div className="ml-auto flex items-center gap-2">
                {(task.notes.length > 0 || task.subtasks.length > 0) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <img 
                          src={notesIcon} 
                          alt="Notes" 
                          className="w-4 h-4 cursor-pointer"
                          onClick={toggleNotes}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-2 text-sm">
                        <div>
                          {task.notes.map((note, i) => (
                            <p key={i} className="whitespace-pre-wrap">{note}</p>
                          ))}
                          {task.subtasks.length > 0 && (
                            <ul className="mt-1">
                              {task.subtasks.map((subtask, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <span>{subtask.completed ? '✓' : '○'}</span>
                                  <span>{subtask.text}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                <button 
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                </button>
                
                <div 
                  {...attributes} 
                  {...listeners}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <img src={dragHandleIcon} alt="Drag" className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {editingNote === task.id ? (
          <div className="ml-8 space-y-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add notes or subtasks..."
              className="min-h-[100px]"
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
                onClick={handleNoteSave}
              >
                Save
              </Button>
            </div>
          </div>
        ) : expandedTaskId === task.id && (task.notes.length > 0 || task.subtasks.length > 0) && (
          <div className="ml-8 space-y-2">
            {task.notes.map((note, index) => (
              <div key={index} className="text-sm text-gray-600">{note}</div>
            ))}
            
            {task.subtasks.length > 0 && (
              <div className="space-y-1">
                {task.subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={(checked) => 
                        handleUpdateSubtask(index, checked as boolean)
                      }
                      id={`${task.id}-subtask-${index}`}
                    />
                    <span className={subtask.completed ? "text-sm line-through text-gray-500" : "text-sm"}>
                      {subtask.text}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Toon de felicitatie dialoog wanneer een taak is afgerond */}
      <TaskCompletionDialog
        isOpen={isOpen}
        taskName={taskName}
        onOpenChange={closeCompletionDialog}
      />
    </>
  );
};
