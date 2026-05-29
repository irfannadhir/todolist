import { type UserItem, type UserPayload, type UserUpdatePayload } from "@/features/users/types/user";

const API_BASE = "/api/users";

type ApiResponse<T> = {
  data: T;
  message?: string;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
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

export async function getUsers(): Promise<UserItem[]> {
  return request<UserItem[]>(API_BASE);
}

export async function createUser(payload: UserPayload): Promise<UserItem> {
  return request<UserItem>(API_BASE, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string, payload: UserUpdatePayload): Promise<UserItem> {
  return request<UserItem>(`${API_BASE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await request<null>(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}
