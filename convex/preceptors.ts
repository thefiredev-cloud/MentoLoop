import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

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
      const user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", ctx.auth.getUserIdentity()?.subject ?? ""))
        .first();
      
      if (user) {
        await ctx.db.patch(user._id, { userType: "preceptor" });
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
export const getPreceptorById = query({
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
    // TODO: Add admin authorization check
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

    await ctx.db.patch(preceptor._id, updates);
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
    // This would typically be through enterprise partnerships or network affiliations
    return await ctx.db
      .query("preceptors")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();
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

    await ctx.db.patch(args.preceptorId, { 
      status: args.status,
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

    await ctx.db.patch(args.preceptorId, {
      verificationStatus: "verified",
      status: "active",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});