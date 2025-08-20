import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

// Get upcoming matches (for reminder notifications)
export const getUpcomingMatches = internalQuery({
  args: { daysAhead: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 3;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysAhead);
    const targetTimestamp = targetDate.getTime();
    
    // Get matches that are starting soon
    const matches = await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.lte(q.field("rotationDetails.startDate"), targetTimestamp.toString())
        )
      )
      .collect();
    
    return matches;
  },
});

// Get matches with pending payments
export const getPendingPaymentMatches = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.eq(q.field("paymentStatus"), "unpaid")
        )
      )
      .collect();
  },
});

// Get recently completed matches (for survey requests)
export const getRecentlyCompletedMatches = internalQuery({
  args: { daysBack: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysBack = args.daysBack || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffTimestamp = cutoffDate.getTime();
    
    return await ctx.db
      .query("matches")
      .filter((q) => 
        q.and(
          q.eq(q.field("status"), "completed"),
          q.gte(q.field("updatedAt"), cutoffTimestamp)
        )
      )
      .collect();
  },
});