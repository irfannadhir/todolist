import clsx from "clsx";

import { type TaskStatus } from "@/features/tasks/types/task";

const statusLabel: Record<TaskStatus, string> = {
  pending: "Pending",
  on_progress: "On Progress",
  hold: "Hold",
  done: "Done",
};

const statusClassName: Record<TaskStatus, string> = {
  pending: "bg-[#f1f5ff] text-[#1863dc]",
  on_progress: "bg-[#edfce9] text-[#005a4d]",
  hold: "bg-[#fff4ef] text-[#ff7759]",
  done: "bg-[#17171c] text-white",
};

type StatusBadgeProps = {
  status: TaskStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        statusClassName[status],
      )}
    >
      {statusLabel[status]}
    </span>
  );
}
