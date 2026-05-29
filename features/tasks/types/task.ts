export const TASK_STATUSES = ["pending", "on_progress", "hold", "done"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskPayload = {
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate: string;
};

export type TaskFilters = {
  month?: number;
  year?: number;
};
