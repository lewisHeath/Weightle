import { createHmac, timingSafeEqual } from "node:crypto";

export const ADFREE_COOKIE_NAME = "weightle-adfree";

export type AdFreePayload = {
  v: 1;
  sid: string;
  iat: number;
};

function getSigningSecret(): string | null {
  const secret = process.env.ADFREE_COOKIE_SECRET?.trim();
  return secret || null;
}

export function signAdFreeCookie(payload: AdFreePayload): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyAdFreeCookie(value: string): AdFreePayload | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const dot = value.indexOf(".");
  if (dot === -1) return null;

  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(body).digest("base64url");

  try {
    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as AdFreePayload;
    if (payload.v !== 1 || !payload.sid) return null;
    return payload;
  } catch {
    return null;
  }
}

export function isAdFreeCookieConfigured(): boolean {
  return getSigningSecret() !== null;
}
