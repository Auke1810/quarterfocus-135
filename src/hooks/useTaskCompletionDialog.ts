import { useState } from 'react';
import { Task } from '@/types/task';

interface UseTaskCompletionDialogReturn {
  isOpen: boolean;
  taskName: string;
  openCompletionDialog: (task: Task) => void;
  closeCompletionDialog: () => void;
}

export const useTaskCompletionDialog = (): UseTaskCompletionDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');

  const openCompletionDialog = (task: Task) => {
    // Gebruik de hele taak-tekst of alleen het begin als het te lang is
    const displayName = task.text.length > 50 
      ? `${task.text.substring(0, 47)}...` 
      : task.text;
    
    setTaskName(displayName);
    setIsOpen(true);
    
    // Sluit de dialog automatisch na 5 seconden
    setTimeout(() => {
      setIsOpen(false);
    }, 5000);
  };

  const closeCompletionDialog = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    taskName,
    openCompletionDialog,
    closeCompletionDialog
  };
};
