"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  taskPayloadSchema,
  taskStatusSchema,
  taskUpdatePayloadSchema,
} from "@/features/tasks/schemas/task-schema";
import { TASK_STATUSES, type TaskPayload } from "@/features/tasks/types/task";

const formSchema = taskPayloadSchema.extend({
  status: taskStatusSchema,
  description: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

type BaseTaskFormProps = {
  defaultValues?: Partial<FormValues>;
  isSubmitting?: boolean;
  submitLabel: string;
};

type TaskFormProps =
  | (BaseTaskFormProps & {
      mode?: "create";
      onSubmit: (payload: TaskPayload) => Promise<void>;
    })
  | (BaseTaskFormProps & {
      mode: "edit";
      onSubmit: (payload: Partial<TaskPayload>) => Promise<void>;
    });

const statusLabelMap = {
  pending: "Pending",
  on_progress: "On Progress",
  hold: "Hold",
  done: "Done",
} as const;

export function TaskForm({
  mode = "create",
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel,
}: TaskFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      dueDate: defaultValues?.dueDate ?? "",
      status: defaultValues?.status ?? "pending",
    },
  });

  const submitHandler = form.handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate,
      status: values.status,
    } satisfies TaskPayload;

    if (mode === "edit") {
      const parsed = taskUpdatePayloadSchema.parse(payload);
      await (onSubmit as (payload: Partial<TaskPayload>) => Promise<void>)(parsed);
      return;
    }

    const parsed = taskPayloadSchema.parse(payload);
    await (onSubmit as (payload: TaskPayload) => Promise<void>)(parsed);
    form.reset({
      title: "",
      description: "",
      dueDate: "",
      status: "pending",
    });
  });

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-[#212121]">
          Judul Task
        </label>
        <input
          id="title"
          type="text"
          placeholder="Contoh: Update laporan sprint"
          className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-[#b30000]">{form.formState.errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium text-[#212121]">
          Deskripsi
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Detail singkat task"
          className="w-full resize-none rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
          {...form.register("description")}
        />
        {form.formState.errors.description ? (
          <p className="text-xs text-[#b30000]">{form.formState.errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-[#212121]">
            Tanggal
          </label>
          <input
            id="dueDate"
            type="date"
            className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("dueDate")}
          />
          {form.formState.errors.dueDate ? (
            <p className="text-xs text-[#b30000]">{form.formState.errors.dueDate.message}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-[#212121]">
            Status
          </label>
          <select
            id="status"
            className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("status")}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusLabelMap[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex rounded-full bg-[#17171c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#003c33] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
