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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10">
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
      </div>
    </div>
  );
};
