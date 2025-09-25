import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";

type CreateMatchCheckoutArgs = {
  matchId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
};

export class PaymentCheckoutManager {
  async createMatchCheckout(ctx: ActionCtx, args: CreateMatchCheckoutArgs): Promise<{ sessionId: string; url: string }> {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const match = await ctx.runQuery(internal.matches.getMatchById, { matchId: args.matchId as any });
    if (!match) throw new Error("Match not found");

    const student = await ctx.runQuery(internal.students.getStudentById, { studentId: match.studentId });
    const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, { preceptorId: match.preceptorId });
    if (!student || !preceptor) throw new Error("Student or preceptor not found");

    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `match_${args.matchId}_price_${args.priceId}`,
      },
      body: new URLSearchParams({
        "mode": "payment",
        "line_items[0][price]": args.priceId,
        "line_items[0][quantity]": "1",
        "customer_email": student.personalInfo?.email || "",
        "success_url": args.successUrl,
        "cancel_url": args.cancelUrl,
        "metadata[matchId]": String(args.matchId),
        "metadata[studentId]": String(match.studentId),
        "metadata[preceptorId]": String(match.preceptorId),
        "metadata[rotationType]": String(match.rotationDetails.rotationType),
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
    }
    const session = await response.json();

    await ctx.runMutation(internal.payments.logPaymentAttempt, {
      matchId: args.matchId as any,
      stripeSessionId: session.id,
      amount: 0,
      status: "pending",
    });

    return { sessionId: session.id, url: session.url };
  }
}
