"use client";

import { addMonths, format, isSameDay, parseISO, subMonths } from "date-fns";
import { useMemo, useState } from "react";

import { TaskCalendar } from "@/features/tasks/components/task-calendar";
import { TaskList } from "@/features/tasks/components/task-list";
import { TaskCreateSection } from "@/features/tasks/create/page";
import { TaskDetailSection } from "@/features/tasks/detail/page";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks/use-tasks";
import { type TaskItem, type TaskPayload, type TaskStatus } from "@/features/tasks/types/task";

const EMPTY_TASKS: TaskItem[] = [];

export default function TasksPage() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filters = useMemo(
    () => ({ month: Number(format(monthDate, "M")), year: Number(format(monthDate, "yyyy")) }),
    [monthDate],
  );

  const tasksQuery = useTasks(filters);
  const createMutation = useCreateTask(filters);
  const updateMutation = useUpdateTask(filters);
  const deleteMutation = useDeleteTask(filters);

  const tasks = tasksQuery.data ?? EMPTY_TASKS;

  const selectedDateTasks = useMemo(
    () => tasks.filter((task) => isSameDay(parseISO(task.dueDate), selectedDate)),
    [tasks, selectedDate],
  );

  const resetError = () => setErrorMessage(null);

  const handleCreate = async (payload: TaskPayload) => {
    try {
      resetError();
      await createMutation.mutateAsync(payload);
      setSelectedDate(parseISO(payload.dueDate));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat task");
    }
  };

  const handleUpdate = async (payload: Partial<TaskPayload>) => {
    if (!activeTask) {
      return;
    }

    try {
      resetError();
      await updateMutation.mutateAsync({ id: activeTask.id, payload });
      setActiveTask(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal memperbarui task");
    }
  };

  const handleDelete = async (task: TaskItem) => {
    try {
      resetError();
      await deleteMutation.mutateAsync(task.id);
      if (activeTask?.id === task.id) {
        setActiveTask(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus task");
    }
  };

  const handleQuickStatusChange = async (task: TaskItem, status: TaskStatus) => {
    if (task.status === status) {
      return;
    }

    try {
      resetError();
      await updateMutation.mutateAsync({
        id: task.id,
        payload: { status },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengubah status task");
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="rounded-[22px] bg-[#003c33] p-6 text-white sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffad9b]">Daily Tracker</p>
        <h1 className="mt-2 text-4xl leading-tight tracking-tight sm:text-5xl">Tasklist Harian</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#edfce9] sm:text-base">
          Kelola pekerjaan harian dengan status terstruktur: pending, on progress, hold, dan done.
          Gunakan kalender untuk melihat ritme kerja setiap tanggal.
        </p>
      </section>

      {errorMessage ? (
        <div className="mt-6 rounded-md border border-[#ffad9b] bg-[#fff4ef] px-4 py-3 text-sm text-[#b30000]">
          {errorMessage}
        </div>
      ) : null}

      {tasksQuery.isError ? (
        <div className="mt-6 rounded-md border border-[#ffad9b] bg-[#fff4ef] px-4 py-3 text-sm text-[#b30000]">
          Gagal memuat task. Pastikan database dan migrasi Prisma sudah siap.
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskCalendar
          monthDate={monthDate}
          selectedDate={selectedDate}
          tasks={tasks}
          onSelectDate={setSelectedDate}
          onChangeMonth={(value) => {
            const nextMonth = value === "next" ? addMonths(monthDate, 1) : subMonths(monthDate, 1);
            setMonthDate(nextMonth);
          }}
        />

        <TaskCreateSection onSubmit={handleCreate} isSubmitting={createMutation.isPending} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <TaskList
          tasks={selectedDateTasks}
          onEdit={setActiveTask}
          onDelete={handleDelete}
          onQuickStatusChange={handleQuickStatusChange}
        />

        {activeTask ? (
          <TaskDetailSection
            task={activeTask}
            onSubmit={handleUpdate}
            onDelete={() => handleDelete(activeTask)}
            isUpdating={updateMutation.isPending}
            isDeleting={deleteMutation.isPending}
          />
        ) : (
          <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
            <h2 className="text-2xl tracking-tight text-[#17171c]">Detail Task</h2>
            <p className="mt-1 text-sm text-[#616161]">
              Klik tombol edit pada task untuk membuka detail dan memperbarui data.
            </p>
          </section>
        )}
      </div>

      {(tasksQuery.isLoading || createMutation.isPending || updateMutation.isPending) && (
        <p className="mt-4 text-sm text-[#616161]">Memproses data task...</p>
      )}
    </div>
  );
}
