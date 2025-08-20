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
    // Can only create user in mutation context
    if ('insert' in ctx.db) {
      const userId = await (ctx.db as any).insert("users", {
        name: identity.name ?? identity.email ?? "Unknown User",
        externalId: identity.subject,
        userType: "student", // Default to student, will be updated when they complete intake
        email: identity.email ?? "",
        createdAt: Date.now(),
      });
      return userId;
    } else {
      // In query context, return null if user doesn't exist
      return null;
    }
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