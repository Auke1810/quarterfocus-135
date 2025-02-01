import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskWithParsedInfo } from '@/types/task';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import pomoStartIcon from '@/assets/pomostart.svg';
import notesIcon from '@/assets/notes.svg';
import trashIcon from '@/assets/Trash.svg';
import dragHandleIcon from '@/assets/draghandle.svg';

interface SortableTaskItemProps {
  task: TaskWithParsedInfo;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  variant?: 'default' | 'week';
}

export const SortableTaskItem: React.FC<SortableTaskItemProps> = ({
  task,
  onUpdateTask,
  onDeleteTask,
  variant = 'default'
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="space-y-2"
    >
      <div>
        {variant === 'default' ? (
          <div className="flex items-center gap-3">
            <Checkbox
              checked={task.completed}
              onCheckedChange={(checked) => 
                onUpdateTask({ ...task, completed: checked as boolean })
              }
              id={task.id}
            />
            
            <img 
              src={pomoStartIcon} 
              alt="Start Pomodoro" 
              className="w-4 h-4 cursor-pointer"
            />
            
            <span 
              className={task.completed ? "line-through text-gray-500" : ""}
              onClick={handleNoteEdit}
            >
              {task.text}
            </span>
            
            <div className="ml-auto flex items-center gap-2">
              {(task.notes.length > 0 || task.subtasks.length > 0) && (
                <img 
                  src={notesIcon} 
                  alt="Toggle notes" 
                  className="w-4 h-4 cursor-pointer"
                  onClick={toggleNotes}
                />
              )}
              
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <img 
                  src={trashIcon} 
                  alt="Delete task" 
                  className="w-4 h-4"
                />
              </button>

              <div {...attributes} {...listeners}>
                <img 
                  src={dragHandleIcon} 
                  alt="Drag to reorder" 
                  className="w-4 h-4 cursor-move"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <div {...attributes} {...listeners}>
                <img 
                  src={dragHandleIcon} 
                  alt="Drag to reorder" 
                  className="w-4 h-4 cursor-move"
                />
              </div>
              <span 
                className="text-sm cursor-pointer"
                onClick={handleNoteEdit}
              >
                {task.text}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {(task.notes.length > 0 || task.subtasks.length > 0) && (
                <img 
                  src={notesIcon} 
                  alt="Toggle notes" 
                  className="w-4 h-4 cursor-pointer"
                  onClick={toggleNotes}
                />
              )}
              <button 
                onClick={() => onDeleteTask(task.id)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <img 
                  src={trashIcon} 
                  alt="Delete task" 
                  className="w-4 h-4"
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {editingNote === task.id ? (
        <div className="ml-8 space-y-2">
          <div className="text-sm text-gray-500 mb-2">
            Tip: Begin een regel met "-" voor een subtaak
          </div>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Voeg notities of subtaken toe"
            className="min-h-[100px]"
          />
          <div className="flex gap-2">
            <Button onClick={handleNoteSave}>Save</Button>
            <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
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
  );
};
