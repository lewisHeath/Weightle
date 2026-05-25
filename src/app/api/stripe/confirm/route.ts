import { NextResponse } from "next/server";
import { buildAdFreeSetCookieHeader } from "@/lib/ad-free-server";
import { isAdFreeCookieConfigured } from "@/lib/ad-free-cookie";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!isStripeConfigured() || !isAdFreeCookieConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  let sessionId: string;
  try {
    const body = (await request.json()) as { sessionId?: string };
    sessionId = body.sessionId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
  }

  const expectedPrice = process.env.STRIPE_PRICE_ID?.trim();
  const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 1,
  });
  const paidPriceId = lineItems.data[0]?.price?.id;
  if (expectedPrice && paidPriceId && paidPriceId !== expectedPrice) {
    return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  }

  const setCookie = buildAdFreeSetCookieHeader(sessionId);
  if (!setCookie) {
    return NextResponse.json(
      { error: "Could not issue ad-free session" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true, adFree: true });
  response.headers.set("Set-Cookie", setCookie);
  return response;
}
