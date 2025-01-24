import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Card } from "./ui/card";
import { Play, Pause, RotateCcw, Square } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { createPomodoroSession, completePomodoroSession } from "@/lib/api";

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
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [progress, setProgress] = useState(100);
  const [isBreak, setIsBreak] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

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
    toast,
  ]);

  const handleTimerComplete = async () => {
    if (currentSessionId) {
      try {
        await completePomodoroSession(currentSessionId);
      } catch (error) {
        console.error("Error completing pomodoro session:", error);
      }
    }

    onTimerComplete();

    if (isBreak) {
      setIsBreak(false);
      setTimeLeft(workTime * 60);
      setProgress(100);
      toast({
        title: "Break Complete!",
        description: "Time to get back to work!",
      });
    } else {
      setIsBreak(true);
      setTimeLeft(breakTime * 60);
      setProgress(100);
      toast({
        title: "Work Session Complete!",
        description: "Time for a break!",
      });
    }
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
    setIsRunning(false);
    if (currentSessionId) {
      try {
        await completePomodoroSession(currentSessionId);
        setCurrentSessionId(null);
      } catch (error) {
        console.error("Error completing pomodoro session:", error);
      }
    }
    setTimeLeft(workTime * 60);
    setProgress(100);
    setIsBreak(false);
    onTimerStop();
    toast({
      title: "Timer Stopped",
      description: "Pomodoro session has been stopped",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="p-6 bg-white w-full max-w-[360px]">
      <div className="flex flex-col items-center gap-4">
        <div className="text-4xl font-bold text-primary">
          {formatTime(timeLeft)}
        </div>

        <Progress value={progress} className="w-full h-2" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTimer}
            className="w-12 h-12"
          >
            {isRunning ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={resetTimer}
            className="w-12 h-12"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={stopTimer}
            className="w-12 h-12"
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroTimer;
