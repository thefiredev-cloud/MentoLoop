import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

// Helper function to get week of year
function getWeekOfYear(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

// Helper function to get academic year (starts in August)
function getAcademicYear(date: Date): string {
  const month = date.getMonth() + 1; // 1-based month
  const year = date.getFullYear();
  
  if (month >= 8) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

// Create a new clinical hours entry
export const createHoursEntry = mutation({
  args: {
    matchId: v.optional(v.id("matches")),
    date: v.string(),
    hoursWorked: v.number(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    rotationType: v.string(),
    site: v.string(),
    preceptorName: v.optional(v.string()),
    activities: v.string(),
    learningObjectives: v.optional(v.string()),
    patientPopulation: v.optional(v.string()),
    procedures: v.optional(v.array(v.string())),
    diagnoses: v.optional(v.array(v.string())),
    competenciesAddressed: v.optional(v.array(v.string())),
    reflectiveNotes: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"), v.literal("submitted")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated to log hours");
    }

    // Get student profile
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) {
      throw new Error("Student profile not found");
    }

    // Parse date for metadata
    const entryDate = new Date(args.date);
    const weekOfYear = getWeekOfYear(entryDate);
    const monthOfYear = entryDate.getMonth() + 1;
    const academicYear = getAcademicYear(entryDate);

    const hoursEntry = {
      studentId: student._id,
      matchId: args.matchId,
      date: args.date,
      hoursWorked: args.hoursWorked,
      startTime: args.startTime,
      endTime: args.endTime,
      rotationType: args.rotationType,
      site: args.site,
      preceptorName: args.preceptorName,
      activities: args.activities,
      learningObjectives: args.learningObjectives,
      patientPopulation: args.patientPopulation,
      procedures: args.procedures,
      diagnoses: args.diagnoses,
      competenciesAddressed: args.competenciesAddressed,
      reflectiveNotes: args.reflectiveNotes,
      status: args.status || "draft" as const,
      submittedAt: args.status === "submitted" ? Date.now() : undefined,
      weekOfYear,
      monthOfYear,
      academicYear,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const entryId = await ctx.db.insert("clinicalHours", hoursEntry);
    return entryId;
  },
});

// Update an existing hours entry
export const updateHoursEntry = mutation({
  args: {
    entryId: v.id("clinicalHours"),
    matchId: v.optional(v.id("matches")),
    date: v.optional(v.string()),
    hoursWorked: v.optional(v.number()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    rotationType: v.optional(v.string()),
    site: v.optional(v.string()),
    preceptorName: v.optional(v.string()),
    activities: v.optional(v.string()),
    learningObjectives: v.optional(v.string()),
    patientPopulation: v.optional(v.string()),
    procedures: v.optional(v.array(v.string())),
    diagnoses: v.optional(v.array(v.string())),
    competenciesAddressed: v.optional(v.array(v.string())),
    reflectiveNotes: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"), v.literal("submitted"), v.literal("approved"), 
      v.literal("rejected"), v.literal("needs-revision")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Hours entry not found");
    }

    // Verify user owns this entry
    const student = await ctx.db.get(entry.studentId);
    if (!student || student.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    // Only allow certain updates based on current status
    if (entry.status === "approved") {
      throw new Error("Cannot edit approved hours entries");
    }

    // Add all the optional updates
    if (args.matchId !== undefined) updates.matchId = args.matchId;
    if (args.hoursWorked !== undefined) updates.hoursWorked = args.hoursWorked;
    if (args.startTime !== undefined) updates.startTime = args.startTime;
    if (args.endTime !== undefined) updates.endTime = args.endTime;
    if (args.rotationType !== undefined) updates.rotationType = args.rotationType;
    if (args.site !== undefined) updates.site = args.site;
    if (args.preceptorName !== undefined) updates.preceptorName = args.preceptorName;
    if (args.activities !== undefined) updates.activities = args.activities;
    if (args.learningObjectives !== undefined) updates.learningObjectives = args.learningObjectives;
    if (args.patientPopulation !== undefined) updates.patientPopulation = args.patientPopulation;
    if (args.procedures !== undefined) updates.procedures = args.procedures;
    if (args.diagnoses !== undefined) updates.diagnoses = args.diagnoses;
    if (args.competenciesAddressed !== undefined) updates.competenciesAddressed = args.competenciesAddressed;
    if (args.reflectiveNotes !== undefined) updates.reflectiveNotes = args.reflectiveNotes;
    if (args.status !== undefined) {
      updates.status = args.status;
      if (args.status === "submitted") {
        updates.submittedAt = Date.now();
      }
    }

    // Update date metadata if date changed
    if (args.date !== undefined) {
      const entryDate = new Date(args.date);
      updates.date = args.date;
      updates.weekOfYear = getWeekOfYear(entryDate);
      updates.monthOfYear = entryDate.getMonth() + 1;
      updates.academicYear = getAcademicYear(entryDate);
    }

    await ctx.db.patch(args.entryId, updates);
  },
});

// Delete a hours entry (only if draft)
export const deleteHoursEntry = mutation({
  args: { entryId: v.id("clinicalHours") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Must be authenticated");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Hours entry not found");
    }

    // Verify user owns this entry
    const student = await ctx.db.get(entry.studentId);
    if (!student || student.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Only allow deletion of draft entries
    if (entry.status !== "draft") {
      throw new Error("Can only delete draft entries");
    }

    await ctx.db.delete(args.entryId);
  },
});

// Get student's hours entries
export const getStudentHours = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"), v.literal("submitted"), v.literal("approved"), 
      v.literal("rejected"), v.literal("needs-revision")
    )),
    limit: v.optional(v.number()),
    matchId: v.optional(v.id("matches")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    let query = ctx.db
      .query("clinicalHours")
      .withIndex("byStudent", (q) => q.eq("studentId", student._id));

    if (args.status) {
      query = ctx.db
        .query("clinicalHours")
        .withIndex("byStudentAndStatus", (q) => 
          q.eq("studentId", student._id).eq("status", args.status!)
        );
    }

    let entries = await query.collect();

    // Filter by match if specified
    if (args.matchId) {
      entries = entries.filter(entry => entry.matchId === args.matchId);
    }

    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply limit
    if (args.limit) {
      entries = entries.slice(0, args.limit);
    }

    return entries;
  },
});

// Get hours summary for student
export const getStudentHoursSummary = query({
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return null;

    // Get all approved hours
    const allHours = await ctx.db
      .query("clinicalHours")
      .withIndex("byStudentAndStatus", (q) => 
        q.eq("studentId", student._id).eq("status", "approved")
      )
      .collect();

    // Calculate totals
    const totalHours = allHours.reduce((sum, entry) => sum + entry.hoursWorked, 0);
    const totalRequiredHours = 640; // Standard NP program requirement

    // Current week calculation
    const now = new Date();
    const currentWeek = getWeekOfYear(now);
    const currentYear = now.getFullYear();
    
    const thisWeekHours = allHours
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entry.weekOfYear === currentWeek && 
               entryDate.getFullYear() === currentYear;
      })
      .reduce((sum, entry) => sum + entry.hoursWorked, 0);

    // Calculate average weekly hours (last 8 weeks)
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    
    const recentHours = allHours.filter(entry => 
      new Date(entry.date) >= eightWeeksAgo
    );
    const recentWeeksCount = Math.min(8, 
      Math.ceil((now.getTime() - eightWeeksAgo.getTime()) / (7 * 24 * 60 * 60 * 1000))
    );
    const averageWeeklyHours = recentWeeksCount > 0 ? 
      recentHours.reduce((sum, entry) => sum + entry.hoursWorked, 0) / recentWeeksCount : 0;

    // Hours by rotation type
    const hoursByRotation: Record<string, number> = {};
    allHours.forEach(entry => {
      hoursByRotation[entry.rotationType] = 
        (hoursByRotation[entry.rotationType] || 0) + entry.hoursWorked;
    });

    // Determine if on track (need to complete by expected graduation)
    const remainingHours = totalRequiredHours - totalHours;
    const targetWeeklyHours = 32; // Typical full-time clinical hours
    const isOnTrack = averageWeeklyHours >= targetWeeklyHours * 0.8; // 80% of target

    // Weekly progress for recent weeks
    const weeklyProgress = [];
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekNum = getWeekOfYear(weekDate);
      const weekYear = weekDate.getFullYear();
      
      const weekHours = allHours
        .filter(entry => {
          const entryDate = new Date(entry.date);
          return entry.weekOfYear === weekNum && 
                 entryDate.getFullYear() === weekYear;
        })
        .reduce((sum, entry) => sum + entry.hoursWorked, 0);
      
      weeklyProgress.push({
        week: `Week of ${weekDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        hours: weekHours,
        target: targetWeeklyHours,
        percentage: (weekHours / targetWeeklyHours) * 100,
      });
    }

    return {
      totalHours,
      totalRequiredHours,
      remainingHours,
      thisWeekHours,
      averageWeeklyHours: Math.round(averageWeeklyHours * 10) / 10,
      isOnTrack,
      progressPercentage: Math.round((totalHours / totalRequiredHours) * 100),
      hoursByRotation,
      weeklyProgress,
      entriesCount: allHours.length,
      pendingApprovals: await ctx.db
        .query("clinicalHours")
        .withIndex("byStudentAndStatus", (q) => 
          q.eq("studentId", student._id).eq("status", "submitted")
        )
        .collect()
        .then(entries => entries.length),
    };
  },
});

// Get weekly hours breakdown
export const getWeeklyHoursBreakdown = query({
  args: {
    weeksBack: v.optional(v.number()), // How many weeks back to include
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    const weeksBack = args.weeksBack || 12;
    const now = new Date();
    const weeks = [];

    // Get hours for each week
    for (let i = weeksBack - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
      
      const weekNum = getWeekOfYear(weekStart);
      const weekYear = weekStart.getFullYear();
      
      const weekHours = await ctx.db
        .query("clinicalHours")
        .withIndex("byStudent", (q) => q.eq("studentId", student._id))
        .filter((q) => 
          q.and(
            q.eq(q.field("weekOfYear"), weekNum),
            q.gte(q.field("createdAt"), weekStart.getTime()),
            q.lte(q.field("createdAt"), weekEnd.getTime())
          )
        )
        .collect();

      const totalHours = weekHours.reduce((sum, entry) => sum + entry.hoursWorked, 0);
      const approvedHours = weekHours
        .filter(entry => entry.status === "approved")
        .reduce((sum, entry) => sum + entry.hoursWorked, 0);

      weeks.push({
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        weekLabel: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        totalHours,
        approvedHours,
        pendingHours: totalHours - approvedHours,
        entriesCount: weekHours.length,
        entries: weekHours.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      });
    }

    return weeks;
  },
});

// Get comprehensive clinical hours dashboard stats
export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    // Get student record
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return null;

    // Get all student's hours
    const allHours = await ctx.db
      .query("clinicalHours")
      .withIndex("byStudent", (q) => q.eq("studentId", student._id))
      .collect();

    const approvedHours = allHours.filter(h => h.status === "approved");
    const pendingHours = allHours.filter(h => h.status === "submitted");
    const draftHours = allHours.filter(h => h.status === "draft");

    // Calculate totals
    const totalHours = allHours.reduce((sum, h) => sum + h.hoursWorked, 0);
    const totalApproved = approvedHours.reduce((sum, h) => sum + h.hoursWorked, 0);
    const totalPending = pendingHours.reduce((sum, h) => sum + h.hoursWorked, 0);
    const totalDraft = draftHours.reduce((sum, h) => sum + h.hoursWorked, 0);

    // Calculate by rotation type
    const rotationTypeTotals = allHours.reduce((acc, h) => {
      acc[h.rotationType] = (acc[h.rotationType] || 0) + h.hoursWorked;
      return acc;
    }, {} as Record<string, number>);

    // Calculate monthly progress (last 12 months)
    const monthlyProgress = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = month.getTime();
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0).getTime();
      
      const monthHours = allHours.filter(h => 
        h.createdAt >= monthStart && h.createdAt <= monthEnd
      );
      
      monthlyProgress.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        hours: monthHours.reduce((sum, h) => sum + h.hoursWorked, 0),
        entries: monthHours.length,
      });
    }

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentHours = allHours.filter(h => h.createdAt >= thirtyDaysAgo);

    return {
      totalHours,
      totalApproved,
      totalPending,
      totalDraft,
      totalEntries: allHours.length,
      approvedEntries: approvedHours.length,
      pendingEntries: pendingHours.length,
      draftEntries: draftHours.length,
      rotationTypeTotals,
      monthlyProgress,
      recentActivity: {
        hoursLogged: recentHours.reduce((sum, h) => sum + h.hoursWorked, 0),
        entriesCount: recentHours.length,
        averageHoursPerEntry: recentHours.length > 0 ? 
          recentHours.reduce((sum, h) => sum + h.hoursWorked, 0) / recentHours.length : 0,
      },
      requirementsProgress: {
        // Example requirements - can be customized per program
        familyPractice: rotationTypeTotals['family-practice'] || 0,
        pediatrics: rotationTypeTotals['pediatrics'] || 0,
        mentalHealth: rotationTypeTotals['psych-mental-health'] || 0,
        womensHealth: rotationTypeTotals['womens-health'] || 0,
        adultGero: rotationTypeTotals['adult-gero'] || 0,
        acuteCare: rotationTypeTotals['acute-care'] || 0,
      },
    };
  },
});

// Export hours to CSV format (returns data that can be converted to CSV)
export const exportHours = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    rotationType: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    // Get student record
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    let query = ctx.db
      .query("clinicalHours")
      .withIndex("byStudent", (q) => q.eq("studentId", student._id));

    // Apply filters
    let hours = await query.collect();

    if (args.startDate) {
      const startTime = new Date(args.startDate).getTime();
      hours = hours.filter(h => new Date(h.date).getTime() >= startTime);
    }

    if (args.endDate) {
      const endTime = new Date(args.endDate).getTime();
      hours = hours.filter(h => new Date(h.date).getTime() <= endTime);
    }

    if (args.rotationType) {
      hours = hours.filter(h => h.rotationType === args.rotationType);
    }

    if (args.status) {
      hours = hours.filter(h => h.status === args.status);
    }

    // Format for export
    return hours.map(h => ({
      date: h.date,
      hoursWorked: h.hoursWorked,
      startTime: h.startTime || "",
      endTime: h.endTime || "",
      rotationType: h.rotationType,
      site: h.site,
      preceptorName: h.preceptorName || "",
      activities: h.activities,
      learningObjectives: h.learningObjectives || "",
      patientPopulation: h.patientPopulation || "",
      procedures: h.procedures?.join("; ") || "",
      diagnoses: h.diagnoses?.join("; ") || "",
      competenciesAddressed: h.competenciesAddressed?.join("; ") || "",
      reflectiveNotes: h.reflectiveNotes || "",
      status: h.status,
      submittedAt: h.submittedAt ? new Date(h.submittedAt).toISOString() : "",
      approvedAt: h.approvedAt ? new Date(h.approvedAt).toISOString() : "",
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
});

// Get rotation type analytics
export const getRotationAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();

    if (!student) return [];

    const allHours = await ctx.db
      .query("clinicalHours")
      .withIndex("byStudent", (q) => q.eq("studentId", student._id))
      .collect();

    // Group by rotation type
    const rotationStats = allHours.reduce((acc, h) => {
      if (!acc[h.rotationType]) {
        acc[h.rotationType] = {
          rotationType: h.rotationType,
          totalHours: 0,
          approvedHours: 0,
          pendingHours: 0,
          entriesCount: 0,
          sites: new Set(),
          preceptors: new Set(),
          procedures: new Set(),
          diagnoses: new Set(),
          competencies: new Set(),
        };
      }

      const stats = acc[h.rotationType];
      stats.totalHours += h.hoursWorked;
      stats.entriesCount += 1;
      
      if (h.status === "approved") {
        stats.approvedHours += h.hoursWorked;
      } else if (h.status === "submitted") {
        stats.pendingHours += h.hoursWorked;
      }

      stats.sites.add(h.site);
      if (h.preceptorName) stats.preceptors.add(h.preceptorName);
      h.procedures?.forEach(p => stats.procedures.add(p));
      h.diagnoses?.forEach(d => stats.diagnoses.add(d));
      h.competenciesAddressed?.forEach(c => stats.competencies.add(c));

      return acc;
    }, {} as Record<string, any>);

    // Convert to array and add diversity metrics
    return Object.values(rotationStats).map((stats: any) => ({
      ...stats,
      sites: Array.from(stats.sites),
      preceptors: Array.from(stats.preceptors),
      procedures: Array.from(stats.procedures),
      diagnoses: Array.from(stats.diagnoses),
      competencies: Array.from(stats.competencies),
      uniqueSites: stats.sites.size,
      uniquePreceptors: stats.preceptors.size,
      uniqueProcedures: stats.procedures.size,
      uniqueDiagnoses: stats.diagnoses.size,
      uniqueCompetencies: stats.competencies.size,
      averageHoursPerEntry: stats.entriesCount > 0 ? stats.totalHours / stats.entriesCount : 0,
    }));
  },
});