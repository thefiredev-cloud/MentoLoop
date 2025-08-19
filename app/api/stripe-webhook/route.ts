import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
    }

    // Process the webhook through Convex
    const result = await convex.action(api.payments.handleStripeWebhook, {
      payload: body,
      signature,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook processing failed" },
      { status: 400 }
    );
  }
}

// Stripe requires a GET endpoint for webhook validation
export async function GET() {
  return NextResponse.json({ message: "Stripe webhook endpoint" });
}