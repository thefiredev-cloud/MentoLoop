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