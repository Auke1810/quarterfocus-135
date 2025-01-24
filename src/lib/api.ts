import { supabase } from "./supabase";

export type TaskType = "big" | "medium" | "small";

export async function getTasks(type: TaskType) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("task_type", type)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createTask(text: string, type: TaskType) {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        text,
        task_type: type,
        user_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTask(id: string, updates: { completed?: boolean }) {
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
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) throw error;
}

export async function createPomodoroSession(
  taskId: string,
  durationMinutes: number,
) {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert([
      {
        task_id: taskId,
        duration_minutes: durationMinutes,
        user_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
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
