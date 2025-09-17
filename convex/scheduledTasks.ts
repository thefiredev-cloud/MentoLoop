import { cronJobs } from "convex/server";
import { internalAction, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";
import { v } from "convex/values";

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

// Cleanup old webhook event records (keep 30 days)
crons.daily(
  "cleanup old webhook events",
  { hourUTC: 3, minuteUTC: 0 },
  internal.scheduledTasks.cleanupOldWebhookEvents
);

// Internal action to send rotation start reminders
export const sendRotationStartReminders = internalAction({
  handler: async (ctx): Promise<any> => {
    const threeDaysFromNow = Date.now() + (3 * 24 * 60 * 60 * 1000);
    const fourDaysFromNow = Date.now() + (4 * 24 * 60 * 60 * 1000);
    
    // Get matches starting in 3 days
    const upcomingMatches: any = await ctx.runQuery(internal.matchHelpers.getUpcomingMatches, {
      daysAhead: 3
    });

    const results = [];
    
    for (const match of upcomingMatches) {
      try {
        const student = await ctx.runQuery(internal.students.getStudentById, {
          studentId: match.studentId,
        });
        const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, {
          preceptorId: match.preceptorId,
        });
        
        if (!student || !preceptor) continue;

        // Send email reminders for rotation start
        await ctx.runAction(internal.emails.sendEmailInternal, {
          to: student.personalInfo.email,
          templateKey: "MATCH_CONFIRMED_STUDENT",
          variables: {
            firstName: student.personalInfo.fullName.split(' ')[0],
            preceptorName: preceptor.personalInfo.fullName,
            specialty: match.rotationDetails.specialty || "Clinical Rotation",
            location: preceptor.practiceInfo.city + ", " + preceptor.practiceInfo.state || "TBD",
            startDate: match.rotationDetails.startDate,
            endDate: match.rotationDetails.endDate,
            paymentLink: "#",
          },
        });

        await ctx.runAction(internal.emails.sendEmailInternal, {
          to: preceptor.personalInfo.email,
          templateKey: "MATCH_CONFIRMED_PRECEPTOR",
          variables: {
            firstName: preceptor.personalInfo.fullName.split(' ')[0],
            studentName: student.personalInfo.fullName,
            startDate: match.rotationDetails.startDate,
            location: preceptor.practiceInfo.city + ", " + preceptor.practiceInfo.state || "TBD",
          },
        });

        // Send SMS reminders if phone numbers available
        if (student.personalInfo.phone) {
          await ctx.runAction(internal.sms.sendRotationStartReminderSMS, {
            phone: student.personalInfo.phone,
            partnerName: preceptor.personalInfo.fullName,
            startDate: match.rotationDetails.startDate,
          });
        }

        if (preceptor.personalInfo.mobilePhone) {
          await ctx.runAction(internal.sms.sendRotationStartReminderSMS, {
            phone: preceptor.personalInfo.mobilePhone,
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
  handler: async (ctx): Promise<any> => {
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    
    // Get confirmed matches that might need payment reminders
    const pendingPaymentMatches: any = await ctx.runQuery(internal.matchHelpers.getPendingPaymentMatches);

    const results = [];
    
    for (const match of pendingPaymentMatches) {
      try {
        // Check if payment has been received
        const paymentAttempt = await ctx.runQuery(internal.paymentAttempts.getByMatchId, {
          matchId: match._id,
        });

        if (paymentAttempt) continue; // Payment already received

        const student = await ctx.runQuery(internal.students.getStudentById, {
          studentId: match.studentId,
        });
        const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, {
          preceptorId: match.preceptorId,
        });
        
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
  handler: async (ctx): Promise<any> => {
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    // Get matches that completed in the last 3-7 days
    const recentlyCompletedMatches: any = await ctx.runQuery(internal.matchHelpers.getRecentlyCompletedMatches, {
      daysBack: 7,
    });

    const results = [];
    
    for (const match of recentlyCompletedMatches) {
      try {
        const student = await ctx.runQuery(internal.students.getStudentById, {
          studentId: match.studentId,
        });
        const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, {
          preceptorId: match.preceptorId,
        });
        
        if (!student || !preceptor) continue;

        // Check if surveys have already been submitted
        const existingSurveys = await ctx.runQuery(internal.surveys.getSurveysForMatch, {
          matchId: match._id,
        });

        const hasStudentSurvey = existingSurveys.some((s: any) => s.respondentType === "student");
        const hasPreceptorSurvey = existingSurveys.some((s: any) => s.respondentType === "preceptor");

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentoloop.com";

        // Send survey request emails and SMS if not completed
        if (!hasStudentSurvey || !hasPreceptorSurvey) {
          await ctx.runAction(internal.emails.sendRotationCompleteEmails, {
            studentEmail: student.personalInfo.email,
            studentFirstName: student.personalInfo.fullName.split(' ')[0],
            preceptorEmail: preceptor.personalInfo.email,
            preceptorFirstName: preceptor.personalInfo.fullName.split(' ')[0],
            studentName: student.personalInfo.fullName,
            preceptorName: preceptor.personalInfo.fullName,
            matchId: match._id,
          });
        }

        // Send SMS survey request to student if not completed
        if (!hasStudentSurvey && student.personalInfo.phone) {
          const surveyLink = `${baseUrl}/dashboard/survey?matchId=${match._id}&type=student&partner=${encodeURIComponent(preceptor.personalInfo.fullName)}`;
          
          await ctx.runAction(internal.sms.sendSurveyRequestSMS, {
            phone: student.personalInfo.phone,
            firstName: student.personalInfo.fullName.split(' ')[0],
            surveyLink,
          });
        }

        // Send SMS survey request to preceptor if not completed
        if (!hasPreceptorSurvey && preceptor.personalInfo.mobilePhone) {
          const surveyLink = `${baseUrl}/dashboard/survey?matchId=${match._id}&type=preceptor&partner=${encodeURIComponent(student.personalInfo.fullName)}`;
          
          await ctx.runAction(internal.sms.sendSurveyRequestSMS, {
            phone: preceptor.personalInfo.mobilePhone,
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

// Remove webhook event rows older than 30 days to keep storage tidy
export const cleanupOldWebhookEvents = internalAction({
  handler: async (ctx): Promise<{ deleted: number }> => {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
    let deleted = 0
    // No index on processedAt; scan and delete in batches
    const all = await ctx.runQuery(api.scheduledTasks.listWebhookEvents)
    for (const ev of all) {
      if (ev.processedAt < cutoff) {
        await ctx.runMutation(internal.scheduledTasks.deleteWebhookEvent, { id: ev._id })
        deleted++
      }
    }
    return { deleted }
  }
})

export const listWebhookEvents = query({
  handler: async (ctx) => {
    return await ctx.db.query('webhookEvents').collect()
  }
})

export const deleteWebhookEvent = internalMutation({
  args: { id: v.id('webhookEvents') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  }
})

// Dunning scan: refresh invoice statuses, attempt payment, and record audit entries
export const runDunningScan = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ processed: number; attempts: number; paid: number; failed: number }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) throw new Error('Stripe not configured')

    const now = Date.now()
    const limit = Math.min(Math.max(args.limit ?? 50, 1), 200)

    const db = (ctx as any).db

    // Candidates: invoices that are open or past_due and created in last 180 days
    const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000
    const candidates = await db
      .query('stripeInvoices')
      .withIndex('byStatus', (q: any) => q.eq('status', 'open'))
      .filter((q: any) => q.gte(q.field('createdAt'), sixMonthsAgo))
      .take(Math.floor(limit / 2))

    const pastDue = await db
      .query('stripeInvoices')
      .withIndex('byStatus', (q: any) => q.eq('status', 'past_due'))
      .filter((q: any) => q.gte(q.field('createdAt'), sixMonthsAgo))
      .take(Math.ceil(limit / 2))

    const invoices = [...candidates, ...pastDue]

    let processed = 0
    let attempts = 0
    let paid = 0
    let failed = 0

    for (const inv of invoices) {
      processed++
      // Refresh invoice from Stripe
      try {
        const getResp = await fetch(`https://api.stripe.com/v1/invoices/${inv.stripeInvoiceId}`, {
          headers: { Authorization: `Bearer ${stripeSecretKey}` },
        })
        if (!getResp.ok) continue
        const fresh = await getResp.json()

        // Update local record if status changed
        if (fresh.status && fresh.status !== inv.status) {
          await db.patch(inv._id, {
            status: fresh.status,
            amountPaid: fresh.amount_paid,
            hostedInvoiceUrl: fresh.hosted_invoice_url,
            invoicePdf: fresh.invoice_pdf,
          } as any)
        }

        // Attempt payment if past_due or open with due date passed
        const dueMs = fresh.due_date ? fresh.due_date * 1000 : undefined
        const shouldAttempt = fresh.status === 'past_due' || (fresh.status === 'open' && dueMs && dueMs < now)
        if (shouldAttempt) {
          attempts++
          const payResp = await fetch(`https://api.stripe.com/v1/invoices/${inv.stripeInvoiceId}/pay`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${stripeSecretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
              'Idempotency-Key': `invoice_pay_${inv.stripeInvoiceId}`,
            },
          })
          const ok = payResp.ok
          try {
            await db.insert('paymentsAudit', {
              action: ok ? 'dunning_attempt_paid' : 'dunning_attempt_failed',
              stripeObject: 'invoice',
              stripeId: inv.stripeInvoiceId,
              details: { statusBefore: fresh.status },
              createdAt: Date.now(),
            } as any)
          } catch (_) {}

          if (ok) {
            paid++
          } else {
            failed++
          }
        }
      } catch (_) {
        // ignore individual invoice errors
      }
    }

    return { processed, attempts, paid, failed }
  },
})

// Helper queries for scheduled tasks

export const getUpcomingMatches = query({
  args: {
    threeDaysFromNow: v.number(),
    fourDaysFromNow: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.gte(q.field("rotationDetails.startDate"), new Date(args.threeDaysFromNow).toISOString().split('T')[0]),
          q.lt(q.field("rotationDetails.startDate"), new Date(args.fourDaysFromNow).toISOString().split('T')[0])
        )
      )
      .collect();
  },
});

export const getPendingPaymentMatches = query({
  args: {
    twoDaysAgo: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.gte(q.field("matchedAt"), args.twoDaysAgo)
        )
      )
      .collect();
  },
});

export const getPaymentAttempt = query({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentAttempts")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("matchId"), args.matchId),
          q.eq(q.field("status"), "succeeded")
        )
      )
      .first();
  },
});

export const getRecentlyCompletedMatches = query({
  args: {
    threeDaysAgo: v.number(),
    sevenDaysAgo: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("matches")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("status"), "completed"),
          q.gte(q.field("rotationDetails.endDate"), new Date(args.sevenDaysAgo).toISOString().split('T')[0]),
          q.lte(q.field("rotationDetails.endDate"), new Date(args.threeDaysAgo).toISOString().split('T')[0])
        )
      )
      .collect();
  },
});

export const getSurveysByMatch = query({
  args: {
    matchId: v.id("matches"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("surveys")
      .filter((q: any) => q.eq(q.field("matchId"), args.matchId))
      .collect();
  },
});

export const getUserById = query({
  args: {
    userId: v.union(v.id("students"), v.id("preceptors")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export default crons;
