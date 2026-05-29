import { type NextRequest } from "next/server";

import { userPayloadSchema } from "@/features/users/schemas/user-schema";
import { hashPassword } from "@/lib/auth";
import { getSessionFromRequest, unauthorizedJsonResponse } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function sanitizeUser(user: {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ data: users.map(sanitizeUser) });
  } catch {
    return Response.json({ message: "Terjadi kesalahan saat mengambil data user" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return unauthorizedJsonResponse();
  }

  try {
    const json = await request.json();
    const parsedBody = userPayloadSchema.safeParse(json);

    if (!parsedBody.success) {
      return Response.json(
        {
          message: "Data user tidak valid",
          errors: parsedBody.error.issues,
        },
        { status: 400 },
      );
    }

    const email = parsedBody.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ message: "Email sudah digunakan" }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsedBody.data.password);

    const createdUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    return Response.json({ data: sanitizeUser(createdUser) }, { status: 201 });
  } catch {
    return Response.json({ message: "Terjadi kesalahan saat membuat user" }, { status: 500 });
  }
}
