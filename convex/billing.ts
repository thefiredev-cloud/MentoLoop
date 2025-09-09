import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Get user's current subscription/membership
export const getCurrentSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();
    
    if (!user || user.userType !== "student") return null;

    // Get student record for membership info
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .first();

    if (!student) return null;

    // Map membership plan to subscription details
    const planDetails = {
      core: {
        name: "Core Block",
        price: 695,
        hours: 60,
        billing: "one-time",
        features: [
          "60 clinical hours",
          "Guaranteed preceptor match",
          "Standard support + hour tracking",
          "Bank unused hours within semester"
        ]
      },
      pro: {
        name: "Pro Block",
        price: 1295,
        hours: 120,
        billing: "one-time",
        features: [
          "120 clinical hours",
          "Priority matching (within 14 days)",
          "Extended banking — hours roll across academic year",
          "Access to LoopExchange™ community support",
          "Payment plan available"
        ]
      },
      premium: {
        name: "Premium Block",
        price: 1895,
        hours: 180,
        billing: "one-time",
        features: [
          "180 clinical hours",
          "Top priority matching (within 7 days)",
          "Dedicated support line",
          "Hours valid across full academic year",
          "Bonus MentorFit™ session with preceptor",
          "Payment plan available"
        ]
      }
    };

    const currentPlan = student.membershipPlan || "core";
    const plan = planDetails[currentPlan as keyof typeof planDetails];

    return {
      ...plan,
      status: student.paymentStatus === "paid" ? "active" : "pending",
      memberSince: new Date(student.createdAt).toISOString(),
      nextBillingDate: null, // One-time payment
    };
  },
});

// Get payment history
export const getPaymentHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) return [];

    // Get actual payment records
    const payments = await ctx.db
      .query("payments")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(args.limit || 10);

    // Also get intake payment attempts for this user's email
    const intakePayments = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", user.email || ""))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .order("desc")
      .take(args.limit || 10);

    // Combine and format payment history
    const allPayments = [
      ...payments.map(p => ({
        id: p._id,
        date: new Date(p.createdAt).toISOString().split('T')[0],
        amount: p.amount / 100, // Convert from cents
        status: p.status === "succeeded" ? "paid" as const : p.status,
        description: p.description || "Clinical rotation payment",
        invoice: p.stripePaymentIntentId,
        receiptUrl: p.receiptUrl,
      })),
      ...intakePayments.map(p => ({
        id: p._id,
        date: new Date(p.paidAt || p.createdAt).toISOString().split('T')[0],
        amount: p.amount / 100, // Convert from cents
        status: "paid" as const,
        description: `${p.membershipPlan.charAt(0).toUpperCase() + p.membershipPlan.slice(1)} membership`,
        invoice: p.stripeSessionId,
        receiptUrl: undefined,
      }))
    ];

    // Sort by date and return
    return allPayments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, args.limit || 10);
  },
});

// Get upcoming payments
export const getUpcomingPayments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Since MentoLoop uses one-time payments for hour blocks,
    // there typically won't be upcoming payments
    // This could be used for payment plans in the future
    return [];
  },
});

// Get payment methods
export const getPaymentMethods = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) return [];

    // Get student record for Stripe customer ID
    const student = await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .first();

    if (!student || !student.stripeCustomerId) return [];

    // In production, this would fetch from Stripe API
    // For now, return sample data if customer exists
    return [
      {
        id: "pm_sample",
        type: "card",
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      }
    ];
  },
});

// Download invoice
export const downloadInvoice = mutation({
  args: {
    paymentId: v.id("payments"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const payment = await ctx.db.get(args.paymentId);
    if (!payment) throw new Error("Payment not found");

    // Verify user owns this payment
    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();
    
    if (!user || payment.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Return receipt URL if available
    if (payment.receiptUrl) {
      return { url: payment.receiptUrl };
    }

    // Generate invoice URL (in production, this would generate a PDF)
    return {
      url: `/api/invoices/${payment._id}`,
      message: "Invoice will be downloaded",
    };
  },
});

// Get billing statistics
export const getBillingStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        totalSpent: 0,
        averageTransaction: 0,
        lastPaymentDate: null,
        paymentsThisYear: 0,
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .first();
    
    if (!user) {
      return {
        totalSpent: 0,
        averageTransaction: 0,
        lastPaymentDate: null,
        paymentsThisYear: 0,
      };
    }

    // Get all payments for this user
    const payments = await ctx.db
      .query("payments")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "succeeded"))
      .collect();

    // Calculate statistics
    const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0) / 100;
    const averageTransaction = payments.length > 0 ? totalSpent / payments.length : 0;
    const lastPayment = payments.sort((a, b) => b.createdAt - a.createdAt)[0];
    
    const currentYear = new Date().getFullYear();
    const paymentsThisYear = payments.filter(p => 
      new Date(p.createdAt).getFullYear() === currentYear
    ).length;

    return {
      totalSpent,
      averageTransaction,
      lastPaymentDate: lastPayment ? new Date(lastPayment.createdAt).toISOString() : null,
      paymentsThisYear,
    };
  },
});