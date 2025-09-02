import { mutation } from "./_generated/server";

export const removeAdminFromSupport = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("[removeAdminFromSupport] Starting cleanup of support@mentoloop.com");
    
    // Find support@mentoloop.com user
    const allUsers = await ctx.db.query("users").collect();
    let fixed = false;
    
    for (const user of allUsers) {
      if (user.email?.toLowerCase() === "support@mentoloop.com") {
        console.log(`[removeAdminFromSupport] Found support user with ID: ${user._id}`);
        console.log(`[removeAdminFromSupport] Current userType: ${user.userType}`);
        console.log(`[removeAdminFromSupport] Current permissions: ${JSON.stringify(user.permissions)}`);
        
        // Remove admin access
        await ctx.db.patch(user._id, {
          userType: "student",
          permissions: undefined,
        });
        
        console.log("[removeAdminFromSupport] Successfully removed admin access from support@mentoloop.com");
        fixed = true;
      }
    }
    
    return {
      success: fixed,
      message: fixed ? "Removed admin access from support@mentoloop.com" : "support@mentoloop.com not found",
      timestamp: new Date().toISOString()
    };
  },
});