import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery, action } from "./_generated/server";
import { getUserId } from "./auth";
import { internal } from "./_generated/api";

// Helper function to calculate detailed compatibility breakdown
function calculateCompatibilityBreakdown(
  studentLearningStyle: any,
  preceptorMentoringStyle: any
) {
  const breakdown = {
    learningStyle: 0,
    communication: 0,
    schedule: 0,
    mentorship: 0,
    autonomy: 0,
    resources: 0,
  };

  // Learning Style Alignment (0-10 scale)
  if (
    (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
    (studentLearningStyle.learningMethod === "step-by-step" && preceptorMentoringStyle.mentoringApproach === "coach-guide") ||
    (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "expect-initiative")
  ) {
    breakdown.learningStyle = 10;
  } else if (
    (studentLearningStyle.learningMethod === "hands-on" && preceptorMentoringStyle.mentoringApproach === "support-needed") ||
    (studentLearningStyle.learningMethod === "independent" && preceptorMentoringStyle.mentoringApproach === "support-needed")
  ) {
    breakdown.learningStyle = 7;
  } else {
    breakdown.learningStyle = 5;
  }

  // Communication Preferences (0-10 scale)
  if (
    (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "real-time") ||
    (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
    (studentLearningStyle.feedbackPreference === "minimal" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
  ) {
    breakdown.communication = 10;
  } else if (
    (studentLearningStyle.feedbackPreference === "real-time" && preceptorMentoringStyle.feedbackApproach === "daily-checkins") ||
    (studentLearningStyle.feedbackPreference === "end-of-day" && preceptorMentoringStyle.feedbackApproach === "weekly-written")
  ) {
    breakdown.communication = 7;
  } else {
    breakdown.communication = 4;
  }

  // Schedule Compatibility (mock - would be calculated from availability data)
  breakdown.schedule = 9; // High default for demo

  // Mentorship Approach
  if (
    (studentLearningStyle.mentorRelationship === "teacher-coach" && preceptorMentoringStyle.idealDynamic === "learner-teacher") ||
    (studentLearningStyle.mentorRelationship === "collaborator" && preceptorMentoringStyle.idealDynamic === "teammates") ||
    (studentLearningStyle.mentorRelationship === "supervisor" && preceptorMentoringStyle.idealDynamic === "supervisee-clinician")
  ) {
    breakdown.mentorship = 10;
  } else {
    breakdown.mentorship = 6;
  }

  // Autonomy Level
  if (
    (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "high-independence") ||
    (studentLearningStyle.clinicalComfort === "not-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision") ||
    (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions")
  ) {
    breakdown.autonomy = 10;
  } else if (
    (studentLearningStyle.clinicalComfort === "very-comfortable" && preceptorMentoringStyle.autonomyLevel === "shared-decisions") ||
    (studentLearningStyle.clinicalComfort === "somewhat-comfortable" && preceptorMentoringStyle.autonomyLevel === "close-supervision")
  ) {
    breakdown.autonomy = 7;
  } else {
    breakdown.autonomy = 4;
  }

  // Resource Preferences
  if (
    (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "always") ||
    (studentLearningStyle.additionalResources === "not-necessary" && preceptorMentoringStyle.learningMaterials === "rarely") ||
    (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "sometimes")
  ) {
    breakdown.resources = 10;
  } else if (
    (studentLearningStyle.additionalResources === "yes-love" && preceptorMentoringStyle.learningMaterials === "sometimes") ||
    (studentLearningStyle.additionalResources === "occasionally" && preceptorMentoringStyle.learningMaterials === "always")
  ) {
    breakdown.resources = 7;
  } else {
    breakdown.resources = 5;
  }

  return breakdown;
}

// Helper function to generate match reason text
function generateMatchReason(breakdown: any, student: any, preceptor: any): string {
  const strengths = [];
  
  if (breakdown.learningStyle >= 9) {
    strengths.push("learning style alignment");
  }
  if (breakdown.communication >= 9) {
    strengths.push("communication preferences");
  }
  if (breakdown.schedule >= 9) {
    strengths.push("schedule compatibility");
  }
  if (breakdown.mentorship >= 9) {
    strengths.push("mentorship approach");
  }
  if (breakdown.autonomy >= 9) {
    strengths.push("independence level");
  }

  if (strengths.length >= 3) {
    return `Excellent alignment in ${strengths.slice(0, 3).join(", ")} and overall teaching compatibility.`;
  } else if (strengths.length >= 2) {
    return `Strong match with great ${strengths.join(" and ")} alignment.`;
  } else if (strengths.length === 1) {
    return `Good compatibility with excellent ${strengths[0]} and solid overall alignment.`;
  } else {
    return `Compatible match with balanced teaching and learning approach alignment.`;
  }
}

// Helper function to get tier from score
function getTierFromScore(score: number): { name: string; color: string; description: string } {
  const { MatchScoringManager } = require("./services/matches/MatchScoringManager");
  return new MatchScoringManager().getTierFromScore(score);
}

// MentorFit compatibility scoring algorithm
function calculateMentorFitScore(studentLearningStyle: any, preceptorMentoringStyle: any): number {
  const { MatchScoringManager } = require("./services/matches/MatchScoringManager");
  return new MatchScoringManager().calculateMentorFitScore(studentLearningStyle, preceptorMentoringStyle);
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
    // Get additional location data from user if available
    const preceptorUser = await ctx.db.get(preceptor.userId);
    const locationData = {
      city: preceptor.practiceInfo.city,
      state: preceptor.practiceInfo.state,
      zipCode: preceptor.practiceInfo.zipCode,
      county: preceptorUser?.location?.county || undefined,
      metroArea: preceptorUser?.location?.metroArea || undefined,
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

    // Get all verified, available preceptors
    const availablePreceptors = await ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", "verified"))
      .collect();

    // Filter and score potential matches
    const potentialMatches = [];

    for (const preceptor of availablePreceptors) {
      if (!preceptor.availability.currentlyAccepting) continue;


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

      // Check geographic compatibility
      let locationScore = 2; // Base score for available preceptor
      
      // Bonus for same state
      if (student.rotationNeeds.preferredLocation && 
          student.rotationNeeds.preferredLocation.state === preceptor.practiceInfo.state) {
        locationScore = 2.5; // Same state preference
      }
      
      // Bonus for same city/metro area
      if (student.rotationNeeds.preferredLocation && 
          student.rotationNeeds.preferredLocation.city === preceptor.practiceInfo.city) {
        locationScore = 3; // Same city preference
      } else if (student.rotationNeeds.willingToTravel) {
        locationScore = 2; // Willing to travel
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

// AI-Enhanced Matching - finds and analyzes potential matches with AI insights
export const findAIEnhancedMatches = action({
  args: { 
    studentId: v.id("students"),
    limit: v.optional(v.number()),
    useAI: v.optional(v.boolean()) 
  },
  handler: async (ctx, args): Promise<any> => {
    const limit = args.limit || 5;
    const useAI = args.useAI !== false; // Default to true

    try {
      // Get potential matches using existing algorithm
      const potentialMatches: any = await ctx.runQuery(internal.matches.findPotentialMatchesInternal, {
        studentId: args.studentId
      });

      if (potentialMatches.length === 0) {
        return {
          success: true,
          matches: [],
          totalFound: 0,
          aiEnhanced: false,
          message: "No compatible preceptors found in Texas"
        };
      }

      // If AI is disabled, return basic matches
      if (!useAI) {
        return {
          success: true,
          matches: potentialMatches.slice(0, limit).map((match: any) => ({
            preceptorId: match.preceptor._id,
            preceptorName: match.preceptor.personalInfo?.fullName || "Unknown",
            baseScore: match.mentorFitScore,
            enhancedScore: match.mentorFitScore,
            overallScore: match.overallScore,
            locationScore: match.locationScore,
            specialty: match.preceptor.availability?.availableRotations || [],
            practice: match.preceptor.practiceInfo,
            aiEnhanced: false,
            analysis: "Basic MentorFit scoring only",
            confidence: "medium",
            strengths: [],
            concerns: [],
            recommendations: []
          })),
          totalFound: potentialMatches.length,
          aiEnhanced: false
        };
      }

      // Prepare matches for AI analysis
      const matchesForAI = potentialMatches.slice(0, limit).map((match: any) => ({
        preceptorId: match.preceptor._id,
        baseScore: match.mentorFitScore
      }));

      // Run AI batch analysis
      const aiResults: any = await ctx.runAction(internal.aiMatching.batchAnalyzeMatches, {
        studentId: args.studentId,
        potentialMatches: matchesForAI,
        limit
      });

      if (!aiResults.success) {
        // Fallback to basic matches if AI fails
        return {
          success: true,
          matches: potentialMatches.slice(0, limit).map((match: any, index: number) => ({
            preceptorId: match.preceptor._id,
            preceptorName: match.preceptor.personalInfo?.fullName || "Unknown",
            baseScore: match.mentorFitScore,
            enhancedScore: match.mentorFitScore,
            overallScore: match.overallScore,
            locationScore: match.locationScore,
            specialty: match.preceptor.availability?.availableRotations || [],
            practice: match.preceptor.practiceInfo,
            aiEnhanced: false,
            analysis: `AI analysis failed: ${aiResults.error}`,
            confidence: "low",
            strengths: [],
            concerns: ["AI analysis unavailable"],
            recommendations: ["Manual review recommended"]
          })),
          totalFound: potentialMatches.length,
          aiEnhanced: false,
          aiError: aiResults.error
        };
      }

      // Combine original match data with AI insights
      const enhancedMatches = aiResults.matches.map((aiMatch: any) => {
        const originalMatch = potentialMatches.find((m: any) => m.preceptor._id === aiMatch.preceptorId);
        return {
          ...aiMatch,
          overallScore: originalMatch?.overallScore || aiMatch.enhancedScore,
          locationScore: originalMatch?.locationScore || 2,
          specialty: originalMatch?.preceptor.availability?.availableRotations || [],
          practice: originalMatch?.preceptor.practiceInfo || {},
          aiEnhanced: true
        };
      });

      return {
        success: true,
        matches: enhancedMatches,
        totalFound: potentialMatches.length,
        aiEnhanced: true,
        aiProvider: aiResults.aiProvider,
        totalAnalyzed: aiResults.totalAnalyzed,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error("AI-enhanced matching failed:", error);
      return {
        success: false,
        matches: [],
        totalFound: 0,
        aiEnhanced: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    let query = ctx.db.query("matches");
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
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
      .withIndex("byStudentIdAndStatus", (q) => q.eq("studentId", student._id).eq("status", "suggested"))
      .order("desc")
      .collect();

    // Populate preceptor data and add compatibility breakdown
    const matchesWithData = [];
    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      if (preceptor) {
        // Calculate detailed compatibility breakdown
        const compatibilityBreakdown = calculateCompatibilityBreakdown(
          student.learningStyle,
          preceptor.mentoringStyle
        );

        // Generate match reason based on top scoring aspects
        const matchReason = generateMatchReason(compatibilityBreakdown, student, preceptor);

        // Get tier based on score
        const tier = getTierFromScore(match.mentorFitScore);

        matchesWithData.push({
          ...match,
          preceptor,
          compatibilityBreakdown,
          matchReason,
          tier,
        });
      }
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

    const active = await ctx.db
      .query("matches")
      .withIndex("byStudentIdAndStatus", (q) => q.eq("studentId", student._id).eq("status", "active"))
      .order("desc")
      .collect();
    const confirmed = await ctx.db
      .query("matches")
      .withIndex("byStudentIdAndStatus", (q) => q.eq("studentId", student._id).eq("status", "confirmed"))
      .order("desc")
      .collect();
    const matches = [...active, ...confirmed];

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
      .withIndex("byStudentIdAndStatus", (q) => q.eq("studentId", student._id).eq("status", "completed"))
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

    // Create secure messaging conversation for the match
    try {
      await ctx.runMutation(internal.messages.createConversationForMatch, {
        matchId: args.matchId,
      });
    } catch (error) {
      console.error("Failed to create conversation for match:", error);
      // Don't fail match acceptance if conversation creation fails
    }

    // Send match confirmation emails automatically
    try {
      const preceptor = await ctx.db.get(match.preceptorId);
      if (student && preceptor) {
        await ctx.scheduler.runAfter(0, internal.emails.sendMatchConfirmationEmails, {
          studentEmail: student.personalInfo?.email || '',
          studentFirstName: student.personalInfo?.fullName?.split(' ')[0] || 'Student',
          preceptorEmail: preceptor.personalInfo?.email || '',
          preceptorFirstName: preceptor.personalInfo?.fullName?.split(' ')[0] || 'Doctor',
          preceptorName: preceptor.personalInfo?.fullName || 'Your Preceptor',
          studentName: student.personalInfo?.fullName || 'Your Student',
          specialty: match.rotationDetails?.rotationType || 'Rotation',
          location: `${preceptor.practiceInfo?.city || ''}, ${preceptor.practiceInfo?.state || ''}`.trim(),
          startDate: match.rotationDetails?.startDate || 'TBD',
          endDate: match.rotationDetails?.endDate || 'TBD',
          paymentLink: process.env.NEXT_PUBLIC_APP_URL ? 
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payment-success?matchId=${match._id}` : 
            undefined,
        });
      }
    } catch (error) {
      console.error("Failed to send match confirmation emails:", error);
      // Don't fail match acceptance if email fails
    }

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

    const suggested = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) => q.eq("preceptorId", preceptor._id).eq("status", "suggested"))
      .order("desc")
      .collect();
    const pending = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) => q.eq("preceptorId", preceptor._id).eq("status", "pending"))
      .order("desc")
      .collect();
    const matches = [...suggested, ...pending];

    // Populate student data with enhanced details
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const studentUser = student ? await ctx.db.get(student.userId) : null;
      
      // Calculate compatibility breakdown if available
      let compatibilityBreakdown = null;
      let matchReason = null;
      let tier = null;
      
      if (student && preceptor) {
        try {
          compatibilityBreakdown = calculateCompatibilityBreakdown(
            student.learningStyle,
            preceptor.mentoringStyle
          );
          matchReason = generateMatchReason(compatibilityBreakdown, student, preceptor);
          tier = getTierFromScore(match.mentorFitScore);
        } catch (error) {
          console.log("Could not calculate compatibility breakdown:", error);
        }
      }
      
      matchesWithData.push({
        ...match,
        student,
        studentName: studentUser?.name || student?.personalInfo?.fullName || 'Unknown Student',
        schoolName: student?.schoolInfo?.programName || 'Unknown School',
        degreeTrack: student?.schoolInfo?.degreeTrack || 'Unknown Track',
        compatibilityBreakdown,
        matchReason,
        tier,
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

    const active = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) => q.eq("preceptorId", preceptor._id).eq("status", "active"))
      .order("desc")
      .collect();
    const completed = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) =>
        q.eq("preceptorId", preceptor._id).eq("status", "completed"),
      )
      .order("desc")
      .collect();
    const matches = [...active, ...completed];

    // Populate student data with enhanced details
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const studentUser = student ? await ctx.db.get(student.userId) : null;
      
      // Calculate rotation progress
      // Calculate total hours from weekly hours and duration
      const weeklyHours = match.rotationDetails?.weeklyHours || 40;
      const hoursRequired = weeklyHours * 4; // Estimate 4 weeks
      const hoursCompleted = match.status === "completed" ? hoursRequired : 
                            match.status === "active" ? Math.floor(hoursRequired * 0.6) : 0;
      const progressPercentage = Math.round((hoursCompleted / hoursRequired) * 100);
      
      matchesWithData.push({
        ...match,
        student,
        studentName: studentUser?.name || student?.personalInfo?.fullName || 'Unknown Student',
        schoolName: student?.schoolInfo?.programName || 'Unknown School',
        degreeTrack: student?.schoolInfo?.degreeTrack || 'Unknown Track',
        hoursCompleted,
        hoursRequired,
        progressPercentage,
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
      .withIndex("byPreceptorIdAndStatus", (q) =>
        q.eq("preceptorId", preceptor._id).eq("status", "confirmed"),
      )
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

    const active = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) => q.eq("preceptorId", preceptor._id).eq("status", "active"))
      .order("desc")
      .collect();
    const confirmed = await ctx.db
      .query("matches")
      .withIndex("byPreceptorIdAndStatus", (q) => q.eq("preceptorId", preceptor._id).eq("status", "confirmed"))
      .order("desc")
      .collect();
    const matches = [...active, ...confirmed];

    // Populate student data with additional details
    const matchesWithData = [];
    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const studentUser = student ? await ctx.db.get(student.userId) : null;
      
      // Calculate rotation progress
      // Calculate total hours from weekly hours and duration
      const weeklyHours = match.rotationDetails?.weeklyHours || 40;
      const hoursRequired = weeklyHours * 4; // Estimate 4 weeks
      const hoursCompleted = match.status === "completed" ? hoursRequired : 
                            match.status === "active" ? Math.floor(hoursRequired * 0.6) : 0;
      
      matchesWithData.push({
        ...match,
        student,
        studentName: studentUser?.name || student?.personalInfo?.fullName || 'Unknown Student',
        schoolName: student?.schoolInfo?.programName || 'Unknown School',
        degreeTrack: student?.schoolInfo?.degreeTrack || 'Unknown Track',
        hoursCompleted,
        title: `${match.rotationDetails?.rotationType || 'Clinical'} Rotation`,
        preceptor: preceptor?.personalInfo?.fullName || 'Assigned Preceptor',
        location: match.rotationDetails?.location || 'Clinical Site',
      });
    }
    
    return matchesWithData;
  },
});

// AI-Enhanced Matching Functions

// Find basic potential matches for a student (query version)
export const findBasicPotentialMatches = query({
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

// Public query to get match by ID (with authorization)
export const getMatchByIdPublic = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) return null;

    // Verify user has access to this match
    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (student?.userId !== userId && preceptor?.userId !== userId) {
      throw new Error("Unauthorized access to match");
    }

    return match;
  },
});

// Get student rotations (completed matches for a student)
export const getStudentRotations = query({
  args: { studentId: v.optional(v.id("students")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    let targetStudentId = args.studentId;
    
    // If no studentId provided, get current user's student profile
    if (!targetStudentId) {
      const student = await ctx.db
        .query("students")
        .withIndex("byUserId", (q) => q.eq("userId", userId))
        .first();
      
      if (!student) {
        throw new Error("Student profile not found");
      }
      targetStudentId = student._id;
    } else {
      // Verify user has access to this student
      const student = await ctx.db.get(targetStudentId);
      if (student?.userId !== userId) {
        throw new Error("Unauthorized access to student rotations");
      }
    }

    // Get all matches for this student
    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", targetStudentId))
      .collect();

    // Populate with preceptor and practice data
    const rotations = [];
    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      const preceptorUser = preceptor ? await ctx.db.get(preceptor.userId) : null;
      
      // Calculate rotation progress (mock for now - would come from hours tracking)
      // Calculate total hours from weekly hours and duration
      const weeklyHours = match.rotationDetails?.weeklyHours || 40;
      const hoursRequired = weeklyHours * 4; // Estimate 4 weeks
      const hoursCompleted = match.status === "completed" ? hoursRequired : 
                            match.status === "active" ? Math.floor(hoursRequired * 0.6) : 0;
      
      // Calculate end date if not provided
      const startDate = match.rotationDetails?.startDate ? new Date(match.rotationDetails.startDate) : null;
      const durationWeeks = hoursRequired / weeklyHours;
      const endDate = startDate ? new Date(startDate.getTime() + (durationWeeks * 7 * 24 * 60 * 60 * 1000)) : null;
      
      rotations.push({
        _id: match._id,
        title: `${match.rotationDetails?.rotationType?.replace('-', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Clinical'} Rotation`,
        preceptor: preceptorUser?.name || preceptor?.personalInfo?.fullName || "Unknown Preceptor",
        location: preceptor ? `${preceptor.practiceInfo?.practiceName || 'Practice'} - ${preceptor.practiceInfo?.city || 'City'}, ${preceptor.practiceInfo?.state || 'State'}` : "Unknown Location",
        startDate: match.rotationDetails?.startDate || startDate?.toISOString() || "",
        endDate: match.rotationDetails?.endDate || endDate?.toISOString() || "",
        status: match.status,
        hoursCompleted,
        hoursRequired,
        rotationType: match.rotationDetails?.rotationType || "clinical",
        schedule: `${weeklyHours} hours/week`,
        weeklyHours,
        mentorFitScore: match.mentorFitScore || 0,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
        preceptorContact: {
          email: preceptorUser?.email || preceptor?.personalInfo?.email,
          phone: preceptor?.personalInfo?.mobilePhone
        }
      });
    }

    // Sort by status priority (active first, then scheduled, then completed)
    const statusOrder = { "active": 0, "confirmed": 1, "scheduled": 2, "completed": 3, "cancelled": 4, "pending": 5, "suggested": 6 };
    return rotations.sort((a, b) => {
      const statusDiff = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
      if (statusDiff !== 0) return statusDiff;
      // If same status, sort by start date (newest first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
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
    const { MatchAnalyticsManager } = require("./services/matches/MatchAnalyticsManager");
    return await new MatchAnalyticsManager().compute(ctx, args.dateRange || undefined);
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
    // First, get all users that belong to this enterprise
    const enterpriseUsers = await ctx.db
      .query("users")
      .withIndex("byExternalId")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();

    const enterpriseUserIds = new Set(enterpriseUsers.map(user => user._id));

    // Get all students and preceptors that belong to this enterprise
    const allStudents = await ctx.db.query("students").collect();
    const allPreceptors = await ctx.db.query("preceptors").collect();

    const enterpriseStudentIds = new Set(
      allStudents
        .filter(s => enterpriseUserIds.has(s.userId))
        .map(s => s._id)
    );
    const enterprisePreceptorIds = new Set(
      allPreceptors
        .filter(p => enterpriseUserIds.has(p.userId))
        .map(p => p._id)
    );

    // Get all matches that involve enterprise students or preceptors
    const matches = await ctx.db
      .query("matches")
      .collect();

    const enterpriseMatches = matches.filter(match =>
      enterpriseStudentIds.has(match.studentId) ||
      enterprisePreceptorIds.has(match.preceptorId)
    );

    // Populate student and preceptor data
    const matchesWithData = [];
    for (const match of enterpriseMatches) {
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


// Update payment status for a match (internal)
export const updatePaymentStatusInternal = internalMutation({
  args: { 
    matchId: v.id("matches"),
    paymentStatus: v.union(v.literal("paid"), v.literal("unpaid"), v.literal("refunded"), v.literal("cancelled"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.matchId, {
      paymentStatus: args.paymentStatus,
      updatedAt: Date.now(),
    });
  },
});

// Duplicate updateMatchWithAI function removed - original is at line 1128

// Duplicate getMatchById function removed - original is at line 1150

// Complete a rotation (triggers survey emails)
export const completeRotation = mutation({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");
    
    // Only allow completion by student or preceptor involved in the match
    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (!student || !preceptor || 
        (student.userId !== userId && preceptor.userId !== userId)) {
      throw new Error("Unauthorized: You can only complete your own rotations");
    }
    
    if (match.status !== "active" && match.status !== "confirmed") {
      throw new Error("Rotation cannot be completed in current status");
    }

    // Mark rotation as complete
    await ctx.db.patch(args.matchId, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Send rotation completion emails with survey links
    try {
      await ctx.scheduler.runAfter(0, internal.emails.sendRotationCompleteEmails, {
        studentEmail: student.personalInfo?.email || '',
        studentFirstName: student.personalInfo?.fullName?.split(' ')[0] || 'Student',
        preceptorEmail: preceptor.personalInfo?.email || '',
        preceptorFirstName: preceptor.personalInfo?.fullName?.split(' ')[0] || 'Doctor',
        studentName: student.personalInfo?.fullName || 'Student',
        preceptorName: preceptor.personalInfo?.fullName || 'Preceptor',
        matchId: match._id,
      });
    } catch (error) {
      console.error("Failed to send rotation completion emails:", error);
      // Don't fail completion if email fails
    }

    return args.matchId;
  },
});

// Get potential matches (internal - expose for AI matching)
export const findPotentialMatchesInternal = internalQuery({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const { MatchSelectionManager } = require("./services/matches/MatchSelectionManager");
    const selection = new MatchSelectionManager();
    return await selection.findPotentialMatches(ctx, args.studentId);
  },
});


// Batch analyze multiple matches (internal function)
export const batchAnalyzeMatches = internalQuery({
  args: {
    matchIds: v.array(v.id("matches")),
  },
  handler: async (ctx, args) => {
    const matches = [];
    
    for (const matchId of args.matchIds) {
      const match = await ctx.db.get(matchId);
      if (match) {
        matches.push(match);
      }
    }
    
    return matches;
  },
});
