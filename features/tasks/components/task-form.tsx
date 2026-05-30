"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  taskPayloadSchema,
  taskUpdatePayloadSchema,
} from "@/features/tasks/schemas/task-schema";
import { TASK_STATUSES, type TaskPayload } from "@/features/tasks/types/task";

const formSchema = taskPayloadSchema;

type FormValues = z.input<typeof formSchema>;

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
      dueTime: defaultValues?.dueTime ?? "",
      dateFrom: defaultValues?.dateFrom ?? "",
      dateTo: defaultValues?.dateTo ?? "",
      isRecurring: defaultValues?.isRecurring ?? false,
    },
  });

  const isRecurring = Boolean(
    useWatch({
      control: form.control,
      name: "isRecurring",
    }),
  );

  const submitHandler = form.handleSubmit(async (values) => {
    const normalizedDueDate =
      values.isRecurring && values.dateFrom ? values.dateFrom : values.dueDate;

    const payload = {
      title: values.title,
      description: values.description,
      dueDate: normalizedDueDate,
      status: values.status ?? "pending",
      dueTime: values.dueTime,
      dateFrom: values.dateFrom,
      dateTo: values.dateTo,
      isRecurring: values.isRecurring,
    } satisfies TaskPayload;

    if (mode === "edit") {
      const parsed = taskUpdatePayloadSchema.parse(payload);
      await (onSubmit as (payload: Partial<TaskPayload>) => Promise<void>)(
        parsed,
      );
      return;
    }

    const parsed = taskPayloadSchema.parse(payload);
    await (onSubmit as (payload: TaskPayload) => Promise<void>)(parsed);
    form.reset({
      title: "",
      description: "",
      dueDate: "",
      status: "pending",
      dueTime: "",
      dateFrom: "",
      dateTo: "",
      isRecurring: false,
    });
  });

  const handleConfirmSubmit = async () => {
    const isValid = await form.trigger();

    if (!isValid) {
      throw new Error("Form task tidak valid");
    }

    await submitHandler();
  };

  return (
    <form onSubmit={submitHandler} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="text-sm font-medium text-[#212121]">
          Judul Task
        </label>
        <input
          id="title"
          type="text"
          placeholder="Contoh: Minum Obat"
          className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
          {...form.register("title")}
        />
        {form.formState.errors.title ? (
          <p className="text-xs text-[#b30000]">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-[#212121]"
        >
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
          <p className="text-xs text-[#b30000]">
            {form.formState.errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="dueDate"
            className="text-sm font-medium text-[#212121]"
          >
            Tanggal
          </label>
          <input
            id="dueDate"
            type="date"
            className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("dueDate")}
          />
          {form.formState.errors.dueDate ? (
            <p className="text-xs text-[#b30000]">
              {form.formState.errors.dueDate.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="dueTime"
            className="text-sm font-medium text-[#212121]"
          >
            Waktu Reminder
          </label>
          <input
            id="dueTime"
            type="time"
            className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
            {...form.register("dueTime")}
          />
          {form.formState.errors.dueTime ? (
            <p className="text-xs text-[#b30000]">
              {form.formState.errors.dueTime.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isRecurring"
          type="checkbox"
          {...form.register("isRecurring")}
          className="h-4 w-4 rounded border-[#d9d9dd] text-[#17171c] focus:ring-[#4c6ee6]"
        />
        <label htmlFor="isRecurring" className="text-sm text-[#212121]">
          Task Berulang (Date Range)
        </label>
      </div>

      {isRecurring && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="dateFrom"
              className="text-sm font-medium text-[#212121]"
            >
              Dari Tanggal
            </label>
            <input
              id="dateFrom"
              type="date"
              className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
              {...form.register("dateFrom")}
            />
            {form.formState.errors.dateFrom ? (
              <p className="text-xs text-[#b30000]">
                {form.formState.errors.dateFrom.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label
              htmlFor="dateTo"
              className="text-sm font-medium text-[#212121]"
            >
              Sampai Tanggal
            </label>
            <input
              id="dateTo"
              type="date"
              className="w-full rounded-md border border-[#d9d9dd] bg-white px-3 py-2 text-sm text-[#17171c] outline-none transition focus:border-[#4c6ee6] focus:ring-2 focus:ring-[#4c6ee6]/30"
              {...form.register("dateTo")}
            />
            {form.formState.errors.dateTo ? (
              <p className="text-xs text-[#b30000]">
                {form.formState.errors.dateTo.message}
              </p>
            ) : null}
          </div>
        </div>
      )}

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

      <ConfirmDialog
        title={mode === "edit" ? "Konfirmasi Update Task" : "Konfirmasi Simpan Task"}
        description={
          mode === "edit"
            ? "Apakah Anda yakin ingin menyimpan perubahan task ini?"
            : "Apakah Anda yakin ingin menyimpan task ini?"
        }
        confirmText={mode === "edit" ? "Ya, Update" : "Ya, Simpan"}
        cancelText="Batal"
        confirmVariant="default"
        isLoading={isSubmitting}
        onConfirm={handleConfirmSubmit}
        trigger={
          <Button type="button" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : submitLabel}
          </Button>
        }
      />
    </form>
  );
}
