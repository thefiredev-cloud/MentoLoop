export class PaymentSubscriptionManager {
  async handleSubscriptionEvent(ctx: any, event: any): Promise<void> {
    const sub = event.data.object;
    try {
      const existing = await ctx.db
        .query("stripeSubscriptions")
        .withIndex("bySubscriptionId", (q: any) => q.eq("stripeSubscriptionId", sub.id))
        .first();
      const base = {
        stripeSubscriptionId: sub.id,
        stripeCustomerId: sub.customer,
        status: sub.status,
        currentPeriodStart: sub.current_period_start ? sub.current_period_start * 1000 : undefined,
        currentPeriodEnd: sub.current_period_end ? sub.current_period_end * 1000 : undefined,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        canceledAt: sub.canceled_at ? sub.canceled_at * 1000 : undefined,
        defaultPaymentMethod: sub.default_payment_method || undefined,
        priceId: sub.items?.data?.[0]?.price?.id,
        quantity: sub.items?.data?.[0]?.quantity,
        metadata: sub.metadata || {},
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any;
      if (existing) {
        await ctx.db.patch(existing._id, base);
      } else {
        await ctx.db.insert("stripeSubscriptions", base);
      }
    } catch {}

    try {
      await ctx.db.insert("paymentsAudit", {
        action: `webhook_${event.type}`,
        stripeObject: "subscription",
        stripeId: sub.id,
        details: { status: sub.status },
        createdAt: Date.now(),
      });
    } catch {}
  }
}
