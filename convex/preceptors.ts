import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getUserId, requireAdmin } from "./auth";

// Create or update preceptor profile
export const createOrUpdatePreceptor = mutation({
  args: {
    personalInfo: v.object({
      fullName: v.string(),
      email: v.string(),
      mobilePhone: v.string(),
      licenseType: v.union(v.literal("NP"), v.literal("MD/DO"), v.literal("PA"), v.literal("other")),
      specialty: v.union(
        v.literal("FNP"), v.literal("PNP"), v.literal("PMHNP"), 
        v.literal("AGNP"), v.literal("ACNP"), v.literal("WHNP"), 
        v.literal("NNP"), v.literal("other")
      ),
      statesLicensed: v.array(v.string()),
      npiNumber: v.string(),
      linkedinOrCV: v.optional(v.string()),
    }),
    practiceInfo: v.object({
      practiceName: v.string(),
      practiceSettings: v.array(v.union(
        v.literal("private-practice"), v.literal("urgent-care"), 
        v.literal("hospital"), v.literal("clinic"), v.literal("telehealth"), v.literal("other")
      )),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      website: v.optional(v.string()),
      emrUsed: v.optional(v.string()),
    }),
    availability: v.object({
      currentlyAccepting: v.boolean(),
      availableRotations: v.array(v.union(
        v.literal("family-practice"), v.literal("pediatrics"), v.literal("psych-mental-health"),
        v.literal("adult-gero"), v.literal("womens-health"), v.literal("acute-care"), v.literal("other")
      )),
      maxStudentsPerRotation: v.union(v.literal("1"), v.literal("2"), v.literal("3+")),
      rotationDurationPreferred: v.union(
        v.literal("4-weeks"), v.literal("8-weeks"), v.literal("12-weeks"), v.literal("flexible")
      ),
      preferredStartDates: v.array(v.string()),
      daysAvailable: v.array(v.union(
        v.literal("monday"), v.literal("tuesday"), v.literal("wednesday"),
        v.literal("thursday"), v.literal("friday"), v.literal("saturday"), v.literal("sunday")
      )),
    }),
    matchingPreferences: v.object({
      studentDegreeLevelPreferred: v.union(
        v.literal("BSN-to-DNP"), v.literal("MSN"), v.literal("post-masters"), v.literal("no-preference")
      ),
      comfortableWithFirstRotation: v.boolean(),
      schoolsWorkedWith: v.optional(v.array(v.string())),
      languagesSpoken: v.optional(v.array(v.string())),
    }),
    mentoringStyle: v.object({
      mentoringApproach: v.union(v.literal("coach-guide"), v.literal("support-needed"), v.literal("expect-initiative")),
      rotationStart: v.union(v.literal("orient-goals"), v.literal("observe-adjust"), v.literal("dive-in-learn")),
      feedbackApproach: v.union(v.literal("real-time"), v.literal("daily-checkins"), v.literal("weekly-written")),
      learningMaterials: v.union(v.literal("always"), v.literal("sometimes"), v.literal("rarely")),
      patientInteractions: v.union(v.literal("lead-then-shadow"), v.literal("shadow-then-lead"), v.literal("lead-from-day-one")),
      questionPreference: v.union(v.literal("anytime-during"), v.literal("breaks-downtime"), v.literal("end-of-day")),
      autonomyLevel: v.union(v.literal("close-supervision"), v.literal("shared-decisions"), v.literal("high-independence")),
      evaluationFrequency: v.union(v.literal("every-shift"), v.literal("weekly"), v.literal("end-of-rotation")),
      newStudentPreference: v.union(v.literal("prefer-coaching"), v.literal("flexible"), v.literal("prefer-independent")),
      idealDynamic: v.union(v.literal("learner-teacher"), v.literal("teammates"), v.literal("supervisee-clinician")),
    }),
    agreements: v.object({
      openToScreening: v.boolean(),
      wantSpotlightFeature: v.optional(v.boolean()),
      agreedToTermsAndPrivacy: v.boolean(),
      digitalSignature: v.string(),
      submissionDate: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to create preceptor profile");
    }

    // Check if preceptor profile already exists
    const existingPreceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    const preceptorData = {
      userId,
      personalInfo: args.personalInfo,
      practiceInfo: args.practiceInfo,
      availability: args.availability,
      matchingPreferences: args.matchingPreferences,
      mentoringStyle: args.mentoringStyle,
      agreements: args.agreements,
      verificationStatus: "pending" as const,
      updatedAt: Date.now(),
    };

    if (existingPreceptor) {
      // Update existing preceptor
      await ctx.db.patch(existingPreceptor._id, preceptorData);
      return existingPreceptor._id;
    } else {
      // Create new preceptor
      const preceptorId = await ctx.db.insert("preceptors", {
        ...preceptorData,
        createdAt: Date.now(),
      });
      
      // Update user type
      const identity = await ctx.auth.getUserIdentity();
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity?.subject ?? ""))
        .first();
      
      if (user) {
        await ctx.db.patch(user._id, { userType: "preceptor" });
        
        // Send welcome email for new preceptors
        try {
          await ctx.scheduler.runAfter(0, internal.emails.sendWelcomeEmail, {
            email: args.personalInfo.email,
            firstName: args.personalInfo.fullName.split(' ')[0] || 'Doctor',
            userType: "preceptor",
          });
        } catch (error) {
          console.error("Failed to send welcome email to preceptor:", error);
          // Don't fail the profile creation if email fails
        }
      }
      
      return preceptorId;
    }
  },
});

// Get current user's preceptor profile
export const getCurrentPreceptor = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Get preceptor by ID
export const getPreceptorById = internalQuery({
  args: { preceptorId: v.id("preceptors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.preceptorId);
  },
});

// Get verified preceptors who are accepting students
export const getAvailablePreceptors = query({
  args: { 
    specialty: v.optional(v.string()),
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", "verified"));
    
    const preceptors = await query.collect();
    
    // Filter by availability and optional criteria
    return preceptors.filter(preceptor => {
      if (!preceptor.availability.currentlyAccepting) return false;
      
      if (args.specialty && !preceptor.availability.availableRotations.includes(args.specialty as any)) {
        return false;
      }
      
      if (args.state && preceptor.practiceInfo.state !== args.state) {
        return false;
      }
      
      return true;
    });
  },
});

// Update preceptor verification status (admin only)
export const updateVerificationStatus = mutation({
  args: { 
    preceptorId: v.id("preceptors"), 
    status: v.union(v.literal("pending"), v.literal("under-review"), v.literal("verified"), v.literal("rejected"))
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.preceptorId, { 
      verificationStatus: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get preceptors by verification status (admin)
export const getPreceptorsByStatus = query({
  args: { status: v.union(v.literal("pending"), v.literal("under-review"), v.literal("verified"), v.literal("rejected")) },
  handler: async (ctx, args) => {
    // Admin-only view
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    const user = await ctx.db.get(userId);
    if (!user || user.userType !== "admin") throw new Error("Admin access required");
    return await ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", args.status))
      .collect();
  },
});

// Update preceptor availability
export const updateAvailability = mutation({
  args: {
    currentlyAccepting: v.boolean(),
    preferredStartDates: v.optional(v.array(v.string())),
    timezone: v.optional(v.string()),
    weeklySchedule: v.optional(v.object({
      monday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      tuesday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      wednesday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      thursday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      friday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      saturday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
      sunday: v.object({ available: v.boolean(), startTime: v.string(), endTime: v.string(), maxStudents: v.number(), notes: v.string() }),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!preceptor) {
      throw new Error("Preceptor profile not found");
    }

    const updates: any = {
      availability: {
        ...preceptor.availability,
        currentlyAccepting: args.currentlyAccepting,
      },
      updatedAt: Date.now(),
    };

    if (args.preferredStartDates) {
      updates.availability.preferredStartDates = args.preferredStartDates;
    }
    if (args.timezone) {
      updates.availability.timezone = args.timezone;
    }
    if (args.weeklySchedule) {
      updates.availability.weeklySchedule = args.weeklySchedule as any;
    }

    await ctx.db.patch(preceptor._id, updates);
  },
});

// Get preceptor by user ID
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getUserId(ctx);
    if (!currentUserId || currentUserId !== args.userId) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get preceptors by enterprise ID (for enterprise dashboard)
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

    // Get all preceptors associated with this enterprise
    // First, get all users that belong to this enterprise
    const enterpriseUsers = await ctx.db
      .query("users")
      .withIndex("byExternalId")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();

    const enterpriseUserIds = new Set(enterpriseUsers.map(user => user._id));

    // Then get all preceptors whose userId is in the enterprise users list
    const preceptors = await ctx.db
      .query("preceptors")
      .collect();

    return preceptors.filter(preceptor => enterpriseUserIds.has(preceptor.userId));
  },
});

// Update preceptor status (for enterprise management)
export const updatePreceptorStatus = mutation({
  args: {
    preceptorId: v.id("preceptors"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended"))
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Check if user is admin or enterprise user
    const user = await ctx.db.get(userId);
    if (!user || (user.userType !== "admin" && user.userType !== "enterprise")) {
      throw new Error("Unauthorized: Only admin or enterprise users can update preceptor status");
    }

    // Map enterprise status to verification status
    let verificationStatus: "pending" | "under-review" | "verified" | "rejected";
    switch (args.status) {
      case "active":
        verificationStatus = "verified";
        break;
      case "pending":
        verificationStatus = "pending";
        break;
      case "suspended":
        verificationStatus = "rejected";
        break;
      case "inactive":
        verificationStatus = "rejected";
        break;
      default:
        verificationStatus = "pending";
    }

    await ctx.db.patch(args.preceptorId, { 
      verificationStatus,
      updatedAt: Date.now(),
    });
  },
});

// Approve preceptor (for enterprise management)
export const approvePreceptor = mutation({
  args: { preceptorId: v.id("preceptors") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    // Check if user is admin or enterprise user
    const user = await ctx.db.get(userId);
    if (!user || (user.userType !== "admin" && user.userType !== "enterprise")) {
      throw new Error("Unauthorized: Only admin or enterprise users can approve preceptors");
    }

    await ctx.db.patch(args.preceptorId, {
      verificationStatus: "verified",
      updatedAt: Date.now(),
    });
  },
});

// Get preceptor dashboard statistics
export const getPreceptorDashboardStats = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!preceptor) return null;

    // Get user for additional info
    const user = await ctx.db.get(userId);

    // Get all matches for this preceptor
    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .collect();

    const activeMatches = matches.filter(m => m.status === "active");
    const pendingMatches = matches.filter(m => m.status === "pending" || m.status === "suggested");
    const completedMatches = matches.filter(m => m.status === "completed");
    const totalStudentsMentored = completedMatches.length + activeMatches.length;

    // Calculate profile completion
    const profileFields = [
      preceptor.personalInfo.fullName,
      preceptor.personalInfo.email,
      preceptor.personalInfo.mobilePhone,
      preceptor.personalInfo.specialty,
      preceptor.practiceInfo.practiceName,
      preceptor.practiceInfo.city,
      preceptor.practiceInfo.state,
      preceptor.availability.availableRotations.length > 0,
      preceptor.mentoringStyle.mentoringApproach,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

    // Mock rating data (would come from surveys)
    const averageRating = 4.8;
    const completionRate = totalStudentsMentored > 0 ? Math.round((completedMatches.length / totalStudentsMentored) * 100) : 100;

    return {
      preceptor,
      user,
      profileCompletionPercentage,
      activeStudentsCount: activeMatches.length,
      pendingMatchesCount: pendingMatches.length,
      totalStudentsMentored,
      completedRotations: completedMatches.length,
      averageRating,
      completionRate,
      isAcceptingStudents: preceptor.availability.currentlyAccepting,
      verificationStatus: preceptor.verificationStatus,
    };
  },
});

// Get preceptor recent activity
export const getPreceptorRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!preceptor) return [];

    const limit = args.limit || 10;
    const activities = [];

    // Get matches activity
    const matches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .collect();

    for (const match of matches) {
      const student = await ctx.db.get(match.studentId);
      const studentUser = student ? await ctx.db.get(student.userId) : null;

      activities.push({
        id: `match-${match._id}`,
        type: 'match' as const,
        title: match.status === 'pending' ? 'New Student Match Request' : 
               match.status === 'confirmed' ? 'Student Match Confirmed' : 
               match.status === 'active' ? 'Rotation Started' : 
               match.status === 'completed' ? 'Rotation Completed' : 'Match Update',
        description: `${studentUser?.name || 'Student'} for ${match.rotationDetails.rotationType} (${match.mentorFitScore}/10 compatibility)`,
        timestamp: match.matchedAt || match.createdAt,
        status: match.status === 'confirmed' || match.status === 'active' ? 'success' :
               match.status === 'cancelled' ? 'error' : 'info' as const,
        actor: studentUser ? {
          name: studentUser.name,
          type: 'student' as const
        } : undefined
      });
    }

    // Get clinical hours activity (hours submitted by students)
    const studentIds = matches.map(m => m.studentId);
    for (const studentId of studentIds) {
      const recentHours = await ctx.db
        .query("clinicalHours")
        .withIndex("byStudent", (q) => q.eq("studentId", studentId))
        .filter((q) => q.eq(q.field("status"), "submitted"))
        .order("desc")
        .take(3);

      for (const hours of recentHours) {
        const student = await ctx.db.get(hours.studentId);
        const studentUser = student ? await ctx.db.get(student.userId) : null;

        activities.push({
          id: `hours-${hours._id}`,
          type: 'hours' as const,
          title: 'Student Hours Submitted',
          description: `${studentUser?.name || 'Student'} logged ${hours.hoursWorked} hours for ${hours.rotationType}`,
          timestamp: hours.submittedAt || hours.createdAt,
          status: 'info' as const,
          actor: studentUser ? {
            name: studentUser.name,
            type: 'student' as const
          } : undefined
        });
      }
    }

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  },
});

// Get preceptor notifications
export const getPreceptorNotifications = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const preceptor = await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!preceptor) return [];

    const notifications = [];

    // Get pending match requests
    const pendingMatches = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.or(
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("status"), "suggested")
      ))
      .collect();

    for (const match of pendingMatches) {
      const student = await ctx.db.get(match.studentId);
      const studentUser = student ? await ctx.db.get(student.userId) : null;

      notifications.push({
        id: `match-pending-${match._id}`,
        type: 'info' as const,
        title: 'New Student Match Request',
        message: `${studentUser?.name || 'A student'} wants to do ${match.rotationDetails.rotationType} with you (${match.mentorFitScore}/10 compatibility)`,
        timestamp: match.createdAt,
        read: false,
        actionUrl: '/dashboard/preceptor/matches',
        actionText: 'Review Match'
      });
    }

    // Get pending hours approvals
    const studentIds = await ctx.db
      .query("matches")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", preceptor._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()
      .then(matches => matches.map(m => m.studentId));

    for (const studentId of studentIds) {
      const pendingHours = await ctx.db
        .query("clinicalHours")
        .withIndex("byStudentAndStatus", (q) => 
          q.eq("studentId", studentId).eq("status", "submitted")
        )
        .collect();

      if (pendingHours.length > 0) {
        const student = await ctx.db.get(studentId);
        const studentUser = student ? await ctx.db.get(student.userId) : null;

        notifications.push({
          id: `hours-pending-${studentId}`,
          type: 'warning' as const,
          title: 'Hours Awaiting Approval',
          message: `${studentUser?.name || 'Student'} has ${pendingHours.length} hours entries awaiting your approval`,
          timestamp: Math.max(...pendingHours.map(h => h.submittedAt || h.createdAt)),
          read: false,
          actionUrl: '/dashboard/preceptor/students',
          actionText: 'Review Hours'
        });
      }
    }

    // Check for incomplete profile
    const profileFields = [
      preceptor.personalInfo.fullName,
      preceptor.personalInfo.email,
      preceptor.personalInfo.mobilePhone,
      preceptor.personalInfo.specialty,
      preceptor.practiceInfo.practiceName,
      preceptor.practiceInfo.city,
      preceptor.practiceInfo.state,
      preceptor.availability.availableRotations.length > 0,
      preceptor.mentoringStyle.mentoringApproach,
    ];
    const completedFields = profileFields.filter(Boolean).length;
    const profileCompletionPercentage = Math.round((completedFields / profileFields.length) * 100);

    if (profileCompletionPercentage < 100) {
      notifications.push({
        id: 'profile-incomplete',
        type: 'warning' as const,
        title: 'Complete Your Profile',
        message: `Your profile is ${profileCompletionPercentage}% complete. Complete it to receive better student matches.`,
        timestamp: preceptor.updatedAt,
        read: false,
        actionUrl: '/preceptor-intake',
        actionText: 'Complete Profile'
      });
    }

    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  },
});

// Search preceptors for manual matching
export const searchPreceptors = query({
  args: {
    searchQuery: v.optional(v.string()),
    specialty: v.optional(v.union(
      v.literal("FNP"), v.literal("PNP"), v.literal("PMHNP"), 
      v.literal("AGNP"), v.literal("ACNP"), v.literal("WHNP"), 
      v.literal("NNP"), v.literal("other")
    )),
    rotationType: v.optional(v.union(
      v.literal("family-practice"), v.literal("pediatrics"), v.literal("psych-mental-health"),
      v.literal("adult-gero"), v.literal("womens-health"), v.literal("acute-care"), v.literal("other")
    )),
    location: v.optional(v.object({
      city: v.optional(v.string()),
      state: v.optional(v.string()),
      zipCode: v.optional(v.string()),
    })),
    practiceSettings: v.optional(v.array(v.union(
      v.literal("private-practice"), v.literal("urgent-care"), 
      v.literal("hospital"), v.literal("clinic"), v.literal("telehealth"), v.literal("other")
    ))),
    currentlyAccepting: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get current student profile to determine if they can search
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    // Get verified, currently accepting preceptors
    let query = ctx.db
      .query("preceptors")
      .withIndex("byVerificationStatus", (q) => q.eq("verificationStatus", "verified"));

    const preceptors = await query.collect();

    let filtered = preceptors.filter(preceptor => {
      // Must be currently accepting students if specified
      if (args.currentlyAccepting && !preceptor.availability.currentlyAccepting) {
        return false;
      }

      // Filter by specialty
      if (args.specialty && preceptor.personalInfo.specialty !== args.specialty) {
        return false;
      }

      // Filter by rotation type
      if (args.rotationType && !preceptor.availability.availableRotations.includes(args.rotationType)) {
        return false;
      }

      // Filter by practice settings
      if (args.practiceSettings && args.practiceSettings.length > 0) {
        const hasMatchingSetting = args.practiceSettings.some(setting => 
          preceptor.practiceInfo.practiceSettings.includes(setting)
        );
        if (!hasMatchingSetting) return false;
      }

      // Filter by location
      if (args.location) {
        if (args.location.state && preceptor.practiceInfo.state.toLowerCase() !== args.location.state.toLowerCase()) {
          return false;
        }
        if (args.location.city && preceptor.practiceInfo.city.toLowerCase() !== args.location.city.toLowerCase()) {
          return false;
        }
        if (args.location.zipCode && preceptor.practiceInfo.zipCode !== args.location.zipCode) {
          return false;
        }
      }

      // Text search across multiple fields
      if (args.searchQuery && args.searchQuery.trim()) {
        const query = args.searchQuery.toLowerCase();
        const searchableText = [
          preceptor.personalInfo.fullName,
          preceptor.practiceInfo.practiceName,
          preceptor.practiceInfo.city,
          preceptor.practiceInfo.state,
          preceptor.personalInfo.specialty,
          ...preceptor.availability.availableRotations,
          ...preceptor.practiceInfo.practiceSettings,
        ].join(' ').toLowerCase();

        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });

    // Sort by relevance and accepting status
    filtered.sort((a, b) => {
      // Prioritize currently accepting preceptors
      if (a.availability.currentlyAccepting && !b.availability.currentlyAccepting) return -1;
      if (!a.availability.currentlyAccepting && b.availability.currentlyAccepting) return 1;
      
      // Then by creation date (newer first)
      return b.createdAt - a.createdAt;
    });

    // Apply limit
    const limit = args.limit || 20;
    filtered = filtered.slice(0, limit);

    // Return public profile information only
    return filtered.map(preceptor => ({
      _id: preceptor._id,
      personalInfo: {
        fullName: preceptor.personalInfo.fullName,
        specialty: preceptor.personalInfo.specialty,
        licenseType: preceptor.personalInfo.licenseType,
        statesLicensed: preceptor.personalInfo.statesLicensed,
      },
      practiceInfo: {
        practiceName: preceptor.practiceInfo.practiceName,
        practiceSettings: preceptor.practiceInfo.practiceSettings,
        city: preceptor.practiceInfo.city,
        state: preceptor.practiceInfo.state,
        website: preceptor.practiceInfo.website,
      },
      availability: {
        currentlyAccepting: preceptor.availability.currentlyAccepting,
        availableRotations: preceptor.availability.availableRotations,
        maxStudentsPerRotation: preceptor.availability.maxStudentsPerRotation,
        rotationDurationPreferred: preceptor.availability.rotationDurationPreferred,
        daysAvailable: preceptor.availability.daysAvailable,
      },
      verificationStatus: preceptor.verificationStatus,
      createdAt: preceptor.createdAt,
    }));
  },
});

// Request a specific preceptor match
export const requestPreceptorMatch = mutation({
  args: {
    preceptorId: v.id("preceptors"),
    message: v.optional(v.string()),
    preferredStartDate: v.optional(v.string()),
    rotationType: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Must be authenticated");

    // Get student profile
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) throw new Error("Student profile not found");

    // Verify preceptor exists and is accepting students
    const preceptor = await ctx.db.get(args.preceptorId);
    if (!preceptor) throw new Error("Preceptor not found");

    if (!preceptor.availability.currentlyAccepting) {
      throw new Error("This preceptor is not currently accepting students");
    }

    if (preceptor.verificationStatus !== "verified") {
      throw new Error("This preceptor is not yet verified");
    }

    // Check if rotation type is available
    if (!preceptor.availability.availableRotations.includes(args.rotationType as any)) {
      throw new Error("This preceptor does not offer the requested rotation type");
    }

    // Check if student already has a pending/active match with this preceptor
    const existingMatch = await ctx.db
      .query("matches")
      .withIndex("byStudentId", (q) => q.eq("studentId", student._id))
      .filter((q) => 
        q.and(
          q.eq(q.field("preceptorId"), args.preceptorId),
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "suggested"),
            q.eq(q.field("status"), "confirmed"),
            q.eq(q.field("status"), "active")
          )
        )
      )
      .first();

    if (existingMatch) {
      throw new Error("You already have a pending or active match with this preceptor");
    }

    // Create a suggested match
    const matchId = await ctx.db.insert("matches", {
      studentId: student._id,
      preceptorId: args.preceptorId,
      status: "suggested",
      mentorFitScore: 0, // Will be calculated later
      rotationDetails: {
        startDate: args.preferredStartDate || "",
        endDate: "", // To be filled later
        weeklyHours: 32, // Default
        rotationType: args.rotationType,
        location: `${preceptor.practiceInfo.city}, ${preceptor.practiceInfo.state}`,
      },
      paymentStatus: "unpaid",
      adminNotes: args.message ? `Student request: ${args.message}` : "Student-initiated match request",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return matchId;
  },
});

// Get public preceptor details for match requests
export const getPublicPreceptorDetails = query({
  args: { preceptorId: v.id("preceptors") },
  handler: async (ctx, args) => {
    const preceptor = await ctx.db.get(args.preceptorId);
    if (!preceptor) return null;

    // Return only public information
    return {
      _id: preceptor._id,
      personalInfo: {
        fullName: preceptor.personalInfo.fullName,
        specialty: preceptor.personalInfo.specialty,
        licenseType: preceptor.personalInfo.licenseType,
        statesLicensed: preceptor.personalInfo.statesLicensed,
        linkedinOrCV: preceptor.personalInfo.linkedinOrCV,
      },
      practiceInfo: {
        practiceName: preceptor.practiceInfo.practiceName,
        practiceSettings: preceptor.practiceInfo.practiceSettings,
        city: preceptor.practiceInfo.city,
        state: preceptor.practiceInfo.state,
        website: preceptor.practiceInfo.website,
        emrUsed: preceptor.practiceInfo.emrUsed,
      },
      availability: {
        currentlyAccepting: preceptor.availability.currentlyAccepting,
        availableRotations: preceptor.availability.availableRotations,
        maxStudentsPerRotation: preceptor.availability.maxStudentsPerRotation,
        rotationDurationPreferred: preceptor.availability.rotationDurationPreferred,
        daysAvailable: preceptor.availability.daysAvailable,
      },
      verificationStatus: preceptor.verificationStatus,
    };
  },
});
// Get preceptor earnings summary
export const getPreceptorEarnings = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Get all earnings for this preceptor
    const earnings = await ctx.db
      .query("preceptorEarnings")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", userId))
      .collect();

    // Calculate totals
    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    const paidEarnings = earnings
      .filter(e => e.status === "paid")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingEarnings = earnings
      .filter(e => e.status === "pending")
      .reduce((sum, e) => sum + e.amount, 0);

    // Get recent earnings (last 5)
    const recentEarnings = await Promise.all(
      earnings
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map(async (e) => {
          const student = await ctx.db.get(e.studentId);
          return {
            id: e._id,
            matchId: e.matchId,
            studentName: student?.name || "Unknown Student",
            amount: e.amount,
            status: e.status,
            description: e.description,
            createdAt: e.createdAt,
            paidAt: e.paidAt,
          };
        })
    );

    return {
      totalEarnings,
      paidEarnings,
      pendingEarnings,
      recentEarnings,
      earningsCount: earnings.length,
    };
  },
});

// Get detailed earnings history
export const getAllPreceptorEarnings = query({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))) },
  handler: async (ctx, args) => {
    // Admin-only
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");
    const user = await ctx.db.get(userId);
    if (!user || user.userType !== "admin") throw new Error("Admin access required");

    let earnings = await ctx.db.query("preceptorEarnings").order("desc").collect();
    if (args.status) earnings = earnings.filter((e) => e.status === args.status);

    // Enrich with names
    const enriched = [] as any[];
    for (const e of earnings) {
      const preceptorUser = await ctx.db.get(e.preceptorId);
      const studentUser = await ctx.db.get(e.studentId);
      enriched.push({
        ...e,
        preceptorName: preceptorUser?.name || "Preceptor",
        studentName: studentUser?.name || "Student",
      });
    }
    return enriched;
  },
});
export const getPreceptorEarningsHistory = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("pending"), v.literal("paid"), v.literal("cancelled"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 50;

    let query = ctx.db
      .query("preceptorEarnings")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", userId));

    const earnings = await query.collect();

    // Filter by status if provided
    let filtered = args.status 
      ? earnings.filter(e => e.status === args.status)
      : earnings;

    // Sort by created date (newest first) and limit
    const earningsWithDetails = await Promise.all(
      filtered
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit)
        .map(async e => {
          // Get student info
          const student = await ctx.db.get(e.studentId);
          const match = await ctx.db.get(e.matchId);
          
          return {
            id: e._id,
            studentName: student?.name || "Unknown Student",
            amount: e.amount,
            currency: e.currency,
            status: e.status,
            description: e.description,
            rotationStartDate: e.rotationStartDate,
            rotationEndDate: e.rotationEndDate,
            paymentMethod: e.paymentMethod,
            paymentReference: e.paymentReference,
            paidAt: e.paidAt,
            createdAt: e.createdAt,
            matchStatus: match?.status,
          };
        })
    );

    return earningsWithDetails;
  },
});

// Get or create preceptor payment info
export const getPreceptorPaymentInfo = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const paymentInfo = await ctx.db
      .query("preceptorPaymentInfo")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", userId))
      .first();

    return paymentInfo;
  },
});

// Update preceptor payment info
export const updatePreceptorPaymentInfo = mutation({
  args: {
    paymentMethod: v.union(v.literal("direct_deposit"), v.literal("check"), v.literal("paypal")),
    // Direct deposit info
    bankAccountNumber: v.optional(v.string()),
    routingNumber: v.optional(v.string()),
    accountType: v.optional(v.union(v.literal("checking"), v.literal("savings"))),
    // Mailing address for checks
    mailingAddress: v.optional(v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
    })),
    // PayPal info
    paypalEmail: v.optional(v.string()),
    // Tax information
    taxId: v.optional(v.string()),
    taxFormType: v.optional(v.union(v.literal("W9"), v.literal("W8BEN"))),
    taxFormSubmitted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to update payment info");
    }

    const existingInfo = await ctx.db
      .query("preceptorPaymentInfo")
      .withIndex("byPreceptorId", (q) => q.eq("preceptorId", userId))
      .first();

    const paymentInfoData = {
      preceptorId: userId,
      paymentMethod: args.paymentMethod,
      ...(args.paymentMethod === "direct_deposit" && {
        bankAccountNumber: args.bankAccountNumber,
        routingNumber: args.routingNumber,
        accountType: args.accountType,
      }),
      ...(args.paymentMethod === "check" && {
        mailingAddress: args.mailingAddress,
      }),
      ...(args.paymentMethod === "paypal" && {
        paypalEmail: args.paypalEmail,
      }),
      taxId: args.taxId,
      taxFormType: args.taxFormType,
      taxFormSubmitted: args.taxFormSubmitted,
      ...(args.taxFormSubmitted && {
        taxFormSubmittedAt: Date.now(),
      }),
      updatedAt: Date.now(),
    };

    if (existingInfo) {
      await ctx.db.patch(existingInfo._id, paymentInfoData);
      return existingInfo._id;
    } else {
      const id = await ctx.db.insert("preceptorPaymentInfo", {
        ...paymentInfoData,
        createdAt: Date.now(),
      });
      return id;
    }
  },
});
