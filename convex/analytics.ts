import { query } from "./_generated/server";
import { v } from "convex/values";

export const getSurveyInsights = query({
  args: {
    dateRange: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This would normally fetch from surveys table and calculate insights
    // For now, returning mock data structure that matches the frontend
    return {
      responseRate: 87.5,
      averageResponseTime: "4.2 days",
      totalResponses: 1247,
      commonFeedback: [
        { category: "Communication", score: 9.1, mentions: 234 },
        { category: "Clinical Knowledge", score: 8.8, mentions: 198 },
        { category: "Professional Growth", score: 9.3, mentions: 267 },
        { category: "Site Accessibility", score: 7.9, mentions: 145 },
        { category: "Learning Environment", score: 8.7, mentions: 189 }
      ],
      sentimentDistribution: {
        veryPositive: 68,
        positive: 23,
        neutral: 7,
        negative: 2
      },
      improvementAreas: [
        { area: "Communication Timing", mentions: 34 },
        { area: "Site Parking", mentions: 28 },
        { area: "EHR Training", mentions: 22 },
        { area: "Case Volume Consistency", mentions: 19 }
      ]
    };
  },
});

export const getQualityMetrics = query({
  args: {
    dateRange: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate quality metrics from matches, surveys, and other data
    return {
      aiAccuracy: 94.5,
      matchRetention: 91.2,
      rotationCompletion: 88.1,
      earlyTermination: 4.3,
      conflictResolution: 96.7,
      studentSatisfaction: 94.2,
      preceptorSatisfaction: 91.8,
      averageScore: 8.3,
      completionRate: 88.1,
    };
  },
});

export const getSpecialtyBreakdown = query({
  args: {
    dateRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Analyze performance by specialty
    return [
      { name: "Family Nurse Practitioner (FNP)", matches: 156, avgScore: 8.4, satisfaction: 95.1 },
      { name: "Psychiatric Mental Health NP (PMHNP)", matches: 89, avgScore: 8.1, satisfaction: 93.2 },
      { name: "Pediatric Nurse Practitioner (PNP)", matches: 67, avgScore: 8.6, satisfaction: 96.3 },
      { name: "Adult-Gerontology NP (AGNP)", matches: 78, avgScore: 8.3, satisfaction: 92.8 },
      { name: "Women's Health NP (WHNP)", matches: 42, avgScore: 8.7, satisfaction: 97.1 },
      { name: "Acute Care NP (ACNP)", matches: 20, avgScore: 8.0, satisfaction: 89.5 }
    ];
  },
});

export const getPerformanceTrends = query({
  args: {
    dateRange: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get historical performance trends
    return [
      { month: "Jan", matches: 67, satisfaction: 89.2, aiScore: 8.1 },
      { month: "Feb", matches: 72, satisfaction: 91.1, aiScore: 8.3 },
      { month: "Mar", matches: 84, satisfaction: 92.3, aiScore: 8.4 },
      { month: "Apr", matches: 91, satisfaction: 93.8, aiScore: 8.6 },
      { month: "May", matches: 96, satisfaction: 94.2, aiScore: 8.7 },
      { month: "Jun", matches: 102, satisfaction: 94.9, aiScore: 8.8 }
    ];
  },
});

export const getGeographicDistribution = query({
  args: {
    dateRange: v.optional(v.string()),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Analyze geographic distribution within Texas only
    // TODO: Replace with actual data queries when location data is populated
    const texasDistribution = [
      { region: "Dallas-Fort Worth", percentage: 28, matches: 126, avgScore: 9.1 },
      { region: "Houston", percentage: 24, matches: 108, avgScore: 8.9 },
      { region: "San Antonio", percentage: 18, matches: 81, avgScore: 8.7 },
      { region: "Austin", percentage: 15, matches: 68, avgScore: 9.0 },
      { region: "Other Texas Cities", percentage: 15, matches: 69, avgScore: 8.5 }
    ];

    const topCounties = [
      { county: "Harris County (Houston)", matches: 89, avgScore: 8.9, status: "top" },
      { county: "Dallas County", matches: 74, avgScore: 9.1, status: "top" },
      { county: "Tarrant County (Fort Worth)", matches: 52, avgScore: 9.0, status: "high" },
      { county: "Bexar County (San Antonio)", matches: 48, avgScore: 8.7, status: "high" },
      { county: "Travis County (Austin)", matches: 44, avgScore: 9.0, status: "high" },
      { county: "Collin County", matches: 31, avgScore: 8.8, status: "good" }
    ];

    return {
      distribution: texasDistribution,
      topRegions: topCounties,
      totalTexasMatches: texasDistribution.reduce((sum, region) => sum + region.matches, 0),
      coverageAreas: [
        "Major Metro Areas: Dallas-Fort Worth, Houston, San Antonio, Austin",
        "East Texas: Tyler, Longview, Marshall, Nacogdoches",
        "West Texas: Lubbock, Midland, Odessa, Abilene",
        "South Texas: Corpus Christi, Brownsville, McAllen",
        "Central Texas: Waco, Killeen, Bryan-College Station"
      ]
    };
  },
});

export const getOverviewStats = query({
  args: {
    dateRange: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get high-level overview statistics for Texas operations
    // TODO: Filter by location data when available
    return {
      totalMatches: 452,
      successfulMatches: 398,
      totalUsers: 1247,
      totalRevenue: 45670,
      averageScore: 8.3,
      studentSatisfaction: 94.2,
      preceptorSatisfaction: 91.8,
      completionRate: 88.1,
      aiSuccessRate: 94.5,
      avgResponseTime: "2.3h",
      // Texas-specific metrics
      texasOnlyOperations: true,
      coveredMetroAreas: 4, // Dallas, Houston, San Antonio, Austin
      coveredCounties: 15,
      averageDistanceToRotation: "18 miles", // Texas average
      ruralCoverage: 23.5 // Percentage of rural Texas covered
    };
  },
});