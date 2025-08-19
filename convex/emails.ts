import { v } from "convex/values";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Email template definitions based on Build.txt
const EMAIL_TEMPLATES = {
  WELCOME_STUDENT: {
    subject: "Welcome to MentoLoop - Let's Match You with the Right Preceptor!",
    content: `
Hi {{firstName}},

Thanks for joining MentoLoop! We're excited to support your journey and help you find a clinical match aligned with your goals and learning style. 

We've received your intake form and are reviewing your preferences. You'll receive an update when you are matched. In the meantime, feel free to update your profile or contact us with any questions.

Welcome to the loop!
- The MentoLoop Team

Match. Mentor. Master.
    `
  },
  
  WELCOME_PRECEPTOR: {
    subject: "Welcome to MentoLoop - Let's Empower the Next Generation of NPs",
    content: `
Hi {{firstName}},

Thank you for joining MentoLoop! We're thrilled to have you in our growing network of nurse practitioner preceptors committed to mentorship, leadership, and shaping future NPs.

Your profile is now live in our system and being reviewed for upcoming student matches.

What to Expect:
• You'll be matched only with students aligned to your clinical setting, specialty, and mentoring style.
• Our matching algorithm helps ensure strong compatibility from the start.
• You'll receive a match request before we share any details with students.

Thank you again for being part of the loop. You're making a difference.

Welcome to the loop!
The MentoLoop Team

Match. Mentor. Master.
    `
  },

  MATCH_CONFIRMED_STUDENT: {
    subject: "You've Been Matched! Confirm Your Rotation Spot",
    content: `
Hi {{firstName}},

Great news - we've successfully matched you with a preceptor for your upcoming rotation!

Match Details:
• Preceptor: {{preceptorName}}
• Specialty: {{specialty}}
• Location: {{location}}
• Rotation Dates: {{startDate}} - {{endDate}}

To confirm your spot, please submit payment using the secure link below within 3 business days:

{{paymentLink}}

Once payment is received, you'll unlock full access to your preceptor's contact info, prep checklist, and paperwork portal.

Questions? Email us anytime at support@mentoloop.com.

- The MentoLoop Team
Match. Mentor. Master.
    `
  },

  MATCH_CONFIRMED_PRECEPTOR: {
    subject: "Match Confirmed - Here's What's Next",
    content: `
Hi {{firstName}},

You've officially been matched with a student through MentoLoop - thank you for supporting the next generation of nurse practitioners!

Student: {{studentName}}
Rotation Start: {{startDate}}
Setting: {{location}}

Thank you again for being a difference-maker in clinical education!

- The MentoLoop Team
Match. Mentor. Master.
    `
  },

  PAYMENT_RECEIVED: {
    subject: "Payment Received - You're Officially in the Loop!",
    content: `
Hi {{firstName}},

We've received your payment - thank you!
Match Cycle: {{term}}

You'll receive a confirmation packet soon. Let's make this a great rotation!

- The MentoLoop Team
Match. Mentor. Master.
    `
  },

  ROTATION_COMPLETE_STUDENT: {
    subject: "Congrats on Your Rotation! Help Us Improve MentorFit™",
    content: `
Hi {{firstName}},

Congrats on completing your rotation! To keep improving MentorFit™ matches, we need your honest feedback.

👉 Please take 2 minutes to answer 5 quick questions:
{{surveyLink}}

Your responses directly refine our AI so future students (and you!) get even better clinical experiences. 

Thanks for helping us #MatchMentorMaster. Your feedback helps improve MentoLoop for others.

- The MentoLoop Team
Match. Mentor. Master
    `
  },

  ROTATION_COMPLETE_PRECEPTOR: {
    subject: "Thank You for Making a Difference",
    content: `
Hi {{firstName}},

The rotation with your student {{studentName}} is officially complete - and we just wanted to say THANK YOU! 

To finalize the rotation and strengthen our MentorFit™ algorithm, we ask for your brief evaluation.

Complete the 5-question survey here:
{{surveyLink}}

It takes about 2 minutes and helps ensure future matches align with your teaching style and clinic needs. 

We appreciate your partnership in shaping the next generation of NPs!

Thanks for being part of MentoLoop.

The MentoLoop Team
Match. Mentor. Master
    `
  }
};

// Function to replace template variables
function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), value);
  }
  return processed;
}

// Internal mutation to log email sends
export const logEmailSend = internalMutation({
  args: {
    templateKey: v.string(),
    recipientEmail: v.string(),
    recipientType: v.string(),
    subject: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailLogs", {
      templateKey: args.templateKey,
      recipientEmail: args.recipientEmail,
      recipientType: args.recipientType,
      subject: args.subject,
      status: args.status,
      sentAt: Date.now(),
      failureReason: args.failureReason,
    });
  },
});

// SendGrid email sending action
export const sendEmail = action({
  args: {
    to: v.string(),
    templateKey: v.union(
      v.literal("WELCOME_STUDENT"),
      v.literal("WELCOME_PRECEPTOR"), 
      v.literal("MATCH_CONFIRMED_STUDENT"),
      v.literal("MATCH_CONFIRMED_PRECEPTOR"),
      v.literal("PAYMENT_RECEIVED"),
      v.literal("ROTATION_COMPLETE_STUDENT"),
      v.literal("ROTATION_COMPLETE_PRECEPTOR")
    ),
    variables: v.record(v.string(), v.string()),
    fromName: v.optional(v.string()),
    replyTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const template = EMAIL_TEMPLATES[args.templateKey];
    if (!template) {
      throw new Error(`Template ${args.templateKey} not found`);
    }

    const subject = processTemplate(template.subject, args.variables);
    const content = processTemplate(template.content, args.variables);

    // SendGrid API integration
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.error("SendGrid API key not configured");
      throw new Error("Email service not configured");
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: args.to }],
          subject: subject,
        },
      ],
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@mentoloop.com",
        name: args.fromName || "MentoLoop",
      },
      reply_to: {
        email: args.replyTo || "support@mentoloop.com",
        name: "MentoLoop Support",
      },
      content: [
        {
          type: "text/plain",
          value: content,
        },
        {
          type: "text/html",
          value: content.replace(/\n/g, '<br>'),
        },
      ],
    };

    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendGridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("SendGrid API error:", response.status, errorText);
        throw new Error(`Failed to send email: ${response.status}`);
      }

      console.log(`Email sent successfully to ${args.to} with template ${args.templateKey}`);
      
      // Log the successful email send
      await ctx.runMutation(internal.emails.logEmailSend, {
        templateKey: args.templateKey,
        recipientEmail: args.to,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        subject,
        status: "sent",
      });
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending email:", error);
      
      // Log the failed email send
      await ctx.runMutation(internal.emails.logEmailSend, {
        templateKey: args.templateKey,
        recipientEmail: args.to,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        subject,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw new Error("Failed to send email");
    }
  },
});

// Internal action to send welcome emails when users are created
export const sendWelcomeEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
    userType: v.union(v.literal("student"), v.literal("preceptor")),
  },
  handler: async (ctx, args) => {
    const templateKey = args.userType === "student" 
      ? "WELCOME_STUDENT" as const
      : "WELCOME_PRECEPTOR" as const;

    return await ctx.runAction(internal.emails.sendEmail, {
      to: args.email,
      templateKey,
      variables: {
        firstName: args.firstName,
      },
    });
  },
});

// Send match confirmation emails
export const sendMatchConfirmationEmails = internalAction({
  args: {
    studentEmail: v.string(),
    studentFirstName: v.string(),
    preceptorEmail: v.string(),
    preceptorFirstName: v.string(),
    preceptorName: v.string(),
    studentName: v.string(),
    specialty: v.string(),
    location: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    paymentLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Send email to student
    const studentEmailResult = await ctx.runAction(internal.emails.sendEmail, {
      to: args.studentEmail,
      templateKey: "MATCH_CONFIRMED_STUDENT",
      variables: {
        firstName: args.studentFirstName,
        preceptorName: args.preceptorName,
        specialty: args.specialty,
        location: args.location,
        startDate: args.startDate,
        endDate: args.endDate,
        paymentLink: args.paymentLink || "#",
      },
    });

    // Send email to preceptor
    const preceptorEmailResult = await ctx.runAction(internal.emails.sendEmail, {
      to: args.preceptorEmail,
      templateKey: "MATCH_CONFIRMED_PRECEPTOR",
      variables: {
        firstName: args.preceptorFirstName,
        studentName: args.studentName,
        startDate: args.startDate,
        location: args.location,
      },
    });

    return {
      studentEmail: studentEmailResult,
      preceptorEmail: preceptorEmailResult,
    };
  },
});

// Send payment confirmation email
export const sendPaymentConfirmationEmail = internalAction({
  args: {
    email: v.string(),
    firstName: v.string(),
    term: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.runAction(internal.emails.sendEmail, {
      to: args.email,
      templateKey: "PAYMENT_RECEIVED",
      variables: {
        firstName: args.firstName,
        term: args.term,
      },
    });
  },
});

// Send rotation complete emails with survey links
export const sendRotationCompleteEmails = internalAction({
  args: {
    studentEmail: v.string(),
    studentFirstName: v.string(),
    preceptorEmail: v.string(),
    preceptorFirstName: v.string(),
    studentName: v.string(),
    preceptorName: v.string(),
    matchId: v.string(),
  },
  handler: async (ctx, args) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentoloop.com";
    
    const studentSurveyLink = `${baseUrl}/dashboard/survey?matchId=${args.matchId}&type=student&partner=${encodeURIComponent(args.preceptorName)}`;
    const preceptorSurveyLink = `${baseUrl}/dashboard/survey?matchId=${args.matchId}&type=preceptor&partner=${encodeURIComponent(args.studentName)}`;

    // Send email to student
    const studentEmailResult = await ctx.runAction(internal.emails.sendEmail, {
      to: args.studentEmail,
      templateKey: "ROTATION_COMPLETE_STUDENT",
      variables: {
        firstName: args.studentFirstName,
        surveyLink: studentSurveyLink,
      },
    });

    // Send email to preceptor
    const preceptorEmailResult = await ctx.runAction(internal.emails.sendEmail, {
      to: args.preceptorEmail,
      templateKey: "ROTATION_COMPLETE_PRECEPTOR",
      variables: {
        firstName: args.preceptorFirstName,
        studentName: args.studentName,
        surveyLink: preceptorSurveyLink,
      },
    });

    return {
      studentEmail: studentEmailResult,
      preceptorEmail: preceptorEmailResult,
    };
  },
});

// Bulk email action for notifications
export const sendBulkEmail = action({
  args: {
    recipients: v.array(v.object({
      email: v.string(),
      variables: v.record(v.string(), v.string()),
    })),
    templateKey: v.union(
      v.literal("WELCOME_STUDENT"),
      v.literal("WELCOME_PRECEPTOR"), 
      v.literal("MATCH_CONFIRMED_STUDENT"),
      v.literal("MATCH_CONFIRMED_PRECEPTOR"),
      v.literal("PAYMENT_RECEIVED"),
      v.literal("ROTATION_COMPLETE_STUDENT"),
      v.literal("ROTATION_COMPLETE_PRECEPTOR")
    ),
    fromName: v.optional(v.string()),
    replyTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const recipient of args.recipients) {
      try {
        const result = await ctx.runAction(internal.emails.sendEmail, {
          to: recipient.email,
          templateKey: args.templateKey,
          variables: recipient.variables,
          fromName: args.fromName,
          replyTo: args.replyTo,
        });
        results.push({ email: recipient.email, success: true, result });
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.push({ 
          email: recipient.email, 
          success: false, 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return {
      totalSent: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
      results,
    };
  },
});

// Get email analytics
export const getEmailAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    templateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailLogs");
    
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("sentAt"), args.dateRange!.start),
          q.lte(q.field("sentAt"), args.dateRange!.end)
        )
      );
    }
    
    if (args.templateKey) {
      query = query.filter((q) => q.eq(q.field("templateKey"), args.templateKey));
    }
    
    const logs = await query.collect();
    
    const analytics = {
      totalEmails: logs.length,
      successful: logs.filter(log => log.status === "sent").length,
      failed: logs.filter(log => log.status === "failed").length,
      byTemplate: {} as Record<string, { sent: number; failed: number }>,
      byRecipientType: {
        student: { sent: 0, failed: 0 },
        preceptor: { sent: 0, failed: 0 },
        admin: { sent: 0, failed: 0 },
      },
      recentFailures: logs
        .filter(log => log.status === "failed")
        .sort((a, b) => b.sentAt - a.sentAt)
        .slice(0, 10)
        .map(log => ({
          templateKey: log.templateKey,
          recipientEmail: log.recipientEmail,
          failureReason: log.failureReason,
          sentAt: log.sentAt,
        })),
    };
    
    // Group by template
    logs.forEach(log => {
      if (!analytics.byTemplate[log.templateKey]) {
        analytics.byTemplate[log.templateKey] = { sent: 0, failed: 0 };
      }
      analytics.byTemplate[log.templateKey][log.status === "sent" ? "sent" : "failed"]++;
      
      // Group by recipient type
      analytics.byRecipientType[log.recipientType][log.status === "sent" ? "sent" : "failed"]++;
    });
    
    return analytics;
  },
});

// Get email logs for debugging
export const getEmailLogs = query({
  args: {
    limit: v.optional(v.number()),
    templateKey: v.optional(v.string()),
    status: v.optional(v.union(v.literal("sent"), v.literal("failed"), v.literal("pending"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailLogs").order("desc");
    
    if (args.templateKey) {
      query = query.filter((q) => q.eq(q.field("templateKey"), args.templateKey));
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.limit) {
      query = query.take(args.limit);
    } else {
      query = query.take(50); // Default limit
    }
    
    return await query.collect();
  },
});