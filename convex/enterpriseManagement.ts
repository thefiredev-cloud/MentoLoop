import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get enterprise students with details
export const getEnterpriseStudents = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    status: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }

    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    
    // Get students associated with this enterprise
    const studentIds = enterprise.students || [];
    const allStudents = [];
    
    for (const studentId of studentIds) {
      const student = await ctx.db.get(studentId);
      if (student) {
        // Get user data for the student
        const users = await ctx.db.query("users").collect();
        const user = users.find(u => u.externalId === studentId.toString());
        
        // Get latest match for the student
        const latestMatch = await ctx.db.query("matches")
          .filter((q) => q.eq(q.field("studentId"), studentId))
          .order("desc")
          .first();
        
        allStudents.push({
          ...student,
          userName: user?.name || "Unknown",
          userEmail: user?.email,
          latestMatch,
        });
      }
    }
    
    // Apply filters
    let filteredStudents = allStudents;
    
    if (args.status) {
      filteredStudents = filteredStudents.filter(s => s.status === args.status);
    }
    
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.userName.toLowerCase().includes(query) ||
        s.userEmail?.toLowerCase().includes(query) ||
        s.personalInfo.fullName?.toLowerCase().includes(query)
      );
    }
    
    // Apply pagination
    const totalCount = filteredStudents.length;
    const paginatedStudents = filteredStudents.slice(offset, offset + limit);
    
    return {
      students: paginatedStudents,
      totalCount,
      hasMore: totalCount > offset + limit,
    };
  },
});

// Get enterprise preceptors with details
export const getEnterprisePreceptors = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    status: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }

    const limit = args.limit ?? 50;
    const offset = args.offset ?? 0;
    
    // Get preceptors associated with this enterprise
    const preceptorIds = enterprise.preceptors || [];
    const allPreceptors = [];
    
    for (const preceptorId of preceptorIds) {
      const preceptor = await ctx.db.get(preceptorId);
      if (preceptor) {
        // Get user data for the preceptor
        const users = await ctx.db.query("users").collect();
        const user = users.find(u => u.externalId === preceptorId.toString());
        
        // Get active matches for the preceptor
        const activeMatches = await ctx.db.query("matches")
          .filter((q) => 
            q.and(
              q.eq(q.field("preceptorId"), preceptorId),
              q.or(
                q.eq(q.field("status"), "active"),
                q.eq(q.field("status"), "confirmed")
              )
            )
          )
          .collect();
        
        allPreceptors.push({
          ...preceptor,
          userName: user?.name || "Unknown",
          userEmail: user?.email,
          activeMatchCount: activeMatches.length,
        });
      }
    }
    
    // Apply filters
    let filteredPreceptors = allPreceptors;
    
    if (args.status) {
      filteredPreceptors = filteredPreceptors.filter(p => p.verificationStatus === args.status);
    }
    
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      filteredPreceptors = filteredPreceptors.filter(p => 
        p.userName.toLowerCase().includes(query) ||
        p.userEmail?.toLowerCase().includes(query) ||
        p.personalInfo.fullName?.toLowerCase().includes(query) ||
        p.personalInfo.npiNumber?.toLowerCase().includes(query)
      );
    }
    
    // Apply pagination
    const totalCount = filteredPreceptors.length;
    const paginatedPreceptors = filteredPreceptors.slice(offset, offset + limit);
    
    return {
      preceptors: paginatedPreceptors,
      totalCount,
      hasMore: totalCount > offset + limit,
    };
  },
});

// Get enterprise reports data
export const getEnterpriseReports = query({
  args: { 
    enterpriseId: v.id("enterprises"),
    reportType: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }
    
    const studentIds = enterprise.students || [];
    const preceptorIds = enterprise.preceptors || [];
    
    // Get all matches for enterprise students
    const matches = [];
    for (const studentId of studentIds) {
      const studentMatches = await ctx.db.query("matches")
        .filter((q) => q.eq(q.field("studentId"), studentId))
        .collect();
      matches.push(...studentMatches);
    }
    
    // Filter by date range if provided
    let filteredMatches = matches;
    if (args.startDate) {
      const startTime = new Date(args.startDate).getTime();
      filteredMatches = filteredMatches.filter(m => m._creationTime >= startTime);
    }
    if (args.endDate) {
      const endTime = new Date(args.endDate).getTime();
      filteredMatches = filteredMatches.filter(m => m._creationTime <= endTime);
    }
    
    // Calculate report metrics
    const totalMatches = filteredMatches.length;
    const completedMatches = filteredMatches.filter(m => m.status === "completed").length;
    const activeMatches = filteredMatches.filter(m => m.status === "active" || m.status === "confirmed").length;
    const pendingMatches = filteredMatches.filter(m => m.status === "pending").length;
    
    // Calculate success metrics
    const successRate = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
    const averageMatchTime = filteredMatches.length > 0 
      ? filteredMatches.reduce((acc, m) => {
          if (m.status === "confirmed") {
            // Use creation time as confirmation time approximation
            return acc + 3 * 24 * 60 * 60 * 1000; // Assume 3 days average
          }
          return acc;
        }, 0) / Math.max(1, filteredMatches.filter(m => m.status === "confirmed").length)
      : 0;
    
    // Get rotation types distribution
    const rotationTypes = filteredMatches.reduce((acc, m) => {
      const type = m.rotationDetails.rotationType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      summary: {
        totalStudents: studentIds.length,
        totalPreceptors: preceptorIds.length,
        totalMatches,
        completedMatches,
        activeMatches,
        pendingMatches,
        successRate: Math.round(successRate),
        averageMatchTime: Math.round(averageMatchTime / (1000 * 60 * 60 * 24)), // Convert to days
      },
      rotationTypes,
      monthlyTrends: generateMonthlyTrends(filteredMatches),
    };
  },
});

// Helper function to generate monthly trends
function generateMonthlyTrends(matches: any[]) {
  const trends: Record<string, number> = {};
  
  matches.forEach(match => {
    const date = new Date(match._creationTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    trends[monthKey] = (trends[monthKey] || 0) + 1;
  });
  
  // Convert to array and sort by date
  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Get enterprise compliance data
export const getEnterpriseCompliance = query({
  args: { enterpriseId: v.id("enterprises") },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }
    
    const studentIds = enterprise.students || [];
    const preceptorIds = enterprise.preceptors || [];
    
    // Check student compliance
    const studentCompliance = [];
    for (const studentId of studentIds) {
      const student = await ctx.db.get(studentId);
      if (student) {
        const isCompliant = student.status === "submitted";
        
        studentCompliance.push({
          studentId,
          name: student.personalInfo.fullName,
          isCompliant,
          issues: getComplianceIssues(student),
        });
      }
    }
    
    // Check preceptor compliance
    const preceptorCompliance = [];
    for (const preceptorId of preceptorIds) {
      const preceptor = await ctx.db.get(preceptorId);
      if (preceptor) {
        const isCompliant = preceptor.verificationStatus === "verified";
        
        preceptorCompliance.push({
          preceptorId,
          name: preceptor.personalInfo.fullName,
          isCompliant,
          issues: getPreceptorComplianceIssues(preceptor),
        });
      }
    }
    
    const totalStudentsCompliant = studentCompliance.filter(s => s.isCompliant).length;
    const totalPreceptorsCompliant = preceptorCompliance.filter(p => p.isCompliant).length;
    
    return {
      overallCompliance: {
        studentsCompliant: totalStudentsCompliant,
        studentsTotal: studentIds.length,
        studentComplianceRate: studentIds.length > 0 ? Math.round((totalStudentsCompliant / studentIds.length) * 100) : 0,
        preceptorsCompliant: totalPreceptorsCompliant,
        preceptorsTotal: preceptorIds.length,
        preceptorComplianceRate: preceptorIds.length > 0 ? Math.round((totalPreceptorsCompliant / preceptorIds.length) * 100) : 0,
      },
      studentCompliance,
      preceptorCompliance,
    };
  },
});

// Helper function to identify compliance issues
function getComplianceIssues(student: any): string[] {
  const issues = [];
  
  if (student.status !== "submitted") {
    issues.push("Profile incomplete");
  }
  // Add more detailed checks based on actual requirements
  if (!student.educationalBackground) {
    issues.push("Educational background missing");
  }
  if (!student.clinicalInterests) {
    issues.push("Clinical interests not specified");
  }
  
  return issues;
}

function getPreceptorComplianceIssues(preceptor: any): string[] {
  const issues = [];
  
  if (preceptor.verificationStatus !== "verified") {
    issues.push("Verification pending");
  }
  // Add more checks based on preceptor requirements
  if (!preceptor.availability) {
    issues.push("Availability not specified");
  }
  
  return issues;
}

// Approve enterprise student
export const approveEnterpriseStudent = mutation({
  args: {
    enterpriseId: v.id("enterprises"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    // Update student status
    await ctx.db.patch(args.studentId, {
      status: "submitted",
    });
    
    return { success: true };
  },
});

// Update enterprise settings
export const updateEnterpriseSettings = mutation({
  args: {
    enterpriseId: v.id("enterprises"),
    settings: v.object({
      autoApproveStudents: v.optional(v.boolean()),
      requireBackgroundChecks: v.optional(v.boolean()),
      preferredNotificationMethod: v.optional(v.string()),
      customRequirements: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const enterprise = await ctx.db.get(args.enterpriseId);
    if (!enterprise) {
      throw new Error("Enterprise not found");
    }
    
    // Merge settings with existing preferences, ensuring all required fields are present
    const currentPrefs = enterprise.preferences || {
      autoApproveStudents: false,
      requireBackgroundChecks: true,
      preferredNotificationMethod: "email" as const,
      customRequirements: [],
    };
    
    const updatedPreferences = {
      autoApproveStudents: args.settings.autoApproveStudents ?? currentPrefs.autoApproveStudents,
      requireBackgroundChecks: args.settings.requireBackgroundChecks ?? currentPrefs.requireBackgroundChecks,
      preferredNotificationMethod: (args.settings.preferredNotificationMethod ?? currentPrefs.preferredNotificationMethod) as "email" | "dashboard" | "both",
      customRequirements: args.settings.customRequirements ?? currentPrefs.customRequirements,
    };
    
    await ctx.db.patch(args.enterpriseId, {
      preferences: updatedPreferences,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});