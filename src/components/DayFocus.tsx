import React, { useState } from 'react';
import { Input } from './ui/input';
import { DailyFocusDialog } from './DailyFocusDialog';
import { useDailyFocusPrompt } from '@/hooks/useDailyFocusPrompt';

interface DayFocusProps {
  focus: string;
  onUpdateFocus: (focus: string) => Promise<void>;
}

export const DayFocus: React.FC<DayFocusProps> = ({ focus, onUpdateFocus }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(focus);
  const { isDialogOpen, setIsDialogOpen } = useDailyFocusPrompt(focus, onUpdateFocus);

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
          placeholder="Wat is je belangrijkste focus voor vandaag?"
          className="text-muted-foreground"
        />
      ) : (
        <div
          className="cursor-pointer text-muted-foreground hover:text-foreground text-sm font-medium pl-2"
          onClick={() => {
            setIsEditing(true);
            setEditText(focus);
          }}
        >
          {focus || "Klik om focus voor vandaag in te stellen"}
        </div>
      )}
      
      <DailyFocusDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSaveFocus={onUpdateFocus}
        defaultFocus={focus || ""}
      />
    </div>
  );
};
