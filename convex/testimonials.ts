import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Query for getting public testimonials for marketing pages
export const getPublicTestimonials = query({
  args: {
    userType: v.optional(v.union(v.literal("student"), v.literal("preceptor"))),
    featured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let testimonialsQuery = ctx.db
      .query("testimonials")
      .filter(q => q.and(
        q.eq(q.field("approved"), true),
        q.eq(q.field("isPublic"), true)
      ))

    if (args.userType) {
      testimonialsQuery = testimonialsQuery.filter(q => 
        q.eq(q.field("userType"), args.userType)
      )
    }

    if (args.featured !== undefined) {
      testimonialsQuery = testimonialsQuery.filter(q => 
        q.eq(q.field("featured"), args.featured)
      )
    }

    const testimonials = await testimonialsQuery
      .order("desc")
      .take(args.limit || 20)

    return testimonials
  },
})

// Query for getting all testimonials (admin view)
export const getAllTestimonials = query({
  args: {},
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testimonials")
      .order("desc")
      .collect()
  },
})

// Create a new testimonial
export const createTestimonial = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    institution: v.optional(v.string()),
    userType: v.union(v.literal("student"), v.literal("preceptor")),
    rating: v.number(),
    content: v.string(),
    featured: v.optional(v.boolean()),
    approved: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    location: v.optional(v.object({
      city: v.optional(v.string()),
      state: v.optional(v.string()),
    })),
    rotationType: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testimonials", {
      ...args,
      featured: args.featured ?? false,
      approved: args.approved ?? true, // Default to approved for manual entries
      isPublic: args.isPublic ?? true,
      createdAt: Date.now(),
    })
  },
})

// Update testimonial approval status
export const updateTestimonialStatus = mutation({
  args: {
    testimonialId: v.id("testimonials"),
    approved: v.boolean(),
    featured: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { testimonialId, ...updates } = args
    return await ctx.db.patch(testimonialId, {
      ...updates,
      updatedAt: Date.now(),
    })
  },
})

// Delete a testimonial
export const deleteTestimonial = mutation({
  args: {
    testimonialId: v.id("testimonials"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.testimonialId)
  },
})