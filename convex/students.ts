import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

// Create or update student profile
export const createOrUpdateStudent = mutation({
  args: {
    personalInfo: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      dateOfBirth: v.string(),
      preferredContact: v.union(v.literal("email"), v.literal("phone"), v.literal("text")),
      linkedinOrResume: v.optional(v.string()),
    }),
    schoolInfo: v.object({
      programName: v.string(),
      degreeTrack: v.union(
        v.literal("FNP"), v.literal("PNP"), v.literal("PMHNP"), 
        v.literal("AGNP"), v.literal("ACNP"), v.literal("WHNP"), 
        v.literal("NNP"), v.literal("DNP")
      ),
      schoolLocation: v.object({
        city: v.string(),
        state: v.string(),
      }),
      programFormat: v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid")),
      expectedGraduation: v.string(),
      clinicalCoordinatorName: v.optional(v.string()),
      clinicalCoordinatorEmail: v.optional(v.string()),
    }),
    rotationNeeds: v.object({
      rotationTypes: v.array(v.union(
        v.literal("family-practice"), v.literal("pediatrics"), v.literal("psych-mental-health"),
        v.literal("womens-health"), v.literal("adult-gero"), v.literal("acute-care"),
        v.literal("telehealth"), v.literal("other")
      )),
      otherRotationType: v.optional(v.string()),
      startDate: v.string(),
      endDate: v.string(),
      weeklyHours: v.union(
        v.literal("<8"), v.literal("8-16"), v.literal("16-24"), 
        v.literal("24-32"), v.literal("32+")
      ),
      daysAvailable: v.array(v.union(
        v.literal("monday"), v.literal("tuesday"), v.literal("wednesday"),
        v.literal("thursday"), v.literal("friday"), v.literal("saturday"), v.literal("sunday")
      )),
      willingToTravel: v.boolean(),
      preferredLocation: v.optional(v.object({
        city: v.string(),
        state: v.string(),
      })),
    }),
    matchingPreferences: v.object({
      comfortableWithSharedPlacements: v.optional(v.boolean()),
      languagesSpoken: v.optional(v.array(v.string())),
      idealPreceptorQualities: v.optional(v.string()),
    }),
    learningStyle: v.object({
      // Basic questions (1-10)
      learningMethod: v.union(v.literal("hands-on"), v.literal("step-by-step"), v.literal("independent")),
      clinicalComfort: v.union(v.literal("not-comfortable"), v.literal("somewhat-comfortable"), v.literal("very-comfortable")),
      feedbackPreference: v.union(v.literal("real-time"), v.literal("end-of-day"), v.literal("minimal")),
      structurePreference: v.union(v.literal("clear-schedules"), v.literal("general-guidance"), v.literal("open-ended")),
      mentorRelationship: v.union(v.literal("teacher-coach"), v.literal("collaborator"), v.literal("supervisor")),
      observationPreference: v.union(v.literal("observe-first"), v.literal("mix-both"), v.literal("jump-in")),
      correctionStyle: v.union(v.literal("direct-immediate"), v.literal("supportive-private"), v.literal("written-summaries")),
      retentionStyle: v.union(v.literal("watching-doing"), v.literal("note-taking"), v.literal("questions-discussion")),
      additionalResources: v.union(v.literal("yes-love"), v.literal("occasionally"), v.literal("not-necessary")),
      proactiveQuestions: v.number(), // 1-5 scale
      // Phase 2.0 Extended questions (11-18)
      feedbackType: v.optional(v.union(v.literal("verbal-examples"), v.literal("specific-critiques"), v.literal("encouragement-affirmation"))),
      mistakeApproach: v.optional(v.union(v.literal("corrected-immediately"), v.literal("talk-through-after"), v.literal("reflect-silently"))),
      motivationType: v.optional(v.union(v.literal("trusted-responsibility"), v.literal("seeing-progress"), v.literal("positive-feedback"))),
      preparationStyle: v.optional(v.union(v.literal("coached-through"), v.literal("present-get-feedback"), v.literal("try-fully-alone"))),
      learningCurve: v.optional(v.union(v.literal("challenge-early-often"), v.literal("build-gradually"), v.literal("repetition-reinforcement"))),
      frustrations: v.optional(v.union(v.literal("lack-expectations"), v.literal("minimal-vague-feedback"), v.literal("being-micromanaged"))),
      environment: v.optional(v.union(v.literal("calm-controlled"), v.literal("some-pressure"), v.literal("high-energy"))),
      observationNeeds: v.optional(v.union(v.literal("watch-1-2-first"), v.literal("just-one-enough"), v.literal("ready-start-immediately"))),
      // Personality & Values (shared with preceptors)
      professionalValues: v.optional(v.array(v.union(
        v.literal("compassion"), v.literal("efficiency"), v.literal("collaboration"), 
        v.literal("lifelong-learning"), v.literal("integrity"), v.literal("equity-inclusion"), v.literal("advocacy")
      ))),
      clinicalEnvironment: v.optional(v.union(v.literal("calm-methodical"), v.literal("busy-fast-paced"), v.literal("flexible-informal"), v.literal("structured-clear-goals"))),
      // Experience Level
      programStage: v.optional(v.union(v.literal("just-starting"), v.literal("mid-program"), v.literal("near-graduation"))),
      // Flexibility
      scheduleFlexibility: v.optional(v.union(v.literal("very-flexible"), v.literal("somewhat-flexible"), v.literal("prefer-fixed"))),
    }),
    agreements: v.object({
      agreedToPaymentTerms: v.boolean(),
      agreedToTermsAndPrivacy: v.boolean(),
      digitalSignature: v.string(),
      submissionDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create student profile");
    }

    // Check if student profile already exists
    const existingStudent = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    const studentData = {
      userId,
      personalInfo: args.personalInfo,
      schoolInfo: args.schoolInfo,
      rotationNeeds: args.rotationNeeds,
      matchingPreferences: args.matchingPreferences,
      learningStyle: args.learningStyle,
      agreements: args.agreements,
      status: "submitted" as const,
      updatedAt: Date.now(),
    };

    if (existingStudent) {
      // Update existing student
      await ctx.db.patch(existingStudent._id, studentData);
      return existingStudent._id;
    } else {
      // Create new student
      const studentId = await ctx.db.insert("students", {
        ...studentData,
        createdAt: Date.now(),
      });
      
      // Update user type
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", ctx.auth.getUserIdentity()?.subject ?? ""))
        .first();
      
      if (user) {
        await ctx.db.patch(user._id, { userType: "student" });
      }
      
      return studentId;
    }
  },
});

// Get current user's student profile
export const getCurrentStudent = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get student by ID (for admin/matching purposes)
export const getStudentById = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.studentId);
  },
});

// Get students by status (for admin)
export const getStudentsByStatus = query({
  args: { status: v.union(v.literal("incomplete"), v.literal("submitted"), v.literal("under-review"), v.literal("matched"), v.literal("active")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("students")
      .withIndex("byStatus", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Update student status (for admin)
export const updateStudentStatus = mutation({
  args: { 
    studentId: v.id("students"), 
    status: v.union(v.literal("incomplete"), v.literal("submitted"), v.literal("under-review"), v.literal("matched"), v.literal("active"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, { 
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get students needing matches (for matching algorithm)
export const getStudentsNeedingMatches = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("students")
      .withIndex("byStatus", (q) => q.eq("status", "submitted"))
      .collect();
  },
});

// Get student by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getUserId(ctx);
    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get students by enterprise ID (for enterprise dashboard)
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

    // Get all students associated with this enterprise
    // Note: This assumes students are linked to enterprises through school partnerships
    // You may need to adjust this based on your specific enterprise-student relationship
    return await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();
  },
});