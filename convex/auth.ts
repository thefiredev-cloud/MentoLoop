import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export async function getUserId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  // Check if user exists in our users table
  const user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    // Don't attempt to create user here - should be handled by explicit user creation mutations
    return null;
  }
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
    return null;
  }

  // Check if user exists in our users table
  let user = await ctx.db
    .query("users")
    .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
    .unique();

  if (!user) {
    
    try {
      // Create the user
      const userId = await ctx.db.insert("users", {
        name: identity.name ?? identity.email ?? "Unknown User",
        externalId: identity.subject,
        userType: "student" as const,
        email: identity.email ?? "",
        createdAt: Date.now(),
      });
      return userId;
    } catch (error) {
      // Try to fetch again in case of race condition
      user = await ctx.db
        .query("users")
        .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
        .unique();
      
      if (user) {
        return user._id;
      }
      
      return null;
    }
  }
  return user._id;
}