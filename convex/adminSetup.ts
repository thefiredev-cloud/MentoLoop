import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

// Admin email address that should have admin privileges - Single admin account for simplicity
const ADMIN_EMAILS = [
  "admin@mentoloop.com"
];

// Internal mutation to ensure admin users have correct roles
export const ensureAdminRoles = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("[ensureAdminRoles] Checking for admin accounts...");
    
    // Check each admin email
    for (const email of ADMIN_EMAILS) {
      // Find user by email
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();
      
      if (user) {
        // Update user to admin if not already
        if (user.userType !== "admin") {
          await ctx.db.patch(user._id, {
            userType: "admin",
            permissions: ["full_admin_access"]
          });
          console.log(`[ensureAdminRoles] Updated ${email} to admin role`);
        } else {
          console.log(`[ensureAdminRoles] ${email} already has admin role`);
        }
      } else {
        console.log(`[ensureAdminRoles] User ${email} not found - will set admin role when they sign up`);
      }
    }
    
    return { success: true, adminEmails: ADMIN_EMAILS };
  },
});

// Mutation to check if an email should be an admin during signup
export const checkAdminEmail = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    
    if (isAdmin) {
      // Find and update the user
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email.toLowerCase()))
        .first();
      
      if (user && user.userType !== "admin") {
        await ctx.db.patch(user._id, {
          userType: "admin",
          permissions: ["full_admin_access"]
        });
        console.log(`[checkAdminEmail] Set admin role for ${email}`);
      }
    }
    
    return { isAdmin };
  },
});

// Mutation to manually set a user as admin (for testing)
export const setUserAsAdmin = mutation({
  args: { 
    email: v.string(),
    makeAdmin: v.boolean() 
  },
  handler: async (ctx, { email, makeAdmin }) => {
    // Check if the current user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get current user
    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    
    // Only allow if current user is already an admin or if it's a setup scenario
    if (currentUser?.userType !== "admin" && !ADMIN_EMAILS.includes(identity.email?.toLowerCase() || "")) {
      throw new Error("Only admins can set other users as admins");
    }
    
    // Find target user
    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email.toLowerCase()))
      .first();
    
    if (!targetUser) {
      throw new Error(`User with email ${email} not found`);
    }
    
    // Update user role
    await ctx.db.patch(targetUser._id, {
      userType: makeAdmin ? "admin" : "student",
      permissions: makeAdmin ? ["full_admin_access"] : []
    });
    
    return { 
      success: true, 
      email, 
      newRole: makeAdmin ? "admin" : "student" 
    };
  },
});