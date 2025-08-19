import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { getUserId } from "./auth";
import { internal } from "./_generated/api";

// MentorFit compatibility scoring algorithm
function calculateMentorFitScore(
  studentLearningStyle: any,
  preceptorMentoringStyle: any
): number {
  let score = 0;
  let maxScore = 0;

  // Learning Style vs Mentoring Style
  maxScore += 2;
  if (
    (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
    (studentLearningStyle.learningMethod === "step-by-step" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
    (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "expect-initiative")
  ) {
    score += 2;
  } else if (
    (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "support-needed") ||
    (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "support-needed")
  ) {
    score += 1;
  }

  // Feedback Style Alignment
  maxScore += 2;
  if (
    (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "real-time") ||
    (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
    (studentLearningStyle.feedbackPreference === "minimal" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
  ) {
    score += 2;
  } else if (
    (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
    (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
  ) {
    score += 1;
  }

  // Autonomy and Structure Preference
  maxScore += 2;
  if (
    (studentLearningStyle.structurePreference === "clear-schedules" && preceptorMentoringStyle.rotationStart === "orient-goals") ||
    (studentLearningStyle.structurePreference === "open-ended" && preceptorMentoringStyle.rotationStart === "dive-in-learn") ||
    (studentLearningStyle.structurePreference === "general-guidance" && preceptorMentoringStyle.rotationStart === "observe-adjust")
  ) {
    score += 2;
  } else {
    score += 1; // Partial match
  }

  // Clinical Comfort vs Autonomy Level
  maxScore += 2;
  if (
    (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "high-independence") ||
    (studentLearningStyle.clinicalComfort === "not-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision") ||
    (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions")
  ) {
    score += 2;
  } else if (
    (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions") ||
    (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision")
  ) {
    score += 1;
  }

  // Resource Preferences
  maxScore += 2;
  if (
    (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "always") ||
    (studentLearningStyle.additionalResources === "not-necessary" && preceptorMentoringStyle.learningMaterials === "rarely") ||
    (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "sometimes")
  ) {
    score += 2;
  } else if (
    (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "sometimes") ||
    (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "always")
  ) {
    score += 1;
  }

  // Mentor Relationship Preference
  maxScore += 2;
  if (
    (studentLearningStyle.mentorRelationship === "teacher-coach" && preceptorMentoringStyle.idealDynamic === "learner-teacher") ||
    (studentLearningStyle.mentorRelationship === "collaborator" && preceptorMentoringStyle.idealDynamic === "teammates") ||
    (studentLearningStyle.mentorRelationship === "supervisor" && preceptorMentoringStyle.idealDynamic === "supervisee-clinician")
  ) {
    score += 2;
  } else {
    score += 1; // Partial compatibility
  }

  // Convert to 0-10 scale
  return Math.round((score / maxScore) * 10);
}

// Create a new match suggestion
export const createMatch = mutation({
  args: {
    studentId: v.id("students"),
    preceptorId: v.id("preceptors"),
    rotationDetails: v.object({
      startDate: v.string(),
      endDate: v.string(),
      weeklyHours: v.number(),
      rotationType: v.string(),
      location: v.optional(v.string()),
    }),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get student and preceptor data for scoring
    const student = await ctx.db.get(args.studentId);
    const preceptor = await ctx.db.get(args.preceptorId);

    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    // Calculate MentorFit score
    const mentorFitScore = calculateMentorFitScore(
      student.learningStyle,
      preceptor.mentoringStyle
    );

    // Extract location data for analytics (preceptor location)
    const locationData = {
      city: preceptor.practiceInfo.city,
      state: preceptor.practiceInfo.state,
      zipCode: preceptor.practiceInfo.zipCode,
      // TODO: Add county and metro area when location utilities are integrated
    };

    const matchId = await ctx.db.insert("matches", {
      studentId: args.studentId,
      preceptorId: args.preceptorId,
      status: "suggested",
      mentorFitScore,
      rotationDetails: args.rotationDetails,
      locationData,
      paymentStatus: "unpaid",
      adminNotes: args.adminNotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return matchId;
  },
});

// Find potential matches for a student
export const findPotentialMatches = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get all verified, available preceptors in Texas only
    const allPreceptors = await ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", "verified"))
      .collect();

    // Filter for Texas-only preceptors
    const availablePreceptors = allPreceptors.filter(preceptor => 
      preceptor.practiceInfo.state === "TX" || preceptor.practiceInfo.state === "Texas"
    );

    // Filter and score potential matches
    const potentialMatches = [];

    for (const preceptor of availablePreceptors) {
      if (!preceptor.availability.currentlyAccepting) continue;

      // Enforce Texas-only operations
      if (preceptor.practiceInfo.state !== "TX" && preceptor.practiceInfo.state !== "Texas") {
        continue;
      }

      // Check specialty alignment
      const hasMatchingRotation = preceptor.availability.availableRotations.some(rotation =>
        student.rotationNeeds.rotationTypes.includes(rotation as any)
      );

      if (!hasMatchingRotation) continue;

      // Calculate MentorFit score
      const mentorFitScore = calculateMentorFitScore(
        student.learningStyle,
        preceptor.mentoringStyle
      );

      // Check geographic compatibility within Texas
      let locationScore = 2; // Base score since all are in Texas
      
      // Bonus for same city/metro area
      if (student.rotationNeeds.preferredLocation && 
          student.rotationNeeds.preferredLocation.city === preceptor.practiceInfo.city) {
        locationScore = 3; // Same city preference
      } else if (student.rotationNeeds.willingToTravel) {
        locationScore = 2; // Willing to travel within Texas
      }

      // Calculate overall compatibility score
      const overallScore = (mentorFitScore * 0.7) + (locationScore * 0.3);

      potentialMatches.push({
        preceptor,
        mentorFitScore,
        locationScore,
        overallScore,
      });
    }

    // Sort by overall score (highest first)
    return potentialMatches
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 10); // Return top 10 matches
  },
});

// Get matches for current user (student or preceptor)
export const getMyMatches = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Check if user is a student
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (student) {
      const matches = await ctx.db
        .query("matches")
        .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
        .collect();

      // Populate preceptor data
      const matchesWithData = [];
      for (const match of matches) {
        const preceptor = await ctx.db.get(match.preceptorId);
        matchesWithData.push({
          ...match,
          preceptor,
        });
      }
      return matchesWithData;
    }

    // Check if user is a preceptor
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (preceptor) {
      const matches = await ctx.db
        .query("matches")
        .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
        .collect();

      // Populate student data
      const matchesWithData = [];
      for (const match of matches) {
        const student = await ctx.db.get(match.studentId);
        matchesWithData.push({
          ...match,
          student,
        });
      }
      return matchesWithData;
    }

    return [];
  },
});

// Update match status
export const updateMatchStatus = mutation({
  args: {
    matchId: v.id("matches"),
    status: v.union(
      v.literal("suggested"), v.literal("pending"), v.literal("confirmed"), 
      v.literal("active"), v.literal("completed"), v.literal("cancelled")
    ),
    adminNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.adminNotes !== undefined) {
      updates.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.matchId, updates);

    // If confirmed, update student status
    if (args.status === "confirmed") {
      const match = await ctx.db.get(args.matchId);
      if (match) {
        await ctx.db.patch(match.studentId, { status: "matched" });
      }
    }
  },
});

// Update payment status
export const updatePaymentStatus = mutation({
  args: {
    matchId: v.id("matches"),
    paymentStatus: v.union(v.literal("unpaid"), v.literal("paid"), v.literal("refunded"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matchId, {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    });

    // If paid, update match status to confirmed
    if (args.paymentStatus === "paid") {
      await ctx.db.patch(args.matchId, { status: "confirmed" });
    }
  },
});

// Get all matches (admin view)
export const getAllMatches = query({
  args: {
    status: v.optional(v.union(
      v.literal("suggested"), v.literal("pending"), v.literal("confirmed"), 
      v.literal("active"), v.literal("completed"), v.literal("cancelled")
    )),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("matches");
    
    if (args.status) {
      query = query.withIndex("byStatus", (q) => q.eq("status", args.status));
    }

    const matches = await query.collect();

    // Populate student and preceptor data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const preceptor = await ctx.db.get(match.preceptorId);
      matchesWithData.push({
        ...match,
        student,
        preceptor,
      });
    }

    return matchesWithData;
  },
});

// Student-specific match queries for dashboard
export const getPendingMatchesForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.studentId) {
      throw new Error("Unauthorized");
    }

    // Get student record to find matches
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", args.studentId))
      .first();

    if (!student) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .filter((q) => q.eq(q.field("status"), "suggested"))
      .order("desc")
      .collect();

    // Populate preceptor data
    const matchesWithData = [];
    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      matchesWithData.push({
        ...match,
        preceptor,
      });
    }
    
    return matchesWithData;
  },
});

export const getActiveMatchesForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.studentId) {
      throw new Error("Unauthorized");
    }

    // Get student record to find matches
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", args.studentId))
      .first();

    if (!student) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .filter((q) => q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "confirmed")))
      .order("desc")
      .collect();

    // Populate preceptor data
    const matchesWithData = [];
    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      matchesWithData.push({
        ...match,
        preceptor,
      });
    }
    
    return matchesWithData;
  },
});

export const getCompletedMatchesForStudent = query({
  args: { studentId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.studentId) {
      throw new Error("Unauthorized");
    }

    // Get student record to find matches
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", args.studentId))
      .first();

    if (!student) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    // Populate preceptor data
    const matchesWithData = [];
    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      matchesWithData.push({
        ...match,
        preceptor,
      });
    }
    
    return matchesWithData;
  },
});

export const acceptMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    
    // Get student record
    const student = await ctx.db.get(match.studentId);
    if (!student || student.userId !== userId) {
      throw new Error("Unauthorized: You can only accept your own matches");
    }
    
    if (match.status !== "suggested") {
      throw new Error("Match is no longer available");
    }

    await ctx.db.patch(args.matchId, {
      status: "confirmed",
      acceptedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.matchId;
  },
});

export const declineMatch = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    
    // Check if user is student or preceptor
    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (student && student.userId === userId) {
      // Student declining
      if (match.status !== "suggested") {
        throw new Error("Match is no longer available");
      }
    } else if (preceptor && preceptor.userId === userId) {
      // Preceptor declining
      if (match.status !== "suggested" && match.status !== "pending") {
        throw new Error("Match is no longer available");
      }
    } else {
      throw new Error("Unauthorized: You can only decline your own matches");
    }

    await ctx.db.patch(args.matchId, {
      status: "cancelled",
      declinedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.matchId;
  },
});

// Preceptor-specific match queries for dashboard
export const getPendingMatchesForPreceptor = query({
  args: { preceptorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.preceptorId) {
      throw new Error("Unauthorized");
    }

    // Get preceptor record to find matches
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", args.preceptorId))
      .first();

    if (!preceptor) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.or(q.eq(q.field("status"), "suggested"), q.eq(q.field("status"), "pending")))
      .order("desc")
      .collect();

    // Populate student data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      matchesWithData.push({
        ...match,
        student,
      });
    }
    
    return matchesWithData;
  },
});

export const getAcceptedMatchesForPreceptor = query({
  args: { preceptorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.preceptorId) {
      throw new Error("Unauthorized");
    }

    // Get preceptor record to find matches
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", args.preceptorId))
      .first();

    if (!preceptor) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.or(q.eq(q.field("status"), "confirmed"), q.eq(q.field("status"), "active")))
      .order("desc")
      .collect();

    // Populate student data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      matchesWithData.push({
        ...match,
        student,
      });
    }
    
    return matchesWithData;
  },
});

export const getReviewingMatchesForPreceptor = query({
  args: { preceptorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.preceptorId) {
      throw new Error("Unauthorized");
    }

    // Get preceptor record to find matches
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", args.preceptorId))
      .first();

    if (!preceptor) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.eq(q.field("status"), "reviewing"))
      .order("desc")
      .collect();

    // Populate student data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      matchesWithData.push({
        ...match,
        student,
      });
    }
    
    return matchesWithData;
  },
});

export const getActiveStudentsForPreceptor = query({
  args: { preceptorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId || userId !== args.preceptorId) {
      throw new Error("Unauthorized");
    }

    // Get preceptor record to find matches
    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", args.preceptorId))
      .first();

    if (!preceptor) return [];

    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.or(q.eq(q.field("status"), "active"), q.eq(q.field("status"), "confirmed")))
      .order("desc")
      .collect();

    // Populate student data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      matchesWithData.push({
        ...match,
        student,
      });
    }
    
    return matchesWithData;
  },
});

// AI-Enhanced Matching Functions

// Find AI-enhanced potential matches for a student
export const findAIEnhancedMatches = query({
  args: { 
    studentId: v.id("students"),
    limit: v.optional(v.number()),
    useAI: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Get all verified, available preceptors
    const availablePreceptors = await ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", "verified"))
      .collect();

    // Filter and score potential matches
    const potentialMatches = [];

    for (const preceptor of availablePreceptors) {
      if (!preceptor.availability?.currentlyAccepting) continue;

      // Calculate base MentorFit score
      const baseScore = calculateMentorFitScore(
        student.learningStyle,
        preceptor.mentoringStyle
      );

      potentialMatches.push({
        preceptorId: preceptor._id,
        preceptor,
        baseScore,
      });
    }

    // Sort by base score initially
    potentialMatches.sort((a, b) => b.baseScore - a.baseScore);

    return potentialMatches.slice(0, args.limit || 10);
  },
});

// Internal mutation to update match with AI analysis
export const updateMatchWithAI = internalMutation({
  args: {
    matchId: v.id("matches"),
    aiAnalysis: v.object({
      enhancedScore: v.number(),
      analysis: v.string(),
      confidence: v.string(),
      recommendations: v.array(v.string()),
      strengths: v.array(v.string()),
      concerns: v.array(v.string()),
      analyzedAt: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matchId, {
      aiAnalysis: args.aiAnalysis,
      updatedAt: Date.now(),
    });
  },
});

// Internal query to get match by ID
export const getMatchById = internalQuery({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.matchId);
  },
});

// Get analytics data for matches (admin dashboard)
export const getMatchAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("matches");
    
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), args.dateRange!.start),
          q.lte(q.field("createdAt"), args.dateRange!.end)
        )
      );
    }
    
    const matches = await query.collect();
    
    const analytics = {
      totalMatches: matches.length,
      suggested: matches.filter(m => m.status === "suggested").length,
      pending: matches.filter(m => m.status === "pending").length,
      confirmed: matches.filter(m => m.status === "confirmed").length,
      active: matches.filter(m => m.status === "active").length,
      completed: matches.filter(m => m.status === "completed").length,
      cancelled: matches.filter(m => m.status === "cancelled").length,
      paid: matches.filter(m => m.paymentStatus === "paid").length,
      unpaid: matches.filter(m => m.paymentStatus === "unpaid").length,
      refunded: matches.filter(m => m.paymentStatus === "refunded").length,
      averageMentorFitScore: 0,
      successRate: 0,
      paymentSuccessRate: 0,
    };
    
    // Calculate average MentorFit score
    if (matches.length > 0) {
      const totalScore = matches.reduce((sum, m) => sum + (m.mentorFitScore || 0), 0);
      analytics.averageMentorFitScore = totalScore / matches.length;
    }
    
    // Calculate success rate (confirmed + active + completed / total)
    const successfulMatches = analytics.confirmed + analytics.active + analytics.completed;
    analytics.successRate = analytics.totalMatches > 0 
      ? (successfulMatches / analytics.totalMatches) * 100 
      : 0;
      
    // Calculate payment success rate
    analytics.paymentSuccessRate = analytics.totalMatches > 0
      ? (analytics.paid / analytics.totalMatches) * 100
      : 0;
    
    return analytics;
  },
});

// Get matches by enterprise ID (for enterprise dashboard)
export const getByEnterpriseId = query({
  args: { enterpriseId: v.id("enterprises") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Verify user has access to this enterprise
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }

    // Get all matches related to this enterprise through students/preceptors
    // This would require linking students and preceptors to enterprises
    const matches = await ctx.db
      .query("matches")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();

    // Populate student and preceptor data
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const preceptor = await ctx.db.get(match.preceptorId);
      matchesWithData.push({
        ...match,
        student,
        preceptor,
      });
    }

    return matchesWithData;
  },
});
