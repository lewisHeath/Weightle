import { NextResponse } from "next/server";
import { isAdFreeFromCookies } from "@/lib/ad-free-server";
import { getSiteUrl } from "@/lib/site-url";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Payments are not configured" },
      { status: 503 },
    );
  }

  if (await isAdFreeFromCookies()) {
    return NextResponse.redirect(new URL("/?adfree=already", getSiteUrl()));
  }

  const stripe = getStripe();
  const siteUrl = getSiteUrl();
  const priceId = process.env.STRIPE_PRICE_ID!.trim();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/remove-ads/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/?remove_ads=cancelled`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Could not start checkout" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url);
}
