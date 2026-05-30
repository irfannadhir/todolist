import { TaskStatus as PrismaTaskStatus } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";

import {
  taskPayloadSchema,
  taskQuerySchema,
} from "@/features/tasks/schemas/task-schema";
import { type TaskStatus } from "@/features/tasks/types/task";
import {
  getSessionFromAuthHeaders,
  unauthorizedJsonResponse,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

const statusToDb: Record<TaskStatus, PrismaTaskStatus> = {
  pending: PrismaTaskStatus.PENDING,
  on_progress: PrismaTaskStatus.ON_PROGRESS,
  hold: PrismaTaskStatus.HOLD,
  done: PrismaTaskStatus.DONE,
};

const statusFromDb: Record<PrismaTaskStatus, TaskStatus> = {
  PENDING: "pending",
  ON_PROGRESS: "on_progress",
  HOLD: "hold",
  DONE: "done",
};

function taskToResponse(task: {
  id: string;
  title: string;
  description: string | null;
  status: PrismaTaskStatus;
  dueDate: Date;
  dueTime: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  isRecurring: boolean;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: statusFromDb[task.status],
    dueDate: task.dueDate.toISOString(),
    dueTime: task.dueTime,
    dateFrom: task.dateFrom?.toISOString() ?? null,
    dateTo: task.dateTo?.toISOString() ?? null,
    isRecurring: task.isRecurring,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

function buildRecurringDueDates(dateFrom: string, dateTo: string) {
  const startDate = new Date(dateFrom);
  const endDate = new Date(dateTo);
  const dates: Date[] = [];
  const cursor = new Date(startDate);

  while (cursor.getTime() <= endDate.getTime()) {
    dates.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

function startOfDateUtc(dateString: string) {
  return new Date(`${dateString}T00:00:00.000Z`);
}

function nextDateUtc(dateString: string) {
  const date = startOfDateUtc(dateString);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
}

function validationErrorResponse(error: z.ZodError) {
  return Response.json(
    {
      message: "Data tidak valid",
      errors: error.issues,
    },
    { status: 400 },
  );
}

export async function GET(request: NextRequest) {
  const session = getSessionFromAuthHeaders(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const queryObject = Object.fromEntries(
      request.nextUrl.searchParams.entries(),
    );
    const parsedQuery = taskQuerySchema.safeParse(queryObject);

    if (!parsedQuery.success) {
      return validationErrorResponse(parsedQuery.error);
    }

    const { month, year, dateFrom, dateTo, groupBy } = parsedQuery.data;

    if ((month && !year) || (!month && year)) {
      return Response.json(
        { message: "Filter bulan harus disertai tahun" },
        { status: 400 },
      );
    }

    if ((dateFrom && !dateTo) || (!dateFrom && dateTo)) {
      return Response.json(
        { message: "Filter dateFrom harus disertai dateTo" },
        { status: 400 },
      );
    }

    const where = {
      userId: session.sub,
      ...(dateFrom && dateTo
        ? {
            dueDate: {
              gte: startOfDateUtc(dateFrom),
              lt: nextDateUtc(dateTo),
            },
          }
        : {}),
      ...(month && year
        ? {
            dueDate: {
              gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)),
              lt: new Date(Date.UTC(year, month, 1, 0, 0, 0)),
            },
          }
        : {}),
    };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    if (groupBy === "recurring") {
      const grouped = new Map<string, (typeof tasks)[number]>();

      for (const task of tasks) {
        const groupKey =
          task.isRecurring && task.dateFrom && task.dateTo
            ? [
                task.title,
                task.description ?? "",
                task.status,
                task.dueTime ?? "",
                task.dateFrom.toISOString(),
                task.dateTo.toISOString(),
                task.userId ?? "",
              ].join("|")
            : task.id;

        if (!grouped.has(groupKey)) {
          grouped.set(groupKey, task);
        }
      }

      return Response.json({ data: Array.from(grouped.values()).map(taskToResponse) });
    }

    return Response.json({ data: tasks.map(taskToResponse) });
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat mengambil data task" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = getSessionFromAuthHeaders(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const json = await request.json();
    const parsedBody = taskPayloadSchema.safeParse(json);

    if (!parsedBody.success) {
      return validationErrorResponse(parsedBody.error);
    }

    const payload = parsedBody.data;
    const title = payload.title.trim();
    const description = payload.description?.trim() ? payload.description.trim() : null;
    const dueTime = payload.dueTime?.trim() ? payload.dueTime.trim() : null;
    const dateFrom = payload.dateFrom ? new Date(payload.dateFrom) : null;
    const dateTo = payload.dateTo ? new Date(payload.dateTo) : null;
    const isRecurring = Boolean(payload.isRecurring && payload.dateFrom && payload.dateTo);

    let createdTask;

    if (isRecurring && payload.dateFrom && payload.dateTo) {
      const recurringDates = buildRecurringDueDates(payload.dateFrom, payload.dateTo);
      const createdTasks = await prisma.$transaction(
        recurringDates.map((dueDate) =>
          prisma.task.create({
            data: {
              title,
              description,
              status: statusToDb[payload.status],
              dueDate,
              dueTime,
              dateFrom,
              dateTo,
              isRecurring: true,
              userId: session.sub,
            },
          }),
        ),
      );

      createdTask = createdTasks[0];
    } else {
      createdTask = await prisma.task.create({
        data: {
          title,
          description,
          status: statusToDb[payload.status],
          dueDate: new Date(payload.dueDate),
          dueTime,
          dateFrom,
          dateTo,
          isRecurring,
          userId: session.sub,
        },
      });
    }

    return Response.json(
      { data: taskToResponse(createdTask) },
      { status: 201 },
    );
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat membuat task" },
      { status: 500 },
    );
  }
}
