import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";

type CreateRefundArgs = {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
};

type CreateRefundResult = { refundId: string; status: string };

export class PaymentRefundManager {
  async createRefund(ctx: ActionCtx, args: CreateRefundArgs): Promise<CreateRefundResult> {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const params = new URLSearchParams({ payment_intent: args.paymentIntentId });
    if (args.amount && args.amount > 0) params.set("amount", String(args.amount));
    if (args.reason) params.set("reason", args.reason);

    const resp = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `refund_${args.paymentIntentId}_${args.amount ?? 'full'}`,
      },
      body: params,
    });
    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`Stripe refund error: ${resp.status} - ${t}`);
    }
    const refund = await resp.json();

    try {
      const payment: any = await ctx.runQuery(internal.payments.getPaymentByStripePaymentIntentId, {
        paymentIntentId: args.paymentIntentId,
      });
      if (payment) {
        const newStatus = refund.amount === payment.amount ? "refunded" : "partially_refunded";
        await ctx.runMutation(internal.payments.patchPayment, {
          paymentId: payment._id,
          updates: {
            status: newStatus,
            refundedAmount: (payment.refundedAmount || 0) + (refund.amount || 0),
            updatedAt: Date.now(),
          },
        });
      }
    } catch (_e) {}

    try {
      await ctx.runMutation(internal.payments.insertPaymentsAudit, {
        action: "refund_created",
        stripeObject: "payment_intent",
        stripeId: args.paymentIntentId,
        details: { refundId: refund.id, amount: refund.amount },
        createdAt: Date.now(),
      });
    } catch (_e) {}

    return { refundId: refund.id, status: refund.status };
  }
}


