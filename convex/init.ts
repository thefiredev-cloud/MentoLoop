import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Initialize all required database data
export const initializeDatabase = action({
  handler: async (ctx) => {
    const results = {
      discountCodes: { success: false, message: "" },
      stripeProducts: { success: false, message: "" },
    };

    // Initialize discount codes
    try {
      console.log("Initializing discount codes...");
      
      // Check if NP12345 exists
      const np12345Result = await ctx.runAction(api.payments.initializeNPDiscountCode);
      if (np12345Result.success) {
        results.discountCodes.success = true;
        results.discountCodes.message = np12345Result.message || "NP12345 code initialized";
      }

      // Create additional common discount codes
      const commonCodes = [
        { code: "WELCOME10", percentOff: 10, description: "10% off for new students" },
        { code: "STUDENT20", percentOff: 20, description: "20% off student discount" },
        { code: "EARLYBIRD", percentOff: 15, description: "15% early bird discount" },
        { code: "MENTO10", percentOff: 10, description: "10% off promotion" },
        { code: "TESTSTRIPE", percentOff: 99.99, description: "$0.01 test code for Stripe testing" },
      ];

      for (const discountCode of commonCodes) {
        try {
          // Check if code already exists
          const existing = await ctx.runQuery(internal.payments.checkCouponExists, {
            code: discountCode.code,
          });
          
          if (!existing) {
            await ctx.runAction(api.payments.createDiscountCoupon, {
              code: discountCode.code,
              percentOff: discountCode.percentOff,
              duration: "once",
              metadata: {
                description: discountCode.description,
                createdBy: "system-init",
              },
            });
            console.log(`Created discount code: ${discountCode.code}`);
          } else {
            console.log(`Discount code ${discountCode.code} already exists`);
          }
        } catch (error) {
          console.error(`Failed to create discount code ${discountCode.code}:`, error);
        }
      }
      
      results.discountCodes.success = true;
      results.discountCodes.message = "Discount codes initialized successfully";
    } catch (error) {
      console.error("Failed to initialize discount codes:", error);
      results.discountCodes.message = `Failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }

    // Note: Stripe products should be created through the Stripe dashboard
    // and their IDs added to environment variables
    results.stripeProducts.message = "Stripe products should be configured in Stripe dashboard and environment variables";

    return results;
  },
});

// Check if initialization is needed
export const checkInitializationStatus = action({
  handler: async (ctx) => {
    const status = {
      discountCodesExist: false,
      np12345Exists: false,
      needsInitialization: false,
    };

    try {
      // Check if NP12345 exists
      const np12345 = await ctx.runQuery(internal.payments.checkCouponExists, {
        code: "NP12345",
      });
      status.np12345Exists = !!np12345;
      
      // If NP12345 doesn't exist, we definitely need initialization
      status.needsInitialization = !status.np12345Exists;
      status.discountCodesExist = status.np12345Exists;
    } catch (error) {
      console.error("Error checking initialization status:", error);
      // If we can't check, assume initialization is needed
      status.needsInitialization = true;
    }

    return status;
  },
});

// Reset discount codes (for testing purposes only)
export const resetDiscountCodes = internalMutation({
  handler: async (ctx) => {
    // Delete all discount codes
    const codes = await ctx.db.query("discountCodes").collect();
    for (const code of codes) {
      await ctx.db.delete(code._id);
    }
    
    // Delete all discount usage records
    const usage = await ctx.db.query("discountUsage").collect();
    for (const record of usage) {
      await ctx.db.delete(record._id);
    }
    
    return {
      deletedCodes: codes.length,
      deletedUsage: usage.length,
    };
  },
});