import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";
import { IS_PRODUCTION } from "@/lib/constant";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil" });

  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: 0,
  });

  return response;
}
