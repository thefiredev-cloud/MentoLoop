export default {
  providers: [
    {
      // Use Clerk domain from environment variable
      // This should match your Clerk instance and JWT template configuration
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || 
        "https://clerk.sandboxmentoloop.online",
      applicationID: "convex",
    },
  ]
};