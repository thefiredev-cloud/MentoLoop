import { internalMutation, internalQuery, mutation, query, QueryCtx } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

// Admin email addresses (case-insensitive)
const ADMIN_EMAILS = ["admin@mentoloop.com", "support@mentoloop.com"];

// Helper function to check if an email is an admin email
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> }, // no runtime validation, trust Clerk
  async handler(ctx, { data }) {
    const userEmail = data.email_addresses?.[0]?.email_address?.toLowerCase() || "";
    
    // Check if this email should be an admin (case-insensitive)
    const isAdmin = isAdminEmail(userEmail);
    
    // First try to find user by Clerk external ID
    let user = await userByExternalId(ctx, data.id);
    
    // If not found by external ID, try to find by email
    if (!user && userEmail) {
      const allUsers = await ctx.db.query("users").collect();
      user = allUsers.find(u => u.email?.toLowerCase() === userEmail) || null;
      
      // If found by email but with different externalId, update it
      if (user) {
        console.log(`[upsertFromClerk] Found user by email, updating externalId from ${user.externalId} to ${data.id}`);
      }
    }
    
    const userAttributes = {
      name: `${data.first_name} ${data.last_name}`,
      externalId: data.id,
      email: userEmail,
      userType: isAdmin ? ("admin" as const) : (user?.userType || undefined),
      permissions: isAdmin ? ["full_admin_access"] : (user?.permissions || undefined),
    };

    if (user === null) {
      // Create new user
      await ctx.db.insert("users", userAttributes);
      if (isAdmin) {
        console.log(`[upsertFromClerk] Created admin user: ${userAttributes.email}`);
      }
    } else {
      // Update existing user
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
    // Check if current user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const currentUser = await userByExternalId(ctx, identity.subject);
    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    
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

    const userEmail = identity.email?.toLowerCase() || "";
    
    // First, try to find user by Clerk external ID
    let existingUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();

    // If not found by external ID, try to find by email (case-insensitive)
    if (!existingUser && userEmail) {
      const allUsers = await ctx.db.query("users").collect();
      existingUser = allUsers.find(u => u.email?.toLowerCase() === userEmail) || null;
      
      // If found by email but with different externalId, update the externalId
      if (existingUser) {
        console.log(`[ensureUserExists] Found user by email, updating externalId from ${existingUser.externalId} to ${identity.subject}`);
        await ctx.db.patch(existingUser._id, {
          externalId: identity.subject,
          name: identity.name ?? existingUser.name,
        });
      }
    }

    // Check if this is an admin email
    const isAdmin = isAdminEmail(userEmail);

    if (existingUser) {
      // Always check if this should be an admin user and update if needed
      if (isAdmin) {
        if (existingUser.userType !== "admin" || !existingUser.permissions?.includes("full_admin_access")) {
          await ctx.db.patch(existingUser._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
            email: userEmail, // Ensure email is set
          });
          console.log(`[ensureUserExists] Updated ${identity.email} to admin role`);
        }
      } else if (!existingUser.userType) {
        // If no userType is set and they're not admin, default to student
        await ctx.db.patch(existingUser._id, {
          userType: "student",
          email: userEmail,
        });
        console.log(`[ensureUserExists] Set default userType to student for ${identity.email}`);
      }
      return { userId: existingUser._id, isNew: false };
    }

    // Create new user if doesn't exist
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? identity.email ?? "Unknown User",
      externalId: identity.subject,
      userType: isAdmin ? "admin" : "student", // Admin if email matches, otherwise student
      email: userEmail,
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

    // Only update userType if the user is not an admin
    // Preserve admin status for admin emails
    if (!isAdminEmail(user.email)) {
      await ctx.db.patch(userId, {
        userType: "student" as const,
      });
    } else {
      console.log(`[updateUserMetadata] Preserving admin status for ${user.email}`);
    }

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
        
        // Check if this should be an admin user
        const userEmail = identity.email?.toLowerCase() || "";
        const isAdmin = isAdminEmail(userEmail);
        
        // Update to admin if needed
        if (isAdmin) {
          if (existingUser.userType !== "admin" || !existingUser.permissions?.includes("full_admin_access")) {
            await ctx.db.patch(existingUser._id, {
              userType: "admin",
              permissions: ["full_admin_access"],
              email: userEmail,
            });
            console.log(`[ensureUserExistsWithRetry] Updated ${identity.email} to admin role`);
          }
        }
        
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
          const isAdmin = isAdminEmail(identity.email);
          
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

export const fixAdminUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    let updatedCount = 0;
    for (const user of allUsers) {
      // Check if this user should be an admin
      if (isAdminEmail(user.email) && user.userType !== "admin") {
        await ctx.db.patch(user._id, {
          userType: "admin" as const,
          permissions: ["full_admin_access"],
        });
        updatedCount++;
        console.log(`[fixAdminUsers] Updated ${userEmail} to admin role`);
      }
    }
    
    return { 
      success: true, 
      message: `Updated ${updatedCount} user(s) to admin role`,
      updatedCount 
    };
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
  
  // First try to find by external ID
  let user = await userByExternalId(ctx, identity.subject);
  
  // If not found by external ID and we have an email, try to find by email
  if (!user && identity.email) {
    const userEmail = identity.email.toLowerCase();
    const allUsers = await ctx.db.query("users").collect();
    user = allUsers.find(u => u.email?.toLowerCase() === userEmail) || null;
    
    // If found by email but with different externalId, log it but still return the user
    if (user && user.externalId !== identity.subject) {
      console.log(`[getCurrentUser] Found user by email with mismatched externalId.`);
      console.log(`[getCurrentUser] DB externalId: ${user.externalId}, Clerk externalId: ${identity.subject}`);
      // Note: ensureUserExists will fix this mismatch in the background
    }
  }
  
  // If user exists and has an email, ensure admin users have correct properties
  if (user && identity.email) {
    const userEmail = identity.email.toLowerCase();
    
    // If this is an admin email, ensure userType and permissions are set correctly
    if (isAdminEmail(userEmail)) {
      // Return user with admin properties (without modifying the database)
      // The database update will happen in ensureUserExists
      return {
        ...user,
        userType: "admin" as const,
        permissions: ["full_admin_access"],
        email: userEmail // Ensure email is set
      };
    }
  }
  
  return user;
}

async function userByExternalId(ctx: QueryCtx, externalId: string) {
  return await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", externalId))
    .unique();
}

// Mutation to sync admin users - ensures admin emails have correct userType
export const syncAdminUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || !identity.email) {
      throw new Error("Not authenticated or no email");
    }

    const userEmail = identity.email.toLowerCase();
    
    // Only proceed if this is an admin email
    if (!isAdminEmail(userEmail)) {
      return { message: "Not an admin email", updated: false };
    }

    // Find the user
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("User not found");
    }

    // Update to admin if not already
    if (user.userType !== "admin" || !user.permissions?.includes("full_admin_access")) {
      await ctx.db.patch(user._id, {
        userType: "admin",
        permissions: ["full_admin_access"],
        email: userEmail,
      });
      console.log(`[syncAdminUser] Updated ${userEmail} to admin role`);
      return { message: "User updated to admin", updated: true };
    }

    return { message: "User already admin", updated: false };
  },
});

// Internal mutation to fix all admin users in the database
export const fixAllAdminUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    let updatedCount = 0;
    
    for (const user of allUsers) {
      if (isAdminEmail(user.email)) {
        if (user.userType !== "admin" || !user.permissions?.includes("full_admin_access")) {
          await ctx.db.patch(user._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
          });
          console.log(`[fixAllAdminUsers] Updated ${userEmail} to admin role`);
          updatedCount++;
        }
      }
    }
    
    console.log(`[fixAllAdminUsers] Fixed ${updatedCount} admin users`);
    return { updatedCount };
  },
});