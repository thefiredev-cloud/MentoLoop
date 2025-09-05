import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get all evaluations for a preceptor
export const getPreceptorEvaluations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user || user.userType !== "preceptor") return [];

    const evaluations = await ctx.db
      .query("evaluations")
      .filter(q => q.eq(q.field("preceptorId"), user._id))
      .order("desc")
      .collect();

    // Get student details for each evaluation
    const evaluationsWithDetails = await Promise.all(
      evaluations.map(async (evaluation) => {
        const student = evaluation.studentId ? await ctx.db.get(evaluation.studentId) : null;
        return {
          ...evaluation,
          studentName: student?.name || "Unknown Student"
        };
      })
    );

    return evaluationsWithDetails;
  }
});

// Get evaluation stats
export const getEvaluationStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user || user.userType !== "preceptor") return null;

    const evaluations = await ctx.db
      .query("evaluations")
      .filter(q => q.eq(q.field("preceptorId"), user._id))
      .collect();

    const completed = evaluations.filter(e => e.status === "completed").length;
    const pending = evaluations.filter(e => e.status === "pending").length;
    const overdue = evaluations.filter(e => 
      e.status === "pending" && 
      e.dateDue && 
      new Date(e.dateDue).getTime() < Date.now()
    ).length;

    // Calculate average score from completed evaluations
    const completedWithScores = evaluations.filter(e => 
      e.status === "completed" && e.overallScore
    );
    const avgScore = completedWithScores.length > 0
      ? completedWithScores.reduce((acc, e) => acc + (e.overallScore || 0), 0) / completedWithScores.length
      : 0;

    return {
      completed,
      pending,
      overdue,
      avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
      totalEvaluations: evaluations.length
    };
  }
});

// Create a new evaluation
export const createEvaluation = mutation({
  args: {
    studentId: v.id("users"),
    studentProgram: v.string(),
    evaluationType: v.union(
      v.literal("Initial Assessment"),
      v.literal("Mid-Rotation"),
      v.literal("Final Evaluation"),
      v.literal("Weekly Check-in")
    ),
    dateDue: v.string(),
    rotationSpecialty: v.string(),
    rotationWeek: v.number(),
    rotationTotalWeeks: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user || user.userType !== "preceptor") {
      throw new Error("Only preceptors can create evaluations");
    }

    const evaluation = await ctx.db.insert("evaluations", {
      preceptorId: user._id,
      studentId: args.studentId,
      studentProgram: args.studentProgram,
      evaluationType: args.evaluationType,
      dateCreated: new Date().toISOString(),
      dateDue: args.dateDue,
      status: "pending",
      overallScore: undefined,
      rotationSpecialty: args.rotationSpecialty,
      rotationWeek: args.rotationWeek,
      rotationTotalWeeks: args.rotationTotalWeeks,
      createdAt: Date.now(),
    });

    return evaluation;
  }
});

// Complete an evaluation
export const completeEvaluation = mutation({
  args: {
    evaluationId: v.id("evaluations"),
    overallScore: v.number(),
    feedback: v.optional(v.string()),
    strengths: v.optional(v.array(v.string())),
    areasForImprovement: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const evaluation = await ctx.db.get(args.evaluationId);
    if (!evaluation) throw new Error("Evaluation not found");

    // Only the preceptor who created can complete
    if (evaluation.preceptorId !== user._id) {
      throw new Error("Unauthorized to complete this evaluation");
    }

    await ctx.db.patch(args.evaluationId, {
      status: "completed",
      overallScore: args.overallScore,
      feedback: args.feedback,
      strengths: args.strengths,
      areasForImprovement: args.areasForImprovement,
      completedAt: Date.now(),
    });

    return { success: true };
  }
});

// Delete an evaluation
export const deleteEvaluation = mutation({
  args: { evaluationId: v.id("evaluations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", q => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) throw new Error("User not found");

    const evaluation = await ctx.db.get(args.evaluationId);
    if (!evaluation) throw new Error("Evaluation not found");

    // Only the preceptor who created can delete
    if (evaluation.preceptorId !== user._id) {
      throw new Error("Unauthorized to delete this evaluation");
    }

    await ctx.db.delete(args.evaluationId);
    return { success: true };
  }
});