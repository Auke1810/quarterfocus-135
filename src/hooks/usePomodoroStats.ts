import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayPomodoroStats } from '@/lib/api';
import { useAuth } from '@/components/auth/AuthProvider';

export function usePomodoroStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ totalPomodoros: number; totalMinutes: number; completedTasks: number }>({ 
    totalPomodoros: 0, 
    totalMinutes: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const loadStats = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const stats = await getTodayPomodoroStats();
      setStats(stats);
    } catch (error) {
      if (error instanceof Error && error.message === "User not authenticated") {
        // This is expected when not logged in
        console.debug('User not authenticated, skipping pomodoro stats');
      } else {
        console.error('Error loading pomodoro stats:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(() => {
    // Clear any existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set a new timeout to refresh after 500ms
    refreshTimeoutRef.current = setTimeout(() => {
      loadStats();
    }, 500);
  }, [loadStats]);

  useEffect(() => {
    loadStats();

    // Cleanup timeout on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [loadStats]);

  return { ...stats, loading, refresh };
}
