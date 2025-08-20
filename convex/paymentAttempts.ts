import { internalMutation, query, QueryCtx, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { paymentAttemptDataValidator } from "./paymentAttemptTypes";

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

export const savePaymentAttempt = internalMutation({
  args: { 
    paymentAttemptData: paymentAttemptDataValidator
  },
  returns: v.null(),
  handler: async (ctx, { paymentAttemptData }) => {
    // Find the user by the payer.user_id (which maps to externalId in our users table)
    const user = await userByExternalId(ctx, paymentAttemptData.payer.user_id);
    
    // Check if payment attempt already exists to avoid duplicates
    const existingPaymentAttempt = await ctx.db
      .query("paymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", paymentAttemptData.payment_id))
      .unique();
    
    // Map webhook data to our schema fields
    const paymentAttemptRecord = {
      matchId: "temp_placeholder" as any, // TODO: Get matchId from somewhere in the webhook data
      stripeSessionId: paymentAttemptData.payment_id,
      amount: paymentAttemptData.subscription_items[0]?.amount?.amount || 0,
      currency: paymentAttemptData.subscription_items[0]?.amount?.currency,
      status: paymentAttemptData.status === "succeeded" ? "succeeded" as const : 
              paymentAttemptData.status === "failed" ? "failed" as const : "pending" as const,
      failureReason: paymentAttemptData.failed_reason?.code,
      paidAt: paymentAttemptData.paid_at,
      createdAt: paymentAttemptData.created_at,
      updatedAt: paymentAttemptData.updated_at,
    };
    
    if (existingPaymentAttempt) {
      // Update existing payment attempt
      await ctx.db.patch(existingPaymentAttempt._id, paymentAttemptRecord);
    } else {
      // Create new payment attempt
      await ctx.db.insert("paymentAttempts", paymentAttemptRecord);
    }
    
    return null;
  },
});

// Get payment attempt by Stripe session ID
export const getByStripeSessionId = query({
  args: { 
    stripeSessionId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .unique();
  },
});

// Get payment attempt by match ID
export const getByMatchId = internalQuery({
  args: { 
    matchId: v.id("matches")
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentAttempts")
      .withIndex("byMatchId", (q) => q.eq("matchId", args.matchId))
      .unique();
  },
});