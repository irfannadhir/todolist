import { type TaskFilters, type TaskItem, type TaskPayload } from "@/features/tasks/types/task";
import { getAuthorizationHeader } from "@/lib/auth-client";

const API_BASE = "/api/tasks";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const authorizationHeader = getAuthorizationHeader();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeader,
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Terjadi kesalahan");
  }

  if (!body) {
    throw new Error("Response API tidak valid");
  }

  return body.data;
}

export async function getTasks(filters?: TaskFilters): Promise<TaskItem[]> {
  const params = new URLSearchParams();

  if (filters?.month) {
    params.set("month", String(filters.month));
  }

  if (filters?.year) {
    params.set("year", String(filters.year));
  }

  if (filters?.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters?.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  if (filters?.groupBy) {
    params.set("groupBy", filters.groupBy);
  }

  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;

  return request<TaskItem[]>(url);
}

export async function createTask(payload: TaskPayload): Promise<TaskItem> {
  return request<TaskItem>(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: string, payload: Partial<TaskPayload>): Promise<TaskItem> {
  return request<TaskItem>(`${API_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(id: string): Promise<void> {
  await request<null>(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}
