import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";

export class PaymentPortalManager {
  async createBillingPortalSession(ctx: ActionCtx, returnUrl: string): Promise<{ url: string }> {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.payments.getUserByExternalId, {
      externalId: identity.subject,
    });
    if (!user) throw new Error("User not found");

    const student = await ctx.runQuery(internal.payments.getStudentByUserId, {
      userId: (user as any)._id,
    });

    let stripeCustomerId: string | undefined = (student as any)?.stripeCustomerId;
    const userEmail = (user as any).email as string | undefined;
    if (!stripeCustomerId && userEmail) {
      try {
        const searchResponse = await fetch(`https://api.stripe.com/v1/customers/search?query=email:'${userEmail}'`, {
          headers: { Authorization: `Bearer ${stripeSecretKey}` },
        });
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          stripeCustomerId = data?.data?.[0]?.id;
        }
      } catch {}
    }
    if (!stripeCustomerId) throw new Error("Stripe customer not found");

    const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": `portal_${stripeCustomerId}_${Date.now()}`,
      },
      body: new URLSearchParams({ customer: stripeCustomerId, return_url: returnUrl }),
    });
    if (!response.ok) {
      const t = await response.text();
      throw new Error(`Stripe portal error: ${response.status} - ${t}`);
    }
    const session = await response.json();
    return { url: session.url };
  }
}


