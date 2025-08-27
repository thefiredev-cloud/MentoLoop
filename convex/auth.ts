import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    console.log("getUserId: No identity found in auth context");
    return null;
  }

  console.log("getUserId: Identity found for subject:", identity.subject);

  // Check if user exists in our users table
  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    console.log("getUserId: No user found for external ID:", identity.subject, "- user needs to be created via ensureUserExists");
    // Don't attempt to create user here - should be handled by explicit user creation mutations
    return null;
  }

  console.log("getUserId: Found existing user with ID:", user._id);
  return user._id;
}

export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}

export async function getUserIdOrCreate(
  ctx: MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    console.log("[getUserIdOrCreate] No identity found in auth context");
    return null;
  }

  console.log("[getUserIdOrCreate] Looking for user with subject:", identity.subject);

  // Check if user exists in our users table
  let user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    console.log("[getUserIdOrCreate] User not found, creating new user");
    
    try {
      // Create the user
      const userId = await ctx.db.insert("users", {
        name: identity.name ?? identity.email ?? "Unknown User",
        externalId: identity.subject,
        userType: "student" as const,
        email: identity.email ?? "",
        createdAt: Date.now(),
      });
      
      console.log("[getUserIdOrCreate] User created with ID:", userId);
      return userId;
    } catch (error) {
      console.error("[getUserIdOrCreate] Failed to create user:", error);
      // Try to fetch again in case of race condition
      user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      
      if (user) {
        console.log("[getUserIdOrCreate] Found user after race condition:", user._id);
        return user._id;
      }
      
      return null;
    }
  }

  console.log("[getUserIdOrCreate] Found existing user with ID:", user._id);
  return user._id;
}