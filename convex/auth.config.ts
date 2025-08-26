export default {
  providers: [
    {
      // Use the actual Clerk instance domain
      // For development: https://loved-lamprey-34.clerk.accounts.dev
      // For production: https://clerk.sandboxmentoloop.online (if custom domain is set up)
      domain: process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL || "https://loved-lamprey-34.clerk.accounts.dev",
      applicationID: "convex",
    },
  ]
};