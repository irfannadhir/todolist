"use client";

import { addMonths, format, isSameDay, parseISO, subMonths } from "date-fns";
import { useMemo, useState } from "react";

import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { TaskCalendar } from "@/features/tasks/components/task-calendar";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TaskList } from "@/features/tasks/components/task-list";
import { useToast } from "@/components/ui/toast";
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
  const [selectedDates, setSelectedDates] = useState<Date[]>(() => [new Date()]);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const toast = useToast();

  const filters = useMemo(
    () => ({ month: Number(format(monthDate, "M")), year: Number(format(monthDate, "yyyy")) }),
    [monthDate],
  );

  const tasksQuery = useTasks(filters);
  const selectedRange = useMemo(() => {
    if (selectedDates.length <= 1) {
      return null;
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    return {
      dateFrom: format(sortedDates[0], "yyyy-MM-dd"),
      dateTo: format(sortedDates[sortedDates.length - 1], "yyyy-MM-dd"),
    };
  }, [selectedDates]);

  const groupedRangeTasksQuery = useTasks(
    selectedRange
      ? {
          ...selectedRange,
          groupBy: "recurring",
        }
      : undefined,
    { enabled: Boolean(selectedRange) },
  );
  const createMutation = useCreateTask(filters);
  const updateMutation = useUpdateTask(filters);
  const deleteMutation = useDeleteTask(filters);

  const tasks = tasksQuery.data ?? EMPTY_TASKS;

  const selectedDateTasks = useMemo(() => {
    if (selectedDates.length > 1) {
      return groupedRangeTasksQuery.data ?? EMPTY_TASKS;
    }

    if (selectedDates.length <= 1) {
      return tasks.filter((task) => isSameDay(parseISO(task.dueDate), selectedDate));
    }
    return EMPTY_TASKS;
  }, [groupedRangeTasksQuery.data, selectedDate, selectedDates, tasks]);

  const createFormDefaultValues = useMemo(() => {
    if (selectedDates.length === 0) {
      return undefined;
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const firstDate = format(sortedDates[0], "yyyy-MM-dd");
    const lastDate = format(sortedDates[sortedDates.length - 1], "yyyy-MM-dd");

    return {
      dueDate: firstDate,
      dateFrom: firstDate,
      dateTo: lastDate,
      isRecurring: sortedDates.length > 1,
    };
  }, [selectedDates]);

  const editFormDefaultValues = useMemo(() => {
    if (!activeTask) {
      return undefined;
    }

    return {
      title: activeTask.title,
      description: activeTask.description ?? "",
      status: activeTask.status,
      dueDate: activeTask.dueDate.slice(0, 10),
      dueTime: activeTask.dueTime ?? "",
      dateFrom: activeTask.dateFrom?.slice(0, 10) ?? "",
      dateTo: activeTask.dateTo?.slice(0, 10) ?? "",
      isRecurring: activeTask.isRecurring,
    };
  }, [activeTask]);

  const taskFormKey = useMemo(() => {
    if (activeTask) {
      return `edit-${activeTask.id}`;
    }

    return `create-${createFormDefaultValues?.dueDate ?? ""}-${createFormDefaultValues?.dateFrom ?? ""}-${createFormDefaultValues?.dateTo ?? ""}-${String(createFormDefaultValues?.isRecurring ?? false)}`;
  }, [activeTask, createFormDefaultValues]);

  const resetError = () => setErrorMessage(null);

  const handleCreate = async (payload: TaskPayload) => {
    try {
      resetError();
      await createMutation.mutateAsync(payload);
      const nextSelectedDate =
        payload.isRecurring && payload.dateFrom ? payload.dateFrom : payload.dueDate;
      setSelectedDate(parseISO(nextSelectedDate));
      setSelectedDates([parseISO(nextSelectedDate)]);
      setIsTaskModalOpen(false);
      toast.success({
        title: "Task berhasil disimpan",
        description: payload.isRecurring ? "Task berulang berhasil dibuat." : "Task baru berhasil dibuat.",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat task";
      setErrorMessage(message);
      toast.error({ title: "Gagal menyimpan task", description: message });
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
      setIsTaskModalOpen(false);
      toast.success({ title: "Task berhasil diperbarui" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui task";
      setErrorMessage(message);
      toast.error({ title: "Gagal memperbarui task", description: message });
    }
  };

  const handleDelete = async (task: TaskItem) => {
    try {
      resetError();
      await deleteMutation.mutateAsync(task.id);
      if (activeTask?.id === task.id) {
        setActiveTask(null);
      }
      toast.success({ title: "Task berhasil dihapus" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal menghapus task";
      setErrorMessage(message);
      toast.error({ title: "Gagal menghapus task", description: message });
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
      toast.success({ title: `Status task diubah ke ${status.replace("_", " ")}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengubah status task";
      setErrorMessage(message);
      toast.error({ title: "Gagal mengubah status", description: message });
    }
  };

  const openCreateModal = () => {
    setActiveTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: TaskItem) => {
    setActiveTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <section className="rounded-[22px] bg-[#003c33] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffad9b]">Daily Tracker</p>
            <h1 className="mt-2 text-4xl leading-tight tracking-tight sm:text-5xl">Tasklist Harian</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#edfce9] sm:text-base">
              Kelola pekerjaan harian dengan status terstruktur: pending, on progress, hold, dan done.
              Gunakan kalender untuk melihat ritme kerja setiap tanggal.
            </p>
          </div>
          <Button onClick={openCreateModal}>Tambah Task</Button>
        </div>
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

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <TaskCalendar
          monthDate={monthDate}
          selectedDate={selectedDate}
          selectedDates={selectedDates}
          tasks={tasks}
          onSelectDate={setSelectedDate}
          onSelectDateRange={setSelectedDates}
          onChangeMonth={(value) => {
            const nextMonth = value === "next" ? addMonths(monthDate, 1) : subMonths(monthDate, 1);
            setMonthDate(nextMonth);
          }}
        />

        <TaskList
          tasks={selectedDateTasks}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onQuickStatusChange={handleQuickStatusChange}
        />
      </div>

      {(tasksQuery.isLoading || createMutation.isPending || updateMutation.isPending) && (
        <p className="mt-4 text-sm text-[#616161]">Memproses data task...</p>
      )}

      <Dialog
        open={isTaskModalOpen}
        onOpenChange={(open) => {
          setIsTaskModalOpen(open);
          if (!open) {
            setActiveTask(null);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeTask ? "Edit Task" : "Tambah Task"}</DialogTitle>
            <DialogDescription>
              {activeTask
                ? "Perbarui detail task sesuai progres terbaru."
                : "Isi detail task lalu simpan ke agenda harian."}
            </DialogDescription>
          </DialogHeader>
          {activeTask ? (
            <TaskForm
              key={taskFormKey}
              mode="edit"
              defaultValues={editFormDefaultValues}
              onSubmit={handleUpdate}
              isSubmitting={updateMutation.isPending}
              submitLabel="Update Task"
            />
          ) : (
            <TaskForm
              key={taskFormKey}
              defaultValues={createFormDefaultValues}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
              submitLabel="Simpan Task"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
