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

export async function completePomodoroSession(sessionId: string) {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .select()
    .single();

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
    .select("info")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data?.info;
}
