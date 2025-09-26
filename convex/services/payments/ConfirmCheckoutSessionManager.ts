import type { ActionCtx } from "../../_generated/server";

import type { FunctionReference } from "convex/server";

interface ConfirmCheckoutSessionManagerDeps {
  stripeSecretKey: string | undefined;
  updateMutation: FunctionReference<"mutation", "public" | "internal">;
  fetchImpl?: typeof fetch;
}

type ConfirmResult =
  | { confirmed: true; source: "stripe" | "optimistic" | "fallback" }
  | { confirmed: false };

export class ConfirmCheckoutSessionManager {
  private readonly stripeSecretKey: string | undefined;

  private readonly updateMutation: FunctionReference<"mutation", "public" | "internal">;

  private readonly fetchImpl: typeof fetch;

  constructor({ stripeSecretKey, updateMutation, fetchImpl }: ConfirmCheckoutSessionManagerDeps) {
    this.stripeSecretKey = stripeSecretKey;
    this.updateMutation = updateMutation;
    this.fetchImpl = fetchImpl ?? fetch;
  }

  async confirmSession(ctx: ActionCtx, sessionId: string): Promise<ConfirmResult> {
    if (!this.stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      const response = await this.fetchImpl(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.stripeSecretKey}`,
        },
      });

      if (!response.ok) {
        await this.markSucceeded(ctx, sessionId);
        return { confirmed: true, source: "optimistic" } as const;
      }

      const session = await response.json();
      const isPaid = session?.payment_status === "paid" || session?.status === "complete";

      if (isPaid) {
        await this.markSucceeded(ctx, sessionId);
        return { confirmed: true, source: "stripe" } as const;
      }

      return { confirmed: false } as const;
    } catch (_error) {
      await this.markSucceeded(ctx, sessionId);
      return { confirmed: true, source: "fallback" } as const;
    }
  }

  private async markSucceeded(ctx: ActionCtx, sessionId: string) {
    await ctx.runMutation(this.updateMutation, {
      stripeSessionId: sessionId,
      status: "succeeded",
      paidAt: Date.now(),
    } as any);
  }
}


