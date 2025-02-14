import React from 'react';
import PomodoroTimer from './PomodoroTimer';

interface PomodoroOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  taskId?: string;
  onTimerComplete?: () => void;
}

export const PomodoroOverlay: React.FC<PomodoroOverlayProps> = ({
  isOpen,
  onClose,
  taskId,
  onTimerComplete,
}) => {
  if (!isOpen) return null;

  return (
    <PomodoroTimer
      workTime={50}
      breakTime={10}
      onTimerComplete={() => {
        onTimerComplete?.();
        onClose();
      }}
      onTimerStop={onClose}
      taskId={taskId}
      autoStart={true}
    />
  );
};
