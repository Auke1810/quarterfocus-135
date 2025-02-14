import React, { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Play, Pause, RotateCcw, Square, Minimize2, Maximize2 } from "lucide-react";
import { CustomAlert } from "./ui/CustomAlert";
import { createPomodoroSession, completePomodoroSession, getUserPreferences, getTaskInfo } from "@/lib/api";
import { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface PomodoroTimerProps {
  workTime?: number;
  breakTime?: number;
  onTimerComplete?: () => void;
  onTimerStop?: () => void;
  taskId?: string;
  autoStart?: boolean;
}

const PomodoroTimer = ({
  workTime = 50,
  breakTime = 10,
  onTimerComplete = () => {},
  onTimerStop = () => {},
  taskId,
  autoStart = false,
}: PomodoroTimerProps) => {
  const [alert, setAlert] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [progress, setProgress] = useState(100);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState({
    pomodoroFocusLength: workTime,
    pomodoroShortBreakLength: breakTime,
    pomodoroLongBreakLength: 15
  });

  // Load preferences and listen for changes
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load preferences from both chrome.storage and Supabase
        const [chromePrefs, supabasePrefs] = await Promise.all([
          chrome.storage.sync.get(['userPreferences']),
          getUserPreferences()
        ]);

        // Use Supabase preferences if available, otherwise use chrome.storage
        const prefs = supabasePrefs || (chromePrefs.userPreferences ? {
          pomodoroFocusLength: chromePrefs.userPreferences.pomodoroFocusLength,
          pomodoroShortBreakLength: chromePrefs.userPreferences.pomodoroShortBreakLength,
          pomodoroLongBreakLength: chromePrefs.userPreferences.pomodoroLongBreakLength,
          workStartTime: chromePrefs.userPreferences.workStartTime,
          workEndTime: chromePrefs.userPreferences.workEndTime
        } : null);

        if (prefs) {
          updateTimerSettings(prefs);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    // Listen for changes in chrome.storage
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.userPreferences) {
        const newPrefs = changes.userPreferences.newValue;
        if (newPrefs) {
          updateTimerSettings(newPrefs);
        }
      }
    };

    // Add storage change listener
    chrome.storage.onChanged.addListener(handleStorageChange);
    loadPreferences();

    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Handle timer settings updates
  const updateTimerSettings = useCallback((prefs: any) => {
    const newPreferences = {
      pomodoroFocusLength: prefs.pomodoroFocusLength,
      pomodoroShortBreakLength: prefs.pomodoroShortBreakLength,
      pomodoroLongBreakLength: prefs.pomodoroLongBreakLength
    };
    
    setPreferences(newPreferences);

    // Only update timeLeft if timer is not running
    if (!isRunning) {
      setTimeLeft(isBreak ? 
        newPreferences.pomodoroShortBreakLength * 60 : 
        newPreferences.pomodoroFocusLength * 60
      );
    }
  }, [isBreak, isRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (autoStart && taskId && !isBreak) {
      createPomodoroSession(taskId, workTime)
        .then((session) => {
          setCurrentSessionId(session.id);
        })
        .catch((error) => {
          console.error("Error creating pomodoro session:", error);
        });
    }
  }, [autoStart, taskId, workTime]);

  useEffect(() => {
    let timer: number;

    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          setProgress(
            (newTime / ((isBreak ? breakTime : workTime) * 60)) * 100,
          );
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    isRunning,
    timeLeft,
    workTime,
    breakTime,
    isBreak,
    onTimerComplete,
    setAlert,
  ]);

  // Play notification sound
  const playNotificationSound = useCallback((isBreakTime: boolean) => {
    const audio = new Audio();
    audio.src = isBreakTime ? 
      chrome.runtime.getURL('assets/break-complete.mp3') : 
      chrome.runtime.getURL('assets/focus-complete.mp3');
    audio.play().catch(error => {
      console.error('Error playing notification sound:', error);
    });
  }, []);

  const handleTimerComplete = async () => {
    // First handle session completion if needed
    if (currentSessionId) {
      try {
        await completePomodoroSession(currentSessionId, workTime);
        setCurrentSessionId(null); // Clear the session ID after completion
      } catch (error) {
        console.error("Error completing pomodoro session:", error);
      }
    }

    // Notify parent component
    onTimerComplete();

    // Stop the current timer
    setIsRunning(false);

    // Use a small delay to ensure state updates are processed
    setTimeout(() => {
      if (isBreak) {
        // After break, prepare for focus time but don't auto-start
        setIsBreak(false);
        setTimeLeft(workTime * 60);
        setProgress(100);
        setAlert('Break complete! Click play to start your next focus session.');
        playNotificationSound(true);
      } else {
        // After focus time, auto-start break
        setIsBreak(true);
        setTimeLeft(breakTime * 60);
        setProgress(100);
        setIsRunning(true); // Auto-start break timer
        setAlert('Focus session complete! Break started automatically.');
        playNotificationSound(false);
      }
    }, 100); // Small delay to ensure clean state transition
  };

  const toggleTimer = async () => {
    if (!isRunning && taskId && !isBreak) {
      try {
        const session = await createPomodoroSession(taskId, workTime);
        setCurrentSessionId(session.id);
      } catch (error) {
        console.error("Error creating pomodoro session:", error);
      }
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(workTime * 60);
    setIsBreak(false);
    setProgress(100);
    setCurrentSessionId(null);
  };

  const stopTimer = async () => {
    // Don't show confirmation if timer hasn't started
    if (!isRunning && timeLeft === workTime * 60) {
      return;
    }

    const actualDurationMinutes = Math.ceil((workTime * 60 - timeLeft) / 60);
    const confirmMessage = `Are you sure you want to stop the Pomodoro session? You've worked for ${actualDurationMinutes} minutes.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    setIsRunning(false);
    if (currentSessionId) {
      try {
        // actualDurationMinutes is already calculated above
        await completePomodoroSession(currentSessionId, actualDurationMinutes);
        setCurrentSessionId(null);

        // Show different messages based on when the timer was stopped
        if (timeLeft === workTime * 60) {
          setAlert('Pomodoro session cancelled before starting.');
        } else if (actualDurationMinutes < workTime) {
          setAlert(`Pomodoro stopped after ${actualDurationMinutes} minutes. A full session lasts ${workTime} minutes.`);
        } else {
          setAlert('Pomodoro session completed!');
        }
      } catch (error) {
        console.error("Error completing pomodoro session:", error);
      }
    }
    setTimeLeft(workTime * 60);
    setProgress(100);
    setIsBreak(false);
    onTimerStop();
  };

  const [taskInfo, setTaskInfo] = useState<Task | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  // Load task information when taskId changes
  useEffect(() => {
    if (taskId) {
      getTaskInfo(taskId)
        .then((task) => {
          setTaskInfo(task);
        })
        .catch((error) => {
          console.error("Error fetching task info:", error);
        });
    }
  }, [taskId]);

  const toggleCompactMode = () => {
    setIsCompact(!isCompact);
  };

  if (isCompact) {
    return (
      <div 
        className="fixed bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg p-3 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer z-50"
        onClick={toggleCompactMode}
      >
        <div className="text-2xl font-bold text-gray-900">
          {formatTime(timeLeft)}
        </div>
        <div 
          className="h-2 w-2 rounded-full animate-pulse" 
          style={{ backgroundColor: isRunning ? (isBreak ? '#10B981' : '#3B82F6') : '#6B7280' }} 
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl p-8 shadow-xl w-[400px]">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCompactMode}
          className="absolute top-2 right-2 h-8 w-8 hover:bg-gray-100"
        >
          <Minimize2 className="h-4 w-4 text-gray-600" />
        </Button>

        {alert && <CustomAlert message={alert} onClose={() => setAlert(null)} />}
        
        {taskInfo && (
          <div className="w-full text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{taskInfo.text}</h3>
            {taskInfo.info && (
              <p className="text-sm text-gray-600">{taskInfo.info}</p>
            )}
          </div>
        )}

        <div className="text-5xl font-bold text-gray-900 text-center mb-4">
          {formatTime(timeLeft)}
        </div>

        <div className="text-lg text-gray-600 text-center mb-6">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </div>
        
        <Progress value={progress} className="w-full h-2 mb-6" />
        
        <div className="flex items-center gap-4 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="h-12 w-12 bg-gray-100 hover:bg-gray-200 border-gray-200"
          >
            {isRunning ? <Pause className="h-6 w-6 text-gray-600" /> : <Play className="h-6 w-6 text-gray-600" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="h-12 w-12 bg-gray-100 hover:bg-gray-200 border-gray-200"
          >
            <RotateCcw className="h-6 w-6 text-gray-600" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={stopTimer}
            className="h-12 w-12 bg-gray-100 hover:bg-gray-200 border-gray-200"
          >
            <Square className="h-6 w-6 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
