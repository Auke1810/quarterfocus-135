export type TaskType = 'big' | 'medium' | 'small' | 'brain-dump';
export type ViewType = 'focus' | 'tomorrow' | 'week' | 'brain-dump';

export interface TaskStatus {
  id: number;
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const TaskStatusId = {
  IN_PROGRESS: 1,
  COMPLETED: 2,
  OPEN: 3,
  ARCHIVED: 4,
} as const;

export interface Task {
  id: string;
  text: string;
  task_type: TaskType;
  status_id: number;
  scheduled_for: string;
  info?: string;
  position?: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskWithParsedInfo extends Task {
  notes: string[];
  subtasks: {
    text: string;
    completed: boolean;
  }[];
}

export function parseTaskInfo(task: Task): TaskWithParsedInfo {
  const lines = task.info?.split('\n') || [];
  const notes: string[] = [];
  const subtasks: { text: string; completed: boolean; }[] = [];

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('- ')) {
      // Subtask format: "- [ ] task" or "- [x] task"
      const taskText = trimmedLine.slice(2).trim();
      if (taskText.startsWith('[')) {
        const completed = taskText[1].toLowerCase() === 'x';
        const text = taskText.slice(4).trim();
        subtasks.push({ text, completed });
      } else {
        // If no checkbox, treat as uncompleted subtask
        subtasks.push({ text: taskText, completed: false });
      }
    } else if (trimmedLine) {
      notes.push(trimmedLine);
    }
  });

  return {
    ...task,
    notes,
    subtasks
  };
}

export interface UseTasksOptions {
  viewType: ViewType;
  date?: Date;
}

export interface UserSettings {
  focus_text?: string;
  pomodoro_duration?: number;
  short_break_duration?: number;
  long_break_duration?: number;
  pomodoros_until_long_break?: number;
}
