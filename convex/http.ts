import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { WebhookEvent } from "@clerk/backend";
import { Webhook } from "svix";
import { transformWebhookData } from "./paymentAttemptTypes";

const http = httpRouter();

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request);
    if (!event) {
      return new Response("Error occured", { status: 400 });
    }
    switch ((event as any).type) {
      case "user.created": // intentional fallthrough
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data as any,
        });
        break;

      case "user.deleted": {
        const clerkUserId = (event.data as any).id!;
        await ctx.runMutation(internal.users.deleteFromClerk, { clerkUserId });
        break;
      }

      case "paymentAttempt.updated": {
        const paymentAttemptData = transformWebhookData((event as any).data);
        await ctx.runMutation(internal.paymentAttempts.savePaymentAttempt, {
          paymentAttemptData,
        });
        break;
      }
      

      
      default:
        console.log("Ignored webhook event", (event as any).type);
    }

    return new Response(null, { status: 200 });
  }),
});

async function validateRequest(req: Request): Promise<WebhookEvent | null> {
  const payloadString = await req.text();
  const svixHeaders = {
    "svix-id": req.headers.get("svix-id")!,
    "svix-timestamp": req.headers.get("svix-timestamp")!,
    "svix-signature": req.headers.get("svix-signature")!,
  };
  
  // Check if webhook secret is configured
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return null;
  }
  
  // Log header presence for debugging
  if (!svixHeaders["svix-id"] || !svixHeaders["svix-timestamp"] || !svixHeaders["svix-signature"]) {
    console.error("Missing required svix headers", {
      hasSvixId: !!svixHeaders["svix-id"],
      hasSvixTimestamp: !!svixHeaders["svix-timestamp"],
      hasSvixSignature: !!svixHeaders["svix-signature"]
    });
    return null;
  }
  
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  try {
    const event = wh.verify(payloadString, svixHeaders) as unknown as WebhookEvent;
    console.log("Webhook event verified successfully:", (event as any).type);
    return event;
  } catch (error) {
    console.error("Error verifying webhook event", error);
    console.error("Webhook verification failed - check if CLERK_WEBHOOK_SECRET matches Clerk dashboard");
    return null;
  }
}

export default http;