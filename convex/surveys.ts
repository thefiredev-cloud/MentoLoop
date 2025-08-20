import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { getUserId } from "./auth";

// Create a new survey response
export const createSurveyResponse = mutation({
  args: {
    matchId: v.id("matches"),
    respondentType: v.union(v.literal("student"), v.literal("preceptor")),
    responses: v.object({
      // Common questions (1-5 scale)
      teachStyleMatch: v.optional(v.number()),
      commEffectiveness: v.optional(v.number()),
      caseMixAlignment: v.optional(v.number()),
      supportHoursComp: v.optional(v.number()),
      wouldRecommend: v.optional(v.number()),
      // Student-specific
      studentPreparedness: v.optional(v.number()),
      studentComm: v.optional(v.number()),
      teachability: v.optional(v.number()),
      competenceGrowth: v.optional(v.number()),
      // Open-ended feedback
      comments: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify the match exists and user is part of it
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    // Check if user is authorized to submit this survey
    let isAuthorized = false;
    let respondentId = userId;

    if (args.respondentType === "student") {
      const student = await ctx.db.get(match.studentId);
      if (student && student.userId === userId) {
        isAuthorized = true;
      }
    } else if (args.respondentType === "preceptor") {
      const preceptor = await ctx.db.get(match.preceptorId);
      if (preceptor && preceptor.userId === userId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("Not authorized to submit survey for this match");
    }

    // Check if survey already exists
    const existingSurvey = await ctx.db
      .query("surveys")
      .withIndex("byMatchId", (q) => q.eq("matchId", args.matchId))
      .filter((q) => 
        q.and(
          q.eq(q.field("respondentType"), args.respondentType),
          q.eq(q.field("respondentId"), respondentId)
        )
      )
      .first();

    if (existingSurvey) {
      throw new Error("Survey already submitted for this match");
    }

    return await ctx.db.insert("surveys", {
      matchId: args.matchId,
      respondentType: args.respondentType,
      respondentId,
      responses: args.responses,
      submittedAt: Date.now(),
    });
  },
});

// Get surveys for a specific match
export const getSurveysForMatch = internalQuery({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveys")
      .withIndex("byMatchId", (q) => q.eq("matchId", args.matchId))
      .collect();
  },
});

// Get surveys by respondent type
export const getSurveysByType = query({
  args: { 
    respondentType: v.union(v.literal("student"), v.literal("preceptor")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<any[]> => {
    let query = ctx.db
      .query("surveys")
      .withIndex("byRespondentType", (q) => q.eq("respondentType", args.respondentType))
      .order("desc");
    
    return await (args.limit ? query.take(args.limit) : query.take(100));
  },
});

// Get pending surveys for current user
export const getPendingSurveys = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Check if user is a student
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (student) {
      // Get completed matches for this student
      const completedMatches = await ctx.db
        .query("matches")
        .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();

      // Check which matches don't have student surveys yet
      const pendingSurveys = [];
      for (const match of completedMatches) {
        const existingSurvey = await ctx.db
          .query("surveys")
          .withIndex("byMatchId", (q) => q.eq("matchId", match._id))
          .filter((q) => 
            q.and(
              q.eq(q.field("respondentType"), "student"),
              q.eq(q.field("respondentId"), userId)
            )
          )
          .first();

        if (!existingSurvey) {
          const preceptor = await ctx.db.get(match.preceptorId);
          pendingSurveys.push({
            matchId: match._id,
            preceptorName: preceptor?.personalInfo.fullName || "Unknown",
            rotationDetails: match.rotationDetails,
            respondentType: "student" as const,
          });
        }
      }
      return pendingSurveys;
    }

    // Check if user is a preceptor
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (preceptor) {
      // Get completed matches for this preceptor
      const completedMatches = await ctx.db
        .query("matches")
        .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
        .filter((q) => q.eq(q.field("status"), "completed"))
        .collect();

      // Check which matches don't have preceptor surveys yet
      const pendingSurveys = [];
      for (const match of completedMatches) {
        const existingSurvey = await ctx.db
          .query("surveys")
          .withIndex("byMatchId", (q) => q.eq("matchId", match._id))
          .filter((q) => 
            q.and(
              q.eq(q.field("respondentType"), "preceptor"),
              q.eq(q.field("respondentId"), userId)
            )
          )
          .first();

        if (!existingSurvey) {
          const student = await ctx.db.get(match.studentId);
          pendingSurveys.push({
            matchId: match._id,
            studentName: student?.personalInfo.fullName || "Unknown",
            rotationDetails: match.rotationDetails,
            respondentType: "preceptor" as const,
          });
        }
      }
      return pendingSurveys;
    }

    return [];
  },
});

// Get survey analytics
export const getSurveyAnalytics = query({
  args: { 
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    }))
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("surveys");
    
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("submittedAt"), args.dateRange!.start),
          q.lte(q.field("submittedAt"), args.dateRange!.end)
        )
      );
    }
    
    const surveys = await query.collect();
    
    // Calculate average scores
    const calculateAverage = (scores: number[]) => 
      scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const studentSurveys = surveys.filter(s => s.respondentType === "student");
    const preceptorSurveys = surveys.filter(s => s.respondentType === "preceptor");

    const analytics = {
      totalSurveys: surveys.length,
      studentSurveys: studentSurveys.length,
      preceptorSurveys: preceptorSurveys.length,
      averageScores: {
        student: {
          teachStyleMatch: calculateAverage(
            studentSurveys
              .map(s => s.responses.teachStyleMatch)
              .filter((score): score is number => score !== undefined)
          ),
          commEffectiveness: calculateAverage(
            studentSurveys
              .map(s => s.responses.commEffectiveness)
              .filter((score): score is number => score !== undefined)
          ),
          caseMixAlignment: calculateAverage(
            studentSurveys
              .map(s => s.responses.caseMixAlignment)
              .filter((score): score is number => score !== undefined)
          ),
          supportHoursComp: calculateAverage(
            studentSurveys
              .map(s => s.responses.supportHoursComp)
              .filter((score): score is number => score !== undefined)
          ),
          wouldRecommend: calculateAverage(
            studentSurveys
              .map(s => s.responses.wouldRecommend)
              .filter((score): score is number => score !== undefined)
          ),
        },
        preceptor: {
          studentPreparedness: calculateAverage(
            preceptorSurveys
              .map(s => s.responses.studentPreparedness)
              .filter((score): score is number => score !== undefined)
          ),
          studentComm: calculateAverage(
            preceptorSurveys
              .map(s => s.responses.studentComm)
              .filter((score): score is number => score !== undefined)
          ),
          teachability: calculateAverage(
            preceptorSurveys
              .map(s => s.responses.teachability)
              .filter((score): score is number => score !== undefined)
          ),
          competenceGrowth: calculateAverage(
            preceptorSurveys
              .map(s => s.responses.competenceGrowth)
              .filter((score): score is number => score !== undefined)
          ),
          wouldRecommend: calculateAverage(
            preceptorSurveys
              .map(s => s.responses.wouldRecommend)
              .filter((score): score is number => score !== undefined)
          ),
        },
      },
    };

    return analytics;
  },
});

// Update a survey response (if allowed)
export const updateSurveyResponse = mutation({
  args: {
    surveyId: v.id("surveys"),
    responses: v.object({
      teachStyleMatch: v.optional(v.number()),
      commEffectiveness: v.optional(v.number()),
      caseMixAlignment: v.optional(v.number()),
      supportHoursComp: v.optional(v.number()),
      wouldRecommend: v.optional(v.number()),
      studentPreparedness: v.optional(v.number()),
      studentComm: v.optional(v.number()),
      teachability: v.optional(v.number()),
      competenceGrowth: v.optional(v.number()),
      comments: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const survey = await ctx.db.get(args.surveyId);
    if (!survey) throw new Error("Survey not found");

    if (survey.respondentId !== userId) {
      throw new Error("Not authorized to update this survey");
    }

    // Only allow updates within 48 hours of submission
    const maxEditTime = 48 * 60 * 60 * 1000; // 48 hours in milliseconds
    if (Date.now() - survey.submittedAt > maxEditTime) {
      throw new Error("Survey can no longer be edited");
    }

    return await ctx.db.patch(args.surveyId, {
      responses: { ...survey.responses, ...args.responses },
    });
  },
});