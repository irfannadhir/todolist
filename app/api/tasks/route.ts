import { TaskStatus as PrismaTaskStatus } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";

import {
  taskPayloadSchema,
  taskQuerySchema,
} from "@/features/tasks/schemas/task-schema";
import { type TaskStatus } from "@/features/tasks/types/task";
import { getSessionFromRequest, unauthorizedJsonResponse } from "@/lib/auth-server";
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
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: statusFromDb[task.status],
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
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
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const queryObject = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsedQuery = taskQuerySchema.safeParse(queryObject);

    if (!parsedQuery.success) {
      return validationErrorResponse(parsedQuery.error);
    }

    const { month, year } = parsedQuery.data;

    if ((month && !year) || (!month && year)) {
      return Response.json(
        { message: "Filter bulan harus disertai tahun" },
        { status: 400 },
      );
    }

    const where =
      month && year
        ? {
            dueDate: {
              gte: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)),
              lt: new Date(Date.UTC(year, month, 1, 0, 0, 0)),
            },
          }
        : {};

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return Response.json({ data: tasks.map(taskToResponse) });
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat mengambil data task" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

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
    const createdTask = await prisma.task.create({
      data: {
        title: payload.title,
        description: payload.description?.trim() ? payload.description.trim() : null,
        status: statusToDb[payload.status],
        dueDate: new Date(payload.dueDate),
      },
    });

    return Response.json({ data: taskToResponse(createdTask) }, { status: 201 });
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat membuat task" },
      { status: 500 },
    );
  }
}
