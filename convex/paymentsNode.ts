"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";

// Internal action to verify Stripe webhook signature
export const verifyStripeSignature = internalAction({
  args: {
    payload: v.string(),
    signature: v.string(),
    webhookSecret: v.string(),
  },
  handler: async (ctx, args) => {
    const { payload, signature, webhookSecret } = args;
    
    // Extract timestamp and signatures from the signature header
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='))?.split('=')[1];
    const signatures = elements
      .filter(e => e.startsWith('v1='))
      .map(e => e.split('=')[1]);
    
    if (!timestamp || signatures.length === 0) {
      throw new Error('Invalid signature format');
    }
    
    // Create the signed payload string
    const signedPayload = `${timestamp}.${payload}`;
    
    // Compute expected signature using HMAC SHA256
    const crypto = await import('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(signedPayload)
      .digest('hex');
    
    // Check if any of the signatures match
    let signatureVerified = false;
    for (const sig of signatures) {
      // Use timing-safe comparison to prevent timing attacks
      if (sig.length === expectedSignature.length) {
        const sigBuffer = Buffer.from(sig);
        const expectedBuffer = Buffer.from(expectedSignature);
        if (crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
          signatureVerified = true;
          break;
        }
      }
    }
    
    return { verified: signatureVerified };
  },
});