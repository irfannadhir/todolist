import { z } from "zod";

import { TASK_STATUSES } from "@/features/tasks/types/task";

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskPayloadSchema = z.object({
  title: z.string().trim().min(1, "Judul task wajib diisi").max(120, "Maksimal 120 karakter"),
  description: z
    .string()
    .trim()
    .max(500, "Maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  status: taskStatusSchema.default("pending"),
  dueDate: z
    .string()
    .min(1, "Tanggal wajib diisi")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Format tanggal tidak valid"),
  dueTime: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isRecurring: z.boolean().optional().default(false),
});

export const taskUpdatePayloadSchema = taskPayloadSchema.partial().refine(
  (payload) => Object.keys(payload).length > 0,
  "Minimal satu field harus diupdate",
);

export const taskQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1970).max(9999).optional(),
});

export type TaskPayloadInput = z.infer<typeof taskPayloadSchema>;
export type TaskUpdatePayloadInput = z.infer<typeof taskUpdatePayloadSchema>;
