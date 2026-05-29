"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "@/features/tasks/services/task-service";
import { type TaskFilters, type TaskPayload } from "@/features/tasks/types/task";

const queryKey = (filters?: TaskFilters) => [
  "tasks",
  filters?.month,
  filters?.year,
  filters?.dateFrom,
  filters?.dateTo,
  filters?.groupBy,
];

export function useTasks(filters?: TaskFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKey(filters),
    queryFn: () => getTasks(filters),
    enabled: options?.enabled,
  });
}

export function useCreateTask(filters?: TaskFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskPayload) => createTask(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey(filters) });
    },
  });
}

export function useUpdateTask(filters?: TaskFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TaskPayload> }) =>
      updateTask(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey(filters) });
    },
  });
}

export function useDeleteTask(filters?: TaskFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKey(filters) });
    },
  });
}
