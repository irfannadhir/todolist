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
import { useCallback, useRef, useState } from "react";

import { type TaskItem } from "@/features/tasks/types/task";

type TaskCalendarProps = {
  monthDate: Date;
  selectedDate: Date;
  selectedDates?: Date[];
  tasks: TaskItem[];
  onSelectDate: (date: Date) => void;
  onSelectDateRange: (dates: Date[]) => void;
  onChangeMonth: (value: "prev" | "next") => void;
};

const weekdayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function TaskCalendar({
  monthDate,
  selectedDate,
  selectedDates = [],
  tasks,
  onSelectDate,
  onSelectDateRange,
  onChangeMonth,
}: TaskCalendarProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const didDragRef = useRef(false);

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const taskCountByDate = tasks.reduce<Record<string, number>>(
    (accumulator, task) => {
      const key = format(parseISO(task.dueDate), "yyyy-MM-dd");
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    },
    {},
  );

  const days: Date[] = [];
  let dateCursor = calendarStart;

  while (dateCursor <= calendarEnd) {
    days.push(dateCursor);
    dateCursor = addDays(dateCursor, 1);
  }

  const isDateSelected = useCallback(
    (date: Date) => {
      return selectedDates.some((d) => isSameDay(d, date));
    },
    [selectedDates],
  );

  const handleMouseDown = useCallback(
    (date: Date) => {
      setIsSelecting(true);
      setRangeStart(date);
      didDragRef.current = false;
      onSelectDateRange([date]);
    },
    [onSelectDateRange],
  );

  const handleMouseEnter = useCallback(
    (date: Date) => {
      if (isSelecting && rangeStart) {
        if (!isSameDay(rangeStart, date)) {
          didDragRef.current = true;
        }
        const start = rangeStart < date ? rangeStart : date;
        const end = rangeStart < date ? date : rangeStart;
        const datesInRange: Date[] = [];
        let current = new Date(start);
        while (current <= end) {
          datesInRange.push(new Date(current));
          current = addDays(current, 1);
        }
        onSelectDateRange(datesInRange);
      }
    },
    [isSelecting, rangeStart, onSelectDateRange],
  );

  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    setRangeStart(null);
  }, []);

  const handleClick = useCallback(
    (date: Date) => {
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }

      if (!isSelecting) {
        onSelectDate(date);
        onSelectDateRange([date]);
      }
    },
    [isSelecting, onSelectDate, onSelectDateRange],
  );

  return (
    <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl tracking-tight text-[#17171c]">
            Kalender Task
          </h2>
          <p className="mt-1 text-xs text-[#616161]">
            Klik dan drag untuk memilih range tanggal
          </p>
        </div>
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

      <p className="mt-1 text-sm text-[#616161]">
        {format(monthDate, "MMMM yyyy")}
      </p>

      <div
        className="mt-4 grid grid-cols-7 gap-2 select-none"
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="text-center text-xs font-medium uppercase tracking-wide text-[#75758a]"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = taskCountByDate[key] ?? 0;
          const isInMonth = isSameMonth(day, monthStart);
          const isActive = isSameDay(day, selectedDate);
          const isInSelectedRange = isDateSelected(day);

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleClick(day)}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              className={clsx(
                "min-h-20 rounded-md border p-2 text-left transition cursor-pointer",
                isActive
                  ? "border-[#17171c] bg-[#17171c] text-white"
                  : isInSelectedRange
                    ? "border-[#4c6ee6] bg-[#4c6ee6]/10 text-[#17171c]"
                    : "border-[#e5e7eb] bg-[#ffffff] text-[#17171c] hover:border-[#17171c]",
                !isInMonth && "opacity-40",
              )}
            >
              <span className="text-sm font-medium">{format(day, "d")}</span>
              <span
                className={clsx(
                  "mt-2 block text-xs",
                  isActive ? "text-[#edfce9]" : "text-[#616161]",
                )}
              >
                {count > 0 ? `${count} task` : "-"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDates.length > 1 && (
        <div className="mt-4 rounded-md bg-[#f8f8f8] p-3 text-sm text-[#616161]">
          {selectedDates.length} hari dipilih:{" "}
          {format(selectedDates[0], "dd MMM")} -{" "}
          {format(selectedDates[selectedDates.length - 1], "dd MMM yyyy")}
        </div>
      )}
    </section>
  );
}
