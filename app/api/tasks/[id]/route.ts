import { Prisma, TaskStatus as PrismaTaskStatus } from "@prisma/client";
import { type NextRequest } from "next/server";
import { z } from "zod";

import { taskUpdatePayloadSchema } from "@/features/tasks/schemas/task-schema";
import { type TaskStatus } from "@/features/tasks/types/task";
import { getSessionFromAuthHeaders, unauthorizedJsonResponse } from "@/lib/auth-server";
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

function validationErrorResponse(error: z.ZodError) {
  return Response.json(
    {
      message: "Data tidak valid",
      errors: error.issues,
    },
    { status: 400 },
  );
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = getSessionFromAuthHeaders(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;
    const task = await prisma.task.findFirst({
      where: { id, userId: session.sub },
    });

    if (!task) {
      return Response.json({ message: "Task tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ data: taskToResponse(task) });
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat mengambil task" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = getSessionFromAuthHeaders(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsedBody = taskUpdatePayloadSchema.safeParse(json);

    if (!parsedBody.success) {
      return validationErrorResponse(parsedBody.error);
    }

    const payload = parsedBody.data;
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.sub },
      select: { id: true },
    });

    if (!existingTask) {
      return Response.json({ message: "Task tidak ditemukan" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(payload.title !== undefined ? { title: payload.title } : {}),
        ...(payload.description !== undefined
          ? {
              description: payload.description?.trim() ? payload.description.trim() : null,
            }
          : {}),
        ...(payload.status !== undefined
          ? {
              status: statusToDb[payload.status],
            }
          : {}),
        ...(payload.dueDate !== undefined
          ? {
              dueDate: new Date(payload.dueDate),
            }
          : {}),
        ...(payload.dueTime !== undefined
          ? {
              dueTime: payload.dueTime?.trim() ? payload.dueTime.trim() : null,
            }
          : {}),
        ...(payload.dateFrom !== undefined
          ? {
              dateFrom: payload.dateFrom ? new Date(payload.dateFrom) : null,
            }
          : {}),
        ...(payload.dateTo !== undefined
          ? {
              dateTo: payload.dateTo ? new Date(payload.dateTo) : null,
            }
          : {}),
        ...(payload.isRecurring !== undefined
          ? {
              isRecurring: payload.isRecurring,
            }
          : {}),
      },
    });

    return Response.json({ data: taskToResponse(updatedTask) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ message: "Task tidak ditemukan" }, { status: 404 });
    }

    return Response.json(
      { message: "Terjadi kesalahan saat memperbarui task" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = getSessionFromAuthHeaders(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;
    const deletedTask = await prisma.task.deleteMany({
      where: { id, userId: session.sub },
    });

    if (deletedTask.count === 0) {
      return Response.json({ message: "Task tidak ditemukan" }, { status: 404 });
    }

    return Response.json({ data: null, message: "Task berhasil dihapus" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return Response.json({ message: "Task tidak ditemukan" }, { status: 404 });
    }

    return Response.json(
      { message: "Terjadi kesalahan saat menghapus task" },
      { status: 500 },
    );
  }
}
