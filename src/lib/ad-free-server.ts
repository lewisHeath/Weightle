import { cookies } from "next/headers";
import {
  ADFREE_COOKIE_NAME,
  signAdFreeCookie,
  verifyAdFreeCookie,
} from "@/lib/ad-free-cookie";

export async function isAdFreeFromCookies(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADFREE_COOKIE_NAME)?.value;
  if (!value) return false;
  return verifyAdFreeCookie(value) !== null;
}

export function buildAdFreeSetCookieHeader(sessionId: string): string | null {
  const token = signAdFreeCookie({
    v: 1,
    sid: sessionId,
    iat: Date.now(),
  });
  if (!token) return null;

  const secure = process.env.NODE_ENV === "production";
  const maxAge = 60 * 60 * 24 * 365 * 10;
  const parts = [
    `${ADFREE_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
