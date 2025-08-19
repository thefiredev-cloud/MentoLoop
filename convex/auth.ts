import { QueryCtx, MutationCtx } from "./_generated/server";

export async function getUserId(
  ctx: QueryCtx | MutationCtx
): Promise<string | null> {
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
    // Create user if doesn't exist
    const userId = await ctx.db.insert("users", {
      name: identity.name ?? identity.email ?? "Unknown User",
      externalId: identity.subject,
      userType: "student", // Default to student, will be updated when they complete intake
      email: identity.email ?? "",
      createdAt: Date.now(),
    });
    return userId;
  }

  return user._id;
}

export async function requireAuth(
  ctx: QueryCtx | MutationCtx
): Promise<string> {
  const userId = await getUserId(ctx);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}