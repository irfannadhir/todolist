import { NextResponse, type NextRequest } from "next/server";

import { userPayloadSchema } from "@/features/users/schemas/user-schema";
import { AUTH_COOKIE_NAME, hashPassword, signAuthToken } from "@/lib/auth";
import { IS_PRODUCTION } from "@/lib/constant";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const existingUserCount = await prisma.user.count();

    if (existingUserCount > 0) {
      return Response.json(
        { message: "Bootstrap hanya untuk setup user pertama" },
        { status: 403 },
      );
    }

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

    const name = parsedBody.data.name.trim();
    const email = parsedBody.data.email.toLowerCase();
    const passwordHash = await hashPassword(parsedBody.data.password);

    const createdUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = await signAuthToken({
      sub: createdUser.id,
      email: createdUser.email,
    });

    const response = NextResponse.json({
      data: {
        id: createdUser.id,
        email: createdUser.email,
        token,
      },
      message: "User pertama berhasil dibuat",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: IS_PRODUCTION,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return Response.json(
      { message: "Terjadi kesalahan saat bootstrap user" },
      { status: 500 },
    );
  }
}
