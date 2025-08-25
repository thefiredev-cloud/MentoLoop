import { v } from "convex/values";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper function to format phone numbers for SMS
function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add +1 if it's a US number (10 digits) and doesn't already have country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  
  // Return as is if it already has proper formatting or is international
  return cleaned.startsWith('+') ? phoneNumber : `+${cleaned}`;
}

// SMS template definitions based on Build.txt (all under 160 chars except survey messages)
const SMS_TEMPLATES = {
  WELCOME_STUDENT: {
    content: `Hi {{firstName}}! 🎉 Welcome to MentoLoop. Your profile's live-watch for match offers soon. Reply HELP for support.`
  },
  
  WELCOME_PRECEPTOR: {
    content: `Hi {{firstName}}! Thanks for joining MentoLoop as a preceptor. Set availability now to receive students. Reply HELP anytime.`
  },
  
  MATCH_CONFIRMED_STUDENT: {
    content: `Great news {{firstName}}-you're matched with {{preceptorName}} at {{site}}. Log in for next steps. See you soon!`
  },
  
  MATCH_CONFIRMED_PRECEPTOR: {
    content: `New student matched: {{studentName}} starting {{startDate}}. Review details in your MentoLoop dashboard. Thanks for mentoring!`
  },
  
  PAYMENT_RECEIVED: {
    content: `Payment received-your rotation with {{preceptorName}} is locked. Receipt emailed. First day {{startDate}}. Good luck!`
  },
  
  ROTATION_COMPLETE_STUDENT: {
    content: `Congrats {{firstName}}! Rotation with {{preceptorName}} completed. Tap this link to rate your rotation with {{preceptorFirstName}}: {{studentSurveyLink}}
Your feedback powers better MentorFit™ matches. Thanks!`
  },
  
  ROTATION_COMPLETE_PRECEPTOR: {
    content: `Hi {{preceptorFirstName}}, MentoLoop thanks you for hosting {{studentFirstName}}. Please share quick feedback (5 Qs, 2 min): {{preceptorSurveyLink}}. Helps us improves future MentorFit™ matching. Appreciate it!`
  },
  
  // Legacy templates (maintain backward compatibility)
  MATCH_CONFIRMATION: {
    content: `🎉 You've been matched! {{studentName}} + {{preceptorName}} for {{specialty}} rotation starting {{startDate}}. Payment link coming via email. - MentoLoop`
  },
  
  PAYMENT_REMINDER: {
    content: `⏰ Reminder: Confirm your rotation spot with {{preceptorName}} by submitting payment within 48 hours. Check your email for the secure link. - MentoLoop`
  },
  
  ROTATION_START_REMINDER: {
    content: `📅 Your rotation with {{partnerName}} starts in 3 days ({{startDate}}). Check your email for prep materials and contact info. Good luck! - MentoLoop`
  },
  
  SURVEY_REQUEST: {
    content: `📝 Your rotation is complete! Help us improve MentorFit™ matches by taking our 2-minute survey: {{surveyLink}} Thanks! - MentoLoop`
  },
  
  WELCOME_CONFIRMATION: {
    content: `Welcome to MentoLoop! 🩺 Your profile is being reviewed for matches. You'll hear from us soon. Questions? Reply HELP or email support@${process.env.EMAIL_DOMAIN || 'mentoloop.com'}`
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

// Internal mutation to log SMS sends
export const logSMSSend = internalMutation({
  args: {
    templateKey: v.string(),
    recipientPhone: v.string(),
    recipientType: v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin")),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    twilioSid: v.optional(v.string()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.db.insert("smsLogs", {
      templateKey: args.templateKey,
      recipientPhone: args.recipientPhone,
      recipientType: args.recipientType,
      message: args.message,
      status: args.status,
      sentAt: Date.now(),
      twilioSid: args.twilioSid,
      failureReason: args.failureReason,
    });
  },
});

// Twilio SMS sending action
export const sendSMS = action({
  args: {
    to: v.string(),
    templateKey: v.union(
      v.literal("MATCH_CONFIRMATION"),
      v.literal("PAYMENT_REMINDER"),
      v.literal("ROTATION_START_REMINDER"),
      v.literal("SURVEY_REQUEST"),
      v.literal("WELCOME_CONFIRMATION")
    ),
    variables: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    const template = SMS_TEMPLATES[args.templateKey];
    if (!template) {
      throw new Error(`SMS template ${args.templateKey} not found`);
    }

    const message = processTemplate(template.content, args.variables);

    // Twilio API integration
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not configured");
      throw new Error("SMS service not configured");
    }

    // Format phone number to E.164 format if needed
    let formattedTo = args.to;
    if (!formattedTo.startsWith('+')) {
      // Assume US number if no country code
      formattedTo = formattedTo.replace(/\D/g, ''); // Remove non-digits
      if (formattedTo.length === 10) {
        formattedTo = `+1${formattedTo}`;
      } else if (formattedTo.length === 11 && formattedTo.startsWith('1')) {
        formattedTo = `+${formattedTo}`;
      }
    }

    const twilioData = new URLSearchParams({
      To: formattedTo,
      From: twilioPhoneNumber,
      Body: message,
    });

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: twilioData.toString(),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Twilio API error:", response.status, errorText);
        throw new Error(`Failed to send SMS: ${response.status}`);
      }

      const result = await response.json();
      console.log(`SMS sent successfully to ${formattedTo} with template ${args.templateKey}`, result.sid);

      // Log the successful SMS send
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: args.templateKey,
        recipientPhone: formattedTo,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        message,
        status: "sent",
        twilioSid: result.sid,
      });

      return { success: true, message: "SMS sent successfully", sid: result.sid };
    } catch (error) {
      console.error("Error sending SMS:", error);
      
      // Log the failed SMS send
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: args.templateKey,
        recipientPhone: formattedTo,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        message,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw new Error("Failed to send SMS");
    }
  },
});

// Internal SMS sending action for other actions to call
export const internalSendSMS = internalAction({
  args: {
    to: v.string(),
    templateKey: v.union(
      v.literal("MATCH_CONFIRMATION"),
      v.literal("PAYMENT_REMINDER"),
      v.literal("ROTATION_START_REMINDER"),
      v.literal("SURVEY_REQUEST"),
      v.literal("WELCOME_CONFIRMATION")
    ),
    variables: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    // Duplicate SMS logic since actions can't call other actions
    const template = SMS_TEMPLATES[args.templateKey];
    if (!template) {
      throw new Error(`Template ${args.templateKey} not found`);
    }

    const message = processTemplate(template.content, args.variables);
    const formattedTo = formatPhoneNumber(args.to);
    
    try {
      // Same Twilio logic as the main sendSMS action
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER!,
          To: formattedTo,
          Body: message,
        }),
      });

      const result = await response.json();
      
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: args.templateKey,
        recipientPhone: formattedTo,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        message,
        status: "sent",
        twilioSid: result.sid,
      });

      return { success: true, message: "SMS sent successfully", sid: result.sid };
    } catch (error) {
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: args.templateKey,
        recipientPhone: formattedTo,
        recipientType: args.templateKey.includes("STUDENT") ? "student" : "preceptor",
        message,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });
      
      throw new Error("Failed to send SMS");
    }
  },
});

// Send welcome SMS when users sign up
export const sendWelcomeSMS = internalAction({
  args: {
    phone: v.string(),
    firstName: v.string(),
    userType: v.union(v.literal("student"), v.literal("preceptor")),
  },
  handler: async (ctx, args): Promise<any> => {
    const template = SMS_TEMPLATES["WELCOME_CONFIRMATION"];
    if (!template) {
      throw new Error("Template WELCOME_CONFIRMATION not found");
    }

    const message = processTemplate(template.content, {
      firstName: args.firstName,
    });

    // Twilio API integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio credentials not configured");
      throw new Error("SMS service not configured");
    }

    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: args.phone,
          Body: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Twilio API error:", response.status, errorText);
        throw new Error(`Failed to send SMS: ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`SMS sent successfully to ${args.phone} with template WELCOME_CONFIRMATION`);

      // Log the successful SMS send
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: "WELCOME_CONFIRMATION",
        recipientPhone: args.phone,
        recipientType: args.userType,
        message,
        status: "sent",
        twilioSid: responseData.sid,
      });

      return { success: true, message: "SMS sent successfully", twilioSid: responseData.sid };
    } catch (error) {
      console.error("Error sending SMS:", error);

      // Log the failed SMS send
      await ctx.runMutation(internal.sms.logSMSSend, {
        templateKey: "WELCOME_CONFIRMATION",
        recipientPhone: args.phone,
        recipientType: args.userType,
        message,
        status: "failed",
        failureReason: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error("Failed to send SMS");
    }
  },
});

// Send match confirmation SMS
export const sendMatchConfirmationSMS = internalAction({
  args: {
    studentPhone: v.string(),
    preceptorPhone: v.string(),
    studentName: v.string(),
    preceptorName: v.string(),
    specialty: v.string(),
    startDate: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    const results = [];

    // Send SMS to student
    try {
      const studentResult: any = await ctx.runAction(internal.sms.internalSendSMS, {
        to: args.studentPhone,
        templateKey: "MATCH_CONFIRMATION",
        variables: {
          studentName: args.studentName,
          preceptorName: args.preceptorName,
          specialty: args.specialty,
          startDate: args.startDate,
        },
      });
      results.push({ recipient: "student", result: studentResult });
    } catch (error) {
      results.push({ recipient: "student", error: error instanceof Error ? error.message : "Failed" });
    }

    // Send SMS to preceptor
    try {
      const preceptorResult = await ctx.runAction(internal.sms.internalSendSMS, {
        to: args.preceptorPhone,
        templateKey: "MATCH_CONFIRMATION",
        variables: {
          studentName: args.studentName,
          preceptorName: args.preceptorName,
          specialty: args.specialty,
          startDate: args.startDate,
        },
      });
      results.push({ recipient: "preceptor", result: preceptorResult });
    } catch (error) {
      results.push({ recipient: "preceptor", error: error instanceof Error ? error.message : "Failed" });
    }

    return results;
  },
});

// Send payment reminder SMS
export const sendPaymentReminderSMS = internalAction({
  args: {
    phone: v.string(),
    studentName: v.string(),
    preceptorName: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runAction(internal.sms.internalSendSMS, {
      to: args.phone,
      templateKey: "PAYMENT_REMINDER",
      variables: {
        studentName: args.studentName,
        preceptorName: args.preceptorName,
      },
    });
  },
});

// Send rotation start reminder SMS
export const sendRotationStartReminderSMS = internalAction({
  args: {
    phone: v.string(),
    partnerName: v.string(),
    startDate: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runAction(internal.sms.internalSendSMS, {
      to: args.phone,
      templateKey: "ROTATION_START_REMINDER",
      variables: {
        partnerName: args.partnerName,
        startDate: args.startDate,
      },
    });
  },
});

// Send survey request SMS
export const sendSurveyRequestSMS = internalAction({
  args: {
    phone: v.string(),
    firstName: v.string(),
    surveyLink: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    return await ctx.runAction(internal.sms.internalSendSMS, {
      to: args.phone,
      templateKey: "SURVEY_REQUEST",
      variables: {
        firstName: args.firstName,
        surveyLink: args.surveyLink,
      },
    });
  },
});

// Bulk SMS action for notifications
export const sendBulkSMS = action({
  args: {
    recipients: v.array(v.object({
      phone: v.string(),
      variables: v.record(v.string(), v.string()),
    })),
    templateKey: v.union(
      v.literal("MATCH_CONFIRMATION"),
      v.literal("PAYMENT_REMINDER"),
      v.literal("ROTATION_START_REMINDER"),
      v.literal("SURVEY_REQUEST"),
      v.literal("WELCOME_CONFIRMATION")
    ),
  },
  handler: async (ctx, args): Promise<any> => {
    const results = [];
    
    for (const recipient of args.recipients) {
      try {
        const result = await ctx.runAction(internal.sms.internalSendSMS, {
          to: recipient.phone,
          templateKey: args.templateKey,
          variables: recipient.variables,
        });
        results.push({ phone: recipient.phone, success: true, result });
      } catch (error) {
        console.error(`Failed to send SMS to ${recipient.phone}:`, error);
        results.push({ 
          phone: recipient.phone, 
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

// Get SMS analytics
export const getSMSAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
    templateKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<any> => {
    let query = ctx.db.query("smsLogs");
    
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
      totalSMS: logs.length,
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
          recipientPhone: log.recipientPhone,
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

// Get all SMS logs
export const getAllSMSLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("smsLogs").order("desc").collect();
  },
});

// Get SMS logs for debugging
export const getSMSLogs = query({
  args: {
    limit: v.optional(v.number()),
    templateKey: v.optional(v.string()),
    status: v.optional(v.union(v.literal("sent"), v.literal("failed"), v.literal("pending"))),
  },
  handler: async (ctx, args): Promise<any[]> => {
    let query = ctx.db.query("smsLogs").order("desc");
    
    if (args.templateKey) {
      query = query.filter((q) => q.eq(q.field("templateKey"), args.templateKey));
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    return await (args.limit ? query.take(args.limit) : query.take(50));
  },
});