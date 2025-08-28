import { v } from "convex/values";
import { action, internalAction, internalMutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Stripe payment processing for student intake
export const createStudentCheckoutSession = action({
  args: {
    priceId: v.string(),
    customerEmail: v.string(),
    customerName: v.string(),
    membershipPlan: v.string(),
    metadata: v.record(v.string(), v.string()),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Map membership plan to actual Stripe price IDs
      const stripePriceIds: Record<string, string> = {
        'price_core': process.env.STRIPE_PRICE_ID_CORE || 'price_1QTLBCRxUy8PQw7tYqMqxQ4M',
        'price_pro': process.env.STRIPE_PRICE_ID_PRO || 'price_1QTLBCRxUy8PQw7tJyyzGNTn',
        'price_premium': process.env.STRIPE_PRICE_ID_PREMIUM || 'price_1QTLBCRxUy8PQw7tCCyJB0sF'
      };

      const actualPriceId = stripePriceIds[args.priceId] || args.priceId;

      // Create Stripe checkout session for student intake
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "mode": "payment",
          "line_items[0][price]": actualPriceId,
          "line_items[0][quantity]": "1",
          "customer_email": args.customerEmail,
          "success_url": args.successUrl,
          "cancel_url": args.cancelUrl,
          ...Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
      }

      const session = await response.json();

      // Log the intake payment attempt
      await ctx.runMutation(internal.payments.logIntakePaymentAttempt, {
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        membershipPlan: args.membershipPlan,
        stripeSessionId: session.id,
        amount: 0, // Will be updated from webhook
        status: "pending",
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url,
      };

    } catch (error) {
      console.error("Failed to create student checkout session:", error);
      throw new Error(`Checkout session creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Stripe payment processing for match confirmations
export const createPaymentSession = action({
  args: {
    matchId: v.id("matches"),
    priceId: v.string(), // Stripe price ID for the rotation package
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Get match details
      const match = await ctx.runQuery(internal.matches.getMatchById, { matchId: args.matchId });
      if (!match) {
        throw new Error("Match not found");
      }

      // Get student and preceptor details
      const student = await ctx.runQuery(internal.students.getStudentById, { studentId: match.studentId });
      const preceptor = await ctx.runQuery(internal.preceptors.getPreceptorById, { preceptorId: match.preceptorId });
      
      if (!student || !preceptor) {
        throw new Error("Student or preceptor not found");
      }

      // Create Stripe checkout session
      const session = await createStripeCheckoutSession({
        stripeSecretKey,
        priceId: args.priceId,
        matchId: args.matchId,
        customerEmail: student.personalInfo?.email || "",
        customerName: student.personalInfo?.fullName || "",
        successUrl: args.successUrl,
        cancelUrl: args.cancelUrl,
        metadata: {
          matchId: args.matchId,
          studentId: match.studentId,
          preceptorId: match.preceptorId,
          rotationType: match.rotationDetails.rotationType,
        }
      });

      // Log payment attempt
      await ctx.runMutation(internal.payments.logPaymentAttempt, {
        matchId: args.matchId,
        stripeSessionId: session.id,
        amount: 0, // Will be updated from webhook
        status: "pending",
      });

      return {
        sessionId: session.id,
        sessionUrl: session.url,
      };

    } catch (error) {
      console.error("Failed to create payment session:", error);
      throw new Error(`Payment session creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

async function createStripeCheckoutSession(params: {
  stripeSecretKey: string;
  priceId: string;
  matchId: string;
  customerEmail: string;
  customerName: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}) {
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${params.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "mode": "payment",
      "line_items[0][price]": params.priceId,
      "line_items[0][quantity]": "1",
      "customer_email": params.customerEmail,
      "success_url": params.successUrl,
      "cancel_url": params.cancelUrl,
      "metadata[matchId]": params.metadata.matchId,
      "metadata[studentId]": params.metadata.studentId,
      "metadata[preceptorId]": params.metadata.preceptorId,
      "metadata[rotationType]": params.metadata.rotationType,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Handle Stripe webhook events
export const handleStripeWebhook = action({
  args: {
    payload: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeWebhookSecret || !stripeSecretKey) {
      throw new Error("Stripe configuration missing");
    }

    try {
      // Verify webhook signature to ensure it's from Stripe
      const verificationResult = await ctx.runAction(internal.paymentsNode.verifyStripeSignature, {
        payload: args.payload,
        signature: args.signature,
        webhookSecret: stripeWebhookSecret,
      });

      if (!verificationResult.verified) {
        throw new Error("Invalid webhook signature");
      }

      // Parse the verified event
      const event = JSON.parse(args.payload);

      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutCompleted(ctx, event.data.object);
          break;
        case "payment_intent.succeeded":
          await handlePaymentSucceeded(ctx, event.data.object);
          break;
        case "payment_intent.payment_failed":
          await handlePaymentFailed(ctx, event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error("Webhook processing failed:", error);
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});


async function handleCheckoutCompleted(ctx: any, session: any) {
  // Check if this is a student intake payment
  if (session.metadata?.membershipPlan && session.metadata?.studentName) {
    console.log("Processing student intake payment completion");
    await handleStudentIntakePaymentCompleted(ctx, session);
    return;
  }

  const matchId = session.metadata?.matchId;
  if (!matchId) {
    console.error("No matchId in session metadata");
    return;
  }

  // Update match payment status
  await ctx.runMutation(internal.matches.updatePaymentStatusInternal, {
    matchId,
    paymentStatus: "paid",
  });

  // Update payment attempt record
  await ctx.runMutation(internal.payments.updatePaymentAttempt, {
    stripeSessionId: session.id,
    status: "succeeded",
    amount: session.amount_total,
    paidAt: Date.now(),
  });

  // Send confirmation emails
  await ctx.runAction(internal.emails.sendPaymentConfirmationEmail, {
    email: session.customer_details?.email || "",
    firstName: session.customer_details?.name?.split(' ')[0] || "",
    term: session.metadata?.rotationType || "rotation",
  });

  // Send match confirmation emails to both parties
  const match = await ctx.runQuery(internal.matches.getMatchById, { matchId });
  if (match) {
    const student = await ctx.db.get(match.studentId);
    const preceptor = await ctx.db.get(match.preceptorId);
    
    if (student && preceptor) {
      await ctx.runAction(internal.emails.sendMatchConfirmationEmails, {
        studentEmail: student.personalInfo?.email || "",
        studentFirstName: student.personalInfo?.fullName?.split(' ')[0] || "",
        preceptorEmail: preceptor.personalInfo?.email || "",
        preceptorFirstName: preceptor.personalInfo?.fullName?.split(' ')[0] || "",
        studentName: student.personalInfo?.fullName || "",
        preceptorName: preceptor.personalInfo?.fullName || "",
        specialty: match.rotationDetails.rotationType,
        location: match.rotationDetails.location || "TBD",
        startDate: match.rotationDetails.startDate,
        endDate: match.rotationDetails.endDate,
      });

      // Send SMS confirmations if available
      if (student.personalInfo?.phone && preceptor.personalInfo?.phone) {
        await ctx.runAction(internal.sms.sendMatchConfirmationSMS, {
          studentPhone: student.personalInfo.phone,
          preceptorPhone: preceptor.personalInfo.phone,
          studentName: student.personalInfo.fullName || "",
          preceptorName: preceptor.personalInfo.fullName || "",
          specialty: match.rotationDetails.rotationType,
          startDate: match.rotationDetails.startDate,
        });
      }
    }
  }
}

async function handleStudentIntakePaymentCompleted(ctx: any, session: any) {
  const { customerEmail, membershipPlan, studentName, school, specialty } = session.metadata || {};
  
  if (!customerEmail) {
    console.error("No customer email in session metadata");
    return;
  }

  try {
    // Find the user by email
    const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
    
    if (user) {
      // Update user metadata in the database
      await ctx.runMutation(internal.users.updateUserMetadata, {
        userId: user._id,
        publicMetadata: {
          intakeCompleted: true,
          paymentCompleted: true,
          intakeCompletedAt: new Date().toISOString(),
          membershipPlan: membershipPlan || 'core',
        }
      });

      // Update student record with payment confirmation
      await ctx.runMutation(internal.students.updateStudentPaymentStatus, {
        userId: user._id,
        paymentStatus: 'completed',
        membershipPlan: membershipPlan || 'core',
        stripeSessionId: session.id,
        paidAt: Date.now(),
      });
      
      // Note: Clerk metadata update happens via server action in the confirmation page
      // or through a separate webhook endpoint
    }

    // Log the intake payment
    await ctx.runMutation(internal.payments.logIntakePaymentAttempt, {
      customerEmail,
      customerName: studentName || '',
      membershipPlan: membershipPlan || 'core',
      stripeSessionId: session.id,
      amount: session.amount_total,
      status: "succeeded",
    });

    // Send welcome email to student
    await ctx.runAction(internal.emails.sendStudentWelcomeEmail, {
      email: customerEmail,
      firstName: studentName?.split(' ')[0] || '',
      membershipPlan: membershipPlan || 'core',
      school: school || '',
      specialty: specialty || '',
    });

    console.log(`Student intake payment completed for ${customerEmail}`);
  } catch (error) {
    console.error("Error processing student intake payment:", error);
    throw error;
  }
}

async function handlePaymentSucceeded(ctx: any, paymentIntent: any) {
  // Additional handling for payment success if needed
  console.log("Payment succeeded:", paymentIntent.id);
}

async function handlePaymentFailed(ctx: any, paymentIntent: any) {
  // Handle payment failure
  console.log("Payment failed:", paymentIntent.id);
  
  // Update payment attempt record
  await ctx.runMutation(internal.payments.updatePaymentAttempt, {
    stripeSessionId: paymentIntent.id,
    status: "failed",
    failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
  });
}

// Internal mutations for payment tracking
export const logPaymentAttempt = internalMutation({
  args: {
    matchId: v.id("matches"),
    stripeSessionId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paymentAttempts", {
      matchId: args.matchId,
      stripeSessionId: args.stripeSessionId,
      amount: args.amount,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

// Log student intake payment attempts
export const logIntakePaymentAttempt = internalMutation({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    membershipPlan: v.string(),
    stripeSessionId: v.string(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("intakePaymentAttempts", {
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      membershipPlan: args.membershipPlan,
      stripeSessionId: args.stripeSessionId,
      amount: args.amount,
      status: args.status,
      createdAt: Date.now(),
    });
  },
});

export const updatePaymentAttempt = internalMutation({
  args: {
    stripeSessionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
    amount: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    failureReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const paymentAttempt = await ctx.db
      .query("paymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    
    if (paymentAttempt) {
      await ctx.db.patch(paymentAttempt._id, {
        status: args.status,
        ...(args.amount && { amount: args.amount }),
        ...(args.paidAt && { paidAt: args.paidAt }),
        ...(args.failureReason && { failureReason: args.failureReason }),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get payment history for a match
export const getPaymentHistory = query({
  args: { matchId: v.id("matches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paymentAttempts")
      .withIndex("byMatchId", (q) => q.eq("matchId", args.matchId))
      .order("desc")
      .collect();
  },
});

// Get payment analytics
export const getPaymentAnalytics = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("paymentAttempts");
    
    if (args.dateRange) {
      query = query.filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), args.dateRange!.start),
          q.lte(q.field("createdAt"), args.dateRange!.end)
        )
      );
    }
    
    const payments = await query.collect();
    
    const analytics = {
      totalAttempts: payments.length,
      successful: payments.filter(p => p.status === "succeeded").length,
      failed: payments.filter(p => p.status === "failed").length,
      pending: payments.filter(p => p.status === "pending").length,
      totalRevenue: payments
        .filter(p => p.status === "succeeded")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      averageTransactionAmount: 0,
      successRate: 0,
    };
    
    analytics.successRate = analytics.totalAttempts > 0 
      ? (analytics.successful / analytics.totalAttempts) * 100 
      : 0;
      
    analytics.averageTransactionAmount = analytics.successful > 0
      ? analytics.totalRevenue / analytics.successful
      : 0;
    
    return analytics;
  },
});

// Create Stripe Connect account for preceptors
export const createPreceptorConnectAccount = action({
  args: {
    email: v.string(),
    returnUrl: v.string(),
    refreshUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Create a Stripe Connect account
      const accountResponse = await fetch("https://api.stripe.com/v1/accounts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "type": "express",
          "country": "US",
          "email": args.email,
          "capabilities[card_payments][requested]": "true",
          "capabilities[transfers][requested]": "true",
        }),
      });

      if (!accountResponse.ok) {
        const errorText = await accountResponse.text();
        throw new Error(`Stripe API error: ${accountResponse.status} - ${errorText}`);
      }

      const account = await accountResponse.json();

      // Create an account link for onboarding
      const accountLinkResponse = await fetch("https://api.stripe.com/v1/account_links", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "account": account.id,
          "return_url": args.returnUrl,
          "refresh_url": args.refreshUrl,
          "type": "account_onboarding",
        }),
      });

      if (!accountLinkResponse.ok) {
        const errorText = await accountLinkResponse.text();
        throw new Error(`Stripe API error: ${accountLinkResponse.status} - ${errorText}`);
      }

      const accountLink = await accountLinkResponse.json();

      return {
        accountId: account.id,
        accountLink: accountLink.url,
      };

    } catch (error) {
      console.error("Failed to create Stripe Connect account:", error);
      throw new Error(`Stripe Connect setup failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Create subscription for recurring payments (future feature)
export const createSubscription = action({
  args: {
    customerId: v.string(),
    priceId: v.string(),
    metadata: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      const response = await fetch("https://api.stripe.com/v1/subscriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "customer": args.customerId,
          "items[0][price]": args.priceId,
          ...Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to create subscription:", error);
      throw new Error(`Subscription creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Get Stripe pricing information
export const getStripePricing = action({
  handler: async () => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      const response = await fetch("https://api.stripe.com/v1/prices?active=true&limit=10", {
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error("Failed to fetch pricing:", error);
      throw new Error(`Pricing fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Check if a user has completed payment for intake form access
export const checkUserPaymentStatus = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has any successful intake payment
    const successfulPayment = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", args.userEmail))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .first();

    return {
      hasPayment: !!successfulPayment,
      membershipPlan: successfulPayment?.membershipPlan || null,
      paidAt: successfulPayment?.createdAt || null,
    };
  },
});

// Check payment status by user ID (for authenticated users)
export const checkUserPaymentByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<{
    hasPayment: boolean;
    membershipPlan: string | null;
    paidAt: number | null;
  }> => {
    // Get user to find their email
    const user = await ctx.db.get(args.userId);
    if (!user?.email) {
      return { hasPayment: false, membershipPlan: null, paidAt: null };
    }

    // Check if user has any successful intake payment
    const successfulPayment = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", user.email!))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .first();

    return {
      hasPayment: !!successfulPayment,
      membershipPlan: successfulPayment?.membershipPlan || null,
      paidAt: successfulPayment?.createdAt || null,
    };
  },
});