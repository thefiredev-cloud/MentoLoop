import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

// Log an admin action
export const logAdminAction = internalMutation({
  args: {
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    performedBy: v.id("users"),
    details: v.object({
      previousValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      reason: v.optional(v.string()),
      metadata: v.optional(v.record(v.string(), v.any())),
    }),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("auditLogs", {
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      performedBy: args.performedBy,
      details: args.details,
      ipAddress: args.ipAddress,
      userAgent: args.userAgent,
      timestamp: Date.now(),
    });
  },
});

// Get audit logs with filtering
export const getAuditLogs = query({
  args: {
    limit: v.optional(v.number()),
    action: v.optional(v.string()),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    performedBy: v.optional(v.id("users")),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user || user.userType !== "admin") {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("auditLogs").order("desc");

    // Apply filters
    if (args.action) {
      query = query.filter((q) => q.eq(q.field("action"), args.action));
    }

    if (args.entityType) {
      query = query.filter((q) => q.eq(q.field("entityType"), args.entityType));
    }

    if (args.entityId) {
      query = query.filter((q) => q.eq(q.field("entityId"), args.entityId));
    }

    if (args.performedBy) {
      query = query.filter((q) => q.eq(q.field("performedBy"), args.performedBy));
    }

    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.dateRange!.start),
          q.lte(q.field("timestamp"), args.dateRange!.end)
        )
      );
    }

    const logs = await (args.limit ? query.take(args.limit) : query.take(100));

    // Enrich with user information
    const enrichedLogs = await Promise.all(logs.map(async (log: any) => {
      const performer = await ctx.db.get(log.performedBy);
      return {
        ...log,
        performerName: (performer as any)?.name || "Unknown User",
        performerEmail: (performer as any)?.email || "unknown@email.com",
      };
    }));

    return enrichedLogs;
  },
});

// Get audit log analytics
export const getAuditAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user || user.userType !== "admin") {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("auditLogs");

    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.dateRange!.start),
          q.lte(q.field("timestamp"), args.dateRange!.end)
        )
      );
    }

    const logs = await query.collect();

    // Calculate analytics
    const actionCounts: Record<string, number> = {};
    const entityTypeCounts: Record<string, number> = {};
    const userActivityCounts: Record<string, number> = {};
    const hourlyActivity: Record<string, number> = {};

    logs.forEach((log) => {
      // Count by action
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;

      // Count by entity type
      entityTypeCounts[log.entityType] = (entityTypeCounts[log.entityType] || 0) + 1;

      // Count by user
      const userId = log.performedBy;
      userActivityCounts[userId] = (userActivityCounts[userId] || 0) + 1;

      // Count by hour
      const hour = new Date(log.timestamp).getHours().toString();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Get top active users
    const topUsers = await Promise.all(
      Object.entries(userActivityCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(async ([userId, count]) => {
          const user = await ctx.db.get(userId as Id<"users">);
          return {
            userId,
            name: user?.name || "Unknown",
            email: user?.email || "unknown@email.com",
            actionCount: count,
          };
        })
    );

    return {
      totalActions: logs.length,
      actionCounts,
      entityTypeCounts,
      userActivityCounts,
      hourlyActivity,
      topUsers,
      recentActions: logs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20)
        .map((log) => ({
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          timestamp: log.timestamp,
        })),
    };
  },
});

// Get audit logs for a specific entity
export const getEntityAuditLogs = internalQuery({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("auditLogs")
      .filter((q) => 
        q.and(
          q.eq(q.field("entityType"), args.entityType),
          q.eq(q.field("entityId"), args.entityId)
        )
      )
      .order("desc");

    const logs = args.limit 
      ? await query.take(args.limit)
      : await query.collect();

    return logs;
  },
});


// Log user action (internal function)
export const logUserAction = internalMutation({
  args: {
    action: v.string(),
    userId: v.id("users"),
    performedBy: v.id("users"),
    details: v.optional(v.object({
      previousValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      reason: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args): Promise<Id<"auditLogs">> => {
    return await ctx.runMutation(internal.auditLogs.logAdminAction, {
      action: args.action,
      entityType: "user",
      entityId: args.userId,
      performedBy: args.performedBy,
      details: args.details || {},
    });
  },
});

// Log match action (internal function)  
export const logMatchAction = internalMutation({
  args: {
    action: v.string(),
    matchId: v.id("matches"),
    performedBy: v.id("users"),
    details: v.optional(v.object({
      previousValue: v.optional(v.any()),
      newValue: v.optional(v.any()),
      reason: v.optional(v.string()),
      metadata: v.optional(v.record(v.string(), v.any())),
    })),
  },
  handler: async (ctx, args): Promise<Id<"auditLogs">> => {
    return await ctx.runMutation(internal.auditLogs.logAdminAction, {
      action: args.action,
      entityType: "match",
      entityId: args.matchId,
      performedBy: args.performedBy,
      details: args.details || {},
    });
  },
});
