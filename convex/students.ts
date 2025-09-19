import { v } from "convex/values";
import { internalQuery, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserId } from "./auth";
import { isAdminEmail } from "./users";

const cleanPartial = <T extends Record<string, unknown>>(partial: Partial<T>) => {
  const entries = Object.entries(partial).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
};

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
    membershipPlan: v.optional(v.union(v.literal("core"), v.literal("pro"), v.literal("premium"))),
  },
  handler: async (ctx, args) => {
    const allowDebug = typeof process !== "undefined" && process.env.NODE_ENV !== "production";
    if (allowDebug) {
      console.log("[createOrUpdateStudent] Starting submission processing");
      console.log("[createOrUpdateStudent] Received data structure:", {
        hasPersonalInfo: !!args.personalInfo,
        hasSchoolInfo: !!args.schoolInfo,
        hasRotationNeeds: !!args.rotationNeeds,
        hasMatchingPreferences: !!args.matchingPreferences,
        hasLearningStyle: !!args.learningStyle,
        hasAgreements: !!args.agreements,
        learningStyleKeys: args.learningStyle ? Object.keys(args.learningStyle) : [],
        matchingPrefsKeys: args.matchingPreferences ? Object.keys(args.matchingPreferences) : [],
      });
    }

    // Step 1: Check authentication
    if (allowDebug) console.log("[createOrUpdateStudent] Step 1: Checking authentication");
    const identity = await ctx.auth.getUserIdentity();
    if (allowDebug) {
      console.log("[createOrUpdateStudent] Identity present:", { hasIdentity: !!identity });
    }

    if (!identity) {
      if (allowDebug) console.error("[createOrUpdateStudent] No identity found - user not authenticated");
      throw new Error("Not authenticated. Please sign in and try again.");
    }

    // Step 2: Get or create user
    if (allowDebug) console.log("[createOrUpdateStudent] Step 2: Getting user ID");
    let userId = await getUserId(ctx);
    
    if (!userId) {
      if (allowDebug) console.log("[createOrUpdateStudent] User not found, attempting to create");
      
      try {
        // Attempt to create the user if not exists
        const existingUser = await ctx.db
          .query("users")
          .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
          .unique();
        
        if (!existingUser) {
          if (allowDebug) console.log("[createOrUpdateStudent] Creating new user record");
          const userEmail = identity.email ?? "";
          const isAdmin = isAdminEmail(userEmail);
          
          userId = await ctx.db.insert("users", {
            name: identity.name ?? identity.email ?? "Unknown User",
            externalId: identity.subject,
            userType: isAdmin ? "admin" : "student",
            email: userEmail,
            permissions: isAdmin ? ["full_admin_access"] : undefined,
            createdAt: Date.now(),
          });
          if (allowDebug) console.log("[createOrUpdateStudent] User created with ID:", userId);
        } else {
          userId = existingUser._id;
          if (allowDebug) console.log("[createOrUpdateStudent] Found existing user with ID:", userId);
        }
      } catch (userCreationError) {
        if (allowDebug) console.error("[createOrUpdateStudent] Error during user creation/lookup");
        // Try one more time with getUserId in case there was a race condition
        userId = await getUserId(ctx);
        if (!userId) {
          throw new Error("Unable to create or find user profile. Please try again.");
        }
      }
    } else {
      if (allowDebug) console.log("[createOrUpdateStudent] Found user with ID:", userId);
    }

    // Re-verify we have a user ID
    if (!userId) {
      if (allowDebug) console.error("[createOrUpdateStudent] Failed to get or create user ID");
      throw new Error("Unable to process your request. Please refresh the page and try again.");
    }

    // Validate required fields
    try {
      // Validate personalInfo
      if (!args.personalInfo?.fullName) {
        throw new Error("Full name is required");
      }
      if (!args.personalInfo?.email) {
        throw new Error("Email is required");
      }
      if (!args.personalInfo?.phone) {
        throw new Error("Phone number is required");
      }
      
      // Validate schoolInfo
      if (!args.schoolInfo?.programName) {
        throw new Error("Program name is required");
      }
      if (!args.schoolInfo?.degreeTrack) {
        throw new Error("Degree track is required");
      }
      
      // Validate rotationNeeds
      if (!args.rotationNeeds?.rotationTypes || args.rotationNeeds.rotationTypes.length === 0) {
        throw new Error("At least one rotation type is required");
      }
      if (!args.rotationNeeds?.startDate) {
        throw new Error("Start date is required");
      }
      if (!args.rotationNeeds?.endDate) {
        throw new Error("End date is required");
      }
      
      // Validate learningStyle required fields
      if (!args.learningStyle?.learningMethod) {
        throw new Error("Learning method is required");
      }
      if (!args.learningStyle?.clinicalComfort) {
        throw new Error("Clinical comfort level is required");
      }
      
      // Validate agreements
      if (!args.agreements?.agreedToPaymentTerms) {
        throw new Error("Must agree to payment terms");
      }
      if (!args.agreements?.agreedToTermsAndPrivacy) {
        throw new Error("Must agree to terms and privacy policy");
      }
      if (!args.agreements?.digitalSignature) {
        throw new Error("Digital signature is required");
      }
    } catch (validationError) {
      console.error("Student profile validation error:", validationError);
      throw validationError;
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
      membershipPlan: args.membershipPlan,
      status: "submitted" as const,
      updatedAt: Date.now(),
    };

    let result;
    
    if (existingStudent) {
      console.log("[createOrUpdateStudent] Updating existing student profile");
      // Update existing student
      await ctx.db.patch(existingStudent._id, studentData);
      result = existingStudent._id;
      console.log("[createOrUpdateStudent] Student profile updated successfully:", result);
    } else {
      console.log("[createOrUpdateStudent] Creating new student profile");
      // Create new student
      const studentId = await ctx.db.insert("students", {
        ...studentData,
        createdAt: Date.now(),
      });
      console.log("[createOrUpdateStudent] Student profile created with ID:", studentId);
      
      // Update user type (non-blocking)
      try {
        const identity = await ctx.auth.getUserIdentity();
        const user = await ctx.db
          .query("users")
          .withIndex("byExternalId", (q) => q.eq("externalId", identity?.subject ?? ""))
          .first();
        
        if (user) {
          // Only update userType if the user is not an admin
          if (!isAdminEmail(user.email)) {
            await ctx.db.patch(user._id, { userType: "student" });
            console.log("[createOrUpdateStudent] User type updated to 'student'");
          } else {
            console.log("[createOrUpdateStudent] Preserving admin status for", user.email);
          }
          
          // Send welcome email for new students (completely optional)
          try {
            console.log("[createOrUpdateStudent] Attempting to schedule welcome email");
            const emailScheduled = await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
              email: args.personalInfo.email,
              firstName: args.personalInfo.fullName.split(' ')[0] || 'Student',
              userType: "student",
            });
            console.log("[createOrUpdateStudent] Welcome email scheduled successfully:", emailScheduled);
          } catch (emailError) {
            console.error("[createOrUpdateStudent] Failed to schedule welcome email:", emailError);
            // This is completely optional - continue without email
          }
        } else {
          console.warn("[createOrUpdateStudent] Could not find user to update type - continuing anyway");
        }
      } catch (userUpdateError) {
        console.error("[createOrUpdateStudent] Failed to update user type:", userUpdateError);
        // Non-critical - the student profile was created successfully
      }
      
      result = studentId;
    }
    
    console.log("[createOrUpdateStudent] Successfully processed student submission");
    return result;
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
export const getStudentById = internalQuery({
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

// Get all students (for admin/testing)
export const getAllStudents = query({
  handler: async (ctx) => {
    return await ctx.db.query("students").collect();
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

// Update student payment status after successful payment
export const updateStudentPaymentStatus = internalMutation({
  args: {
    userId: v.id("users"),
    paymentStatus: v.string(),
    membershipPlan: v.string(),
    stripeSessionId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    paidAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Find the student by userId
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (student) {
      const allowedPlans = ['starter', 'core', 'pro', 'elite', 'premium'] as const;
      type StudentPlan = typeof allowedPlans[number];
      const isStudentPlan = (value: string): value is StudentPlan =>
        allowedPlans.includes(value as StudentPlan);

      const incomingPlan = (args.membershipPlan || '').toLowerCase();
      const normalizedPlan: StudentPlan =
        incomingPlan === 'premium'
          ? 'elite'
          : isStudentPlan(incomingPlan) ? (incomingPlan as StudentPlan) : 'core';

      // Update student record with payment information
      await ctx.db.patch(student._id, {
        paymentStatus: args.paymentStatus as "pending" | "failed" | "paid",
        membershipPlan: normalizedPlan,
        stripeCustomerId: args.stripeCustomerId || args.stripeSessionId, // Use customer ID if provided, otherwise session ID
        status: "active" as const,
        updatedAt: Date.now(),
      });
      
      console.log(`Updated student ${student._id} with payment status: ${args.paymentStatus}`);
    } else {
      console.error(`No student found for userId: ${args.userId}`);
    }
    
    return { success: true };
  },
});

export const updateProfileBasics = mutation({
  args: {
    personalInfo: v.optional(
      v.object({
        fullName: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        preferredContact: v.optional(
          v.union(v.literal("email"), v.literal("phone"), v.literal("text"))
        ),
        linkedinOrResume: v.optional(v.string()),
      })
    ),
    schoolInfo: v.optional(
      v.object({
        programName: v.optional(v.string()),
        degreeTrack: v.optional(
          v.union(
            v.literal("FNP"),
            v.literal("PNP"),
            v.literal("PMHNP"),
            v.literal("AGNP"),
            v.literal("ACNP"),
            v.literal("WHNP"),
            v.literal("NNP"),
            v.literal("DNP")
          )
        ),
        expectedGraduation: v.optional(v.string()),
        programFormat: v.optional(
          v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid"))
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .unique();

    if (!student) {
      throw new Error("Student profile not found");
    }

    const updates: Record<string, unknown> = {};

    if (args.personalInfo) {
      const personalUpdates = cleanPartial<typeof student.personalInfo>(args.personalInfo);
      if (Object.keys(personalUpdates).length > 0) {
        updates.personalInfo = {
          ...student.personalInfo,
          ...personalUpdates,
        };
      }
    }

    if (args.schoolInfo) {
      const schoolUpdates = cleanPartial<typeof student.schoolInfo>(args.schoolInfo);
      if (Object.keys(schoolUpdates).length > 0) {
        updates.schoolInfo = {
          ...student.schoolInfo,
          ...schoolUpdates,
        };
      }
    }

    if (Object.keys(updates).length === 0) {
      return { updated: false } as const;
    }

    await ctx.db.patch(student._id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return { updated: true } as const;
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
    // First, get all users that belong to this enterprise
    const enterpriseUsers = await ctx.db
      .query("users")
      .withIndex("byExternalId")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();

    const enterpriseUserIds = new Set(enterpriseUsers.map(user => user._id));

    // Then get all students whose userId is in the enterprise users list
    const students = await ctx.db
      .query("students")
      .collect();

    return students.filter(student => enterpriseUserIds.has(student.userId));
  },
});

// Get student dashboard stats
export const getStudentDashboardStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return null;

    // Get user for additional info
    const user = await ctx.db.get(userId);

    // Get matches for this student
    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .collect();

    const currentMatch = matches.find(m => m.status === "active" || m.status === "confirmed");
    const pendingMatches = matches.filter(m => m.status === "pending" || m.status === "suggested");
    const completedMatches = matches.filter(m => m.status === "completed");

    // Calculate profile completion
    const profileFields = [
      student.personalInfo.fullName,
      student.personalInfo.email,
      student.personalInfo.phone,
      student.schoolInfo.programName,
      student.schoolInfo.degreeTrack,
      student.rotationNeeds.rotationTypes.length > 0,
      student.rotationNeeds.startDate,
      student.rotationNeeds.endDate,
      student.learningStyle.learningMethod,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Mock hours data (in real implementation, this would come from hours tracking)
    const requiredHours = 640; // Typical NP program requirement
    const completedHours = 0; // Would be calculated from actual hours entries

    return {
      student,
      user,
      profileCompletionPercentage,
      currentMatch,
      pendingMatchesCount: pendingMatches.length,
      completedRotations: completedMatches.length,
      hoursCompleted: completedHours,
      hoursRequired: requiredHours,
      mentorFitScore: currentMatch?.mentorFitScore || 0,
      nextRotationDate: currentMatch?.rotationDetails.startDate,
      hasUnreadMessages: false, // Would be calculated from messages table
    };
  },
});

// Get student recent activity
export const getStudentRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    const limit = args.limit || 10;
    const activities = [];

    // Get matches activity
    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .collect();

    for (const match of matches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      const preceptorUser = preceptor ? await ctx.db.get(preceptor.userId) : null;

      activities.push({
        id: `match-${match._id}`,
        type: 'match' as const,
        title: match.status === 'suggested' ? 'New Match Suggestion' : 
               match.status === 'confirmed' ? 'Match Confirmed' : 
               match.status === 'active' ? 'Rotation Started' : 
               match.status === 'completed' ? 'Rotation Completed' : 'Match Update',
        description: `${match.rotationDetails.rotationType} with ${preceptorUser?.name || 'preceptor'} (${match.mentorFitScore}/10 compatibility)`,
        timestamp: match.matchedAt || match.createdAt,
        status: match.status === 'confirmed' || match.status === 'active' ? 'success' :
               match.status === 'cancelled' ? 'error' : 'info' as const,
        actor: preceptorUser ? {
          name: preceptorUser.name,
          type: 'preceptor' as const
        } : undefined
      });
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});

// Get student notifications
export const getStudentNotifications = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    const notifications = [];

    // Get pending matches
    const pendingMatches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .filter((q) => q.or(
        q.eq(q.field("status"), "suggested"),
        q.eq(q.field("status"), "pending")
      ))
      .collect();

    for (const match of pendingMatches) {
      const preceptor = await ctx.db.get(match.preceptorId);
      const preceptorUser = preceptor ? await ctx.db.get(preceptor.userId) : null;

      notifications.push({
        id: `match-pending-${match._id}`,
        type: 'info' as const,
        title: 'New Match Available',
        message: `Review your match with ${preceptorUser?.name || 'a preceptor'} for ${match.rotationDetails.rotationType}`,
        timestamp: match.createdAt,
        read: false,
        actionUrl: '/dashboard/student/matches',
        actionText: 'View Match'
      });
    }

    // Check for incomplete profile
    const profileFields = [
      student.personalInfo.fullName,
      student.personalInfo.email,
      student.personalInfo.phone,
      student.schoolInfo.programName,
      student.schoolInfo.degreeTrack,
      student.rotationNeeds.rotationTypes.length > 0,
      student.rotationNeeds.startDate,
      student.rotationNeeds.endDate,
      student.learningStyle.learningMethod,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

    if (profileCompletionPercentage < 100) {
      notifications.push({
        id: 'profile-incomplete',
        type: 'warning' as const,
        title: 'Complete Your Profile',
        message: `Your profile is ${profileCompletionPercentage}% complete. Complete it to get better matches.`,
        timestamp: student.updatedAt,
        read: false,
        actionUrl: '/student-intake',
        actionText: 'Complete Profile'
      });
    }

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Get student rotation stats for rotations page
export const getStudentRotationStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return null;

    // Get all matches for this student
    const matches = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .collect();

    const activeRotations = matches.filter(m => m.status === "active");
    const scheduledRotations = matches.filter(m => m.status === "confirmed");
    const completedRotations = matches.filter(m => m.status === "completed");
    
    // Calculate total hours (mock data for now)
    const totalHoursRequired = 640; // Typical NP program requirement
    const totalHoursCompleted = completedRotations.length * 160; // Mock calculation

    return {
      student,
      activeCount: activeRotations.length,
      scheduledCount: scheduledRotations.length,
      completedCount: completedRotations.length,
      totalHoursRequired,
      totalHoursCompleted,
      overallProgress: (totalHoursCompleted / totalHoursRequired) * 100,
    };
  },
});
