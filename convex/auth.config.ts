export default {
  providers: [
    {
      // TODO: Update this to your production Clerk domain when you have it
      // Production domain format: https://YOUR_PRODUCTION_INSTANCE.clerk.accounts.dev
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL || "https://YOUR_PRODUCTION_INSTANCE.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};