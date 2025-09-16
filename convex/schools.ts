import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from './auth'

// Get all active schools
export const getAllSchools = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("schools")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .order("asc")
      .collect();
  },
});

// Get schools by state
export const getSchoolsByState = query({
  args: { state: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schools")
      .withIndex("byState", (q) => q.eq("location.state", args.state))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Search schools by name
export const searchSchools = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const schools = await ctx.db
      .query("schools")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .collect();
    
    if (!args.searchTerm.trim()) {
      return schools;
    }
    
    const searchLower = args.searchTerm.toLowerCase();
    return schools.filter(school => 
      school.name.toLowerCase().includes(searchLower) ||
      school.location.city.toLowerCase().includes(searchLower) ||
      school.location.state.toLowerCase().includes(searchLower)
    );
  },
});

// Create a new school (admin only)
export const createSchool = mutation({
  args: {
    name: v.string(),
    location: v.object({
      city: v.string(),
      state: v.string(),
      country: v.string(),
    }),
    accreditation: v.string(),
    website: v.optional(v.string()),
    programs: v.array(v.object({
      name: v.string(),
      degreeType: v.string(),
      format: v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid")),
    })),
    clinicalRequirements: v.optional(v.object({
      totalHours: v.number(),
      backgroundCheckRequired: v.boolean(),
      additionalRequirements: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db.insert("schools", {
      ...args,
      isActive: true,
    });
  },
});

// Update school information
export const updateSchool = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.optional(v.string()),
    location: v.optional(v.object({
      city: v.string(),
      state: v.string(),
      country: v.string(),
    })),
    accreditation: v.optional(v.string()),
    website: v.optional(v.string()),
    programs: v.optional(v.array(v.object({
      name: v.string(),
      degreeType: v.string(),
      format: v.union(v.literal("online"), v.literal("in-person"), v.literal("hybrid")),
    }))),
    clinicalRequirements: v.optional(v.object({
      totalHours: v.number(),
      backgroundCheckRequired: v.boolean(),
      additionalRequirements: v.optional(v.array(v.string())),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    const { schoolId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    return await ctx.db.patch(schoolId, filteredUpdates);
  },
});

// Deactivate a school
export const deactivateSchool = mutation({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)
    return await ctx.db.patch(args.schoolId, { isActive: false });
  },
});

// Seed initial schools data
export const seedSchools = mutation({
  handler: async (ctx) => {
    await requireAdmin(ctx)
    // Check if schools already exist
    const existingSchools = await ctx.db.query("schools").take(1);
    if (existingSchools.length > 0) {
      return { message: "Schools already exist, skipping seed" };
    }

    const sampleSchools = [
      {
        name: "Johns Hopkins University School of Nursing",
        location: { city: "Baltimore", state: "Maryland", country: "USA" },
        accreditation: "CCNE",
        website: "https://nursing.jhu.edu",
        programs: [
          { name: "Family Nurse Practitioner", degreeType: "MSN", format: "hybrid" as const },
          { name: "Adult-Gerontology Primary Care NP", degreeType: "MSN", format: "hybrid" as const },
          { name: "Psychiatric Mental Health NP", degreeType: "MSN", format: "online" as const },
        ],
        clinicalRequirements: {
          totalHours: 720,
          backgroundCheckRequired: true,
          additionalRequirements: ["Drug screening", "Health clearance"],
        },
        isActive: true,
      },
      {
        name: "Duke University School of Nursing",
        location: { city: "Durham", state: "North Carolina", country: "USA" },
        accreditation: "CCNE",
        website: "https://nursing.duke.edu",
        programs: [
          { name: "Family Nurse Practitioner", degreeType: "MSN", format: "in-person" as const },
          { name: "Acute Care Nurse Practitioner", degreeType: "MSN", format: "in-person" as const },
          { name: "Pediatric Nurse Practitioner", degreeType: "MSN", format: "hybrid" as const },
        ],
        clinicalRequirements: {
          totalHours: 750,
          backgroundCheckRequired: true,
          additionalRequirements: ["Immunization records", "CPR certification"],
        },
        isActive: true,
      },
      {
        name: "University of Pennsylvania School of Nursing",
        location: { city: "Philadelphia", state: "Pennsylvania", country: "USA" },
        accreditation: "CCNE",
        website: "https://nursing.upenn.edu",
        programs: [
          { name: "Family Nurse Practitioner", degreeType: "MSN", format: "hybrid" as const },
          { name: "Women's Health NP", degreeType: "MSN", format: "hybrid" as const },
          { name: "Neonatal Nurse Practitioner", degreeType: "MSN", format: "in-person" as const },
        ],
        clinicalRequirements: {
          totalHours: 700,
          backgroundCheckRequired: true,
          additionalRequirements: ["Professional liability insurance"],
        },
        isActive: true,
      },
      {
        name: "Vanderbilt University School of Nursing",
        location: { city: "Nashville", state: "Tennessee", country: "USA" },
        accreditation: "CCNE",
        website: "https://nursing.vanderbilt.edu",
        programs: [
          { name: "Family Nurse Practitioner", degreeType: "MSN", format: "hybrid" as const },
          { name: "Psychiatric Mental Health NP", degreeType: "MSN", format: "online" as const },
          { name: "Adult-Gerontology Acute Care NP", degreeType: "MSN", format: "in-person" as const },
        ],
        clinicalRequirements: {
          totalHours: 725,
          backgroundCheckRequired: true,
          additionalRequirements: ["Health insurance", "Emergency contact"],
        },
        isActive: true,
      },
      {
        name: "University of California San Francisco School of Nursing",
        location: { city: "San Francisco", state: "California", country: "USA" },
        accreditation: "CCNE",
        website: "https://nursing.ucsf.edu",
        programs: [
          { name: "Family Nurse Practitioner", degreeType: "MSN", format: "hybrid" as const },
          { name: "Pediatric Nurse Practitioner", degreeType: "MSN", format: "in-person" as const },
          { name: "Adult-Gerontology Primary Care NP", degreeType: "MSN", format: "hybrid" as const },
        ],
        clinicalRequirements: {
          totalHours: 720,
          backgroundCheckRequired: true,
          additionalRequirements: ["TB screening", "Professional references"],
        },
        isActive: true,
      }
    ];

    const results = [];
    for (const school of sampleSchools) {
      const schoolId = await ctx.db.insert("schools", school);
      results.push(schoolId);
    }

    return { message: `Successfully seeded ${results.length} schools`, schoolIds: results };
  },
});

// Get school dropdown options for forms
export const getSchoolOptions = query({
  handler: async (ctx) => {
    const schools = await ctx.db
      .query("schools")
      .withIndex("byActive", (q) => q.eq("isActive", true))
      .collect();
    
    return schools.map(school => ({
      value: school._id,
      label: `${school.name} - ${school.location.city}, ${school.location.state}`,
      name: school.name,
      location: school.location,
      programs: school.programs,
    })).sort((a, b) => a.label.localeCompare(b.label));
  },
});
