import { Prisma } from "@prisma/client";
import { type NextRequest } from "next/server";

import { userUpdatePayloadSchema } from "@/features/users/schemas/user-schema";
import { hashPassword } from "@/lib/auth";
import {
  getSessionFromRequest,
  unauthorizedJsonResponse,
} from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return Response.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return Response.json({ data: sanitizeUser(user) });
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat mengambil data user" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;
    const json = await request.json();
    const parsedBody = userUpdatePayloadSchema.safeParse(json);

    if (!parsedBody.success) {
      return Response.json(
        {
          message: "Data user tidak valid",
          errors: parsedBody.error.issues,
        },
        { status: 400 },
      );
    }

    const payload = parsedBody.data;
    const email = payload.email?.toLowerCase();

    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== id) {
        return Response.json(
          { message: "Email sudah digunakan" },
          { status: 409 },
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(payload.name ? { name: payload.name.trim() } : {}),
        ...(email ? { email } : {}),
        ...(payload.password
          ? { passwordHash: await hashPassword(payload.password) }
          : {}),
      },
    });

    return Response.json({ data: sanitizeUser(updatedUser) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return Response.json(
      { message: "Terjadi kesalahan saat mengubah user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const { id } = await context.params;

    if (session.sub === id) {
      return Response.json(
        { message: "User login aktif tidak bisa dihapus" },
        { status: 400 },
      );
    }

    await prisma.user.delete({ where: { id } });

    return Response.json({ data: null, message: "User berhasil dihapus" });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return Response.json(
        { message: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    return Response.json(
      { message: "Terjadi kesalahan saat menghapus user" },
      { status: 500 },
    );
  }
}
