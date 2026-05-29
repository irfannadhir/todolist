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
      <p className="mt-1 text-sm text-[#616161]">Perbarui status atau isi task sesuai progres terbaru.</p>

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

      <button
        type="button"
        className="mt-4 inline-flex rounded-full border border-[#ff7759] px-4 py-2 text-sm font-medium text-[#ff7759] transition hover:bg-[#fff4ef] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Menghapus..." : "Hapus Task"}
      </button>
    </section>
  );
}
