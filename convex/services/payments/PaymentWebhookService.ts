import type { ActionCtx } from "../../_generated/server";
import { internal } from "../../_generated/api";

export class PaymentWebhookService {
  async handle(ctx: ActionCtx, payload: string, signature: string): Promise<{ received: boolean; duplicate?: boolean }> {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeWebhookSecret || !stripeSecretKey) throw new Error("Stripe configuration missing");

    const verificationResult = await ctx.runAction(internal.paymentsNode.verifyStripeSignature, {
      payload,
      signature,
      webhookSecret: stripeWebhookSecret,
    });
    if (!verificationResult.verified) throw new Error("Invalid webhook signature");

    const event = JSON.parse(payload);

    const existing = await ctx.runQuery(internal.payments.getWebhookEventByProviderAndId, {
      provider: "stripe",
      eventId: event.id,
    });
    if (existing) return { received: true, duplicate: true };

    const insertedId = await ctx.runMutation(internal.payments.insertWebhookEvent, {
      provider: "stripe",
      eventId: event.id,
    });

    try {
      await this.dispatch(ctx, event);
      await ctx.runMutation(internal.payments.markWebhookEventProcessed, { id: insertedId });
      return { received: true };
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  private async dispatch(ctx: ActionCtx, event: any): Promise<void> {
    switch (event.type) {
      case "checkout.session.completed":
        // @ts-expect-error uses existing helper in payments.ts
        return await (await import("../../payments")).handleCheckoutCompleted(ctx as any, event.data.object);
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.payment_succeeded":
      case "invoice.payment_failed":
      case "invoice.marked_uncollectible":
      case "invoice.voided":
        const { PaymentInvoiceManager } = await import("./PaymentInvoiceManager");
        return await new PaymentInvoiceManager().handleInvoiceEvent(ctx, event);
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        const { PaymentSubscriptionManager } = await import("./PaymentSubscriptionManager");
        return await new PaymentSubscriptionManager().handleSubscriptionEvent(ctx, event);
      case "payment_intent.succeeded":
        const { PaymentIntentManager } = await import("./PaymentIntentManager");
        return await new PaymentIntentManager().handlePaymentSucceeded(ctx, event.data.object);
      case "payment_intent.requires_action":
      case "payment_intent.processing":
        try {
          await ctx.runMutation(internal.payments.insertPaymentsAudit, {
            action: `webhook_${event.type}`,
            stripeObject: "payment_intent",
            stripeId: event.data.object?.id || "unknown",
            details: { status: event.data.object?.status },
            createdAt: Date.now(),
          });
        } catch {}
        return;
      case "payment_intent.payment_failed":
        const { PaymentIntentManager: PaymentIntentManager2 } = await import("./PaymentIntentManager");
        return await new PaymentIntentManager2().handlePaymentFailed(ctx, event.data.object);
      case "customer.created":
        const { PaymentCustomerManager } = await import("./PaymentCustomerManager");
        return await new PaymentCustomerManager().handleCustomerCreated(ctx, event.data.object);
      case "customer.updated":
        const { PaymentCustomerManager: PaymentCustomerManager2 } = await import("./PaymentCustomerManager");
        return await new PaymentCustomerManager2().handleCustomerUpdated(ctx, event.data.object);
      default:
        return;
    }
  }
}
