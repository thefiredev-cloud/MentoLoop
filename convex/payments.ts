import { v } from "convex/values";
import { action, internalAction, internalMutation, internalQuery, query, mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { ConfirmCheckoutSessionManager } from "./services/payments/ConfirmCheckoutSessionManager";
import { idempotencyKeyManager } from "./services/payments/IdempotencyKeyManager";
import { PlanCatalog, type PlanKey } from "./constants/planCatalog";


const MEMBERSHIP_PLAN_KEYS = PlanCatalog.keys();
type MembershipPlanKey = PlanKey;

interface MembershipPlanConfig {
  basePrice: number;
  hours: number;
  envKey?: string;
  fallbackPriceId?: string;
  lookupKeys: string[];
  aliases?: string[];
  testEnvKey?: string;
}

const MEMBERSHIP_PLAN_CONFIG: Record<MembershipPlanKey, MembershipPlanConfig> = PlanCatalog.toMembershipConfig(
  (plan) => ({
    basePrice: plan.basePriceUsd,
    hours: plan.hours ?? 0,
    envKey: plan.stripe.envKey,
    fallbackPriceId: plan.stripe.fallbackPriceId,
    lookupKeys: [...plan.stripe.lookupKeys],
    aliases: plan.aliases ? [...plan.aliases] : undefined,
    testEnvKey: plan.stripe.testEnvKey,
  }),
);

const MEMBERSHIP_PLAN_ALIASES = PlanCatalog.aliasMap();

const resolveMembershipPlan = (plan: string | null | undefined): MembershipPlanKey => PlanCatalog.resolveKey(plan);

const getStudentPriceIds = (): string[] => {
  const ids = new Set<string>();
  MEMBERSHIP_PLAN_KEYS.forEach((key) => {
    const config = MEMBERSHIP_PLAN_CONFIG[key];
    const envPriceId = config.envKey ? process.env[config.envKey] : undefined;
    if (envPriceId) {
      ids.add(envPriceId);
    }
    if (config.fallbackPriceId) {
      ids.add(config.fallbackPriceId);
    }
  });
  return Array.from(ids);
};

const withAudienceMetadata = (metadata: Record<string, string> | undefined, audience = "student") => {
  const result: Record<string, string> = { ...(metadata || {}) };
  if (!result.audience) {
    result.audience = audience;
  }
  if (!result.scope) {
    result.scope = "student_products";
  }
  return result;
};

const normalizeStripeCouponDuration = (
  duration: string | null | undefined,
): "once" | "repeating" | "forever" => {
  if (duration === "repeating" || duration === "forever") {
    return duration;
  }
  return "once";
};

const fetchProductIdsForPrices = async (
  stripeSecretKey: string,
  priceIds: string[],
): Promise<string[]> => {
  const productIds = new Set<string>();

  for (const priceId of priceIds) {
    try {
      const response = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
        },
      });

      if (!response.ok) continue;

      const price = await response.json();
      const product = price?.product;

      if (typeof product === "string") {
        productIds.add(product);
      } else if (product?.id) {
        productIds.add(product.id as string);
      }
    } catch (_error) {
      // If Stripe lookup fails for a specific price, skip it without breaking coupon creation
    }
  }

  return Array.from(productIds);
};

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
        const updateParams: Record<string, string> = {
          name: args.name,
          ...(args.metadata ? Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>) : {}),
        };
        const updateResponse = await fetch(
          `https://api.stripe.com/v1/customers/${customerId}`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${stripeSecretKey}`,
              "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": idempotencyKeyManager.compute("customer_update", args.email, updateParams),
            },
            body: new URLSearchParams(updateParams),
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
        const createParams: Record<string, string> = {
          email: args.email,
          name: args.name,
          ...(args.metadata ? Object.entries(args.metadata).reduce((acc, [key, value]) => {
            acc[`metadata[${key}]`] = value;
            return acc;
          }, {} as Record<string, string>) : {}),
        };
        const createResponse = await fetch("https://api.stripe.com/v1/customers", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": idempotencyKeyManager.compute("customer_create", args.email, createParams),
          },
          body: new URLSearchParams(createParams),
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

// Resolve a Stripe price id from a lookup_key
export const resolvePriceByLookupKey = internalAction({
  args: { lookupKey: v.string() },
  handler: async (_ctx, args): Promise<{ priceId?: string }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) throw new Error("Stripe not configured");
    try {
      const url = `https://api.stripe.com/v1/prices?active=true&limit=1&lookup_keys[]=${encodeURIComponent(args.lookupKey)}`;
      const resp = await fetch(url, { headers: { Authorization: `Bearer ${stripeSecretKey}` } });
      if (!resp.ok) return {};
      const data = await resp.json();
      const id = data?.data?.[0]?.id as string | undefined;
      return id ? { priceId: id } : {};
    } catch {
      return {};
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
    aLaCarteHours: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{ sessionId: string; url: string; discountApplied?: boolean; finalAmount?: number }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    // Validate that Stripe price IDs are configured
    const requiredEnvVars = {
      STRIPE_PRICE_ID_STARTER: process.env.STRIPE_PRICE_ID_STARTER || process.env.STRIPE_PRICE_ID_CORE,
      STRIPE_PRICE_ID_CORE: process.env.STRIPE_PRICE_ID_CORE,
      STRIPE_PRICE_ID_ADVANCED: process.env.STRIPE_PRICE_ID_ADVANCED,
      STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
      STRIPE_PRICE_ID_ELITE: process.env.STRIPE_PRICE_ID_ELITE || process.env.STRIPE_PRICE_ID_PREMIUM,
      STRIPE_PRICE_ID_ALACARTE: process.env.STRIPE_PRICE_ID_ALACARTE,
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

      const membershipPlanKey = resolveMembershipPlan(args.membershipPlan);
      const planConfig = MEMBERSHIP_PLAN_CONFIG[membershipPlanKey];

      const requestedHours = membershipPlanKey === "a_la_carte" ? Math.floor(args.aLaCarteHours ?? 0) : planConfig.hours;
      if (membershipPlanKey === "a_la_carte") {
        if (!Number.isFinite(requestedHours) || requestedHours < 30) {
          throw new Error("A la carte purchases require at least 30 hours");
        }
      }

      // Optional test-mode penny pricing override via env flag
      const testPennyMode = process.env.NEXT_PUBLIC_PAYMENTS_TEST_PENNIES === 'true';
  const testPriceEnvByPlan: Partial<Record<MembershipPlanKey, string | undefined>> = MEMBERSHIP_PLAN_KEYS.reduce(
    (acc, key) => {
      const config = MEMBERSHIP_PLAN_CONFIG[key];
      if (config.testEnvKey) {
        acc[key] = process.env[config.testEnvKey];
      }
      return acc;
    },
    {} as Partial<Record<MembershipPlanKey, string | undefined>>,
  );

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

      const legacyPriceMap: Record<string, string> = {
        'price_1S77IeKVzfTBpytSbMSAb8PK': 'price_1S77IeKVzfTBpytSbMSAb8PK',
        'price_1S77JeKVzfTBpytS1UfSG4Pl': 'price_1S77JeKVzfTBpytS1UfSG4Pl',
        'price_1S77KDKVzfTBpytSnfhEuDMi': 'price_1S77KDKVzfTBpytSnfhEuDMi',
        'price_1S76PAB1lwwjVYGvdx7RQrWr': 'price_1S77IeKVzfTBpytSbMSAb8PK',
        'price_1S76PRB1lwwjVYGv8ZmwrsCx': 'price_1S77JeKVzfTBpytS1UfSG4Pl',
        'price_1S76PkB1lwwjVYGv3Lvp1atU': 'price_1S77KDKVzfTBpytSnfhEuDMi',
      };

      const priceIdMap: Record<string, string> = { ...legacyPriceMap };

      MEMBERSHIP_PLAN_KEYS.forEach((key) => {
        const config = MEMBERSHIP_PLAN_CONFIG[key];
        const envPriceId = config.envKey ? process.env[config.envKey] : undefined;
        const canonicalPriceId = envPriceId || config.fallbackPriceId;
        if (canonicalPriceId) {
          priceIdMap[canonicalPriceId] = canonicalPriceId;
          config.lookupKeys.forEach((lookup) => {
            priceIdMap[lookup] = canonicalPriceId;
          });
        }
      });

      // Start with optional test override
      let stripePriceId: string | undefined = undefined;
      if (testPennyMode && testPriceEnvByPlan[membershipPlanKey]) {
        stripePriceId = testPriceEnvByPlan[membershipPlanKey];
      }
      // Otherwise map provided priceId/lookup
      if (!stripePriceId) {
        stripePriceId = priceIdMap[args.priceId];
      }

      if (!stripePriceId) {
        const lookupCandidates = Array.from(new Set([
          args.priceId,
          ...planConfig.lookupKeys,
        ]));
        let resolved: { priceId?: string } = {};
        for (const lk of lookupCandidates) {
          if (!lk) continue;
          resolved = await (ctx as any).runAction(internal.payments.resolvePriceByLookupKey, { lookupKey: lk });
          if (resolved?.priceId) break;
        }
        if (resolved?.priceId) {
          stripePriceId = resolved.priceId;
        } else {
          throw new Error(`Invalid price or lookup_key: ${args.priceId}`);
        }
      }

      // Special discount code to force one-cent price (for testing/promotions)
      const pennyEnv = process.env.STRIPE_PRICE_ID_ONECENT || process.env.STRIPE_PRICE_ID_PENNY;
      const pennyCodes = ["ONECENT","PENNY","PENNY1","ONE_CENT"];
      let isPennyCode = false;
      if (args.discountCode && pennyCodes.includes(args.discountCode.toUpperCase())) {
        isPennyCode = true;
        if (pennyEnv) {
          stripePriceId = pennyEnv;
        } else {
          // No env price set; lazily create a $0.01 price we can use
          try {
            const productResp = await fetch("https://api.stripe.com/v1/products", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${stripeSecretKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
              "Idempotency-Key": idempotencyKeyManager.compute("product_penny", "1_usd", {}),
              },
              body: new URLSearchParams({
                name: "MentoLoop Penny Charge",
                description: "Synthetic product to support $0.01 promotional checkouts",
                type: "service",
              }),
            });
            const product = productResp.ok ? await productResp.json() : null;

            const priceResp = await fetch("https://api.stripe.com/v1/prices", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${stripeSecretKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Idempotency-Key": idempotencyKeyManager.compute("price_penny", "1_usd", {}),
              },
              body: new URLSearchParams({
                product: product?.id,
                unit_amount: "1",
                currency: "usd",
                billing_scheme: "per_unit",
              }),
            });
            if (priceResp.ok) {
              const pennyPrice = await priceResp.json();
              stripePriceId = pennyPrice.id;
            }
          } catch (_e) {
            // If creation fails, we fall back to normal pricing
            isPennyCode = false;
          }
        }
      }

      // First, create or get the Stripe customer
      const customerResult = await ctx.runAction(internal.payments.createOrUpdateStripeCustomerInternal, {
        email: args.customerEmail,
        name: args.customerName,
        metadata: {
          membershipPlan: membershipPlanKey,
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

      checkoutParams["metadata[membershipPlan]"] = membershipPlanKey;

      // Configure payment based on type (full or installments)
      if (args.paymentOption === "installments" && args.installmentPlan) {
        // Subscription-based installments using pre-configured subscription prices
        const count = args.installmentPlan;
        const upperPlan = membershipPlanKey.toUpperCase();
        const testKey = `STRIPE_TEST_SUB_PRICE_ID_${upperPlan}_${count}` as keyof NodeJS.ProcessEnv;
        const liveKey = `STRIPE_SUB_PRICE_ID_${upperPlan}_${count}` as keyof NodeJS.ProcessEnv;
        const subPriceId = (process.env[testKey] as string | undefined) || (process.env[liveKey] as string | undefined);
        if (!subPriceId) {
          throw new Error(`Missing subscription price for installments: set ${String(testKey)} or ${String(liveKey)}`);
        }

        checkoutParams["mode"] = "subscription";
        checkoutParams["line_items[0][price]"] = subPriceId;
        checkoutParams["line_items[0][quantity]"] = "1";
        checkoutParams["metadata[paymentOption]"] = "installments";
        checkoutParams["metadata[installmentPlan]"] = count.toString();
      } else {
        // Regular one-time payment
        checkoutParams["line_items[0][price]"] = String(stripePriceId);
        if (membershipPlanKey === "a_la_carte") {
          checkoutParams["line_items[0][quantity]"] = requestedHours.toString();
          checkoutParams["metadata[aLaCarteHours]"] = requestedHours.toString();
        } else {
          checkoutParams["line_items[0][quantity]"] = "1";
        }
        checkoutParams["metadata[paymentOption]"] = "full";
        // SCA hardening
        checkoutParams["payment_method_types[0]"] = "card";
        checkoutParams["payment_intent_data[setup_future_usage]"] = "off_session";
      }

      let discountApplied = false;
      let discountAmount = 0;
      // Track whether we are explicitly applying a discount via discounts[] so we do not also set allow_promotion_codes
      let hasExplicitDiscount = false;

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

            if (!isPennyCode) {
              const metadataType = (couponDoc as any)?.metadata?.type || (couponDoc as any)?.metadata?.Type;
              if (typeof metadataType === "string" && metadataType.toLowerCase() === "penny") {
                isPennyCode = true;
              }
            }

            // Applying Stripe discount (skip for penny-code which uses price override)
            if (!isPennyCode) {
              if (promotionCodeId) {
                // Prefer promotion_code for payment mode sessions
                checkoutParams["discounts[0][promotion_code]"] = promotionCodeId;
                hasExplicitDiscount = true;
              } else {
                // Fallback: apply coupon directly (works when coupon id equals code)
                checkoutParams["discounts[0][coupon]"] = stripeCouponId;
                hasExplicitDiscount = true;
              }
            }

            // If we did not explicitly apply a discount, allow manual entry in Checkout
            if (!hasExplicitDiscount) {
              checkoutParams["allow_promotion_codes"] = "true";
            }
            
            discountApplied = true;
            discountAmount = validation.percentOff || 0;
            
            // Add discount info to metadata for tracking
            checkoutParams["metadata[discountCode]"] = stripeCouponId;
            checkoutParams["metadata[discountPercent]"] = discountAmount.toString();
            checkoutParams["metadata[originalPrice]"] = String(stripePriceId);
            
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
            // Invalid discount code. If this is the special NP12345 code, lazily create
            // the Stripe coupon & promotion code on-the-fly to enable 100% off without
            // requiring prior admin initialization.
            const codeUpper = (args.discountCode || '').toUpperCase();
            if (codeUpper === 'NP12345') {
              try {
                const npMetadata = withAudienceMetadata({
                  type: 'np_full_discount',
                });
                const npStudentPriceIds = getStudentPriceIds();
                const npProductIds = await fetchProductIdsForPrices(stripeSecretKey, npStudentPriceIds);

                // Create coupon with fixed ID = NP12345 (idempotent)
                const couponParams = new URLSearchParams({
                  id: codeUpper,
                  percent_off: '100',
                  duration: 'once',
                });
                Object.entries(npMetadata).forEach(([key, value]) => {
                  couponParams.append(`metadata[${key}]`, value);
                });
                npProductIds.forEach((productId, index) => {
                  couponParams.append(`applies_to[products][${index}]`, productId);
                });

                const couponResp = await fetch('https://api.stripe.com/v1/coupons', {
                  method: 'POST',
                  headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Idempotency-Key': idempotencyKeyManager.compute('coupon', codeUpper, {
            percent: '100',
            duration: 'once',
          }),
                  },
                  body: couponParams,
                });
                const couponOk = couponResp.ok;
                const coupon = couponOk ? await couponResp.json() : null;

                // Create a promotion code bound to this coupon with same code (idempotent)
                let promotionCodeId: string | undefined = undefined;
                if (coupon) {
                  const promoParams = new URLSearchParams({
                    coupon: coupon.id,
                    code: codeUpper,
                  });
                  Object.entries(npMetadata).forEach(([key, value]) => {
                    promoParams.append(`metadata[${key}]`, value);
                  });

                  const promoResp = await fetch('https://api.stripe.com/v1/promotion_codes', {
                    method: 'POST',
                    headers: {
                  'Authorization': `Bearer ${stripeSecretKey}`,
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Idempotency-Key': idempotencyKeyManager.compute('promotion', codeUpper, {
                    couponId: coupon.id,
                  }),
                    },
                    body: promoParams,
                  });
                  if (promoResp.ok) {
                    const promo = await promoResp.json();
                    promotionCodeId = promo.id;
                  }
                }

                // Persist in Convex for future validation
                try {
                  await ctx.runMutation(internal.payments.storeCouponDetails, {
                    couponId: coupon?.id || codeUpper,
                    code: codeUpper,
                    percentOff: 100,
                    duration: 'once',
                    promotionCodeId,
                    metadata: npMetadata,
                  } as any);
                } catch (_e) {}

                // Apply discount to checkout (prefer promotion_code)
                if (promotionCodeId) {
                  checkoutParams['discounts[0][promotion_code]'] = promotionCodeId;
                  hasExplicitDiscount = true;
                } else {
                  checkoutParams['discounts[0][coupon]'] = codeUpper;
                  hasExplicitDiscount = true;
                }
                if (!hasExplicitDiscount) {
                  checkoutParams['allow_promotion_codes'] = 'true';
                }

                discountApplied = true;
                discountAmount = 100;
                checkoutParams['metadata[discountCode]'] = codeUpper;
                checkoutParams['metadata[discountPercent]'] = '100';
                checkoutParams['custom_text[submit][message]'] = `${codeUpper} applied — Total $0.00`;
              } catch (_createErr) {
                // If creation fails, proceed without discount
              }
            }
            // Otherwise proceed without discount
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
      
      // Build a stable idempotency key based on the final request parameters to avoid
      // Stripe idempotency errors when params change across retries or different attempts.
      const initialIdempotencyKey = idempotencyKeyManager.compute("intake", args.customerEmail, checkoutParams);

      const makeRequest = async (key: string) => {
        return await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${stripeSecretKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": key,
          },
          body: new URLSearchParams(checkoutParams),
        });
      };

      let response = await makeRequest(initialIdempotencyKey);

      if (!response.ok) {
        const errorText = await response.text();
        // Retry once with a fresh idempotency key if Stripe reports idempotency_error
        let shouldRetry = false;
        try {
          const parsed = JSON.parse(errorText);
          shouldRetry = parsed?.error?.type === "idempotency_error";
        } catch (_e) {
          shouldRetry = /idempotency/i.test(errorText);
        }
        if (shouldRetry) {
          const retryKey = idempotencyKeyManager.compute("intake_retry", args.customerEmail, {
            timestamp: Date.now().toString(),
            priceId: String(stripePriceId || ''),
          });
          response = await makeRequest(retryKey);
          if (!response.ok) {
            const retryErr = await response.text();
            throw new Error(`Stripe API error: ${response.status} - ${retryErr}`);
          }
        } else {
          throw new Error(`Stripe API error: ${response.status} - ${errorText}`);
        }
      }

      const session = await response.json();

      // Log the session response to verify discount application
      // Stripe session created successfully
      
      // Calculate final amount based on discount or penny-code override
      // Reflect LIVE price points used in mapping above for accurate analytics
      const basePrice = planConfig.basePrice;
      // If MENTO12345 (or another penny code) was applied, the final price is $0.01
      if (isPennyCode) {
        discountApplied = true;
        // Compute an effective percent-off purely for analytics/metadata
        discountAmount = Math.max(0, Math.min(100, Math.round((1 - 0.01 / basePrice) * 100)));
        // Emphasize penny total in Checkout UI
        checkoutParams["custom_text[submit][message]"] = `${(args.discountCode || '').toUpperCase()} applied — Total $0.01`;
        // Add discount metadata for downstream analytics
        checkoutParams["metadata[discountCode]"] = (args.discountCode || '').toUpperCase();
        checkoutParams["metadata[discountPercent]"] = discountAmount.toString();
        checkoutParams["allow_promotion_codes"] = "true";
      }
      const finalAmount = isPennyCode
        ? 0.01
        : (discountApplied ? basePrice * (1 - discountAmount / 100) : basePrice);

      // Ensure penny-code exists in Convex for tracking/validation if needed
      if (isPennyCode && args.discountCode) {
        try {
          const existingPenny = await ctx.runQuery(internal.payments.checkCouponExists, {
            code: args.discountCode,
          });
          if (!existingPenny) {
            await ctx.runMutation(internal.payments.storeCouponDetails, {
              couponId: `synthetic_${(args.discountCode || '').toUpperCase()}`,
              code: (args.discountCode || '').toUpperCase(),
              percentOff: discountAmount,
              duration: "once",
              metadata: withAudienceMetadata({
                type: "penny",
                basePrice: basePrice.toString(),
              }),
            });
          }
        } catch (_e) {
          // non-fatal
        }
      }

      // Log the intake payment attempt with discount info
      await ctx.runMutation(internal.payments.logIntakePaymentAttempt, {
        customerEmail: args.customerEmail,
        customerName: args.customerName,
        membershipPlan: membershipPlanKey,
        stripeSessionId: session.id,
        stripePriceId: stripePriceId,
        amount: finalAmount * 100, // Convert to cents
        status: "pending",
        discountCode: discountApplied && args.discountCode ? args.discountCode : undefined,
        discountPercent: discountApplied ? discountAmount : undefined,
        purchasedHours: requestedHours,
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
            stripePriceId: stripePriceId,
            membershipPlan: membershipPlanKey,
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
    const { PaymentCheckoutManager } = await import("./services/payments/PaymentCheckoutManager");
    const manager = new PaymentCheckoutManager();
    return manager.createMatchCheckout(ctx, {
      matchId: args.matchId as any,
      priceId: args.priceId,
      successUrl: args.successUrl,
      cancelUrl: args.cancelUrl,
    });
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
      "Idempotency-Key": idempotencyKeyManager.compute("match", params.matchId, {
        priceId: params.priceId,
      }),
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
    const { PaymentWebhookService } = await import("./services/payments/PaymentWebhookService");
    const service = new PaymentWebhookService();
    return service.handle(ctx, args.payload, args.signature);
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
      stripePriceId: (session.metadata?.originalPrice as string | undefined) || undefined,
      amount: session.amount_total,
      status: "succeeded",
      discountCode: typeof session.metadata?.discountCode === 'string' ? session.metadata.discountCode : undefined,
      discountPercent: session.metadata?.discountPercent ? Number(session.metadata.discountPercent) : undefined,
      currency: (session.currency || session.metadata?.currency) as string | undefined,
      stripeCustomerId: stripeCustomerId || undefined,
    });
    

    // Try to find the user by email with error handling
    let user = null;
    try {
      user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
    } catch (error) {
      // Failed to find user by email
    }

    let receiptUrl: string | undefined;
    let paidAt: number | undefined;
    let confirmedCurrency: string | undefined = session.currency as string | undefined;
    let confirmedAmount: number | undefined = session.amount_total as number | undefined;

    try {
      const paymentIntentId = session.payment_intent as string | undefined;
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      if (paymentIntentId && stripeSecretKey) {
        const resp = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
          },
        });
        if (resp.ok) {
          const paymentIntent = await resp.json();
          receiptUrl = paymentIntent?.charges?.data?.[0]?.receipt_url || undefined;
          confirmedCurrency = (paymentIntent?.currency || confirmedCurrency || 'usd') as string;
          confirmedAmount = (paymentIntent?.amount_received ?? paymentIntent?.amount ?? confirmedAmount) as number | undefined;
          if (paymentIntent?.created) {
            paidAt = Number(paymentIntent.created) * 1000;
          }
        }
      }
    } catch (_paymentIntentError) {
      // Non-blocking: continue with available data
    }

    try {
      await ctx.runMutation(internal.payments.updateIntakePaymentAttemptDetails, {
        stripeSessionId: session.id,
        updates: {
          currency: confirmedCurrency,
          stripeCustomerId: stripeCustomerId || undefined,
          receiptUrl,
          paidAt: paidAt ?? Date.now(),
          amount: confirmedAmount,
          status: "succeeded",
        },
      });
    } catch (updateError) {
      console.error('Failed to update intake payment attempt details:', updateError);
    }

    // Record audit trail for admin visibility (non-blocking)
    try {
      await ctx.runMutation(internal.payments.insertPaymentsAudit, {
        action: "intake_checkout_completed",
        stripeObject: "checkout_session",
        stripeId: session.id,
        details: {
          customerEmail,
          membershipPlan: membershipPlan || 'core',
          amount: confirmedAmount ?? session.amount_total,
          currency: confirmedCurrency ?? session.currency,
          discountCode: session.metadata?.discountCode,
          receiptUrl,
        },
        createdAt: Date.now(),
      });
    } catch (_auditError) {
      // Audit logging best-effort only
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
          paymentStatus: 'paid',
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

async function handleInvoiceEvent(ctx: any, event: any) {
  const invoice = event.data.object;
  try {
    await ctx.db.insert("stripeInvoices", {
      stripeInvoiceId: invoice.id,
      stripeCustomerId: invoice.customer,
      subscriptionId: invoice.subscription || undefined,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
      invoicePdf: invoice.invoice_pdf,
      createdAt: (invoice.created ? invoice.created * 1000 : Date.now()),
      dueDate: invoice.due_date ? invoice.due_date * 1000 : undefined,
      paidAt: invoice.status === "paid" && invoice.status_transitions?.paid_at
        ? invoice.status_transitions.paid_at * 1000
        : undefined,
      metadata: invoice.metadata || {},
    });
  } catch (_e) {
    // if exists, update
    const existing = await ctx.db
      .query("stripeInvoices")
      .withIndex("byInvoiceId", (q: any) => q.eq("stripeInvoiceId", invoice.id))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: invoice.status,
        amountPaid: invoice.amount_paid,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        updatedAt: Date.now(),
      } as any);
    }
  }

  // audit
  try {
    await ctx.db.insert("paymentsAudit", {
      action: `webhook_${event.type}`,
      stripeObject: "invoice",
      stripeId: invoice.id,
      details: { status: invoice.status },
      createdAt: Date.now(),
    });
  } catch (_e) {}

  // Entitlement logic: unlock on first paid invoice for installment subscriptions; revoke on unpaid/canceled
  try {
    const status: string = (invoice.status || '').toString();
    const subscriptionId: string | undefined = invoice.subscription || undefined;
    const customerId: string | undefined = invoice.customer || undefined;
    const paidNow = status === 'paid';

    if (subscriptionId && customerId) {
      // Find the intake payment attempt by customer email (if available) or by customer id
      const stripeCustomerId = customerId.toString();

      // Unlock on first paid invoice
      if (paidNow) {
        try {
          // Lookup user by customer email if present, else by recent attempts
          const customerEmail = invoice.customer_email || invoice.customer_details?.email || undefined;
          if (customerEmail) {
            const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
            if (user) {
              // Mark intake/payment completed and persist linkage
              await ctx.runMutation(internal.students.updateStudentPaymentStatus, {
                userId: user._id,
                paymentStatus: 'paid',
                membershipPlan: (invoice.metadata?.membershipPlan || '').toString(),
                stripeSessionId: (invoice.metadata?.stripeSessionId || '').toString(),
                stripeCustomerId,
                paidAt: Date.now(),
              });
            }
          }
        } catch (_e) {}
      }
    }
  } catch (_e) {}
}

async function handleSubscriptionEvent(ctx: any, event: any) {
  const sub = event.data.object;
  try {
    // upsert
    const existing = await ctx.db
      .query("stripeSubscriptions")
      .withIndex("bySubscriptionId", (q: any) => q.eq("stripeSubscriptionId", sub.id))
      .first();
    const base = {
      stripeSubscriptionId: sub.id,
      stripeCustomerId: sub.customer,
      status: sub.status,
      currentPeriodStart: sub.current_period_start ? sub.current_period_start * 1000 : undefined,
      currentPeriodEnd: sub.current_period_end ? sub.current_period_end * 1000 : undefined,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      canceledAt: sub.canceled_at ? sub.canceled_at * 1000 : undefined,
      defaultPaymentMethod: sub.default_payment_method || undefined,
      priceId: sub.items?.data?.[0]?.price?.id,
      quantity: sub.items?.data?.[0]?.quantity,
      metadata: sub.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any;
    if (existing) {
      await ctx.db.patch(existing._id, base);
    } else {
      await ctx.db.insert("stripeSubscriptions", base);
    }
  } catch (_e) {}

  // audit
  try {
    await ctx.db.insert("paymentsAudit", {
      action: `webhook_${event.type}`,
      stripeObject: "subscription",
      stripeId: sub.id,
      details: { status: sub.status },
      createdAt: Date.now(),
    });
  } catch (_e) {}
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
    stripePriceId: v.optional(v.string()),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
    discountCode: v.optional(v.string()),
    discountPercent: v.optional(v.number()),
    currency: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    purchasedHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const planKey = resolveMembershipPlan(args.membershipPlan);
    const planConfig = MEMBERSHIP_PLAN_CONFIG[planKey];
    const hoursPurchased = args.purchasedHours ?? (planKey === "a_la_carte" ? 0 : planConfig?.hours ?? 0);

    const insertedId = await ctx.db.insert("intakePaymentAttempts", {
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      membershipPlan: planKey,
      stripeSessionId: args.stripeSessionId,
      stripePriceId: args.stripePriceId,
      amount: args.amount,
      status: args.status,
      discountCode: args.discountCode,
      discountPercent: args.discountPercent,
      currency: args.currency,
      stripeCustomerId: args.stripeCustomerId,
      receiptUrl: args.receiptUrl,
      paidAt: args.paidAt ?? (args.status === "succeeded" ? Date.now() : undefined),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Grant hour credits if succeeded
    try {
      if (args.status === "succeeded") {
        const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.customerEmail });
        if (user) {
          const hours = args.purchasedHours ?? planConfig?.hours ?? 0;
          if (hours > 0) {
            const now = Date.now();
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            await ctx.db.insert("hourCredits", {
              userId: user._id,
              source: planKey as any,
              hoursTotal: hours,
              hoursRemaining: hours,
              rolloverAllowed: (args.membershipPlan || '').toLowerCase() !== 'a_la_carte',
              issuedAt: now,
              expiresAt: now + oneYear,
              stripePaymentIntentId: args.stripeSessionId,
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

// Internal mutation to patch existing intake payment attempts by Stripe session id
export const updateIntakePaymentAttemptDetails = internalMutation({
  args: {
    stripeSessionId: v.string(),
    updates: v.object({
      status: v.optional(v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed"))),
      failureReason: v.optional(v.string()),
      amount: v.optional(v.number()),
      currency: v.optional(v.string()),
      stripeCustomerId: v.optional(v.string()),
      receiptUrl: v.optional(v.string()),
      paidAt: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (attempt) {
      await ctx.db.patch(attempt._id, {
        ...args.updates,
        updatedAt: Date.now(),
      } as any);
    }
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
          "Idempotency-Key": idempotencyKeyManager.compute("product", membership.name, {
            description: membership.description,
          }),
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
          "Idempotency-Key": idempotencyKeyManager.compute("price", membership.name, {
            amount: membership.price.toString(),
            stripeProductId: product.id,
          }),
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
          "Idempotency-Key": idempotencyKeyManager.compute("subscription", args.customerId, {
            priceId: args.priceId,
          }),
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

// Create a refund for a PaymentIntent (full or partial) and record audit
export const createRefund = action({
  args: {
    paymentIntentId: v.string(),
    amount: v.optional(v.number()), // cents; omit for full refund
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ refundId: string; status: string }> => {
    const { PaymentRefundManager } = await import("./services/payments/PaymentRefundManager");
    const manager = new PaymentRefundManager();
    return await manager.createRefund(ctx, args);
  },
});

// Resolve Stripe PaymentIntent ID from a Checkout Session ID
export const resolvePaymentIntentIdFromSession = action({
  args: { sessionId: v.string() },
  handler: async (_ctx, args): Promise<{ paymentIntentId?: string }> => {
    const { PaymentSessionResolver } = await import("./services/payments/PaymentSessionResolver");
    const resolver = new PaymentSessionResolver();
    return resolver.resolvePaymentIntentIdFromSession(_ctx, args.sessionId);
  },
});

// Create a Stripe Billing Portal session for the current user
export const createBillingPortalSession = action({
  args: { returnUrl: v.string() },
  handler: async (ctx, args): Promise<{ url: string }> => {
    const { PaymentPortalManager } = await import("./services/payments/PaymentPortalManager");
    const manager = new PaymentPortalManager();
    return manager.createBillingPortalSession(ctx, args.returnUrl);
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
    useCodeAsCouponId: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    try {
      const metadata = withAudienceMetadata(args.metadata);
      const studentPriceIds = getStudentPriceIds();
      const productIds = await fetchProductIdsForPrices(stripeSecretKey, studentPriceIds);

      const couponParams = new URLSearchParams({
        "percent_off": args.percentOff.toString(),
        "duration": args.duration,
      });

      if (args.useCodeAsCouponId !== false) {
        couponParams.append("id", args.code);
      }

      if (args.maxRedemptions) {
        couponParams.append("max_redemptions", args.maxRedemptions.toString());
      }
      if (args.redeemBy) {
        couponParams.append("redeem_by", args.redeemBy.toString());
      }
      Object.entries(metadata).forEach(([key, value]) => {
        couponParams.append(`metadata[${key}]`, value);
      });
      productIds.forEach((productId, index) => {
        couponParams.append(`applies_to[products][${index}]`, productId);
      });

      // Create the coupon with the specified discount
      const couponResponse = await fetch("https://api.stripe.com/v1/coupons", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": idempotencyKeyManager.compute("coupon", args.code, {
            percent: String(args.percentOff ?? 0),
          }),
        },
        body: couponParams,
      });

      if (!couponResponse.ok) {
        const errorText = await couponResponse.text();
        throw new Error(`Stripe API error: ${couponResponse.status} - ${errorText}`);
      }

      const coupon = await couponResponse.json();

      // Create a promotion code that references this coupon
      // This allows customers to enter the code at checkout
      const promoParams = new URLSearchParams({
        "coupon": coupon.id,
        "code": args.code,
      });
      if (args.maxRedemptions) {
        promoParams.append("max_redemptions", args.maxRedemptions.toString());
      }
      Object.entries(metadata).forEach(([key, value]) => {
        promoParams.append(`metadata[${key}]`, value);
      });
      const promoCodeResponse = await fetch("https://api.stripe.com/v1/promotion_codes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Idempotency-Key": idempotencyKeyManager.compute("promotion", args.code, {
            couponId: coupon.id,
          }),
        },
        body: promoParams,
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
        metadata,
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

      const audience = (coupon.metadata?.audience || coupon.metadata?.Audience || '').toLowerCase();
      if (audience && audience !== 'student') {
        return {
          valid: false,
          error: "This discount code is not available for student purchases",
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

// Initialize the MENTO12345 discount code (99.9% off)
export const initializeMentoDiscount999 = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    code?: string;
    couponId?: string;
    promotionCodeId?: string;
  }> => {
    try {
      const code = "MENTO12345";
      // If we previously stored a synthetic penny record, or any existing record, prefer upgrading
      const existing: any = await ctx.runQuery(internal.payments.checkCouponExists, { code });
      if (existing && existing.percentOff === 99.9) {
        return {
          success: true,
          message: `Discount code ${code} already exists at 99.9%`,
          code,
          couponId: existing.couponId,
        };
      }

      // Create a 99.9% coupon + promotion code; use random coupon id to avoid ID collisions
      const result: any = await ctx.runAction(api.payments.createDiscountCoupon, {
        code,
        percentOff: 99.9,
        duration: "once",
        metadata: {
          description: "99.9% off for special promotion",
          type: "mento_999",
          createdBy: "system",
        },
        useCodeAsCouponId: false,
      });

      return {
        success: true,
        message: `Successfully created discount code ${code} with 99.9% off`,
        code,
        couponId: result?.couponId,
        promotionCodeId: result?.promotionCodeId,
      };
    } catch (error) {
      throw new Error(`Failed to initialize ${"MENTO12345"}: ${error instanceof Error ? error.message : "Unknown error"}`);
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

// Initialize the MENTO12345 penny code ($0.01 final price via special handling)
export const initializeMentoPennyCode = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    code?: string;
  }> => {
    try {
      const code = "MENTO12345";
      const existing: any = await ctx.runQuery(internal.payments.checkCouponExists, { code });
      if (existing) {
        return {
          success: true,
          message: `Discount code ${code} already exists`,
          code,
        };
      }

      // Store a synthetic record so validation passes; price override is handled at checkout
      await ctx.runMutation(internal.payments.storeCouponDetails, {
        couponId: `synthetic_${code}`,
        code,
        percentOff: 0,
        duration: "once",
        metadata: { type: "penny" },
      } as any);

      return {
        success: true,
        message: `Successfully initialized ${code} penny discount (final price $0.01 handled in checkout)`,
        code,
      };
    } catch (error) {
      throw new Error(`Failed to initialize MENTO12345: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
    stripePriceId: v.optional(v.string()),
    membershipPlan: v.optional(v.string()),
    amountDiscounted: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("discountUsage", {
      couponId: args.couponId,
      customerEmail: args.customerEmail,
      stripeSessionId: args.stripeSessionId,
      stripePriceId: args.stripePriceId,
      membershipPlan: args.membershipPlan,
      amountDiscounted: args.amountDiscounted,
      usedAt: Date.now(),
    });
  },
});

// Internal mutation to insert audit records
export const insertPaymentsAudit = internalMutation({
  args: {
    action: v.string(),
    stripeObject: v.string(),
    stripeId: v.string(),
    details: v.optional(v.record(v.string(), v.any())),
    userId: v.optional(v.id("users")),
    createdAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("paymentsAudit", {
      action: args.action,
      stripeObject: args.stripeObject,
      stripeId: args.stripeId,
      details: args.details,
      userId: args.userId,
      createdAt: args.createdAt ?? Date.now(),
    });
  },
});

// Internal query to get payment by Stripe payment intent id
export const getPaymentByStripePaymentIntentId = internalQuery({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, { paymentIntentId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("byStripePaymentIntentId", (q) => q.eq("stripePaymentIntentId", paymentIntentId))
      .first();
  },
});

// Internal mutation to patch payment by id
export const patchPayment = internalMutation({
  args: { paymentId: v.id("payments"), updates: v.any() },
  handler: async (ctx, { paymentId, updates }) => {
    await ctx.db.patch(paymentId, updates as any);
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

// Grant zero-cost access using a 100% discount code (e.g., NP12345) without redirecting to Stripe
export const grantZeroCostAccessByCode = mutation({
  args: {
    code: v.string(),
    membershipPlan: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const planKey = resolveMembershipPlan(args.membershipPlan);
    const planConfig = MEMBERSHIP_PLAN_CONFIG[planKey];

    // Validate code from DB
    const coupon = await ctx.runQuery(internal.payments.checkCouponExists, { code: args.code });
    if (!coupon || (coupon as any).percentOff !== 100) {
      throw new Error("Invalid or ineligible discount code");
    }

    // Get user by externalId
    const user = await ctx.runQuery(internal.payments.getUserByExternalId, { externalId: identity.subject });
    if (!user) throw new Error("User not found");

    const email = (user as any).email as string | undefined;
    const now = Date.now();
    const pseudoSessionId = `free_${args.code}_${now}`;

    // Record zero-cost attempt as succeeded
    await ctx.db.insert("intakePaymentAttempts", {
      customerEmail: email || identity.email || "",
      customerName: identity.name || email || "",
      membershipPlan: planKey,
      stripeSessionId: pseudoSessionId,
      stripeCustomerId: undefined,
      amount: 0,
      currency: "usd",
      status: "succeeded",
      discountCode: args.code.toUpperCase(),
      discountPercent: 100,
      paidAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // Mark discount usage
    await ctx.db.insert("discountUsage", {
      couponId: (coupon as any)._id,
      customerEmail: email || identity.email || "",
      stripeSessionId: pseudoSessionId,
      membershipPlan: planKey,
      amountDiscounted: 0,
      usedAt: now,
    });

    // Update user metadata and student payment status
    try {
      await ctx.runMutation(internal.users.updateUserMetadata, {
        userId: (user as any)._id,
        publicMetadata: {
          intakeCompleted: true,
          paymentCompleted: true,
          intakeCompletedAt: new Date(now).toISOString(),
          membershipPlan: planKey,
        },
      });
    } catch (_e) {}

    try {
      await ctx.runMutation(internal.students.updateStudentPaymentStatus, {
        userId: (user as any)._id,
        paymentStatus: 'paid',
        membershipPlan: planKey,
        stripeSessionId: pseudoSessionId,
        paidAt: now,
      } as any);
    } catch (_e) {}

    if (planConfig?.hours) {
      try {
        const existingCredit = await ctx.db
          .query("hourCredits")
          .withIndex("byPaymentIntent", (q) => q.eq("stripePaymentIntentId", pseudoSessionId))
          .first();

        if (!existingCredit) {
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          await ctx.db.insert("hourCredits", {
            userId: (user as any)._id,
            source: planKey as any,
            hoursTotal: planConfig.hours,
            hoursRemaining: planConfig.hours,
            rolloverAllowed: (args.membershipPlan || '').toLowerCase() !== 'a_la_carte',
            issuedAt: now,
            expiresAt: now + oneYear,
            stripePaymentIntentId: pseudoSessionId,
          });
        }
      } catch (creditError) {
        console.error("Failed to grant hour credits for zero-cost access:", creditError);
      }
    }

    return { success: true };
  },
});

// Check if a user has completed payment for intake form access
export const checkUserPaymentStatus = query({
  args: {
    userEmail: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user has any successful intake payment (exclude refunded attempts)
    const successfulPayment = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", args.userEmail))
      .filter((q) => q.and(
        q.eq(q.field("status"), "succeeded"),
        q.or(q.eq(q.field("refunded"), undefined), q.eq(q.field("refunded"), false))
      ))
      .first();

    const rawMembershipPlan = successfulPayment?.membershipPlan || null;
    const normalizedPlan = rawMembershipPlan ? resolveMembershipPlan(rawMembershipPlan) : null;
    const discountPercent = (successfulPayment as any)?.discountPercent as number | undefined;
    const discountCode = ((successfulPayment as any)?.discountCode || "").toString().toUpperCase();

    // Qualifying discounts unlock MentorFit even if plan isn't premium
    const discountUnlock = (discountPercent !== undefined && discountPercent >= 100) ||
      ["NP12345", "MENTO12345"].includes(discountCode);

    const premiumPlanUnlock = normalizedPlan ? normalizedPlan === "elite" : false;
    const mentorfitUnlocked = !!successfulPayment && (premiumPlanUnlock || discountUnlock);

    return {
      hasPayment: !!successfulPayment,
      membershipPlan: normalizedPlan,
      paidAt: successfulPayment?.createdAt || null,
      mentorfitUnlocked,
    } as const;
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
    mentorfitUnlocked: boolean;
  }> => {
    // Get user to find their email
    const user = await ctx.db.get(args.userId);
    if (!user?.email) {
      return { hasPayment: false, membershipPlan: null, paidAt: null, mentorfitUnlocked: false };
    }

    // Check if user has any successful intake payment (exclude refunded attempts)
    const successfulPayment = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", user.email!))
      .filter((q) => q.and(
        q.eq(q.field("status"), "succeeded"),
        q.or(q.eq(q.field("refunded"), undefined), q.eq(q.field("refunded"), false))
      ))
      .first();

    const rawMembershipPlan = successfulPayment?.membershipPlan || null;
    const membershipPlan = rawMembershipPlan ? resolveMembershipPlan(rawMembershipPlan) : null;
    const discountPercent = (successfulPayment as any)?.discountPercent as number | undefined;
    const discountCode = ((successfulPayment as any)?.discountCode || "").toString().toUpperCase();

    const discountUnlock = (discountPercent !== undefined && discountPercent >= 100) ||
      ["NP12345", "MENTO12345"].includes(discountCode);

    const mentorfitUnlocked = !!successfulPayment && (
      (membershipPlan === "elite") || discountUnlock
    );

    return {
      hasPayment: !!successfulPayment,
      membershipPlan,
      paidAt: successfulPayment?.createdAt || null,
      mentorfitUnlocked,
    };
  },
});

// Mark latest intake attempt for a customer as refunded and write audit
export const markIntakeAttemptRefunded = internalMutation({
  args: {
    customerEmail: v.string(),
    reason: v.optional(v.string()),
    invoiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find latest succeeded attempt for this email (exclude already-refunded)
    const latest = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byCustomerEmail", (q) => q.eq("customerEmail", args.customerEmail))
      .filter((q) => q.and(
        q.eq(q.field("status"), "succeeded"),
        q.or(q.eq(q.field("refunded"), undefined), q.eq(q.field("refunded"), false))
      ))
      .order("desc")
      .first();

    if (!latest) return;

    await ctx.db.patch(latest._id, {
      status: "failed",
      refunded: true,
      failureReason: args.reason ? `refunded:${args.reason}` : "refunded",
      updatedAt: Date.now(),
    } as any);

    // Audit log
    try {
      await ctx.runMutation(internal.payments.insertPaymentsAudit, {
        action: "credit_note_created",
        stripeObject: "invoice",
        stripeId: args.invoiceId || "unknown_invoice",
        details: { amount: 1, currency: "usd", customerEmail: args.customerEmail },
      });
    } catch (_err) {
      // no-op; audit best-effort
    }
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

export const patchDiscountCode = internalMutation({
  args: {
    discountCodeId: v.id("discountCodes"),
    couponId: v.optional(v.string()),
    promotionCodeId: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.couponId !== undefined) {
      updates.couponId = args.couponId;
    }
    if (args.promotionCodeId !== undefined) {
      updates.promotionCodeId = args.promotionCodeId;
    }
    if (args.metadata !== undefined) {
      updates.metadata = args.metadata;
    }

    await ctx.db.patch(args.discountCodeId, updates);
  },
});

export const syncDiscountCouponsToStudentProducts = action({
  handler: async (ctx): Promise<{
    success: boolean;
    message: string;
    results: Array<{ code: string; status: string; details?: string }>;
  }> => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("Stripe not configured");
    }

    const studentPriceIds = getStudentPriceIds();
    const studentProductIds = await fetchProductIdsForPrices(stripeSecretKey, studentPriceIds);

    if (studentProductIds.length === 0) {
      return {
        success: false,
        message: "No student product IDs resolved from Stripe prices",
        results: [],
      };
    }

    const discounts = await ctx.runQuery(internal.payments.getAllDiscountCodes);
    const results: Array<{ code: string; status: string; details?: string }> = [];

    for (const discount of discounts) {
      try {
        const metadata = withAudienceMetadata(discount.metadata || undefined);
        let needsRebuild = false;
        let coupon: any = null;

        if (discount.couponId) {
          try {
            const couponResp = await fetch(`https://api.stripe.com/v1/coupons/${discount.couponId}`, {
              headers: {
                Authorization: `Bearer ${stripeSecretKey}`,
              },
            });

            if (couponResp.ok) {
              coupon = await couponResp.json();
            } else {
              needsRebuild = true;
            }
          } catch (_fetchErr) {
            needsRebuild = true;
          }
        } else {
          needsRebuild = true;
        }

        if (coupon) {
          const appliesToProducts: string[] = Array.isArray(coupon?.applies_to?.products)
            ? coupon.applies_to.products
            : [];
          const productSet = new Set(appliesToProducts);
          for (const productId of studentProductIds) {
            if (!productSet.has(productId)) {
              needsRebuild = true;
              break;
            }
          }
          const couponAudience = (coupon.metadata?.audience || "").toLowerCase();
          if (couponAudience && couponAudience !== "student") {
            needsRebuild = true;
          }
        }

        if (!needsRebuild) {
          if (
            !discount.metadata ||
            discount.metadata.audience !== "student" ||
            discount.metadata.scope !== "student_products"
          ) {
            await ctx.runMutation(internal.payments.patchDiscountCode, {
              discountCodeId: discount._id,
              metadata,
            });
          }
          results.push({ code: discount.code, status: "unchanged" });
          continue;
        }

        if (discount.promotionCodeId) {
          try {
            await fetch(`https://api.stripe.com/v1/promotion_codes/${discount.promotionCodeId}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${stripeSecretKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({ active: "false" }),
            });
          } catch (_deactivateErr) {
            // Non-fatal; new promotion code creation may still succeed
          }
        }

        const creationResult: any = await ctx.runAction(api.payments.createDiscountCoupon, {
          code: discount.code,
          percentOff: discount.percentOff,
          duration: normalizeStripeCouponDuration(discount.duration),
          maxRedemptions: discount.maxRedemptions || undefined,
          redeemBy: discount.redeemBy || undefined,
          metadata,
          useCodeAsCouponId: false,
        });

        await ctx.runMutation(internal.payments.patchDiscountCode, {
          discountCodeId: discount._id,
          couponId: creationResult?.couponId,
          promotionCodeId: creationResult?.promotionCodeId,
          metadata,
        });

        results.push({ code: discount.code, status: "recreated" });
      } catch (error) {
        results.push({
          code: discount.code,
          status: "error",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const errorCount = results.filter((r) => r.status === "error").length;
    const recreatedCount = results.filter((r) => r.status === "recreated").length;
    const unchangedCount = results.filter((r) => r.status === "unchanged").length;

    return {
      success: errorCount === 0,
      message: `Recreated: ${recreatedCount}, Up-to-date: ${unchangedCount}, Errors: ${errorCount}`,
      results,
    };
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

// Internal query to get student by userId
export const getStudentByUserId = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("students")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .first();
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

// Update student intake payment attempt status by Stripe session id
export const updateIntakePaymentAttemptStatus = internalMutation({
  args: {
    stripeSessionId: v.string(),
    status: v.union(v.literal("pending"), v.literal("succeeded"), v.literal("failed")),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const attempt = await ctx.db
      .query("intakePaymentAttempts")
      .withIndex("byStripeSessionId", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();
    if (attempt) {
      await ctx.db.patch(attempt._id, {
        status: args.status,
        ...(args.paidAt && { paidAt: args.paidAt }),
        updatedAt: Date.now(),
      } as any);
    }
  },
});

// Public action to confirm checkout session after redirect (immediate unlock UX)
const confirmCheckoutSessionManager: ConfirmCheckoutSessionManager = new ConfirmCheckoutSessionManager({
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  updateMutation: internal.payments.updateIntakePaymentAttemptStatus,
});

export const confirmCheckoutSession = action({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args): Promise<{ confirmed: boolean; source?: string }> => {
    const result = await confirmCheckoutSessionManager.confirmSession(ctx, args.sessionId);
    if (result.confirmed) {
      return { confirmed: true, source: (result as any).source };
    }
    return { confirmed: false };
  },
});
