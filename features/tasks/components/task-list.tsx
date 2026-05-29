"use client";

import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StatusBadge } from "@/features/tasks/components/status-badge";
import {
  TASK_STATUSES,
  type TaskItem,
  type TaskStatus,
} from "@/features/tasks/types/task";

type TaskListProps = {
  tasks: TaskItem[];
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onQuickStatusChange: (task: TaskItem, status: TaskStatus) => void;
};

const statusLabelMap = {
  pending: "Pending",
  on_progress: "On Progress",
  hold: "Hold",
  done: "Done",
} as const;

export function TaskList({
  tasks,
  onEdit,
  onDelete,
  onQuickStatusChange,
}: TaskListProps) {
  return (
    <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
      <h2 className="text-2xl tracking-tight text-[#17171c]">Daftar Task</h2>
      <p className="mt-1 text-sm text-[#616161]">
        Kelola task harian dan ubah status dengan cepat.
      </p>

      {tasks.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-[#d9d9dd] bg-[#f8f8f8] p-5 text-sm text-[#616161]">
          Belum ada task pada tanggal ini.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-md border border-[#e5e7eb] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg tracking-tight text-[#17171c]">
                    {task.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#75758a]">
                    {format(parseISO(task.dueDate), "dd MMM yyyy")}
                  </p>
                  {task.dueTime ? (
                    <p className="mt-1 text-xs text-[#75758a]">
                      Reminder: {task.dueTime}
                    </p>
                  ) : null}
                  {task.isRecurring && task.dateFrom && task.dateTo ? (
                    <p className="mt-1 text-xs text-[#75758a]">
                      Berulang: {format(parseISO(task.dateFrom), "dd MMM yyyy")} -{" "}
                      {format(parseISO(task.dateTo), "dd MMM yyyy")}
                    </p>
                  ) : null}
                </div>
                <StatusBadge status={task.status} />
              </div>

              {task.description ? (
                <p className="mt-2 text-sm leading-6 text-[#616161]">
                  {task.description}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {TASK_STATUSES.map((status) => (
                  <ConfirmDialog
                    key={status}
                    title="Konfirmasi Ubah Status"
                    description={`Ubah status "${task.title}" menjadi "${statusLabelMap[status]}"?`}
                    confirmText="Ya, Ubah"
                    cancelText="Batal"
                    confirmVariant="default"
                    onConfirm={() => onQuickStatusChange(task, status)}
                    triggerDisabled={task.status === status}
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={task.status === status}
                      >
                        {statusLabelMap[status]}
                      </Button>
                    }
                  />
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" onClick={() => onEdit(task)}>
                  Edit
                </Button>
                <ConfirmDialog
                  title="Hapus Task"
                  description={`Apakah Anda yakin ingin menghapus task "${task.title}"? Tindakan ini tidak dapat dibatalkan.`}
                  confirmText="Hapus"
                  onConfirm={() => onDelete(task)}
                  trigger={
                    <Button variant="destructive" size="sm">
                      Hapus
                    </Button>
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
