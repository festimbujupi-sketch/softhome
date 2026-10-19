import { jwtVerify } from "jose";

// Kept free of next/headers so it can run in middleware.
export const SESSION_COOKIE = "softhome_admin";

export function sessionSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function verifyToken(token: string | undefined) {
  if (!token) return false;
  try {
    await jwtVerify(token, sessionSecret());
    return true;
  } catch {
    return false;
  }
}
