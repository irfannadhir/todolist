import { TaskForm } from "@/features/tasks/components/task-form";
import { type TaskPayload } from "@/features/tasks/types/task";

type TaskCreateSectionProps = {
  onSubmit: (payload: TaskPayload) => Promise<void>;
  isSubmitting: boolean;
  defaultValues?: Partial<TaskPayload>;
};

export function TaskCreateSection({
  onSubmit,
  isSubmitting,
  defaultValues,
}: TaskCreateSectionProps) {
  const formKey = `${defaultValues?.dueDate ?? ""}-${defaultValues?.dateFrom ?? ""}-${defaultValues?.dateTo ?? ""}-${String(defaultValues?.isRecurring ?? false)}`;

  return (
    <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
      <h2 className="text-2xl tracking-tight text-[#17171c]">Buat Task Harian</h2>
      <p className="mt-1 text-sm text-[#616161]">Isi detail task lalu simpan ke agenda harian.</p>
      <div className="mt-5">
        <TaskForm
          key={formKey}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          submitLabel="Simpan Task"
        />
      </div>
    </section>
  );
}
