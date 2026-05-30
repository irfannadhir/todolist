import bcrypt from "bcryptjs";

export { AUTH_COOKIE_NAME, type AuthTokenPayload, signAuthToken, verifyAuthToken } from "@/lib/auth-token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
