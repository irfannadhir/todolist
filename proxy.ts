import { NextResponse, type NextRequest } from "next/server";

import { verifyAuthToken } from "@/lib/auth-token";

function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}

export async function proxy(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    return unauthorizedResponse();
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return unauthorizedResponse();
  }

  try {
    const session = await verifyAuthToken(token);
    const requestHeaders = new Headers(request.headers);

    requestHeaders.set("x-auth-user-id", session.sub);
    requestHeaders.set("x-auth-user-email", session.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return unauthorizedResponse();
  }
}

export const config = {
  matcher: ["/api/tasks/:path*", "/api/users/:path*"],
};
