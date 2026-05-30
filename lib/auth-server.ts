import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME, type AuthTokenPayload, verifyAuthToken } from "@/lib/auth";

export async function getSessionFromCookieStore(): Promise<AuthTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyAuthToken(token);
  } catch {
    return null;
  }
}

export function getSessionFromAuthHeaders(request: NextRequest): AuthTokenPayload | null {
  const sub = request.headers.get("x-auth-user-id");
  const email = request.headers.get("x-auth-user-email");

  if (!sub || !email) {
    return null;
  }

  return { sub, email };
}

export function unauthorizedJsonResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}
