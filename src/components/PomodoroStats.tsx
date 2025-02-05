import React from 'react';

interface PomodoroStatsProps {
  totalPomodoros: number;
  totalMinutes: number;
  completedTasks: number;
}

export const PomodoroStats: React.FC<PomodoroStatsProps> = ({ totalPomodoros, totalMinutes, completedTasks }) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-gray-200">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-500">Total Focus Time Today</p>
          <p className="text-xl font-bold">
            {hours > 0 ? `${hours}u ${minutes}m` : `${minutes}m`}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completed Pomodoros</p>
          <p className="text-xl font-bold">{totalPomodoros}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Completed Tasks</p>
          <p className="text-xl font-bold">{completedTasks}</p>
        </div>
      </div>
    </div>
  );
};
