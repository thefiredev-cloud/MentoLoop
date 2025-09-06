import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new enterprise inquiry/signup
export const createEnterpriseInquiry = mutation({
  args: {
    name: v.string(),
    contactName: v.string(),
    title: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    numberOfStudents: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Create a minimal enterprise record for inquiry
    // Contact info will be stored in preferences.customRequirements as structured data
    const contactInfo = `Contact: ${args.contactName} (${args.title}) - ${args.email}${args.phone ? ` - ${args.phone}` : ''} | Students: ${args.numberOfStudents}${args.message ? ` | Message: ${args.message}` : ''}`;
    
    const enterpriseId = await ctx.db.insert("enterprises", {
      name: args.name,
      type: "school", // Assume school for institutional inquiries
      organizationInfo: {
        address: "TBD", // Will be filled later during full setup
        city: "TBD",
        state: "TBD", 
        zipCode: "TBD",
        phone: args.phone || "TBD",
        website: undefined,
        ein: undefined,
        accreditation: undefined,
      },
      adminUsers: [], // Will be assigned later
      students: [],
      preceptors: [],
      billingInfo: undefined,
      preferences: {
        autoApproveStudents: false,
        requireBackgroundChecks: true,
        customRequirements: [contactInfo], // Store contact info here temporarily
        preferredNotificationMethod: "email",
      },
      agreements: {
        signedAt: Date.now(),
        signedBy: args.contactName,
        agreementVersion: "inquiry-v1.0", // Special version for inquiries
        customTerms: `Initial inquiry from ${args.contactName}`,
      },
      status: "pending", // Use pending status for inquiries
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return enterpriseId;
  },
});

// Get all enterprise inquiries (for admin dashboard)
export const getEnterpriseInquiries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("enterprises")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  },
});

// Get all active enterprises
export const getActiveEnterprises = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("enterprises")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Update enterprise status (for admin use)
export const updateEnterpriseStatus = mutation({
  args: {
    enterpriseId: v.id("enterprises"),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.enterpriseId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});

// Get enterprise by ID
export const getEnterpriseById = query({
  args: { enterpriseId: v.id("enterprises") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.enterpriseId);
  },
});

// Count total enterprises (for platform stats)
export const countEnterprises = query({
  args: {},
  handler: async (ctx) => {
    const enterprises = await ctx.db.query("enterprises").collect();
    return {
      total: enterprises.length,
      active: enterprises.filter(e => e.status === "active").length,
      pending: enterprises.filter(e => e.status === "pending").length,
    };
  },
});

// Get enterprise dashboard stats
export const getEnterpriseDashboardStats = query({
  args: { enterpriseId: v.id("enterprises") },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }

    // Get students associated with this enterprise (from the enterprise's student array)
    const studentIds = enterprise.students || [];
    const students = [];
    for (const studentId of studentIds) {
      const student = await ctx.db.get(studentId);
      if (student) students.push(student);
    }

    // Get preceptors associated with this enterprise (from the enterprise's preceptor array)
    const preceptorIds = enterprise.preceptors || [];
    const preceptors = [];
    for (const preceptorId of preceptorIds) {
      const preceptor = await ctx.db.get(preceptorId);
      if (preceptor) preceptors.push(preceptor);
    }

    // Get matches for enterprise students
    const matches = [];
    for (const studentId of studentIds) {
      const studentMatches = await ctx.db.query("matches")
        .filter((q) => q.eq(q.field("studentId"), studentId))
        .collect();
      matches.push(...studentMatches);
    }

    const activeRotations = matches.filter(m => m.status === "active" || m.status === "confirmed").length;
    const completedMatches = matches.filter(m => m.status === "completed").length;
    const totalMatches = matches.length;
    const completionRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

    return {
      enterprise,
      totalStudents: students.length,
      totalPreceptors: preceptors.length,
      activeRotations,
      completionRate,
      pendingApprovals: students.filter(s => s.status === "submitted").length, // Fix: use 'submitted' instead of 'pending'
      upcomingRotations: matches.filter(m => 
        m.status === "confirmed" && 
        new Date(m.rotationDetails.startDate) > new Date()
      ).length,
    };
  },
});

// Get enterprise recent activity
export const getEnterpriseRecentActivity = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }
    
    // Get students for this enterprise (from the enterprise's student array)
    const studentIds = enterprise.students || [];
    
    // Get recent matches for enterprise students
    const matches = [];
    for (const studentId of studentIds) {
      const studentMatches = await ctx.db.query("matches")
        .filter((q) => q.eq(q.field("studentId"), studentId))
        .order("desc")
        .take(limit);
      matches.push(...studentMatches);
    }

    // Sort by creation time and limit results
    const sortedMatches = matches
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);

    // Convert to activity format
    return sortedMatches.map(match => ({
      id: match._id,
      type: 'match' as const,
      title: match.status === 'confirmed' ? 'New Match Confirmed' : 'Match Status Updated',
      description: `${match.status === 'confirmed' ? 'Student matched with preceptor for' : 'Match updated for'} ${match.rotationDetails.rotationType} rotation`,
      timestamp: match._creationTime,
      status: match.status === 'confirmed' ? 'success' as const : 'info' as const,
    }));
  },
});