import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// CEU course schema definition
const courseSchema = {
  title: v.string(),
  category: v.string(),
  credits: v.number(),
  duration: v.string(),
  difficulty: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")),
  description: v.string(),
  instructor: v.string(),
  price: v.number(),
  status: v.union(v.literal("available"), v.literal("coming-soon"), v.literal("archived")),
  enrollmentCount: v.number(),
  rating: v.optional(v.number()),
  thumbnail: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

const enrollmentSchema = {
  userId: v.id("users"),
  courseId: v.string(),
  enrolledAt: v.number(),
  progress: v.number(),
  status: v.union(v.literal("enrolled"), v.literal("in-progress"), v.literal("completed"), v.literal("expired")),
  completedAt: v.optional(v.number()),
  certificateUrl: v.optional(v.string()),
};

// Get available CEU courses
export const getAvailableCourses = query({
  args: {
    category: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, return sample courses as we don't have a courses table yet
    // In production, this would query from a courses table
    const sampleCourses = [
      {
        id: "1",
        title: "Advanced Clinical Assessment Techniques",
        category: "Clinical Skills",
        credits: 4,
        duration: "4 hours",
        difficulty: "Advanced" as const,
        enrollmentCount: 1234,
        rating: 4.8,
        progress: 0,
        status: "available" as const,
        instructor: "Dr. Sarah Johnson, DNP",
        description: "Master advanced assessment techniques for complex patient cases",
        price: 149,
        thumbnail: "/api/placeholder/300/200",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "2",
        title: "Pharmacology Update 2024",
        category: "Pharmacology",
        credits: 3,
        duration: "3 hours",
        difficulty: "Intermediate" as const,
        enrollmentCount: 892,
        rating: 4.6,
        progress: 0,
        status: "available" as const,
        instructor: "Dr. Michael Chen, PharmD",
        description: "Latest updates in pharmacology and medication management",
        price: 99,
        thumbnail: "/api/placeholder/300/200",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: "3",
        title: "Mental Health in Primary Care",
        category: "Mental Health",
        credits: 5,
        duration: "5 hours",
        difficulty: "Intermediate" as const,
        enrollmentCount: 2156,
        rating: 4.9,
        progress: 0,
        status: "available" as const,
        instructor: "Dr. Emily Rodriguez, PMHNP",
        description: "Integrating mental health assessment and treatment in primary care",
        price: 179,
        thumbnail: "/api/placeholder/300/200",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    // Filter by category if provided
    let courses = sampleCourses;
    if (args.category && args.category !== "all") {
      courses = courses.filter(c => c.category === args.category);
    }

    // Filter by search query if provided
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      courses = courses.filter(c => 
        c.title.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }

    return courses;
  },
});

// Get user's enrolled courses
export const getUserEnrollments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // In production, this would query from an enrollments table
    // For now, return sample enrolled courses
    return [
      {
        id: "1",
        courseId: "1",
        title: "Advanced Clinical Assessment Techniques",
        category: "Clinical Skills",
        credits: 4,
        duration: "4 hours",
        progress: 65,
        status: "in-progress" as const,
        enrolledAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        instructor: "Dr. Sarah Johnson, DNP",
      },
    ];
  },
});

// Get user's certificates
export const getUserCertificates = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // In production, this would query completed courses with certificates
    return [
      {
        id: "cert-1",
        courseTitle: "Pediatric Emergency Care",
        completedDate: "2024-01-15",
        credits: 4,
        certificateUrl: "#",
      },
      {
        id: "cert-2",
        courseTitle: "Diabetes Management",
        completedDate: "2023-12-20",
        credits: 3,
        certificateUrl: "#",
      },
    ];
  },
});

// Get CEU statistics
export const getCEUStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalCredits: 0,
        coursesCompleted: 0,
        coursesInProgress: 0,
        certificatesEarned: 0,
        currentYearCredits: 0,
        requiredCredits: 30,
      };
    }

    // In production, calculate from actual data
    return {
      totalCredits: 32,
      coursesCompleted: 8,
      coursesInProgress: 2,
      certificatesEarned: 8,
      currentYearCredits: 12,
      requiredCredits: 30,
    };
  },
});

// Enroll in a course
export const enrollInCourse = mutation({
  args: {
    courseId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // In production, this would:
    // 1. Check if user is already enrolled
    // 2. Process payment if required
    // 3. Create enrollment record
    // 4. Send confirmation email

    // For now, just return success
    return {
      success: true,
      message: "Successfully enrolled in course",
      enrollmentId: `enroll-${Date.now()}`,
    };
  },
});

// Update course progress
export const updateCourseProgress = mutation({
  args: {
    enrollmentId: v.string(),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Validate progress is between 0 and 100
    if (args.progress < 0 || args.progress > 100) {
      throw new Error("Progress must be between 0 and 100");
    }

    // In production, update the enrollment record
    return {
      success: true,
      progress: args.progress,
      completed: args.progress === 100,
    };
  },
});