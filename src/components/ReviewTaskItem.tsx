import React, { useState } from 'react';
import { Task } from '@/types/task';
import notesIcon from '@/assets/notes.svg';
import duplicateIcon from '@/assets/duplicate.svg';
import archiveIcon from '@/assets/archive.svg';
import { parseTaskInfo } from '@/types/task';

interface ReviewTaskItemProps {
  task: Task;
}

export const ReviewTaskItem: React.FC<ReviewTaskItemProps> = ({ task }) => {
  const [showNotes, setShowNotes] = useState(false);
  const parsedTask = parseTaskInfo(task);

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="flex items-center justify-between">
        <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.text}
        </span>
        <div className="flex items-center gap-2">
          {parsedTask.notes.length > 0 && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-1 hover:bg-gray-100 rounded"
              title="Bekijk notities"
            >
              <img src={notesIcon} alt="Notes" className="w-4 h-4" />
            </button>
          )}
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Dupliceer taak"
          >
            <img src={duplicateIcon} alt="Duplicate" className="w-4 h-4" />
          </button>
          <button
            className="p-1 hover:bg-gray-100 rounded"
            title="Archiveer taak"
          >
            <img src={archiveIcon} alt="Archive" className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {showNotes && parsedTask.notes.length > 0 && (
        <div className="ml-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          {parsedTask.notes.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
};
