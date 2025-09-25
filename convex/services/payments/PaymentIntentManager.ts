import { internal } from "../../_generated/api";

export class PaymentIntentManager {
  async handlePaymentSucceeded(_ctx: any, _paymentIntent: any): Promise<void> {
    // Placeholder for future success-side effects
  }

  async handlePaymentFailed(ctx: any, paymentIntent: any): Promise<void> {
    await ctx.runMutation(internal.payments.updatePaymentAttempt, {
      stripeSessionId: paymentIntent.id,
      status: "failed",
      failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
    });
  }
}


