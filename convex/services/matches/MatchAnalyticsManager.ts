export type MatchAnalytics = {
  totalMatches: number;
  suggested: number; pending: number; confirmed: number; active: number; completed: number; cancelled: number;
  paid: number; unpaid: number; refunded: number;
  averageMentorFitScore: number; successRate: number; paymentSuccessRate: number;
};

export class MatchAnalyticsManager {
  async compute(ctx: any, dateRange?: { start: number; end: number }): Promise<MatchAnalytics> {
    let query = ctx.db.query("matches");
    if (dateRange) {
      query = query.filter((q: any) => q.and(q.gte(q.field("createdAt"), dateRange.start), q.lte(q.field("createdAt"), dateRange.end)));
    }
    const matches = await query.collect();

    const analytics: MatchAnalytics = {
      totalMatches: matches.length,
      suggested: matches.filter((m: any) => m.status === "suggested").length,
      pending: matches.filter((m: any) => m.status === "pending").length,
      confirmed: matches.filter((m: any) => m.status === "confirmed").length,
      active: matches.filter((m: any) => m.status === "active").length,
      completed: matches.filter((m: any) => m.status === "completed").length,
      cancelled: matches.filter((m: any) => m.status === "cancelled").length,
      paid: matches.filter((m: any) => m.paymentStatus === "paid").length,
      unpaid: matches.filter((m: any) => m.paymentStatus === "unpaid").length,
      refunded: matches.filter((m: any) => m.paymentStatus === "refunded").length,
      averageMentorFitScore: 0,
      successRate: 0,
      paymentSuccessRate: 0,
    };

    if (matches.length > 0) {
      const totalScore = matches.reduce((sum: number, m: any) => sum + (m.mentorFitScore || 0), 0);
      analytics.averageMentorFitScore = totalScore / matches.length;
    }

    const successfulMatches = analytics.confirmed + analytics.active + analytics.completed;
    analytics.successRate = analytics.totalMatches > 0 ? (successfulMatches / analytics.totalMatches) * 100 : 0;
    analytics.paymentSuccessRate = analytics.totalMatches > 0 ? (analytics.paid / analytics.totalMatches) * 100 : 0;

    return analytics;
  }
}
