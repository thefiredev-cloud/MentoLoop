import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Query for getting active platform statistics
export const getActiveStats = query({
  args: {
    category: v.optional(v.union(v.literal("performance"), v.literal("growth"), v.literal("quality"))),
  },
  handler: async (ctx, args) => {
    let statsQuery = ctx.db
      .query("platformStats")
      .filter(q => q.eq(q.field("isActive"), true))

    if (args.category) {
      statsQuery = statsQuery.filter(q => 
        q.eq(q.field("category"), args.category)
      )
    }

    return await statsQuery.collect()
  },
})

// Query for getting a specific metric
export const getMetric = query({
  args: {
    metric: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformStats")
      .withIndex("byMetric", q => q.eq("metric", args.metric))
      .first()
  },
})

// Calculate and update real-time statistics
export const calculateStats = mutation({
  args: {},
  handler: async (ctx, args) => {
    const now = Date.now()
    
    // Get current data for calculations
    const users = await ctx.db.query("users").collect()
    const matches = await ctx.db.query("matches").collect()
    const students = await ctx.db.query("students").collect()
    const preceptors = await ctx.db.query("preceptors").collect()
    
    const totalUsers = users.length
    const totalStudents = students.length
    const totalPreceptors = preceptors.length
    const activeMatches = matches.filter(m => m.status === "active").length
    const completedMatches = matches.filter(m => m.status === "completed").length
    const totalMatches = activeMatches + completedMatches
    
    // Calculate success rate
    const successRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 95
    
    // Calculate average placement time (placeholder - would need more data)
    const avgPlacementDays = 10 // This would be calculated from actual match data
    const avgPlacementTime = `${avgPlacementDays} days`
    
    // Update or create statistics
    const statsToUpdate = [
      {
        metric: "total_users",
        value: totalUsers,
        description: "Total registered users",
        displayFormat: "number" as const,
        category: "growth" as const,
      },
      {
        metric: "total_students", 
        value: totalStudents,
        description: "Total registered students",
        displayFormat: "number" as const,
        category: "growth" as const,
      },
      {
        metric: "total_preceptors",
        value: totalPreceptors,
        description: "Total registered preceptors",
        displayFormat: "number" as const,
        category: "growth" as const,
      },
      {
        metric: "success_rate",
        value: successRate,
        description: "Match success rate",
        displayFormat: "percentage" as const,
        category: "performance" as const,
      },
      {
        metric: "active_matches",
        value: activeMatches,
        description: "Currently active matches",
        displayFormat: "number" as const,
        category: "performance" as const,
      },
      {
        metric: "total_matches",
        value: totalMatches,
        description: "Total successful matches",
        displayFormat: "number" as const,
        category: "growth" as const,
      },
      {
        metric: "avg_placement_time",
        value: avgPlacementTime,
        description: "Average placement time",
        displayFormat: "text" as const,
        category: "performance" as const,
      },
    ]

    const results = []
    for (const stat of statsToUpdate) {
      const existing = await ctx.db
        .query("platformStats")
        .withIndex("byMetric", q => q.eq("metric", stat.metric))
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, {
          value: stat.value,
          updatedAt: now,
          calculatedAt: now,
        })
        results.push({ metric: stat.metric, action: "updated", value: stat.value })
      } else {
        const id = await ctx.db.insert("platformStats", {
          ...stat,
          isActive: true,
          updatedAt: now,
          calculatedAt: now,
        })
        results.push({ metric: stat.metric, action: "created", value: stat.value, id })
      }
    }

    return results
  },
})

// Update a platform statistic manually
export const updateStat = mutation({
  args: {
    metric: v.string(),
    value: v.union(v.number(), v.string()),
    description: v.optional(v.string()),
    displayFormat: v.optional(v.union(v.literal("percentage"), v.literal("number"), v.literal("duration"), v.literal("text"))),
    category: v.optional(v.union(v.literal("performance"), v.literal("growth"), v.literal("quality"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("platformStats")
      .withIndex("byMetric", q => q.eq("metric", args.metric))
      .first()

    const updateData = {
      value: args.value,
      updatedAt: Date.now(),
      ...(args.description && { description: args.description }),
      ...(args.displayFormat && { displayFormat: args.displayFormat }),
      ...(args.category && { category: args.category }),
      ...(args.isActive !== undefined && { isActive: args.isActive }),
    }

    if (existing) {
      return await ctx.db.patch(existing._id, updateData)
    } else {
      return await ctx.db.insert("platformStats", {
        metric: args.metric,
        description: args.description || args.metric,
        displayFormat: args.displayFormat || "number",
        category: args.category || "performance",
        isActive: args.isActive ?? true,
        ...updateData,
      })
    }
  },
})

// Get all statistics (admin view)
export const getAllStats = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("platformStats")
      .order("desc")
      .collect()
  },
})