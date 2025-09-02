import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { isAdminEmail } from "./users";

// Admin-only mutation to clean up duplicate user records
export const cleanupDuplicateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if the current user is an admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const currentUser = await ctx.db
      .query("users")
      .withIndex("byExternalId", (q) => q.eq("externalId", identity.subject))
      .unique();
    
    if (!currentUser || currentUser.userType !== "admin") {
      throw new Error("Only admins can perform this operation");
    }
    
    console.log("[cleanupDuplicateUsers] Starting cleanup process...");
    
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Group users by email (case-insensitive)
    const usersByEmail = new Map<string, typeof allUsers>();
    
    for (const user of allUsers) {
      if (user.email) {
        const emailLower = user.email.toLowerCase();
        if (!usersByEmail.has(emailLower)) {
          usersByEmail.set(emailLower, []);
        }
        usersByEmail.get(emailLower)!.push(user);
      }
    }
    
    const cleanupResults = {
      duplicatesFound: 0,
      usersDeleted: 0,
      adminUsersPreserved: 0,
    };
    
    
    // Process each email group
    for (const [email, users] of usersByEmail.entries()) {
      if (users.length > 1) {
        cleanupResults.duplicatesFound += users.length - 1;
        
        // Sort users to prioritize keeping admin users, then most recent
        users.sort((a, b) => {
          // Admin users first
          if (a.userType === "admin" && b.userType !== "admin") return -1;
          if (b.userType === "admin" && a.userType !== "admin") return 1;
          
          // Then by creation time (newest first)
          return (b._creationTime || 0) - (a._creationTime || 0);
        });
        
        const userToKeep = users[0];
        const shouldBeAdmin = isAdminEmail(email);
        
        // Ensure admin emails have admin role
        if (shouldBeAdmin && userToKeep.userType !== "admin") {
          await ctx.db.patch(userToKeep._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
          });
          console.log(`[cleanupDuplicateUsers] Updated ${email} to admin role`);
          cleanupResults.adminUsersPreserved++;
        }
        
        // Delete duplicate records
        for (let i = 1; i < users.length; i++) {
          console.log(`[cleanupDuplicateUsers] Deleting duplicate user: ${users[i].name} (${users[i].externalId})`);
          await ctx.db.delete(users[i]._id);
          cleanupResults.usersDeleted++;
        }
      } else if (users.length === 1) {
        // Single user - ensure admin emails have admin role
        const user = users[0];
        const shouldBeAdmin = isAdminEmail(email);
        
        if (shouldBeAdmin && user.userType !== "admin") {
          await ctx.db.patch(user._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
          });
          console.log(`[cleanupDuplicateUsers] Updated ${email} to admin role`);
          cleanupResults.adminUsersPreserved++;
        }
      }
    }
    
    console.log("[cleanupDuplicateUsers] Cleanup complete:", cleanupResults);
    return cleanupResults;
  },
});

// Internal mutation to automatically clean up on server start
export const autoCleanupDuplicates = internalMutation({
  args: {},
  handler: async (ctx) => {
    console.log("[autoCleanupDuplicates] Running automatic cleanup...");
    
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    // Group users by email (case-insensitive)
    const usersByEmail = new Map<string, typeof allUsers>();
    
    for (const user of allUsers) {
      if (user.email) {
        const emailLower = user.email.toLowerCase();
        if (!usersByEmail.has(emailLower)) {
          usersByEmail.set(emailLower, []);
        }
        usersByEmail.get(emailLower)!.push(user);
      }
    }
    
    
    let duplicatesFixed = 0;
    
    // Process each email group
    for (const [email, users] of usersByEmail.entries()) {
      if (users.length > 1) {
        // Sort users to prioritize keeping admin users, then most recent
        users.sort((a, b) => {
          // Admin users first
          if (a.userType === "admin" && b.userType !== "admin") return -1;
          if (b.userType === "admin" && a.userType !== "admin") return 1;
          
          // Then by creation time (newest first)
          return (b._creationTime || 0) - (a._creationTime || 0);
        });
        
        const userToKeep = users[0];
        const shouldBeAdmin = isAdminEmail(email);
        
        // Ensure admin emails have admin role
        if (shouldBeAdmin && userToKeep.userType !== "admin") {
          await ctx.db.patch(userToKeep._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
          });
        }
        
        // Delete duplicate records
        for (let i = 1; i < users.length; i++) {
          await ctx.db.delete(users[i]._id);
          duplicatesFixed++;
        }
      }
    }
    
    if (duplicatesFixed > 0) {
      console.log(`[autoCleanupDuplicates] Fixed ${duplicatesFixed} duplicate users`);
    }
    
    return { duplicatesFixed };
  },
});