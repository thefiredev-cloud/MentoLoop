import { cronJobs } from "convex/server";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Send rotation start reminders 3 days before
crons.daily(
  "send rotation start reminders",
  { hourUTC: 14, minuteUTC: 0 }, // 2 PM UTC (adjust for your timezone)
  internal.scheduledTasks.sendRotationStartReminders
);

// Send payment reminders for unpaid matches
crons.daily(
  "send payment reminders", 
  { hourUTC: 16, minuteUTC: 0 }, // 4 PM UTC
  internal.scheduledTasks.sendPaymentReminders
);

// Send survey requests for completed rotations
crons.daily(
  "send survey requests",
  { hourUTC: 10, minuteUTC: 0 }, // 10 AM UTC
  internal.scheduledTasks.sendSurveyRequests
);

// Internal action to send rotation start reminders
export const sendRotationStartReminders = internalAction({
  handler: async (ctx) => {
    const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000);
    const fourDaysFromNow = Date.now() + (4 * 24 * 60 * 60 * 1000);
    
    // Get matches starting in 3 days
    const upcomingMatches = await ctx.db
      .query("matches")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.gte(q.field("rotationDetails.startDate"), new Date(threeDaysFromNow).toISOString().split('T')[0]),
          q.lt(q.field("rotationDetails.startDate"), new Date(fourDaysFromNow).toISOString().split('T')[0])
        )
      )
      .collect();

    const results = [];
    
    for (const match of upcomingMatches) {
      try {
        const student = await ctx.db.get(match.studentId);
        const preceptor = await ctx.db.get(match.preceptorId);
        
        if (!student || !preceptor) continue;

        // Send SMS reminders if phone numbers available
        if (student.personalInfo.phone) {
          await ctx.runAction(internal.sms.sendRotationStartReminderSMS, {
            phone: student.personalInfo.phone,
            partnerName: preceptor.personalInfo.fullName,
            startDate: match.rotationDetails.startDate,
          });
        }

        if (preceptor.personalInfo.phone) {
          await ctx.runAction(internal.sms.sendRotationStartReminderSMS, {
            phone: preceptor.personalInfo.phone,
            partnerName: student.personalInfo.fullName,
            startDate: match.rotationDetails.startDate,
          });
        }

        results.push({ matchId: match._id, status: "sent" });
      } catch (error) {
        console.error(`Failed to send reminder for match ${match._id}:`, error);
        results.push({ matchId: match._id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return { totalProcessed: upcomingMatches.length, results };
  },
});

// Internal action to send payment reminders
export const sendPaymentReminders = internalAction({
  handler: async (ctx) => {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    
    // Get confirmed matches that might need payment reminders
    const pendingPaymentMatches = await ctx.db
      .query("matches")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.gte(q.field("matchedAt"), twoDaysAgo)
        )
      )
      .collect();

    const results = [];
    
    for (const match of pendingPaymentMatches) {
      try {
        // Check if payment has been received
        const paymentAttempt = await ctx.db
          .query("paymentAttempts")
          .filter((q) =>
            q.and(
              q.eq(q.field("matchId"), match._id),
              q.eq(q.field("status"), "succeeded")
            )
          )
          .first();

        if (paymentAttempt) continue; // Payment already received

        const student = await ctx.db.get(match.studentId);
        const preceptor = await ctx.db.get(match.preceptorId);
        
        if (!student || !preceptor) continue;

        // Send SMS payment reminder to student
        if (student.personalInfo.phone) {
          await ctx.runAction(internal.sms.sendPaymentReminderSMS, {
            phone: student.personalInfo.phone,
            studentName: student.personalInfo.fullName,
            preceptorName: preceptor.personalInfo.fullName,
          });
        }

        results.push({ matchId: match._id, status: "sent" });
      } catch (error) {
        console.error(`Failed to send payment reminder for match ${match._id}:`, error);
        results.push({ matchId: match._id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return { totalProcessed: pendingPaymentMatches.length, results };
  },
});

// Internal action to send survey requests for completed rotations
export const sendSurveyRequests = internalAction({
  handler: async (ctx) => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Get matches that completed in the last 3-7 days
    const recentlyCompletedMatches = await ctx.db
      .query("matches")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "completed"),
          q.gte(q.field("completedAt"), sevenDaysAgo),
          q.lt(q.field("completedAt"), threeDaysAgo)
        )
      )
      .collect();

    const results = [];
    
    for (const match of recentlyCompletedMatches) {
      try {
        const student = await ctx.db.get(match.studentId);
        const preceptor = await ctx.db.get(match.preceptorId);
        
        if (!student || !preceptor) continue;

        // Check if surveys have already been submitted
        const existingSurveys = await ctx.db
          .query("surveys")
          .withIndex("byMatchId", (q) => q.eq("matchId", match._id))
          .collect();

        const hasStudentSurvey = existingSurveys.some(s => s.respondentType === "student");
        const hasPreceptorSurvey = existingSurveys.some(s => s.respondentType === "preceptor");

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentoloop.com";

        // Send survey request to student if not completed
        if (!hasStudentSurvey && student.personalInfo.phone) {
          const surveyLink = `${baseUrl}/dashboard/survey?matchId=${match._id}&type=student&partner=${encodeURIComponent(preceptor.personalInfo.fullName)}`;
          
          await ctx.runAction(internal.sms.sendSurveyRequestSMS, {
            phone: student.personalInfo.phone,
            firstName: student.personalInfo.fullName.split(' ')[0],
            surveyLink,
          });
        }

        // Send survey request to preceptor if not completed
        if (!hasPreceptorSurvey && preceptor.personalInfo.phone) {
          const surveyLink = `${baseUrl}/dashboard/survey?matchId=${match._id}&type=preceptor&partner=${encodeURIComponent(student.personalInfo.fullName)}`;
          
          await ctx.runAction(internal.sms.sendSurveyRequestSMS, {
            phone: preceptor.personalInfo.phone,
            firstName: preceptor.personalInfo.fullName.split(' ')[0],
            surveyLink,
          });
        }

        results.push({ matchId: match._id, status: "sent" });
      } catch (error) {
        console.error(`Failed to send survey request for match ${match._id}:`, error);
        results.push({ matchId: match._id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return { totalProcessed: recentlyCompletedMatches.length, results };
  },
});

export default crons;