import React, { useState } from 'react';
import { Input } from './ui/input';

interface DayFocusProps {
  focus: string;
  onUpdateFocus: (focus: string) => Promise<void>;
}

export const DayFocus: React.FC<DayFocusProps> = ({ focus, onUpdateFocus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(focus);

  const handleUpdate = async () => {
    if (editText.trim() !== focus) {
      await onUpdateFocus(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUpdate();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(focus);
    }
  };

  return (
    <div className="mb-6">
      {isEditing ? (
        <Input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={handleKeyDown}
          placeholder="What's your main focus for today?"
          className="text-muted-foreground"
        />
      ) : (
        <div
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={() => {
            setIsEditing(true);
            setEditText(focus);
          }}
        >
          {focus || "Click to set today's focus"}
        </div>
      )}
    </div>
  );
};
