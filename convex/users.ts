import { internalMutation, internalQuery, mutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    // Check if this email should be an admin
    const adminEmails = ["admin@mentoloop.com", "support@mentoloop.com"];
    const isAdmin = data.email_addresses?.some((email: any) => 
      adminEmails.includes(email.email_address?.toLowerCase())
    );
    
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      email: data.email_addresses?.[0]?.email_address || "",
      userType: isAdmin ? ("admin" as const) : undefined,
      permissions: isAdmin ? ["full_admin_access"] : undefined,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
      if (isAdmin) {
        console.log(`[upsertFromClerk] Created admin user: ${userAttributes.email}`);
      }
    } else {
      await ctx.db.patch(user._id, userAttributes);
      if (isAdmin && user.userType !== "admin") {
        console.log(`[upsertFromClerk] Updated user to admin: ${userAttributes.email}`);
      }
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(
        `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
      );
    }
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateUserType = mutation({
  args: {
    userId: v.id("users"),
    userType: v.union(v.literal("student"), v.literal("preceptor"), v.literal("admin"), v.literal("enterprise")),
  },
  handler: async (ctx, { userId, userType }) => {
    await ctx.db.patch(userId, { userType });
    return { success: true };
  },
});

export const ensureUserExists = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    if (existingUser) {
      // Check if this should be an admin user
      const adminEmails = ["admin@mentoloop.com", "support@mentoloop.com"];
      if (adminEmails.includes(identity.email?.toLowerCase() || "") && existingUser.userType !== "admin") {
        await ctx.db.patch(existingUser._id, {
          userType: "admin",
          permissions: ["full_admin_access"]
        });
        console.log(`[ensureUserExists] Updated ${identity.email} to admin role`);
      }
      return { userId: existingUser._id, isNew: false };
    }

    // Check if new user should be admin
    const adminEmails = ["admin@mentoloop.com", "support@mentoloop.com"];
    const isAdmin = adminEmails.includes(identity.email?.toLowerCase() || "");

    // Create new user if doesn't exist
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? identity.email ?? "Unknown User",
      externalId: identity.subject,
      userType: isAdmin ? "admin" : "student", // Admin if email matches, otherwise student
      email: identity.email ?? "",
      permissions: isAdmin ? ["full_admin_access"] : undefined,
      createdAt: Date.now(),
    });

    if (isAdmin) {
      console.log(`[ensureUserExists] Created admin user: ${identity.email}`);
    }

    return { userId, isNew: true };
  },
});

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    return user;
  },
});

// Internal action to update user metadata in Clerk
export const updateUserMetadata = internalMutation({
  args: {
    userId: v.id("users"),
    publicMetadata: v.object({
      intakeCompleted: v.boolean(),
      paymentCompleted: v.boolean(),
      intakeCompletedAt: v.string(),
      membershipPlan: v.string(),
    }),
  },
  handler: async (ctx, { userId, publicMetadata }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update the user record - store metadata as user type
    // Note: Actual intake completion status is stored in Clerk metadata
    await ctx.db.patch(userId, {
      userType: "student" as const,
    });

    // Note: Actual Clerk metadata update would happen via Clerk SDK
    // This is handled by the webhook or a separate server action
    console.log(`Updated user ${userId} metadata:`, publicMetadata);
    
    return { success: true };
  },
});

export const ensureUserExistsWithRetry = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[ensureUserExistsWithRetry] Starting user verification");
    
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.error("[ensureUserExistsWithRetry] No identity found");
      throw new Error("Not authenticated. Please sign in again.");
    }

    console.log("[ensureUserExistsWithRetry] Identity found:", {
      subject: identity.subject,
      email: identity.email,
      name: identity.name
    });

    // Attempt to find existing user with retries
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[ensureUserExistsWithRetry] Attempt ${attempts} of ${maxAttempts}`);
      
      // Check if user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();

      if (existingUser) {
        console.log("[ensureUserExistsWithRetry] Found existing user:", existingUser._id);
        return { 
          userId: existingUser._id, 
          isNew: false, 
          attempts,
          ready: true 
        };
      }

      // If this is our last attempt, create the user
      if (attempts === maxAttempts) {
        console.log("[ensureUserExistsWithRetry] Creating new user after failed lookups");
        
        try {
          // Check if new user should be admin
          const adminEmails = ["admin@mentoloop.com", "support@mentoloop.com"];
          const isAdmin = adminEmails.includes(identity.email?.toLowerCase() || "");
          
          const userId = await ctx.db.insert("users", {
            name: identity.name ?? identity.email ?? "Unknown User",
            externalId: identity.subject,
            userType: isAdmin ? "admin" : "student", // Admin if email matches, otherwise student
            email: identity.email ?? "",
            permissions: isAdmin ? ["full_admin_access"] : undefined,
            createdAt: Date.now(),
          });

          if (isAdmin) {
            console.log(`[ensureUserExistsWithRetry] Created admin user: ${identity.email}`);
          }
          console.log("[ensureUserExistsWithRetry] User created successfully:", userId);
          return { 
            userId, 
            isNew: true, 
            attempts,
            ready: true 
          };
        } catch (error) {
          console.error("[ensureUserExistsWithRetry] Failed to create user:", error);
          throw new Error("Failed to create user profile. Please try again.");
        }
      }

      // Wait briefly before next attempt (exponential backoff)
      const waitTime = Math.min(100 * Math.pow(2, attempts - 1), 500);
      console.log(`[ensureUserExistsWithRetry] Waiting ${waitTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    throw new Error("Unable to verify user profile. Please refresh and try again.");
  },
});

export const getUserById = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    return await userByExternalId(ctx, clerkId);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByExternalId(ctx, identity.subject);
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}