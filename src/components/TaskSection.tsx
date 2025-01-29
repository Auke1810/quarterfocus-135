import React, { useState } from "react";
import { Task, TaskType, TaskWithParsedInfo, parseTaskInfo } from '@/types/task';
import { Input } from "./ui/input";
import { SortableTaskList } from './SortableTaskList';
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import pomoStartIcon from '@/assets/pomostart.svg';
import notesIcon from '@/assets/notes.svg';
import trashIcon from '@/assets/Trash.svg';

interface TaskSectionProps {
  type: TaskType;
  tasks: Task[];
  onAddTask: (type: TaskType, text: string) => Promise<void>;
  onUpdateTask: (task: Task) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  updateTaskPositions: (tasks: Task[]) => Promise<void>;
  maxTasks: number;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  type,
  tasks: propTasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  updateTaskPositions,
  maxTasks,
}) => {
  const [newTask, setNewTask] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  
  const filteredTasks = propTasks
    .filter(task => task.task_type === type)
    .map(parseTaskInfo);
  
  const getSectionTitle = () => {
    switch(type) {
      case 'big':
        return `Key Focus Task (${maxTasks})`;
      case 'medium':
        return `Secondary Focus Task (${maxTasks})`;
      case 'small':
        return `the Rest (${maxTasks})`;
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim() && filteredTasks.length < maxTasks) {
      await onAddTask(type, newTask.trim());
      setNewTask("");
    }
  };

  const handleTasksReorder = async (reorderedTasks: Task[]) => {
    // Only update tasks of the current type
    const otherTasks = propTasks.filter(task => task.task_type !== type);
    const tasksToUpdate = reorderedTasks.map((task, index) => ({
      ...task,
      position: index,
      task_type: type
    }));
    
    await updateTaskPositions([...otherTasks, ...tasksToUpdate]);
  };

  const handleUpdateSubtask = (task: TaskWithParsedInfo, subtaskIndex: number, completed: boolean) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = { ...updatedSubtasks[subtaskIndex], completed };
    
    // Reconstruct info field
    const info = [
      ...task.notes,
      ...updatedSubtasks.map(st => `- [${st.completed ? 'x' : ' '}] ${st.text}`)
    ].join('\n');
    
    onUpdateTask({ ...task, info });
  };

  const handleNoteEdit = (task: TaskWithParsedInfo) => {
    setEditingNote(task.id);
    setNoteText(task.info || '');
  };

  const handleNoteSave = (task: TaskWithParsedInfo) => {
    const { notes, subtasks, ...baseTask } = task;
    onUpdateTask({ 
      ...baseTask, 
      info: noteText
    });
    setEditingNote(null);
  };

  const toggleNotes = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold">{getSectionTitle()}</h3>

      {type === 'big' ? (
        // Single task view for Key Focus Task
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <div key={task.id} className="space-y-2">
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
                  onClick={() => handleNoteEdit(task)}
                >
                  {task.text}
                </span>
                
                <div className="ml-auto flex items-center gap-2">
                  {(task.notes.length > 0 || task.subtasks.length > 0) && (
                    <img 
                      src={notesIcon} 
                      alt="Toggle notes" 
                      className="w-4 h-4 cursor-pointer"
                      onClick={() => toggleNotes(task.id)}
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
                    <Button onClick={() => handleNoteSave(task)}>Save</Button>
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
                              handleUpdateSubtask(task, index, checked as boolean)
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
          ))}
        </div>
      ) : (
        // Sortable list for medium and small tasks
        <SortableTaskList
          tasks={filteredTasks}
          onTasksReorder={handleTasksReorder}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
        />
      )}

      {filteredTasks.length < maxTasks && (
        <div className="flex gap-2">
          <Input
            placeholder="Add new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="flex-1"
          />
        </div>
      )}
    </div>
  );
};

export default TaskSection;