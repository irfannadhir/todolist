import { z } from "zod";

import { TASK_STATUSES } from "@/features/tasks/types/task";

export const taskStatusSchema = z.enum(TASK_STATUSES);

const optionalDateSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || !Number.isNaN(Date.parse(value)),
    "Format tanggal tidak valid",
  );

const optionalTimeSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine(
    (value) => !value || /^([01]\d|2[0-3]):[0-5]\d$/.test(value),
    "Format waktu harus HH:mm",
  );

const taskPayloadBaseSchema = z.object({
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
  dueTime: optionalTimeSchema,
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  isRecurring: z.boolean().optional().default(false),
});

function applyRecurringValidation(
  payload: {
    isRecurring?: boolean;
    dateFrom?: string;
    dateTo?: string;
  },
  context: z.RefinementCtx,
) {
  if (!payload.isRecurring) {
    return;
  }

  if (!payload.dateFrom) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal mulai wajib diisi untuk task berulang",
      path: ["dateFrom"],
    });
  }

  if (!payload.dateTo) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal akhir wajib diisi untuk task berulang",
      path: ["dateTo"],
    });
  }

  if (payload.dateFrom && payload.dateTo) {
    const dateFrom = new Date(payload.dateFrom);
    const dateTo = new Date(payload.dateTo);

    if (dateFrom.getTime() > dateTo.getTime()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Tanggal akhir harus sama atau setelah tanggal mulai",
        path: ["dateTo"],
      });
    }
  }
}

export const taskPayloadSchema = taskPayloadBaseSchema.superRefine(
  applyRecurringValidation,
);

export const taskUpdatePayloadSchema = taskPayloadBaseSchema
  .partial()
  .superRefine((payload, context) => {
    if (Object.keys(payload).length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal satu field harus diupdate",
      });
    }

    applyRecurringValidation(payload, context);
  });

export const taskQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(1970).max(9999).optional(),
  dateFrom: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "dateFrom tidak valid"),
  dateTo: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "dateTo tidak valid"),
  groupBy: z.enum(["recurring"]).optional(),
});

export type TaskPayloadInput = z.infer<typeof taskPayloadSchema>;
export type TaskUpdatePayloadInput = z.infer<typeof taskUpdatePayloadSchema>;
