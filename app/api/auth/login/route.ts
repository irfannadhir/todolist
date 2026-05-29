import { NextResponse, type NextRequest } from "next/server";

import { loginSchema } from "@/features/users/schemas/user-schema";
import { AUTH_COOKIE_NAME, comparePassword, signAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsedBody = loginSchema.safeParse(json);

    if (!parsedBody.success) {
      return Response.json(
        {
          message: "Data login tidak valid",
          errors: parsedBody.error.issues,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsedBody.data.email.toLowerCase() },
    });

    if (!user) {
      return Response.json(
        { message: "Email atau password salah" },
        { status: 401 },
      );
    }

    const passwordMatch = await comparePassword(
      parsedBody.data.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      return Response.json(
        { message: "Email atau password salah" },
        { status: 401 },
      );
    }

    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
    });

    const response = NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
      },
      message: "Login berhasil",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (e) {
    console.log("Login error:", e);

    return Response.json(
      { message: "Terjadi kesalahan saat login" },
      { status: 500 },
    );
  }
}
