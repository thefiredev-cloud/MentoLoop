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

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await requireAuth(ctx)
  const user = await ctx.db.get(userId)
  if (!user || user.userType !== "admin") {
    throw new Error("Admin access required")
  }
  return userId
}

export async function requireEnterpriseAccess(
  ctx: QueryCtx | MutationCtx,
  enterpriseId: Id<'enterprises'>
): Promise<{ userId: Id<'users'>; isAdmin: boolean }> {
  const userId = await requireAuth(ctx)
  const user = await ctx.db.get(userId)
  if (!user) throw new Error('Authentication required')
  const isAdmin = user.userType === 'admin'
  if (isAdmin) return { userId, isAdmin }
  const enterprise = await ctx.db.get(enterpriseId)
  if (!enterprise) throw new Error('Enterprise not found')
  const belongs = user.enterpriseId && enterpriseId === user.enterpriseId
  const isEnterpriseAdmin = Array.isArray((enterprise as any).adminUsers) && (enterprise as any).adminUsers.some((id: any) => id === userId)
  if (!belongs && !isEnterpriseAdmin) {
    throw new Error('Enterprise access required')
  }
  return { userId, isAdmin }
}
