import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

// Get all enterprises (admin only)
export const getAllEnterprises = query({
  args: {
    type: v.optional(v.union(v.literal("school"), v.literal("clinic"), v.literal("health-system"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended"))),
    limit: v.optional(v.number()),
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

    let query = ctx.db.query("enterprises");

    if (args.type) {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.limit) {
      query = query.take(args.limit);
    } else {
      query = query.take(50);
    }

    return await query.collect();
  },
});

// Get enterprise by ID
export const getEnterpriseById = query({
  args: { enterpriseId: v.id("enterprises") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Check if user has access to this enterprise
    if (user.userType === "admin" || 
        enterprise.adminUsers.includes(user._id) ||
        user.enterpriseId === args.enterpriseId) {
      return enterprise;
    }

    throw new Error("Access denied");
  },
});

// Get enterprise by user ID
export const getEnterpriseByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.enterpriseId) return null;

    return await ctx.db.get(user.enterpriseId);
  },
});

// Get enterprise by user ID (alias for dashboard)
export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db.get(args.userId);
    if (!user || !user.enterpriseId) return null;

    return await ctx.db.get(user.enterpriseId);
  },
});

// Create new enterprise
export const createEnterprise = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("school"), v.literal("clinic"), v.literal("health-system")),
    organizationInfo: v.object({
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      phone: v.string(),
      website: v.optional(v.string()),
      ein: v.optional(v.string()),
      accreditation: v.optional(v.string()),
    }),
    billingInfo: v.optional(v.object({
      billingEmail: v.string(),
      subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"), v.literal("enterprise"))),
      monthlyStudentLimit: v.optional(v.number()),
      annualContract: v.optional(v.boolean()),
    })),
    agreements: v.object({
      signedBy: v.string(),
      agreementVersion: v.string(),
      customTerms: v.optional(v.string()),
    }),
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

    const enterpriseId = await ctx.db.insert("enterprises", {
      name: args.name,
      type: args.type,
      organizationInfo: args.organizationInfo,
      adminUsers: [user._id],
      billingInfo: args.billingInfo,
      preferences: {
        autoApproveStudents: false,
        requireBackgroundChecks: true,
        preferredNotificationMethod: "email",
      },
      agreements: {
        ...args.agreements,
        signedAt: Date.now(),
      },
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return enterpriseId;
  },
});

// Update enterprise
export const updateEnterprise = mutation({
  args: {
    enterpriseId: v.id("enterprises"),
    updates: v.object({
      name: v.optional(v.string()),
      organizationInfo: v.optional(v.object({
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        ein: v.optional(v.string()),
        accreditation: v.optional(v.string()),
      })),
      billingInfo: v.optional(v.object({
        billingEmail: v.optional(v.string()),
        subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"), v.literal("enterprise"))),
        monthlyStudentLimit: v.optional(v.number()),
        annualContract: v.optional(v.boolean()),
      })),
      preferences: v.optional(v.object({
        autoApproveStudents: v.optional(v.boolean()),
        requireBackgroundChecks: v.optional(v.boolean()),
        customRequirements: v.optional(v.array(v.string())),
        preferredNotificationMethod: v.optional(v.union(v.literal("email"), v.literal("dashboard"), v.literal("both"))),
      })),
      status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended"))),
    }),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Check permissions
    if (user.userType !== "admin" && !enterprise.adminUsers.includes(user._id)) {
      throw new Error("Access denied");
    }

    // Merge updates with existing data
    const updatedData: any = { updatedAt: Date.now() };
    
    if (args.updates.name) updatedData.name = args.updates.name;
    if (args.updates.status) updatedData.status = args.updates.status;
    
    if (args.updates.organizationInfo) {
      updatedData.organizationInfo = {
        ...enterprise.organizationInfo,
        ...args.updates.organizationInfo,
      };
    }
    
    if (args.updates.billingInfo) {
      updatedData.billingInfo = {
        ...enterprise.billingInfo,
        ...args.updates.billingInfo,
      };
    }
    
    if (args.updates.preferences) {
      updatedData.preferences = {
        ...enterprise.preferences,
        ...args.updates.preferences,
      };
    }

    await ctx.db.patch(args.enterpriseId, updatedData);
    return args.enterpriseId;
  },
});

// Add admin user to enterprise
export const addAdminUser = mutation({
  args: {
    enterpriseId: v.id("enterprises"),
    userId: v.id("users"),
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

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("Target user not found");

    // Add user to enterprise admin list
    if (!enterprise.adminUsers.includes(args.userId)) {
      await ctx.db.patch(args.enterpriseId, {
        adminUsers: [...enterprise.adminUsers, args.userId],
        updatedAt: Date.now(),
      });

      // Update user's enterprise association
      await ctx.db.patch(args.userId, {
        userType: "enterprise",
        enterpriseId: args.enterpriseId,
      });
    }

    return args.enterpriseId;
  },
});

// Get enterprise students
export const getEnterpriseStudents = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Check permissions
    if (user.userType !== "admin" && 
        !enterprise.adminUsers.includes(user._id) &&
        user.enterpriseId !== args.enterpriseId) {
      throw new Error("Access denied");
    }

    // Get students associated with this enterprise
    let query = ctx.db.query("students");
    if (args.limit) {
      query = query.take(args.limit);
    }

    const allStudents = await query.collect();
    
    // Filter students that belong to this enterprise
    const enterpriseStudents = allStudents.filter(student => 
      enterprise.students?.includes(student._id)
    );

    return enterpriseStudents;
  },
});

// Get enterprise preceptors
export const getEnterprisePreceptors = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Check permissions
    if (user.userType !== "admin" && 
        !enterprise.adminUsers.includes(user._id) &&
        user.enterpriseId !== args.enterpriseId) {
      throw new Error("Access denied");
    }

    // Get preceptors associated with this enterprise
    let query = ctx.db.query("preceptors");
    if (args.limit) {
      query = query.take(args.limit);
    }

    const allPreceptors = await query.collect();
    
    // Filter preceptors that belong to this enterprise
    const enterprisePreceptors = allPreceptors.filter(preceptor => 
      enterprise.preceptors?.includes(preceptor._id)
    );

    return enterprisePreceptors;
  },
});

// Get enterprise analytics
export const getEnterpriseAnalytics = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser) throw new Error("User not found");

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Check permissions
    if (currentUser.userType !== "admin" && 
        !enterprise.adminUsers.includes(currentUser._id) &&
        currentUser.enterpriseId !== args.enterpriseId) {
      throw new Error("Access denied");
    }

    // Get all users associated with this enterprise
    const enterpriseUsers = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("enterpriseId"), args.enterpriseId))
      .collect();

    const studentUsers = enterpriseUsers.filter(u => u.userType === "student");
    const preceptorUsers = enterpriseUsers.filter(u => u.userType === "preceptor");

    // Get student profiles
    const studentProfiles = await Promise.all(
      studentUsers.map(async (user) => {
        const profile = await ctx.db
          .query("students")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .first();
        return profile ? { ...profile, name: user.name } : null;
      })
    ).then(profiles => profiles.filter(Boolean));

    // Get preceptor profiles  
    const preceptorProfiles = await Promise.all(
      preceptorUsers.map(async (user) => {
        const profile = await ctx.db
          .query("preceptors")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .first();
        return profile ? { ...profile, name: user.name } : null;
      })
    ).then(profiles => profiles.filter(Boolean));

    // Get matches for enterprise students
    const allMatches = await ctx.db.query("matches").collect();
    const enterpriseMatches = allMatches.filter(match => 
      studentProfiles.some(student => student._id === match.studentId)
    );

    // Calculate match statistics
    const activeMatches = enterpriseMatches.filter(m => m.status === "active").length;
    const completedMatches = enterpriseMatches.filter(m => m.status === "completed").length;
    const upcomingMatches = enterpriseMatches.filter(m => m.status === "confirmed").length;

    // Get upcoming rotations with names
    const upcomingRotations = await Promise.all(
      enterpriseMatches
        .filter(m => m.status === "confirmed" || m.status === "active")
        .slice(0, 10)
        .map(async (match) => {
          const student = studentProfiles.find(s => s._id === match.studentId);
          const preceptor = preceptorProfiles.find(p => p._id === match.preceptorId) ||
            await ctx.db.get(match.preceptorId);
          const preceptorUser = preceptor ? await ctx.db.get(preceptor.userId) : null;

          return {
            _id: match._id,
            studentName: student?.name || "Unknown",
            preceptorName: preceptorUser?.name || "Unknown",
            rotationType: match.rotationDetails.rotationType,
            startDate: match.rotationDetails.startDate,
            weeklyHours: match.rotationDetails.weeklyHours,
          };
        })
    );

    // Calculate averages
    const avgMatchScore = enterpriseMatches.length > 0 
      ? enterpriseMatches.reduce((sum, m) => sum + m.mentorFitScore, 0) / enterpriseMatches.length
      : 0;

    const avgRotationHours = enterpriseMatches.length > 0
      ? Math.round(enterpriseMatches.reduce((sum, m) => sum + m.rotationDetails.weeklyHours, 0) / enterpriseMatches.length)
      : 0;

    return {
      totalStudents: studentProfiles.length,
      activeStudents: studentProfiles.filter(s => s.status === "submitted").length,
      totalPreceptors: preceptorProfiles.length,
      verifiedPreceptors: preceptorProfiles.filter(p => p.verificationStatus === "verified").length,
      totalMatches: enterpriseMatches.length,
      activeMatches,
      completedMatches,
      upcomingMatches,
      avgMatchScore,
      avgRotationHours,
      onTimeCompletion: completedMatches > 0 ? completedMatches / (completedMatches + enterpriseMatches.filter(m => m.status === "cancelled").length) : 0,
      recentStudents: studentProfiles
        .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt))
        .slice(0, 10),
      upcomingRotations,
    };
  },
});

// Delete enterprise (admin only)
export const deleteEnterprise = mutation({
  args: { enterpriseId: v.id("enterprises") },
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

    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) throw new Error("Enterprise not found");

    // Remove enterprise association from admin users
    for (const adminUserId of enterprise.adminUsers) {
      await ctx.db.patch(adminUserId, {
        userType: "admin", // or determine appropriate fallback type
        enterpriseId: undefined,
      });
    }

    await ctx.db.delete(args.enterpriseId);
    return { success: true };
  },
});