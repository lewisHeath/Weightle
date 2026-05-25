import { NextResponse } from "next/server";
import { isAdFreeFromCookies } from "@/lib/ad-free-server";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  const adFree = await isAdFreeFromCookies();
  return NextResponse.json({
    adFree,
    paymentsEnabled: isStripeConfigured(),
  });
}
