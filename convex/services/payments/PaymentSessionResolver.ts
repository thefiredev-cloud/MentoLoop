import type { ActionCtx } from "../../_generated/server";

export class PaymentSessionResolver {
  async resolvePaymentIntentIdFromSession(ctx: ActionCtx, sessionId: string): Promise<{ paymentIntentId?: string }> {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");
    try {
      const resp = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        headers: { Authorization: `Bearer ${stripeSecretKey}` },
      });
      if (!resp.ok) {
        return {};
      }
      const session = await resp.json();
      const pi = (session?.payment_intent as string) || undefined;
      return pi ? { paymentIntentId: pi } : {};
    } catch {
      return {};
    }
  }
}


