import { query } from "./_generated/server";
import { v } from "convex/values";

export const listEvents = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200);
    let rows = await ctx.db.query("stripeEvents").order("desc").take(limit);

    if (args.type) {
      rows = rows.filter((e: any) => e.type === args.type);
    }

    if (args.cursor) {
      const cursorDoc = await ctx.db.get(args.cursor as any);
      if (cursorDoc) {
        rows = rows.filter((e: any) => e._creationTime < cursorDoc._creationTime);
      }
    }

    return {
      events: rows,
      nextCursor: rows.length === limit ? rows[rows.length - 1]._id : undefined,
    };
  },
});

export const getEventById = query({
  args: { id: v.id("stripeEvents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


