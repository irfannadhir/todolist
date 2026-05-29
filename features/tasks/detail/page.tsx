"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskForm } from "@/features/tasks/components/task-form";
import { StatusBadge } from "@/features/tasks/components/status-badge";
import { type TaskItem, type TaskPayload } from "@/features/tasks/types/task";

type TaskDetailSectionProps = {
  task: TaskItem;
  onSubmit: (payload: Partial<TaskPayload>) => Promise<void>;
  onDelete: () => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
};

export function TaskDetailSection({
  task,
  onSubmit,
  onDelete,
  isUpdating,
  isDeleting,
}: TaskDetailSectionProps) {
  return (
    <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-2xl tracking-tight text-[#17171c]">Detail Task</h2>
        <StatusBadge status={task.status} />
      </div>
      <p className="mt-1 text-sm text-[#616161]">
        Perbarui status atau isi task sesuai progres terbaru.
      </p>

      <div className="mt-5">
        <TaskForm
          mode="edit"
          defaultValues={{
            title: task.title,
            description: task.description ?? "",
            status: task.status,
            dueDate: task.dueDate.slice(0, 10),
          }}
          onSubmit={onSubmit}
          isSubmitting={isUpdating}
          submitLabel="Update Task"
        />
      </div>

      <div className="mt-4">
        <ConfirmDialog
          title="Hapus Task"
          description={`Apakah Anda yakin ingin menghapus task "${task.title}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          isLoading={isDeleting}
          onConfirm={onDelete}
          trigger={<Button variant="destructive">Hapus Task</Button>}
        />
      </div>
    </section>
  );
}
