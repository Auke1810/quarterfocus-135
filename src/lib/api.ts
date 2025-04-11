import { supabase } from "./supabase";
import { TaskStatusId } from "@/types/task";

export type TaskType = "big" | "medium" | "small";

export async function getTasks(type: TaskType) {
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("task_type", type)
    .order("created_at", { ascending: true });

  if (tasksError) throw tasksError;

  // Haal Pomodoro counts op voor alle taken
  const tasksWithPomodoro = await Promise.all(
    tasks.map(async (task) => {
      const pomodoroCount = await getTaskPomodoroCount(task.id);
      return { ...task, pomodoroCount };
    })
  );

  return tasksWithPomodoro;
}

export async function createTask(text: string, type: TaskType) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        text,
        task_type: type,
        user_id: user.id,
        status_id: TaskStatusId.IN_PROGRESS,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: { completed?: boolean, status_id?: number }) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}

export async function createPomodoroSession(
  taskId: string,
  durationMinutes: number,
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert([
      {
        task_id: taskId,
        duration_minutes: durationMinutes,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completePomodoroSession(sessionId: string, actualDurationMinutes: number) {
  // First get the current session to verify it exists and isn't already completed
  const { data: session } = await supabase
    .from("pomodoro_sessions")
    .select('id, completed_at')
    .eq("id", sessionId)
    .single();

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.completed_at) {
    // Session already completed, no need to update
    return session;
  }

  const { data, error } = await supabase
    .rpc('complete_pomodoro_session', { 
      session_id: sessionId,
      actual_duration: actualDurationMinutes,
      completion_time: new Date().toISOString()
    });

  if (error) throw error;
  return data;
}

export async function getTaskPomodoroCount(taskId: string) {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("task_id", taskId)
    .not("completed_at", "is", null);

  if (error) throw error;
  return data.length;
}

export async function getTodayPomodoroStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Get completed pomodoro sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_break", false)
    .gte("started_at", today.toISOString())
    .not("completed_at", "is", null);

  if (sessionsError) throw sessionsError;

  // Get completed tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("status_id", TaskStatusId.COMPLETED)
    .gte("updated_at", today.toISOString());

  if (tasksError) throw tasksError;

  const totalPomodoros = sessions.length;
  const totalMinutes = sessions.reduce((acc, session) => acc + session.duration_minutes, 0);

  return {
    totalPomodoros,
    totalMinutes,
    completedTasks: tasks.length,
  };
}

export async function updateTaskInfo(id: string, info: string) {
  const { error } = await supabase
    .from("tasks")
    .update({ info })
    .eq("id", id);

  if (error) throw error;
}

export async function getTaskInfo(id: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export interface UserPreferences {
  pomodoroFocusLength: number;
  pomodoroShortBreakLength: number;
  pomodoroLongBreakLength: number;
  workStartTime: string;
  workEndTime: string;
  googleCalendarConnected?: boolean;
  selectedCalendars?: string[];
}

export async function saveUserPreferences(preferences: UserPreferences) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      focus_length: preferences.pomodoroFocusLength,
      short_break_length: preferences.pomodoroShortBreakLength,
      long_break_length: preferences.pomodoroLongBreakLength,
      work_start_time: preferences.workStartTime,
      work_end_time: preferences.workEndTime,
      google_calendar_connected: preferences.googleCalendarConnected || false,
      selected_calendars: preferences.selectedCalendars || []
    }, {
      onConflict: 'user_id'
    });

  if (error) throw error;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("user_settings")
    .select("focus_length, short_break_length, long_break_length, work_start_time, work_end_time, google_calendar_connected, selected_calendars")
    .eq("user_id", user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // Record not found
      return null;
    }
    throw error;
  }

  if (!data) return null;

  return {
    pomodoroFocusLength: data.focus_length,
    pomodoroShortBreakLength: data.short_break_length,
    pomodoroLongBreakLength: data.long_break_length,
    workStartTime: data.work_start_time,
    workEndTime: data.work_end_time,
    googleCalendarConnected: data.google_calendar_connected || false,
    selectedCalendars: data.selected_calendars || []
  };
}
