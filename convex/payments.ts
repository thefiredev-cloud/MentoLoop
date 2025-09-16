import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Internal action to create or update Stripe customer for a user  
export const createOrUpdateStripeCustomerInternal = internalAction({
  args: {
    email: v.string(),
    name: v.string(),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (_ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // First, check if customer already exists
      const searchResponse = await fetch(
        `https://api.stripe.com/v1/customers/search?query=email:'${args.email}'`,
        {
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
          },
        }
      );

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        throw new Error(`Stripe API error: ${searchResponse.status} - ${errorText}`);
      }

      const searchData = await searchResponse.json();
      
      if (searchData.data && searchData.data.length > 0) {
        // Customer exists, update them
        const customerId = searchData.data[0].id;
        const updateResponse = await fetch(
          `https://api.stripe.com/v1/customers/${customerId}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": `customer_update_${args.email}`,
            },
            body: new URLSearchParams({
              name: args.name,
              ...(args.metadata ? Object.entries(args.metadata).reduce((acc, [key, value]) => {
                acc[`metadata[${key}]`] = value;
                return acc;
              }, {} as Record<string, string>) : {}),
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Stripe API error: ${updateResponse.status} - ${errorText}`);
        }

        const customer = await updateResponse.json();
        return { customerId: customer.id, created: false };
      } else {
        // Create new customer
        const createResponse = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": `customer_create_${args.email}`,
          },
          body: new URLSearchParams({
            email: args.email,
            name: args.name,
            ...(args.metadata ? Object.entries(args.metadata).reduce((acc, [key, value]) => {
              acc[`metadata[${key}]`] = value;
              return acc;
            }, {} as Record<string, string>) : {}),
          }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Stripe API error: ${createResponse.status} - ${errorText}`);
        }

        const customer = await createResponse.json();
        return { customerId: customer.id, created: true };
      }
    } catch (error) {
      // Failed to create/update Stripe customer
      throw new Error(`Customer operation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

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
    discountCode: v.optional(v.string()), // Add discount code support
    paymentOption: v.optional(v.union(v.literal("full"), v.literal("installments"))),
    installmentPlan: v.optional(v.union(v.literal(3), v.literal(4))),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string; discountApplied?: boolean; finalAmount?: number }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    // Validate that Stripe price IDs are configured
    const requiredEnvVars = {
      STRIPE_PRICE_ID_CORE: process.env.STRIPE_PRICE_ID_CORE,
      STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
      STRIPE_PRICE_ID_PREMIUM: process.env.STRIPE_PRICE_ID_PREMIUM
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      // In production, fail fast if price IDs are not provided via env
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required Stripe price environment variables: ${missingVars.join(', ')}`)
      }
      // In non-production, continue with fallbacks
    }

    try {
      // Payment processing started
      
      // Define old/legacy price IDs for detection and mapping
      const oldPriceIds = [
        'price_1S1ylsKVzfTBpytSRBfYbhzd',  // Old Core
        'price_1S1yltKVzfTBpytSoqseGrEF',  // Old Pro
        'price_1S1yltKVzfTBpytSOdNgTEFP'   // Old Premium
      ];
      
      if (oldPriceIds.includes(args.priceId)) {
        // Old price ID detected, will convert
        // Don't throw error - we'll map it to the new ID below
      }
      
      // Map membership plans to actual Stripe price IDs
      const priceIdMap: Record<string, string> = {
        // LIVE price IDs (created January 2025 - Actually LIVE in production)
        'price_1S77IeKVzfTBpytSbMSAb8PK': 'price_1S77IeKVzfTBpytSbMSAb8PK', // Core Block LIVE ($499)
        'price_1S77JeKVzfTBpytS1UfSG4Pl': 'price_1S77JeKVzfTBpytS1UfSG4Pl', // Pro Block LIVE ($799)
        'price_1S77KDKVzfTBpytSnfhEuDMi': 'price_1S77KDKVzfTBpytSnfhEuDMi', // Premium Block LIVE ($999)
        // Previous TEST mode price IDs (now deprecated but mapped to LIVE)
        'price_1S76PAB1lwwjVYGvdx7RQrWr': 'price_1S77IeKVzfTBpytSbMSAb8PK', // Old Test Core -> Live Core
        'price_1S76PRB1lwwjVYGv8ZmwrsCx': 'price_1S77JeKVzfTBpytS1UfSG4Pl', // Old Test Pro -> Live Pro
        'price_1S76PkB1lwwjVYGv3Lvp1atU': 'price_1S77KDKVzfTBpytSnfhEuDMi', // Old Test Premium -> Live Premium
        // Friendly name mapping
        'price_core': process.env.STRIPE_PRICE_ID_CORE || 'price_1S77IeKVzfTBpytSbMSAb8PK',
        'price_pro': process.env.STRIPE_PRICE_ID_PRO || 'price_1S77JeKVzfTBpytS1UfSG4Pl',
        'price_premium': process.env.STRIPE_PRICE_ID_PREMIUM || 'price_1S77KDKVzfTBpytSnfhEuDMi',
        // Legacy mapping - automatically convert old IDs to new ones
        'price_1S1ylsKVzfTBpytSRBfYbhzd': process.env.STRIPE_PRICE_ID_CORE || 'price_1S77IeKVzfTBpytSbMSAb8PK', // Old Core -> Live Core
        'price_1S1yltKVzfTBpytSoqseGrEF': process.env.STRIPE_PRICE_ID_PRO || 'price_1S77JeKVzfTBpytS1UfSG4Pl',  // Old Pro -> Live Pro
        'price_1S1yltKVzfTBpytSOdNgTEFP': process.env.STRIPE_PRICE_ID_PREMIUM || 'price_1S77KDKVzfTBpytSnfhEuDMi' // Old Premium -> Live Premium
      };
      
      // Price ID mapping configured
      
      let stripePriceId = priceIdMap[args.priceId];
      
      // Check if we're doing a legacy conversion
      if (oldPriceIds.includes(args.priceId)) {
        // Legacy price ID converted to current ID
      }
      
      // Stripe price ID selected

      if (!stripePriceId) {
        throw new Error(`Invalid price ID: ${args.priceId}`);
      }

      // Special discount code to force one-cent price (for testing/promotions)
      const pennyEnv = process.env.STRIPE_PRICE_ID_ONECENT || process.env.STRIPE_PRICE_ID_PENNY;
      const pennyCodes = ["ONECENT","PENNY","PENNY1","ONE_CENT"];
      if (args.discountCode && pennyEnv && pennyCodes.includes(args.discountCode.toUpperCase())) {
        stripePriceId = pennyEnv;
      }

      // First, create or get the Stripe customer
      const customerResult = await ctx.runAction(internal.payments.createOrUpdateStripeCustomerInternal, {
        email: args.customerEmail,
        name: args.customerName,
        metadata: {
          membershipPlan: args.membershipPlan,
        }
      });

      // Prepare checkout session parameters
      const checkoutParams: Record<string, string> = {
        "mode": args.paymentOption === "installments" ? "subscription" : "payment",
        "customer": customerResult.customerId,
        "customer_update[address]": "auto",
        "success_url": args.successUrl,
        "cancel_url": args.cancelUrl,
        ...Object.entries(args.metadata).reduce((acc, [key, value]) => {
          acc[`metadata[${key}]`] = value;
          return acc;
        }, {} as Record<string, string>),
      };

      // Configure payment based on type (full or installments)
      if (args.paymentOption === "installments" && args.installmentPlan) {
        // For installments, we'll use Stripe's payment_intent_data with installments configuration
        // Note: This requires setting up installment plans in Stripe Dashboard or using Payment Links
        checkoutParams["mode"] = "payment";
        checkoutParams["line_items[0][price]"] = stripePriceId;
        checkoutParams["line_items[0][quantity]"] = "1";
        checkoutParams["payment_intent_data[metadata][payment_type]"] = "installments";
        checkoutParams["payment_intent_data[metadata][installment_plan]"] = args.installmentPlan.toString();
        checkoutParams["payment_intent_data[metadata][installment_count]"] = args.installmentPlan.toString();
        
        // Add installment info to session metadata
        checkoutParams["metadata[paymentOption]"] = "installments";
        checkoutParams["metadata[installmentPlan]"] = args.installmentPlan.toString();
        
        // Note: Actual installment configuration would require Stripe Payment Links or
        // custom integration with Stripe's installment payment providers
        // Installment payment requested
      } else {
        // Regular one-time payment
        checkoutParams["line_items[0][price]"] = stripePriceId;
        checkoutParams["line_items[0][quantity]"] = "1";
        checkoutParams["metadata[paymentOption]"] = "full";
      }

      let discountApplied = false;
      let discountAmount = 0;

      // Handle discount code if provided
      if (args.discountCode) {
        // Validating discount code
        
        try {
          // Validate the discount code
          const validation = await ctx.runQuery(api.payments.validateDiscountCode, {
            code: args.discountCode,
            email: args.customerEmail,
          });

          if (validation.valid) {
            // Discount validation successful
            
            // Look up coupon details to prefer promotion_code for Checkout
            const couponDoc = await ctx.runQuery(internal.payments.checkCouponExists, {
              code: args.discountCode,
            });
            const stripeCouponId = args.discountCode.toUpperCase();
            const promotionCodeId = (couponDoc as any)?.promotionCodeId as string | undefined;

            // Applying Stripe discount
            if (promotionCodeId) {
              // Prefer promotion_code for payment mode sessions
              checkoutParams["discounts[0][promotion_code]"] = promotionCodeId;
            } else {
              // Fallback: apply coupon directly (works when coupon id equals code)
              checkoutParams["discounts[0][coupon]"] = stripeCouponId;
            }

            // Also enable promotion codes in checkout as a fallback
            // This allows manual entry if automatic application fails
            checkoutParams["allow_promotion_codes"] = "true";
            
            discountApplied = true;
            discountAmount = validation.percentOff || 0;
            
            // Add discount info to metadata for tracking
            checkoutParams["metadata[discountCode]"] = stripeCouponId;
            checkoutParams["metadata[discountPercent]"] = discountAmount.toString();
            checkoutParams["metadata[originalPrice]"] = stripePriceId;
            
            // For 100% discounts, Stripe still requires a payment method type
            if (validation.percentOff === 100) {
              // 100% discount detected
              checkoutParams["payment_method_types[0]"] = "card";
              // Highlight zero total in Checkout UI for reassurance
              checkoutParams["custom_text[submit][message]"] = "NP12345 applied — Total $0.00";
            }
            
            const discountParams = {
              coupon: stripeCouponId,
              percentOff: discountAmount,
              applied: discountApplied
            };
          } else {
            // Invalid discount code
            // Don't throw error, just proceed without discount
          }
        } catch (error) {
          // Error validating discount code
          // Don't throw error, just proceed without discount
          // Proceeding without discount
        }
      }
      
      // Checkout session prepared with appropriate pricing and discounts
      
      // Log the final checkout parameters being sent to Stripe
      // Final checkout params prepared
      
      const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `intake_${args.customerEmail}_${stripePriceId}_${args.discountCode || "none"}`,
        },
        body: new URLSearchParams(checkoutParams),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
      }

      const session = await response.json();

      // Log the session response to verify discount application
      // Stripe session created successfully
      
      // Calculate final amount based on discount
      // Reflect LIVE price points used in mapping above for accurate analytics
      const basePrice = args.membershipPlan === 'core' ? 499 : 
                       args.membershipPlan === 'pro' ? 799 : 999;
      const finalAmount = discountApplied ? basePrice * (1 - discountAmount / 100) : basePrice;

      // Log the intake payment attempt with discount info
      await ctx.runMutation(internal.payments.logIntakePaymentAttempt, {
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        membershipPlan: args.membershipPlan,
        stripeSessionId: session.id,
        amount: finalAmount * 100, // Convert to cents
        status: "pending",
        discountCode: discountApplied && args.discountCode ? args.discountCode : undefined,
        discountPercent: discountApplied ? discountAmount : undefined,
      });

      // Track discount usage if applied
      if (discountApplied && args.discountCode) {
        const coupon = await ctx.runQuery(internal.payments.checkCouponExists, {
          code: args.discountCode,
        });
        
        if (coupon) {
          await ctx.runMutation(internal.payments.trackDiscountUsage, {
            couponId: coupon._id,
            customerEmail: args.customerEmail,
            stripeSessionId: session.id,
            amountDiscounted: basePrice * (discountAmount / 100) * 100, // In cents
          });
        }
      }

      return {
        sessionId: session.id,
        url: session.url,
        discountApplied,
        finalAmount: finalAmount * 100, // Return in cents
      };

    } catch (error) {
      // Failed to create student checkout session
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
        url: session.url,
      };

    } catch (error) {
      // Failed to create payment session
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
      "Idempotency-Key": `match_${params.matchId}_price_${params.priceId}`,
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
      const verificationResult = await ctx.runAction(internal.paymentsNode.verifyStripeSignature, {
        payload: args.payload,
        signature: args.signature,
        webhookSecret: stripeWebhookSecret,
      });

      if (!verificationResult.verified) {
        throw new Error("Invalid webhook signature");
      }

      const event = JSON.parse(args.payload);

      // Idempotency via internal helpers
      const existing = await ctx.runQuery(internal.payments.getWebhookEventByProviderAndId, {
        provider: "stripe",
        eventId: event.id,
      });
      if (existing) {
        return { received: true, duplicate: true };
      }
      const insertedId = await ctx.runMutation(internal.payments.insertWebhookEvent, {
        provider: "stripe",
        eventId: event.id,
      });

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
        case "customer.created":
          await handleCustomerCreated(ctx, event.data.object);
          break;
        case "customer.updated":
          await handleCustomerUpdated(ctx, event.data.object);
          break;
        default:
      }

      await ctx.runMutation(internal.payments.markWebhookEventProcessed, { id: insertedId });
      return { received: true };
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});


async function handleCheckoutCompleted(ctx: any, session: any) {
  // Check if this is a student intake payment
  if (session.metadata?.membershipPlan && session.metadata?.studentName) {
    await handleStudentIntakePaymentCompleted(ctx, session);
    return;
  }

  const matchId = session.metadata?.matchId;
  if (!matchId) {
    // No matchId in session metadata
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

  // Persist final payment details (non-blocking)
  try {
    const paymentIntentId = session.payment_intent;
    const customerEmail = session.customer_details?.email || "";
    if (paymentIntentId && customerEmail) {
      const sk = process.env.STRIPE_SECRET_KEY as string;
      const resp = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: { "Authorization": `Bearer ${sk}` },
      });
      if (resp.ok) {
        const pi = await resp.json();
        const receiptUrl = pi?.charges?.data?.[0]?.receipt_url || undefined;
        const currency = (pi?.currency || session.currency || "usd").toString();
        const amount = (pi?.amount_received ?? session.amount_total) as number;
        const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
        if (user) {
          await ctx.runMutation(internal.payments.insertPaymentRecord, {
            userId: user._id,
            matchId,
            stripePaymentIntentId: paymentIntentId,
            stripeCustomerId: session.customer,
            amount,
            currency,
            status: "succeeded",
            description: session.metadata?.rotationType || "Clinical rotation payment",
            receiptUrl,
          });

          // Create preceptor earning record (pending)
          try {
            const match = await ctx.runQuery(internal.matches.getMatchById, { matchId });
            const preceptorDoc = match ? await ctx.runQuery(internal.preceptors.getPreceptorById, { preceptorId: match.preceptorId }) : null;
            const studentDoc = match ? await ctx.runQuery(internal.students.getStudentById, { studentId: match.studentId }) : null;
            const preceptorUserId = preceptorDoc?.userId;
            const studentUserId = studentDoc?.userId;
            if (preceptorUserId && studentUserId) {
              const percent = Number(process.env.PRECEPTOR_PAYOUT_PERCENT || '0.70');
              const payoutAmount = Math.round((amount as number) * Math.max(0, Math.min(percent, 0.95)));
              await ctx.db.insert("preceptorEarnings", {
                preceptorId: preceptorUserId,
                matchId,
                studentId: studentUserId,
                amount: payoutAmount,
                currency,
                status: "pending",
                description: session.metadata?.rotationType || "Clinical rotation",
                rotationStartDate: match?.rotationDetails?.startDate,
                rotationEndDate: match?.rotationDetails?.endDate,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              });
            }
          } catch (e) {
            console.error("Failed creating preceptor earning:", e);
          }
        }
      }
    }
  } catch (_e) {
    // ignore
  }

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

      // Optional SMS notifications - don't fail if SMS service not configured
      try {
        if (student.personalInfo?.phone && preceptor.personalInfo?.phone) {
          const hasSmsConfig = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
          if (hasSmsConfig) {
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
      } catch (smsError) {
        // SMS notification failed silently
        // Continue without SMS - it's optional
      }
    }
  }
}

async function handleStudentIntakePaymentCompleted(ctx: any, session: any) {
  const { customerEmail, membershipPlan, studentName, school, specialty } = session.metadata || {};
  const stripeCustomerId = session.customer; // Stripe customer ID from the session
  
  if (!customerEmail) {
    // No customer email in session metadata
    return;
  }

  try {
    // Always log the intake payment first (even if user not found yet)
    await ctx.runMutation(internal.payments.logIntakePaymentAttempt, {
      customerEmail,
      customerName: studentName || '',
      membershipPlan: membershipPlan || 'core',
      stripeSessionId: session.id,
      amount: session.amount_total,
      status: "succeeded",
    });
    

    // Try to find the user by email with error handling
    let user = null;
    try {
      user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
    } catch (error) {
      // Failed to find user by email
    }
    
    if (user) {
      
      // Update user metadata in the database with Stripe customer ID
      try {
        await ctx.runMutation(internal.users.updateUserMetadata, {
          userId: user._id,
          publicMetadata: {
            intakeCompleted: true,
            paymentCompleted: true,
            intakeCompletedAt: new Date().toISOString(),
            membershipPlan: membershipPlan || 'core',
            stripeCustomerId: stripeCustomerId,
          }
        });
      } catch (error) {
        // Failed to update user metadata
        // Continue - payment was successful
      }

      // Try to update student record if it exists
      try {
        await ctx.runMutation(internal.students.updateStudentPaymentStatus, {
          userId: user._id,
          paymentStatus: 'completed',
          membershipPlan: membershipPlan || 'core',
          stripeSessionId: session.id,
          stripeCustomerId: stripeCustomerId,
          paidAt: Date.now(),
        });
      } catch (error) {
        // Student record may not exist yet - will be created when intake form is completed
        // This is expected if payment happens before full intake completion
      }
    } else {
      // User not found - payment recorded, user will sync later
    }

    // Send welcome email to student (optional - don't fail if email service is down)
    try {
      await ctx.runAction(internal.emails.sendStudentWelcomeEmail, {
        email: customerEmail,
        firstName: studentName?.split(' ')[0] || '',
        membershipPlan: membershipPlan || 'core',
        school: school || '',
        specialty: specialty || '',
      });
    } catch (emailError) {
      // Failed to send welcome email (non-critical)
      // Don't fail payment processing if email fails
    }

  } catch (error) {
    // Error processing student intake payment
    // Don't throw - payment was successful in Stripe, just log the error
    // The payment has been recorded and will be synced when the user completes intake
  }
}

async function handlePaymentSucceeded(ctx: any, paymentIntent: any) {
  // Additional handling for payment success if needed
  // Payment succeeded
}

async function handlePaymentFailed(ctx: any, paymentIntent: any) {
  // Handle payment failure
  // Payment failed
  
  // Update payment attempt record
  await ctx.runMutation(internal.payments.updatePaymentAttempt, {
    stripeSessionId: paymentIntent.id,
    status: "failed",
    failureReason: paymentIntent.last_payment_error?.message || "Payment failed",
  });
}

async function handleCustomerCreated(ctx: any, customer: any) {
  
  // Find user by email and update with Stripe customer ID
  if (customer.email) {
    try {
      const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customer.email });
      if (user) {
        await ctx.runMutation(internal.users.updateUserMetadata, {
          userId: user._id,
          publicMetadata: {
            stripeCustomerId: customer.id,
          }
        });
      }
    } catch (error) {
      // Failed to update user with Stripe customer ID
    }
  }
}

async function handleCustomerUpdated(ctx: any, customer: any) {
  
  // Sync customer data with user metadata if needed
  if (customer.email) {
    try {
      const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customer.email });
      if (user) {
        // Update any relevant metadata
      }
    } catch (error) {
      // Failed to sync customer update
    }
  }
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
    discountCode: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const insertedId = await ctx.db.insert("intakePaymentAttempts", {
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      membershipPlan: args.membershipPlan,
      stripeSessionId: args.stripeSessionId,
      amount: args.amount,
      status: args.status,
      discountCode: args.discountCode,
      discountPercent: args.discountPercent,
      createdAt: Date.now(),
    });

    // Grant hour credits if succeeded
    try {
      if (args.status === "succeeded") {
        const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.customerEmail });
        if (user) {
          const plan = (args.membershipPlan || '').toLowerCase();
          const planHours: Record<string, number> = { starter: 60, core: 90, pro: 180, elite: 240 };
          const hours = planHours[plan] || 0;
          if (hours > 0) {
            const now = Date.now();
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            await ctx.db.insert("hourCredits", {
              userId: user._id,
              source: plan as any,
              hoursTotal: hours,
              hoursRemaining: hours,
              rolloverAllowed: plan !== 'a_la_carte',
              issuedAt: now,
              expiresAt: now + oneYear,
              stripePaymentIntentId: undefined,
            });
          }
        }
      }
    } catch (e) {
      console.error("Failed to grant hour credits:", e);
    }

    return insertedId;
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

// Internal mutation to insert a finalized payment record (to be called from actions)
export const insertPaymentRecord = internalMutation({
  args: {
    userId: v.id("users"),
    matchId: v.optional(v.id("matches")),
    stripePaymentIntentId: v.string(),
    stripeCustomerId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("succeeded"), v.literal("refunded"), v.literal("partially_refunded")),
    description: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      userId: args.userId,
      matchId: args.matchId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      stripeCustomerId: args.stripeCustomerId,
      amount: args.amount,
      currency: args.currency,
      status: args.status,
      description: args.description,
      receiptUrl: args.receiptUrl,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
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

// Removed Stripe Connect for preceptors - they are paid BY MentoLoop, not payment processors

// Create Stripe products and prices for membership tiers
export const createMembershipProducts = action({
  handler: async () => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      const memberships = [
        {
          name: "Core Membership",
          description: "60 hours of clinical rotation support with basic matching services",
          price: 69500, // $695.00 in cents
        },
        {
          name: "Pro Membership", 
          description: "120 hours of clinical rotation support with priority matching",
          price: 129500, // $1,295.00 in cents
        },
        {
          name: "Premium Membership",
          description: "180 hours of clinical rotation support with premium matching and dedicated support",
          price: 189500, // $1,895.00 in cents
        }
      ];

      const results = [];

      for (const membership of memberships) {
        // Create product
        const productResponse = await fetch("https://api.stripe.com/v1/products", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": `product_${membership.name.replace(/\s+/g, '_').toLowerCase()}`,
          },
          body: new URLSearchParams({
            "name": membership.name,
            "description": membership.description,
            "type": "service",
          }),
        });

        if (!productResponse.ok) {
          const errorText = await productResponse.text();
          throw new Error(`Stripe Product API error: ${productResponse.status} - ${errorText}`);
        }

        const product = await productResponse.json();

        // Create price for the product
        const priceResponse = await fetch("https://api.stripe.com/v1/prices", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": `price_${membership.name.replace(/\s+/g, '_').toLowerCase()}_${membership.price}`,
          },
          body: new URLSearchParams({
            "product": product.id,
            "unit_amount": membership.price.toString(),
            "currency": "usd",
            "billing_scheme": "per_unit",
          }),
        });

        if (!priceResponse.ok) {
          const errorText = await priceResponse.text();
          throw new Error(`Stripe Price API error: ${priceResponse.status} - ${errorText}`);
        }

        const price = await priceResponse.json();

        results.push({
          membershipTier: membership.name,
          productId: product.id,
          priceId: price.id,
          amount: membership.price,
          description: membership.description,
        });
      }

      return results;
    } catch (error) {
      // Failed to create membership products
      throw new Error(`Membership products creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
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
          "Idempotency-Key": `subscription_${args.customerId}_${args.priceId}`,
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
      // Failed to create subscription
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
      // Failed to fetch pricing
      throw new Error(`Pricing fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Create a discount coupon in Stripe
export const createDiscountCoupon = action({
  args: {
    code: v.string(),
    percentOff: v.number(),
    duration: v.union(v.literal("once"), v.literal("repeating"), v.literal("forever")),
    maxRedemptions: v.optional(v.number()),
    redeemBy: v.optional(v.number()), // Unix timestamp for expiration
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      // Create the coupon with the specified discount
      const couponResponse = await fetch("https://api.stripe.com/v1/coupons", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `coupon_${args.code}`,
        },
        body: new URLSearchParams({
          "id": args.code,
          "percent_off": args.percentOff.toString(),
          "duration": args.duration,
          ...(args.maxRedemptions && { "max_redemptions": args.maxRedemptions.toString() }),
          ...(args.redeemBy && { "redeem_by": args.redeemBy.toString() }),
          ...(args.metadata && Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>)),
        }),
      });

      if (!couponResponse.ok) {
        const errorText = await couponResponse.text();
        throw new Error(`Stripe API error: ${couponResponse.status} - ${errorText}`);
      }

      const coupon = await couponResponse.json();

      // Create a promotion code that references this coupon
      // This allows customers to enter the code at checkout
      const promoCodeResponse = await fetch("https://api.stripe.com/v1/promotion_codes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": `promotion_${args.code}`,
        },
        body: new URLSearchParams({
          "coupon": coupon.id,
          "code": args.code,
          ...(args.maxRedemptions && { "max_redemptions": args.maxRedemptions.toString() }),
          ...(args.metadata && Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>)),
        }),
      });

      let promotionCode = null;
      if (promoCodeResponse.ok) {
        promotionCode = await promoCodeResponse.json();
      } else {
        // Log warning but don't fail - coupon still works
        const errorText = await promoCodeResponse.text();
        console.warn(`Failed to create promotion code: ${errorText}`);
      }

      // Store coupon in database for tracking
      await ctx.runMutation(internal.payments.storeCouponDetails, {
        couponId: coupon.id,
        code: args.code,
        percentOff: args.percentOff,
        duration: args.duration,
        maxRedemptions: args.maxRedemptions,
        redeemBy: args.redeemBy,
        metadata: args.metadata,
        promotionCodeId: promotionCode?.id,
      });

      return {
        success: true,
        couponId: coupon.id,
        promotionCodeId: promotionCode?.id,
        code: args.code,
        percentOff: args.percentOff,
      };
    } catch (error) {
      // Failed to create discount coupon
      throw new Error(`Coupon creation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Validate a discount code
export const validateDiscountCode = query({
  args: {
    code: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Check if the code exists in our database
      const coupon = await ctx.db
        .query("discountCodes")
        .withIndex("byCode", (q) => q.eq("code", args.code.toUpperCase()))
        .first();

      if (!coupon) {
        return {
          valid: false,
          error: "Invalid discount code",
        };
      }

      // Check if coupon is expired
      if (coupon.redeemBy && coupon.redeemBy < Date.now()) {
        return {
          valid: false,
          error: "This discount code has expired",
        };
      }

      // Check redemption limit
      if (coupon.maxRedemptions) {
        const redemptions = await ctx.db
          .query("discountUsage")
          .withIndex("byCouponId", (q) => q.eq("couponId", coupon._id))
          .collect();

        if (redemptions.length >= coupon.maxRedemptions) {
          return {
            valid: false,
            error: "This discount code has reached its usage limit",
          };
        }
      }

      // Check if user has already used this code (if email provided)
      if (args.email) {
        const existingUsage = await ctx.db
          .query("discountUsage")
          .withIndex("byCouponAndEmail", (q) => 
            q.eq("couponId", coupon._id).eq("customerEmail", args.email!)
          )
          .first();

        if (existingUsage) {
          return {
            valid: false,
            error: "You have already used this discount code",
          };
        }
      }

      return {
        valid: true,
        percentOff: coupon.percentOff,
        code: coupon.code,
        description: `${coupon.percentOff}% off`,
      };
    } catch (error) {
      // Error validating discount code
      return {
        valid: false,
        error: "Unable to validate discount code. Please try again.",
      };
    }
  },
});

// Initialize the NP12345 discount code (100% off)
export const initializeNPDiscountCode = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    couponId?: string;
    code?: string;
    percentOff?: number;
  }> => {
    try {
      // Check if the code already exists
      const existingCoupon: any = await ctx.runQuery(internal.payments.checkCouponExists, {
        code: "NP12345",
      });

      if (existingCoupon) {
        return {
          success: true,
          message: "Discount code NP12345 already exists",
          couponId: existingCoupon.couponId,
        };
      }

      // Create the 100% off coupon
      const result: any = await ctx.runAction(api.payments.createDiscountCoupon, {
        code: "NP12345",
        percentOff: 100,
        duration: "once",
        metadata: {
          description: "100% off for special NP students",
          createdBy: "system",
        },
      });

      return {
        success: true,
        message: "Successfully created discount code NP12345 with 100% off",
        ...result,
      };
    } catch (error) {
      // Failed to initialize NP discount code
      throw new Error(`Failed to initialize discount code: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Initialize all discount codes (NP12345, MENTO10, MENTO25)
export const initializeAllDiscountCodes = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    codes: Array<{ code: string; percentOff: number; status: string }>;
  }> => {
    const discountCodes = [
      {
        code: "NP12345",
        percentOff: 100,
        description: "100% off for special NP students",
      },
      {
        code: "MENTO10",
        percentOff: 10,
        description: "10% off membership",
      },
      {
        code: "MENTO25",
        percentOff: 25,
        description: "25% off membership",
      },
    ];

    const results = [];

    for (const discount of discountCodes) {
      try {
        // Check if the code already exists
        const existingCoupon: any = await ctx.runQuery(internal.payments.checkCouponExists, {
          code: discount.code,
        });

        if (existingCoupon) {
          results.push({
            code: discount.code,
            percentOff: discount.percentOff,
            status: "already_exists",
          });
          // Discount code already exists
        } else {
          // Create the coupon
          await ctx.runAction(api.payments.createDiscountCoupon, {
            code: discount.code,
            percentOff: discount.percentOff,
            duration: "once",
            metadata: {
              description: discount.description,
              createdBy: "system",
            },
          });

          results.push({
            code: discount.code,
            percentOff: discount.percentOff,
            status: "created",
          });
          // Discount code created successfully
        }
      } catch (error) {
        // Failed to create discount code
        results.push({
          code: discount.code,
          percentOff: discount.percentOff,
          status: "failed",
        });
      }
    }

    const createdCount = results.filter(r => r.status === "created").length;
    const existingCount = results.filter(r => r.status === "already_exists").length;
    const failedCount = results.filter(r => r.status === "failed").length;

    return {
      success: failedCount === 0,
      message: `Created: ${createdCount}, Already exist: ${existingCount}, Failed: ${failedCount}`,
      codes: results,
    };
  },
});

// Internal mutation to store coupon details
export const storeCouponDetails = internalMutation({
  args: {
    couponId: v.string(),
    code: v.string(),
    percentOff: v.number(),
    duration: v.string(),
    maxRedemptions: v.optional(v.number()),
    redeemBy: v.optional(v.number()),
    metadata: v.optional(v.record(v.string(), v.string())),
    promotionCodeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discountCodes", {
      couponId: args.couponId,
      code: args.code.toUpperCase(),
      percentOff: args.percentOff,
      duration: args.duration,
      maxRedemptions: args.maxRedemptions,
      redeemBy: args.redeemBy,
      metadata: args.metadata,
      promotionCodeId: args.promotionCodeId,
      createdAt: Date.now(),
      active: true,
    });
  },
});

// Internal query to check if coupon exists
export const checkCouponExists = internalQuery({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("discountCodes")
      .withIndex("byCode", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

// Track discount code usage
export const trackDiscountUsage = internalMutation({
  args: {
    couponId: v.id("discountCodes"),
    customerEmail: v.string(),
    stripeSessionId: v.string(),
    amountDiscounted: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discountUsage", {
      couponId: args.couponId,
      customerEmail: args.customerEmail,
      stripeSessionId: args.stripeSessionId,
      amountDiscounted: args.amountDiscounted,
      usedAt: Date.now(),
    });
  },
});

// Public action to create or update Stripe customer
export const createOrUpdateStripeCustomer = action({
  args: {
    email: v.string(),
    name: v.string(),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args): Promise<{ customerId: string; created: boolean }> => {
    return await ctx.runAction(internal.payments.createOrUpdateStripeCustomerInternal, args);
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

// Create promotion codes for existing coupons
export const createPromotionCodesForExistingCoupons = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    results: Array<{ code: string; status: string; promotionCodeId?: string; error?: string }>;
  }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    const results = [];

    try {
      // Get all existing discount codes from database
      const discountCodes = await ctx.runQuery(internal.payments.getAllDiscountCodes);

      for (const discount of discountCodes) {
        // Skip if already has a promotion code
        if (discount.promotionCodeId) {
          results.push({
            code: discount.code,
            status: "already_has_promotion_code",
            promotionCodeId: discount.promotionCodeId,
          });
          continue;
        }

        try {
          // Create a promotion code for this coupon
          const promoCodeResponse = await fetch("https://api.stripe.com/v1/promotion_codes", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": `promotion_${discount.code}`,
            },
            body: new URLSearchParams({
              "coupon": discount.couponId,
              "code": discount.code,
              ...(discount.maxRedemptions && { "max_redemptions": discount.maxRedemptions.toString() }),
            }),
          });

          if (promoCodeResponse.ok) {
            const promotionCode = await promoCodeResponse.json();

            // Update the database with the promotion code ID
            await ctx.runMutation(internal.payments.updateDiscountCodeWithPromotionId, {
              discountCodeId: discount._id,
              promotionCodeId: promotionCode.id,
            });

            results.push({
              code: discount.code,
              status: "created",
              promotionCodeId: promotionCode.id,
            });
          } else {
            const errorText = await promoCodeResponse.text();
            results.push({
              code: discount.code,
              status: "failed",
              error: errorText,
            });
          }
        } catch (error) {
          results.push({
            code: discount.code,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      const createdCount = results.filter(r => r.status === "created").length;
      const existingCount = results.filter(r => r.status === "already_has_promotion_code").length;
      const failedCount = results.filter(r => r.status === "failed" || r.status === "error").length;

      return {
        success: failedCount === 0,
        message: `Created: ${createdCount}, Already exist: ${existingCount}, Failed: ${failedCount}`,
        results,
      };
    } catch (error) {
      throw new Error(`Failed to create promotion codes: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
});

// Internal query to get all discount codes
export const getAllDiscountCodes = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("discountCodes").collect();
  },
});

// Internal mutation to update discount code with promotion ID
export const updateDiscountCodeWithPromotionId = internalMutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    promotionCodeId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.discountCodeId, {
      promotionCodeId: args.promotionCodeId,
      updatedAt: Date.now(),
    });
  },
});

// =====================
// Stripe Connect (Preceptors)
// =====================

export const createPreceptorConnectAccount = action({
  args: {},
  handler: async (ctx): Promise<{ accountId: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.payments.getUserByExternalId, { externalId: identity.subject });
    if (!user) throw new Error("User not found");

    const preceptor = await ctx.runQuery(internal.payments.getPreceptorByUserId, { userId: user._id });
    if (!preceptor) throw new Error("Preceptor profile not found");

    if (preceptor.stripeConnectAccountId) {
      return { accountId: preceptor.stripeConnectAccountId };
    }

    const email = preceptor.personalInfo.email as string;
    const res = await fetch("https://api.stripe.com/v1/accounts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        type: "express",
        business_type: "individual",
        email,
        "capabilities[transfers][requested]": "true",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Stripe error creating account: ${res.status} ${t}`);
    }
    const account = await res.json();

    await ctx.runMutation(internal.payments.patchPreceptor, {
      preceptorId: preceptor._id,
      updates: {
        stripeConnectAccountId: account.id,
        stripeConnectStatus: "onboarding",
        payoutsEnabled: false,
        updatedAt: Date.now(),
      },
    });
    return { accountId: account.id };
  },
});

export const createPreceptorAccountLink = action({
  args: {},
  handler: async (ctx): Promise<{ url: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentoloop.com";

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.payments.getUserByExternalId, { externalId: identity.subject });
    if (!user) throw new Error("User not found");

    let preceptor = await ctx.runQuery(internal.payments.getPreceptorByUserId, { userId: user._id });
    if (!preceptor) throw new Error("Preceptor profile not found");

    if (!preceptor.stripeConnectAccountId) {
      const created = await ctx.runAction(api.payments.createPreceptorConnectAccount, {} as any);
      preceptor = await ctx.runQuery(internal.payments.getPreceptorByUserId, { userId: user._id });
      if (!created?.accountId && !(preceptor && preceptor.stripeConnectAccountId)) {
        throw new Error("Failed to create Connect account");
      }
    }

    const accountId = (preceptor!.stripeConnectAccountId as string);
    const res = await fetch("https://api.stripe.com/v1/account_links", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        account: accountId,
        refresh_url: `${baseUrl}/preceptor-intake/confirmation?stripe_connect=refresh`,
        return_url: `${baseUrl}/preceptor-intake/confirmation?stripe_connect=complete`,
        type: "account_onboarding",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Stripe error creating account link: ${res.status} ${t}`);
    }
    const link = await res.json();
    return { url: link.url };
  },
});

export const refreshPreceptorConnectStatus = action({
  args: {},
  handler: async (ctx): Promise<{ payoutsEnabled: boolean; status: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.payments.getUserByExternalId, { externalId: identity.subject });
    if (!user) throw new Error("User not found");

    const preceptor = await ctx.runQuery(internal.payments.getPreceptorByUserId, { userId: user._id });
    if (!preceptor || !preceptor.stripeConnectAccountId) throw new Error("Connect account not found");

    const res = await fetch(`https://api.stripe.com/v1/accounts/${preceptor.stripeConnectAccountId}`, {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Stripe error retrieving account: ${res.status} ${t}`);
    }
    const account = await res.json();
    const payoutsEnabled = !!account.payouts_enabled;
    const status = payoutsEnabled ? "enabled" : (account.requirements?.disabled_reason ? "restricted" : "onboarding");
    await ctx.runMutation(internal.payments.patchPreceptor, {
      preceptorId: preceptor._id,
      updates: {
        payoutsEnabled,
        stripeConnectStatus: status as any,
        updatedAt: Date.now(),
      },
    });
    return { payoutsEnabled, status };
  },
});

export const payPreceptorEarning = action({
  args: { earningId: v.id("preceptorEarnings") },
  handler: async (ctx, args): Promise<{ success: true; transferId: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");

    const earning = await ctx.runQuery(internal.payments.getPreceptorEarningById, { earningId: args.earningId });
    if (!earning) throw new Error("Earning not found");
    if (earning.status !== "pending") throw new Error("Earning already paid or cancelled");

    const preceptor = await ctx.runQuery(internal.payments.getPreceptorByUserId, { userId: earning.preceptorId });
    if (!preceptor || !preceptor.stripeConnectAccountId) throw new Error("Preceptor Stripe Connect account missing");

    const res = await fetch("https://api.stripe.com/v1/transfers", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(earning.amount),
        currency: earning.currency || "usd",
        destination: preceptor.stripeConnectAccountId,
        description: earning.description || "MentoLoop Preceptor Payout",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Stripe transfer error: ${res.status} ${t}`);
    }
    const transfer = await res.json();

    await ctx.runMutation(internal.payments.patchPreceptorEarning, {
      earningId: args.earningId,
      updates: {
        status: "paid",
        paymentReference: transfer.id,
        paidAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    return { success: true, transferId: transfer.id };
  },
});

// Internal query to check if a webhook event exists
export const getWebhookEventByProviderAndId = internalQuery({
  args: { provider: v.string(), eventId: v.string() },
  handler: async (ctx, { provider, eventId }) => {
    return await ctx.db
      .query("webhookEvents")
      .withIndex("byProviderEvent", (q) => q.eq("provider", provider).eq("eventId", eventId))
      .first();
  },
});

// Internal mutation to insert a webhook event row
export const insertWebhookEvent = internalMutation({
  args: { provider: v.string(), eventId: v.string() },
  handler: async (ctx, { provider, eventId }) => {
    return await ctx.db.insert("webhookEvents", {
      provider,
      eventId,
      processedAt: 0,
    });
  },
});

// Internal mutation to mark a webhook event as processed
export const markWebhookEventProcessed = internalMutation({
  args: { id: v.id("webhookEvents") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { processedAt: Date.now() });
  },
});

// Internal query to get user by externalId (Clerk id)
export const getUserByExternalId = internalQuery({
  args: { externalId: v.string() },
  handler: async (ctx, { externalId }) => {
    return await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
      .unique();
  },
});

// Internal query to get preceptor by userId
export const getPreceptorByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("preceptors")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
  },
});

// Internal mutation to patch a preceptor document
export const patchPreceptor = internalMutation({
  args: { preceptorId: v.id("preceptors"), updates: v.any() },
  handler: async (ctx, { preceptorId, updates }) => {
    await ctx.db.patch(preceptorId, updates as any);
  },
});

// Internal mutation to patch preceptor earning by id
export const patchPreceptorEarning = internalMutation({
  args: { earningId: v.id("preceptorEarnings"), updates: v.any() },
  handler: async (ctx, { earningId, updates }) => {
    await ctx.db.patch(earningId, updates as any);
  },
});

// Internal query to get earning by id
export const getPreceptorEarningById = internalQuery({
  args: { earningId: v.id("preceptorEarnings") },
  handler: async (ctx, { earningId }) => {
    return await ctx.db.get(earningId);
  },
});
