"use client";

import clsx from "clsx";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { type TaskItem } from "@/features/tasks/types/task";

type TaskCalendarProps = {
  monthDate: Date;
  selectedDate: Date;
  tasks: TaskItem[];
  onSelectDate: (date: Date) => void;
  onChangeMonth: (value: "prev" | "next") => void;
};

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function TaskCalendar({
  monthDate,
  selectedDate,
  tasks,
  onSelectDate,
  onChangeMonth,
}: TaskCalendarProps) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const taskCountByDate = tasks.reduce<Record<string, number>>((accumulator, task) => {
    const key = format(parseISO(task.dueDate), "yyyy-MM-dd");
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});

  const days: Date[] = [];
  let dateCursor = calendarStart;

  while (dateCursor <= calendarEnd) {
    days.push(dateCursor);
    dateCursor = addDays(dateCursor, 1);
  }

  return (
    <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl tracking-tight text-[#17171c]">Kalender Task</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-[#d9d9dd] px-3 py-1 text-sm text-[#212121] transition hover:border-[#17171c]"
            onClick={() => onChangeMonth("prev")}
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-full border border-[#d9d9dd] px-3 py-1 text-sm text-[#212121] transition hover:border-[#17171c]"
            onClick={() => onChangeMonth("next")}
          >
            Next
          </button>
        </div>
      </div>

      <p className="mt-1 text-sm text-[#616161]">{format(monthDate, "MMMM yyyy")}</p>

      <div className="mt-4 grid grid-cols-7 gap-2">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center text-xs font-medium uppercase tracking-wide text-[#75758a]">
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = taskCountByDate[key] ?? 0;
          const isInMonth = isSameMonth(day, monthStart);
          const isActive = isSameDay(day, selectedDate);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className={clsx(
                "min-h-20 rounded-md border p-2 text-left transition",
                isActive
                  ? "border-[#17171c] bg-[#17171c] text-white"
                  : "border-[#e5e7eb] bg-[#ffffff] text-[#17171c] hover:border-[#17171c]",
                !isInMonth && "opacity-40",
              )}
            >
              <span className="text-sm font-medium">{format(day, "d")}</span>
              <span className={clsx("mt-2 block text-xs", isActive ? "text-[#edfce9]" : "text-[#616161]")}>
                {count > 0 ? `${count} task` : "-"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
