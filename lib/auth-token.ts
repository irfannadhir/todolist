import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET } from "@/lib/constant";

const JWT_EXPIRES_IN = "7d";

export const AUTH_COOKIE_NAME = "todolist_auth";

const jwtSecretKey = new TextEncoder().encode(JWT_SECRET);

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(jwtSecretKey);
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, jwtSecretKey);

  if (typeof payload.sub !== "string" || typeof payload.email !== "string") {
    throw new Error("Token tidak valid");
  }

  return {
    sub: payload.sub,
    email: payload.email,
  };
}
