import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
// Read audit logs for a specific entity (admin only)
export const getAuditLogsForEntity = query({
  args: {
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("byEntity", (q) => q.eq("entityType", args.entityType).eq("entityId", args.entityId))
      .order("desc")
      .take(args.limit || 10);

    return logs;
  },
});

// Aggregated payment observability for admin dashboards
export const getRecentPaymentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const limit = Math.max(1, Math.min(args.limit ?? 100, 200));

    const webhookEventsDocs = await ctx.db
      .query("webhookEvents")
      .order("desc")
      .take(limit);

    const paymentsAuditDocs = await ctx.db
      .query("paymentsAudit")
      .order("desc")
      .take(limit);

    const paymentAttemptsDocs = await ctx.db
      .query("paymentAttempts")
      .order("desc")
      .take(limit);

    const intakePaymentDocs = await ctx.db
      .query("intakePaymentAttempts")
      .order("desc")
      .take(limit);

    return {
      webhookEvents: webhookEventsDocs.map((event) => ({
        id: event._id,
        provider: event.provider,
        eventId: event.eventId,
        processedAt: event.processedAt,
        createdAt: event._creationTime,
      })),
      paymentsAudit: paymentsAuditDocs.map((audit) => ({
        id: audit._id,
        action: audit.action,
        stripeObject: audit.stripeObject,
        stripeId: audit.stripeId,
        details: audit.details ?? {},
        createdAt: audit.createdAt ?? audit._creationTime,
      })),
      paymentAttempts: paymentAttemptsDocs.map((attempt) => ({
        id: attempt._id,
        stripeSessionId: attempt.stripeSessionId,
        amount: attempt.amount,
        currency: attempt.currency ?? "usd",
        status: attempt.status,
        failureReason: attempt.failureReason,
        paidAt: attempt.paidAt,
        createdAt: attempt.createdAt ?? attempt._creationTime,
      })),
      intakePaymentAttempts: intakePaymentDocs.map((attempt) => ({
        id: attempt._id,
        customerEmail: attempt.customerEmail,
        membershipPlan: attempt.membershipPlan,
        stripeSessionId: attempt.stripeSessionId,
        amount: attempt.amount,
        currency: attempt.currency ?? "usd",
        status: attempt.status,
        discountCode: attempt.discountCode,
        receiptUrl: attempt.receiptUrl,
        paidAt: attempt.paidAt,
        createdAt: attempt.createdAt ?? attempt._creationTime,
      })),
    };
  },
});

// Search and filter users (admin only)
export const searchUsers = query({
  args: {
    searchTerm: v.optional(v.string()),
    userType: v.optional(v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin"), v.literal("enterprise"))),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
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

    let query = ctx.db.query("users");

    // Apply filters
    if (args.userType) {
      query = query.filter((q) => q.eq(q.field("userType"), args.userType));
    }

    const allUsers = await query.collect();

    // Filter by search term if provided
    let filteredUsers = allUsers;
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // Enrich with profile data
    const enrichedUsers = await Promise.all(paginatedUsers.map(async (user) => {
      let profileData = null;
      
      if (user.userType === "student") {
        profileData = await ctx.db
          .query("students")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .first();
      } else if (user.userType === "preceptor") {
        profileData = await ctx.db
          .query("preceptors")
          .withIndex("byUserId", (q) => q.eq("userId", user._id))
          .first();
      }

      return {
        ...user,
        profileData,
        hasProfile: !!profileData,
        profileStatus: (profileData as any)?.status || (profileData as any)?.verificationStatus || "unknown",
      };
    }));

    return {
      users: enrichedUsers,
      totalCount: filteredUsers.length,
      hasMore: offset + limit < filteredUsers.length,
    };
  },
});

// Get detailed user information (admin only)
export const getUserDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<any> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // Get profile data based on user type
    let profileData: any = null;
    let matches: any = [];

    if (user.userType === "student") {
      profileData = await ctx.db
        .query("students")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .first();
      
      if (profileData) {
        matches = await ctx.db
          .query("matches")
          .withIndex("byStudentId", (q) => q.eq("studentId", profileData._id))
          .collect();
      }
    } else if (user.userType === "preceptor") {
      profileData = await ctx.db
        .query("preceptors")
        .withIndex("byUserId", (q) => q.eq("userId", user._id))
        .first();
      
      if (profileData) {
        matches = await ctx.db
          .query("matches")
          .withIndex("byPreceptorId", (q) => q.eq("preceptorId", profileData._id))
          .collect();
      }
    }

    // Get enterprise data if applicable
    let enterpriseData = null;
    if (user.enterpriseId) {
      enterpriseData = await ctx.db.get(user.enterpriseId);
    }

    // Audit logs removed - functionality deprecated
    const auditLogs: any[] = [];

    return {
      user,
      profileData,
      enterpriseData,
      matches: matches.length,
      recentMatches: matches.slice(0, 5),
      auditLogs: auditLogs.slice(0, 10),
    };
  },
});

// Update user information (admin only)
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      userType: v.optional(v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin"), v.literal("enterprise"))),
      enterpriseId: v.optional(v.id("enterprises")),
      permissions: v.optional(v.array(v.string())),
    }),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    // Store previous values for audit log
    const previousValue = {
      name: targetUser.name,
      email: targetUser.email,
      userType: targetUser.userType,
      enterpriseId: targetUser.enterpriseId,
      permissions: targetUser.permissions,
    };

    // Apply updates
    const updatedFields: any = {};
    if (args.updates.name !== undefined) updatedFields.name = args.updates.name;
    if (args.updates.email !== undefined) updatedFields.email = args.updates.email;
    if (args.updates.userType !== undefined) updatedFields.userType = args.updates.userType;
    if (args.updates.enterpriseId !== undefined) updatedFields.enterpriseId = args.updates.enterpriseId;
    if (args.updates.permissions !== undefined) updatedFields.permissions = args.updates.permissions;

    await ctx.db.patch(args.userId, updatedFields);

    // Audit logging removed - functionality deprecated

    return args.userId;
  },
});

// Approve preceptor verification (admin only)
export const approvePreceptor = mutation({
  args: {
    preceptorId: v.id("preceptors"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const preceptor = await ctx.db.get(args.preceptorId);
    if (!preceptor) throw new Error("Preceptor not found");

    const previousStatus = preceptor.verificationStatus;

    await ctx.db.patch(args.preceptorId, {
      verificationStatus: "verified",
      updatedAt: Date.now(),
    });

    // Audit logging removed - functionality deprecated

    return args.preceptorId;
  },
});

// Reject preceptor verification (admin only)
export const rejectPreceptor = mutation({
  args: {
    preceptorId: v.id("preceptors"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const preceptor = await ctx.db.get(args.preceptorId);
    if (!preceptor) throw new Error("Preceptor not found");

    const previousStatus = preceptor.verificationStatus;

    await ctx.db.patch(args.preceptorId, {
      verificationStatus: "rejected",
      updatedAt: Date.now(),
    });

    // Audit logging removed - functionality deprecated

    return args.preceptorId;
  },
});

// Override match score (admin only)
export const overrideMatchScore = mutation({
  args: {
    matchId: v.id("matches"),
    newScore: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const match = await ctx.db.get(args.matchId);
    if (!match) throw new Error("Match not found");

    const previousScore = match.mentorFitScore;

    await ctx.db.patch(args.matchId, {
      mentorFitScore: args.newScore,
      adminNotes: `Score manually overridden by admin: ${args.reason}`,
      updatedAt: Date.now(),
    });

    // Write audit log
    await ctx.db.insert("auditLogs", {
      action: "override_score",
      entityType: "match",
      entityId: args.matchId as unknown as string,
      performedBy: currentUser._id,
      details: {
        previousValue: { mentorFitScore: previousScore },
        newValue: { mentorFitScore: args.newScore },
        reason: args.reason,
      },
      timestamp: Date.now(),
    });

    return args.matchId;
  },
});

// Force create a match (admin only)
export const forceCreateMatch = mutation({
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
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const student = await ctx.db.get(args.studentId);
    const preceptor = await ctx.db.get(args.preceptorId);

    if (!student || !preceptor) {
      throw new Error("Student or preceptor not found");
    }

    // Create the match
    const matchId = await ctx.db.insert("matches", {
      studentId: args.studentId,
      preceptorId: args.preceptorId,
      status: "confirmed",
      mentorFitScore: 5.0, // Default score for force-created matches
      rotationDetails: args.rotationDetails,
      paymentStatus: "unpaid",
      adminNotes: `Force-created by admin: ${args.reason}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Audit logging removed - functionality deprecated

    return matchId;
  },
});

// Get platform statistics (admin only)
export const getPlatformStats = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
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

    // Get all counts
    const allUsers = await ctx.db.query("users").collect();
    const allStudents = await ctx.db.query("students").collect();
    const allPreceptors = await ctx.db.query("preceptors").collect();
    const allMatches = await ctx.db.query("matches").collect();
    const allPayments = await ctx.db.query("paymentAttempts").collect();
    const allEnterprises = await ctx.db.query("enterprises").collect();

    // Calculate stats
    const stats = {
      users: {
        total: allUsers.length,
        students: allUsers.filter(u => u.userType === "student").length,
        preceptors: allUsers.filter(u => u.userType === "preceptor").length,
        enterprises: allUsers.filter(u => u.userType === "enterprise").length,
        admins: allUsers.filter(u => u.userType === "admin").length,
      },
      profiles: {
        totalStudents: allStudents.length,
        studentsComplete: allStudents.filter(s => s.status === "submitted").length,
        totalPreceptors: allPreceptors.length,
        preceptorsVerified: allPreceptors.filter(p => p.verificationStatus === "verified").length,
        preceptorsPending: allPreceptors.filter(p => p.verificationStatus === "pending").length,
      },
      matches: {
        total: allMatches.length,
        suggested: allMatches.filter(m => m.status === "suggested").length,
        pending: allMatches.filter(m => m.status === "pending").length,
        confirmed: allMatches.filter(m => m.status === "confirmed").length,
        active: allMatches.filter(m => m.status === "active").length,
        completed: allMatches.filter(m => m.status === "completed").length,
        cancelled: allMatches.filter(m => m.status === "cancelled").length,
        avgScore: allMatches.length > 0 
          ? allMatches.reduce((sum, m) => sum + m.mentorFitScore, 0) / allMatches.length 
          : 0,
      },
      payments: {
        total: allPayments.length,
        succeeded: allPayments.filter(p => p.status === "succeeded").length,
        pending: allPayments.filter(p => p.status === "pending").length,
        failed: allPayments.filter(p => p.status === "failed").length,
        totalRevenue: allPayments
          .filter(p => p.status === "succeeded")
          .reduce((sum, p) => sum + p.amount, 0),
      },
      enterprises: {
        total: allEnterprises.length,
        active: allEnterprises.filter(e => e.status === "active").length,
        schools: allEnterprises.filter(e => e.type === "school").length,
        clinics: allEnterprises.filter(e => e.type === "clinic").length,
        healthSystems: allEnterprises.filter(e => e.type === "health-system").length,
      },
    };

    return stats;
  },
});

// Delete user account (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();

    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Admin access required");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) throw new Error("User not found");

    // Store user data for audit log
    const userData = { ...targetUser };

    // Delete associated profile data
    if (targetUser.userType === "student") {
      const student = await ctx.db
        .query("students")
        .withIndex("byUserId", (q) => q.eq("userId", args.userId))
        .first();
      if (student) {
        await ctx.db.delete(student._id);
      }
    } else if (targetUser.userType === "preceptor") {
      const preceptor = await ctx.db
        .query("preceptors")
        .withIndex("byUserId", (q) => q.eq("userId", args.userId))
        .first();
      if (preceptor) {
        await ctx.db.delete(preceptor._id);
      }
    }

    // Delete the user
    await ctx.db.delete(args.userId);

    // Audit logging removed - functionality deprecated

    return { success: true };
  },
});
