import { query } from "./_generated/server";
import { v } from "convex/values";

// Query to get all intake payment attempts
export const getAllIntakePayments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("intakePaymentAttempts").collect();
  },
});

// Query to get intake payments by status
export const getIntakePaymentsByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")) },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byStatus", (q) => q.eq("status", status))
      .collect();
  },
});

// Query to get intake payments by customer email
export const getIntakePaymentsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", email))
      .collect();
  },
});

// Query to get a single intake payment by Stripe session ID
export const getIntakePaymentBySessionId = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", sessionId))
      .unique();
  },
});

// Query to get intake payment statistics
export const getIntakePaymentStats = query({
  args: {},
  handler: async (ctx) => {
    const allPayments = await ctx.db.query("intakePaymentAttempts").collect();
    
    const stats = {
      total: allPayments.length,
      succeeded: allPayments.filter(p => p.status === "succeeded").length,
      failed: allPayments.filter(p => p.status === "failed").length,
      pending: allPayments.filter(p => p.status === "pending").length,
      totalRevenue: allPayments
        .filter(p => p.status === "succeeded")
        .reduce((sum, p) => sum + p.amount, 0),
      averageAmount: allPayments.length > 0 
        ? allPayments.reduce((sum, p) => sum + p.amount, 0) / allPayments.length 
        : 0,
      planBreakdown: {
        core: allPayments.filter(p => p.membershipPlan === "core").length,
        pro: allPayments.filter(p => p.membershipPlan === "pro").length,
        premium: allPayments.filter(p => p.membershipPlan === "premium").length,
      }
    };
    
    return stats;
  },
});