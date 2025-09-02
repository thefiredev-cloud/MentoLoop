import { mutation } from "./_generated/server";

export const fixAdminAccess = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[fixAdminAccess] Starting comprehensive admin cleanup");
    
    // Get all users
    const allUsers = await ctx.db.query("users").collect();
    
    let updatedCount = 0;
    let supportUserFixed = false;
    let adminUserFixed = false;
    
    for (const user of allUsers) {
      // Fix support@mentoloop.com - should NOT be admin
      if (user.email?.toLowerCase() === "support@mentoloop.com") {
        if (user.userType === "admin" || user.permissions?.includes("full_admin_access")) {
          console.log(`[fixAdminAccess] Removing admin access from support@mentoloop.com`);
          await ctx.db.patch(user._id, {
            userType: "student",
            permissions: undefined,
          });
          supportUserFixed = true;
          updatedCount++;
        }
      }
      
      // Fix admin@mentoloop.com - should BE admin
      if (user.email?.toLowerCase() === "admin@mentoloop.com") {
        if (user.userType !== "admin" || !user.permissions?.includes("full_admin_access")) {
          console.log(`[fixAdminAccess] Granting admin access to admin@mentoloop.com`);
          await ctx.db.patch(user._id, {
            userType: "admin",
            permissions: ["full_admin_access"],
          });
          adminUserFixed = true;
          updatedCount++;
        }
      }
    }
    
    return {
      success: true,
      message: `Updated ${updatedCount} users`,
      supportUserFixed,
      adminUserFixed,
      timestamp: new Date().toISOString()
    };
  },
});